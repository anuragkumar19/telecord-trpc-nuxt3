import crypto from 'crypto'
import { prisma, User } from '@telecord/db'
import { sendOtp } from '../services/email'
import { genOtp } from '../utils/otp'
import {
    mapUser,
    isBlockedByHim,
    isBlockedByMe,
    isFriend,
    isInReceivedFriendRequests,
    isInSentFriendRequest,
    mapMe,
    comparePassword,
    hashPassword,
} from '../utils/user'
import { ControllerError } from '../error'
import { accountPrivacySchema } from '../schema/zod'

export const getLoggedInUser = (user: User) => {
    return mapMe(user)
}

export const getFriendsDetail = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            friendsIds: true,
            blockedIds: true,
            sentFriendRequestsIds: true,
            receivedFriendRequestsIds: true,
            friends: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    bio: true,
                    avatar: true,
                    lastSeen: true,
                    whoCanSeeAvatar: true,
                    whoCanSendYouMessage: true,
                    whoCanSeeBio: true,
                    whoCanSeeLastSeen: true,
                },
            },
            sentFriendRequests: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    bio: true,
                    avatar: true,
                    lastSeen: true,
                    whoCanSeeAvatar: true,
                    whoCanSendYouMessage: true,
                    whoCanSeeBio: true,
                    whoCanSeeLastSeen: true,
                },
            },
            receivedFriendRequests: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    bio: true,
                    avatar: true,
                    lastSeen: true,
                    whoCanSeeAvatar: true,
                    whoCanSendYouMessage: true,
                    whoCanSeeBio: true,
                    whoCanSeeLastSeen: true,
                },
            },
        },
    })

    if (!user) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Something went wrong',
        })
    }

    const friends = user.friends.map((f) => mapUser(user, f))
    const friendRequests = user.receivedFriendRequests.map((f) =>
        mapUser(user, f)
    )
    const sentFriendRequests = user.sentFriendRequests.map((f) =>
        mapUser(user, f)
    )

    return {
        friends,
        friendRequests,
        sentFriendRequests,
    }
}

export const getUser = async <
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
        blockedByIds: string[]
    }
>(
    user: U,
    id: string
) => {
    const searchUser = await prisma.user.findUnique({ where: { id } })

    if (
        !searchUser ||
        !searchUser.isEmailVerified ||
        isBlockedByHim(user, searchUser)
    ) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'User not found.',
        })
    }

    return {
        user: mapUser(user, searchUser),
    }
}

export const searchUser = async <
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
        blockedByIds: string[]
    }
>(
    user: U,
    limit = 10,
    cursor: string,
    query: string
) => {
    if (query === '') {
        return {
            users: [],
        }
    }

    let users = await prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: query } },
                { name: { contains: query } },
            ],
        },
        orderBy: {
            id: 'asc',
        },
        take: limit,
        skip: 1,
        cursor: {
            id: cursor,
        },
        select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            avatar: true,
            lastSeen: true,
            whoCanSeeAvatar: true,
            whoCanSeeBio: true,
            whoCanSendYouMessage: true,
            whoCanSeeLastSeen: true,
        },
    })

    users = users.filter((u) => !isBlockedByHim(user, u))

    return {
        users: users.map((u) => mapUser(user, u)),
    }
}

export const updateName = async (
    userId: string,
    { name }: { name: string }
) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { name: name },
        })
    } catch (err) {
        throw new ControllerError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
        })
    }

    return {
        message: 'Name updated',
    }
}

export const updateUsername = async <
    U extends { id: string; username: string }
>(
    user: U,
    { username }: { username: string }
) => {
    if (user.username === username) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Username is same as current username',
        })
    }

    const existingUser = await prisma.user.findUnique({ where: { username } })

    if (existingUser) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Username is already taken',
        })
    }

    await prisma.user.update({ where: { id: user.id }, data: { username } })

    return {
        message: 'Username updated',
    }
}

export const updateBio = async <U extends { id: string }>(
    user: U,
    { bio }: { bio: string }
) => {
    await prisma.user.update({ where: { id: user.id }, data: { bio } })

    return {
        message: 'Bio updated',
    }
}

export const updatePassword = async <
    U extends { id: string; password: string }
>(
    user: U,
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string }
) => {
    if (comparePassword(user.password, oldPassword)) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Incorrect Old password',
        })
    }

    const newHashedPassword = hashPassword(newPassword)

    await prisma.user.update({
        where: { id: user.id },
        data: { password: newHashedPassword },
    })

    return {
        message: 'Password updated',
    }
}

