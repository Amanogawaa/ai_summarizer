<script>
	import { onMount } from 'svelte';

	let title = '';
	let description = '';
	// replace nyo nlng to with the userid | decode nyo ung token from login store nyo sa session or sa indexdb kayo bahala
	let userId = 1;
	let imageInput;
	let message = '';
	let announcements = [];

	async function createAnnouncement() {
		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('user_id', userId.toString());
		if (imageInput?.files[0]) {
			formData.append('image', imageInput.files[0]);
		}

		try {
			const response = await fetch('/api/announcements', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();
			if (result.success) {
				message = 'Announcement created successfully!';
				announcements = [result.data, ...announcements];
				title = '';
				description = '';
				imageInput.value = '';
			} else {
				message = result.message || 'Failed to create announcement';
			}
		} catch (err) {
			message = 'Error creating announcement';
			console.error(err);
		}
	}

	// Fetch existing announcements
	async function loadAnnouncements() {
		const res = await fetch('/api/announcements');
		const { data } = await res.json();
		announcements = data;
	}

	// Load on mount
	onMount(loadAnnouncements);
</script>

<h1>Create an Announcement</h1>
<form on:submit|preventDefault={createAnnouncement}>
	<input bind:value={title} placeholder="Title" required />
	<textarea bind:value={description} placeholder="Description" required></textarea>
	<input type="number" bind:value={userId} placeholder="User ID" required />
	<input type="file" accept="image/*" bind:this={imageInput} />
	<button type="submit">Create Announcement</button>
</form>
<p>{message}</p>

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
