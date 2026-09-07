# jopi — clean build & two-phone test

## 1. Install from a clean checkout

Do **not** copy `node_modules`, `dist`, `android/app/build`, or `.gradle` between machines.

```bash
npm install
```

## 2. Configure the backend URL

Copy `.env.example` to `.env` and set a public HTTPS backend URL:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN
```

For two phones in different locations, the backend must be reachable over the public Internet. Do not use `localhost`, `127.0.0.1`, or a LAN IP.

## 3. Start the backend

```bash
npm run start:server
```

The server listens on `PORT` (default `4000`) and exposes:

- `GET /api/health`
- `GET /api/users/online`
- `GET /api/rooms`
- Socket.IO real-time events
- WebRTC signaling relay events

Put the server behind HTTPS/WSS in production (reverse proxy such as Nginx, or a managed platform that provides TLS).

## 4. Build Android

```bash
npm run cap:sync
npx cap open android
```

Then build/install the debug APK from Android Studio.

## 5. Two-phone test

Use **two different accounts**. The old demo data was local-only; each phone has its own localStorage.

Phone A and Phone B must both point to the same public backend URL. Verify:

1. `https://YOUR-BACKEND-DOMAIN/api/health` returns `status: online`.
2. Both phones can sign in and appear online.
3. A swipe/match event appears on the other phone.
4. A private message arrives on the other phone.
5. Room join/leave state is synchronized.
6. Calling is tested only after a real WebRTC media provider is integrated.

## Important current limitation

`src/services/callService.ts` still contains `MockCallProvider`. The Socket.IO server has signaling relay handlers, but the app does **not** yet establish a real microphone/camera WebRTC media session. A production call flow also needs STUN/TURN infrastructure.

The backend's main social data stores are currently in memory. They survive multiple connected phones while the server remains running, but they are lost on server restart. A production release should move users, matches, conversations, messages, wallet and gift transactions to the existing PostgreSQL/Supabase schema.