// export const uploadAvatar = expressAsyncHandler(async (req, res) => {
//     const user = req.user!
//     const file = req.file!

//     const path = file.path.replace(
//         'https://res.cloudinary.com/instavite/image/upload/',
//         'https://res.cloudinary.com/instavite/image/upload/c_fill,h_480,w_480/'
//     )

//     user.avatar = path

//     await user.save()

//     res.status(200).json({
//         message: 'Avatar updated',
//     })
// })

export const updateAccountPrivacy = async (
    userId: string,
    updates: ReturnType<typeof accountPrivacySchema.parse>
) => {
    await prisma.user.update({ where: { id: userId }, data: updates })

    return {
        message: 'Saved',
    }
}

export const addSecondaryEmail = async <
    U extends { id: string; email: string; secondaryEmail: string | null }
>(
    user: U,
    { email }: { email: string }
) => {
    if (email === user.email) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Email is same as current email',
        })
    }

    if (user.secondaryEmail) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email already exists',
        })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: "'Email is already linked to another account'",
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { secondaryEmail: email, isEmailVerified: false },
    })

    return {
        message: 'Secondary email added',
    }
}

export const removeSecondaryEmail = async <
    U extends { id: string; secondaryEmail: string | null }
>(
    user: U
) => {
    if (!user.secondaryEmail) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email does not exist',
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { secondaryEmail: null, isSecondaryEmailVerified: null },
    })

    return {
        message: 'Secondary email removed',
    }
}

export const updateSecondaryEmail = async <
    U extends { id: string; email: string; secondaryEmail: string | null }
>(
    user: U,
    { email }: { email: string }
) => {
    if (!user.secondaryEmail) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email does not exist',
        })
    }

    if (email === user.email) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Email is same as current email',
        })
    }

    if (email === user.secondaryEmail) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Email is same as secondary email',
        })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: "'Email is already linked to another account'",
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { secondaryEmail: email, isSecondaryEmailVerified: false },
    })

    return {
        message: 'Secondary email updated',
    }
}

export const getOtpForSecondaryEmail = async <
    U extends {
        id: string
        secondaryEmail: string | null
        isSecondaryEmailVerified: boolean | null
    }
>(
    user: U
) => {
    if (!user.secondaryEmail) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email does not exist',
        })
    }

    if (user.isSecondaryEmailVerified) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email is already verified',
        })
    }

    const otp = genOtp()

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')
    const secondaryEmailOtpExpiry = Date.now() + 1000 * 60 * 5 // 5 minutes

    await prisma.user.update({
        where: { id: user.id },
        data: { secondaryEmailOtp: hashedOtp, secondaryEmailOtpExpiry },
    })

    await sendOtp(user.secondaryEmail, otp, 'VERIFY_SECONDARY_EMAIL')

    return {
        message: 'OTP sent',
    }
}

export const verifySecondaryEmail = async <
    U extends {
        id: string
        secondaryEmail: string | null
        isSecondaryEmailVerified: boolean | null
        secondaryEmailOtp: string | null
        secondaryEmailOtpExpiry: number | null
    }
>(
    user: U,
    { otp }: { otp: number }
) => {
    if (!user.secondaryEmail) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email does not exist',
        })
    }

    if (user.isSecondaryEmailVerified) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email is already verified',
        })
    }

    if (!user.secondaryEmailOtp || !user.secondaryEmailOtpExpiry) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'OTP for verification is not requested yet by you.',
        })
    }

    if (Date.now() > user.secondaryEmailOtpExpiry) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'OTP has expired',
        })
    }

    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex')

    if (hashedOtp !== user.secondaryEmailOtp) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'OTP is incorrect',
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            isSecondaryEmailVerified: true,
            secondaryEmailOtp: null,
            secondaryEmailOtpExpiry: null,
        },
    })

    return {
        message: 'Secondary email verified',
    }
}

export const makeSecondaryEmailPrimary = async <
    U extends {
        id: string
        email: string
        secondaryEmail: string | null
        isSecondaryEmailVerified: boolean | null
    }
>(
    user: U
) => {
    if (!user.secondaryEmail) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email not found',
        })
    }

    if (!user.isSecondaryEmailVerified) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Secondary email is not verified',
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { email: user.secondaryEmail, secondaryEmail: user.email },
    })

    return {
        message: 'Secondary email made primary',
    }
}

