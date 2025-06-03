
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