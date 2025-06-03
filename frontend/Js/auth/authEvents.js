import { loginUser } from './authService.js';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('error-message');

  try {
    await loginUser(email, password);
    window.location.href = 'admin.html'; 
  } catch (err) {
    errorMessage.textContent = err.message || 'Erro ao comunicar com o servidor.';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.toggle-password');
  const passwordField = document.getElementById('password');

  if (toggleBtn && passwordField) {
    toggleBtn.addEventListener('click', () => {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    });
  }
});