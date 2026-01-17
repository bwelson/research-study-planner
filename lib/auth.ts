import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getUserFromSession(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}