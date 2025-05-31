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
         console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os Planos de Atividades:', error);
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