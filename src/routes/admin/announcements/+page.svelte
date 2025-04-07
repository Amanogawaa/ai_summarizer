<script lang="ts">
	import { onMount } from 'svelte';
	import dataFetch from '$lib/utils/service';
	import { goto } from '$app/navigation';
	import ChatbotModal from '$lib/components/ChatbotModal.svelte';
	import { toggleChatbot } from '$lib/stores/chatbot';

	let title = '';
	let description = '';
	let imageInput: FileList | null = null;
	let message = '';
	let isLoading = false;

	// Get token from localStorage
	const token = localStorage.getItem('token') || '';
	const id = localStorage.getItem('id') || '';

	if (!token) {
		goto('/admin/login');
	}

	// Handle logout
	function handleLogout() {
		localStorage.removeItem('token');
		localStorage.removeItem('id');
		goto('/admin/login');
	}

	// Create announcement
	async function createAnnouncement() {
		isLoading = true;
		message = '';

		try {
			const formData = new FormData();
			formData.append('title', title);
			formData.append('description', description);
			formData.append('user_id', id);

			// If there's an image, append it to the form data
			if (imageInput && imageInput.length > 0) {
				formData.append('image', imageInput[0]);
			}

			await dataFetch('/api/announcements', 'POST', formData, token);
			message = 'Announcement created successfully!';

			// Reset form
			title = '';
			description = '';
			imageInput = null;
		} catch (err: any) {
			message = err.message || 'Error creating announcement. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="create-announcement-container">
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
		<button class="nav-link logout-link" on:click={handleLogout}>
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
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
				<polyline points="16 17 21 12 16 7"></polyline>
				<line x1="21" y1="12" x2="9" y2="12"></line>
			</svg>
			<span>Logout</span>
		</button>
	</div>

	<div class="create-card">
		<h1>Create New Announcement</h1>
		<p class="subtitle">Share important updates with your users</p>

		<form on:submit|preventDefault={createAnnouncement}>
			<div class="form-group">
				<label for="title">Title</label>
				<input
					type="text"
					id="title"
					bind:value={title}
					placeholder="Announcement title"
					required
				/>
			</div>

			<div class="form-group">
				<label for="description">Description</label>
				<textarea
					id="description"
					bind:value={description}
					placeholder="Announcement description"
					rows="5"
					required
				></textarea>
			</div>

			<div class="form-group">
				<label for="image">Image (optional)</label>
				<input type="file" id="image" accept="image/*" bind:files={imageInput} />
				<p class="help-text">Recommended size: 1200 x 630 pixels</p>
			</div>

			{#if message}
				<div class="message" class:error={message.includes('Error')}>
					{message}
				</div>
			{/if}

			<div class="form-actions">
				<button type="submit" class="submit-button" disabled={isLoading}>
					{#if isLoading}
						<span class="spinner"></span>
						Creating...
					{:else}
						Create Announcement
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- Fixed chat button for mobile -->
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

	<!-- Chatbot Modal -->
	<ChatbotModal />
</div>

<style>
	.create-announcement-container {
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

	.logout-link {
		background: #f7fafc;
		color: #e53e3e;
	}

	.logout-link:hover {
		background: #fff5f5;
		color: #c53030;
	}

	.create-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 800px;
		margin: 0 auto;
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

	input[type='text'],
	textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input[type='file'] {
		display: block;
		padding: 0.75rem 0;
	}

	.help-text {
		font-size: 0.875rem;
		color: #718096;
		margin-top: 0.25rem;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #4a90e2;
	}

	.message {
		padding: 1rem;
		border-radius: 6px;
		background-color: #ebf8ff;
		color: #2b6cb0;
		margin-bottom: 1.5rem;
	}

	.message.error {
		background-color: #fff5f5;
		color: #c53030;
	}

	.form-actions {
		display: flex;
		justify-content: center;
	}

	.submit-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #4a90e2;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.submit-button:hover:not(:disabled) {
		background: #357abd;
	}

	.submit-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.5);
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
		.mobile-chat-button {
			display: flex;
		}
		.header-actions {
			flex-direction: column;
			align-items: center;
		}
		.nav-link {
			width: 100%;
			justify-content: center;
		}
		.create-card {
			padding: 1.5rem;
		}
	}
</style>
