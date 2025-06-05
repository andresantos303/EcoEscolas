import { getActivityById } from '../../Js/activities/activitiesServices.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const activityId = params.get('id');

    if (!activityId) {
        document.getElementById('activityDetails').innerHTML = '<p>ID da atividade não fornecido.</p>';
        return;
    }

    try {
        const activity = await getActivityById(activityId);

        document.getElementById('activityNome').textContent = activity.nome;
        document.getElementById('activityDescricao').textContent = activity.descricao;
        document.getElementById('activityLocal').textContent = activity.local;
        document.getElementById('activityFotos').textContent = activity.fotos.join(', ');
        document.getElementById('activityData').textContent = activity.data;
        document.getElementById('activityPlano').textContent = activity.planActivitiesId?.nome || activity.planActivitiesId;
        const participantsList = activity.participants.map(p => `${p.nome} (${p.email})`).join(', ');
        document.getElementById('activityParticipants').textContent = participantsList;



    } catch (error) {
        console.error('Erro ao carregar a atividade:', error);
        document.getElementById('activityDetails').innerHTML = '<p>Erro ao carregar detalhes do plano.</p>';
    }
});
