<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import dataFetch from '$lib/utils/service';
	import { fade, fly } from 'svelte/transition';
	import { isChatbotOpen, closeChatbot } from '$lib/stores/chatbot';

	type Message = {
		role: 'user' | 'assistant';
		content: string;
		timestamp: Date;
	};

	let messages: Message[] = [];
	let newMessage = '';
	let isProcessing = false;
	let chatContainer: HTMLElement;
	let autoScroll = true;

	// Load initial greeting message from the bot
	onMount(() => {
		messages = [
			{
				role: 'assistant',
				content: 'Hello! I\'m an AI assistant powered by Llama 3.1. I can help you get information about announcements and users from the database. How can I help you today?',
				timestamp: new Date()
			}
		];
	});

	// Scroll to bottom when messages update
	function scrollToBottom() {
		if (chatContainer && autoScroll) {
			chatContainer.scrollTo({
				top: chatContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	// Use afterUpdate to ensure scrolling happens after the DOM is updated
	afterUpdate(scrollToBottom);

	// Check if user has manually scrolled up (don't auto-scroll if they're reading history)
	function handleScroll() {
		if (!chatContainer) return;
		
		const distanceFromBottom = chatContainer.scrollHeight - chatContainer.clientHeight - chatContainer.scrollTop;
		// If user is more than 100px from bottom, disable auto-scroll
		autoScroll = distanceFromBottom < 100;
	}

	async function sendMessage() {
		if (!newMessage.trim() || isProcessing) return;

		// Add user message to the chat
		const userMessage: Message = {
			role: 'user',
			content: newMessage,
			timestamp: new Date()
		};
		
		messages = [...messages, userMessage];
		
		// Re-enable auto-scroll when sending a new message
		autoScroll = true;
		
		// Clear input field
		const userQuery = newMessage;
		newMessage = '';
		isProcessing = true;
		
		try {
			// Show typing indicator
			messages = [...messages, {
				role: 'assistant',
				content: '...',
				timestamp: new Date()
			}];
			
			// Call API to get response from Llama 3.1
			const response = await dataFetch('/api/chatbot', 'POST', {
				query: userQuery,
				history: messages.slice(0, -1).map(msg => ({
					role: msg.role,
					content: msg.content
				}))
			});
			
			// Remove typing indicator and add actual response
			messages = [...messages.slice(0, -1), {
				role: 'assistant',
				content: response.message,
				timestamp: new Date()
			}];
		} catch (error) {
			// Remove typing indicator and add error message
			messages = [...messages.slice(0, -1), {
				role: 'assistant',
				content: 'Sorry, I encountered an error processing your request. Please try again.',
				timestamp: new Date()
			}];
			console.error('Chatbot error:', error);
		} finally {
			isProcessing = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		} else if (e.key === 'Escape') {
			closeChatbot();
		}
	}

	// Handle click outside to close modal
	function handleOutsideClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('modal-overlay')) {
			closeChatbot();
		}
	}
</script>

{#if $isChatbotOpen}
<div class="modal-overlay" on:click={handleOutsideClick} transition:fade={{ duration: 200 }}>
	<div class="modal-container" transition:fly={{ y: 20, duration: 300 }}>
		<div class="modal-header">
			<h2>AI Database Assistant</h2>
			<button class="close-button" on:click={closeChatbot} aria-label="Close dialog">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>

		<div class="chat-window" bind:this={chatContainer} on:scroll={handleScroll}>
			{#each messages as message}
				<div class="message {message.role}">
					<div class="message-content">
						{#if message.content === '...'}
							<div class="typing-indicator">
								<span></span>
								<span></span>
								<span></span>
							</div>
						{:else}
							{@html message.content.replace(/\n/g, '<br>')}
						{/if}
					</div>
					<div class="message-timestamp">
						{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</div>
				</div>
			{/each}
		</div>

		<div class="input-container">
			<textarea
				bind:value={newMessage}
				on:keydown={handleKeyDown}
				placeholder="Ask about your announcements and users..."
				disabled={isProcessing}
				rows="2"
			></textarea>
			<button on:click={sendMessage} disabled={isProcessing || !newMessage.trim()}>
				{#if isProcessing}
					<div class="spinner"></div>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="22" y1="2" x2="11" y2="13"></line>
						<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
					</svg>
				{/if}
			</button>
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
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-container {
		width: 100%;
		max-width: 800px;
		height: 80vh;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		background: #4a90e2;
		color: white;
	}

	h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.close-button {
		background: transparent;
		border: none;
		color: white;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.chat-window {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		scroll-behavior: smooth;
	}

	.message {
		max-width: 80%;
		padding: 1rem;
		border-radius: 12px;
		position: relative;
	}

	.message.user {
		align-self: flex-end;
		background: #4a90e2;
		color: white;
		border-bottom-right-radius: 0;
	}

	.message.assistant {
		align-self: flex-start;
		background: #f1f5f9;
		color: #333;
		border-bottom-left-radius: 0;
	}

	.message-content {
		margin-bottom: 0.5rem;
		word-break: break-word;
		line-height: 1.5;
	}

	.message-timestamp {
		font-size: 0.75rem;
		opacity: 0.7;
		text-align: right;
	}

	.typing-indicator {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem 0;
	}

	.typing-indicator span {
		width: 0.5rem;
		height: 0.5rem;
		background: #ccc;
		border-radius: 50%;
		animation: typing 1.5s infinite ease-in-out;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-indicator span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing {
		0%, 60%, 100% {
			transform: translateY(0);
		}
		30% {
			transform: translateY(-6px);
		}
	}

	.input-container {
		display: flex;
		padding: 1rem;
		border-top: 1px solid #e2e8f0;
		background: white;
		gap: 0.5rem;
	}

	textarea {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 1rem;
		resize: none;
		min-height: 50px;
		font-family: inherit;
	}

	textarea:focus {
		outline: none;
		border-color: #4a90e2;
	}

	button {
		padding: 0.5rem;
		background: #4a90e2;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 45px;
		height: 45px;
		transition: background 0.2s;
	}

	button:hover:not(:disabled) {
		background: #357abd;
	}

	button:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.spinner {
		width: 1.5rem;
		height: 1.5rem;
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
			height: 90vh;
		}
		.message {
			max-width: 85%;
		}
	}
</style> 