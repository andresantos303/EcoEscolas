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

export async function updateActivity(activityId, updatedData) {
  try {
    const response = await axios.patch(`${API_URL}/activities/${activityId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    throw error;
  }
}

export async function getActivityById(activityId) {
  try {
    const response = await axios.get(`${API_URL}/activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter atividade pelo ID:', error);
    throw error;
  }
}


export async function createActivity(activityData) {

    try {
        const response = await axios.post( `${API_URL}/activities/${activityData.planActivitiesId}`, activityData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar Atividade:', error);
        throw error;
    }
}

export async function getAllPlans() {
    try {
        const response = await axios.get(`${API_URL}/plans/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os planos:', error);
        throw error;
    }
}

