# expense-approval-app

Full-stack expense approval app in one repo.

## What’s included (demo slice)
- **Node + Express REST API**
  - `GET /api/expenses` — list expenses
  - `POST /api/expenses` — create an expense (basic validation)
  - `POST /api/expenses/:id/status` — update status: `approve | reject | paid`
  - In-memory seed with **3** expenses at startup
- **Frontend served by Express** at `/` (HTML/CSS/JS)
  - Lists expenses
  - Form to create expenses
  - Approve/Reject/Paid buttons
- **Tests**: one API test using **Jest + Supertest**

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
- Provides an end-to-end expense approval UI and API in a single repo.
- Adds seed data, status update flow, and error handling for invalid inputs.
