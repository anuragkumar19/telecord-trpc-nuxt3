import { fetchUser, getAccessToken } from '$lib/auth';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	try {
		const refreshToken = event.cookies.get('refresh_token');
		const accessToken = await getAccessToken(event);
		if (refreshToken && accessToken) {
			const auth = {
				tokens: {
					refreshToken,
					accessToken
				},
				user: await fetchUser(event)
			};
			console.log(refreshToken, accessToken);
			event.locals.auth = auth;
		}
	} catch (err) {
		//.. eat 5-star do nothing
	}

	return await resolve(event);
}) satisfies Handle;
