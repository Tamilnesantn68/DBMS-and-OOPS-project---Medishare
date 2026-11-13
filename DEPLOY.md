# MediShare — Cloud Deployment Guide

Goal: your app runs 24/7 on the internet.
- **Backend (Java + Spring Boot):** Render free plan (Docker)
- **Database (MySQL):** Aiven free plan
- **Frontend:** already live at https://medishare-8115.netlify.app

---

## STEP 0 — Fix the GitHub token (once, 1 minute)

The token saved in ZCode config can read GitHub but not push.

1. GitHub → click your profile picture → **Settings** → **Developer settings** (bottom left)
2. **Fine-grained personal access tokens** → click your existing token
3. Scroll to **Repository permissions** → find **Contents** → set it to **Read and write**
4. Click **Update token** (top right)

Then tell me **"token fixed"** — I will push the `cloud-deploy` branch and continue.

---

## STEP 1 — Free MySQL database on Aiven (5 minutes)

1. Go to **https://console.aiven.io** → sign up free (Google/GitHub login works)
2. Click **Create service** → choose **MySQL**
3. Settings:
   - Cloud/region: pick any (e.g. Google US)
   - Plan: **Free** (Half strict, 1 CPU / 1 GB)
   - Service name: `medishare-mysql`
4. Click **Create service** — it takes ~5 minutes to build
5. When status is **Running**, open the service → **Overview** → copy the **Service URI** (looks like
   `mysql://user:password@host:port/defaultdb?ssl-mode=REQUIRED`)
6. In the left menu → **Databases** → **Create database** → name it `medicine_redistribution`

The connection info goes into Render in the next step.

---

## STEP 2 — Java backend on Render (10 minutes)

1. Go to **https://dashboard.render.com** → sign up / log in with GitHub
2. First time: it asks to **connect your GitHub** — allow access to `Tamilnesantn68/DBMS-and-OOPS-project---Medishare`
3. Click **New +** → **Web Service**
4. Select the repo `DBMS-and-OOPS-project---Medishare`
5. On the creation form:
   - **Branch:** `cloud-deploy` (NOT main — main has the old version)
   - **Runtime:** Docker (auto-detected from the Dockerfile)
   - **Instance type:** Free
6. Expand **Environment variables** and add three:
   | Key | Value |
   |---|---|
   | `DB_URL` | from Aiven, but change the beginning to: `jdbc:mysql://<host>:<port>/medicine_redistribution?ssl-mode=REQUIRED&allowPublicKeyRetrieval=true` |
   | `DB_USER` | Aiven username (e.g. `avnadmin`) |
   | `DB_PASSWORD` | Aiven password |
   | `ALLOWED_ORIGINS` | `https://medishare-8115.netlify.app` |
7. Click **Create Web Service** — the first build takes ~10 minutes (Docker + Maven)

When it shows **Live**, open the service URL (like `https://medishare-api-xxxx.onrender.com`) and add
`/api/auth/me` — you should see `{"authenticated":false}`.

---

## STEP 3 — Wire the Netlify site to the backend (I do this)

Tell me your Render URL and I will:
1. Add a `_redirects` file proxying `/api/*` to your Render URL
2. Redeploy the Netlify site
3. Test the full flow end-to-end on the live URL

---

## Free-tier notes
- **Render free:** service sleeps after 15 min idle → first request takes ~1 min to wake. It also restarts weekly (data in the DB is safe — only the container resets).
- **Aiven free:** 5 GB storage, no expiry.
- The default admin (`admin` / `admin123`) and the schema are created automatically on first start.
