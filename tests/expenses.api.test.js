const request = require('supertest');
const { app } = require('../server');
const { expensesStore } = require('../src/store/expensesStore');

describe('Expense Approval API', () => {
  test('GET seeded expenses, POST new expense, and update status (approve) with edge cases', async () => {
    // Ensure seed is present for this test run
    expensesStore.seed();

    const getRes = await request(app).get('/api/expenses');
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body.expenses)).toBe(true);
    expect(getRes.body.expenses.length).toBe(3);

    const createRes = await request(app)
      .post('/api/expenses')
      .send({ description: 'Coffee', amount: 12.34, currency: 'USD', incurredDate: '2024-01-01' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.expense).toMatchObject({ description: 'Coffee', amount: 12.34, currency: 'USD', status: 'pending' });

    const expenseId = createRes.body.expense.id;

    // Invalid status
    const invalidStatusRes = await request(app).post(`/api/expenses/${expenseId}/status`).send({ status: 'unknown' });
    expect(invalidStatusRes.status).toBe(400);

    // Not found
    const notFoundRes = await request(app).post('/api/expenses/999999/status').send({ status: 'approve' });
    expect(notFoundRes.status).toBe(404);

    // Approve
    const approveRes = await request(app).post(`/api/expenses/${expenseId}/status`).send({ status: 'approve' });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.expense).toMatchObject({ id: expenseId, status: 'approve' });
  });

  test('GET /api/expenses/summary returns totals-by-day and handles invalid days query', async () => {
    expensesStore.seed();

    const summaryResDefault = await request(app).get('/api/expenses/summary');
    expect(summaryResDefault.status).toBe(200);
    expect(summaryResDefault.body).toMatchObject({ days: 7 });
    expect(Array.isArray(summaryResDefault.body.byDay)).toBe(true);
    expect(summaryResDefault.body.byDay).toHaveLength(7);
    expect(typeof summaryResDefault.body.grandTotal).toBe('number');

    const summaryResInvalidDays = await request(app).get('/api/expenses/summary?days=not-a-number');
    expect(summaryResInvalidDays.status).toBe(200);
    expect(summaryResInvalidDays.body.days).toBe(7);
    expect(summaryResInvalidDays.body.byDay).toHaveLength(7);

    const summaryResZeroDays = await request(app).get('/api/expenses/summary?days=0');
    expect(summaryResZeroDays.status).toBe(200);
    expect(summaryResZeroDays.body.days).toBe(7);
    expect(summaryResZeroDays.body.byDay).toHaveLength(7);
  });
});
