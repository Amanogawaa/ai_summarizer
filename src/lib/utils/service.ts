import axios, { type ResponseType } from 'axios';

const api = axios.create({
	baseURL: 'http://localhost:5173/'
});

const getHeaders = (token?: string, isFormData?: boolean) => {
	const headers: { [key: string]: string } = {};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	if (!isFormData) {
		headers['Content-Type'] = 'application/json';
	}

	return headers;
};

export default async function dataFetch(
	endpoint: string,
	method: string,
	data?: any,
	token?: string,
	responseType?: ResponseType
) {
	try {
		// If token is not provided but we're in a browser environment, try to get from localStorage
		if (!token && typeof window !== 'undefined') {
			token = localStorage.getItem('token') || undefined;
		}

		const isFormData = data instanceof FormData;

		const response = await api.request({
			url: endpoint,
			method,
			data,
			headers: getHeaders(token, isFormData),
			responseType: responseType || 'json'
		});
		return response.data;
	} catch (error: unknown) {
		if (error instanceof Error) {
			// Avoid logging token to console for security
			console.error('API Request Error:', error.message);
			
			// If there's a 401 error, clear token and redirect to login
			if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== 'undefined') {
				localStorage.removeItem('token');
				window.location.href = '/admin/login';
			}
			
			throw new Error(error.message);
		} else {
			throw new Error('An unknown error occurred');
		}
	}
}
