import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import type { AppRouter } from '@telecord/server/src/router'
import superjson from 'superjson'

export default defineNuxtPlugin(() => {
    /**
     * createTRPCNuxtClient adds a `useQuery` composable
     * built on top of `useAsyncData`.
     */
    const config = useRuntimeConfig()

    const client = createTRPCNuxtClient<AppRouter>({
        links: [
            httpBatchLink({
                url: `${config.public.TRPC_HTTP_BATCH_LINK}/trpc`,
                async headers() {
                    return {}
                },
            }),
        ],
        transformer: superjson,
    })
    return {
        provide: {
            client,
        },
    }
})
