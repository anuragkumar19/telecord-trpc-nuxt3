<script>
	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import { client, getMessageFromError } from '$lib/trpc/client';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	let name = '',
		email = '',
		username = '',
		password = '';

	const handleSignup = async () => {
		try {
			await client.auth.register.mutate({
				name,
				email,
				username,
				password
			});

			goto('/auth/verify-otp');
		} catch (err) {
			const message = getMessageFromError(err);
			toastStore.trigger({
				message,
				background: 'variant-filled-error'
			});
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
		<button type="submit" class="btn variant-filled mt-4 w-full">Continue</button>
	</form>
	<p class="text-center mt-2">
		<a href="/auth/login">Already have an account?</a>
	</p>
	<p class="unstyled text-gray-700 mt-2 text-xs text-center">
		By registering, you agree to Telecord's <a href="/">Terms of Services</a> and
		<a href="/">Privacy Policy</a>
	</p>
</div>
