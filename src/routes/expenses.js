const express = require('express');
const { expensesStore } = require('../store/expensesStore');

const router = express.Router();

const VALID_STATUSES = new Set(['approve', 'reject', 'paid']);

router.get('/', (req, res) => {
  res.json({ expenses: expensesStore.list() });
});

// Chart-friendly summary: totals by incurred date (default last 7 days)
router.get('/summary', (req, res) => {
  const days = (() => {
    const raw = req.query?.days;
    const n = raw == null || raw === '' ? 7 : Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 7;
    return Math.floor(n);
  })();

  const expenses = expensesStore.list();

  const toISODate = (d) => d.toISOString().slice(0, 10);

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));

  // init with 0s for nice continuous chart
  const totalsByDate = new Map();
  for (let i = 0; i < days; i++) {
    const t = new Date(start);
    t.setDate(t.getDate() + i);
    totalsByDate.set(toISODate(t), 0);
  }

  for (const e of expenses) {
    const date = e?.incurredDate;
    if (!date || typeof date !== 'string') continue;

    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) continue;
    if (!totalsByDate.has(date)) continue;

    const amount = typeof e.amount === 'number' ? e.amount : Number(e.amount);
    if (!Number.isFinite(amount)) continue;

    totalsByDate.set(date, totalsByDate.get(date) + amount);
  }

  const byDay = [...totalsByDate.entries()]
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const grandTotal = byDay.reduce((sum, d) => sum + d.total, 0);

  return res.json({
    days,
    byDay,
    grandTotal
  });
});

router.post('/', (req, res) => {
  const { description, amount, currency, incurredDate } = req.body || {};

  // Basic validation
  if (typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'description is required' });
  }

  const parsedAmount = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const parsedCurrency = typeof currency === 'string' && currency.trim() ? currency.trim() : 'USD';

  let parsedIncurredDate = incurredDate;
  if (parsedIncurredDate == null || parsedIncurredDate === '') {
    parsedIncurredDate = new Date().toISOString().slice(0, 10);
  }

  // Allow simple YYYY-MM-DD validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(parsedIncurredDate))) {
    return res.status(400).json({ error: 'incurredDate must be YYYY-MM-DD' });
  }

  const expense = expensesStore.create({
    description: description.trim(),
    amount: parsedAmount,
    currency: parsedCurrency,
    incurredDate: parsedIncurredDate
  });

  return res.status(201).json({ expense });
});

router.post('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!VALID_STATUSES.has(status)) {
    return res.status(400).json({ error: 'status must be one of approve, reject, paid' });
  }

  const expense = expensesStore.updateStatus(id, status);
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  return res.json({ expense });
});

module.exports = router;
