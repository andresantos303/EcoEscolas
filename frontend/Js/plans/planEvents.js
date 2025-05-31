console.log('script planEvents.js loaded');
import { getAllPlans, createPlan } from '../plans/planServices.js';
import { requireAuth } from '../auth/authGuard.js';

requireAuth();

document.addEventListener('DOMContentLoaded', init);

function init() {
    renderPlans();
    setupCreatePlanForm();
    setupPlanSearch();
}

async function renderPlans() {
    try {
        const plans = await getAllPlans();
        const tbody = document.getElementById('planTbody');
        tbody.innerHTML = '';

        plans.forEach(plan => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="row-${plan.id}">
                    <td class="plan-name">${plan.nome}</td>
                    <td class="plan-description">${plan.descricao}</td>
                    <td class="plan-first-date">${plan.data_inicio}</td>
                    <td class="plan-last-date">${plan.data_fim}</td>
                    <td class="plan-last-date">${plan.estado}</td>
                    <td class="plan-level">${plan.nivel}</td>
                    <td class="plan-level">${plan.recursos}</td>
                    <td>
                        <button class="edit-btn" data-planid="${plan._id}">Editar</button>
                        <button class="delete-btn" data-planid="${plan._id}">Eliminar</button>
                    </td>
                </tr>
            `);
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
        console.log(planData);


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