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
    console.log('[LOGIN] Starting login request');

    // Step 3: Security Middleware — Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = loginRateLimit(ip);

    if (!rateLimitResult.allowed) {
      console.log('[LOGIN] Rate limit exceeded for IP:', ip);
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

    console.log('[LOGIN] Received data:', { email, password: '***' });

    if (!email || !password) {
      console.log('[LOGIN] Validation failed: missing fields');
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Connect to DB
    console.log('[LOGIN] Connecting to database...');
    await connectDB();
    console.log('[LOGIN] Database connected successfully');

    // Step 4: User Identification — check if email exists in DB
    const user = await User.findOne({ email: email.toLowerCase().trim() }).exec();

    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return NextResponse.json(
        {
          success: false,
          message: 'No account found with this email. Please sign up first.',
        },
        { status: 401 }
      );
    }

    // Step 5: Hash Comparison — bcrypt match
    console.log('[LOGIN] Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('[LOGIN] Password mismatch for:', email);
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] Password match successful');

    // Update login tracking in database
    const now = new Date();
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('[LOGIN] Updating login history...');
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
    console.log('[LOGIN] Login history updated');

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
    console.error('[LOGIN] Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });

    // Handle MongoDB connection errors
    if (error.name === 'MongooseError' || error.message.includes('Mongo')) {
      return NextResponse.json(
        { success: false, message: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
