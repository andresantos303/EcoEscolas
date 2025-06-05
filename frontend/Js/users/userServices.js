import axios from 'https://cdn.jsdelivr.net/npm/axios/+esm'
const API_URL = 'http://localhost:3000';

const sessionData = JSON.parse(sessionStorage.getItem('eco-escolas-session'));
const token = sessionData?.token;

export async function getAllUsers() {
    
    try {
        const response = await axios.get(`${API_URL}/users/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar utilizadores:', error);
        throw error;
    }
}

export async function getUserById(userId) {
    
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar utilizadores:', error);
        throw error;
    }
}

export async function createUser(userData) {

    try {
        const response = await axios.post(`${API_URL}/users/`, userData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar utilizador:', error);
        throw error;
    }
}

export async function deleteUser(userId) {

  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error);
    throw error;
  }
}

export async function updateUser(userId, updatedData) {
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    throw error;
  }
}

