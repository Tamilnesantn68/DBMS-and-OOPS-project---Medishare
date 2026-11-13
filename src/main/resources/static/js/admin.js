/* Page 3 — admin console: approve donations, fulfill requests, manage clinics, watch activity. */

let me = null;
const filters = { donations: 'PENDING', requests: 'PENDING' };

// guard: admins only
poll(async () => {
  me = await requireRole('ADMIN');
  document.getElementById('who-name').textContent = me.username;
  await refreshAll();
});

async function refreshAll() {
  const [overview, donations, requests, stock, clinics] = await Promise.all([
    api('/api/admin/overview'),
    api('/api/admin/donations' + (filters.donations ? '?status=' + filters.donations : '')),
    api('/api/admin/requests' + (filters.requests ? '?status=' + filters.requests : '')),
    api('/api/admin/stock'),
    api('/api/admin/clinics')
  ]);
  renderStats(overview);
  renderDonations(donations);
  renderRequests(requests);
  renderStock(stock);
  renderClinics(clinics);
  renderActivity(overview.recent || []);
}

// ---------- stats ----------
function renderStats(o) {
  document.getElementById('st-pending-don').textContent = o.pendingDonations;
  document.getElementById('st-pending-req').textContent = o.pendingRequests;
  document.getElementById('st-pending-clinics').textContent = o.pendingClinics;
  document.getElementById('st-stock').textContent = o.availableStock;
  document.getElementById('st-fulfilled').textContent = o.fulfilledRequests;
  document.getElementById('st-clinics').textContent = o.totalClinics;
}

// ---------- donations ----------
function renderDonations(rows) {
  const body = document.getElementById('donations-body');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="9" class="empty">No donations in this view.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((d) => {
    const chip = expiryChip(d.expiryDate);
    const actions = d.status === 'PENDING'
      ? `<button class="btn small" onclick="actDonation(${d.id}, 'approve')">✓ Approve</button>
         <button class="btn small danger" onclick="actDonation(${d.id}, 'reject')">✕ Reject</button>`
      : '<span class="muted">reviewed</span>';
    return `<tr>
      <td class="wrap"><strong>${esc(d.medicineName)}</strong>${d.notes ? `<div class="muted">${esc(d.notes)}</div>` : ''}</td>
      <td class="wrap">${esc(d.clinicName || '—')}</td>
      <td>${esc(d.batchNo || '—')}</td>
      <td>${esc(d.category)}</td>
      <td>${d.quantity}</td>
      <td><span class="chip ${chip.cls}">${chip.label}</span></td>
      <td>${badge(d.status)}</td>
      <td>${fmtDateTime(d.createdAt)}</td>
      <td><div class="actions">${actions}</div></td>
    </tr>`;
  }).join('');
}

async function actDonation(id, action) {
  try {
    const res = await api(`/api/admin/donations/${id}/${action}`, { method: 'POST' });
    toast(res.message, 'success');
    await refreshAll();
  } catch (err) {
    toast(err.message, 'error');
    await refreshAll(); // someone else may have reviewed it — reload to stay in sync
  }
}

// ---------- requests ----------
function renderRequests(rows) {
  const body = document.getElementById('requests-body');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="9" class="empty">No requests in this view.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((r) => {
    const actions = r.status === 'PENDING'
      ? `<select id="stock-for-${r.id}" class="filter-btn" style="max-width:220px">
           <option value="">⚙️ auto: nearest expiry</option>
         </select>
         <button class="btn small" onclick="fulfill(${r.id})">✓ Fulfill</button>
         <button class="btn small danger" onclick="actRequest(${r.id}, 'reject')">✕ Reject</button>`
      : '<span class="muted">handled</span>';
    return `<tr>
      <td class="wrap"><strong>${esc(r.medicineName)}</strong></td>
      <td class="wrap">${esc(r.clinicName || '—')}</td>
      <td>${esc(r.category || '—')}</td>
      <td>${r.quantity}</td>
      <td>${badge(r.urgency)}</td>
      <td class="wrap">${esc(r.reason || '—')}</td>
      <td>${badge(r.status)}</td>
      <td>${fmtDateTime(r.createdAt)}</td>
      <td><div class="actions">${actions}</div></td>
    </tr>`;
  }).join('');
  // populate batch pickers for pending requests
  rows.filter(r => r.status === 'PENDING').forEach(async (r) => {
    try {
      const stock = await api('/api/admin/stock?medicineName=' + encodeURIComponent(r.medicineName));
      const select = document.getElementById('stock-for-' + r.id);
      if (!select) return;
      select.innerHTML += stock.map(b =>
        `<option value="${b.id}">${esc(b.clinicName || '')} · batch ${esc(b.batchNo || '-')} · ${b.quantity} u · ${fmtDate(b.expiryDate)}</option>`
      ).join('');
      if (!stock.length) select.innerHTML += '<option value="" disabled>no stock yet</option>';
    } catch (_) { /* ignore */ }
  });
}

