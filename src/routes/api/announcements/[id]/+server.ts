import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { json, error } from '@sveltejs/kit';
import { writeFile, unlink } from 'fs/promises';
import { eq } from 'drizzle-orm';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { verify_token } from '$lib/utils/token';

const UPLOAD_DIR = join(process.cwd(), 'static', 'uploads');

export const PUT: RequestHandler = async ({ request, params }) => {
	const user = verify_token(request);

	try {
		const formData = await request.formData();

		const id = Number(formData.get('id'));
		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString();
		const user_id = Number(formData.get('user_id'));
		const image = formData.get('image');

		if (!id || isNaN(id)) {
			throw error(400, 'Invalid or missing announcement ID.');
		}

		const existing = await db.query.announcements.findFirst({
			where: eq(announcements.id, id)
		});

		if (!existing) {
			throw error(404, 'Announcement not found.');
		}

		let imageUrl = existing.image_url;

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

		const updatedAnnouncement = await db
			.update(announcements)
			.set({ title, description, user_id, image_url: imageUrl })
			.where(eq(announcements.id, id))
			.returning();

		return json({ success: true, data: updatedAnnouncement[0] });
	} catch (err: any) {
		console.error('PATCH /api/announcements error:', err);
		if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
			throw error(400, 'Invalid user_id: The specified user does not exist.');
		}
		throw error(500, 'Failed to update announcement. Please try again later.');
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = Number(params.id);
		await db.delete(announcements).where(eq(announcements.id, id));
		return json({ success: true });
	} catch (err: any) {
		if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
			throw error(400, 'A required field is missing or null');
		}
		throw error(500, 'Failed to create user');
	}
};
