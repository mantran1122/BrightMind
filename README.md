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

## Current verification

- `npm run lint` passes
- Production build could not be fully verified in this environment because `next build` ends with a local `spawn EPERM` process error after TypeScript starts
