# Aether AI — Vercel + FastAPI setup

This frontend is configured to proxy `/api/*` and `/media/*` to the current Cloudflare Quick Tunnel:

`https://facial-length-sodium-arm.trycloudflare.com`

## Important
The `trycloudflare.com` Quick Tunnel is temporary. If you restart `cloudflared`, update `vercel.json` with the new tunnel URL and redeploy.

## Deploy
```bash
npm install
npm run build
git add .
git commit -m "Fix Vercel API proxy and frontend runtime errors"
git push origin main
```

The frontend should continue using `/api` as its Axios base URL. Do not change it to `127.0.0.1` or the LAN IP for the Vercel deployment.
