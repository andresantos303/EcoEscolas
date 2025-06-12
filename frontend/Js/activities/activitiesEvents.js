import { getAllActivities, deleteActivity, updateActivity, createActivity, getAllPlans, getActivitiesCount  } from '../activities/activitiesServices.js';
import { requireAuth } from '../auth/authGuard.js';

requireAuth();

document.addEventListener('DOMContentLoaded', init);

function init() {
    renderActivities();
    setupActivitySearch();
    setupDeleteActivity();
    setupCreateActivityForm();
    openAddActivityModal();
    setupEditActivity();
    populatePlansSelect();
    renderActivityCount();
}

async function renderActivities() {
    try {
        const activities = await getAllActivities();
        const tbody = document.getElementById('activityTbody');
        tbody.innerHTML = '';

        activities.forEach(activity => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="row-${activity.id}">
                     <td class="activity-name">
                        <a href="../activities/activity.html?id=${activity._id}" class="plan-link">${activity.nome}</a>
                    </td>
                    <td class="activity-description">${activity.descricao}</td>
                    <td class="activity-local">${activity.local}</td>
                    <td class="activity-status">${activity.estado}</td>
                    <td class="activity-data">${activity.data}</td>
                    <td>
                        <button class="edit-btn" data-activityid="${activity._id}">Editar</button>
                        <button class="delete-btn" data-activityid="${activity._id}">Eliminar</button>
                    </td>
                </tr>
            `);
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

function openAddActivityModal() {
    document.getElementById('create-activity-form').style.display = 'block';
    populatePlansSelect();
}

function setupCreateActivityForm() {
    const form = document.getElementById('create-activity-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const activityData = {
            nome: form.name.value.trim(),
            descricao: form.description.value.trim(),
            local: form.local.value,
            estado: form.status.checked,
            data: form.date.value,
            planActivitiesId: form.selectedPlanId.value,
        };
        try {
            await createActivity(activityData);
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

async function renderActivityCount() {
  try {
    const count = await getActivitiesCount();
    document.getElementById('countActivities').textContent = count;
  } catch (err) {
    document.getElementById('countActivities').textContent = 'Erro';
  }
}