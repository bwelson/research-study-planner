import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getUserFromSession(request: NextRequest) {
  try {
    // First try NextAuth session (for OAuth logins)
    const session = await getServerSession();
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) return user;
    }

    // If no NextAuth session, try JWT token (for email/password logins)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
        if (user) return user;
      } catch (jwtError) {
        // Token invalid, continue to return null
      }
    }

    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}