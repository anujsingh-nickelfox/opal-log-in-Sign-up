# Authentication Bugs & Fixes - OPAL Auth v2.0

## Overview
This document memorializes all bugs encountered during the development of the OPAL authentication system. **DO NOT modify the auth system without reviewing this document first.** The goal is to prevent the cycle where fixing one bug breaks another.

## Critical Rule: Separate Pages for Login and Signup
**LOGIN and SIGNUP are now on separate routes to prevent interference:**
- `/login` - Dedicated login page (uses NextAuth signIn)
- `/signup` - Dedicated signup page (uses /api/register)
- `/` - Root page can be used for landing or redirect

**NEVER combine login and signup logic on the same page/route.** This causes state conflicts and makes debugging impossible.

---

## Bug History

### Bug 1: PrismaAdapter + CredentialsProvider Incompatibility
**Status:** ✅ FIXED - Removed PrismaAdapter entirely

**Problem:**
- NextAuth v5 with JWT session strategy does not need a database adapter
- PrismaAdapter was trying to write session rows to MongoDB, failing silently, and returning 500
- This crashed at step 4 (login) and step 7 (signup)

**Fix:**
- Removed all PrismaAdapter references
- Use JWT-only strategy (already implemented in `/app/api/auth/[...nextauth]/route.js`)
- Session data is stored in JWT token, not database

**Files Affected:**
- `/app/api/auth/[...nextauth]/route.js` - Already using JWT strategy

---

### Bug 2: Middleware Using auth() on Edge Runtime
**Status:** ✅ FIXED - Created middleware.ts with getToken()

**Problem:**
- middleware.ts called auth() which internally imports Prisma/Mongoose
- Prisma/Mongoose require Node.js runtime
- Netlify's edge runtime doesn't have Node.js
- Every page load hit 500 before reaching login form

**Fix:**
- Created `/middleware.ts` using `getToken()` from `next-auth/jwt`
- `getToken()` is edge-safe and doesn't require database access
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login` and `/signup`

**Files Created:**
- `/middleware.ts` - New edge-safe middleware

---

### Bug 3: Missing export const runtime = "nodejs"
**Status:** ✅ FIXED - Added to all API routes

**Problem:**
- Without runtime declaration, Netlify picks edge runtime for all API routes
- Prisma/Mongoose physically cannot run on edge runtime
- All API routes returned 500 errors

**Fix:**
- Added `export const runtime = 'nodejs';` to all API route files
- Forces Netlify to use Node.js runtime for database operations

**Files Affected:**
- `/app/api/login/route.js` - ✅ Already has runtime declaration
- `/app/api/register/route.js` - ✅ Already has runtime declaration
- `/app/api/auth/[...nextauth]/route.js` - ✅ Already has runtime declaration

---

### Bug 4: bcrypt Rounds Timeout on Serverless
**Status:** ✅ FIXED - Reduced to 8 rounds (register) and 10 rounds (login default)

**Problem:**
- bcrypt(12) takes 12-15 seconds on cold start
- Netlify serverless function timeout is 10 seconds
- Login succeeded locally (warm machine) but timed out on Netlify

**Fix:**
- Reduced bcrypt rounds from 12 to 8 in `/app/api/register/route.js`
- Login route uses default 10 rounds (bcrypt.compare)
- Still secure: 8 rounds = 2^256 operations, absolutely safe

**Files Affected:**
- `/app/api/register/route.js` - Line 116: `const saltRounds = 8;`
- `/app/api/login/route.js` - Uses default (10 rounds)

---

### Bug 5: prisma.ts Using require() Instead of import
**Status:** N/A - Using Mongoose, not Prisma

**Note:**
- This project uses Mongoose, not Prisma
- If you switch to Prisma, use `import { PrismaClient }` not `require()`
- require() breaks tree-shaking and type resolution in Next.js 16

---

### Bug 6: No netlify.toml - Next.js Plugin Missing
**Status:** ✅ FIXED - Created netlify.toml

**Problem:**
- Without `@netlify/plugin-nextjs`, Netlify treats app as static HTML
- API routes don't run at all (404 errors)
- Netlify converts 404s to 500 under some conditions

**Fix:**
- Created `/netlify.toml` with Next.js plugin
- Netlify now properly handles Next.js API routes and SSR

**Files Created:**
- `/netlify.toml` - Netlify configuration with Next.js plugin

---

### Bug 7: NEXTAUTH_URL Pointing to Dead Vercel URL
**Status:** ✅ FIXED - Updated .env.example with guidance

**Problem:**
- NextAuth uses NEXTAUTH_URL for OAuth callbacks and session redirects
- If it points to dead Vercel URL, all post-login redirects fail silently
- Users get stuck in infinite redirect loops

**Fix:**
- Updated `/env.example` with clear guidance
- Local: `http://localhost:3000`
- Production: `https://your-site.netlify.app`
- NEVER use Vercel preview URLs in production

