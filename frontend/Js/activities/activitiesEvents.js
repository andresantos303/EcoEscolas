import { getAllActivities, deleteActivity, updateActivity, createActivity, getAllPlans, getActivitiesActive } from '../activities/activitiesServices.js';
import { requireAuth } from '../auth/authGuard.js';

requireAuth();

document.addEventListener('DOMContentLoaded', init);
document.getElementById('addActivityBtn').addEventListener('click', async () => {
  await openAddModal();
});


function init() {
    renderActivities();
    setupActivitySearch();
    setupDeleteActivity();
    setupCreateActivityForm();
    setupEditActivity();
    populatePlansSelect();
}

async function renderActivities() {
    try {
        const activities = await getAllActivities();
        const activitiesActives = await getActivitiesActive();
        const spanActivitiesActive = document.getElementById('atividadesAtivas');
        const spanNextActivities = document.getElementById('proximasAtividades');
        spanActivitiesActive.innerHTML = activitiesActives.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // zera hora/min/seg para comparar só a data

        const nextActivitiesCount = activities.filter(({ data }) => {
            const activityDate = new Date(data);
            return activityDate > today;
        });
        spanNextActivities.innerHTML = nextActivitiesCount.length;

        const tbody = document.getElementById('activityTbody');
        const nextActivities = document.getElementById('sectionNextActivities');
        tbody.innerHTML = '';
        nextActivities.innerHTML = '';

        activities.forEach(activity => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="row-${activity.id}">
                     <td class="activity-name">
                        <a href="../activities/activity.html?id=${activity._id}" class="plan-link">${activity.nome}</a>
                    </td>
                    <td class="activity-description">${activity.descricao}</td>
                    <td class="activity-local">${activity.local}</td>
                    <td class="activity-status">${activity.estado}</td>
                    <td class="activity-data">${activity.data.split('-').reverse().join('-')}</td>
                    <td>
                        <button class="edit-btn" data-activityid="${activity._id}">Editar</button>
                        <button class="delete-btn" data-activityid="${activity._id}">Eliminar</button>
                    </td>
                </tr>
            `);
        });

        nextActivitiesCount.slice(0, 4).forEach(nextActivity => {
            nextActivities.insertAdjacentHTML('beforeend', `
                <li>
                    <span class="dot" style="background: #2c3e50"></span>
                    <div class="content">
                    <p class="title">${nextActivity.nome}</p>
                    <p class="time">${nextActivity.data.split('-').reverse().join('-')}</p>
                    </div>
                </li>
            `);
        });

        const currentYear = today.getFullYear();

        const countsPerMonth = Array(12).fill(0);

        activities.forEach(({ data }) => {
            const activityDate = new Date(data);
            if (activityDate.getFullYear() === currentYear) {
                const monthIndex = activityDate.getMonth();
                countsPerMonth[monthIndex]++;
            }
        });
        const ctx = document.getElementById('graficoAtividades').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
                datasets: [{
                    label: 'Atividades por mês',
                    data: countsPerMonth,
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erro ao renderizar as Atividades:', error);
    }
}

function setupDeleteActivity() {
    const tbody = document.getElementById('activityTbody');
    if (!tbody) return;

    tbody.addEventListener('click', async (event) => {
        if (!event.target.classList.contains('delete-btn')) return;

        const activityId = event.target.getAttribute('data-activityid');
        const confirmar = confirm('Tens a certeza que queres eliminar esta atividade?');
        if (!confirmar) return;

        try {
            await deleteActivity(activityId);
            await renderActivities();
        } catch (error) {
            console.error('Erro ao eliminar atividade:', error);
        }
    });
}

function setupActivitySearch() {
    const searchInput = document.getElementById('searchActivityInput');
    const tbody = document.getElementById('activityTbody');

    if (!searchInput || !tbody) return;

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const name = row.querySelector('.activity-name')?.textContent.toLowerCase() || '';
            row.style.display = name.includes(searchTerm) ? '' : 'none';
        });
    });
}

async function openAddModal() {
    await populatePlansSelect();
    openAddActivityModal();
}


function setupCreateActivityForm() {
    const form = document.getElementById('create-activity-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fotosInput = form.querySelector('#fotos'); // <input type="file" id="fotos" multiple>
        const fotos = fotosInput?.files || [];

        const formData = new FormData();
        formData.append('nome', form.name.value.trim());
        formData.append('descricao', form.description.value.trim());
        formData.append('local', form.local.value);
        formData.append('estado', form.status.checked);
        formData.append('data', form.date.value);
        formData.append('planActivitiesId', form.selectedPlanId.value);

        for (let i = 0; i < fotos.length; i++) {
            formData.append('fotos', fotos[i]);
        }

        try {
            await createActivity(formData, form.selectedPlanId.value); // função atualizada no service
            await renderActivities();
            closeAddActivityModal();
            form.reset();
        } catch (error) {
            console.error('Erro ao criar Atividade:', error);
        }
    });
}

async function populatePlansSelect() {
    try {
        const plans = await getAllPlans();
        const select = document.getElementById('activityPlanSelect');
        select.innerHTML = '<option value="">Selecione um Plano</option>';

        plans.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan._id;
            option.textContent = plan.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
    }
}

function setupEditActivity() {
    const tbody = document.getElementById('activityTbody');
    const editForm = document.getElementById('edit-activity-form');
    const activityNameInput = document.getElementById('editActivityname');
    const activityDescriptionInput = document.getElementById('editActivitydescription');
    const activityLocalInput = document.getElementById('editLocal');
    const activityDateInput = document.getElementById('editDate');

    let currentActivityId = null;

    if (!tbody || !editForm) return;

    tbody.addEventListener('click', (event) => {
        if (!event.target.classList.contains('edit-btn')) return;

        const row = event.target.closest('tr');
        currentActivityId = event.target.getAttribute('data-activityid');

        activityNameInput.value = row.querySelector('.activity-name')?.textContent || '';
        activityDescriptionInput.value = row.querySelector('.activity-description')?.textContent || '';
        activityLocalInput.value = row.querySelector('.activity-local')?.textContent || '';
        activityDateInput.value = row.querySelector('.activity-date')?.textContent || '';

        editForm.style.display = 'flex';
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            nome: activityNameInput.value.trim(),
            descricao: activityDescriptionInput.value.trim(),
            local: activityLocalInput.value.trim(),
            data: activityDateInput.value.trim(),
        };

        try {
            await updateActivity(currentActivityId, updatedData);
            editForm.style.display = 'none';
            await renderActivities();
        } catch (error) {
            console.error('Erro ao atualizar atividade:', error);
        }
    });
}