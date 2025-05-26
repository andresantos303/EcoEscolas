export function resetUserForm() {
    document.getElementById('newUsername').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newType').value = '';
    document.getElementById('newPassword').value = '';
}

export function getUserFormData() {
    return {
        name: document.getElementById('newUsername').value.trim(),
        email: document.getElementById('newEmail').value.trim(),
        type: document.getElementById('newType').value.trim(),
        password: document.getElementById('newPassword').value.trim(),
    };
}
