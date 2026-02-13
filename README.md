# Spicy Pepper Shop (Nx)

A tiny TypeScript frontend + Node/Express backend designed for Cypress training.

## Quick Start

1. Install dependencies

```
npm install
```

2. Start API and frontend (two terminals)

```
# Terminal 1
npx nx serve api

# Terminal 2
npx nx serve web
```

Or run both together:

```
npm run dev
```

3. Reset data

```
npm run reset
```

## URLs
- Frontend: http://localhost:4200
- API: http://localhost:3333/api
- Swagger UI: http://localhost:3333/api-docs
- OpenAPI JSON: http://localhost:3333/openapi.json

## API Routes
- `GET /api/health`
- `GET /openapi.json`
- `GET /api-docs`
- `POST /api/reset`
- `GET /api/accounts`
- `POST /api/accounts`
- `DELETE /api/accounts/:id`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `POST /api/orders`

## Cypress Notes
- The UI uses stable `id` selectors and a few `data-cy` hooks.
- The `POST /api/reset` endpoint restores seed data for repeatable tests.

## Example Reset Call

```
curl -X POST http://localhost:3333/api/reset
```


## Login
Seeded accounts use password `pepper123`.
Example: `Chili Lover / pepper123`.


## Admin reset
Reset requires the admin account:
- Name: `admin`
- Password: `spicelord`

Use:
```
npm run reset
```
