const expensesTbody = document.getElementById('expensesTbody');
const errorBox = document.getElementById('error');
const createExpenseForm = document.getElementById('createExpenseForm');
const refreshBtn = document.getElementById('refreshBtn');
const chartCanvas = document.getElementById('expensesChart');
const chartTotalEl = document.getElementById('chartTotal');

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

function formatShortDate(isoDate) {
  // isoDate: YYYY-MM-DD
  if (typeof isoDate !== 'string') return '';
  const [y, m, d] = isoDate.split('-').map((x) => Number(x));
  if (![y, m, d].every((v) => Number.isFinite(v))) return isoDate;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function renderExpensesChart({ byDay, grandTotal }) {
  if (!chartCanvas) return;

  const ctx = chartCanvas.getContext('2d');

  // ensure crisp rendering
  const cssW = chartCanvas.clientWidth || 640;
  const cssH = chartCanvas.clientHeight || 220;
  chartCanvas.width = Math.floor(cssW * window.devicePixelRatio);
  chartCanvas.height = Math.floor(cssH * window.devicePixelRatio);
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

  ctx.clearRect(0, 0, cssW, cssH);

  const pad = 14;
  const chartW = cssW - pad * 2;
  const chartH = cssH - pad * 2;

  const max = Math.max(0, ...byDay.map((d) => d.total));
  const barCount = Math.max(1, byDay.length);
  const gap = 10;
  const barW = Math.max(8, (chartW - gap * (barCount - 1)) / barCount);

  // background subtle grid
  ctx.strokeStyle = 'rgba(231, 238, 252, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (chartH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(pad + chartW, y);
    ctx.stroke();
  }

  // bars
  const baseY = pad + chartH;
  for (let i = 0; i < byDay.length; i++) {
    const item = byDay[i];
    const value = Number(item.total) || 0;
    const ratio = max > 0 ? value / max : 0;
    const h = Math.round(chartH * ratio);

    const x = pad + i * (barW + gap);
    const y = baseY - h;

    // gradient-ish fill
    ctx.fillStyle = 'rgba(91, 140, 255, 0.85)';
    ctx.fillRect(x, y, barW, h);

    // highlight cap
    ctx.fillStyle = 'rgba(91, 140, 255, 1)';
    ctx.fillRect(x, y, barW, Math.min(6, h));

    // x labels (at least show something)
    if (byDay.length <= 8 || i % Math.ceil(byDay.length / 6) === 0) {
      ctx.fillStyle = 'rgba(167, 179, 209, 0.95)';
      ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(formatShortDate(item.date), x + barW / 2, baseY + 6);
    }

    // tooltip-like value label above the biggest bar
    // (simple, avoids hover logic)
    if (value === max && max > 0) {
      ctx.fillStyle = 'rgba(231, 238, 252, 0.98)';
      ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(formatMoney(value, 'USD'), x + barW / 2, y - 6);
    }
  }

  // axis line
  ctx.strokeStyle = 'rgba(231, 238, 252, 0.16)';
  ctx.beginPath();
  ctx.moveTo(pad, baseY);
  ctx.lineTo(pad + chartW, baseY);
  ctx.stroke();

  if (chartTotalEl) {
    chartTotalEl.textContent = formatMoney(grandTotal || 0, 'USD');
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

async function loadExpensesChart() {
  const data = await apiFetch('/api/expenses/summary?days=7');
  const byDay = data?.byDay || [];
  const grandTotal = data?.grandTotal ?? 0;

  // Ensure we always render an 0-data chart
  const safeByDay = Array.isArray(byDay) ? byDay : [];
  renderExpensesChart({ byDay: safeByDay, grandTotal });
}

async function updateExpenseStatus(id, status) {
  clearError();
  await apiFetch(`/api/expenses/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
  await Promise.all([loadExpenses(), loadExpensesChart()]);
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
    await Promise.all([loadExpenses(), loadExpensesChart()]);
  } catch (err) {
    showError(err.message || String(err));
  }
});

refreshBtn.addEventListener('click', async () => {
  try {
    await Promise.all([loadExpenses(), loadExpensesChart()]);
  } catch (err) {
    showError(err.message || String(err));
  }
});

// Set default date
createExpenseForm.incurredDate.value = new Date().toISOString().slice(0, 10);

Promise.all([loadExpenses(), loadExpensesChart()]).catch((err) => showError(err.message || String(err)));

// Re-render on resize for nicer chart
let _resizeTimer = null;
window.addEventListener('resize', () => {
  if (_resizeTimer) clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    loadExpensesChart().catch(() => {});
  }, 150);
});
