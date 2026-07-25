class ExpensesStore {
  constructor() {
    this._expenses = [];
    this._nextId = 1;
  }

  seed() {
    if (this._expenses.length > 0) return;

    const now = new Date();
    const d = (daysAgo) => {
      const t = new Date(now);
      t.setDate(t.getDate() - daysAgo);
      return t.toISOString().slice(0, 10);
    };

    this._expenses = [
      {
        id: this._nextId++,
        description: 'Team lunch',
        amount: 58.75,
        currency: 'USD',
        incurredDate: d(3),
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: this._nextId++,
        description: 'Taxi to client meeting',
        amount: 22.4,
        currency: 'USD',
        incurredDate: d(2),
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: this._nextId++,
        description: 'Office supplies',
        amount: 104.18,
        currency: 'USD',
        incurredDate: d(1),
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];
  }

  list() {
    return this._expenses;
  }

  create({ description, amount, currency, incurredDate }) {
    const expense = {
      id: this._nextId++,
      description,
      amount,
      currency,
      incurredDate,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this._expenses.push(expense);
    return expense;
  }

  findById(id) {
    const numericId = Number(id);
    return this._expenses.find((e) => e.id === numericId) || null;
  }

  updateStatus(id, status) {
    const expense = this.findById(id);
    if (!expense) return null;

    expense.status = status;
    expense.statusUpdatedAt = new Date().toISOString();

    return expense;
  }
}

const expensesStore = new ExpensesStore();

module.exports = { expensesStore };
