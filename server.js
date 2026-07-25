const path = require('path');
const express = require('express');
const { expensesStore } = require('./src/store/expensesStore');
const expensesRouter = require('./src/routes/expenses');

const app = express();

app.use(express.json());

// Serve frontend from / at root
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/expenses', expensesRouter);

// Frontend fallback: always serve index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Seed in-memory store at boot
expensesStore.seed();

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Expense Approval app listening on http://localhost:${port}`);
  });
}

module.exports = { app };
