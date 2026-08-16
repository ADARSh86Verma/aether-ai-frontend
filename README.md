# Aether — Premium AI Coding Assistant (Frontend)

A frontend-only, production-ready UI for an AI coding assistant. Dark glassmorphic
theme, blue → purple → cyan gradient, built with React + SCSS + Framer Motion.
Includes a full authentication system, user profile, and settings — all backed
by **dummy, in-memory/localStorage auth with no backend, database, or real
network calls**.

## Stack

- React 18 (JavaScript, no TypeScript)
- React Router DOM
- SCSS (variables, mixins, animations — no framework)
- Framer Motion
- React Icons
- React Markdown + remark-gfm
- react-syntax-highlighter
- Axios (service layer only)

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and opens on the **Welcome** screen.
From there: Continue → Log in / Create account → Chat.

There's a demo responder built into `ChatContext` so you can try the full
chat experience (streaming, thinking state, regenerate, stop) without any
backend running, and a dummy `AuthContext` so login/signup/password-reset
all work end-to-end with simulated latency and no real credential checks.

## Routes

| Path | Page | Guard |
|---|---|---|
| `/welcome` | Animated landing / intro | Public |
| `/login` | Email or username login, OAuth buttons, remember me | Redirects to `/chat` if already signed in |
| `/signup` | Full name, username, email, password + strength meter, terms, email verification step | Same |
| `/forgot-password` | Email → OTP → reset password → success | Same |
| `/chat`, `/chat/:chatId` | The chat app shell (Header + Sidebar + AI Chat) | Requires auth |
| `/profile` | Avatar, stats, preferences, connected accounts, security, API keys, billing, danger zone | Requires auth |
| `/settings` | General, AI, Workspace, Editor, Terminal, Notifications, Security, About tabs | Requires auth |
| `/` | Redirects to `/chat` or `/welcome` depending on auth state | — |

Route guards live in `src/routes/RequireAuth.jsx` and `RedirectIfAuthed.jsx`.

## Connecting real authentication

`src/context/AuthContext.jsx` is intentionally the single place dummy auth
lives. Every exported method (`login`, `loginWithProvider`, `signup`,
`verifyEmail`, `requestPasswordReset`, `verifyResetCode`, `resetPassword`,
`changePassword`, `deleteAccount`, …) simulates latency with a timeout and
returns/throws the shape the UI expects — swap the body of each for a real
API call and nothing else in the app needs to change. Session state is
mirrored to `localStorage` under `aether-auth-user` / `aether-auth-session`
purely so refreshing the page doesn't log you out in this demo; replace
that with real session cookies/JWT handling when you connect a backend.

`src/pages/Profile/ApiKeysModal.jsx` and `BillingModal.jsx` similarly hold
seed/dummy data with clear comments on the endpoints they're meant to call.

## Connecting your FastAPI chat backend

`src/services/api.js` defines the exact contract the chat UI expects:

| Method | Endpoint | Purpose |
|---|---|---|
| `sendMessage` | `POST /chat/send` | Non-streaming reply |
| `streamMessage` | `POST /chat/stream` | Token-streamed reply |
| `newChat` | `POST /chat/new` | Create a conversation |
| `clearChat` | `POST /chat/clear` | Clear messages in a conversation |
| `getConversations` | `GET /chat/history` | List conversations for the sidebar |
| `renameChat` | `PATCH /chat/:id/rename` | Rename a conversation |
| `deleteChat` | `DELETE /chat/:id` | Delete a conversation |

Base URL defaults to `http://127.0.0.1:8000` (see `services/api.js` and
`vite.config.js`'s dev proxy). To go live, swap the `buildDemoReply` + local
streaming loop inside `src/context/ChatContext.jsx` for calls to
`sendMessage` / `streamMessage`.

## Folder structure

```
src/
  components/
    Header/       sticky glass header, model badge, theme toggle, user menu
    Sidebar/      search, favorites, recent chats, rename/delete
    Chat/         welcome screen + message list container
    Message/      message bubble, markdown renderer, typing animation
    Input/        auto-resizing chat input
    Auth/         AuthLayout, FormField, PasswordInput, PasswordStrengthMeter,
                  OtpInput, OAuthButtons — shared across Login/Signup/Forgot
    SettingsUI/   Toggle, SelectField, Slider, SettingRow — used by Settings
                  and Profile
    UserMenu/     floating avatar dropdown (profile, workspace, settings,
                  shortcuts, help, docs, logout)
    Common/       Button, Modal, Toast, Tooltip, SearchBar, Avatar, etc.
  pages/
    Welcome/, Login/, Signup/, ForgotPassword/   auth flow
    Profile/      profile page + ApiKeysModal + BillingModal
    Settings/     tabbed settings page + all panel components
    Home/         composes the three-section chat layout
  context/         Theme, Settings, Auth, Chat, Toast providers
  routes/          RequireAuth, RedirectIfAuthed guards
  hooks/           useAutoResize, useClickOutside
  services/        api.js (Axios service methods only)
  utils/           formatTime.js, id helpers
  styles/          _variables.scss, _mixins.scss, _animations.scss,
                   _auth-shared.scss, global.scss
```

## Design notes

- **Palette:** deep navy background (`#0e1120`) with a blue (`#4f7cff`) →
  purple (`#a855f7`) → cyan (`#22d3ee`) gradient used for the logo mark,
  primary buttons, active states, and an ambient "aurora" backdrop. The
  accent color is user-selectable in Settings → General and is implemented
  as CSS custom properties (`--accent-grad`, `--accent-solid`, etc.) on
  `<html data-accent="...">`, so switching it re-themes buttons, links,
  gradients, and glows across every page instantly.
- **Type:** Sora for display/headings, Inter for body text, JetBrains Mono
  for code.
- **Motion:** Framer Motion drives message entrance, modal transitions,
  sidebar drawer, dropdown menus, and hover micro-interactions. All
  animations respect `prefers-reduced-motion`.
- **Responsive:** sidebar becomes an off-canvas drawer under 768px; the
  auth brand panel hides under 768px; settings nav becomes a horizontal
  scroller under 1080px; profile grid stacks to one column on tablets.

