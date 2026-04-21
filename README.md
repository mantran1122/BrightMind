# BrightMind Next.js Demo

Demo website built with Next.js App Router, localStorage-based auth/roles, blog management, reviews, Google login via Firebase, and contact mail support.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local env file:

```bash
cp .env.example .env.local
```

3. Fill `.env.local` with:
- Gmail SMTP credentials for the contact form
- Firebase Web App credentials for Google login

4. Start the project:

```bash
npm run dev
```

## Environment variables

Required values:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CONTACT_RECEIVER_EMAIL=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=
```

Notes:
- `.env.local` is ignored by git and should not be committed.
- `NEXT_PUBLIC_*` variables are safe to expose to the browser, but SMTP secrets are not.

## Git quick start

If this repo has no remote yet:

```bash
git init
git add .
git commit -m "Prepare BrightMind demo for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

If git is already initialized:

```bash
git add .
git commit -m "Prepare BrightMind demo for deployment"
git push
```

## Deploy to Vercel

Recommended flow:

1. Push the project to GitHub.
2. Go to Vercel and choose `Add New Project`.
3. Import the GitHub repository.
4. In `Environment Variables`, add every variable from `.env.local`.
5. Deploy.

Project settings for Vercel:
- Framework preset: `Next.js`
- Build command: `next build`
- Output setting: leave default

Important:
- Add the production domain to Firebase Authentication `Authorized domains`.
- If Google login works locally but fails on Vercel, this is usually the missing step.

## MySQL with XAMPP

Default local config for XAMPP:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=brightmind_db
```

Quick setup:

1. Start `Apache` and `MySQL` in XAMPP.
2. Restart `npm run dev`.
3. Open `http://localhost:3000/api/db-setup` with a `POST` request once to create `brightmind_db` and the required table automatically.
4. Open `http://localhost:3000/api/db-test` to verify the connection.

Optional manual setup:
- You can still import [database/brightmind_db.sql](D:\PV\test2\database\brightmind_db.sql:1) in phpMyAdmin if you prefer creating it manually.

Current usage:
- Contact form submissions are saved to MySQL when the MySQL env vars are configured.
- The contact API still sends email through SMTP as before.
- Full schema now includes `users`, `blog_posts`, `reviews`, `auth_sessions`, and `contact_messages`.

## Current verification

- `npm run lint` passes
- Production build could not be fully verified in this environment because `next build` ends with a local `spawn EPERM` process error after TypeScript starts
