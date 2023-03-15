import jwt, { JwtPayload } from 'jsonwebtoken'
import { prisma } from '@telecord/db'
import { ControllerError } from '../error'

export const getUserFromToken = async (token?: string) => {
    if (!token) {
        throw new ControllerError({
            message: 'No token provided',
            code: 'UNAUTHORIZED',
        })
    }

    const accessToken = token.split(' ')[1]

    if (!accessToken) {
        throw new ControllerError({
            message: 'Invalid token',
            code: 'UNAUTHORIZED',
        })
    }

    try {
        const payload = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET!
        ) as JwtPayload

        const user = await prisma.user.findUnique({ where: { id: payload.id } })

        if (!user) {
            throw new ControllerError({
                message: 'Invalid token',
                code: 'UNAUTHORIZED',
            })
        }

        return user
    } catch (err) {
        throw new ControllerError({
            message: 'Invalid token',
            code: 'UNAUTHORIZED',
        })
    }
}
