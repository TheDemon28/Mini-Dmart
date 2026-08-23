#!/usr/bin/env bash
# Deploy helper script for Mini-Dmart
# This script prepares the repo for deployment, builds the frontend, and shows the Git commands
# It does NOT automatically create provider projects or set environment variables in remote consoles.

set -euo pipefail

echo "Preparing Mini-Dmart for deployment..."
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
SERVER_DIR="$ROOT_DIR/server"

# 1) Install dependencies (optional / uncomment if you want local install)
# echo "Installing frontend deps..."
# (cd "$CLIENT_DIR" && npm install)
# echo "Installing backend deps..."
# (cd "$SERVER_DIR" && npm install)

# 2) Build frontend
echo "Building frontend (client)..."
(cd "$CLIENT_DIR" && npm run build)

# 3) Print small checklist for pushing & connecting to cloud providers
echo
echo "Build complete. Next steps to deploy:"
cat <<'EOF'
1) Push code to GitHub (create / use a repository):
   git add .
   git commit -m "Prepare for deployment: build and deployment checklist"
   git push origin main

2) Frontend (Vercel):
   - Create a new project in Vercel and connect the GitHub repo
   - Set the Root Directory to: /client
   - Build Command: npm run build
   - Output Directory: dist
   - Add Environment Variable: VITE_API_URL=https://<your-backend-url>/api (optional, recommended)
   - Deploy the project and copy the frontend URL

3) Backend (Render):
   - Create a new Web Service on Render and connect the GitHub repo
   - Root Directory: /server
   - Start Command: npm run start
   - Environment: set NODE_ENV=production
   - Add environment variables (see server/.env.example for names)
   - Deploy the service and copy the backend URL (e.g., https://mini-dmart.onrender.com)

4) Update frontend VITE_API_URL to point to the deployed backend (in Vercel env settings)

5) Seed the database (after backend is running and MONGO_URI is set):
   - Locally: node server/seedAdmin.js && node server/seedProducts.js
   - Or via a Render one-off shell / run command: run 'node server/seedAdmin.js' and 'node server/seedProducts.js'

6) Verify end-to-end:
   - Open frontend URL, register/login, and place a test order.
   - Use seeded credentials: admin@minidmart.com / Admin@123 and customer@minidmart.test / Customer123!
EOF

# 4) Show helpful environment variable list
echo
echo "Copy-ready environment variables for Render (key=value):"
cat <<'ENV'
# Render / Production environment variables
MONGO_URI=your_mongo_connection_string
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@minidmart.com
ADMIN_PASSWORD=Admin@123   # change this for production
CLIENT_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
# Optional: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
ENV

echo
echo "deploy.sh finished. Follow the checklist above to deploy to Vercel (frontend) and Render (backend)."

exit 0
