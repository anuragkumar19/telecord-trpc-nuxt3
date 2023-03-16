<script lang="ts">
	import { goto } from '$app/navigation';
	import { client, getMessageFromError } from '$lib/trpc/client';
	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	interface RegisterData {
		name: string;
		email: string;
		username: string;
		password: string;
	}

	let registerData: RegisterData;
	let otp: number;
	let submitting = false;

	onMount(() => {
		const dataStr = sessionStorage.getItem('register_data');

		if (!dataStr) {
			return goto('/auth/register');
		}

		try {
			const data = JSON.parse(dataStr) as RegisterData;
			registerData = data;
			sessionStorage.setItem('no_of_email_sent', String(1));
			// TODO: Validate data
		} catch (err) {
			goto('/auth/register');
		}
	});

	const handleEmailVerification = async () => {
		try {
			submitting = true;

			const { message } = await client().auth.verifyEmail.mutate({
				email: registerData.email,
				otp
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
	<h2 class="text-center font-extrabold mb-3">Verify your email</h2>
	<p>
		An OTP is sent to your email <code>{registerData?.email}</code>. Enter the OTP to activate your
		account
	</p>
	<form on:submit|preventDefault={handleEmailVerification}>
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
		<button type="submit" class="btn variant-filled mt-4 w-full" disabled={submitting}
			>{submitting ? 'Please wait...' : 'Continue'}</button
		>
	</form>
	<p class="text-center mt-2">
		<a href="/auth/register">Back to register?</a>
	</p>
</div>
