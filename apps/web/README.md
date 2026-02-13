# Spicy Pepper Shop Web

This is the frontend for the Spicy Pepper Shop training app.

## Summary
- Built with TypeScript.
- Multi-page SPA with menu navigation.
- Designed for Cypress training (stable selectors, predictable flows).
- Works with the local API at `http://localhost:3333/api`.

## Pages
- Shop (`#/shop`)
- Product detail (`#/product/:id`)
- Cart (`#/cart`)
- Orders (`#/orders`)
- Order detail (`#/orders/:id`)
- Admin (`#/admin`)
- Login (`#/login`)

## Run
From the workspace root:

```
npx nx serve web
```

Frontend: http://localhost:4200

## Login
Seeded accounts use password `pepper123`.
Example: `Chili Lover / pepper123`.

## Reset Data
Reset the backend data from the workspace root:

```
npm run reset
```


## Admin
Admin access uses:
- Name: `admin`
- Password: `spicelord`

The reset button is only visible for the admin user.
Admin can view all orders and see which account placed each order.
