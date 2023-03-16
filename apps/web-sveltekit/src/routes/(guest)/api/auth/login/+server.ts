import type { Credentials } from '$lib/auth';
import { client, getMessageFromError } from '$lib/trpc/client';
import type { RequestHandler } from './$types';

export const POST = (async ({ request, cookies }) => {
	try {
		const body = (await request.json()) as Credentials;

		const { tokens } = await client().auth.login.mutate(body);

		cookies.set('access_token', tokens.accessToken, {
			httpOnly: false,
			secure: true,
			maxAge: 9 * 60, // Nine minutes
			path: '/'
		});

		cookies.set('refresh_token', tokens.refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 50 * 365 * 24 * 60 * 60, // 50 years
			path: '/'
		});

		return new Response(JSON.stringify({ success: true }));
	} catch (err) {
		const message = getMessageFromError(err);
		return new Response(JSON.stringify({ success: false, message }));
	}
}) satisfies RequestHandler;
