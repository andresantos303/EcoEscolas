function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');

    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}; 

function openAddActivityModal() {
    document.getElementById('create-activity-form').style.display = 'block';
}
function closeAddActivityModal() {
    document.getElementById('create-activity-form').style.display = 'none';
}

function closeEditActivityModal() {
  document.getElementById('edit-activity-form').style.display = 'none';
}