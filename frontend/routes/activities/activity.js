import { getActivityById, finalizeActivity, startActivity } from '../../Js/activities/activitiesServices.js';

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

  try {
    await finalizeActivity(activity._id, activity.participants.length, fotos);
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

