import { prisma, WhoCanSee } from '@telecord/db'
import { TempUpload } from '../constants'
import { ControllerError } from '../error'
import { redis } from '../services/redis'
import { getTempUploadKey } from '../utils/redis'
import { mapStatus, isSeen, MyStatus, UserStatus } from '../utils/status'
import { mapUser, isBlockedByHim, isFriend } from '../utils/user'

export const createStatus = async <
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
    }
>(
    user: U,
    { caption, publicId }: { caption?: string; publicId: string }
) => {
    const key = getTempUploadKey(publicId)
    const tempUploadStr = await redis.get(key)

    if (typeof tempUploadStr !== 'string') {
        throw new ControllerError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
        })
    }

    if (!tempUploadStr) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Avatar upload not found',
        })
    }

    const tempUpload = JSON.parse(tempUploadStr) as TempUpload

    if (!tempUpload.uploaded) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Status media not uploaded yet',
        })
    }

    if (tempUpload.authorId !== user.id) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Status media upload not found',
        })
    }

    if (tempUpload.type === 'OTHER') {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Status media must be an image or video',
        })
    }

    const p1 = prisma.status.create({
        data: {
            authorId: user.id,
            media: tempUpload.publicId,
            mediaType: tempUpload.type,
            caption,
        },
        include: {
            author: true,
        },
    })

    const p2 = await redis.del(key)

    const [status] = await Promise.all([p1, p2])

    return {
        status: mapStatus(status, user) as MyStatus, // We know
    }
}

export const deleteStatus = async (userId: string, statusId: string) => {
    const status = await prisma.status.findUnique({ where: { id: statusId } })

    if (!status) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Status not found',
        })
    }

    if (status.authorId !== userId) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Status not found',
        })
    }

    await prisma.status.delete({ where: { id: status.id } })
    return { message: 'Status deleted.' }
}

export const getStatus = async <
    U extends {
        id: string
        friendsIds: string[]
        blockedByIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
    }
>(
    user: U,
    statusId: string
) => {
    const status = await prisma.status.findFirst({
        where: {
            id: statusId,
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        include: {
            author: true,
        },
    })

    if (!status) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Status not found',
        })
    }

    if (
        status.author.whoCanSeeStatus === 'NOBODY' ||
        (status.author.whoCanSeeStatus === 'FRIENDS' &&
            !isFriend(user, status.author))
    ) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Status not found',
        })
    }

    if (isBlockedByHim(user, status.author)) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Status not found',
        })
    }
    return {
        status: mapStatus(status, user),
    }
}

export const getMyStatus = async <
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
    }
>(
    user: U
) => {
    const status = await prisma.status.findMany({
        where: {
            authorId: user.id,
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        include: {
            author: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    return { status: status.map((s) => mapStatus(s, user) as MyStatus) }
}

export const getStatusOfAUser = async <
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
        whoCanSeeStatus: WhoCanSee
        blockedByIds: string[]
    }
>(
    user: U,
    authorId: string
) => {
    const status = await prisma.status.findMany({
        where: {
            authorId,
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        include: { author: true },
        orderBy: { createdAt: 'desc' },
    })

    if (
        status.length > 0 &&
        (status[0]!.author.whoCanSeeStatus === 'EVERYONE' ||
            (status[0]!.author.whoCanSeeStatus === 'FRIENDS' &&
                isFriend(user, status[0]!.author))) &&
        !isBlockedByHim(user, status[0]!.author)
    ) {
        return {
            status: status.map((s) => mapStatus(s, user)),
        }
    }

    return {
        status: [],
    }
}

export const getStatusOfFriends = async <
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
        whoCanSeeStatus: WhoCanSee
    }
>(
    user: U
) => {
    const allAStatus = await prisma.status.findMany({
        where: {
            authorId: {
                in: user.friendsIds,
            },
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            author: true,
        },
    })

    const status: {
        [index: string]: {
            author: ReturnType<typeof mapUser>
            items: UserStatus[]
        }
    } = {}

    allAStatus.forEach((s) => {
        const key = s.author.id

        if (!status[key]) {
            status[key] = {
                author: mapUser(user, s.author),
                items: [],
            }
        }

        if (s.author.whoCanSeeStatus === 'NOBODY') return
        status[key]!.items.push(mapStatus(s, user) as UserStatus)
    })

    return {
        statusTray: Object.values(status),
    }
}

export const markStatusSeen = async <
    U extends { id: string; friendsIds: string[]; blockedByIds: string[] }
>(
    user: U,
    statusId: string
) => {
    const status = await prisma.status.findFirst({
        where: {
            id: statusId,
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        include: {
            author: true,
        },
    })

    if (!status || status.authorId === user.id) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Status not found',
        })
    }

    if (
        status.author.whoCanSeeStatus === 'NOBODY' ||
        (status.author.whoCanSeeStatus === 'FRIENDS' &&
            !isFriend(user, status.author))
    ) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Status not found',
        })
    }

    if (isBlockedByHim(user, status.author)) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Status not found',
        })
    }

    if (isSeen(user.id, status)) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Already seen',
        })
    }

    await prisma.status.update({
        where: { id: statusId },
        data: { seenByIds: { push: user.id } },
    })

    return {
        message: 'Seen',
    }
}
