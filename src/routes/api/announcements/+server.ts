import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { json, error } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';

const UPLOAD_DIR = join(process.cwd(), 'static', 'uploads');

export const GET: RequestHandler = async () => {
	try {
		const data = await db.select().from(announcements);
		return json({ data });
	} catch (err) {
		console.error('GET /api/announcements error:', err);
		throw error(500, 'Failed to retrieve announcements. Please try again later.');
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();

		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString();
		const user_id = Number(formData.get('user_id'));
		const image = formData.get('image');

		if (!title || !description || !user_id) {
			throw error(
				400,
				'Missing required fields: title, description, and user_id must all be provided.'
			);
		}
		if (isNaN(user_id)) {
			throw error(400, 'Invalid user_id: Must be a number.');
		}

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
