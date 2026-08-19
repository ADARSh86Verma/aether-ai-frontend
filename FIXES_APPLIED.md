# Aether AI frontend fixes

- Conversation API response normalization now matches FastAPI (`data.conversation` / `data.conversations`).
- Added missing rename/favorite service methods.
- ChatContext no longer calls `.map()` on undefined data and normalizes every message with a safe id.
- Real browser streaming implemented with Fetch ReadableStream.
- Streaming requests send `chat_id`, `message`, `model`, `mode`, `file_ids`.
- Regenerate requests are marked `regenerate` so the user message is not duplicated in MongoDB.
- API base is configurable with `VITE_API_BASE_URL` and defaults to `/api`.
