<script lang="ts">
	import './style.postcss';
	import { auth } from '$lib/auth/store';
	import { page } from '$app/stores';
	import { AppBar, AppShell, Avatar, Drawer, drawerStore } from '@skeletonlabs/skeleton';

	function drawerOpen(): void {
		drawerStore.open({});
	}
	// Reactive Properties
	$: classesSidebarLeft = $page.url.pathname === '/' ? 'w-0' : 'w-0 lg:w-64';
</script>

<div class="h-full overflow-hidden">
	<!-- Drawer -->
	<Drawer>
		<h2 class="p-4">Navigation</h2>
		<hr />
		hii
	</Drawer>

	<!-- App Shell -->
	<AppShell slotSidebarLeft="bg-surface-500/5 {classesSidebarLeft}">
		<svelte:fragment slot="header">
			<!-- App Bar -->
			<AppBar>
				<svelte:fragment slot="lead">
					<div class="flex items-center">
						<button class="lg:hidden btn btn-sm mr-4" on:click={drawerOpen}>
							<span>
								<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
									<rect width="100" height="20" />
									<rect y="30" width="100" height="20" />
									<rect y="60" width="100" height="20" />
								</svg>
							</span>
						</button>
						<a href="/app"><strong class="text-xl uppercase">Telecord</strong></a>
					</div>
				</svelte:fragment>
				<svelte:fragment slot="trail">
					<a href={`/app/user/${$auth?.user.username}`}
						><Avatar src="https://i.pravatar.cc/?img=69" width="w-8" /></a
					>
				</svelte:fragment>
			</AppBar>
		</svelte:fragment>
		<!-- Left Sidebar Slot -->
		<svelte:fragment slot="sidebarLeft">hii</svelte:fragment>
		<!-- Page Route Content -->
		<slot />
	</AppShell>
</div>
