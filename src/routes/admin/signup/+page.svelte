<script lang="ts">
	import { goto } from '$app/navigation';
	import dataFetch from '$lib/utils/service';
	import ChatbotModal from '$lib/components/ChatbotModal.svelte';
	import { toggleChatbot } from '$lib/stores/chatbot';

	let full_name = '';
	let email = '';
	let password = '';
	let confirm_password = '';
	let message = '';
	let isLoading = false;

	async function handleSubmit() {
		message = '';

		if (password !== confirm_password) {
			message = 'Passwords do not match';
			return;
		}

		if (password.length < 6) {
			message = 'Password must be at least 6 characters long';
			return;
		}

		isLoading = true;

		const userData = {
			full_name,
			email,
			password
		};

		try {
			const response = await dataFetch('/api/auth', 'POST', userData);

			message = 'Sign up successful! Redirecting to login...';

			setTimeout(() => {
				goto('/admin/login');
			}, 2000);
		} catch (err: any) {
			message = err.message || 'Sign up failed. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container">
	<div class="header-actions">
		<a href="/" class="nav-link">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
				<polyline points="9 22 9 12 15 12 15 22"></polyline>
			</svg>
			<span>View Public Page</span>
		</a>
		<a href="/admin/dashboard" class="nav-link">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
				<line x1="3" y1="9" x2="21" y2="9"></line>
				<line x1="9" y1="21" x2="9" y2="9"></line>
			</svg>
			<span>Dashboard</span>
		</a>
		<a href="/admin/login" class="nav-link">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
				<polyline points="10 17 15 12 10 7"></polyline>
				<line x1="15" y1="12" x2="3" y2="12"></line>
			</svg>
			<span>Login</span>
		</a>
		<button class="nav-link" on:click={toggleChatbot}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
			<span>AI Assistant</span>
		</button>
	</div>

	<div class="form-container">
		<h1>Sign Up</h1>
		<form on:submit|preventDefault={handleSubmit}>
			<div class="form-group">
				<label for="full_name">Full Name</label>
				<input
					type="text"
					id="full_name"
					bind:value={full_name}
					placeholder="Enter your full name"
					required
				/>
			</div>

			<div class="form-group">
				<label for="email">Email</label>
				<input type="email" id="email" bind:value={email} placeholder="Enter your email" required />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="Enter your password"
					required
				/>
			</div>

			<div class="form-group">
				<label for="confirm_password">Confirm Password</label>
				<input
					type="password"
					id="confirm_password"
					bind:value={confirm_password}
					placeholder="Confirm your password"
					required
				/>
			</div>

			{#if message}
				<div class="message-container {message.includes('Error') ? 'error' : 'success'}">
					{message}
				</div>
			{/if}

			<div class="btn-container">
				<button type="submit" disabled={isLoading}>
					{#if isLoading}
						<span class="spinner"></span>
						<span>Signing Up...</span>
					{:else}
						Sign Up
					{/if}
				</button>
			</div>
		</form>

		<div class="signup-link">
			Already have an account? <a href="/admin/login">Log In</a>
		</div>
	</div>

	<button class="mobile-chat-button" on:click={toggleChatbot} aria-label="Open AI Assistant">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
		</svg>
	</button>

	<ChatbotModal />
</div>

<style>
	.container {
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		position: relative;
	}

	.header-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: white;
		color: #4a5568;
		text-decoration: none;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		font-size: 1rem;
	}

	.nav-link:hover {
		background: #f7fafc;
		color: #4a90e2;
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.form-container {
		background: white;
		padding: 2rem;
		border-radius: 10px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		margin: 0 auto;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
		color: #2d3748;
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
		padding: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 5px;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
	}

	.btn-container {
		display: flex;
		justify-content: center;
	}

	button {
		padding: 0.75rem 1.5rem;
		background: #4a90e2;
		color: white;
		border: none;
		border-radius: 5px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	button:hover {
		background: #357abd;
	}

	button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.message-container {
		margin-bottom: 1.5rem;
		padding: 0.75rem;
		border-radius: 5px;
	}

	.success {
		background-color: #f0fff4;
		color: #276749;
	}

	.error {
		background-color: #fff5f5;
		color: #c53030;
	}

	.signup-link {
		text-align: center;
		margin-top: 1.5rem;
		color: #4a5568;
	}

	.signup-link a {
		color: #4a90e2;
		text-decoration: none;
		font-weight: 500;
	}

	.signup-link a:hover {
		text-decoration: underline;
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

	.mobile-chat-button {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: #4a90e2;
		color: white;
		border: none;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
		display: none;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 100;
		transition:
			transform 0.2s,
			background-color 0.2s;
	}

	.mobile-chat-button:hover {
		transform: scale(1.05);
		background: #357abd;
	}

	@media (max-width: 768px) {
		.header-actions {
			flex-direction: column;
			align-items: center;
		}
		.nav-link {
			width: 100%;
			justify-content: center;
		}
		.form-container {
			padding: 1.5rem;
		}
		.mobile-chat-button {
			display: flex;
		}
	}
</style>
