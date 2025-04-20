import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { json, error } from '@sveltejs/kit';
import { writeFile, unlink } from 'fs/promises';
import { eq, and } from 'drizzle-orm';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { verify_token } from '$lib/utils/token';

const UPLOAD_DIR = join(process.cwd(), 'static', 'uploads');

export const PATCH: RequestHandler = async ({ request, params }) => {
	const user = verify_token(request);

	try {
		const id = Number(params.id);
		if (!id || isNaN(id)) {
			throw error(400, 'Invalid announcement ID.');
		}

		// Find the announcement and verify ownership
		const existing = await db.query.announcements.findFirst({
			where: eq(announcements.id, id)
		});

		if (!existing) {
			throw error(404, 'Announcement not found.');
		}

		// Verify the user owns this announcement
		if (existing.user_id !== user.id) {
			throw error(403, 'Forbidden: You do not have permission to modify this announcement.');
		}

		let title: string | null = null;
		let description: string | null = null;
		let image: File | null = null;
		let imageUrl = existing.image_url;

		// Check content type to determine how to parse the request
		const contentType = request.headers.get('content-type') || '';
		
		if (contentType.includes('application/json')) {
			// Parse JSON request
			const jsonData = await request.json();
			title = jsonData.title;
			description = jsonData.description;
		} else {
			// Parse FormData request
			const formData = await request.formData();
			title = formData.get('title')?.toString() || null;
			description = formData.get('description')?.toString() || null;
			image = formData.get('image') as File | null;
		}

		if (!title || !description) {
			throw error(400, 'Title and description are required.');
		}

		if (image && image instanceof File) {
			if (!image.type.startsWith('image/')) {
				throw error(400, 'Only image files are allowed.');
			}

			const MAX_SIZE = 5 * 1024 * 1024;
			if (image.size > MAX_SIZE) {
				throw error(400, 'Image size exceeds 5MB limit.');
			}

			const fileExtension = image.name.split('.').pop();
			const fileName = `${crypto.randomUUID()}.${fileExtension}`;
			const filePath = join(UPLOAD_DIR, fileName);

			const buffer = Buffer.from(await image.arrayBuffer());
			await writeFile(filePath, buffer);

			if (existing.image_url) {
				const oldImagePath = join(process.cwd(), 'static', existing.image_url);
				try {
					await unlink(oldImagePath);
				} catch (err) {
					console.warn('Failed to delete old image:', err);
				}
			}

			imageUrl = `/uploads/${fileName}`;
		}

		// Update the announcement (user_id remains the same)
		const updatedAnnouncement = await db
			.update(announcements)
			.set({ 
				title, 
				description, 
				image_url: imageUrl,
				updated_at: Math.floor(Date.now() / 1000) 
			})
			.where(eq(announcements.id, id))
			.returning();

		return json({ success: true, data: updatedAnnouncement[0] });
	} catch (err: any) {
		console.error('PATCH /api/announcements error:', err);
		if (err.status) {
			throw err; // Rethrow HTTP errors
		}
		throw error(500, 'Failed to update announcement. Please try again later.');
	}
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	try {
		const user = verify_token(request);
		const id = Number(params.id);
		
		if (!id || isNaN(id)) {
			throw error(400, 'Invalid announcement ID.');
		}
		
		// Find the announcement first
		const existing = await db.query.announcements.findFirst({
			where: eq(announcements.id, id)
		});
		
		if (!existing) {
			throw error(404, 'Announcement not found.');
		}
		
		// Verify the user owns this announcement
		if (existing.user_id !== user.id) {
			throw error(403, 'Forbidden: You do not have permission to delete this announcement.');
		}
		
		// Delete the announcement
		await db.delete(announcements).where(eq(announcements.id, id));
		
		// Delete the image if it exists
		if (existing.image_url) {
			const imagePath = join(process.cwd(), 'static', existing.image_url);
			try {
				await unlink(imagePath);
			} catch (err) {
				console.warn('Failed to delete image file:', err);
			}
		}
		
		return json({ success: true });
	} catch (err: any) {
		console.error('DELETE /api/announcements error:', err);
		if (err.status) {
			throw err; // Rethrow HTTP errors
		}
		throw error(500, 'Failed to delete announcement. Please try again later.');
	}
};
