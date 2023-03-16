// See https://kit.svelte.dev/docs/types#app

import type { User } from '$lib/auth';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth?: {
				tokens: {
					refreshToken: string;
					accessToken: string;
				};
				user: User;
			};
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
