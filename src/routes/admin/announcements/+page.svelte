<script lang="ts">
	let title = '';
	let description = '';
	// replace nyo nlng to with the userid | decode nyo ung token from login store nyo sa session or sa indexdb kayo bahala
	let userId = 1;
	let imageInput;
	let message = '';

	async function createAnnouncement() {
		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('user_id', userId.toString());
		if (imageInput?.files[0]) {
			formData.append('image', imageInput.files[0]);
		}

		try {
			const response = await dataFetch(
				'/api/announcements',
				'POST',
				formData,
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiIxMjNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQzNjQxOTcwLCJleHAiOjE3NDM2NDU1NzB9.tVgQmghPuULpnZDk5Fr8tohPfFHpH_Rc0oHFi3PwR1w'
			);
		} catch (err) {
			console.error(err);
		}
	}
</script>

<h1>Create an Announcement</h1>
<form onsubmit={createAnnouncement}>
	<input bind:value={title} placeholder="Title" required />
	<textarea bind:value={description} placeholder="Description" required></textarea>
	<input type="number" bind:value={userId} placeholder="User ID" required />
	<input type="file" accept="image/*" bind:this={imageInput} />
	<button type="submit">Create Announcement</button>
</form>
<p>{message}</p>
