document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => { hamburger.classList.toggle('open'); navLinks.classList.toggle('open'); });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { hamburger.classList.remove('open'); navLinks.classList.remove('open'); }));
  }
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) a.classList.add('active');
  });
});

const navStyle = document.createElement('style');
navStyle.textContent = `
  .nav-username { color:var(--accent); font-size:0.88rem; font-weight:600; padding:0.3rem 0; display:block; }
  .btn-logout { background:transparent; border:1.5px solid rgba(255,82,82,0.5); color:#FF5252; padding:0.35rem 1rem; border-radius:6px; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.3s ease; font-family:var(--font-head); }
  .btn-logout:hover { background:rgba(255,82,82,0.1); border-color:#FF5252; }
  .nav-admin-link { color:#FFD700 !important; font-weight:700 !important; font-size:0.88rem !important; }
  .nav-login-link { color:var(--gray) !important; }
  .nav-login-link:hover { color:var(--white) !important; }
`;
document.head.appendChild(navStyle);
