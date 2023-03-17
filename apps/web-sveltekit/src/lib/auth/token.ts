import type { Auth } from '$lib/auth/store';

function parseJwt(token: string) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(
		window
			.atob(base64)
			.split('')
			.map(function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join('')
	);

	return JSON.parse(jsonPayload);
}

export const checkToken = async (auth: Auth) => {
	const data = parseJwt(auth.tokens.accessToken);

	console.log(data.exp, Date.now(), data.exp - Date.now() / 1000);
	if (data.exp - Date.now() / 1000 < 60) {
		console.log('pass');

		auth.tokens.accessToken = (
			await fetch('/api/auth/access-token', { method: 'POST' }).then((res) => res.json())
		).token;
	}

	return auth.tokens.accessToken;
};
