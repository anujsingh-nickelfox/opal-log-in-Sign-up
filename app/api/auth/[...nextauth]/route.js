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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectDB();

          // Step 4: User Identification — check if email exists
          const user = await User.findOne({ email: credentials.email.toLowerCase() });

          if (!user) {
            throw new Error('No account found with this email. Please sign up first.');
          }

          // Step 5: Hash Comparison — bcrypt match
          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordMatch) {
            throw new Error('Incorrect password. Please try again.');
          }

          // Note: Login count is updated in /api/login route, not here to avoid double counting
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            loginCount: user.loginCount,
          };
        } catch (error) {
          console.error('NextAuth authorize error:', error);
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
