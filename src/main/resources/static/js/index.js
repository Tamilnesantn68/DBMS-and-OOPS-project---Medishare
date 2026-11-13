/* Page 1 — about, sign in (admin/clinic) and clinic registration. */

const tabs = (tabBtn, panel, otherBtn, otherPanel) => {
  document.getElementById(tabBtn).addEventListener('click', () => {
    document.getElementById(tabBtn).classList.add('active');
    document.getElementById(panel).classList.add('active');
    document.getElementById(otherBtn).classList.remove('active');
    document.getElementById(otherPanel).classList.remove('active');
  });
};
tabs('tab-login', 'panel-login', 'tab-register', 'panel-register');
tabs('tab-register', 'panel-register', 'tab-login', 'panel-login');

document.querySelectorAll('[data-goto-register]').forEach(el =>
  el.addEventListener('click', () => {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('panel-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('panel-login').classList.remove('active');
  }));

// ---- sign in ----
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: {
        username: document.getElementById('login-username').value.trim(),
        password: document.getElementById('login-password').value
      }
    });
    toast(res.message, 'success');
    location.href = res.role === 'ADMIN' ? 'admin.html' : 'clinic.html';
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

// ---- clinic registration ----
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: {
        clinicName: document.getElementById('reg-clinic-name').value.trim(),
        contactPerson: document.getElementById('reg-contact').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
        city: document.getElementById('reg-city').value.trim(),
        address: document.getElementById('reg-address').value.trim(),
        username: document.getElementById('reg-username').value.trim(),
        password: document.getElementById('reg-password').value
      }
    });
    toast(res.message, 'success');
    e.target.reset();
    setTimeout(() => {
      document.getElementById('tab-login').click();
    }, 2200);
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

// already signed in? jump straight to the right page
(async () => {
  try {
    const me = await api('/api/auth/me');
    if (me.authenticated) {
      location.href = me.user.role === 'ADMIN' ? 'admin.html' : 'clinic.html';
    }
  } catch (_) { /* stay */ }
})();
