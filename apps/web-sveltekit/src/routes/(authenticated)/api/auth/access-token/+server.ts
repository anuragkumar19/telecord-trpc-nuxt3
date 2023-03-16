import { getAccessToken } from '$lib/auth';
import { getMessageFromError } from '$lib/trpc/client';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	try {
		const token = await getAccessToken(event);

		if (token) {
			return new Response(JSON.stringify({ success: true, token }));
		} else {
			throw Error();
		}
	} catch (err) {
		const message = getMessageFromError(err);
		return new Response(JSON.stringify({ success: false, message }));
	}
}) satisfies RequestHandler;
