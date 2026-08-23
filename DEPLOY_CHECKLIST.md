Mini D-Mart Deployment Checklist (Vercel + Render)

This checklist walks through deploying the frontend to Vercel and the backend to Render. It assumes your code is pushed to a GitHub repository.

Prerequisites
- GitHub repository with the project code
- Vercel account connected to GitHub
- Render account connected to GitHub
- MongoDB (Atlas recommended) connection string

Step A — Prepare repository
1. Ensure code is committed and pushed to GitHub:
   git add .
   git commit -m "Prepare for deployment"
   git push origin main

2. Confirm server/.env.example exists and contains the env var names needed for production.

Step B — Deploy Backend to Render
1. Create a new Web Service on Render
   - Service type: Web Service
   - Connect to your GitHub repo and select the branch (main)
   - Root Directory: /server
   - Start Command: npm run start
   - Build Command: (leave blank for Node if not required)

2. Environment variables (add these in the Render dashboard under the service's "Environment" tab):
   - MONGO_URI: mongodb+srv://<username>:<pass>@cluster0.mongodb.net/mini-dmart?retryWrites=true&w=majority
   - JWT_SECRET: a-long-random-secret
   - JWT_EXPIRES_IN: 7d
   - ADMIN_EMAIL: admin@minidmart.com
   - ADMIN_PASSWORD: Admin@123
   - CLIENT_URL: https://<your-vercel-url>
   - NODE_ENV: production
   - (Optional) SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

3. Deploy and wait for the service to be healthy. Copy the service URL e.g. https://mini-dmart.onrender.com

4. Seed the database (one-time):
   - Option A: Locally, with MONGO_URI pointing to the production Atlas DB:
       node server/seedAdmin.js
       node server/seedProducts.js
   - Option B: Use Render's one-off shell/console to run the same commands on the server.

Step C — Deploy Frontend to Vercel
1. Create a new project in Vercel
   - Import from GitHub and select the repository
   - Set Root Directory to: /client
   - Build Command: npm run build
   - Output Directory: dist

2. Environment variables (in Vercel project settings):
   - VITE_API_URL: https://<your-render-backend>/api

3. Deploy. Vercel will build the site and publish a frontend URL (https://your-app.vercel.app)

Step D — Post-deploy checks
1. Update Render's CLIENT_URL to the Vercel URL
2. Test the frontend:
   - Login with seeded credentials
   - Browse /shop, add to cart, checkout
   - Verify orders appear in admin dashboard
3. If images or 3rd-party assets fail due to CORS/HTTPS: ensure backend and frontend URLs are HTTPS and match CLIENT_URL settings.

Troubleshooting
- "Failed to fetch" on frontend: ensure VITE_API_URL is set in Vercel and the Render backend is reachable.
- Auth token / CORS: verify server CORS middleware allows CLIENT_URL or origin '*'
- DB connection errors: confirm Atlas IP access and MONGO_URI format

Optional: Automating with GitHub Actions
- Consider adding separate workflows for frontend and backend to build and deploy automatically when main is updated.

If you'd like, I can:
- Commit the deploy.sh and DEPLOY_CHECKLIST.md files (done).
- Generate a Render-friendly env var list in a single file for copy/paste.
- Create GitHub Actions templates to automate build & deploy steps.

Tell me which follow-up you want next.