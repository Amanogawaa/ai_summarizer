<script lang="ts">
	import dataFetch from '$lib/utils/service';
	import { onMount } from 'svelte';
	import ChatbotModal from '$lib/components/ChatbotModal.svelte';
	import AnnouncementModal from '$lib/components/AnnouncementModal.svelte';
	import { toggleChatbot } from '$lib/stores/chatbot';
	import { goto } from '$app/navigation';

	type User = {
		id: number;
		full_name: string;
		email: string;
		role: string;
	};

	type Announcement = {
		id: number;
		title: string;
		description: string;
		user_id: number;
		image_url: string | null;
		created_at: string;
		user?: User;
	};

	let announcements: Announcement[] = [];
	let users: Record<number, User> = {};
	let isLoading = true;
	let error = '';
	let isLoggedIn = false;
	let selectedAnnouncement: Announcement | null = null;
	let isAnnouncementModalOpen = false;

	// Fetch existing announcements
	async function loadData() {
		isLoading = true;
		error = '';
		try {
			// Load all announcements
			const announcementsResponse = await dataFetch('/api/announcements', 'GET');

			// Load all users (will only work if logged in with token)
			try {
				const token = localStorage.getItem('token');
				if (token) {
					const usersResponse = await dataFetch('/api/auth', 'GET', null, token);
					// Create a map of user IDs to user objects
					users = usersResponse.data.reduce((acc: Record<number, User>, user: User) => {
						acc[user.id] = user;
						return acc;
					}, {});
				}
			} catch (err) {
				console.warn('Could not load users, continuing without user data');
			}

			// Sort announcements by date (newest first)
			announcements = announcementsResponse.data.sort((a: Announcement, b: Announcement) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();
				return dateB - dateA;
			});

			// Add user data to each announcement if available
			announcements = announcements.map((announcement) => {
				if (users[announcement.user_id]) {
					return {
						...announcement,
						user: users[announcement.user_id]
					};
				}
				return announcement;
			});
		} catch (err: any) {
			error = err.message || 'Failed to load announcements. Please try again later.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Open announcement modal
	function openAnnouncementModal(announcement: Announcement) {
		selectedAnnouncement = announcement;
		isAnnouncementModalOpen = true;
	}

	// Close announcement modal
	function closeAnnouncementModal() {
		isAnnouncementModalOpen = false;
		selectedAnnouncement = null;
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

		loadData();
	});

	// Format date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}
</script>

<div class="announcements-container">
	<header class="header">
		<h1 class="site-title">Announcements</h1>
		<nav class="nav-links">
			{#if isLoggedIn}
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
					Admin Dashboard
				</a>
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
					Logout
				</button>
			{:else}
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
					Login
				</a>
			{/if}
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
				<button on:click={loadData}>Try Again</button>
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
				<div
					class="announcement-card"
					on:click={() => openAnnouncementModal(announcement)}
					on:keypress={(e) => e.key === 'Enter' && openAnnouncementModal(announcement)}
					tabindex="0"
					role="button"
					aria-label="View announcement: {announcement.title}"
				>
					{#if announcement.image_url}
						<div class="announcement-image">
							<img src={announcement.image_url} alt={announcement.title} />
						</div>
					{/if}
		
					<div class="announcement-content">
						<h2>{announcement.title}</h2>
						<p class="announcement-excerpt">
							{announcement.description.length > 150
								? announcement.description.slice(0, 150) + '...'
								: announcement.description}
						</p>
						<div class="announcement-meta">
							<time datetime={announcement.created_at}>
								{formatDate(announcement.created_at)}
							</time>
							{#if announcement.user}
								<span class="author">Posted by {announcement.user.full_name}</span>
							{/if}
						</div>
						<div class="read-more">Click to read more</div>
					</div>
				</div>
			{/each}
		</div>
		
		{/if}
	</main>

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

	<!-- Announcement Modal -->
	<AnnouncementModal
		announcement={selectedAnnouncement}
		isOpen={isAnnouncementModalOpen}
		on:close={closeAnnouncementModal}
	/>

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
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 1.5rem;
}



.announcement-card {
	background: white;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	transition: transform 0.2s, box-shadow 0.2s;
	cursor: pointer;
	position: relative;
	width: calc(50% - 0.75rem); 
}


.announcement-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.announcement-card:focus {
	outline: none;
	box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.5), 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* IMAGE AS TOP HEADER */
.announcement-image {
	width: 100%;
	height: 180px;
	background: #f7fafc;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.announcement-image img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

/* CARD CONTENT */
.announcement-content {
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	flex: 1;
}

.announcement-content h2 {
	margin: 0 0 0.5rem 0;
	color: #2d3748;
	font-size: 1.25rem;
}

.announcement-excerpt {
	color: #4a5568;
	margin-bottom: 1rem;
	line-height: 1.6;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.announcement-meta {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.25rem;
	color: #718096;
	font-size: 0.85rem;
	line-height: 1.4;
	margin-top: auto;
	padding-top: 1rem;
	border-top: 1px solid #edf2f7;
}

.author {
	color: #4a90e2;
	font-weight: 500;
}

.read-more {
	color: #4a90e2;
	font-size: 0.85rem;
	font-weight: 600;
	margin-top: 1rem;
	text-decoration: underline;
	cursor: pointer;
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

		.announcement-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.mobile-chat-button {
			display: flex;
		}
	}
</style>
