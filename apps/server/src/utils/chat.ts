import { Chat, Message, User, Reaction, Status } from '@telecord/db'
import { mapMessage } from './message'
import { generateCloudinaryImageLinks } from './upload'
import { isFriend, mapUser } from './user'

export const mapChat = <
    C extends Chat & {
        messages: (Message & {
            status:
                | (Status & {
                      author: User
                  })
                | null
            author: User
            reactions: Reaction[]
        })[]
        members: User[]
    }
>(
    userId: string,
    chat: C
) => {
    if (chat.isPrivate) {
        const me = chat.members.filter((u) => u.id === userId)[0]!
        const he = chat.members.filter((u) => u.id !== userId)[0]!

        chat.title = he.username

        const avatarPublicId =
            he.whoCanSeeAvatar === 'NOBODY' ||
            (he.whoCanSeeAvatar == 'FRIENDS' && !isFriend(me, he))
                ? process.env.DEFAULT_AVATAR!
                : he.avatar

        const avatar = generateCloudinaryImageLinks(avatarPublicId)
        const members = chat.members.map((member) => mapUser(me, member))
        const messages = chat.messages.map((m) => mapMessage(me, m))
        const unseenCount = messages.filter((m) => m.isUnseen).length

        return {
            ...chat,
            avatar,
            members,
            messages,
            unseenCount: unseenCount > 9 ? '9+' : String(unseenCount),
        }
    } else {
        const me = chat.members.filter((u) => u.id === userId)[0]!
        const avatar = chat.avatar
            ? generateCloudinaryImageLinks(chat.avatar)
            : null
        const members = chat.members.map((member) => mapUser(me, member))
        const messages = chat.messages.map((m) => mapMessage(me, m))
        return {
            ...chat,
            avatar,
            members,
            messages,
        }
    }
}
