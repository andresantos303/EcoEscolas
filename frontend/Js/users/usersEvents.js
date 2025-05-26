console.log('script userEvents.js loaded');
import { getAllUsers, createUser, deleteUser, updateUser } from '../users/userServices.js';
import { logout } from '../auth/authService.js';
import { requireAuth } from '../auth/authGuard.js';

requireAuth();

document.addEventListener('DOMContentLoaded', init);

function init() {
  setupLogout();
  setupCreateUserForm();
  setupDeleteUser();
  setupEditUser();
  setupSearch();
  renderUsers();
}

function setupLogout() {
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      window.location.href = 'login.html';
    });
  }
}

async function renderUsers() {
  try {
    const users = await getAllUsers();
    const tbody = document.getElementById('userTbody');
    tbody.innerHTML = '';

    users.forEach(user => {
      tbody.insertAdjacentHTML('beforeend', `
                <tr id="row-${user.id}">
                    <td class="user-name">${user.name}</td>
                    <td class="user-email">${user.email}</td>
                    <td class="user-type">${user.type}</td>
                    <td>
                        <button class="edit-btn" data-userid="${user._id}">Editar</button>
                        <button class="delete-btn" data-userid="${user._id}">Eliminar</button>
                    </td>
                </tr>
            `);
    });

  } catch (error) {
    console.error('Erro ao renderizar utilizadores:', error);
  }
}

function setupCreateUserForm() {
  const form = document.getElementById('create-user-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      type: form.type.value,
    };

    try {
      await createUser(userData);
      await renderUsers();
      closeAddUserModal();
      form.reset();
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
    }
  });
}

function setupDeleteUser() {
  const tbody = document.getElementById('userTbody');
  if (!tbody) return;

  tbody.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('delete-btn')) return;

    const userId = event.target.getAttribute('data-userid');
    const confirmar = confirm('Tens a certeza que queres eliminar este utilizador?');
    if (!confirmar) return;

    try {
      await deleteUser(userId);
      await renderUsers();
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error);
    }
  });
}

function setupEditUser() {
  const tbody = document.getElementById('userTbody');
  const editForm = document.getElementById('edit-user-form');
  const usernameInput = document.getElementById('editUsername');
  const emailInput = document.getElementById('editEmail');
  const typeSelect = document.getElementById('editType');

  let currentUserId = null;

  if (!tbody || !editForm) return;

  tbody.addEventListener('click', (event) => {
    if (!event.target.classList.contains('edit-btn')) return;

    const row = event.target.closest('tr');
    currentUserId = event.target.getAttribute('data-userid');

    usernameInput.value = row.querySelector('.user-name')?.textContent || '';
    emailInput.value = row.querySelector('.user-email')?.textContent || '';
    typeSelect.value = row.querySelector('.user-type')?.textContent || '';

    editForm.style.display = 'flex';
  });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedData = {
      name: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      type: typeSelect.value
    };

    try {
      await updateUser(currentUserId, updatedData);
      editForm.style.display = 'none';
      await renderUsers();
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
    }
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const tbody = document.getElementById('userTbody');

  if (!searchInput || !tbody) return;

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
      const name = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
      row.style.display = name.includes(searchTerm) ? '' : 'none';
    });
  });
}







