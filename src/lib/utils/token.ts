import { error } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export function verify_token(request: Request) {
	const JWT_SECRET =
		process.env.JWT_SECRET || 'd3fc103a7234e2d00a801043606e44e353595f16ce36eafb33e6cbf2f1178851';

	const auth_header = request.headers.get('Authorization');
	if (!auth_header || !auth_header.startsWith('Bearer ')) {
		throw error(401, 'Unauthorized: No valid token provided.');
	}

	const token = auth_header.split(' ')[1];

	try {
		const decode = jwt.verify(token, JWT_SECRET) as { id: number };
		return decode;
	} catch (error: any) {
		throw error(401, 'Unauthorized: Invalid or expired token.');
	}
}
``;
