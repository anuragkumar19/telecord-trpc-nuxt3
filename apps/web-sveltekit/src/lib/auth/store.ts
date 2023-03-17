import { writable } from 'svelte/store';
import type { User } from '.';

export interface Auth {
	tokens: {
		refreshToken: string;
		accessToken: string;
	};
	user: User;
}

export const auth = writable<Auth | undefined>();
