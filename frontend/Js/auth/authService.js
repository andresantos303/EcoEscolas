
const API_BASE_URL = 'http://localhost:3000';
const SESSION_KEY = 'eco-escolas-session';
import axios from 'https://cdn.jsdelivr.net/npm/axios/+esm'
//const USER_TYPE = 'user-type';

export async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
    const token = response.data.token;
    const id = response.data.id;

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token }));
    sessionStorage.setItem('currentUser', id);

   
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Erro no login.');
  }
}

export function getToken() {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return null;

  try {
    return JSON.parse(session).token;
  } catch {
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('currentUser');
}