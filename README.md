# 🌐 Rext Web — Production Music Streaming Web App

Rext is a high-fidelity, user-friendly music streaming web platform powered by React 18, Vite, Tailwind CSS, and HTML5 Audio / YouTube IFrame playback engine with real-time audio visualizer and 10-band equalizer.

---

## 🚀 How to Host Online

### Option 1: 1-Click Deploy on Vercel (Recommended)
1. Push this folder to a GitHub repository (e.g. `github.com/your-username/rext-web`).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Framework Preset will auto-detect as **Vite**.
5. Click **"Deploy"**.
*The included `vercel.json` and `api/yt-search.ts` serverless function handle live YouTube searches automatically!*

### Option 2: 1-Click Deploy on Netlify
1. Connect your repository to [netlify.com](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy! The included `netlify.toml` handles redirects and the serverless search function.

### Option 3: Manual Static Hosting (Direct `dist` upload)
1. The `dist/` directory is already pre-built and ready!
2. You can drag and drop the `dist/` folder directly onto [Netlify Drop](https://app.netlify.com/drop) or upload to Cloudflare Pages / GitHub Pages / Apache / Nginx.

---

## 💻 Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Production Build
```bash
npm run build
```
Build output is saved to `./dist`.

