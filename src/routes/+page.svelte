<script lang="ts">
	import dataFetch from '$lib/utils/service';
	import { onMount } from 'svelte';
	import ChatbotModal from '$lib/components/ChatbotModal.svelte';
	import { toggleChatbot } from '$lib/stores/chatbot';
	import { goto } from '$app/navigation';

	let announcements: Array<{
		id: number;
		title: string;
		description: string;
		image_url: string | null;
		created_at: string;
	}> = [];
	let isLoading = true;
	let error = '';
	let isLoggedIn = false;

	// Fetch existing announcements
	async function loadAnnouncements() {
		try {
			const response = await dataFetch('/api/announcements', 'GET');
			announcements = response.data.sort((a: any, b: any) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();
				return dateB - dateA; // Sort by date, newest first
			});
		} catch (err: any) {
			error = err.message || 'Failed to load announcements. Please try again later.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Handle logout
	function handleLogout() {
		localStorage.removeItem('token');
		isLoggedIn = false;
		goto('/');
	}

	// Load on mount
	onMount(() => {
		// Check if user is logged in
		const token = localStorage.getItem('token');
		isLoggedIn = !!token;
		
		loadAnnouncements();
	});

	// Format date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}
</script>

<div class="announcements-container">
	<header class="header">
		<h1 class="site-title">AI Announcements</h1>
		<nav class="nav-links">
			{#if isLoggedIn}
				<a href="/admin/dashboard" class="nav-link">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="3" y1="9" x2="21" y2="9"></line>
						<line x1="9" y1="21" x2="9" y2="9"></line>
					</svg>
					Admin Dashboard
				</a>
			{:else}
				<!-- Remove the login link -->
			{/if}
			<button class="nav-link" on:click={toggleChatbot}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
				</svg>
				Ask AI
			</button>
		</nav>
	</header>

	<main class="main-content">
		<h2 class="section-title">Latest Announcements</h2>

		{#if isLoading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Loading announcements...</p>
			</div>
		{:else if error}
			<div class="error">
				<p>{error}</p>
				<button on:click={loadAnnouncements}>Try Again</button>
			</div>
		{:else if announcements.length === 0}
			<div class="empty">
				<p>No announcements yet.</p>
				{#if isLoggedIn}
					<a href="/admin/announcements" class="create-button">Create First Announcement</a>
				{/if}
			</div>
		{:else}
			<div class="announcements-list">
				{#each announcements as announcement}
					<div class="announcement-card">
						<div class="announcement-content">
							<h2>{announcement.title}</h2>
							<p>{announcement.description}</p>
							<time datetime={announcement.created_at}>
								{formatDate(announcement.created_at)}
							</time>
						</div>
						{#if announcement.image_url}
							<div class="announcement-image">
								<img src={announcement.image_url} alt={announcement.title}>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</main>

	<!-- Fixed chat button for mobile -->
	<button class="mobile-chat-button" on:click={toggleChatbot} aria-label="Open AI Assistant">
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
		</svg>
	</button>

	<!-- Chatbot Modal -->
	<ChatbotModal />
</div>

<style>
	.announcements-container {
		min-height: 100vh;
		padding-bottom: 2rem;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.header {
		background-color: white;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.site-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #4a90e2;
		margin: 0;
	}

	.nav-links {
		display: flex;
		gap: 1rem;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		background: transparent;
		color: #4a5568;
		text-decoration: none;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		transition: all 0.2s;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.nav-link:hover {
		background: #f7fafc;
		color: #4a90e2;
	}
	
	.logout-link {
		background: #f7fafc;
		color: #e53e3e;
	}
	
	.logout-link:hover {
		background: #fff5f5;
		color: #c53030;
	}

	.main-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.section-title {
		text-align: center;
		margin-bottom: 2rem;
		color: #2d3748;
		font-size: 1.75rem;
	}

	.loading,
	.error,
	.empty {
		max-width: 800px;
		margin: 3rem auto;
		padding: 2rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid rgba(74, 144, 226, 0.3);
		border-radius: 50%;
		border-top-color: #4a90e2;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.create-button {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.75rem 1.5rem;
		background: #4a90e2;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
		transition: background 0.2s;
	}

	.create-button:hover {
		background: #357abd;
	}

	.announcements-list {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.announcement-card {
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.announcement-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
	}

	.announcement-content {
		padding: 1.5rem;
		flex: 1;
	}

	.announcement-content h2 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		color: #2d3748;
	}

	.announcement-content p {
		color: #4a5568;
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.announcement-content time {
		color: #718096;
		font-size: 0.875rem;
		display: block;
	}

	.announcement-image {
		width: 200px;
		min-height: 200px;
		background: #f7fafc;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.announcement-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
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
		transition: transform 0.2s, background-color 0.2s;
	}

	.mobile-chat-button:hover {
		transform: scale(1.05);
		background: #357abd;
	}

	@media (max-width: 768px) {
		.header {
			flex-direction: column;
			padding: 1rem;
			gap: 1rem;
		}

		.nav-links {
			width: 100%;
			justify-content: center;
			flex-wrap: wrap;
		}

		.announcement-card {
			flex-direction: column;
		}

		.announcement-image {
			width: 100%;
		}

		.mobile-chat-button {
			display: flex;
		}
	}
</style>
