<script lang="ts">
	import { auth } from '$lib/auth/store';
	import { client, getMessageFromError } from '$lib/trpc/client';
	import { Toast, toastStore } from '@skeletonlabs/skeleton';

	let submitting = false;
	let name = $auth?.user.name || '';
	let username = $auth?.user.username || '';
	let bio = $auth?.user.bio || '';

	$: disabled =
		submitting ||
		(name === $auth?.user.name && username === $auth?.user.username && bio === $auth?.user.bio);

	const handleProfileUpdate = async () => {
		try {
			submitting = true;

			if (name !== $auth?.user.name) {
				const { message } = await client($auth).user.updateName.mutate({
					name
				});

				toastStore.trigger({
					message,
					autohide: true,
					background: 'variant-filled-success'
				});
			}

			if (username !== $auth?.user.username) {
				const { message } = await client($auth).user.updateUsername.mutate({
					username
				});

				toastStore.trigger({
					message,
					autohide: true,
					background: 'variant-filled-success'
				});
			}
			if (bio !== $auth?.user.bio) {
				const { message } = await client($auth).user.updateBio.mutate({
					bio
				});

				toastStore.trigger({
					message,
					autohide: true,
					background: 'variant-filled-success'
				});
			}
		} catch (err) {
			const message = getMessageFromError(err);
			toastStore.trigger({
				message,
				autohide: true,
				background: 'variant-filled-error'
			});
		} finally {
			const user = await client($auth).user.me.query();
			$auth!.user = user;
			submitting = false;
		}
	};
</script>

<Toast />
<main class="py-8 flex justify-center items-center h-full flex-col px-4">
	<div class="card max-w-md w-full py-8 px-4">
		<div
			class="custom-avatar"
			style={`background:url(https://i.pravatar.cc/?img=56) no-repeat center center/cover`}
		>
			<a href="/app/profile/edit/avatar">
				<div class="overlay flex justify-center items-center">Upload Avatar</div>
			</a>
		</div>

		<form on:submit|preventDefault={handleProfileUpdate}>
			<label class="label mt-2">
				<span>Name</span>
				<input class="input" type="text" autocomplete="name" bind:value={name} />
			</label>
			<label class="label mt-2">
				<span>Username</span>
				<input class="input" type="text" autocomplete="username" bind:value={username} />
			</label>
			<label class="label mt-2">
				<span>Bio</span>
				<textarea class="textarea" autocomplete="off" bind:value={bio} />
			</label>
			<button type="submit" class="btn variant-filled mt-4 w-full" {disabled}
				>{submitting ? 'Please wait...' : 'Save'}</button
			>
		</form>
	</div>
</main>
