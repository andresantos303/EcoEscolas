console.log('script userUI.js loaded');

function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');

    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}; 

function closeEditUserModal() {
  document.getElementById('edit-user-form').style.display = 'none';
}

function saveUserChanges() {
    const username = document.getElementById('editUsername').textContent;
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value.trim();
    if (!email || !password) { alert('Preenche ambos os campos'); return; }

    users[username] = { email, password };
    saveUsers(users);
    renderUsers();
    closeEditModal();
}


function openAddUserModal() {
    document.getElementById('create-user-form').style.display = 'block';
}

function closeAddUserModal() {
    document.getElementById('create-user-form').style.display = 'none';
}


window.addEventListener("DOMContentLoaded", () => {
    carregarNotificacoes();
});

function enviarNotificacao(event) {
    event.preventDefault();

    const titulo = document.getElementById("tituloNotificacao").value;
    const mensagem = document.getElementById("mensagemNotificacao").value;
    const data = new Date().toLocaleString();
    const novaNotificacao = { titulo, mensagem, data };
    const notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.push(novaNotificacao);
    localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
    adicionarNotificacaoTabela(novaNotificacao);
    document.getElementById("notificacaoForm").reset();
}

function carregarNotificacoes() {
    const notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];
    notificacoes.forEach(adicionarNotificacaoTabela);
}

function adicionarNotificacaoTabela(notificacao) {
    const tabela = document.getElementById("tabelaNotificacoes").querySelector("tbody");
    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
        <td>${notificacao.titulo}</td>
        <td>${notificacao.mensagem}</td>
        <td>${notificacao.data}</td>
    `;

    tabela.appendChild(novaLinha);
}

const ctx = document.getElementById('graficoAtividades').getContext('2d');
const graficoAtividades = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio'],
        datasets: [{
            label: 'Atividades por mês',
            data: [5, 8, 4, 7, 6],
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
