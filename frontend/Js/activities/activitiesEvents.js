import { getAllActivities, deleteActivity } from '../activities/activitiesServices.js';
import { requireAuth } from '../auth/authGuard.js';

requireAuth();

document.addEventListener('DOMContentLoaded', init);

function init() {
    renderActivities();
    setupActivitySearch();
    setupDeleteActivity();
}

async function renderActivities() {
    try {
        const activities = await getAllActivities();
        const tbody = document.getElementById('activityTbody');
        tbody.innerHTML = '';

        activities.forEach(activity => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="row-${activity.id}">
                    <td class="activity-name">${activity.nome}</td>
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