export const sendOrAcceptRequest = async (userId: string, id: string) => {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } })
        const friend = await tx.user.findUnique({ where: { id } })

        if (!user) {
            throw new ControllerError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong.',
            })
        }

        if (!friend || !friend.isEmailVerified) {
            throw new ControllerError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }

        if (user.id === friend.id) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message: 'You can not add yourself as a friend',
            })
        }

        // If the friend have blocked you
        if (isBlockedByHim(user, friend)) {
            throw new ControllerError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }

        // If you have blocked him
        if (isBlockedByMe(user, friend)) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message:
                    'You have blocked this user. You have to unblock him before sending friend request',
            })
        }

        // Check if already friend
        if (isFriend(user, friend)) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message: 'Already friends',
            })
        }

        // Check if friend request already sent
        if (isInSentFriendRequest(user, friend)) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message: 'Already sent friend request',
            })
        }

        // If request pending then accept
        if (isInReceivedFriendRequests(user, friend)) {
            const userReceivedFriendRequestsIds =
                user.receivedFriendRequestsIds.filter((f) => friend.id !== f)

            const friendSentFriendRequestsIds =
                friend.sentFriendRequestsIds.filter((f) => user.id !== f)

            const p1 = tx.user.update({
                where: { id: user.id },
                data: {
                    friendsIds: { push: friend.id },
                    receivedFriendRequestsIds: userReceivedFriendRequestsIds,
                },
            })

            const p2 = tx.user.update({
                where: {
                    id: friend.id,
                },
                data: {
                    friendsIds: {
                        push: user.id,
                    },
                    sentFriendRequestsIds: friendSentFriendRequestsIds,
                },
            })

            await Promise.all([p1, p2])

            return {
                message: 'Friend request accepted',
            }
        }

        // Else Send the request
        const p1 = tx.user.update({
            where: { id: user.id },
            data: {
                sentFriendRequestsIds: {
                    push: friend.id,
                },
            },
        })

        const p2 = tx.user.update({
            where: {
                id: friend.id,
            },
            data: {
                receivedFriendRequestsIds: {
                    push: user.id,
                },
            },
        })

        await Promise.all([p1, p2])

        return { message: 'Friend Request sent.' }
    })
}

export const unfriendRejectOrCancelFriendRequest = async (
    userId: string,
    id: string
) => {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } })
        const friend = await tx.user.findUnique({ where: { id } })

        if (!user) {
            throw new ControllerError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong.',
            })
        }

        if (!friend || !friend.isEmailVerified) {
            throw new ControllerError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }

        if (user.id === friend.id) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message: 'Requested action cannot be performed',
            })
        }

        // If the friend have blocked you
        if (isBlockedByHim(user, friend)) {
            throw new ControllerError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }

        // If you have blocked him
        if (isBlockedByMe(user, friend)) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message:
                    'You have blocked this user. You have to unblock him before sending/canceling friend request',
            })
        }

        // Check if friend
        if (isFriend(user, friend)) {
            const userFriendsIds = user.friendsIds.filter(
                (f) => friend.id !== f
            )

            const friendFriendsIds = friend.friendsIds.filter(
                (f) => user.id !== f
            )

            const p1 = tx.user.update({
                where: { id: user.id },
                data: { friendsIds: userFriendsIds },
            })
            const p2 = tx.user.update({
                where: { id: friend.id },
                data: { friendsIds: friendFriendsIds },
            })

            await Promise.all([p1, p2])
            return {
                message: 'Unfriended',
            }
        }

        // Check if friend request already sent
        if (isInSentFriendRequest(user, friend)) {
            const userSentFriendRequestsIds = user.sentFriendRequestsIds.filter(
                (f) => friend.id !== f
            )

            const friendReceivedFriendRequestsIds =
                friend.receivedFriendRequestsIds.filter((f) => user.id !== f)

            const p1 = tx.user.update({
                where: { id: user.id },
                data: { sentFriendRequestsIds: userSentFriendRequestsIds },
            })
            const p2 = tx.user.update({
                where: { id: friend.id },
                data: {
                    receivedFriendRequestsIds: friendReceivedFriendRequestsIds,
                },
            })

            await Promise.all([p1, p2])
            return {
                message: 'Friend request cancelled',
            }
            return
        }

        // Check if friend request received
        if (isInReceivedFriendRequests(user, friend)) {
            const userReceivedFriendRequestsIds =
                user.receivedFriendRequestsIds.filter((f) => friend.id !== f)

            const friendSentFriendRequests =
                friend.sentFriendRequestsIds.filter((f) => user.id !== f)

            const p1 = tx.user.update({
                where: { id: user.id },
                data: {
                    receivedFriendRequestsIds: userReceivedFriendRequestsIds,
                },
            })
            const p2 = tx.user.update({
                where: { id: friend.id },
                data: {
                    sentFriendRequestsIds: friendSentFriendRequests,
                },
            })

            await Promise.all([p1, p2])

            return {
                message: 'Friend request rejected',
            }
        }

        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Requested action cannot be performed',
        })
    })
}

