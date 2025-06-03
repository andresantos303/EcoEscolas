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
        activitiesList.innerHTML = ''; // limpar antes

        plan.associatedActivities.forEach(activity => {
            const li = document.createElement('li');
            li.textContent = activity; // ou activity.nome se for objeto
            activitiesList.appendChild(li);
        });


        console.log(plan);


    } catch (error) {
        console.error('Erro ao carregar o plano:', error);
        document.getElementById('planDetails').innerHTML = '<p>Erro ao carregar detalhes do plano.</p>';
    }
});
