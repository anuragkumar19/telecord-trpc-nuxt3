import { client } from '$lib/trpc/client';
import type { RequestEvent } from '@sveltejs/kit';

export const getAccessToken = async (event: RequestEvent) => {
	let accessToken = event.cookies.get('access_token');
	const refreshToken = event.cookies.get('refresh_token');

	if (!refreshToken) {
		return;
	}

	if (!accessToken) {
		try {
			const { tokens } = await client().auth.refreshToken.mutate({ refreshToken });

			accessToken = tokens.accessToken;
			event.cookies.set('access_token', tokens.accessToken, {
				httpOnly: false,
				secure: true,
				maxAge: 9 * 60, // Nine minutes
				path: '/'
			});
		} catch (err) {
			return;
		}
	}

	return accessToken;
};

export const fetchUser = async (event: RequestEvent) => {
	const accessToken = await getAccessToken(event);
	return await client(accessToken).user.me.query();
};

export type User = Awaited<ReturnType<typeof fetchUser>>;

export interface Credentials {
	identifier: string;
	password: string;
}
