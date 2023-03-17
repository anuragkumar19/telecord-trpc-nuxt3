import { PUBLIC_SERVER_URL } from '$env/static/public';
import type { Auth } from '$lib/auth/store';
import { checkToken } from '$lib/auth/token';
import type { AppRouter } from '@telecord/server/src/router';
import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import superjson from 'superjson';

export const client = (auth?: Auth | string) =>
	createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${PUBLIC_SERVER_URL}/trpc`,
				headers: async () => {
					if (auth && typeof auth !== 'string') {
						const token = await checkToken(auth);

						return {
							Authorization: `Bearer ${token}`
						};
					}

					if (auth) {
						return {
							Authorization: `Bearer ${auth}`
						};
					}

					return {};
				}
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
