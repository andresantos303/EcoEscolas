import { getToken } from './authService.js';

export function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = '../login.html';
  }
}

export function roleGuard(){
  const sessionData = JSON.parse(sessionStorage.getItem('eco-escolas-session'));
  const token = sessionData?.token;
  
  const user = jwt_decode(token);
  const role = user.type;
  
  document.querySelectorAll("[data-permission]").forEach((el) => {
    const allowed = el.dataset.permission.split(",").map((s) => s.trim());
    if (!allowed.includes(role)) {
      el.remove();  //el.style.display = 'none'
    }
  });
}