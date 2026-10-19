# 🚀 Deployment Guide for RUPA's Query

This guide covers deployment instructions and configurations for the most popular cloud platforms.

---

## ⚠️ Troubleshooting Your Previous Render Deploy Error

### Why did you see `Error: Cannot find module '/opt/render/project/src/dist/server.cjs'`?

1. **Commit Not Yet Pushed to GitHub**:
   The Render build cloned commit `2e219e4`, which was before the `dist/` production assets were created.
2. **Build Command was `bun install` instead of `npm run build`**:
   Render was configured to only run `bun install` during the build phase. Because `bun run build` / `npm run build` was never executed during the build, `dist/server.cjs` was never generated.
3. **Out of Memory during Start**:
   When the start command attempted to build Vite dynamically on free tier (512MB RAM), the process ran out of memory and exited with code `134` (Aborted).

### ✅ How to Fix on Render:

1. In your **Render Dashboard** → Select your **RUPA's Query** Web Service.
2. Go to **Settings** → update the following fields:
   - **Environment / Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `20` (or leave default)
3. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (or let Render set it automatically)
   - `GEMINI_API_KEY`: *(Optional: your Google Gemini API Key for live AI tutoring)*
4. Click **Manual Deploy** → **Clear build cache & deploy**.

---

## 1. 🌐 Render (Web Service or Blueprint)

Render configuration is pre-configured in `render.yaml`.

- **Repository**: `https://github.com/sithaambadipudi5-netizen/Rupa-sQuerey`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: Render automatically routes incoming web traffic to the port your app listens to (`PORT` environment variable).

---

## 2. 🚂 Railway (Recommended for Full-Stack)

Railway automatically detects Node.js and the `Procfile` / `package.json` scripts:

1. Log in to [railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `sithaambadipudi5-netizen/Rupa-sQuerey`.
4. Railway will automatically run:
   - **Build**: `npm run build`
   - **Start**: `npm start`
5. Under **Variables**, add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional)*
6. In **Settings** → **Networking** → Click **Generate Domain**.

---

## 3. ▲ Vercel (Fast Frontend / Global CDN)

A `vercel.json` file is already in your repository root.

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** → **Project** → Import `Rupa-sQuerey`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build` (auto-detected).
5. Output Directory: `dist` (auto-detected).
6. Click **Deploy**.

---

## 4. 🔷 Netlify

A `netlify.toml` file is already configured.

1. Go to [netlify.com](https://netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Connect your GitHub repository.
4. Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy site**.

---

## 5. 🐳 Docker / Fly.io / Google Cloud Run / Koyeb

A multi-stage `Dockerfile` is provided in the repository.

### Local Docker Build & Run:
```bash
docker build -t rupas-query .
docker run -p 3000:3000 rupas-query
```

### Deploy to Fly.io:
```bash
fly launch
fly deploy
```

### Deploy to Koyeb:
1. Connect your GitHub repository.
2. Choose **Dockerfile** as the build method.
3. Koyeb will build the multi-stage image and deploy on their global edge network.

---

## 6. 🔄 Syncing Latest Commits to GitHub

To ensure your GitHub repository has all these fixes and deployment configurations:

```bash
git add .
git commit -m "Add production deployment configs for Render, Railway, Vercel, Netlify, and Docker"
git push origin main
```
