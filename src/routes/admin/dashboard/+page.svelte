<script lang="ts">
	import { onMount } from 'svelte';
	import dataFetch from '$lib/utils/service';
	import { goto } from '$app/navigation';
	import ChatbotModal from '$lib/components/ChatbotModal.svelte';
	import AnnouncementModal from '$lib/components/AnnouncementModal.svelte';
	import { toggleChatbot } from '$lib/stores/chatbot';

	type Announcement = {
		id: number;
		title: string;
		description: string;
		user_id: number;
		image_url: string | null;
		created_at: string;
		updated_at?: string | null;
		user?: {
			id: number;
			full_name: string;
			email: string;
			role: string;
		};
	};

	let announcements: Announcement[] = [];
	let isLoading = true;
	let error = '';
	let confirmDeleteId: number | null = null;
	let isConfirmDialogOpen = false;
	let editMode = false;
	let imageInput: FileList | null = null;
	let currentUser: { id: number; email: string; role: string } | null = null;
	let selectedAnnouncement: Announcement | null = null;
	let isAnnouncementModalOpen = false;
	let editedAnnouncement = {
		id: null as number | null,
		title: '',
		description: '',
		user_id: null as number | null,
		image_url: null as string | null
	};

	// Get token from localStorage
	const token = localStorage.getItem('token') || '';

	if (!token) {
		goto('/admin/login');
	}

	// Decode JWT token to get user info
	function parseJwt(token: string) {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map(function (c) {
						return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
					})
					.join('')
			);
			return JSON.parse(jsonPayload);
		} catch (e) {
			console.error('Invalid token format');
			return null;
		}
	}

	// Handle logout
	function handleLogout() {
		localStorage.removeItem('token');
		goto('/admin/login');
	}

	// Fetch announcements
	async function loadAnnouncements() {
		isLoading = true;
		error = '';
		try {
			// Get current user information from token
			currentUser = parseJwt(token);
			if (!currentUser) {
				handleLogout();
				return;
			}

			// Fetch only this user's announcements
			const response = await dataFetch(`/api/announcements?userId=${currentUser.id}`, 'GET', null, token);
			announcements = response.data.sort((a: Announcement, b: Announcement) => {
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

	// Delete announcement
	async function deleteAnnouncement(id: number) {
		try {
			await dataFetch(`/api/announcements/${id}`, 'DELETE', null, token);
			// Refresh announcements list
			await loadAnnouncements();
		} catch (err: any) {
			error = err.message || 'Failed to delete announcement.';
			console.error(err);
		} finally {
			closeConfirmDialog();
		}
	}

	// Edit announcement handlers
	function startEditMode(announcement: Announcement) {
		editMode = true;
		editedAnnouncement = {
			id: announcement.id,
			title: announcement.title,
			description: announcement.description,
			user_id: announcement.user_id,
			image_url: announcement.image_url
		};
		imageInput = null;
	}

	function cancelEdit() {
		editMode = false;
		editedAnnouncement = {
			id: null,
			title: '',
			description: '',
			user_id: null,
			image_url: null
		};
		imageInput = null;
	}

	async function updateAnnouncement() {
		if (editedAnnouncement.id === null) return;
		
		try {
			let data;
			let isFormData = false;

			// Check if we need to update the image
			if (imageInput && imageInput.length > 0) {
				isFormData = true;
				const formData = new FormData();
				formData.append('title', editedAnnouncement.title);
				formData.append('description', editedAnnouncement.description);
				formData.append('image', imageInput[0]);
				
				data = formData;
			} else {
				// Regular JSON data without image update
				data = {
					title: editedAnnouncement.title,
					description: editedAnnouncement.description
				};
			}

			await dataFetch(
				`/api/announcements/${editedAnnouncement.id}`,
				'PATCH',
				data,
				token
			);
			
			// Exit edit mode and refresh announcements
			cancelEdit();
			await loadAnnouncements();
		} catch (err: any) {
			error = err.message || 'Failed to update announcement.';
			console.error(err);
		}
	}

	// Confirmation dialog handlers
	function openConfirmDialog(id: number) {
		confirmDeleteId = id;
		isConfirmDialogOpen = true;
	}

	function closeConfirmDialog() {
		isConfirmDialogOpen = false;
		confirmDeleteId = null;
	}

	// Handle delete confirmation
	function handleDelete() {
		if (confirmDeleteId !== null) {
			deleteAnnouncement(confirmDeleteId);
		}
	}

	// Format date
	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}

	// Load announcements on mount
	onMount(async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			goto('/admin/login');
			return;
		}

		// Parse token to get user info
		try {
			const tokenData = JSON.parse(atob(token.split('.')[1]));
			currentUser = {
				id: tokenData.id,
				email: tokenData.email,
				role: tokenData.role
			};
		} catch (e) {
			localStorage.removeItem('token');
			goto('/admin/login');
			return;
		}

		await loadAnnouncements();
	});

	const openAnnouncementModal = (announcement: Announcement) => {
		selectedAnnouncement = announcement;
		isAnnouncementModalOpen = true;
	};

	const closeAnnouncementModal = () => {
		selectedAnnouncement = null;
		isAnnouncementModalOpen = false;
	};

	const fetchAnnouncements = async () => {
		// Placeholder for reapplied function, removing this later
		await loadAnnouncements();
	};
</script>

<div class="dashboard-container">
	<div class="header-actions">
		<a href="/" class="nav-link">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
				<polyline points="9 22 9 12 15 12 15 22"></polyline>
			</svg>
			<span>View Public Page</span>
		</a>
		<a href="/admin/announcements" class="nav-link">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
				<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
			</svg>
			<span>Create New</span>
		</a>
		<button class="nav-link" on:click={toggleChatbot}>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
			<span>AI Assistant</span>
		</button>
		<button class="nav-link logout-link" on:click={handleLogout}>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
				<polyline points="16 17 21 12 16 7"></polyline>
				<line x1="21" y1="12" x2="9" y2="12"></line>
			</svg>
			<span>Logout</span>
		</button>
	</div>

	<div class="dashboard-card">
		<h1>My Announcements</h1>
		<p class="subtitle">Manage your announcements</p>

		{#if isLoading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading announcements...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<p class="error-message">{error}</p>
				<button class="action-button" on:click={loadAnnouncements}>Try Again</button>
			</div>
		{:else if announcements.length === 0}
			<div class="empty-state">
				<p>You haven't created any announcements yet.</p>
				<a href="/admin/announcements" class="action-button">Create Your First Announcement</a>
			</div>
		{:else}
			{#if editMode}
				<div class="edit-form">
					<h2>Edit Announcement</h2>
					
					<div class="form-grid">
						<div class="form-content">
							<div class="form-group">
								<label for="edit-title">Title</label>
								<input
									type="text"
									id="edit-title"
									bind:value={editedAnnouncement.title}
									placeholder="Announcement title"
									required
								/>
							</div>
							<div class="form-group">
								<label for="edit-description">Description</label>
								<textarea
									id="edit-description"
									bind:value={editedAnnouncement.description}
									placeholder="Announcement description"
									rows="6"
									required
								></textarea>
							</div>
							<div class="form-group">
								<label for="edit-image">Update Image (Optional)</label>
								<input
									type="file"
									id="edit-image"
									accept="image/*"
									bind:files={imageInput}
								/>
								<p class="help-text">Leave empty to keep current image</p>
							</div>
						</div>
						
						{#if editedAnnouncement.image_url}
							<div class="image-preview">
								<h3>Current Image</h3>
								<div class="preview-container">
									<img src={editedAnnouncement.image_url} alt={editedAnnouncement.title} />
								</div>
							</div>
						{/if}
					</div>
					
					<div class="edit-actions">
						<button class="cancel-button" on:click={cancelEdit}>Cancel</button>
						<button class="save-button" on:click={updateAnnouncement}>Save Changes</button>
					</div>
				</div>
			{:else}
				<div class="announcements-table-container">
					<table class="announcements-table">
						<thead>
							<tr>
								<th>Title</th>
								<th>Description</th>
								<th>Image</th>
								<th>Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each announcements as announcement}
								<tr class="clickable-row" on:click={() => openAnnouncementModal(announcement)}>
									<td class="title-cell">{announcement.title}</td>
									<td class="description-cell">
										<div class="truncated-text">
											{announcement.description}
										</div>
									</td>
									<td class="image-cell">
										{#if announcement.image_url}
											<div class="thumb-container">
												<img src={announcement.image_url} alt={announcement.title} />
											</div>
										{:else}
											<span class="no-image">No image</span>
										{/if}
									</td>
									<td class="date-cell">{formatDate(announcement.created_at)}</td>
									<td class="actions-cell">
										<button 
											class="edit-button" 
											on:click={() => startEditMode(announcement)}
											title="Edit"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
												<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
											</svg>
										</button>
										<button 
											class="delete-button" 
											on:click={() => openConfirmDialog(announcement.id)}
											title="Delete"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<polyline points="3 6 5 6 21 6"></polyline>
												<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
												<line x1="10" y1="11" x2="10" y2="17"></line>
												<line x1="14" y1="11" x2="14" y2="17"></line>
											</svg>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Confirmation Dialog -->
	{#if isConfirmDialogOpen}
		<div class="confirm-overlay">
			<div class="confirm-dialog">
				<h3>Confirm Deletion</h3>
				<p>Are you sure you want to delete this announcement? This action cannot be undone.</p>
				<div class="confirm-actions">
					<button class="cancel-button" on:click={closeConfirmDialog}>Cancel</button>
					<button class="delete-button" on:click={handleDelete}>
						Delete
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Fixed chat button for mobile -->
	<button class="mobile-chat-button" on:click={toggleChatbot} aria-label="Open AI Assistant">
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
		</svg>
	</button>

	<!-- Chatbot Modal -->
	<ChatbotModal />

	<!-- Add the AnnouncementModal component -->
	{#if isAnnouncementModalOpen && selectedAnnouncement}
		<AnnouncementModal 
			announcement={selectedAnnouncement} 
			isOpen={isAnnouncementModalOpen} 
			on:close={closeAnnouncementModal} 
		/>
	{/if}
</div>

<style>
	.dashboard-container {
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

	.dashboard-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 1200px;
		margin: 0 auto;
	}

	h1 {
		text-align: center;
		margin-bottom: 0.5rem;
		color: #2d3748;
		font-size: 2rem;
	}

	h2 {
		margin-bottom: 1.5rem;
		color: #2d3748;
		font-size: 1.5rem;
	}

	h3 {
		color: #4a5568;
		font-size: 1.1rem;
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.subtitle {
		text-align: center;
		color: #718096;
		margin-bottom: 2rem;
	}

	.loading-state,
	.error-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 0;
	}

	.spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid rgba(74, 144, 226, 0.3);
		border-radius: 50%;
		border-top-color: #4a90e2;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-message {
		color: #e53e3e;
		margin-bottom: 1rem;
	}

	.action-button {
		padding: 0.75rem 1.5rem;
		background: #4a90e2;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
		text-decoration: none;
		display: inline-block;
	}

	.action-button:hover {
		background: #357abd;
	}

	.announcements-table-container {
		overflow-x: auto;
	}

	.announcements-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	.announcements-table th,
	.announcements-table td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}

	.announcements-table th {
		background-color: #f7fafc;
		color: #4a5568;
		font-weight: 600;
	}

	.announcements-table tr {
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.announcements-table tr:hover {
		background-color: #f0f4f8;
	}

	.title-cell {
		font-weight: 500;
		color: #2d3748;
		width: 20%;
	}

	.description-cell {
		width: 35%;
	}

	.image-cell {
		width: 10%;
		text-align: center;
	}

	.thumb-container {
		width: 60px;
		height: 60px;
		overflow: hidden;
		border-radius: 4px;
		margin: 0 auto;
		border: 1px solid #e2e8f0;
	}

	.thumb-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-image {
		color: #a0aec0;
		font-size: 0.8rem;
	}

	.truncated-text {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		max-height: 3rem;
	}

	.date-cell {
		width: 15%;
		white-space: nowrap;
	}

	.actions-cell {
		width: 10%;
		white-space: nowrap;
		text-align: right;
	}

	.edit-button,
	.delete-button {
		padding: 0.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.edit-button {
		color: #4a90e2;
	}

	.edit-button:hover {
		background: rgba(74, 144, 226, 0.1);
	}

	.delete-button {
		color: #e53e3e;
	}

	.delete-button:hover {
		background: rgba(229, 62, 62, 0.1);
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #4a5568;
		font-weight: 500;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 1rem;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
	}

	.help-text {
		margin-top: 0.25rem;
		font-size: 0.875rem;
		color: #718096;
	}

	.image-preview {
		display: flex;
		flex-direction: column;
	}

	.preview-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f7fafc;
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid #e2e8f0;
	}

	.preview-container img {
		max-width: 100%;
		max-height: 300px;
		object-fit: contain;
	}

	.edit-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
	}

	.cancel-button {
		padding: 0.75rem 1.5rem;
		background: #e2e8f0;
		color: #4a5568;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.cancel-button:hover {
		background: #cbd5e0;
	}

	.save-button {
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

	.save-button:hover {
		background: #357abd;
	}

	.confirm-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.confirm-dialog {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		width: 90%;
		max-width: 500px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.confirm-dialog h3 {
		margin-top: 0;
	}

	.confirm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
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

	.clickable-row {
		position: relative;
	}

	.clickable-row:after {
		content: "Click to view details";
		position: absolute;
		bottom: 2px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.7rem;
		color: #4a90e2;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.clickable-row:hover:after {
		opacity: 1;
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
		.dashboard-card {
			padding: 1.5rem;
		}
		.form-grid {
			grid-template-columns: 1fr;
		}
		.mobile-chat-button {
			display: flex;
		}
	}
</style> 