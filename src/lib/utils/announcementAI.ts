import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Announcement } from '$lib/types';

/**
 * Analyzes the sentiment of an announcement using the chatbot
 * @param announcement The announcement to analyze
 * @returns Promise with sentiment analysis results
 */
export async function analyzeAnnouncementSentiment(announcement: Announcement) {
    try {
        const response = await fetch('/api/chatbot/sentiment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: `${announcement.title}\n\n${announcement.description}`
            })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze sentiment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error analyzing announcement sentiment:', error);
        throw error;
    }
}

/**
 * Gets a specific announcement by ID
 * @param id The announcement ID
 * @returns Promise with the announcement or null if not found
 */
export async function getAnnouncementById(id: number): Promise<Announcement | null> {
    try {
        const [announcement] = await db
            .select()
            .from(announcements)
            .where(eq(announcements.id, id))
            .limit(1);

        return announcement || null;
    } catch (error) {
        console.error('Error fetching announcement:', error);
        throw error;
    }
}

/**
 * Formats the announcement text for analysis
 * @param announcement The announcement to format
 * @returns Formatted text string
 */
export function formatAnnouncementForAnalysis(announcement: Announcement): string {
    return `${announcement.title}\n\n${announcement.description}`;
} 