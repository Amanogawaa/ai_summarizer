import { browser } from '$app/environment';
import { goto } from '$app/navigation';

/**
 * Checks if the user is authenticated in the browser
 * @returns True if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
    if (!browser) return false;
    
    const token = localStorage.getItem('token');
    return !!token;
}

/**
 * Gets the current user from the JWT token
 * @returns The user object or null if not authenticated
 */
export function getCurrentUser(): { id: number; email: string; role: string } | null {
    if (!browser) return null;
    
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Invalid token format', e);
        return null;
    }
}

/**
 * Logs the user out and redirects to login page
 */
export function logout(): void {
    if (!browser) return;
    
    localStorage.removeItem('token');
    goto('/admin/login');
}

/**
 * Ensures user is authenticated, redirects to login if not
 * @returns The current user if authenticated
 */
export function requireAuth(): { id: number; email: string; role: string } | null {
    if (!browser) return null;
    
    const user = getCurrentUser();
    if (!user) {
        logout();
        return null;
    }
    
    return user;
} 