
console.log('script planUI.js loaded');

function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');

    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}; 
function openAddPlanModal() {
    document.getElementById('create-plan-form').style.display = 'block';
}
function closeAddPlanModal() {
    document.getElementById('create-plan-form').style.display = 'none';
}

function closeEditPlanModal() {
  document.getElementById('edit-plan-form').style.display = 'none';
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