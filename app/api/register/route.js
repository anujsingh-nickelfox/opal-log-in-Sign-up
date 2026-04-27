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
    // Step 4: Security Check — Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimit(ip);

    if (!rateLimitResult.allowed) {
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

    // Server-side validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required: name, email, and password.' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Connect to MongoDB Atlas
    await connectDB();

    // Step 5: Email Check — is user already registered?
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists. Please log in instead.',
        },
        { status: 409 }
      );
    }

    // Step 6: Password Hashing with bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 7: User Creation — save to MongoDB Atlas
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      loginCount: 0,
      loginHistory: [],
      createdAt: new Date(),
    });

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
    console.error('Registration Error:', error);

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
