import { getActivityById, finalizeActivity, startActivity, getActivitiesByPlanId } from '../../Js/activities/activitiesServices.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const activityId = getActivityIdFromURL();
  if (!activityId) {
    showError("ID da atividade não fornecido.");
    return;
  }

  try {
    const activity = await getActivityById(activityId);

    renderParticipantsTable(activity.participants);
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
  const fotosContainer = document.getElementById('activityFotos');
  fotosContainer.innerHTML = ''; 
  activity.fotos.forEach(foto => {
    const img = document.createElement('img');
    img.src = foto.profile_image
    img.style.maxWidth = '150px';
    img.style.marginRight = '10px';
    fotosContainer.appendChild(img);
  });

  document.getElementById('activityData').textContent = activity.data;
  document.getElementById('activityPlano').textContent = activity.planActivitiesId?.nome || activity.planActivitiesId;
  document.getElementById('activityParticipantsCounter').textContent = activity.participants.length;
}

function renderParticipantsTable(participants) {
  const tableBody = document.getElementById('participantsList');
  tableBody.innerHTML = '';

  participants.forEach(participant => {
    const row = document.createElement('tr');

    const nomeCell = document.createElement('td');
    nomeCell.textContent = participant.nome;

    const emailCell = document.createElement('td');
    emailCell.textContent = participant.email;

    row.appendChild(nomeCell);
    row.appendChild(emailCell);
    tableBody.appendChild(row);
  });
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
