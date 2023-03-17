<script lang="ts">
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { auth } from '$lib/auth/store';
	import { client, getMessageFromError } from '$lib/trpc/client';
	import { FileButton, Toast, toastStore } from '@skeletonlabs/skeleton';

	let submitting = false;
	let files: FileList;
	let image: string;
	let file: File;

	function onChangeHandler(e: Event): void {
		const files = (<HTMLInputElement>e.target)?.files;
		if (!files) return;

		file = files[0];
		if (!file) return;

		if (!file.type.startsWith('image')) return;

		image = URL.createObjectURL(file);
	}

	const handleAvatarUpdate = async () => {
		try {
			submitting = true;

			const { publicId, secret } = await client($auth).upload.getUploadCredentials.mutate({
				type: 'IMAGE'
			});

			const formData = new FormData();

			formData.append('file', file);

			await fetch(`${PUBLIC_SERVER_URL}/api/upload?publicId=${publicId}&secret=${secret}`, {
				method: 'POST',
				body: formData
			});

			const { message } = await client($auth).user.updateAvatar.mutate({
				publicId
			});

			toastStore.trigger({
				message,
				autohide: true,
				background: 'variant-filled-success'
			});
		} catch (err) {
			console.log(err);
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

<svelte:head>
	<title>Upload Avatar - Telecord</title>
</svelte:head>
<Toast />
<main class="py-8 flex justify-center items-center h-full flex-col px-4">
	<div class="card max-w-md w-full py-8 px-4">
		<h1 class="text-center">Upload Avatar</h1>

		<form on:submit|preventDefault={handleAvatarUpdate} class="text-center mt-4">
			<FileButton on:change={onChangeHandler} bind:files name="files" button="variant-soft-primary"
				>Select file</FileButton
			>
			{#if image}
				<img class="mt-4" src={image} alt="" />
				<button type="submit" class="btn variant-filled mt-4 w-full" disabled={!image || submitting}
					>{submitting ? 'Please wait...' : 'Upload'}</button
				>
			{/if}
		</form>
		<div class="mt-4 text-center">
			<a href="/app/profile/edit">Back</a>
		</div>
	</div>
</main>
