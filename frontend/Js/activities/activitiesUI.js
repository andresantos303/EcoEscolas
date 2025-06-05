
console.log('script activityUI.js loaded');

function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');

    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}; 