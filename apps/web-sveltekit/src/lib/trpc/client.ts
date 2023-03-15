// import { PUBLIC_SERVER_URL } from '$env/static/public';
// import type { AppRouter } from '@telecord/server/src/router';
// import superjson from 'superjson';
// import { createTRPCClient } from 'trpc-sveltekit';

// let browserClient: ReturnType<typeof createTRPCClient<AppRouter>>;

// export function trpc<T extends { fetch: typeof window.fetch }>(init?: T) {
// 	const isBrowser = typeof window !== 'undefined';
// 	if (isBrowser && browserClient) return browserClient;
// 	const client = createTRPCClient<AppRouter>({
// 		transformer: superjson,
// 		init: {
// 			fetch: init?.fetch,
// 			url: {
// 				origin: PUBLIC_SERVER_URL || 'https://22e7-2409-4064-4db3-d085-5076-cb4f-f92b-91b6.ngrok.io'
// 			}
// 		}
// 	});
// 	if (isBrowser) browserClient = client;
// 	return client;
// }

import { PUBLIC_SERVER_URL } from '$env/static/public';
import type { AppRouter } from '@telecord/server/src/router';
import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import superjson from 'superjson';

export const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${PUBLIC_SERVER_URL}/trpc`
		})
	],
	transformer: superjson
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMessageFromError = (err: any) => {
	if (err instanceof TRPCClientError) {
		return err.message;
	}

	return 'Something went wrong!';
};