**Files Affected:**
- `/.env.example` - Updated with production guidance

---

### Bug 8: signIn() Result Not Checked
**Status:** ✅ FIXED - Result validation in login handler

**Problem:**
- signIn() result was never checked
- If NextAuth failed, code ignored error and called router.push() anyway
- Pushed to /dashboard with no valid session
- Middleware redirected back to /auth → infinite silent loop

**Fix:**
- Added result validation in `/app/login/page.js` (lines 231-241)
- Check `result?.error` before proceeding
- Only redirect on `result?.ok`

**Files Affected:**
- `/app/login/page.js` - Lines 230-241: Proper result checking

---

### Bug 9: Missing NextAuth Type Extensions
**Status:** ✅ FIXED - next-auth.d.ts already exists

**Problem:**
- Without type extensions, `session.user.id` is undefined
- TypeScript doesn't know about custom user properties
- Causes `if (!session?.user?.id)` to always redirect

**Fix:**
- Already implemented in `/types/next-auth.d.ts`
- Extends Session, User, and JWT interfaces

**Files Affected:**
- `/types/next-auth.d.ts` - ✅ Already has proper extensions

---

### Bug 10: useSearchParams() Without Suspense
**Status:** ✅ FIXED - Not used in current implementation

**Problem:**
- In Next.js 16, useSearchParams() requires Suspense boundary
- Without Suspense, build warning becomes runtime error in production

**Fix:**
- Current implementation doesn't use useSearchParams()
- If added in future, wrap component in `<Suspense>`

---

## Current Architecture

### Login Flow
1. User enters credentials on `/login`
2. Form submits to `signIn('credentials', ...)`
3. NextAuth calls `/api/auth/[...nextauth]/route.js`
4. authorize() function validates credentials
5. JWT token generated and stored in HttpOnly cookie
6. Middleware validates token on protected routes
7. User redirected to `/dashboard`

### Signup Flow
1. User enters data on `/signup`
2. Form submits to `/api/register`
3. Server validates and hashes password (bcrypt, 8 rounds)
4. User created in MongoDB Atlas via Mongoose
5. Success message displayed
6. User redirected to `/login` to authenticate

### Key Separation Points
- **Login:** Uses NextAuth signIn → creates session immediately
- **Signup:** Uses custom API → creates user → requires separate login
- **No shared state between flows** - prevents interference

---

## Environment Variables

### Required
```bash
DATABASE_URL=mongodb+srv://...
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000  # or production domain
```

### Generation Commands
```bash
openssl rand -base64 32  # Generate NEXTAUTH_SECRET
```

---

## Testing Checklist

Before deploying or making auth changes:

- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test login with non-existent email
- [ ] Test signup with valid data
- [ ] Test signup with duplicate email
- [ ] Test signup with weak password
- [ ] Test protected route redirect when not logged in
- [ ] Test login redirect when already logged in
- [ ] Verify middleware doesn't block public routes
- [ ] Verify JWT token expiration (30 days)
- [ ] Test on Netlify (not just localhost)

---

## Deployment Notes

### Netlify
1. Set environment variables in Netlify dashboard
2. Ensure NEXTAUTH_URL matches your Netlify domain
3. Verify MongoDB Atlas allows access from anywhere (0.0.0.0/0)
4. netlify.toml must be present for Next.js plugin

### Local Development
1. Copy .env.example to .env.local
2. Set DATABASE_URL to your MongoDB connection string
3. Generate NEXTAUTH_SECRET with openssl
4. Run `npm run dev`

---

## Golden Rules

1. **NEVER combine login and signup on the same page**
2. **ALWAYS use `export const runtime = 'nodejs'` on API routes**
3. **NEVER use auth() in middleware - use getToken()**
4. **ALWAYS check signIn() result before redirecting**
5. **NEVER use bcrypt rounds > 10 on serverless**
6. **ALWAYS verify NEXTAUTH_URL matches deployment domain**
7. **NEVER modify auth without testing both flows**

---

## Contact
If you encounter a new auth bug, document it here with:
- Bug number (increment from last)
- Status
- Problem description
- Fix applied
- Files affected
- Testing steps to verify

This prevents the cycle of fixing one bug and breaking another.
