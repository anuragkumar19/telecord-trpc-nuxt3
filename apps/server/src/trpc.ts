import { initTRPC } from '@trpc/server'
import { authGuardTRPC } from './middleware/auth'
import { Context } from './router/context'

const t = initTRPC.context<Context>().create()

export const middleware = t.middleware
export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(authGuardTRPC)
