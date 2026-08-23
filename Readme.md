Mini D-Mart — Grocery Store Application

Objective
Build a full-fledged Mini D-Mart / Grocery Store application that allows customers to purchase products, schedule store pickup or home delivery,
and manage returns/exchanges. Treat it as a real-world product rather than a basic CRUD assignment.
Important: Implementation details are intentionally open. You decide the architecture, database design, UI/UX, APIs, workflows and business rules.
Use the open areas to demonstrate creative thinking and problem solving.
Core Application Requirements
User Management Registration & Login • Profile • Multiple Roles • RBAC • Protected APIs & Routes
Product Management Categories • Products • Product Details • Search/Filter • Pricing • Inventory/Stock
Shopping Cart • Quantity Management • Checkout • Order Calculation • Stock Validation
Order Management Order Creation • History • Details • Status/Lifecycle • Cancellation • Store Pickup • Scheduled Pickup • Home

Delivery

Return & Exchange Return Request • Exchange Request • Eligibility • Approval/Rejection • Status • Inventory Handling
Store Operations Staff Dashboard • Order Preparation • Upcoming Pickup Orders • Delivery Orders • Inventory • Return/Exchange

Processing

Security Authentication • Authorization • RBAC • Input Validation • Secure Password Handling • API Security • Access

Control • Secrets/Environment Variables • Audit Logging • Security Review

Product Design Clean UI/UX • Responsive Design • Customer Dashboard • Staff/Manager Dashboard • Admin Dashboard •

Loading/Empty/Error States

Testing & Debugging Functional Testing • Edge Cases • Business Logic Validation • Error Handling • Debugging • Security Testing
Database & Backend Database Design • Relationships • APIs • Business Logic • Validation • Error Handling
Deployment Deploy using any free deployment/hosting service of your choice. Examples may include Vercel, Netlify,
Render, Railway, Cloudflare Pages, or another suitable free platform. Provide a working public URL.
Documentation Project Overview • Architecture • Database Design • API Documentation • RBAC/Permissions • Business Logic •

Setup • Environment Variables • Deployment • Testing • Security Findings • Known Limitations

Submission Requirements
• 1. GitHub Repository: Complete source code with proper project structure.
• 2. Live Application: Publicly accessible hosted application using any suitable free deployment/hosting service.
• 3. Explanation Video: 5–10 minutes covering application flow, major features, architecture, database/design decisions, RBAC, security considerations
and interesting/creative features.
• 4. Documentation: At minimum README.md, SECURITY.md and .env.example.
• 5. Test Credentials: Provide credentials for the roles implemented.
• 6. AI Usage: AI tools are allowed. Mention the tools used and briefly


Deployment (Vercel frontend + Render backend)
This project is ready to deploy with the frontend hosted on Vercel (recommended) and the backend on Render. The steps below prepare the repository and list the environment variables the services need.

A. Backend (Render)
1. Prepare server settings
   - Root: /server (select the server folder when creating the Render service)
   - Build command: (none required for Node) or leave blank
   - Start command: npm run start (ensure package.json has a start script that runs node index.js or nodemon/configured script)
   - Environment: set NODE_ENV=production and PORT (Render sets a port automatically as $PORT)

2. Environment variables (set these in the Render dashboard as secrets)
   - MONGO_URI: mongodb+srv://... (Atlas) or your managed MongoDB URI
   - JWT_SECRET: a strong random secret
   - JWT_EXPIRES_IN: 7d
   - ADMIN_EMAIL: admin@minidmart.com
   - ADMIN_PASSWORD: Admin@123 (change this for production)
   - CLIENT_URL: https://your-frontend.vercel.app
   - (Optional) SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS for emails

3. Database
   - Create a MongoDB Atlas cluster (free tier) and copy the connection string into MONGO_URI.
   - Whitelist Render's IPs or configure access via MongoDB's network settings.

4. Seeding (optional)
   - After the service is running and MONGO_URI is set, run the seed scripts locally or via a one-off Render shell:
       node server/seedAdmin.js
       node server/seedProducts.js
   - These create the admin user and demo product set.

B. Frontend (Vercel)
1. Add a new project in Vercel and connect your GitHub repository.
2. When configuring the project, set Root Directory to /client.
3. Build command: npm run build
4. Output Directory: dist
5. Environment variables (if any; usually not required for a static frontend):
   - VITE_API_URL: https://your-backend.onrender.com/api (set this so the frontend talks to the deployed backend)

C. Build & deploy
1. Push the repository to GitHub.
2. Set up Render service and Vercel project as above.
3. After both are deployed, verify the following:
   - Frontend URL (Vercel) loads and lists products from backend
   - Login works (use seeded admin/customer credentials or register a new account)
   - Checkout and orders work end-to-end

D. Helpful commands and notes
- Local dev frontend: cd client && npm install && npm run dev
- Local prod preview frontend: cd client && npm run build && npm run preview
- Local backend: cd server && npm install && npm run start
- Seed data: node server/seedAdmin.js and node server/seedProducts.js

E. Environment variables reference (summary)
- PORT (optional)
- MONGO_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- ADMIN_EMAIL
- ADMIN_PASSWORD
- CLIENT_URL
- Optional: SMTP_* for email

If you want, I can now:
- Add a short "Deploy to Render & Vercel" checklist to the README with exact UI steps and screenshots (or command-line steps if you prefer).
- Create GitHub Actions to automate deployment (advanced).
- Generate a rendered .env.production example and provide copy-paste-ready Render environment entries.

Which of these should I do next? (I can add the checklist and a ready-to-copy env list.)