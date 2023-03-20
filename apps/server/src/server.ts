import 'colors'
import fastify from 'fastify'
import cors from '@fastify/cors'
import ws from '@fastify/websocket'
import multipart from '@fastify/multipart'
import fastifyRawBody from 'fastify-raw-body'
import { prisma } from '@telecord/db'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { __PROD__ } from './constants'
import { handleQstashUploadDeletion, uploadFile } from './controllers/upload'
import { appRouter } from './router'
import { createContext } from './router/context'

const PORT = Number(process.env.PORT) || 5000

export const server = fastify({
    logger: !__PROD__,
    http2: true,
    https: {
        allowHTTP1: true, // fallback support for HTTP1
    },
})

server.register(cors, {
    origin: true,
})

server.register(multipart, {
    limits: {
        fileSize: 5e7, // about 50mb
    },
})

server.register(ws)

server.register(fastifyRawBody, {
    global: false,
    runFirst: true,
    routes: ['/api/q/delete-upload'],
})

server.register(fastifyTRPCPlugin, {
    prefix: 'trpc',
    useWSS: true,
    trpcOptions: { router: appRouter, createContext },
})

server.post('/api/upload', {
    schema: {
        querystring: {
            publicId: { type: 'string' },
            secret: { type: 'string' },
        },
    },
    handler: uploadFile,
})

server.post('/api/q/delete-upload', handleQstashUploadDeletion)

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
