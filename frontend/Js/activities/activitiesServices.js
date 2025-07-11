import axios from 'https://cdn.jsdelivr.net/npm/axios/+esm';
const API_URL = 'http://localhost:3000';

const sessionData = JSON.parse(sessionStorage.getItem('eco-escolas-session'));
const token = sessionData?.token;

export async function getAllActivities() {
  try {
    const response = await axios.get(`${API_URL}/activities/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar as Atividades:', error);
    throw error;
  }
}

export async function getActivitiesActive() {
  try {
    const query = new URLSearchParams({ estado: true });
    const response = await axios.get(`${API_URL}/activities/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar as Atividades Ativas:', error);
    throw error;
  }
}

export async function deleteActivity(activityId) {
  try {
    const response = await axios.delete(`${API_URL}/activities/${activityId}`, {
      headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter atividade pelo ID:', error);
    throw error;
  }
}

export async function createActivity(formData, planId) {
  try {
    const response = await axios.post(`${API_URL}/activities/${planId}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os planos:', error);
    throw error;
  }
}

export async function finalizeActivity(activityId, formData) {
  try {
    const response = await axios.put(
      `${API_URL}/activities/${activityId}/finalize`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao finalizar atividade:', error);
    throw error;
  }
}

export async function startActivity(activityId) {
  try {
    const response = await axios.put(
      `${API_URL}/activities/${activityId}/start`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao inicializar a atividade:', error);
    throw error;
  }
}

export async function getActivitiesByPlanId(planId) {
  try {
    const response = await axios.get(`${API_URL}/activities/plan/${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar atividades por plano:', error);
    throw error;
  }
}

export async function addParticipant(activityId, participantData) {
  try {
    const response = await axios.post(`${API_URL}/activities/${activityId}/participants`, participantData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Erro ao adicionar participante';
    throw new Error(message);
  }
}

export async function getActivitiesCount() {
  try {
    const response = await axios.get(`${API_URL}/activities/stats/count`);
    return response.data.count;
  } catch (error) {
    console.error('Erro ao buscar atividades por plano:', error);
    throw error;
  }
}
