import axios from 'https://cdn.jsdelivr.net/npm/axios/+esm'
const API_URL = 'http://localhost:3000';

const sessionData = JSON.parse(sessionStorage.getItem('eco-escolas-session'));
const token = sessionData?.token;

export async function getAllActivities() {
    try {
        const response = await axios.get(`${API_URL}/activities/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
         console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar as Atividades:', error);
        throw error;
    }
}

export async function deleteActivity(activityId) {

  try {
    const response = await axios.delete(`${API_URL}/activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao eliminar Atividade:', error);
    throw error;
  }
}