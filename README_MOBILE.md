# Aether Mobile UI Notes

The mobile redesign uses a ChatGPT-style compact header and slide-out sidebar.

### Mobile layout

- Header: menu, Aether/model, new chat, profile.
- Sidebar: Aether identity, New Chat, conversation search, Chat/Search/Research mode, conversations, Profile and Settings.
- Chat: independent vertical scroll with touch scrolling enabled.
- Composer: safe-area aware bottom spacing.
- Profile and Settings: each owns its own vertical scroll container.
- Keyboard shortcut modal: mobile bottom-sheet style with an independently scrollable body.

### Run on LAN

Vite is configured with `host: 0.0.0.0`.

```bash
npm install
npm run dev -- --host 0.0.0.0
```

The voice recorder on a phone needs HTTPS in modern browsers. The LAN HTTP page may show the mic UI but still be unable to access microphone recording.
