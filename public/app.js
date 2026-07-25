const expensesTbody = document.getElementById('expensesTbody');
const errorBox = document.getElementById('error');
const createExpenseForm = document.getElementById('createExpenseForm');
const refreshBtn = document.getElementById('refreshBtn');

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function statusBadge(status) {
  return `<span class="badge ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}

function clearError() {
  errorBox.textContent = '';
  errorBox.style.display = 'none';
}

async function apiFetch(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    const message = body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

function incurredDisplay(incurredDate) {
  // incurredDate is YYYY-MM-DD
  return incurredDate;
}

function formatMoney(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(n);
  } catch {
    return `${n} ${currency || 'USD'}`;
  }
}

async function loadExpenses() {
  clearError();
  const data = await apiFetch('/api/expenses');
  const expenses = data.expenses || [];

  expensesTbody.innerHTML = expenses
    .map((e) => {
      const actions = `
        <div class="actions">
          <button class="action-btn approve" data-status="approve" data-id="${e.id}">Approve</button>
          <button class="action-btn reject" data-status="reject" data-id="${e.id}">Reject</button>
          <button class="action-btn paid" data-status="paid" data-id="${e.id}">Paid</button>
        </div>
      `;

      return `
        <tr>
          <td>${e.id}</td>
          <td>${escapeHtml(e.description)}</td>
          <td>${escapeHtml(incurredDisplay(e.incurredDate))}</td>
          <td>${escapeHtml(formatMoney(e.amount, e.currency))}</td>
          <td>${statusBadge(e.status)}</td>
          <td>${actions}</td>
        </tr>
      `;
    })
    .join('');
}

async function updateExpenseStatus(id, status) {
  clearError();
  await apiFetch(`/api/expenses/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
  await loadExpenses();
}

expensesTbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-status][data-id]');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  const status = btn.getAttribute('data-status');

  try {
    await updateExpenseStatus(id, status);
  } catch (err) {
    showError(err.message || String(err));
  }
});

createExpenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const formData = new FormData(createExpenseForm);
  const payload = {
    description: formData.get('description'),
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    incurredDate: formData.get('incurredDate')
  };

  try {
    await apiFetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    createExpenseForm.reset();
    createExpenseForm.currency.value = 'USD';
    // default incurred date to today
    createExpenseForm.incurredDate.value = new Date().toISOString().slice(0, 10);
    await loadExpenses();
  } catch (err) {
    showError(err.message || String(err));
  }
});

refreshBtn.addEventListener('click', async () => {
  try {
    await loadExpenses();
  } catch (err) {
    showError(err.message || String(err));
  }
});

// Set default date
createExpenseForm.incurredDate.value = new Date().toISOString().slice(0, 10);

loadExpenses().catch((err) => showError(err.message || String(err)));
