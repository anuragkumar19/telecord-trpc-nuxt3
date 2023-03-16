<script lang="ts">
	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import { client, getMessageFromError } from '$lib/trpc/client';
	import { goto } from '$app/navigation';

	let name = '',
		email = '',
		username = '',
		password = '';
	let submitting = false;

	const handleSignup = async () => {
		try {
			submitting = true;

			// const data = registerSchema.parse({
			// 	name,
			// 	email,
			// 	username,
			// 	password
			// });

			const data = {
				name,
				email,
				username,
				password
			};

			await client().auth.register.mutate(data);

			sessionStorage.setItem('register_data', JSON.stringify(data));

			goto('/auth/verify-otp');
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
	<h2 class="text-center font-extrabold mb-3">Create an account</h2>
	<form on:submit|preventDefault={handleSignup}>
		<label class="label">
			<span>Name</span>
			<input
				class="input"
				type="text"
				placeholder="John Deo"
				autocomplete="name"
				bind:value={name}
			/>
		</label>
		<label class="label mt-2">
			<span>Email</span>
			<input
				class="input"
				type="email"
				placeholder="johndeo@example.com"
				autocomplete="email"
				bind:value={email}
			/>
		</label>
		<label class="label mt-2">
			<span>Username</span>
			<input
				class="input"
				type="text"
				placeholder="john_deo"
				autocomplete="off"
				bind:value={username}
			/>
		</label>
		<label class="label mt-2">
			<span>Password</span>
			<input
				class="input"
				type="password"
				placeholder="*********"
				autocomplete="new-password"
				bind:value={password}
			/>
		</label>
		<button type="submit" class="btn variant-filled mt-4 w-full" disabled={submitting}
			>{submitting ? 'Please wait...' : 'Continue'}</button
		>
	</form>
	<p class="text-center mt-2">
		<a href="/auth/login">Already have an account?</a>
	</p>
	<p class="unstyled text-gray-700 mt-2 text-xs text-center">
		By registering, you agree to Telecord's <a href="/">Terms of Services</a> and
		<a href="/">Privacy Policy</a>
	</p>
</div>
