import { StatusMediaType, WhoCanSee, WhoCanSend } from '@telecord/db'
import { mapUser } from './user'

export const isSeen = <S extends { seenByIds: string[] }>(
    userId: string,
    status: S
) => status.seenByIds.findIndex((s) => userId === s) !== -1

type Author = {
    id: string
    name: string
    username: string
    bio: string
    avatar: string
    lastSeen: Date | null
    whoCanSeeAvatar: WhoCanSee
    whoCanSeeBio: WhoCanSee
    whoCanSendYouMessage: WhoCanSend
    whoCanSeeLastSeen: WhoCanSee
}

export interface UserStatus {
    isMine: false
    id: string
    caption: string | null
    createdAt: Date
    media: string
    mediaType: StatusMediaType
    author: ReturnType<typeof mapUser>
    isSeen: boolean
}

export interface MyStatus {
    isMine: true
    id: string
    caption: string | null
    createdAt: Date
    media: string
    mediaType: StatusMediaType
    author: ReturnType<typeof mapUser>
    isSeen: true
    seenByCount: number
}

export const mapStatus = <
    A extends Author,
    S extends {
        id: string
        caption: string | null
        createdAt: Date
        media: string
        mediaType: StatusMediaType
        seenByIds: string[]
        author: A
    },
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
    }
>(
    status: S,
    user: U
): UserStatus | MyStatus => {
    const isMine = status.author.id === user.id

    const common = {
        id: status.id,
        caption: status.caption,
        createdAt: status.createdAt,
        media: status.media,
        mediaType: status.mediaType,
        author: mapUser(user, status.author),
    }

    if (isMine) {
        return {
            isMine: true,
            isSeen: true,
            seenByCount: status.seenByIds.length,
            ...common,
        }
    } else {
        return {
            isMine: false,
            isSeen: isSeen(user.id, status),
            ...common,
        }
    }
}
