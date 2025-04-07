import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user, announcements } from '$lib/server/db/schema';
import axios from 'axios';

// Define message interface
interface ChatMessage {
    role: string;
    content: string;
}

// Llama 3.1 API endpoint (local)
const LLAMA_API_URL = 'http://localhost:11434/api/generate'; 

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { query, history } = body;

        if (!query) {
            throw error(400, 'Query is required');
        }

        // Fetch data from the database to provide to the model
        const [dbUsers, dbAnnouncements] = await Promise.all([
            db.select({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }).from(user),
            db.select().from(announcements)
        ]);

        // Format the database content for the context
        const dbContext = JSON.stringify({
            users: dbUsers.map(u => ({
                id: u.id,
                full_name: u.full_name,
                email: u.email,
                role: u.role,
                created_at: u.created_at
            })),
            announcements: dbAnnouncements.map(a => ({
                id: a.id,
                title: a.title,
                description: a.description,
                user_id: a.user_id,
                image_url: a.image_url,
                created_at: a.created_at,
                updated_at: a.updated_at
            }))
        });

        // Create a system prompt for the model
        const systemPrompt = `You are an AI assistant powered by Llama 3.1 that helps users get information about announcements and users from a database. 
Here is the current database content in JSON format:
${dbContext}

Your task is to:
1. Answer questions about announcements (titles, descriptions, dates, etc.)
2. Answer questions about users (names, emails, roles, etc.)
3. Summarize database content when asked
4. Generate insights about the data when requested
5. Stay factual and only report information that exists in the provided database
6. Be helpful, concise, and professional
7. If you don't know the answer or it's not in the database, say so politely

DO NOT make up information that is not in the database. If the user asks for information outside the database, politely explain that you can only provide information from the database.`;

        // Create conversation history for the model
        const formattedHistory = history.map((msg: ChatMessage) => ({
            role: msg.role,
            content: msg.content
        }));

        // Prepare the prompt for Llama 3.1
        const prompt = `<|system|>
${systemPrompt}
</s>
${formattedHistory.map((msg: ChatMessage) => `<|${msg.role}|>
${msg.content}
</s>`).join('\n')}
<|user|>
${query}
</s>
<|assistant|>`;

        try {
            // Call the local Llama 3.1 API
            const response = await axios.post(LLAMA_API_URL, {
                model: "llama3.1:latest",
                prompt: prompt,
                stream: false,
                temperature: 0.7,
                max_tokens: 2000
            });

            return json({ message: response.data.response.trim() });
        } catch (llamaError: any) {
            console.error('Error calling Llama API:', llamaError);
            
            // Fallback response if Llama API fails
            return json({ 
                message: "I'm sorry, I'm having trouble connecting to my AI backend right now. Please try again later." 
            });
        }
    } catch (err: any) {
        console.error('Chatbot API error:', err);
        throw error(500, err.message || 'An error occurred with the chatbot service');
    }
}; 