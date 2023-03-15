import { protectedProcedure, router } from '../trpc'
import {
    createStatus,
    deleteStatus,
    getMyStatus,
    getStatus,
    getStatusOfAUser,
    getStatusOfFriends,
    markStatusSeen,
} from '../controllers/status'
import { createStatusSchema, idOnlySchema } from '../schema/zod'

export const statusRouter = router({
    getMyStatus: protectedProcedure.query(({ ctx }) => getMyStatus(ctx.user)),

    getStatusOfFriends: protectedProcedure.query(({ ctx }) =>
        getStatusOfFriends(ctx.user)
    ),

    getStatusOfAUser: protectedProcedure
        .input(idOnlySchema)
        .query(({ ctx, input }) => getStatusOfAUser(ctx.user, input.id)),

    createStatus: protectedProcedure
        .input(createStatusSchema)
        .mutation(({ ctx, input }) => createStatus(ctx.user, input)),

    deleteStatus: protectedProcedure
        .input(idOnlySchema)
        .mutation(({ ctx, input }) => deleteStatus(ctx.user.id, input.id)),

    getStatus: protectedProcedure
        .input(idOnlySchema)
        .mutation(({ ctx, input }) => getStatus(ctx.user, input.id)),

    markStatusSeen: protectedProcedure
        .input(idOnlySchema)
        .mutation(({ ctx, input }) => markStatusSeen(ctx.user, input.id)),
})
