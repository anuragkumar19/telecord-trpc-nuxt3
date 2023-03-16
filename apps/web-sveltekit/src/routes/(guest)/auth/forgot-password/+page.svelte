<script lang="ts">
	import { goto } from '$app/navigation';
	import { client, getMessageFromError } from '$lib/trpc/client';
	import { Toast, toastStore } from '@skeletonlabs/skeleton';

	let email = '';
	let submitting = false;

	const handleForgotPassword = async () => {
		try {
			submitting = true;

			const { message } = await client().auth.forgotPassword.mutate({
				email
			});

			sessionStorage.setItem('forgot_password_email', email);
			goto('/auth/reset-password');
		} catch (err) {
			const message = getMessageFromError(err);
			toastStore.trigger({
				message,
				autohide: true,
				background: 'variant-filled-error'
			});
		} finally {
			submitting = false;
		}
	};
</script>

<svelte:head>
	<title>Telecord</title>
</svelte:head>
<Toast />
<div class="card px-4 py-8 max-w-md w-full">
	<h2 class="text-center font-extrabold mb-3">Forgot your password?</h2>
	<p>Don't worry! Reset your password in few clicks</p>
	<form on:submit|preventDefault={handleForgotPassword}>
		<label class="label mt-2">
			<span>Enter your email</span>
			<input
				class="input"
				type="email"
				placeholder="john@example.com"
				autocomplete="email"
				bind:value={email}
			/>
		</label>
		<button type="submit" class="btn variant-filled mt-4 w-full" disabled={submitting}
			>{submitting ? 'Please wait...' : 'Continue'}</button
		>
	</form>
	<p class="text-center mt-2">
		<a href="/auth/login">Back to login?</a>
	</p>
</div>
