import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    console.log('Check-limit called');
    console.log('All cookies:', cookieStore.getAll().map(c => c.name));
    console.log('Token found:', token ? 'YES - ' + token.substring(0, 20) + '...' : 'NO');

    if (!token) {
      console.log('No token found - returning 401');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: string;
    };

    console.log('Token verified for userId:', decoded.userId);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        searchesUsed: true,
        searchesLimit: true,
      }
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found:', user.email);

    // Check if user has premium subscription (active or trial)
    const isPremium = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial';
    const isAcademicTester = user.subscriptionStatus === 'academic_tester';

    if (isPremium || isAcademicTester) {
      return NextResponse.json({
        canSearch: true,
        isPremium: true,
        searchCount: user.searchesUsed || 0,
        isAcademicTester: isAcademicTester,
        user: {
          id: user.id,
          email: user.email,
        }
      });
    }

    // For free users, check if they've exceeded their limit
    const searchesUsed = user.searchesUsed || 0;
    const searchesLimit = user.searchesLimit || 1;
    const canSearch = searchesUsed < searchesLimit;

    return NextResponse.json({
      canSearch,
      isPremium: false,
      searchCount: searchesUsed,
      searchLimit: searchesLimit,
      paperLimit: 10,
      user: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Check-limit error:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}