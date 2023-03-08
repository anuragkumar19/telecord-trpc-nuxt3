import crypto from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { prisma } from '@telecord/db'
import { sendOtp } from '../services/email'
import { genOtp } from '../utils/otp'
import {
    comparePassword,
    generateAuthTokens,
    hashPassword,
} from '../utils/user'
import { ControllerError } from '../error'

export const register = async ({
    email,
    name,
    username,
    password,
}: {
    email: string
    name: string
    username: string
    password: string
}) => {
    let user = await prisma.user.findUnique({ where: { email } })

    if (user && user.isEmailVerified) {
        throw new ControllerError({
            message: 'User already exists with the email',
            code: 'BAD_REQUEST',
            cause: {
                field: 'email',
            },
        })
    }

    const checkUsername = await prisma.user.findUnique({ where: { username } })

    if (checkUsername && user?.username !== username) {
        throw new ControllerError({
            message: 'Username already taken',
            code: 'BAD_REQUEST',
            cause: {
                field: 'username',
            },
        })
    }

    const otp = genOtp()

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    const otpExpiry = Date.now() + 5 * 60 * 1000 // 5 minutes

    const data = {
        email,
        name,
        username,
        password: hashPassword(password),
        otp: hashedOtp,
        otpExpiry,
    }

    if (!user) {
        user = await prisma.user.create({
            data,
        })
    } else {
        user = await prisma.user.update({ where: { id: user.id }, data })
    }

    await sendOtp(email, otp, 'VERIFY_EMAIL')

    return {
        message: 'Otp sent to you email!',
    }
}

export const verifyEmail = async ({
    email,
    otp,
}: {
    email: string
    otp: number
}) => {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        throw new ControllerError({
            message: 'User not found',
            code: 'BAD_REQUEST',
        })
    }

    if (user.isEmailVerified) {
        throw new ControllerError({
            message: 'User already verified',
            code: 'BAD_REQUEST',
        })
    }

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    if (!user.otp || !user.otpExpiry) {
        throw new ControllerError({
            message: 'OTP expired',
            code: 'BAD_REQUEST',
            cause: {
                field: 'otp',
            },
        })
    }

    if (user.otp !== hashedOtp) {
        throw new ControllerError({
            message: 'Otp is incorrect',
            code: 'BAD_REQUEST',
            cause: {
                field: 'otp',
            },
        })
    }

    if (Date.now() > user.otpExpiry) {
        throw new ControllerError({
            message: 'Otp has expired',
            code: 'BAD_REQUEST',
            cause: {
                field: 'otp',
            },
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, otp: null, otpExpiry: null },
    })

    return {
        message: 'Email verified successfully',
    }
}

export const forgotPassword = async ({ email }: { email: string }) => {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        throw new ControllerError({
            message: 'User not found with given email',
            code: 'BAD_REQUEST',
            cause: {
                field: 'email',
            },
        })
    }

    if (!user.isEmailVerified) {
        throw new ControllerError({
            message: 'Email is not verified',
            code: 'BAD_REQUEST',
            cause: {
                field: 'email',
            },
        })
    }

    const otp = genOtp()

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    const otpExpiry = Date.now() + 5 * 60 * 1000 // 5 minutes

    await prisma.user.update({
        where: { id: user.id },
        data: { otp: hashedOtp, otpExpiry },
    })

    await sendOtp(email, otp, 'RESET_PASSWORD')

    return {
        message: 'Otp sent to you email!',
    }
}

export const resetPassword = async ({
    email,
    otp,
    password,
}: {
    email: string
    otp: number
    password: string
}) => {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        throw new ControllerError({
            message: 'User not found',
            code: 'BAD_REQUEST',
            cause: {
                field: 'email',
            },
        })
    }

    if (!user.isEmailVerified) {
        throw new ControllerError({
            message: 'Email is not verified',
            code: 'BAD_REQUEST',
            cause: {
                field: 'email',
            },
        })
    }

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    if (!user.otp || !user.otpExpiry) {
        throw new ControllerError({
            message: 'Otp expired',
            code: 'BAD_REQUEST',
            cause: { field: 'otp' },
        })
    }

    if (user.otp !== hashedOtp) {
        throw new ControllerError({
            message: 'Otp is incorrect',
            code: 'BAD_REQUEST',
            cause: { field: 'otp' },
        })
    }

    if (Date.now() > user.otpExpiry) {
        throw new ControllerError({
            message: 'Otp expired',
            code: 'BAD_REQUEST',
            cause: { field: 'otp' },
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashPassword(password), otp: null, otpExpiry: null },
    })

    return {
        message: 'Password reset successfully',
    }
}

export const login = async ({
    identifier,
    password,
}: {
    identifier: string
    password: string
}) => {
    const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
    })
    if (!user) {
        throw new ControllerError({
            message: 'Invalid credentials',
            code: 'BAD_REQUEST',
        })
    }

    if (!user.isEmailVerified) {
        throw new ControllerError({
            message: 'Email is not verified',
            code: 'BAD_REQUEST',
            cause: {
                field: 'identifier',
            },
        })
    }

    if (!comparePassword(user.password, password)) {
        throw new ControllerError({
            message: 'Invalid credentials',
            code: 'BAD_REQUEST',
        })
    }

    const tokens = generateAuthTokens(user.id)

    return {
        tokens,
    }
}

export const refreshToken = async ({
    refreshToken,
}: {
    refreshToken: string
}) => {
    try {
        const payload = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET!
        ) as JwtPayload

        if (payload.type !== 'refresh') {
            throw new ControllerError({
                code: 'UNAUTHORIZED',
                message: 'Invalid refresh token',
            })
        }

        const user = await prisma.user.findUnique({ where: { id: payload.id } })

        if (!user) {
            throw new ControllerError({
                code: 'UNAUTHORIZED',
                message: 'Invalid refresh token',
            })
        }

        const tokens = generateAuthTokens(user.id)
        return {
            tokens: {
                accessToken: tokens.accessToken,
            },
        }
    } catch (err) {
        throw new ControllerError({
            code: 'UNAUTHORIZED',
            message: 'Invalid refresh token',
        })
    }
}
