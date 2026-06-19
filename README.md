# KYC Demo App

A full-stack Next.js application with user registration, profile completion, and KYC (Know Your Customer) verification flow — backed by a local PostgreSQL database.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Step 1 — Clone / Copy the Project](#4-step-1--clone--copy-the-project)
5. [Step 2 — Install Node.js](#5-step-2--install-nodejs)
6. [Step 3 — Install and Configure PostgreSQL](#6-step-3--install-and-configure-postgresql)
7. [Step 4 — Create the Database](#7-step-4--create-the-database)
8. [Step 5 — Configure Environment Variables](#8-step-5--configure-environment-variables)
9. [Step 6 — Install Dependencies](#9-step-6--install-dependencies)
10. [Step 7 — Run Database Migration](#10-step-7--run-database-migration)
11. [Step 8 — Start the Development Server](#11-step-8--start-the-development-server)
12. [Step 9 — Using the App (Full Flow)](#12-step-9--using-the-app-full-flow)
13. [API Reference](#13-api-reference)
14. [Project Structure](#14-project-structure)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Project Overview

This app demonstrates a complete KYC onboarding flow:

```
Register → Complete Profile → Dashboard → Complete KYC → Callback → Dashboard (Verified)
```

- **Register**: User signs up with name, email, and password.
- **Complete Profile**: User fills in address, gender, date of birth, occupation, etc. (pre-filled with sample data).
- **Dashboard**: Automatically checks KYC status via the KYC API. If not verified, shows a **"Complete KYC"** button.
- **KYC Verification**: Clicking the button calls the KYC SDK token API and opens the verification URL in a new browser tab.
- **Callback**: After completing KYC on the external page, the user is redirected back to `/callback?status=Approved`. The page shows a success screen and a **"Go to Dashboard"** button.
- **Dashboard (Verified)**: Re-checks KYC status and shows the **"KYC Completed"** green badge.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes (server-side) |
| Database | PostgreSQL (local) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Auth | JWT (jsonwebtoken) + bcryptjs password hashing |
| Styling | Tailwind CSS with custom utility classes |

---

## 3. Prerequisites

Make sure the following are installed on the target machine before proceeding.

| Tool | Minimum Version | Download |
|------|----------------|---------|
| Node.js | 18.x or higher | https://nodejs.org |
| npm | 9.x or higher (comes with Node.js) | — |
| PostgreSQL | 14.x or higher | https://www.postgresql.org/download |
| Git (optional) | Any | https://git-scm.com |

### Verify installations

Open a terminal and run:

```bash
node --version
# Expected: v18.x.x or higher

npm --version
# Expected: 9.x.x or higher

psql --version
# Expected: psql (PostgreSQL) 14.x or higher
```

---

## 4. Step 1 — Clone / Copy the Project

### Option A — Copy the folder

Copy the `kyc-app` folder to your system. The path should look like:

```
/your/path/kyc-app/
```

### Option B — Clone from Git (if pushed to a repo)

```bash
git clone <your-repo-url>
cd kyc-app
```

> Make sure you are inside the `kyc-app` directory for all following steps.

---

## 5. Step 2 — Install Node.js

### Windows

1. Go to https://nodejs.org
2. Download the **LTS** version (18.x or higher)
3. Run the installer and follow the prompts
4. Open a new Command Prompt or PowerShell and verify:

```powershell
node --version
npm --version
```

### macOS

```bash
# Using Homebrew (recommended)
brew install node

# Or download the installer from https://nodejs.org
```

### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 6. Step 3 — Install and Configure PostgreSQL

### Windows

1. Download the installer from https://www.postgresql.org/download/windows/
2. Run the installer
3. During setup:
   - Set a **password** for the `postgres` superuser — **remember this password**, you will need it in Step 5
   - Keep the default port: **5432**
   - Keep the default locale
4. Finish installation
5. PostgreSQL service starts automatically on Windows

### macOS

```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16

# Set a password for postgres user
psql postgres -c "ALTER USER postgres PASSWORD 'yourpassword';"
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start the service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set a password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'yourpassword';"
```

---

## 7. Step 4 — Create the Database

You need to create a database called `kyc_demo`.

### Option A — Using psql (command line)

**Windows** — Open "SQL Shell (psql)" from the Start Menu, or:

```powershell
# Add PostgreSQL bin to PATH if psql is not found
# Default path for PostgreSQL 16:
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

psql -U postgres -c "CREATE DATABASE kyc_demo;"
```

**macOS / Linux:**

```bash
psql -U postgres -c "CREATE DATABASE kyc_demo;"
# Enter your postgres password when prompted
```

### Option B — Using pgAdmin (GUI)

1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to your local server
3. Right-click **Databases** → **Create** → **Database**
4. Name it `kyc_demo`
5. Click **Save**

### Option C — Run the provided SQL script

A manual SQL setup script is included at `prisma/setup.sql`. Open it in pgAdmin's Query Tool and execute it — this creates the database and the `User` table in one go.

---

## 8. Step 5 — Configure Environment Variables

Open the file `.env` in the root of `kyc-app/` and update it with your database credentials:

```env
# Replace 'password' with your actual PostgreSQL password
DATABASE_URL="postgresql://postgres:password@localhost:5432/kyc_demo?schema=public"

# JWT secret — can be any long random string
JWT_SECRET="kyc-demo-jwt-secret-key-2024"

# KYC API settings (do not change these)
NEXT_PUBLIC_KYC_API_BASE="https://stg-kycapi.p2eppl.com/v1"
KYC_API_KEY="832d87bb962f0db2803c89ba4b105f41981428aa8b2b4bd220789087bb7e10a59eeb763b510f45bdfb0408830443511dd325c804d958ffb4b41d07ba65f80faa"
```

### Common DATABASE_URL patterns

| Scenario | Value |
|----------|-------|
| Password is `mypassword` | `postgresql://postgres:mypassword@localhost:5432/kyc_demo?schema=public` |
| No password set | `postgresql://postgres@localhost:5432/kyc_demo?schema=public` |
| Custom username `admin` | `postgresql://admin:mypassword@localhost:5432/kyc_demo?schema=public` |
| PostgreSQL on port 5433 | `postgresql://postgres:mypassword@localhost:5433/kyc_demo?schema=public` |

> **Important:** Never commit the `.env` file to Git. It is already listed in `.gitignore`.

---

## 9. Step 6 — Install Dependencies

In the `kyc-app/` directory, run:

```bash
npm install
```

This installs all packages listed in `package.json` including:
- `next`, `react`, `react-dom`
- `prisma`, `@prisma/client`, `@prisma/adapter-pg`
- `pg` (PostgreSQL driver)
- `bcryptjs` (password hashing)
- `jsonwebtoken` (JWT auth)
- `tailwindcss`

Expected output ends with something like:

```
added 481 packages, and audited 481 packages in 30s
```

---

## 10. Step 7 — Run Database Migration

This creates the `User` table in your `kyc_demo` database.

```bash
npx prisma migrate dev --name init
```

### Expected output

```
Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "kyc_demo", schema "public" at "localhost:5432"

Applying migration `20240101000000_init`

The following migration(s) have been created and applied:

migrations/
  └─ 20240101000000_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

### If migration fails

**Error: Authentication failed**
→ Your `DATABASE_URL` password is wrong. Double-check Step 5.

**Error: Database does not exist**
→ You skipped Step 4. Create the `kyc_demo` database first.

**Error: Connection refused**
→ PostgreSQL is not running. Start it:
- Windows: Open Services → start `postgresql-x64-XX`
- macOS: `brew services start postgresql@16`
- Linux: `sudo systemctl start postgresql`

---

## 11. Step 8 — Start the Development Server

```bash
npm run dev
```

### Expected output

```
▲ Next.js 16.2.9 (Turbopack)
- Local:   http://localhost:3000
✓ Ready in 3.4s
```

Open your browser and go to: **http://localhost:3000**

### Build for production (optional)

```bash
npm run build
npm start
```

---

## 12. Step 9 — Using the App (Full Flow)

### Step-by-step walkthrough

**1. Register a new account**
- Open http://localhost:3000
- Fill in your **Full Name**, **Email**, and **Password** (min. 6 characters)
- Click **Create Account**

**2. Complete your profile**
- You are redirected to `/complete-profile`
- Fields are pre-filled with random sample data (address, city, gender, etc.)
- Review or update the fields as needed
- Click **Save & Continue to Dashboard**

**3. Dashboard — KYC not verified**
- You are redirected to `/dashboard`
- The app automatically calls the KYC status API for your email
- An orange banner shows: **"KYC Not Verified"**
- A **"Complete KYC"** button appears in the top-right header AND in the banner

**4. Start KYC verification**
- Click **Complete KYC** (either button)
- The app calls the KYC SDK token API
- A new browser tab opens with the **KYC verification URL**
- Complete the verification steps on that page

**5. Callback after KYC**
- After completing KYC, you are redirected to:
  ```
  http://localhost:3000/callback?status=Approved
  ```
- The callback page shows a **"Verification Submitted!"** screen
- Click **Go to Dashboard**

**6. Dashboard — KYC verified**
- The dashboard re-checks KYC status
- If verified, the banner turns green: **"KYC Verified"**
- The top-right button changes to a green **"KYC Completed"** badge

---

## 13. API Reference

All API routes are under `/api/`. Authentication uses a **Bearer token** in the `Authorization` header.

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | `{ name, email, password }` | Register a new user. Returns JWT token. |
| `POST` | `/api/auth/login` | `{ email, password }` | Login. Returns JWT token. |

### User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/user/profile` | Bearer token | Get full profile of logged-in user. |
| `PUT` | `/api/user/profile` | Bearer token | Update profile fields (address, gender, etc.). |

### KYC

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/kyc/check-status` | Bearer token | Check KYC verification status for the user's email. |
| `POST` | `/api/kyc/get-sdk-token` | Bearer token | Get KYC SDK token and `verifyUrl`. |

---

## 14. Project Structure

```
kyc-app/
├── app/
│   ├── page.tsx                    # Registration page (/)
│   ├── login/page.tsx              # Login page (/login)
│   ├── complete-profile/page.tsx   # Profile completion (/complete-profile)
│   ├── dashboard/page.tsx          # Dashboard (/dashboard)
│   ├── callback/page.tsx           # KYC callback (/callback)
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
│
├── app/api/
│   ├── auth/
│   │   ├── register/route.ts       # POST /api/auth/register
│   │   └── login/route.ts          # POST /api/auth/login
│   ├── user/
│   │   └── profile/route.ts        # GET/PUT /api/user/profile
│   └── kyc/
│       ├── check-status/route.ts   # GET /api/kyc/check-status
│       └── get-sdk-token/route.ts  # POST /api/kyc/get-sdk-token
│
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   └── auth.ts                     # JWT sign/verify helpers
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── setup.sql                   # Manual SQL setup (alternative to migration)
│   └── migrations/                 # Auto-generated migration files
│
├── .env                            # Environment variables (DO NOT commit)
├── prisma.config.ts                # Prisma 7 config (reads DATABASE_URL)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 15. Troubleshooting

### Port 3000 already in use

```bash
# Run on a different port
npm run dev -- -p 3001
```

### `npx prisma migrate dev` fails with P1001 (connection refused)

PostgreSQL is not running. Start it:

```powershell
# Windows (PowerShell as Administrator)
Start-Service postgresql-x64-18

# Or from Services panel: press Win+R → services.msc → find PostgreSQL → Start
```

### `npx prisma migrate dev` fails with P1000 (auth failed)

Your password in `.env` is wrong. To reset the postgres password:

```sql
-- Run in psql as a superuser
ALTER USER postgres PASSWORD 'newpassword';
```

Then update `DATABASE_URL` in `.env` accordingly.

### `Module not found` or TypeScript errors

```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
Remove-Item -Recurse -Force .next   # Windows PowerShell
# rm -rf .next                      # macOS/Linux
npm run dev
```

### KYC API returns an error

- The KYC API key is pre-configured in `.env` — do not change it.
- Make sure the email you registered with is a valid format.
- The staging KYC API at `https://stg-kycapi.p2eppl.com` must be reachable from your network.

### Forgot postgres password (Windows)

1. Open `pg_hba.conf` (usually at `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`)
2. Change `scram-sha-256` to `trust` for local connections
3. Restart PostgreSQL service
4. Run `psql -U postgres` without a password
5. Run `ALTER USER postgres PASSWORD 'newpassword';`
6. Revert `pg_hba.conf` back to `scram-sha-256`
7. Restart PostgreSQL again

---

## Quick Start Checklist

```
[ ] Node.js 18+ installed
[ ] PostgreSQL installed and running
[ ] Database 'kyc_demo' created
[ ] .env file updated with correct DATABASE_URL
[ ] npm install completed
[ ] npx prisma migrate dev --name init completed
[ ] npm run dev running
[ ] App open at http://localhost:3000
```