export const blockUser = async (userId: string, id: string) => {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } })
        const userToBeBlocked = await tx.user.findUnique({ where: { id } })

        if (!user) {
            throw new ControllerError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong.',
            })
        }

        if (!userToBeBlocked || !userToBeBlocked.isEmailVerified) {
            throw new ControllerError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }

        if (user.id === userToBeBlocked.id) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message: 'Requested action cannot be performed',
            })
        }

        // If the userToBeBlocked have blocked you
        if (isBlockedByHim(user, userToBeBlocked)) {
            throw new ControllerError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }

        if (isBlockedByMe(user, userToBeBlocked)) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message: 'User already Blocked',
            })
        }

        const userUpdates: {
            sentFriendRequestIds?: string[]
            receivedFriendRequestsIds?: string[]
            friendsIds?: string[]
        } = {}
        const userToBeBlockedUpdates: {
            sentFriendRequestIds?: string[]
            receivedFriendRequestsIds?: string[]
            friendsIds?: string[]
        } = {}

        if (isInSentFriendRequest(user, userToBeBlocked)) {
            userUpdates.sentFriendRequestIds =
                user.sentFriendRequestsIds.filter(
                    (f) => userToBeBlocked.id !== f
                )

            userToBeBlockedUpdates.receivedFriendRequestsIds =
                userToBeBlocked.receivedFriendRequestsIds.filter(
                    (f) => user.id !== f
                )
        }

        if (isInReceivedFriendRequests(user, userToBeBlocked)) {
            userUpdates.receivedFriendRequestsIds =
                user.receivedFriendRequestsIds.filter(
                    (f) => userToBeBlocked.id !== f
                )

            userToBeBlockedUpdates.sentFriendRequestIds =
                userToBeBlocked.sentFriendRequestsIds.filter(
                    (f) => user.id !== f
                )
        }

        if (isFriend(user, userToBeBlocked)) {
            userUpdates.friendsIds = user.friendsIds.filter(
                (f) => userToBeBlocked.id !== f
            )

            userToBeBlocked.friendsIds = userToBeBlocked.friendsIds.filter(
                (f) => user.id !== f
            )
        }

        // TODO: As we continue adding features there will be more to do here

        const p1 = tx.user.update({
            where: { id: user.id },
            data: { ...userUpdates, blockedIds: { push: userToBeBlocked.id } },
        })
        const p2 = tx.user.update({
            where: { id: userToBeBlocked.id },
            data: { ...userUpdates, blockedByIds: { push: user.id } },
        })

        await Promise.all([p1, p2])
        return {
            message: 'User blocked',
        }
    })
}
export const unblockUser = async (userId: string, id: string) => {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } })
        const blockedUser = await tx.user.findUnique({ where: { id } })

        if (!user) {
            throw new ControllerError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong.',
            })
        }

        if (!blockedUser || !blockedUser.isEmailVerified) {
            throw new ControllerError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }

        if (user.id === blockedUser.id) {
            throw new ControllerError({
                code: 'BAD_REQUEST',
                message: 'Requested action cannot be performed',
            })
        }

        // If the userToBeBlocked have blocked you
        if (isBlockedByHim(user, blockedUser)) {
            throw new ControllerError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }

        if (isBlockedByMe(user, blockedUser)) {
            const userBlockedIds = user.blockedIds.filter(
                (u) => u !== blockedUser.id
            )
            const blockedUserBlockedByIds = blockedUser.blockedByIds.filter(
                (u) => u !== user.id
            )

            const p1 = tx.user.update({
                where: { id: user.id },
                data: { blockedIds: userBlockedIds },
            })
            const p2 = tx.user.update({
                where: { id: blockedUser.id },
                data: { blockedByIds: blockedUserBlockedByIds },
            })

            await Promise.all([p1, p2])

            return {
                message: 'User unblocked.',
            }
        }

        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Requested action cannot be performed',
        })
    })
}

export const getBlockedUsers = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            blocked: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    bio: true,
                    avatar: true,
                    lastSeen: true,
                    whoCanSeeAvatar: true,
                    whoCanSeeBio: true,
                    whoCanSendYouMessage: true,
                    whoCanSeeLastSeen: true,
                },
            },
        },
    })

    if (!user) {
        throw new ControllerError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
        })
    }

    const blockedUsers = user.blocked.map((u) => mapUser(user, u))

    return {
        blockedUsers,
    }
}
