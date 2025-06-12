import { getToken } from './authService.js';

export function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
  }
}
