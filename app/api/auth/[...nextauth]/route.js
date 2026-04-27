import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const runtime = 'nodejs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorize called with:', { email: credentials?.email, hasPassword: !!credentials?.password });
        
        if (!credentials?.email || !credentials?.password) {
          console.error('[AUTH] Missing credentials');
          throw new Error('Email and password are required');
        }

        try {
          console.log('[AUTH] Connecting to database...');
          await connectDB();
          console.log('[AUTH] Database connected');

          // Step 4: User Identification — check if email exists
          const emailToFind = credentials.email.toLowerCase().trim();
          console.log('[AUTH] Searching for user with email:', emailToFind);
          
          const user = await User.findOne({ email: emailToFind }).exec();
          console.log('[AUTH] User found:', !!user);
          
          if (!user) {
            console.error('[AUTH] No user found for email:', emailToFind);
            throw new Error('No account found with this email. Please sign up first.');
          }

          console.log('[AUTH] User data:', { 
            id: user._id, 
            email: user.email, 
            name: user.name,
            hasPassword: !!user.password 
          });

          // Step 5: Hash Comparison — bcrypt match
          console.log('[AUTH] Comparing passwords...');
          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
          console.log('[AUTH] Password match result:', isPasswordMatch);

          if (!isPasswordMatch) {
            console.error('[AUTH] Password mismatch for email:', emailToFind);
            throw new Error('Incorrect password. Please try again.');
          }

          console.log('[AUTH] Authentication successful for:', emailToFind);

          // Return user data
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            loginCount: user.loginCount,
          };
        } catch (error) {
          console.error('[AUTH] Authorize error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          if (error.name === 'MongooseError' || error.message.includes('Mongo')) {
            throw new Error('Database connection error. Please try again later.');
          }
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],

  // Step 6 & 7: JWT Token Generation & Cookie/Session Storage
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.loginCount = user.loginCount;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.loginCount = token.loginCount;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
    error: '/',
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
