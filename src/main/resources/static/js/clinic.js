/* Page 2 — clinic dashboard: donate medicine, request medicine, live status lists. */

let me = null;
poll(async () => {
  me = await requireRole('CLINIC');
  document.getElementById('who-name').textContent = me.clinicName || me.username;
  await Promise.all([loadStock(), loadDonations(), loadRequests()]);
});

/** Read-only list of approved medicine the whole platform can request. */
async function loadStock() {
  const rows = await api('/api/clinic/stock');
  renderTable('stock-table', rows, (d) => {
    const chip = expiryChip(d.expiryDate);
    return `<tr>
      <td class="wrap"><strong>${esc(d.medicineName)}</strong></td>
      <td class="wrap">${esc(d.clinicName || '—')}</td>
      <td>${esc(d.batchNo || '—')}</td>
      <td>${esc(d.category)}</td>
      <td>${d.quantity}</td>
      <td><span class="chip ${chip.cls}">${chip.label}</span></td>
    </tr>`;
  }, 'No medicine in shared stock right now — donations appear here once the admin approves them.');
}

async function loadDonations() {
  const rows = await api('/api/clinic/donations');
  renderTable('donations-table', rows, (d) => {
    const chip = expiryChip(d.expiryDate);
    return `<tr>
      <td class="wrap"><strong>${esc(d.medicineName)}</strong>${d.notes ? `<div class="muted">${esc(d.notes)}</div>` : ''}</td>
      <td>${esc(d.batchNo || '—')}</td>
      <td>${esc(d.category)}</td>
      <td>${d.quantity}</td>
      <td><span class="chip ${chip.cls}">${chip.label}</span></td>
      <td>${badge(d.status)}</td>
      <td>${fmtDateTime(d.createdAt)}</td>
    </tr>`;
  }, 'You have not donated any medicine yet. Use the “Donate medicine” form above.');
}

async function loadRequests() {
  const rows = await api('/api/clinic/requests');
  renderTable('requests-table', rows, (r) => `<tr>
      <td class="wrap"><strong>${esc(r.medicineName)}</strong></td>
      <td>${esc(r.category || '—')}</td>
      <td>${r.quantity}</td>
      <td>${badge(r.urgency)}</td>
      <td class="wrap">${esc(r.reason || '—')}</td>
      <td>${badge(r.status)}</td>
      <td>${fmtDateTime(r.createdAt)}</td>
    </tr>`, 'No requests yet. Use the “Request medicine” form above.');
}

// ---- donate ----
document.getElementById('donate-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const res = await api('/api/clinic/donations', {
      method: 'POST',
      body: {
        medicineName: document.getElementById('d-name').value.trim(),
        batchNo: document.getElementById('d-batch').value.trim(),
        category: document.getElementById('d-category').value,
        quantity: Number(document.getElementById('d-qty').value),
        expiryDate: document.getElementById('d-expiry').value,
        notes: document.getElementById('d-notes').value.trim()
      }
    });
    toast(res.message, 'success');
    e.target.reset();
    await loadDonations();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

// ---- request ----
document.getElementById('request-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const res = await api('/api/clinic/requests', {
      method: 'POST',
      body: {
        medicineName: document.getElementById('r-name').value.trim(),
        category: document.getElementById('r-category').value,
        quantity: Number(document.getElementById('r-qty').value),
        urgency: document.getElementById('r-urgency').value,
        reason: document.getElementById('r-reason').value.trim()
      }
    });
    toast(res.message, 'success');
    e.target.reset();
    await loadRequests();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

// ---- table helpers ----
function renderTable(tableId, rows, rowHtml, emptyText) {
  const tbody = document.querySelector('#' + tableId + ' tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty">${emptyText}</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(rowHtml).join('');
}

function esc(s) {
  return String(s == null ? '' : s)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
