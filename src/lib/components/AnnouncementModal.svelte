<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import dataFetch from '$lib/utils/service';
	import SentimentAnalysisModal from './SentimentAnalysisModal.svelte';
	import SummaryModal from './SummaryModal.svelte';

	export let announcement: {
		id: number;
		title: string;
		description: string;
		user_id: number;
		image_url: string | null;
		created_at: string;
		user?: {
			id: number;
			full_name: string;
			email: string;
			role: string;
		};
	} | null = null;

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let isSentimentModalOpen = false;
	let sentimentResult: {
		sentiment: string;
		score: number;
		analysis: string;
	} | null = null;
	let isAnalyzing = false;

	let isSummaryModalOpen = false;
	let summaryResult: string | null = null;
	let isSummarizing = false;

	// Close modal on escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			close();
		}
	}

	// Close modal
	function close() {
		dispatch('close');
	}

	// Format date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}

	// Analyze sentiment
	async function analyzeSentiment() {
		if (!announcement) return;

		isAnalyzing = true;
		try {
			const response = await dataFetch('/api/chatbot/sentiment', 'POST', {
				text: `${announcement.title}\n\n${announcement.description}`
			});

			sentimentResult = response;
			isSentimentModalOpen = true;
		} catch (error) {
			console.error('Error analyzing sentiment:', error);
		} finally {
			isAnalyzing = false;
		}
	}

	function closeSentimentModal() {
		isSentimentModalOpen = false;
	}

	// Generate summary
	async function generateSummary() {
		if (!announcement) return;

		isSummarizing = true;
		try {
			const response = await dataFetch('/api/chatbot/summarize', 'POST', {
				text: `${announcement.title}\n\n${announcement.description}`
			});

			summaryResult = response.summary;
			isSummaryModalOpen = true;
		} catch (error) {
			console.error('Error generating summary:', error);
		} finally {
			isSummarizing = false;
		}
	}

	function closeSummaryModal() {
		isSummaryModalOpen = false;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen && announcement}
	<div
		class="modal-overlay"
		on:click={close}
		on:keydown={handleKeydown}
		role="dialog"
		aria-modal="true"
	>
		<div class="modal-container" on:click|stopPropagation>
			<button class="close-button" on:click={close} aria-label="Close modal">
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
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>

			<div class="modal-content">
				<h2>{announcement.title}</h2>

				<div class="announcement-meta">
					<time datetime={announcement.created_at}>
						{formatDate(announcement.created_at)}
					</time>
					{#if announcement.user}
						<span class="author">Posted by {announcement.user.full_name}</span>
					{/if}
				</div>

				{#if announcement.image_url}
					<div class="announcement-image">
						<img src={announcement.image_url} alt={announcement.title} />
					</div>
				{/if}

				<div class="announcement-description">
					<p>{announcement.description}</p>
				</div>

				<div class="action-buttons">
					<button class="summary-button" on:click={generateSummary} disabled={isSummarizing}>
						{#if isSummarizing}
							<div class="spinner"></div>
						{:else}
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
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
								<polyline points="14 2 14 8 20 8"></polyline>
								<line x1="16" y1="13" x2="8" y2="13"></line>
								<line x1="16" y1="17" x2="8" y2="17"></line>
								<polyline points="10 9 9 9 8 9"></polyline>
							</svg>
							TL;DR
						{/if}
					</button>
					<button class="sentiment-button" on:click={analyzeSentiment} disabled={isAnalyzing}>
						{#if isAnalyzing}
							<div class="spinner"></div>
						{:else}
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
								<path
									d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
								></path>
							</svg>
							Analyze Sentiment
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<SentimentAnalysisModal
	bind:isOpen={isSentimentModalOpen}
	{sentimentResult}
	on:close={closeSentimentModal}
/>

<SummaryModal
	bind:isOpen={isSummaryModalOpen}
	summary={summaryResult}
	on:close={closeSummaryModal}
/>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-container {
		background-color: white;
		border-radius: 8px;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		position: relative;
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.close-button {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: transparent;
		border: none;
		color: #4a5568;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s;
		z-index: 10;
	}

	.close-button:hover {
		background-color: #f7fafc;
		color: #e53e3e;
	}

	.modal-content {
		padding: 2rem;
	}

	h2 {
		font-size: 1.8rem;
		color: #2d3748;
		margin-top: 0;
		margin-bottom: 1.5rem;
	}

	.announcement-image {
		margin-bottom: 1.5rem;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		max-height: 300px;
	}

	.announcement-image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		max-height: 300px;
	}

	.announcement-description {
		font-size: 1.1rem;
		line-height: 1.7;
		color: #4a5568;
		margin-bottom: 1.5rem;
		white-space: pre-line;
	}

	.announcement-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		color: #718096;
		font-size: 0.9rem;
	}

	.author {
		color: #4a90e2;
		font-weight: 500;
	}

	.action-buttons {
		margin-top: 1.5rem;
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}

	.summary-button,
	.sentiment-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: #4a90e2;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.summary-button:hover:not(:disabled),
	.sentiment-button:hover:not(:disabled) {
		background: #357abd;
	}

	.summary-button:disabled,
	.sentiment-button:disabled {
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

	@media (max-width: 768px) {
		.modal-container {
			max-width: 95%;
		}

		.modal-content {
			padding: 1.5rem;
		}

		.announcement-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.action-buttons {
			flex-direction: column;
			gap: 0.5rem;
		}

		.summary-button,
		.sentiment-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
