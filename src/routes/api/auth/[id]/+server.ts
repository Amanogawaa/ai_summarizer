import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';
import { hash } from 'bcrypt';

export const PUT: RequestHandler = async ({ request, params }) => {
	try {
		const { id } = params;
		const body = await request.json();
		const { full_name, email, password } = body;

		const user_id = Number(id);

		if (isNaN(user_id)) throw error(400, 'invalid id');

		const [exisiting_user] = await db.select().from(user).where(eq(user.id, user_id)).limit(1);

		if (!exisiting_user) throw error(404, 'user not found');

		const update_data = {};
		if (full_name !== undefined) update_data.full_name = full_name;
		if (email !== undefined) update_data.email = email;
		if (password !== undefined) update_data.hash_password = await hash(password, 10);

		if (Object.keys(update_data).length === 0) {
			throw error(400, 'No fields provided to update');
		}

		const [updatedUser] = await db
			.update(user)
			.set(update_data)
			.where(eq(user.id, user_id))
			.returning();

		return json({ success: true, data: updatedUser });
	} catch (err: any) {
		if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
			throw error(400, 'A required field is missing or null');
		}
		throw error(500, 'Failed to create user');
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = Number(params.id);
		await db.delete(user).where(eq(user.id, id));
		return json({ success: true });
	} catch (err: any) {
		if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
			throw error(400, 'A required field is missing or null');
		}
		throw error(500, 'Failed to create user');
	}
};
