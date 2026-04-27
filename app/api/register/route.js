import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  const data = rateLimitMap.get(ip);

  if (now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (data.count >= maxRequests) {
    return { allowed: false, resetTime: data.resetTime };
  }

  data.count += 1;
  return { allowed: true };
}

export async function POST(request) {
  try {
    console.log('[REGISTER] Starting registration request');

    // Step 4: Security Check — Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimit(ip);

    if (!rateLimitResult.allowed) {
      console.log('[REGISTER] Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        {
          success: false,
          message: 'Too many registration attempts. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Step 1 & 2: Data Submission & Client Validation
    const body = await request.json();
    const { name, email, password } = body;

    console.log('[REGISTER] Received data:', { name, email, password: '***' });

    // Server-side validation
    if (!name || !email || !password) {
      console.log('[REGISTER] Validation failed: missing fields');
      return NextResponse.json(
        { success: false, message: 'All fields are required: name, email, and password.' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      console.log('[REGISTER] Validation failed: name too short');
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      console.log('[REGISTER] Validation failed: invalid email');
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('[REGISTER] Validation failed: password too short');
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Connect to MongoDB Atlas
    console.log('[REGISTER] Connecting to database...');
    await connectDB();
    console.log('[REGISTER] Database connected successfully');

    // Step 5: Email Check — is user already registered?
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      console.log('[REGISTER] User already exists:', email);
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists. Please log in instead.',
        },
        { status: 409 }
      );
    }

    // Step 6: Password Hashing with bcrypt
    console.log('[REGISTER] Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('[REGISTER] Password hashed successfully');

    // Step 7: User Creation — save to MongoDB Atlas
    console.log('[REGISTER] Creating user in database...');
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      loginCount: 0,
      loginHistory: [],
      createdAt: new Date(),
    });
    console.log('[REGISTER] User created successfully:', newUser._id);

    // Step 8: Response (Welcome email would be triggered here via automation tool)
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please log in to continue.',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER] Error details:', {
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

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, message: messages[0] || 'Validation failed.' },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'This email is already registered. Please log in.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
