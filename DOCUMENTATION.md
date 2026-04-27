# OPAL AUTH SYSTEM — Full Stack Documentation

## Overview
Opal is a secure authentication gateway built with Next.js 16, NextAuth v4, MongoDB Atlas, and Mongoose.
The Login/Signup page acts as the **only entry point** — the dashboard is completely inaccessible without authentication.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 16 (App Router) | Pages, routing, SSR |
| Auth Library | NextAuth.js v4 | JWT session management, credential auth |
| Database | MongoDB Atlas | User data + login history storage |
| ODM | Mongoose | Schema validation + DB queries |
| Password Security | bcryptjs (12 rounds) | Secure password hashing |
| Background FX | Canvas 2D (Three.js-style) | Particle network animation |
| Fonts | Share Tech + Titillium Web | Primary + Secondary typography |
| Styling | Pure CSS-in-JS + Tailwind | Component styles |

---

## Project File Structure

```
opal-auth/
├── app/
│   ├── page.js               ← LOGIN/SIGNUP PAGE (Main Gateway)
│   ├── layout.js             ← Root layout with SessionProvider
│   ├── globals.css           ← Global resets
│   ├── providers.js          ← NextAuth SessionProvider wrapper
│   ├── dashboard/
│   │   └── page.js           ← Protected Dashboard (requires auth)
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.js  ← NextAuth handler (JWT, Credentials)
│       ├── register/
│       │   └── route.js      ← POST /api/register
│       └── login/
│           └── route.js      ← POST /api/login
├── lib/
│   └── mongodb.js            ← MongoDB Atlas connection (cached)
├── models/
│   └── User.js               ← Mongoose User schema
├── .env.local                ← Environment variables
└── jsconfig.json             ← Path aliases (@/*)
```

---

## Environment Variables (.env.local)

```env
DATABASE_URL="mongodb+srv://alonesurvivor03_db_user:R0mF1gnz6fqAPtAu@cluster0.mongodb.net/opal?retryWrites=true&w=majority"
NEXTAUTH_SECRET="apna_purana_secret_ya_naya_generate_karein"
NEXTAUTH_URL="http://localhost:3000"
```

---

## MongoDB Atlas — User Document Schema

```js
{
  _id: ObjectId,          // Auto-generated unique ID
  name: String,           // Full name (min 2 chars)
  email: String,          // Unique, lowercase, indexed
  password: String,       // BCrypt hash (12 rounds)
  loginCount: Number,     // Total login count (auto-incremented)
  loginHistory: [{        // Last 50 login records
    timestamp: Date,
    ip: String,
    userAgent: String
  }],
  lastLogin: Date,        // Most recent login timestamp
  isActive: Boolean,      // Account status
  createdAt: Date,        // Registration timestamp
  updatedAt: Date         // Last update timestamp
}
```

---

## User Login Process (Step by Step)

| Step | Title | What Happens |
|------|-------|-------------|
| 1 | Credential Entry | User enters email + password in form |
| 2 | Request Dispatch | `signIn('credentials', {...})` calls NextAuth |
| 3 | Security Middleware | Rate limiting: max 10 attempts / 15 min per IP |
| 4 | User Identification | `User.findOne({ email })` in MongoDB Atlas |
| 5 | Hash Comparison | `bcrypt.compare(password, user.password)` |
| 6 | Token Generation | NextAuth generates JWT with user data |
| 7 | Cookie/Session Storage | JWT stored in httpOnly cookie via NextAuth |
| 8 | Identity Response | Success + user data returned to frontend |
| 9 | Authorized Access | `router.replace('/dashboard')` — user redirected |

---

## User Sign-Up Process (Step by Step)

| Step | Title | What Happens |
|------|-------|-------------|
| 1 | Data Submission | User fills name, email, password, confirm |
| 2 | Client Validation | Frontend checks: empty fields, email format, password match, min length |
| 3 | Endpoint Request | `POST /api/register` with JSON body |
| 4 | Security Check | Rate limiting: max 5 registrations / 15 min per IP |
| 5 | Email Check | `User.findOne({ email })` — rejects if already exists |
| 6 | Password Hashing | `bcrypt.hash(password, 12)` — secure hash |
| 7 | User Creation | `User.create({...})` — saves to MongoDB Atlas |
| 8 | Automated Welcome | *(Integration point for email service)* |
| 9 | JWT Generation | Auto-login via `signIn('credentials', {...})` |
| 10 | Dashboard Redirect | `router.replace('/dashboard')` |

---

## API Routes

### POST /api/register
**Purpose:** Register new user
**Body:** `{ name, email, password }`
**Success:** `201 { success: true, message, user }`
**Errors:**
- `400` — Missing fields / validation error
- `409` — Email already exists
- `429` — Rate limit exceeded
- `500` — Server error

### POST /api/login
**Purpose:** Direct credential check (also used internally)
**Body:** `{ email, password }`
**Success:** `200 { success: true, user }`
**Errors:**
- `401` — Invalid credentials
- `429` — Rate limit exceeded

### GET/POST /api/auth/[...nextauth]
**Purpose:** NextAuth session handler
**Handles:** JWT generation, session retrieval, sign-out

---

## Authentication & Authorization Flow

```
User visits /           → Auth check (useSession)
  ↓ Not logged in       → Show Login/Signup page
  ↓ Already logged in   → Redirect to /dashboard

User logs in            → signIn('credentials') → NextAuth
  ↓ NextAuth authorize  → bcrypt compare → MongoDB
  ↓ Success             → JWT cookie set
  ↓ Redirect            → /dashboard (protected)

User visits /dashboard  → useSession() check
  ↓ Authenticated       → Show dashboard
  ↓ Unauthenticated     → router.replace('/') — back to gate
```

---

## UI Sections

### Left Panel — Image Slider
- Auto-advancing slides every 4 seconds with fade transition
- 4 themes: Neural Architecture, Quantum Security, Data Sovereignty, Identity Matrix
- Animated rotating ring art (CSS keyframes, Three.js-style)
- Clickable dot navigation
- Smooth accent color transitions per slide

### Right Panel — Auth Forms
- Tab switcher: LOG IN / SIGN UP
- Login form: email + password → NextAuth credentials
- Signup form: name + email + password + confirm
- Inline error/success alerts
- Process pipeline displayed below each form
- Auto-login after successful registration

### Background
- Canvas 2D particle network (120 particles)
- Mouse repulsion effect
- Connection lines between nearby particles
- Subtle grid overlay
- Animated scan line

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

**Required:** Node.js 18+, internet access (for MongoDB Atlas connection)

---

## Security Features
- BCrypt password hashing (12 salt rounds)
- JWT tokens via NextAuth (httpOnly cookies)
- Server-side rate limiting on all auth endpoints
- Duplicate email prevention
- Server-side input validation (in addition to client-side)
- Login history tracking per user
- Session expiry: 30 days

---

## Database Operations on Login
Each successful login:
1. Increments `loginCount` field
2. Updates `lastLogin` timestamp
3. Appends to `loginHistory[]` array (capped at 50 entries)
4. Stores IP address and User-Agent

This gives full audit trail of user sessions in MongoDB Atlas.
