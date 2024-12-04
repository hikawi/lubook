# Backend

## Description

This is the documentation for this backend architecture. Here's a short description of every part:

- **PostgreSQL**: relational database, this resides on the same machine as the Express server, so the URL should be `localhost`. The database itself only accepts connections from `localhost`. Uses `drizzle-orm` on express for the simple queries, if you need advanced, run raw SQL with `drizzle`.
- **ExpressTS**: written with ES modules in TypeScript on Express. I moved away from CommonJS for much better support on `vitest` for testing the backend. This includes some middlewares: `body-parser`, `cookie-parser`, and `cors`.

## Project Structure

Everything resides in the `src` directory:

- `/src/controllers`: Main request handlers, usually named like an Angular file, eg: `user.controller.ts`.
- `/src/db`: Database-related files, for example, actual SQL queries (`/src/db/queries`) or the database's schema (`/src/db/schema`). I try to put my SQL queries here instead of in the request handlers like in my group project. **The email handler is also here because it feels like a one-off thing, but it also manages the verifications table, I think it works here for now**.
- `/src/routes`: Express routers, to chain multiple middlewares together, see `middlewares.ts`.
- `/src/tests`: Server test files, using `supertest`.
- `app.ts`: The main server file.
- `middlewares.ts`: Contains commonly used middlewares, for example `softAuth`, and `auth`.

The difference between the `softAuth` and `auth` middlewares is that: **softAuth** checks if the auth cookie is present and bind that to the `bearer` field of the request, and **auth** does the same thing as _softAuth_ but it instantly fails the route with 401 (Forbidden) if the auth cookie isn't present.

## Documentation Meaning

Clearance Level (access permissions):

- **0 (Unclassified)**: Everyone can access this endpoint.
- **1 (Confidential)**: Logged in users can access this endpoint.
- **2 (Restricted)**: Approved users can access this endpoint. Approved users are users who have proven themselves to be good within the community.
- **3 (Secret)**: Site moderators can access this endpoint. They are doing most of content moderation work.
- **4 (Top Secret)**: Site administrators can access this endpoint. This involves promoting and demoting moderators.
- **5 (Executive)**: Only those who have access to the console should have access to this endpoint. I have no clue what this is used for.

Object Class (how contained is the action? is it within small regions of collection, or disrupt multiple at once?):

- **Safe**: This involves just looking up, and nothing in the database is changed.
- **Euclid**: Some fields of the database are changed.
- **Keter**: Multiple collections were affected deeply.
- **Apollyon**: The entire database was affected deeply.

## API Routes

All API requests on production server should go to `https://api.lubook.club/`. On your local development server, start both the server and client separately, and let client read from `localhost`. Or, that's what I do.

### User Routes (`user.controller.ts`)

#### Login (`POST /api/login`)

Attempt to login and receive a cookie with the token. This lasts 7 days.

- Clearance Level: 0
- Object Class: Safe
- Accepts JSON:
  - `profile` string: the username or the email
  - `password` string: a plain-text password (might be bad)
- Returns:
  - `200` (Success): if the profile and password match.
  - `400` (Bad Request): if the request body is malformed.
  - `401` (Unauthorized): the profile matches, but password doesn't.
  - `404` (Not Found): the profile doesn't match anything.

#### Register (`POST /api/register`)

Attempt to register the user.

- Clearance Level: 0
- Object Class: Euclid
- Accepts JSON:
  - `name` string: The display name, optional.
  - `username` string: The username of the user, must be unique.
  - `email` string: The email of the user, must be unique. Will be used for email verification.
  - `password`: The plain-text password.
- Returns:
  - `201` (Resource Created): a new user and profile has been created.
  - `400` (Bad Request): body request is malformed.
  - `409` (Conflict): the account already exists, taken username or taken email.

#### Logout (`POST /api/logout`)

Attempt to logout the user. This just invalidates the _authorization_ cookie, and checks nothing else.

- Clearance Level: 0
- Object Class: Safe
- Accepts nothing.
- Returns:
  - `204` (No Content): Nothing to send back. Logout was successful.
