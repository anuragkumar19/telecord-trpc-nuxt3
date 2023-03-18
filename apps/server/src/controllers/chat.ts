import { prisma } from '@telecord/db'
import { mapChat } from '../utils/chat'
import { mapMessage } from '../utils/message'
import { isBlockedByHim, isFriend } from '../utils/user'
import { ControllerError } from '../error'

export const chatWithAUser = async <
    U extends { id: string; blockedByIds: string[] }
>(
    user: U,
    hisId: string
) => {
    const he = await prisma.user.findUnique({ where: { id: hisId } })

    if (!he || isBlockedByHim(user, he)) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'User not found',
        })
    }

    if (he.whoCanSendYouMessage === 'FRIENDS' && !isFriend(he, user)) {
        throw new ControllerError({
            code: 'BAD_REQUEST',
            message: 'Only users friends can send message not found',
        })
    }

    let chat = await prisma.chat.findFirst({
        where: {
            isPrivate: true,
            membersIds: {
                equals: [user.id, he.id],
            },
        },
    })

    if (!chat) {
        chat = await prisma.chat.create({
            data: {
                isPrivate: true,
                adminsIds: [he.id, user.id],
                membersIds: [he.id, user.id],
            },
        })
    }

    return {
        chat,
    }
}

export const getChatDetails = async (userId: string, chatId: string) => {
    const chat = await prisma.chat.findFirst({
        where: {
            id: chatId,
            membersIds: {
                has: userId,
            },
        },
        include: {
            members: true,
            messages: {
                take: 10,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    reactions: true,
                    status: {
                        include: {
                            author: true,
                        },
                    },
                    author: true,
                },
            },
        },
    })

    if (!chat) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
        })
    }

    return {
        chat: mapChat(userId, chat),
    }
}

export const getMyChats = async (userId: string) => {
    const chats = await prisma.chat.findMany({
        where: {
            membersIds: {
                has: userId,
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
        select: {
            id: true,
        },
    })

    return {
        // chats: chats.map((chat) => getChatDetails(userId, chat.id)),
        chats,
    }
}

export const getChatMessages = async <
    U extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
    }
>(
    user: U,
    limit = 10,
    cursor: string,
    chatId: string
) => {
    const chat = await prisma.chat.findFirst({
        where: {
            id: chatId,
            membersIds: {
                has: user.id,
            },
        },
    })

    if (!chat) {
        throw new ControllerError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
        })
    }

    const messages = await prisma.message.findMany({
        where: {
            chatId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        cursor: {
            id: cursor,
        },
        take: limit,
        include: {
            reactions: true,
            status: {
                include: {
                    author: true,
                },
            },
            author: true,
        },
    })

    return {
        messages: messages.map((message) => mapMessage(user, message)),
    }
}
