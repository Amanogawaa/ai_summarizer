import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { json, error } from '@sveltejs/kit';
import { compare } from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	const JWT_SECRET = env.JWT_SECRET;

	if (!JWT_SECRET) throw new Error('JWT is not set');

	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			throw error(400, 'Email and password are required');
		}

		const [foundUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);

		if (!foundUser) {
			throw error(401, 'Invalid email or password');
		}

		const isValid = await compare(password, foundUser.hash_password);

		if (!isValid) {
			throw error(401, 'Invalid email or password');
		}

		const token = sign(
			{ id: foundUser.id, email: foundUser.email, role: foundUser.role },
			JWT_SECRET,
			{
				expiresIn: '1h'
			}
		);
		const { hash_password, ...userData } = foundUser;
		return json({ success: true, data: userData, access_token: token });
	} catch (err: any) {
		console.error('POST /api/login error:', err);
		if (err.status === 400 || err.status === 401) {
			throw err;
		}
		throw error(500, 'Login failed');
	}
};
