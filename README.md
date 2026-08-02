# Tech Gadgets Store

A full-stack MERN e-commerce project with a role-based admin dashboard. This is an npm-workspaces monorepo containing two independently deployable projects:

| Workspace | What it is | Docs |
|---|---|---|
| [`client/`](./client) | React + Vite storefront and admin dashboard | [client/README.md](./client/README.md) |
| [`server/`](./server) | Express + MongoDB API | [server/README.md](./server/README.md) |

**Live demo:** https://tech-gadgets-client.vercel.app/
**API:**https://tech-gadgets-server-kappa.vercel.app/api/v1

## Quick Start

Install everything from the repo root — npm workspaces installs both `client` and `server` dependencies in one pass:

```bash
npm install
```

Then run each side in its own terminal:

```bash
npm run dev:server    # starts the Express API (http://localhost:5000)
npm run dev:client    # starts the Vite dev server (http://localhost:5173)
```

See each workspace's own README for environment variables, full API routes, and deployment specifics, the root README only covers what's shared between them.

## Available Root Scripts

```bash
npm run dev:client        # Start the React dev server
npm run dev:server         # Start the API with nodemon (auto-restart)
npm start                   # Start the API in production mode
npm run build:client       # Build the React app for production
npm run lint:client        # Lint the client
npm run preview:client     # Preview the built client locally
npm run test:server         # Run server tests
```

## Deployment

Client and server are deployed separately:

- **Client** → Vercel (static build + SPA rewrite rule, see: [client/README.md](./client/README.md#deployment))
- **Server** → Vercel (see: [server/README.md](./server/README.md#deployment-notes))

Set `VITE_API_URL` in the client's deployment environment to point at the deployed server URL, and make sure the server's CORS configuration allows the client's deployed origin.

## License

This project is under a custom portfolio license, see LICENSE for details.