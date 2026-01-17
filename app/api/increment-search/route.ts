import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { 
      userId: string;
      isPremium?: boolean;
      isAcademicTester?: boolean;
    };
    
    // Only increment for non-premium users
    // Premium and academic testers have unlimited searches
    if (!decoded.isPremium && !decoded.isAcademicTester) {
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { searchCount: { increment: 1 } },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Increment search error:', error);
    return NextResponse.json({ message: 'Failed to increment' }, { status: 500 });
  }
}