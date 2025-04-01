import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const data = await db.select().from(user);

	return json({ data: data });
};

export const POST: RequestHandler = async ({ request }) => {
	const { full_name, email, hash_password } = await request.json();

	const query = await db
		.insert(user)
		.values({ full_name: full_name, email: email, hash_password: hash_password });

	return json({ success: true, data: query });
};
