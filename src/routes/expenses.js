const express = require('express');
const { expensesStore } = require('../store/expensesStore');

const router = express.Router();

const VALID_STATUSES = new Set(['approve', 'reject', 'paid']);

router.get('/', (req, res) => {
  res.json({ expenses: expensesStore.list() });
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
