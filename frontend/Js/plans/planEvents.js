import { getAllPlans, getPlansActive, createPlan, deletePlan, updatePlan } from '../plans/planServices.js';
import { requireAuth } from '../auth/authGuard.js';

requireAuth();

document.addEventListener('DOMContentLoaded', init);

function init() {
    renderPlans();
    setupCreatePlanForm();
    setupPlanSearch();
    setupDeletePlan();
    setupEditPlan();
}

async function renderPlans() {
    try {
        const plans = await getAllPlans();
        const plansActives = await getPlansActive();
        const spanPlanosAtivos = document.getElementById('planosAtivos');
        spanPlanosAtivos.innerHTML = plansActives.length;
        
        const tbody = document.getElementById('planTbody');
        tbody.innerHTML = '';

        plans.forEach(plan => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="row-${plan.id}">
                    <td class="plan-name">
                        <a href="./routes/plans/plan.html?id=${plan._id}" class="plan-link">${plan.nome}</a>
                    </td>
                    <td class="plan-description">${plan.descricao}</td>
                    <td class="plan-first-date">${plan.data_inicio.split('-').reverse().join('-')}</td>
                    <td class="plan-last-date">${plan.data_fim.split('-').reverse().join('-')}</td>
                    <td class="plan-status">${plan.estado}</td>
                    <td class="plan-level">${plan.nivel}</td>
                    <td>
                        <button class="edit-btn" data-planid="${plan._id}">Editar</button>
                        <button class="delete-btn" data-planid="${plan._id}">Eliminar</button>
                    </td>
                </tr>
            `);
        });

        const countsByNivel = Array(11).fill(0); // índices 0–10
        plans.forEach(plan => {
        const nivel = Number(plan.nivel);
        if (!isNaN(nivel) && nivel >= 0 && nivel <= 10) {
            countsByNivel[nivel]++;
        }
        });

        // 3. Configura o gráfico de barras horizontais
        const ctx = document.getElementById('graficoPlanos').getContext('2d');
        new Chart(ctx, {
        type: 'bar',
        data: {
            // rótulos de 0 a 10
            labels: Array.from({ length: 11 }, (_, i) => `${i}`),
            datasets: [{
            label: 'Número de planos por nível',
            data: countsByNivel,
            backgroundColor: '#4CAF50',
            borderColor: '#388E3C',
            borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',       // inverte para barras horizontais
            responsive: true,
            scales: {
            x: {
                beginAtZero: true,
                title: {
                display: true,
                text: 'Quantidade de planos'
                }
            },
            y: {
                title: {
                display: true,
                text: 'Nível de prioridade'
                }
            }
            }
        }
        });

    } catch (error) {
        console.error('Erro ao renderizar o Plano de Atividades:', error);
    }
}

function setupCreatePlanForm() {
    const form = document.getElementById('create-plan-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const planData = {
            nome: form.name.value.trim(),
            descricao: form.description.value.trim(),
            data_inicio: form.firstDate.value,
            data_fim: form.lastDate.value,
            estado: form.status.checked, // Checkbox -> true ou false
            nivel: parseInt(form.planLevel.value, 10),
            recursos: form.planResource.value.trim(),
        };


        try {
            await createPlan(planData);
            await renderPlans();
            closeAddPlanModal();
            form.reset();
        } catch (error) {
            console.error('Erro ao criar Plano de Atividades:', error);
        }
    });
}

function setupPlanSearch() {
    const searchInput = document.getElementById('searchPlanInput');
    const tbody = document.getElementById('planTbody');

    if (!searchInput || !tbody) return;

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const name = row.querySelector('.plan-name')?.textContent.toLowerCase() || '';
            row.style.display = name.includes(searchTerm) ? '' : 'none';
        });
    });
}

function setupDeletePlan() {
    const tbody = document.getElementById('planTbody');
    if (!tbody) return;

    tbody.addEventListener('click', async (event) => {
        if (!event.target.classList.contains('delete-btn')) return;

        const planId = event.target.getAttribute('data-planid');
        const confirmar = confirm('Tens a certeza que queres eliminar este plano?');
        if (!confirmar) return;

        try {
            await deletePlan(planId);
            await renderPlans();
        } catch (error) {
            console.error('Erro ao eliminar plano:', error);
        }
    });
}

function setupEditPlan() {
    const tbody = document.getElementById('planTbody');
    const editForm = document.getElementById('edit-plan-form');
    const plannameInput = document.getElementById('editPlanname');
    const descriptionInput = document.getElementById('editPlandescription');
    const firstdateInput = document.getElementById('editFirstDate');
    const lastdateInput = document.getElementById('editLastDate');
    const levelInput = document.getElementById('editLevel');

    let currentPlanId = null;

    if (!tbody || !editForm) return;

    tbody.addEventListener('click', (event) => {
        if (!event.target.classList.contains('edit-btn')) return;

        const row = event.target.closest('tr');
        currentPlanId = event.target.getAttribute('data-planid');

        plannameInput.value = row.querySelector('.plan-name')?.textContent || '';
        descriptionInput.value = row.querySelector('.plan-description')?.textContent || '';
        firstdateInput.value = row.querySelector('.plan-first-date')?.textContent || '';
        lastdateInput.value = row.querySelector('.plan-last-date')?.textContent || '';
        levelInput.value = row.querySelector('.plan-level')?.textContent || '';

        editForm.style.display = 'flex';
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            nome: plannameInput.value.trim(),
            descricao: descriptionInput.value.trim(),
            data_inicio: firstdateInput.value.trim(),
            data_fim: lastdateInput.value.trim(),
            nivel: levelInput.value.trim()
        };

        try {
            await updatePlan(currentPlanId, updatedData);
            editForm.style.display = 'none';
            await renderPlans();
        } catch (error) {
            console.error('Erro ao atualizar plano:', error);
        }
    });
}