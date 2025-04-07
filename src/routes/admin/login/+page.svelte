<script lang="ts">
	import dataFetch from '$lib/utils/service';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let message = '';
	let isLoading = false;

	async function handleSubmit() {
		isLoading = true;
		message = '';

		try {
			const payload = { email, password };
			const response = await dataFetch('/api/auth/login', 'POST', payload);

			console.info(response);

			if (response.access_token) {
				// Store the token in localStorage
				localStorage.setItem('token', response.access_token);
				localStorage.setItem('id', response.data.id);
				message = 'Login successful! Redirecting...';
				// Redirect to announcements page after successful login
				setTimeout(() => goto('/admin/announcements'), 1500);
			}
		} catch (err: any) {
			message = err.message || 'Login failed. Please check your credentials.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>Welcome Back</h1>
		<p class="subtitle">Please enter your credentials to login</p>

		<form on:submit|preventDefault={handleSubmit}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="Enter your email"
					required
					disabled={isLoading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="Enter your password"
					required
					disabled={isLoading}
				/>
			</div>

			<button type="submit" disabled={isLoading}>
				{#if isLoading}
					<span class="spinner"></span>
					<span>Logging in...</span>
				{:else}
					Login
				{/if}
			</button>
		</form>

		{#if message}
			<p class="message" class:error={message.includes('failed')}>
				{message}
			</p>
		{/if}

		<p class="signup-link">
			Don't have an account? <a href="/admin/signup">Sign up here</a>
		</p>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 2rem;
	}

	.auth-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}

	h1 {
		text-align: center;
		margin-bottom: 0.5rem;
		color: #2d3748;
		font-size: 2rem;
	}

	.subtitle {
		text-align: center;
		color: #718096;
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #4a5568;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #4a90e2;
	}

	input:disabled {
		background-color: #f7fafc;
		cursor: not-allowed;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background: #4a90e2;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	button:hover:not(:disabled) {
		background: #357abd;
	}

	button:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.message {
		margin-top: 1rem;
		padding: 0.75rem;
		border-radius: 6px;
		text-align: center;
	}

	.message.error {
		background: #fff5f5;
		color: #c53030;
	}

	.message.success {
		background: #f0fff4;
		color: #2f855a;
	}

	.signup-link {
		text-align: center;
		margin-top: 1.5rem;
		color: #718096;
	}

	.signup-link a {
		color: #4a90e2;
		text-decoration: none;
		font-weight: 500;
	}

	.signup-link a:hover {
		text-decoration: underline;
	}
</style>
