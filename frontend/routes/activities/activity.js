import {
  getActivityById,
  finalizeActivity,
  startActivity,
  getActivitiesByPlanId
} from '../../Js/activities/activitiesServices.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const activityId = getActivityIdFromURL();
  if (!activityId) {
    showError("ID da atividade não fornecido.");
    return;
  }

  try {
    const activity = await getActivityById(activityId);
    renderActivityDetails(activity);
    setupActionButtons(activity);

    // Debug: mostrar planActivitiesId no console para ver o que está chegando
    console.log('activity.planActivitiesId:', activity.planActivitiesId);

    // Extrair o planId de forma segura
    const planId = typeof activity.planActivitiesId === 'string'
      ? activity.planActivitiesId
      : activity.planActivitiesId?._id;

    if (!planId) {
      console.warn('Plano associado não encontrado para esta atividade.');
      // Opcional: mostrar uma mensagem no UI se quiser
      const list = document.getElementById('planActivities');
      list.innerHTML = '<li>Plano associado não encontrado.</li>';
      return;
    }

    // Mostrar atividades associadas ao plano, se existir
    await renderActivitiesFromPlan(planId);

  } catch (error) {
    console.error('Erro ao carregar a atividade:', error);
    showError("Erro ao carregar detalhes da atividade.");
  }
}

function getActivityIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function showError(message) {
  document.getElementById('activityDetails').innerHTML = `<p>${message}</p>`;
}

function renderActivityDetails(activity) {
  document.getElementById('activityNome').textContent = activity.nome;
  document.getElementById('activityDescricao').textContent = activity.descricao;
  document.getElementById('activityLocal').textContent = activity.local;
  document.getElementById('activityFotos').textContent = activity.fotos.join(', ');
  document.getElementById('activityData').textContent = activity.data;
  document.getElementById('activityPlano').textContent = activity.planActivitiesId?.nome || activity.planActivitiesId;

  const participantsList = activity.participants.map(p => `${p.nome} (${p.email})`).join(', ');
  document.getElementById('activityParticipants').textContent = participantsList;
  document.getElementById('activityParticipantsCounter').textContent = activity.participants.length;
}

function setupActionButtons(activity) {
  const finalizeBtn = document.getElementById('finalizeBtn');
  const startBtn = document.getElementById('startBtn');
  const currentDate = new Date();
  const activityDate = new Date(activity.data);

  if (activity.estado === true) {
    finalizeBtn.style.display = 'inline-block';
    finalizeBtn.addEventListener('click', () => handleFinalize(activity, activityDate, currentDate));
  } else {
    startBtn.style.display = 'inline-block';
    startBtn.addEventListener('click', () => handleStart(activity));
  }
}

async function handleFinalize(activity) {
  const fotosInput = document.getElementById('fotos-input');
  const fotos = fotosInput?.files || [];

  const formData = new FormData();
  formData.append('participantsCount', activity.participants.length);

  if (fotos && fotos.length > 0) {
    for (let i = 0; i < fotos.length; i++) {
      formData.append('fotos', fotos[i]);
    }
  }

  try {
    await finalizeActivity(activity._id, formData);
    alert("Atividade finalizada com sucesso!");
    location.reload();
  } catch (err) {
    alert("Erro ao finalizar atividade.");
    console.error(err);
  }
}

async function handleStart(activity) {
  try {
    await startActivity(activity._id);
    alert("Atividade inicializada com sucesso!");
    location.reload();
  } catch (err) {
    alert("Erro ao inicializar atividade.");
    console.error(err);
  }
}

// Função para renderizar as atividades do mesmo plano
async function renderActivitiesFromPlan(planId) {
  console.log('planId recebido em renderActivitiesFromPlan:', planId);

  if (!planId) {
    console.warn('planId inválido, não é possível buscar atividades.');
    return;
  }

  try {
    const activities = await getActivitiesByPlanId(planId);
    const list = document.getElementById('planActivities');
    list.innerHTML = '';

    if (activities.length === 0) {
      list.innerHTML = '<li>Sem atividades associadas.</li>';
      return;
    }

    activities.forEach(act => {
      const li = document.createElement('li');
      li.textContent = `${act.nome} - ${new Date(act.data).toLocaleDateString('pt-PT')}`;
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Erro ao buscar atividades do plano:', error);
  }
}
