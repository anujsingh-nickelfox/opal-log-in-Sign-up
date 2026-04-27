import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Rate limiting map for login attempts
const loginRateLimitMap = new Map();

function loginRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10; // 10 attempts per 15 min for login

  if (!loginRateLimitMap.has(ip)) {
    loginRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  const data = loginRateLimitMap.get(ip);

  if (now > data.resetTime) {
    loginRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (data.count >= maxAttempts) {
    return { allowed: false };
  }

  data.count += 1;
  return { allowed: true };
}

export async function POST(request) {
  try {
    // Step 3: Security Middleware — Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = loginRateLimit(ip);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many login attempts. Please wait 15 minutes and try again.',
        },
        { status: 429 }
      );
    }

    // Step 1: Credential Entry
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Connect to DB
    await connectDB();

    // Step 4: User Identification — check if email exists in DB
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No account found with this email. Please sign up first.',
        },
        { status: 401 }
      );
    }

    // Step 5: Hash Comparison — bcrypt match
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // Update login tracking in database
    const now = new Date();
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await User.findByIdAndUpdate(user._id, {
      $inc: { loginCount: 1 },
      $set: { lastLogin: now },
      $push: {
        loginHistory: {
          $each: [{ timestamp: now, ip, userAgent }],
          $slice: -50,
        },
      },
    });

    // Step 8: Identity Response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful! Redirecting to dashboard...',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          loginCount: user.loginCount + 1,
          lastLogin: now,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
