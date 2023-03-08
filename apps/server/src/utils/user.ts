import { User } from '@telecord/db'
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
    return bcrypt.compareSync(userPassword, enteredPassword)
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

export const isFriend = (u1: User, u2: User) =>
    !!u1.friendsIds.find((fid) => u2.id === fid)

export const isInReceivedFriendRequests = (me: User, he: User) =>
    me.receivedFriendRequestsIds.findIndex((fid) => fid === he.id) !== -1

export const isInSentFriendRequest = (me: User, he: User) =>
    me.sentFriendRequestsIds.findIndex((fid) => he.id == fid) !== -1

export const isBlockedByMe = (me: User, he: User) =>
    me.blockedIds.findIndex((uid) => he.id === uid) !== -1

export const isBlockedByHim = (me: User, he: User) =>
    he.blockedIds.findIndex((uid) => me.id === uid) !== -1

export const canSendMessage = (me: User, he: User) => {
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

export const mapUser = (me: User, he: User) => {
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
        (he.whoCanSeeAvatar === 'FRIENDS' && isFriend(he, me))
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
        he.whoCanSeeBio === 'EVERYONE' ||
        (he.whoCanSeeBio === 'FRIENDS' && isFriend(me, he))
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
    }
}
