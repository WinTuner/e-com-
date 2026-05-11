# E-Commerce Full-Stack Project

Modern e-commerce storefront built with a static Bootstrap frontend and an Express + SQLite backend.

## Architecture

- `index.html`, `shop.html`, `cart.html`, `checkout.html`, `login.html`, `register.html` provide the customer-facing UI.
- `js/` contains the browser-side behavior for cart syncing, checkout, and auth flows.
- `electro-backend/` is the API layer, written in Express, that handles auth, products, and checkout.
- `electro-backend/src/config/database.js` bootstraps the SQLite database and creates tables on startup.
- `electro-backend/src/routes/`, `controllers/`, `services/`, and `repositories/` separate HTTP, business, and persistence concerns.

### Request Flow

1. The browser calls the Express API under `/api`.
2. Routes validate the request shape and forward it to controllers.
3. Controllers call services for business logic.
4. Services use repositories to read and write SQLite data.
5. JWT authentication protects the checkout and user verification flow.

## Tech Stack

- Frontend: HTML, CSS, Bootstrap, and vanilla JavaScript
- Backend: Node.js, Express, SQLite, bcrypt, jsonwebtoken, dotenv

## Environment Variables

Create `electro-backend/.env` from `electro-backend/.env.example`.

Required values:

- `PORT` - Backend port, default `3000`
- `JWT_SECRET` - Secret used to sign and verify tokens

Optional values:

- `DATABASE_PATH` - SQLite file path, relative to `electro-backend/`
- `AUTH_SERVICE_URL` - Base URL used when the backend needs to call its auth verify endpoint

## Local Setup

1. Install frontend and backend dependencies.
2. Copy `electro-backend/.env.example` to `electro-backend/.env` and fill in the secrets.
3. Start the backend from `electro-backend/server.js`.
4. Open the static frontend in a browser or via a local server.

## Backend Highlights

- JWT login and token verification live in `electro-backend/src/services/AuthService.js`.
- Product and order operations are isolated in service and repository layers.
- The schema is created automatically if the SQLite file does not yet exist.

## Why This Structure Works

- Clear separation of concerns makes the codebase easier to explain in interviews.
- SQLite keeps the stack lightweight while still demonstrating real persistence.
- Environment variables keep secrets out of source control and make deployments safer.

## Interview Summary

This project shows a production-style split between presentation, API, and data layers, with authentication, order processing, and product management implemented in a maintainable way.
