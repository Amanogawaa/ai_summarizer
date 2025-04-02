import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hash } from 'bcrypt';

export const GET: RequestHandler = async () => {
	try {
		const data = await db.select().from(user);
		return json({ data });
	} catch (err) {
		console.error('GET /api/users error:', err);
		throw error(500, 'Failed to fetch users');
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { full_name, email, password } = body;

		if (!full_name || !email || !password) {
			throw error(400, 'Missing required fields: full_name, email, and hash_password are required');
		}

		const hash_password = await hash(password, 10);

		const [newUser] = await db.insert(user).values({ full_name, email, hash_password }).returning();

		return json({ success: true, data: newUser });
	} catch (err: any) {
		console.error('POST /api/users error:', err);
		if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			throw error(409, 'Email already exists');
		}
		if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
			throw error(400, 'A required field is missing or null');
		}
		throw error(500, 'Failed to create user');
	}
};
