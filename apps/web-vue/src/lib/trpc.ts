import type { AppRouter } from '@telecord/server/src/router'
import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from '@trpc/client'
import superjson from 'superjson'

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
            headers: async () => ({})
        })
    ],
    transformer: superjson
})

export const getMessageFromError = (err: any) => {
    if (err instanceof TRPCClientError) {
        return err.message
    }

    return 'Something went wrong!'
}
