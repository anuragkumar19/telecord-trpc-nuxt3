import { router } from '../trpc'
import { authRouter } from './auth'
import { statusRouter } from './status'
import { uploadRouter } from './upload'
import { userRouter } from './user'

export const appRouter = router({
    auth: authRouter,
    user: userRouter,
    upload: uploadRouter,
    status: statusRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
