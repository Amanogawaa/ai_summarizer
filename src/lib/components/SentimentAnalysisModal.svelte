<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let isOpen = false;
	export let sentimentResult: {
		sentiment: string;
		score: number;
		analysis: string;
	} | null = null;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			close();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen && sentimentResult}
	<div class="modal-overlay" on:click={close} on:keydown={handleKeydown} role="dialog" aria-modal="true">
		<div class="modal-container" on:click|stopPropagation transition:fly={{ y: 20, duration: 300 }}>
			<button class="close-button" on:click={close} aria-label="Close modal">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>

			<div class="modal-content">
				<h2>Sentiment Analysis</h2>
				
				<div class="sentiment-score">
					<div class="score-circle" style="--score: {sentimentResult.score}">
						<span class="score-value">{Math.round(sentimentResult.score * 100)}%</span>
						<span class="score-label">{sentimentResult.sentiment}</span>
					</div>
				</div>

				<div class="analysis-text">
					<p>{sentimentResult.analysis}</p>
				</div>
			</div>
		</div>
	</div>
{/if}

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
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		position: relative;
		width: 100%;
		max-width: 500px;
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
		transition: background-color 0.2s, color 0.2s;
		z-index: 10;
	}

	.close-button:hover {
		background-color: #f7fafc;
		color: #e53e3e;
	}

	.modal-content {
		padding: 2rem;
		text-align: center;
	}

	h2 {
		font-size: 1.8rem;
		color: #2d3748;
		margin-top: 0;
		margin-bottom: 2rem;
	}

	.sentiment-score {
		margin-bottom: 2rem;
	}

	.score-circle {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		background: conic-gradient(
			#4a90e2 0% calc(var(--score) * 100%),
			#e2e8f0 calc(var(--score) * 100%) 100%
		);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		position: relative;
	}

	.score-circle::before {
		content: '';
		position: absolute;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: white;
	}

	.score-value {
		font-size: 2rem;
		font-weight: bold;
		color: #2d3748;
		position: relative;
		z-index: 1;
	}

	.score-label {
		font-size: 1rem;
		color: #4a5568;
		position: relative;
		z-index: 1;
		margin-top: 0.5rem;
	}

	.analysis-text {
		background: #f7fafc;
		padding: 1.5rem;
		border-radius: 8px;
		text-align: left;
	}

	.analysis-text p {
		margin: 0;
		line-height: 1.6;
		color: #4a5568;
	}

	@media (max-width: 768px) {
		.modal-container {
			max-width: 95%;
		}

		.modal-content {
			padding: 1.5rem;
		}
	}
</style> 