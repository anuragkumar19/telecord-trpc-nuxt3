<script>
	import { auth } from '$lib/auth/store';
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';
	import '../theme.postcss';
	import { page } from '$app/stores';

	$auth = $page.data.auth;
</script>

<slot />
