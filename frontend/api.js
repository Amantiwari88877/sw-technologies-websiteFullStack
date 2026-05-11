const API_BASE = '/api';
function getToken() { return localStorage.getItem('sw_token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('sw_user')); } catch { return null; } }
function setAuth(token, user) { localStorage.setItem('sw_token', token); localStorage.setItem('sw_user', JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem('sw_token'); localStorage.removeItem('sw_user'); }
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + endpoint, { ...options, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
function updateNavbar() {
  const user = getUser();
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  navLinks.querySelectorAll('.nav-auth-item').forEach(el => el.remove());
  if (user) {
    const nameLi = document.createElement('li'); nameLi.className = 'nav-auth-item';
    nameLi.innerHTML = `<span class="nav-username">👤 ${user.name}</span>`; navLinks.appendChild(nameLi);
    if (user.isAdmin) {
      const adminLi = document.createElement('li'); adminLi.className = 'nav-auth-item';
      adminLi.innerHTML = `<a href="admin.html" class="nav-admin-link">⚙️ Admin</a>`; navLinks.appendChild(adminLi);
    }
    const logoutLi = document.createElement('li'); logoutLi.className = 'nav-auth-item';
    logoutLi.innerHTML = `<button class="btn-logout" id="logoutBtn">Logout</button>`; navLinks.appendChild(logoutLi);
    document.getElementById('logoutBtn')?.addEventListener('click', () => { clearAuth(); window.location.href = 'index.html'; });
  } else {
    const loginLi = document.createElement('li'); loginLi.className = 'nav-auth-item';
    loginLi.innerHTML = `<a href="login.html" class="nav-login-link">Login</a>`; navLinks.appendChild(loginLi);
    const regLi = document.createElement('li'); regLi.className = 'nav-auth-item';
    regLi.innerHTML = `<a href="register.html" class="nav-cta">Register</a>`; navLinks.appendChild(regLi);
  }
}
document.addEventListener('DOMContentLoaded', updateNavbar);
