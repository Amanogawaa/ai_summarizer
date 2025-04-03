<script>
	import dataFetch from '$lib/utils/service';
	import { ConsoleLogWriter } from 'drizzle-orm';
	import { onMount } from 'svelte';

	let announcements = [];

	// Fetch existing announcements
	async function loadAnnouncements() {
		const res = await dataFetch('/api/announcements', 'GET');

		announcements = res;

		console.log(announcements);
	}

	// Load on mount
	onMount(loadAnnouncements);
</script>

<h2>Announcements</h2>
<ul>
	{#each announcements as announcement}
		<li>
			<strong>{announcement.title}</strong>: {announcement.description}
			{#if announcement.image_url}
				<br /><img
					src={announcement.image_url}
					alt={announcement.title}
					style="max-width: 300px;"
				/>
			{/if}
		</li>
	{/each}
</ul>
