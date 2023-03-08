import { getLoggedInUser } from '../controllers/user'
import { router, protectedProcedure } from '../trpc'

export const userRouter = router({
    me: protectedProcedure.query(({ ctx }) => getLoggedInUser(ctx.user)),
})
