import {
    forgotPassword,
    login,
    refreshToken,
    register,
    resetPassword,
    verifyEmail,
} from '../controllers/auth'
import {
    forgotPasswordSchema,
    loginSchema,
    refreshTokenSchema,
    registerSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from '../schema/zod'
import { router, publicProcedure } from '../trpc'

export const authRouter = router({
    register: publicProcedure
        .input(registerSchema)
        .mutation(({ input }) => register(input)),

    verifyEmail: publicProcedure
        .input(verifyEmailSchema)
        .mutation(({ input }) => verifyEmail(input)),

    forgotPassword: publicProcedure
        .input(forgotPasswordSchema)
        .mutation(({ input }) => forgotPassword(input)),

    resetPassword: publicProcedure
        .input(resetPasswordSchema)
        .mutation(({ input }) => resetPassword(input)),

    login: publicProcedure
        .input(loginSchema)
        .mutation(({ input }) => login(input)),

    refreshToken: publicProcedure
        .input(refreshTokenSchema)
        .mutation(({ input }) => refreshToken(input)),
})
