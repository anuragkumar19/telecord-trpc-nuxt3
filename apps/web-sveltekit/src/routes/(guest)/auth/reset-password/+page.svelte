<script lang="ts">
	import { goto } from '$app/navigation';
	import { client, getMessageFromError } from '$lib/trpc/client';
	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	let otp: number;
	let password = '';
	let email: string;
	let submitting = false;

	onMount(() => {
		const email_ = sessionStorage.getItem('forgot_password_email');

		if (!email_) {
			return goto('/auth/register');
		}

		email = email_;
		sessionStorage.setItem('no_of_email_sent', String(1));
	});

	const handleResetPassword = async () => {
		try {
			submitting = true;

			const { message } = await client().auth.resetPassword.mutate({
				email: email,
				otp,
				password
			});

			sessionStorage.clear();

			toastStore.trigger({
				message,
				autohide: true,
				background: 'variant-filled-success'
			});

			toastStore.trigger({
				message: 'Redirecting to login',
				autohide: true,
				background: 'variant-filled-success'
			});

			setTimeout(() => {
				goto('/auth/login');
			}, 1000);
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
	<h2 class="text-center font-extrabold mb-3">Reset your password</h2>
	<p>
		An OTP is sent to your email <code>{email}</code>. Enter the OTP to reset your password
	</p>
	<form on:submit|preventDefault={handleResetPassword}>
		<label class="label mt-2">
			<span>Enter your OTP</span>
			<input
				class="input"
				type="number"
				placeholder="000000"
				autocomplete="off"
				bind:value={otp}
				min="100000"
				max="999999"
			/>
		</label>
		<label class="label mt-2">
			<span>Enter new password</span>
			<input
				class="input"
				type="password"
				placeholder="********"
				autocomplete="new-password"
				bind:value={password}
			/>
		</label>
		<button type="submit" class="btn variant-filled mt-4 w-full" disabled={submitting}
			>{submitting ? 'Please wait...' : 'Reset Password'}</button
		>
	</form>
	<p class="text-center mt-2">
		<a href="/auth/login">Back to login?</a>
	</p>
</div>
