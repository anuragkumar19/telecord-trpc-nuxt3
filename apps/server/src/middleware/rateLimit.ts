import { getRateLimitKey } from '../utils/redis'
import { redis } from '../services/redis'
import { ControllerError } from '../error'

export const rateLimit = async (ip: string, reqPerMinute = 100) => {
    const key = getRateLimitKey(ip)

    const noOfReq = Number(await redis.get(key))

    if (!noOfReq) {
        await redis.incr(key)
        await redis.expire(key, 60)
    } else {
        await redis.incr(key)
    }

    if (noOfReq > reqPerMinute) {
        throw new ControllerError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Request limit exceeded',
        })
    }
}
