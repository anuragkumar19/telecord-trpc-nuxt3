<script lang="ts">
	import { Toast, toastStore } from '@skeletonlabs/skeleton';

	let identifier = '',
		password = '';
	let submitting = false;

	const handleLogin = async () => {
		submitting = true;
		const data = await fetch('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify({
				identifier,
				password
			})
		}).then((res) => res.json());

		if (!data.success) {
			submitting = false;
			return toastStore.trigger({
				message: data.message,
				autohide: true,
				background: 'variant-filled-error'
			});
		}

		location.reload();

		submitting = false;
	};
</script>

<svelte:head>
	<title>Telecord</title>
</svelte:head>
<Toast />
<div class="card px-4 py-8 max-w-md w-full">
	<h2 class="text-center font-extrabold mb-3">Welcome back! Login</h2>
	<form on:submit|preventDefault={handleLogin}>
		<label class="label mt-2">
			<span>Email or Username</span>
			<input
				class="input"
				type="text"
				placeholder="john_deo"
				autocomplete="username"
				bind:value={identifier}
			/>
		</label>
		<label class="label mt-2">
			<span>Password</span>
			<input
				class="input"
				type="password"
				placeholder="*********"
				autocomplete="current-password"
				bind:value={password}
			/>
		</label>
		<button type="submit" class="btn variant-filled mt-4 w-full" disabled={submitting}
			>{submitting ? 'Please wait...' : 'Login'}</button
		>
	</form>
	<p class="text-center mt-2">
		<a href="/auth/forgot-password">Forgot your password?</a>
	</p>
	<p class="text-center mt-2">
		<a href="/auth/register">Don't have an account?</a>
	</p>
</div>
