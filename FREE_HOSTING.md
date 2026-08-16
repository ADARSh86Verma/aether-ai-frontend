# Free frontend hosting

This project is a Vite/React frontend.

## Vercel
1. Import this project/repository into Vercel.
2. Framework: Vite.
3. Build command: npm run build
4. Output directory: dist
5. Add your production backend API URL as the frontend environment variable used by `src/services/api.js`.
6. Deploy.

`vercel.json` is included for React Router SPA fallback.

## Netlify
1. Build command: npm run build
2. Publish directory: dist
3. `_redirects` is included for React Router SPA fallback.

IMPORTANT:
The FastAPI backend, Ollama, Whisper and local `192.168.x.x` URLs cannot be hosted by Vercel/Netlify as part of this static frontend. The deployed frontend must point to a publicly reachable HTTPS backend API.
