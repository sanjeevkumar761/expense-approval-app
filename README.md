# expense-approval-app

Full-stack expense approval app in one repo.

## What’s included (demo slice)
- **Node + Express REST API**
  - `GET /api/expenses` — list expenses
  - `POST /api/expenses` — create an expense (basic validation)
  - `POST /api/expenses/:id/status` — update status: `approve | reject | paid`
  - `GET /api/expenses/summary?days=7` — chart-friendly totals by incurred date
  - In-memory seed with **3** expenses at startup
- **Frontend served by Express** at `/` (HTML/CSS/JS)
  - Lists expenses
  - Form to create expenses
  - Approve/Reject/Paid buttons
  - **Expenses chart** (bar chart by incurred date for the last 7 days)
  - **Navigation entry point to products** (link to `/products` catalog)
- **Product catalog pages**
  - `GET /products` — HTML list of products
  - `GET /products/:id` — HTML product detail
- **Tests**: Jest + Supertest
  - API test covering list/create/status update + summary edge cases
  - Product catalog HTML tests
  - UI smoke test ensuring `/` links to the product catalog

## Getting started

### Prerequisites
- Node.js 20+

### Install
```bash
npm install
```

### Run (dev)
```bash
npm run dev
```

Then open: http://localhost:3000

## API details

### `GET /api/expenses`
Response:
```json
{ "expenses": [ ... ] }
```

### `GET /api/expenses/summary?days=7`
Response:
```json
{
  "days": 7,
  "byDay": [ { "date": "YYYY-MM-DD", "total": 123.45 } ],
  "grandTotal": 456.78
}
```
- Invalid/zero `days` defaults to `7`.
- Always returns exactly `days` buckets (0 totals included) for chart continuity.

### `POST /api/expenses`
Body:
```json
{
  "description": "Team lunch",
  "amount": 58.75,
  "currency": "USD",
  "incurredDate": "2024-01-01"
}
```
Validation:
- `description` required (non-empty string)
- `amount` must be a positive number
- `incurredDate` must be `YYYY-MM-DD` (defaults to today if omitted)

### `POST /api/expenses/:id/status`
Body:
```json
{ "status": "approve" }
```
`status` must be one of: `approve`, `reject`, `paid`.

Errors:
- `404` if expense id does not exist
- `400` if payload validation fails

## Dev containers (Codespaces)
A `.devcontainer/devcontainer.json` is included.

## Testing
```bash
npm test
```

## User-visible changes
- **Changes the “Approve” button to a green themed style** (green background/border and hover) to improve visual clarity of the primary approval action.
- Moves the **expenses bar chart** to the **bottom** of the page.
- Enhances chart styling to be more visually striking (glow/gradient background, improved hierarchy, and larger canvas).
- Chart updates when adding an expense, updating status, or refreshing.
- Adds a new API endpoint to support the chart: `GET /api/expenses/summary`.
- Improves demo measurability via automated tests for the summary endpoint and its edge cases.
- Adds **products UI navigation** on the main page (a “Browse products” link to the existing `/products` catalog pages). 
