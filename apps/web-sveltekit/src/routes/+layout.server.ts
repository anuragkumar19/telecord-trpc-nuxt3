import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = ((event) => {
	if (event.route.id?.includes('(authenticated)') && !event.locals.auth) {
		throw redirect(302, '/auth/login');
	}

	if (event.route.id?.includes('(guest)') && event.locals.auth) {
		throw redirect(302, '/app');
	}

	return {
		auth: event.locals.auth
	};
}) satisfies LayoutServerLoad;
