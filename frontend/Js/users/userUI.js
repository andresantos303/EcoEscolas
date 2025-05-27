console.log('script userUI.js loaded');
const STORAGE_KEY = 'eco-escolas-session';

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

function openAddPlanoModal() {
    document.getElementById("addPlanoModal").style.display = "block";
}

function closeAddPlanoModal() {
    document.getElementById("addPlanoModal").style.display = "none";
}

function addPlano() {
    const nome = document.getElementById("planoNome").value;
    const inicio = document.getElementById("planoDataInicio").value;
    const fim = document.getElementById("planoDataFim").value;
    const status = document.getElementById("planoStatus").value;
    const resource = document.getElementById("planoResource").value;
    const level = document.getElementById("planoLevel").value;

    const tbody = document.getElementById("planoTbody");
    const row = tbody.insertRow();

    row.innerHTML = `
        <td>${nome}</td>
        <td>${inicio}</td>
        <td>${fim}</td>
        <td>${status}</td>
        <td>${resource}</td>
        <td>${level}</td>
        <td>
            <button onclick="openEditPlanoModal(this)">Editar</button>
            <button onclick="deletePlano(this)">Eliminar</button>
        </td>
    `;

    closeAddPlanoModal();
}

let currentPlanoRow = null;

function openEditPlanoModal(button) {
    const row = button.closest("tr");
    currentPlanoRow = row;

    document.getElementById("editPlanoNome").value = row.cells[0].innerText;
    document.getElementById("editPlanoDataInicio").value = row.cells[1].innerText;
    document.getElementById("editPlanoDataFim").value = row.cells[2].innerText;
    document.getElementById("editPlanoStatus").value = row.cells[3].innerText;
    document.getElementById("editPlanoResource").value = row.cells[4].innerText;
    document.getElementById("editPlanoLevel").value = row.cells[5].innerText;

    document.getElementById("editPlanoModal").style.display = "block";
}

function closeEditPlanoModal() {
    document.getElementById("editPlanoModal").style.display = "none";
}

function savePlanoChanges() {
    if (currentPlanoRow) {
        currentPlanoRow.cells[0].innerText = document.getElementById("editPlanoNome").value;
        currentPlanoRow.cells[1].innerText = document.getElementById("editPlanoDataInicio").value;
        currentPlanoRow.cells[2].innerText = document.getElementById("editPlanoDataFim").value;
        currentPlanoRow.cells[3].innerText = document.getElementById("editPlanoStatus").value;
        currentPlanoRow.cells[4].innerText = document.getElementById("editPlanoResource").value;
        currentPlanoRow.cells[5].innerText = document.getElementById("editPlanoLevel").value;
    }
    closeEditPlanoModal();
}

function deletePlano(button) {
    const row = button.closest("tr");
    row.remove();
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
