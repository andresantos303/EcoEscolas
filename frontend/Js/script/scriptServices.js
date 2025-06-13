import { getPublicPlanNames } from '../plans/planServices.js';

document.addEventListener('DOMContentLoaded', renderPlansCards);

async function renderPlansCards() {
  try {
    const plans = await getPublicPlanNames();
    const container = document.getElementById('plansContainer');
    container.innerHTML = '';

    plans.forEach(plan => {
      const card = document.createElement('a');
      card.href = `planoatividades.html?id=${plan._id}`;
      card.className = 'recipe-card';

      const title = document.createElement('h3');
      title.textContent = plan.nome;

      card.appendChild(title);
      container.appendChild(card);
    });

  } catch (error) {
    console.error('Erro ao carregar planos de atividades:', error);
  }
}