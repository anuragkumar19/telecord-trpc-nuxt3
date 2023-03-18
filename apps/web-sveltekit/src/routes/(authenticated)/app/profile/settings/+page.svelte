<script lang="ts">
	import { auth } from '$lib/auth/store';
	import { client, getMessageFromError } from '$lib/trpc/client';
	import { Toast, toastStore } from '@skeletonlabs/skeleton';

	let submitting = false;
	let currentPassword = '';
	let newPassword = '';
	let secondaryEmail = $auth?.user.secondaryEmail || '';

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
		<div id="security">
			<h3 class="text-bold">Security</h3>
			<form on:submit|preventDefault={handleProfileUpdate}>
				<!-- Password -->
				<h4 class="mt-2">Change Password</h4>
				<label class="label mt-2">
					<span>Current Password</span>
					<input
						class="input"
						type="password"
						autocomplete="current-password"
						bind:value={currentPassword}
						placeholder="********"
					/>
				</label>
				<label class="label mt-2">
					<span>New Password</span>
					<input
						class="input"
						type="password"
						autocomplete="new-password"
						bind:value={newPassword}
						placeholder="********"
					/>
				</label>
				<!-- Secondary Email -->
				<h4 class="mt-2">Emails</h4>
				<label class="label mt-2">
					<span>Current Email</span>
					<input class="input" disabled type="text" autocomplete="off" value={$auth?.user.email} />
				</label>
				<label class="label mt-2">
					<span>Secondary Email</span>
					<input
						class="input"
						disabled={submitting}
						type="text"
						autocomplete="email"
						bind:value={secondaryEmail}
					/>
					<!-- {#if $auth.user.secondaryEmail !== second} -->
				</label>
			</form>
		</div>
	</div>
</main>
