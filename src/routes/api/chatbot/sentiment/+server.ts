import { json } from '@sveltejs/kit';
import dataFetch from '$lib/utils/service';

export async function POST({ request }) {
	try {
		const { text } = await request.json();

		if (!text) {
			return json({ error: 'Text is required' }, { status: 400 });
		}

		// Call the chatbot API with a specific prompt for sentiment analysis
		const response = await dataFetch('/api/chatbot', 'POST', {
			query: `Analyze the sentiment of this text and provide a precise analysis. Consider:
1. Overall sentiment (very positive, positive, slightly positive, neutral, slightly negative, negative, very negative)
2. Brief reason (1-2 sentences)
3. Score (0-100, where 0 is extremely negative and 100 is extremely positive)

Text: "${text}"

Be precise in your sentiment assessment and score.`,
			history: []
		});

		// Parse the chatbot's response to extract sentiment information
		const sentimentResponse = response.message;
		
		// Extract sentiment and score using more sophisticated pattern matching
		const sentimentMatch = sentimentResponse.match(/sentiment:\s*(very positive|positive|slightly positive|neutral|slightly negative|negative|very negative)/i);
		const scoreMatch = sentimentResponse.match(/score:\s*(\d+)/i);
		
		let sentiment = 'Neutral';
		let score = 0.5;
		
		if (sentimentMatch) {
			const rawSentiment = sentimentMatch[1].toLowerCase();
			// Convert detailed sentiment to basic sentiment for display
			sentiment = rawSentiment.includes('positive') ? 'Positive' :
				rawSentiment.includes('negative') ? 'Negative' : 'Neutral';
			
			// Set score based on detailed sentiment
			switch (rawSentiment) {
				case 'very positive':
					score = 0.95;
					break;
				case 'positive':
					score = 0.8;
					break;
				case 'slightly positive':
					score = 0.65;
					break;
				case 'neutral':
					score = 0.5;
					break;
				case 'slightly negative':
					score = 0.35;
					break;
				case 'negative':
					score = 0.2;
					break;
				case 'very negative':
					score = 0.05;
					break;
			}
		}
		
		if (scoreMatch) {
			const rawScore = parseInt(scoreMatch[1]);
			// Convert 0-100 score to 0-1 range
			score = rawScore / 100;
			
			// Ensure score aligns with sentiment
			if (sentiment === 'Negative' && score > 0.4) {
				score = Math.min(0.3, score); // Cap negative sentiment scores
			} else if (sentiment === 'Positive' && score < 0.6) {
				score = Math.max(0.7, score); // Ensure positive sentiment has higher scores
			}
		}

		// Extract the brief reason
		const reasonMatch = sentimentResponse.match(/reason:\s*([^.]+\.?[^.]*\.?)/i);
		const briefAnalysis = reasonMatch ? reasonMatch[1].trim() : 'No specific reason provided.';

		// Final validation to ensure consistency
		if (sentiment === 'Negative' && score > 0.4) {
			score = 0.2; // Force lower score for negative sentiment
		} else if (sentiment === 'Positive' && score < 0.6) {
			score = 0.8; // Force higher score for positive sentiment
		}

		return json({
			sentiment,
			score,
			analysis: briefAnalysis
		});
	} catch (error) {
		console.error('Error in sentiment analysis:', error);
		return json({ error: 'Failed to analyze sentiment' }, { status: 500 });
	}
} 