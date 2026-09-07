# jopi

jopi is a React + Vite + Capacitor Android application with an Express + Socket.IO backend.

## Clean project rules

Generated files are intentionally not shipped:

- `node_modules/`
- `dist/`
- `android/app/build/`
- `android/.gradle/`
- `android/.idea/`
- `android/local.properties`
- `android/app/src/main/assets/public/*`

After extracting the project, install dependencies and regenerate the web assets:

```bash
npm install
npm run build
npx cap sync android
```

## Backend

```bash
npm run start:server
```

Configure `VITE_API_URL` for the Android build using `.env` (see `.env.example`). For two phones in different locations this must be a public HTTPS endpoint.

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the complete two-device test sequence and the remaining production limitations.
