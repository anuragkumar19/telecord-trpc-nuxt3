import type { RequestHandler } from './$types';

export const POST = (async ({ cookies }) => {
	cookies.set('access_token', 'null', {
		httpOnly: false,
		secure: true,
		maxAge: 9 * 60, // Nine minutes
		path: '/'
	});

	cookies.set('refresh_token', 'null', {
		httpOnly: true,
		secure: true,
		maxAge: 50 * 365 * 24 * 60 * 60, // 50 years
		path: '/'
	});

    return new Response(JSON.stringify({ message:'OK' }))
}) satisfies RequestHandler;
