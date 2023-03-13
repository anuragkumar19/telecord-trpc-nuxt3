import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'
import { getUserFromToken } from './middleware/auth'
import { Context } from './router/context'
import { sentenceCase } from 'sentence-case'
import superjson from 'superjson'

const t = initTRPC.context<Context>().create({
    errorFormatter({ shape, error }) {
        let message = error.message

        if (error.cause instanceof ZodError) {
            const errors = JSON.parse(message) as ZodError[]

            // One error at a time
            message = errors[0]!.message
        }

        return {
            ...shape,
            message: sentenceCase(message),
        }
    },
    transformer: superjson,
})

export const middleware = t.middleware
export const router = t.router
export const publicProcedure = t.procedure

export const authGuardTRPC = middleware(async ({ ctx, next }) => {
    const token = ctx.req.headers.authorization

    const user = await getUserFromToken(token)

    return next({
        ctx: {
            ...ctx,
            user,
        },
    })
})

export const protectedProcedure = t.procedure.use(authGuardTRPC)
