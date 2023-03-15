import {
    addSecondaryEmail,
    getFriendsDetail,
    getLoggedInUser,
    getOtpForSecondaryEmail,
    makeSecondaryEmailPrimary,
    removeSecondaryEmail,
    updateBio,
    updateName,
    updatePassword,
    updateSecondaryEmail,
    updateUsername,
    verifySecondaryEmail,
    sendOrAcceptRequest,
    unfriendRejectOrCancelFriendRequest,
    updateAccountPrivacy,
    blockUser,
    getBlockedUsers,
    getUser,
    searchUser,
    unblockUser,
    updateAvatar,
} from '../controllers/user'
import {
    accountPrivacySchema,
    idOnlySchema,
    publicIdOnlySchema,
    searchUserSchema,
    secondaryEmailSchema,
    updateBioSchema,
    updateNameSchema,
    updatePasswordSchema,
    updateUsernameSchema,
    verifySecondaryEmailSchema,
} from '../schema/zod'
import { protectedProcedure, router } from '../trpc'

export const userRouter = router({
    me: protectedProcedure.query(({ ctx }) => getLoggedInUser(ctx.user)),
    myFriends: protectedProcedure.query(({ ctx }) =>
        getFriendsDetail(ctx.user.id)
    ),
    getUser: protectedProcedure
        .input(idOnlySchema)
        .query(({ ctx, input }) => getUser(ctx.user, input.id)),
    getBlockedUsers: protectedProcedure.query(({ ctx }) =>
        getBlockedUsers(ctx.user.id)
    ),
    searchUser: protectedProcedure
        .input(searchUserSchema)
        .query(({ ctx, input }) =>
            searchUser(ctx.user, input.limit, input.cursor, input.query)
        ),

    updateName: protectedProcedure
        .input(updateNameSchema)
        .mutation(({ ctx, input }) => updateName(ctx.user.id, input)),

    updateBio: protectedProcedure
        .input(updateBioSchema)
        .mutation(({ ctx, input }) => updateBio(ctx.user, input)),

    updatePassword: protectedProcedure
        .input(updatePasswordSchema)
        .mutation(({ ctx, input }) => updatePassword(ctx.user, input)),

    updateAccountPrivacy: protectedProcedure
        .input(accountPrivacySchema)
        .mutation(({ ctx, input }) => updateAccountPrivacy(ctx.user.id, input)),

    updateUsername: protectedProcedure
        .input(updateUsernameSchema)
        .mutation(({ ctx, input }) => updateUsername(ctx.user, input)),

    updateAvatar: protectedProcedure
        .input(publicIdOnlySchema)
        .mutation(({ ctx, input }) => updateAvatar(ctx.user.id, input)),

    addSecondaryEmail: protectedProcedure
        .input(secondaryEmailSchema)
        .mutation(({ ctx, input }) => addSecondaryEmail(ctx.user, input)),

    updateSecondaryEmail: protectedProcedure
        .input(secondaryEmailSchema)
        .mutation(({ ctx, input }) => updateSecondaryEmail(ctx.user, input)),

    removeSecondaryEmail: protectedProcedure.mutation(({ ctx }) =>
        removeSecondaryEmail(ctx.user)
    ),

    getOtpForSecondaryEmail: protectedProcedure.mutation(({ ctx }) =>
        getOtpForSecondaryEmail(ctx.user)
    ),

    verifySecondaryEmail: protectedProcedure
        .input(verifySecondaryEmailSchema)
        .mutation(({ ctx, input }) => verifySecondaryEmail(ctx.user, input)),

    makeSecondaryEmailPrimary: protectedProcedure.mutation(({ ctx }) =>
        makeSecondaryEmailPrimary(ctx.user)
    ),

    sendOrAcceptRequest: protectedProcedure
        .input(idOnlySchema)
        .mutation(({ ctx, input }) =>
            sendOrAcceptRequest(ctx.user.id, input.id)
        ),

    unfriendRejectOrCancelFriendRequest: protectedProcedure
        .input(idOnlySchema)
        .mutation(({ ctx, input }) =>
            unfriendRejectOrCancelFriendRequest(ctx.user.id, input.id)
        ),

    blockUser: protectedProcedure
        .input(idOnlySchema)
        .mutation(({ ctx, input }) => blockUser(ctx.user.id, input.id)),

    unblockUser: protectedProcedure
        .input(idOnlySchema)
        .mutation(({ ctx, input }) => unblockUser(ctx.user.id, input.id)),
})