async function fulfill(id) {
  const select = document.getElementById('stock-for-' + id);
  const donationId = select && select.value ? Number(select.value) : undefined;
  try {
    const res = await api(`/api/admin/requests/${id}/fulfill`, {
      method: 'POST',
      body: donationId ? { donationId } : {}
    });
    toast(res.message, 'success');
    await refreshAll();
  } catch (err) {
    toast(err.message, 'error');
    await refreshAll();
  }
}

async function actRequest(id, action) {
  try {
    const res = await api(`/api/admin/requests/${id}/${action}`, { method: 'POST' });
    toast(res.message, 'success');
    await refreshAll();
  } catch (err) {
    toast(err.message, 'error');
    await refreshAll();
  }
}

// ---------- stock ----------
function renderStock(rows) {
  const body = document.getElementById('stock-body');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="7" class="empty">Stock is empty — approve donations to fill it.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((d) => {
    const chip = expiryChip(d.expiryDate);
    return `<tr>
      <td class="wrap"><strong>${esc(d.medicineName)}</strong></td>
      <td class="wrap">${esc(d.clinicName || '—')}</td>
      <td>${esc(d.batchNo || '—')}</td>
      <td>${esc(d.category)}</td>
      <td>${d.quantity}</td>
      <td><span class="chip ${chip.cls}">${chip.label}</span></td>
      <td>${fmtDateTime(d.reviewedAt)}</td>
    </tr>`;
  }).join('');
}

// ---------- clinics ----------
function renderClinics(rows) {
  const body = document.getElementById('clinics-body');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty">No clinics registered yet.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((c) => {
    const actions = c.status === 'PENDING'
      ? `<button class="btn small" onclick="actClinic(${c.id}, 'approve')">✓ Approve</button>
         <button class="btn small danger" onclick="actClinic(${c.id}, 'reject')">✕ Reject</button>`
      : (c.status === 'ACTIVE'
          ? `<button class="btn small danger" onclick="actClinic(${c.id}, 'reject')">✕ Revoke access</button>`
          : `<button class="btn small" onclick="actClinic(${c.id}, 'approve')">✓ Re-approve</button>`);
    return `<tr>
      <td class="wrap"><strong>${esc(c.clinicName || '—')}</strong></td>
      <td class="wrap">${esc(c.contactPerson || '—')}</td>
      <td>${esc(c.phone || '—')}</td>
      <td>${esc(c.city || '—')}</td>
      <td>${esc(c.username)}</td>
      <td>${badge(c.status)}</td>
      <td>${fmtDateTime(c.createdAt)}</td>
      <td><div class="actions">${actions}</div></td>
    </tr>`;
  }).join('');
}

async function actClinic(id, action) {
  try {
    const res = await api(`/api/admin/clinics/${id}/${action}`, { method: 'POST' });
    toast(res.message, 'success');
    await refreshAll();
  } catch (err) {
    toast(err.message, 'error');
    await refreshAll();
  }
}

// ---------- activity ----------
function renderActivity(items) {
  const body = document.getElementById('activity-body');
  if (!items.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty">Nothing has happened yet.</td></tr>';
    return;
  }
  body.innerHTML = items.map((a) => `<tr>
      <td>${a.kind === 'DONATION' ? '📦 Donation' : '🧾 Request'}</td>
      <td class="wrap"><strong>${esc(a.medicineName)}</strong></td>
      <td class="wrap">${esc(a.clinicName)}</td>
      <td>${a.quantity}</td>
      <td>${badge(a.status)}</td>
      <td>${fmtDateTime(a.createdAt)}</td>
    </tr>`).join('');
}

// ---------- tabs & filters ----------
document.getElementById('tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-tab]');
  if (!btn) return;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b === btn));
  document.querySelectorAll('.tabpanel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + btn.dataset.tab));
});

document.querySelectorAll('[data-filters]').forEach(box => {
  box.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    box.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
    filters[box.dataset.filters] = btn.dataset.status;
    refreshAll().catch(() => {});
  });
});

function esc(s) {
  return String(s == null ? '' : s)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
