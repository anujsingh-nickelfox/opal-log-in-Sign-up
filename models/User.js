import mongoose from 'mongoose';

const LoginHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, default: 'unknown' },
  userAgent: { type: String, default: 'unknown' },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    loginHistory: [LoginHistorySchema],
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast email lookups
UserSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
