import { inferAsyncReturnType } from '@trpc/server'
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

export function createContext({ req }: CreateFastifyContextOptions) {
    return {
        req: {
            ip: req.ip,
            headers: {
                authorization: req.headers.authorization,
            },
        },
    }
}

export type Context = inferAsyncReturnType<typeof createContext>
