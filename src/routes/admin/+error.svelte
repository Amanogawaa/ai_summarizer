<script>
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	// Function to go back to home page
	function goToHome() {
		goto('/');
	}

	// Function to go to login page
	function goToLogin() {
		goto('/admin/login');
	}

	// Function to reload page
	function reloadPage() {
		if (browser) {
			window.location.reload();
		}
	}

	// Check if token might be invalid (401/403 errors)
	let isAuthError = $page.status === 401 || $page.status === 403;
	
	// If we get an auth error and we're in the browser, clear token
	if (isAuthError && browser) {
		localStorage.removeItem('token');
	}
</script>

<div class="error-container">
	<div class="error-content">
		<h1>Oops! Something went wrong</h1>
		
		<div class="error-details">
			<p class="error-code">Error {$page.status}</p>
			<p class="error-message">{$page.error?.message || 'An unexpected error occurred'}</p>
		</div>

		<p class="help-text">
			{#if isAuthError}
				Your session may have expired. Please try logging in again.
			{:else if $page.status === 500}
				The server encountered an internal error. Please try again later.
			{:else if $page.status === 404}
				The page you're looking for doesn't exist.
			{:else}
				Please try again or contact support if the problem persists.
			{/if}
		</p>

		<div class="action-buttons">
			<button class="action-button" on:click={goToHome}>Go to Home</button>
			
			{#if isAuthError}
				<button class="action-button primary" on:click={goToLogin}>Login Again</button>
			{:else}
				<button class="action-button primary" on:click={reloadPage}>Try Again</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background-color: #f8f9fa;
		padding: 0 16px;
	}

	.error-content {
		max-width: 600px;
		text-align: center;
		background: white;
		padding: 40px;
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin-top: 0;
		color: #333;
		font-size: 28px;
		margin-bottom: 20px;
	}

	.error-details {
		background-color: #f8f9fa;
		padding: 16px;
		border-radius: 6px;
		margin-bottom: 20px;
	}

	.error-code {
		font-size: 18px;
		font-weight: bold;
		margin: 0;
		color: #e63946;
	}

	.error-message {
		margin: 10px 0 0;
		color: #555;
	}

	.help-text {
		margin-bottom: 30px;
		color: #666;
		line-height: 1.5;
	}

	.action-buttons {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.action-button {
		padding: 10px 20px;
		border: none;
		border-radius: 4px;
		font-size: 16px;
		cursor: pointer;
		background-color: #f1f3f5;
		color: #495057;
		transition: background-color 0.2s, transform 0.1s;
	}

	.action-button:hover {
		background-color: #e9ecef;
		transform: translateY(-1px);
	}

	.action-button.primary {
		background-color: #4361ee;
		color: white;
	}

	.action-button.primary:hover {
		background-color: #3a56d4;
	}
</style> 