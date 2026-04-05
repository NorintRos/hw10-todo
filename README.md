# HW10 Todo

Server-rendered todo app built with Express and Handlebars. The app supports two persistence modes:

- MongoDB with local email/password authentication
- Supabase with Supabase Auth and per-user todo storage

## Features

- Sign up, login, and logout
- Session-based authentication
- Per-user todo list
- Create, edit, complete, and delete todos
- Switchable database provider via `DB_TYPE`

## Requirements

- Node.js 20+
- npm
- One database backend:
  - MongoDB Atlas or another MongoDB instance
  - Supabase project

## Installation

```bash
npm install
```

Create a local `.env` file from `.env.example` and fill in the values for the backend you want to use.

## Environment Variables

```env
PORT=3000
SESSION_SECRET=replace-with-a-long-random-string
DB_TYPE=mongodb
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hw10-todo
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Variable Notes

- `SESSION_SECRET`: random string used to sign the Express session cookie
- `DB_TYPE`: `mongodb` or `supabase`
- `MONGO_URI`: required when `DB_TYPE=mongodb`
- `SUPABASE_URL`: required when `DB_TYPE=supabase`
- `SUPABASE_ANON_KEY`: used for email/password login in Supabase mode
- `SUPABASE_SERVICE_ROLE_KEY`: used server-side to create users and query per-user todos in Supabase mode

## Running the App

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The app runs on `http://localhost:3000` unless `PORT` is overridden.

## MongoDB Setup

1. Create a MongoDB database and obtain the connection string.
2. Set:

```env
DB_TYPE=mongodb
MONGO_URI=your-mongodb-connection-string
SESSION_SECRET=your-random-secret
```

3. Start the app with `npm run dev`.

MongoDB mode stores users and todos in MongoDB. Each todo is linked to its owner with `userId`.

## Supabase Setup

### 1. Create a project

Create a new project in the Supabase dashboard.

### 2. Enable email/password auth

In the dashboard:

1. Open `Authentication`
2. Open `Providers`
3. Enable the Email provider

### 3. Get the API values

In the dashboard, open `Settings -> API` and copy:

- Project URL -> `SUPABASE_URL`
- anon/public key -> `SUPABASE_ANON_KEY`
- service role key -> `SUPABASE_SERVICE_ROLE_KEY`

Generate your own session secret locally, for example:

```bash
openssl rand -base64 32
```

### 4. Configure `.env`

```env
DB_TYPE=supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-random-secret
PORT=3000
```

### 5. Create the todos table

Run the SQL in [supabase/setup_auth.sql](/home/grid/back-end-web/hw10-todo/supabase/setup_auth.sql) inside the Supabase SQL Editor:

1. Open your project dashboard
2. Click `SQL Editor`
3. Click `New query`
4. Paste the contents of `supabase/setup_auth.sql`
5. Click `Run`

This creates a `public.todos` table with a `user_id` column linked to `auth.users(id)`.

If `gen_random_uuid()` fails, enable the `pgcrypto` extension in Supabase and run the SQL again.

### 6. Start the app

```bash
npm run dev
```

## Authentication Behavior

- Signup creates an account and immediately signs the user in
- Login uses email and password
- Logout clears the session cookie
- All todo routes require authentication
- Todos are isolated per user

## Tests

Run:

```bash
npm test
```

The automated tests cover:

- redirecting unauthenticated users to login
- signup and login flow
- logout flow
- per-user todo isolation

## Project Structure

- `app.js`: app bootstrap and session wiring
- `routes/auth.js`: signup, login, logout routes
- `routes/todos.js`: protected todo routes
- `lib/database/`: provider abstraction and backend implementations
- `views/`: Handlebars templates
- `supabase/setup_auth.sql`: Supabase table setup
- `test/app.test.js`: route-level auth tests
