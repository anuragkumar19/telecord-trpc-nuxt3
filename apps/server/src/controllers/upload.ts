import crypto from 'crypto'
import { cloudinary } from '../services/cloudinary'
import { getTempUploadKey } from '../utils/redis'
import {
    folderName,
    removeImageTopic,
    TempUpload,
    UploadType,
} from '../constants'
import { redis } from '../services/redis'
import { RouteHandlerMethod } from 'fastify'
import { Http2SecureServer } from 'http2'
import { client, receiver } from '../services/qstash'

export const getUploadCredentials = async (
    userId: string,
    { type }: { type: UploadType }
) => {
    const publicId = crypto.randomBytes(16).toString('hex')

    const secret = crypto.randomBytes(16).toString('hex')
    const hashedSecret = crypto
        .createHash('sha256')
        .update(secret)
        .digest('hex')

    const key = getTempUploadKey(publicId)
    await redis.set(
        key,
        JSON.stringify({
            authorId: userId,
            publicId,
            type,
            uploaded: false,
            secret: hashedSecret,
        } satisfies TempUpload)
    )

    await redis.expire(key, 60 * 60) // 1 hour

    return {
        publicId,
        secret,
    }
}

// Specific Fastify controller
export const uploadFile: RouteHandlerMethod<Http2SecureServer> = async (
    request,
    reply
) => {
    const { publicId, secret } = request.query as {
        publicId: string
        secret: string
    }

    const key = getTempUploadKey(publicId)

    const tempUploadStr = await redis.get(key)

    if (typeof tempUploadStr !== 'string') {
        throw new Error('Something went wrong')
    }

    if (!tempUploadStr) {
        reply.status(401)
        throw new Error('Unauthorized')
    }

    const tempUpload = JSON.parse(tempUploadStr) as TempUpload

    if (tempUpload.uploaded) {
        reply.status(400)
        throw new Error('Already Uploaded')
    }

    const hashedSecret = crypto
        .createHash('sha256')
        .update(secret)
        .digest('hex')

    if (tempUpload.secret !== hashedSecret) {
        reply.status(401)
        throw new Error('Unauthorized')
    }

    const files = await request.saveRequestFiles()

    const file = files[0]

    if (!file) {
        reply.status(400)
        throw new Error('No file provided')
    }

    if (tempUpload.type === 'IMAGE' && !file.mimetype.startsWith('image')) {
        reply.status(400)
        throw new Error('Images only')
    }

    if (tempUpload.type === 'VIDEO' && !file.mimetype.startsWith('video')) {
        reply.status(400)
        throw new Error('Videos only')
    }

    // Save to cloudinary
    await cloudinary.uploader.upload(file.filepath, {
        public_id: tempUpload.publicId,
        folder: folderName,
        resource_type: 'auto',
        type: 'private',
    })

    tempUpload.uploaded = true
    // tempUpload.publicId = uploaded.public_id

    // Mark in redis as uploaded
    await redis.set(key, JSON.stringify(tempUpload))
    await redis.expire(key, 2 * 60 * 60) // 2 hour

    await client.publishJSON({
        url: `${process.env.SERVER_URL!}/api/q/delete-upload`,
        delay: 60 * 60, // 1 hour
        body: tempUpload,
        topic: removeImageTopic,
    })

    reply.status(200).send(
        JSON.stringify({
            message: 'Uploaded',
        })
    )
}

export const handleQstashUploadDeletion: RouteHandlerMethod<
    Http2SecureServer
> = async (request, reply) => {
    const signature = request.headers['Upstash-Signature']
    const body = request.rawBody

    if (typeof body !== 'string') return
    if (typeof signature !== 'string') return

    const isValid = await receiver.verify({
        body,
        signature,
    })

    if (isValid) {
        const data = request.body as TempUpload
        const key = getTempUploadKey(data.publicId)
        if (await redis.exists(key)) {
            await cloudinary.uploader.destroy(data.publicId, {
                resource_type: 'auto',
                type: 'private',
            })

            await redis.del(key)
        }
    }

    reply.status(200).send('OK')
}
