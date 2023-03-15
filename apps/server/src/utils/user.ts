import { User, WhoCanSee, WhoCanSend } from '@telecord/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    return hash
}

export const comparePassword = (
    userPassword: string,
    enteredPassword: string
) => {
    return bcrypt.compareSync(enteredPassword, userPassword)
}

export const generateAuthTokens = (id: string) => {
    const refreshToken = jwt.sign(
        {
            id: id,
            type: 'refresh',
        },
        process.env.REFRESH_TOKEN_SECRET!
    )
    const accessToken = jwt.sign(
        {
            id: id,
            type: 'access',
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '10m' }
    ) // 10 minutes

    return { refreshToken, accessToken }
}

export const isFriend = <
    U1 extends { friendsIds: string[] },
    U2 extends { id: string }
>(
    u1: U1,
    u2: U2
) => !!u1.friendsIds.find((fid) => u2.id === fid)

export const isInReceivedFriendRequests = <
    Me extends { receivedFriendRequestsIds: string[] },
    He extends { id: string }
>(
    me: Me,
    he: He
) => me.receivedFriendRequestsIds.findIndex((fid) => fid === he.id) !== -1

export const isInSentFriendRequest = <
    Me extends { sentFriendRequestsIds: string[] },
    He extends { id: string }
>(
    me: Me,
    he: He
) => me.sentFriendRequestsIds.findIndex((fid) => he.id === fid) !== -1

export const isBlockedByMe = <
    Me extends { blockedIds: string[] },
    He extends { id: string }
>(
    me: Me,
    he: He
) => me.blockedIds.findIndex((uid) => he.id === uid) !== -1

export const isBlockedByHim = <
    Me extends { blockedByIds: string[] },
    He extends { id: string }
>(
    me: Me,
    he: He
) => me.blockedByIds.findIndex((uid) => he.id === uid) !== -1

export const canSendMessage = <
    Me extends { friendsIds: string[]; id: string },
    He extends { id: string; whoCanSendYouMessage: WhoCanSend }
>(
    me: Me,
    he: He
) => {
    const isSelf = me.id === he.id

    if (!isSelf && he.whoCanSendYouMessage === 'FRIENDS' && !isFriend(me, he)) {
        return false
    } else {
        return true
    }
}

export interface MappedUser {
    id: string
    name: string
    username: string
    avatar: string
    bio?: string
    isSelf: boolean
    isFriend: boolean
    isInFriendRequest: boolean
    isInSentFriendRequest: boolean
    isBlocked: boolean
    lastSeen?: Date | null
    canSendMessage: boolean
}

export const mapUser = <
    Me extends {
        id: string
        friendsIds: string[]
        receivedFriendRequestsIds: string[]
        sentFriendRequestsIds: string[]
        blockedIds: string[]
    },
    He extends {
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
>(
    me: Me,
    he: He
) => {
    const isSelf = me.id === he.id

    const sendableUser: MappedUser = {
        id: he.id,
        name: he.name,
        username: he.username,
        avatar: process.env.DEFAULT_AVATAR!,
        bio: '',
        isFriend: false,
        isInFriendRequest: false,
        isInSentFriendRequest: false,
        isBlocked: false,
        canSendMessage: true,
        isSelf,
    }

    if (
        isSelf ||
        he.whoCanSeeAvatar === 'EVERYONE' ||
        (he.whoCanSeeAvatar === 'FRIENDS' && isFriend(me, he))
    ) {
        sendableUser.avatar = he.avatar
    }

    if (
        isSelf ||
        he.whoCanSeeBio === 'EVERYONE' ||
        (he.whoCanSeeBio === 'FRIENDS' && isFriend(me, he))
    ) {
        sendableUser.bio = he.bio || ''
    }

    if (
        isSelf ||
        he.whoCanSeeLastSeen === 'EVERYONE' ||
        (he.whoCanSeeLastSeen === 'FRIENDS' && isFriend(me, he))
    ) {
        sendableUser.lastSeen = he.lastSeen
    }

    sendableUser.isFriend = isFriend(me, he)
    sendableUser.isInFriendRequest = isInReceivedFriendRequests(me, he)
    sendableUser.isInSentFriendRequest = isInSentFriendRequest(me, he)
    sendableUser.isBlocked = isBlockedByMe(me, he)
    sendableUser.canSendMessage = canSendMessage(me, he)

    return sendableUser
}
export const mapMe = ({
    id,
    name,
    username,
    avatar,
    bio,
    email,
    isEmailVerified,
    secondaryEmail,
    isSecondaryEmailVerified,
    lastSeen,
    whoCanSeeActiveStatus,
    whoCanSeeAvatar,
    whoCanSeeBio,
    whoCanSeeFriendsList,
    whoCanSeeLastSeen,
    whoCanSeeStatus,
    whoCanSendYouMessage,
    createdAt,
    updatedAt,
    friendsIds,
    receivedFriendRequestsIds,
    sentFriendRequestsIds,
}: User) => {
    return {
        id,
        name,
        username,
        avatar,
        bio,
        email,
        isEmailVerified,
        secondaryEmail,
        isSecondaryEmailVerified,
        lastSeen,
        whoCanSeeActiveStatus,
        whoCanSeeAvatar,
        whoCanSeeBio,
        whoCanSeeFriendsList,
        whoCanSeeLastSeen,
        whoCanSeeStatus,
        whoCanSendYouMessage,
        createdAt,
        updatedAt,
        friendCount: friendsIds.length,
        receivedFriendRequestsCount: receivedFriendRequestsIds.length,
        sentFriendRequestsCount: sentFriendRequestsIds.length,
    }
}
