# CareerOrbit

A public opportunity board for government and private jobs, internships, hackathons, and scholarships. One administrator can create, edit, and delete posts.

## Stack

- Next.js 15 and React 19 for the public site and admin dashboard
- Express.js for the API
- MongoDB Atlas with Mongoose for durable posts and the single admin account

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env`. Add your MongoDB connection string, a random `SESSION_SECRET` of at least 32 characters, and the email and password you want for the sole administrator. The MongoDB URI belongs only in `.env`, which is ignored by Git.
3. Run `npm run admin:setup` once to create the admin account. Running it again updates that one account's email and password. Remove `ADMIN_PASSWORD` from `.env` after setup if you do not need to reset it.
4. Run `npm run dev`. Open `http://localhost:3000` for the public site or `http://localhost:3000/admin` for the dashboard.

If your local DNS server rejects MongoDB Atlas SRV lookups, set `MONGODB_DNS_SERVERS=8.8.8.8` in your local `.env`. Leave it unset on Render unless that host also needs a custom resolver.

In development, Next.js forwards `/api/*` to Express on port 4000. For a Node.js host in production, run `npm run build` and `npm start`. The production entry point serves both Next.js and Express on the host's `PORT`, so one Node service is enough. Configure a production `SESSION_SECRET`, MongoDB network access, and HTTPS before making the site public. Separate-service hosting is also supported with `start:web`, `start:api`, and `API_ORIGIN` pointing to Express.

### Deploy on Render

The included `render.yaml` creates one Node web service. Push this directory to a GitHub, GitLab, or Bitbucket repository connected to Render, then create a Render Blueprint from that repository. During the initial setup, enter `MONGODB_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Render's secret prompts. Render generates `SESSION_SECRET`, builds the site, runs the admin setup once, and starts the service. Keep these values out of Git.

In MongoDB Atlas Network Access, allow the outbound IP ranges shown in the Render service's **Connect → Outbound** panel. After the initial admin setup succeeds, remove `ADMIN_PASSWORD` from Render's environment variables so the plaintext setup password is no longer retained there.

## Deadline behavior

The last date is interpreted in India Standard Time. A post remains visible through that entire day. Public API queries exclude it immediately after midnight IST. MongoDB's TTL index on `expiresAt` permanently deletes its document shortly afterward (TTL deletion is asynchronous, usually within about a minute).

## API

Public: `GET /api/posts`, `GET /api/posts/:id`, `GET /api/stats`, `GET /api/categories`.

Admin: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, and authenticated CRUD at `/api/admin/posts`.

All admin mutations use an HTTP-only, same-site session cookie. Posting links must use HTTPS. The public side shows live active counts and filters by category and search. The admin dashboard shows total active posts, those closing soon, and counts by category.
