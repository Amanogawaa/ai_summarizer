import { json } from '@sveltejs/kit';
import dataFetch from '$lib/utils/service';

export async function POST({ request }) {
	try {
		const { text } = await request.json();

		if (!text) {
			return json({ error: 'Text is required' }, { status: 400 });
		}

		// Call the chatbot API with a specific prompt for summarization
		const response = await dataFetch('/api/chatbot', 'POST', {
			query: `Please provide a concise summary (TL;DR) of the following text. Focus on the key points and main ideas. The text is: "${text}"`,
			history: []
		});

		return json({
			summary: response.message
		});
	} catch (error) {
		console.error('Error in summarization:', error);
		return json({ error: 'Failed to generate summary' }, { status: 500 });
	}
} 