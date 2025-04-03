<script lang="ts">
	import dataFetch from '$lib/utils/service';

	let email = '';
	let password = '';
	let message = '';

	async function handleSubmit() {
		try {
			const payload = { email, password };
			const response = await dataFetch('/api/auth/login', 'POST', payload);
			if (response.token) {
				message = 'Login successful!';
				email = '';
				password = '';
			}

			console.table(response);
		} catch (err) {
			message = 'Login failed. Please check your credentials.';
			console.error(err);
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<input type="text" bind:value={email} placeholder="Email" required />
	<input type="password" bind:value={password} placeholder="Password" required />
	<button type="submit">Login mo to</button>
</form>

{#if message}
	<p>{message}</p>
{/if}
