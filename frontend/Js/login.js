const STORAGE_KEY = 'eco-escolas-users';

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    let foundUser = null;

    for (const [username, data] of Object.entries(users)) {
        if (data.email === email && data.password === password) {
            foundUser = { username, email };
            break;
        }
    }

    if (foundUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
        window.location.href = 'admin.html';
    } else {
        document.getElementById('email-error').textContent = 'Email ou senha inválidos.';
        document.getElementById('password-error').textContent = 'Email ou senha inválidos.';
    }
}

function togglePassword() {
    const passwordField = document.getElementById('password');
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
}