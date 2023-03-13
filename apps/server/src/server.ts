import ws from '@fastify/websocket'
import { prisma } from '@telecord/db'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import cors from '@fastify/cors'
import 'colors'
import fastify from 'fastify'
import fs from 'fs'
import path from 'path'
import { __PROD__ } from './constants'
import { appRouter } from './router'
import { createContext } from './router/context'

const PORT = Number(process.env.SERVER_PORT) || 5000

export const server = fastify({
    logger: !__PROD__,
    http2: true,
    https: {
        allowHTTP1: true, // fallback support for HTTP1
        key: fs.readFileSync(
            path.join(__dirname, '..', 'https', 'fastify.key')
        ),
        cert: fs.readFileSync(
            path.join(__dirname, '..', 'https', 'fastify.cert')
        ),
    },
})

server.register(cors, {
    origin: true,
})

server.register(ws)

server.register(fastifyTRPCPlugin, {
    prefix: 'trpc',
    useWSS: true,
    trpcOptions: { router: appRouter, createContext },
})

export const startServer = async () => {
    try {
        await prisma.$connect()
        console.log(`Prisma: MongoDB Connected`.bgBlue.bold)

        await server.listen({ port: PORT })
        console.log(
            `Server started in ${process.env.NODE_ENV} mode on port ${PORT}`
                .bgGreen.bold
        )
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
