import axios from 'https://cdn.jsdelivr.net/npm/axios/+esm'
const API_URL = 'http://localhost:3000';


const sessionData = JSON.parse(sessionStorage.getItem('eco-escolas-session'));
const token = sessionData?.token;

export async function getAllPlans() {
    
    try {
        const response = await axios.get(`${API_URL}/plans/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os Planos de Atividades:', error);
        throw error;
    }
}

export async function getPublicPlanNames() {
    try {
        const response = await axios.get(`${API_URL}/plans/public/names`, {
            
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os Planos de Atividades:', error);
        throw error;
    }
}

export async function getPlanById(planId) {
  try {
    const response = await axios.get(`${API_URL}/plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter plano pelo ID:', error);
    throw error;
  }
}


export async function createPlan(planData) {

    try {
        const response = await axios.post(`${API_URL}/plans/`, planData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar Plano de Atividades:', error);
        throw error;
    }
}

export async function deletePlan(planId) {

  try {
    const response = await axios.delete(`${API_URL}/plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao eliminar Plano:', error);
    throw error;
  }
}

export async function updatePlan(planId, updatedData) {
  try {
    const response = await axios.patch(`${API_URL}/plans/${planId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    throw error;
  }
}