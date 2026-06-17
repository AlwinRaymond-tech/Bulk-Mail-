# Deployment

This app deploys as two services:

- Backend API on Render from the repository root using `render.yaml`
- Frontend on Vercel with the project root set to `client`

## Render

Create a new Blueprint from this GitHub repository. Render reads `render.yaml` from the repository root and builds the backend from `server`.

Set these environment variables in Render:

- `MONGODB_URI`
- `CLIENT_ORIGIN` with the Vercel frontend URL, for example `https://bulkmail.vercel.app`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`

Render generates `JWT_SECRET` from the blueprint.

## Vercel

Import the same GitHub repository into Vercel and set:

- Root Directory: `client`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Set this environment variable in Vercel:

- `VITE_API_BASE_URL` with the Render API URL plus `/api`, for example `https://bulkmail-api.onrender.com/api`
