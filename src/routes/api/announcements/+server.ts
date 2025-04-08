import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { json, error } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { verify_token } from '$lib/utils/token';

const UPLOAD_DIR = join(process.cwd(), 'static', 'uploads');

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		// Check if we need to filter by user_id (for multi-user functionality)
		const userId = url.searchParams.get('userId');
		
		let data;
		if (userId) {
			// Convert to number and validate
			const userIdNum = Number(userId);
			if (isNaN(userIdNum)) {
				throw error(400, 'Invalid userId parameter');
			}
			
			// Filter announcements by user_id
			data = await db.select().from(announcements).where(eq(announcements.user_id, userIdNum));
		} else {
			// Return all announcements (for public view)
			data = await db.select().from(announcements);
		}
		
		return json({ data });
	} catch (err) {
		console.error('GET /api/announcements error:', err);
		throw error(500, 'Failed to retrieve announcements. Please try again later.');
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const user = verify_token(request);

	try {
		const formData = await request.formData();

		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString();
		const image = formData.get('image');

		if (!title || !description) {
			throw error(
				400,
				'Missing required fields: title and description must be provided.'
			);
		}

		// Use the user ID from the token
		const user_id = user.id;
		
		let imageUrl = null;
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

			imageUrl = `/uploads/${fileName}`;
		}

		const [newAnnouncement] = await db
			.insert(announcements)
			.values({ title, description, user_id, image_url: imageUrl })
			.returning();

		return json({ success: true, data: newAnnouncement });
	} catch (err: any) {
		console.error('POST /api/announcements error:', err);
		if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			throw error(
				409,
				'An announcement with this title already exists. Please choose a unique title.'
			);
		}
		if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
			throw error(400, 'A required field (title, description, or user_id) is missing or null.');
		}
		if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
			throw error(400, 'Invalid user_id: The specified user does not exist.');
		}
		throw error(500, 'Failed to create announcement. Please try again later.');
	}
};
