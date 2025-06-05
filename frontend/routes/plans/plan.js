import { getPlanById } from '../../Js/plans/planServices.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const planId = params.get('id');

    if (!planId) {
        document.getElementById('planDetails').innerHTML = '<p>ID do plano não fornecido.</p>';
        return;
    }

    try {
        const plan = await getPlanById(planId);

        document.getElementById('planNome').textContent = plan.nome;
        document.getElementById('planDescricao').textContent = plan.descricao;
        document.getElementById('planDataInicio').textContent = plan.data_inicio;
        document.getElementById('planDataFim').textContent = plan.data_fim;
        document.getElementById('planEstado').textContent = plan.estado;
        document.getElementById('planNivel').textContent = plan.nivel;
        document.getElementById('planRecursos').textContent = plan.recursos;

        const activitiesList = document.getElementById('planActivities');
        activitiesList.innerHTML = '';


        const title = document.createElement('h3');
        title.textContent = 'Atividades Associadas:';
        activitiesList.appendChild(title);

        plan.associatedActivities.forEach(activity => {
            const li = document.createElement('li');
            li.textContent = activity.nome;
            activitiesList.appendChild(li);
        });


    } catch (error) {
        console.error('Erro ao carregar o plano:', error);
        document.getElementById('planDetails').innerHTML = '<p>Erro ao carregar detalhes do plano.</p>';
    }
});
