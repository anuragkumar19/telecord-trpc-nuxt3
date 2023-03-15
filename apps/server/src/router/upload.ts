import { getUploadCredentials } from '../controllers/upload'
import { getUploadCredentialsSchema } from '../schema/zod'
import { protectedProcedure, router } from '../trpc'

export const uploadRouter = router({
    getUploadCredentials: protectedProcedure
        .input(getUploadCredentialsSchema)
        .mutation(({ ctx, input }) => getUploadCredentials(ctx.user.id, input)),
})
