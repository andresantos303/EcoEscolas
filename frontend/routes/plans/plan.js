import { getPlanById, finalizePlan, startPlan } from '../../Js/plans/planServices.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
    const planId = getPlanIdFromURL();
    if (!planId) {
        showError("ID do plano não fornecido.");
        return;
    }

    try {
        const plan = await getPlanById(planId);
        renderPlanDetails(plan);
        renderAssociatedActivities(plan.associatedActivities);
        setupActionButtons(plan);
    } catch (error) {
        console.error('Erro ao carregar o plano:', error);
        showError("Erro ao carregar detalhes do plano.");
    }
}

function getPlanIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function showError(message) {
    document.getElementById('planDetails').innerHTML = `<p>${message}</p>`;
}

function renderPlanDetails(plan) {
    document.getElementById('planNome').textContent = plan.nome;
    document.getElementById('planDescricao').textContent = plan.descricao;
    document.getElementById('planDataInicio').textContent = plan.data_inicio;
    document.getElementById('planDataFim').textContent = plan.data_fim;
    document.getElementById('planEstado').textContent = plan.estado ? 'Ativo' : 'Finalizado';
    document.getElementById('planNivel').textContent = plan.nivel;
    document.getElementById('planRecursos').textContent = plan.recursos;
}

function renderAssociatedActivities(activities) {
    const activitiesList = document.getElementById('planActivities');
    activitiesList.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = 'Atividades Associadas:';
    activitiesList.appendChild(title);

    activities.forEach(activity => {
        const li = document.createElement('li');
        li.textContent = activity.nome;
        activitiesList.appendChild(li);
    });
}

function setupActionButtons(plan) {
    const finalizeBtn = document.getElementById('finalizePlanBtn');
    const startBtn = document.getElementById('startPlanBtn');

    if (plan.estado === true) {
        finalizeBtn.style.display = 'inline-block';
        finalizeBtn.addEventListener('click', () => handleFinalizePlan(plan));
    } else {
        startBtn.style.display = 'inline-block';
        startBtn.addEventListener('click', () => handleStartPlan(plan));
    }
}

async function handleFinalizePlan(plan) {
    const currentDate = new Date();
    const planEndDate = new Date(plan.data_fim);

    if (planEndDate > currentDate) {
        const confirmEarly = confirm("A data de fim do plano é futura. Tem a certeza que pretende finalizá-lo?");
        if (!confirmEarly) return;
    }

    // 1. Obter os arquivos do input de recursos
    const recursosInput = document.getElementById('recursos-input'); // <input type="file" id="recursos-input" multiple>
    const recursos = recursosInput?.files || [];
    const formData = new FormData();

    for (const file of recursos) {
        formData.append('recursos', file);
    }

    try {
        // 3. Chamar o serviço passando o FormData
        await finalizePlan(plan._id, recursos); // função do service
        alert("Plano finalizado com sucesso!");
        location.reload();
    } catch (err) {
        const message = err?.response?.data?.message;

        if (message === "PLAN_DELETE_BLOCKED") {
            alert("Não é possível finalizar o plano. Existem atividades ainda em andamento.");
        } else if (message === "PLAN_FINALIZE_BLOCKED") {
            alert("A data de fim do plano ainda não foi atingida.");
        } else {
            alert("Erro ao finalizar plano.");
        }

        console.error(err);
    }
}

async function handleStartPlan(plan) {
    try {
        await startPlan(plan._id);
        alert("Plano inicializado com sucesso!");
        location.reload();
    } catch (err) {
        alert("Erro ao inicializar plano.");
        console.error(err);
    }
}
