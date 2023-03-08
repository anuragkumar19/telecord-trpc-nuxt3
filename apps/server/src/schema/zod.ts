import { z } from 'zod'

const name = z.string()
const email = z.string().email().toLowerCase()
const username = z
    .string()
    .min(3)
    .max(50)
    .toLowerCase()
    .regex(/^[a-z0-9]+$/i, 'Username must contain only letters and numbers')
const newPassword = z.string().min(8)
const password = z.string()
const otp = z.number().min(100000).max(999999)

export const registerSchema = z.object({
    name,
    email,
    username,
    password: newPassword,
})

export const verifyEmailSchema = z.object({
    email,
    otp,
})

export const resetPasswordSchema = z.object({
    email,
    otp,
    password: newPassword,
})

export const forgotPasswordSchema = z.object({
    email,
})

export const loginSchema = z.object({
    identifier: email.or(username),
    password,
})

export const refreshTokenSchema = z.object({
    refreshToken: z.string(),
})
