/* Shared API + UI helpers used by all three pages. */

async function api(path, options = {}) {
  const opts = { headers: {}, ...options };
  if (opts.body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(path, opts);
  let data = {};
  try { data = await res.json(); } catch (_) { /* non-JSON body */ }
  if (!res.ok) {
    const err = new Error(data.message || ('Request failed (' + res.status + ')'));
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Redirects to index.html unless a signed-in user has `role`. */
async function requireRole(role) {
  try {
    const me = await api('/api/auth/me');
    if (me.authenticated && me.user && me.user.role === role) return me.user;
  } catch (_) { /* fall through */ }
  location.replace('index.html');
  throw new Error('redirecting');
}

function toast(message, type = '') {
  const el = document.getElementById('toast');
  if (!el) { alert(message); return; }
  el.textContent = message;
  el.className = 'show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 4200);
}

function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Chip class by how soon the batch expires. */
function expiryChip(expiryDate) {
  if (!expiryDate) return { label: '—', cls: 'ok' };
  const days = Math.ceil((new Date(expiryDate) - Date.now()) / 86400000);
  let cls = 'ok';
  if (days < 0) cls = 'expired';
  else if (days <= 30) cls = 'danger';
  else if (days <= 90) cls = 'warn';
  return { label: fmtDate(expiryDate) + ' (' + (days < 0 ? 'expired' : days + 'd') + ')', cls };
}

function badge(status) {
  return '<span class="badge ' + status + '">' + status + '</span>';
}

/** Wire a live clock-free polling loop; runs `fn` now and every `ms`. */
function poll(fn, ms = 10000) {
  const run = async () => { try { await fn(); } catch (e) { if (e.status === 401) location.replace('index.html'); } };
  run();
  return setInterval(run, ms);
}

async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch (_) { /* ignore */ }
  location.replace('index.html');
}
