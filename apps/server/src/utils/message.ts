import { Message, User, Reaction, Status } from '@telecord/db'
import { mapStatus, UserStatus } from './status'
import { isFriend, mapUser } from './user'

export const mapMessage = <
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
    },
    M extends Message & {
        status:
            | (Status & {
                  author: User
              })
            | null
        author: User
        reactions: Reaction[]
    }
>(
    user: U,
    message: M
) => {
    const reactionsCount: {
        [index: string]: number
    } = {}

    message.reactions.forEach((reaction) => {
        const key = reaction.emoji
        if (!reactionsCount[key]) {
            reactionsCount[key] = 0
        }
        reactionsCount[key]++
    })

    const isSentByMe = message.authorId === user.id

    if (
        message.status &&
        (message.status.author.whoCanSeeStatus === 'NOBODY' ||
            (message.status.author.whoCanSeeStatus === 'FRIENDS' &&
                !isFriend(user, message.status.author)))
    ) {
        message.status = null
    }

    if (
        message.status?.author.id !== user.id &&
        message.status &&
        message.status.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) {
        message.status = null
    }

    const status =
        message.status && (mapStatus(message.status, user) as UserStatus)

    return {
        id: message.id,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        authorId: message.authorId,
        text: message.text,
        media: message.media,
        mediaType: message.mediaType,
        seenByIds: message.seenByIds,
        isSentByMe,
        author: mapUser(user, message.author),
        forwarded: message.forwarded,
        chatId: message.chatId,
        statusId: message.statusId,
        status,
        reactionsCount,
        isUnseen: !!message.seenByIds.find((id) => id === user.id),
    }
}
