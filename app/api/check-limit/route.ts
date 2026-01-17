import { NextResponse, NextRequest } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);

    console.log('Check-limit called');

    if (!user) {
      console.log('No user found - returning 401');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User found:', user.email);

    // Get full user data including subscription fields
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        isPremium: true,
        isAcademicTester: true,
        searchCount: true,
        subscriptionStatus: true,
        searchesUsed: true,
        searchesLimit: true,
      }
    });

    if (!fullUser) {
      console.log('User not found in database');
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has premium subscription (active or trial)
    const isPremium = fullUser.isPremium || fullUser.subscriptionStatus === 'active' || fullUser.subscriptionStatus === 'trial';
    const isAcademicTester = fullUser.isAcademicTester || fullUser.subscriptionStatus === 'academic_tester';

    if (isPremium || isAcademicTester) {
      return NextResponse.json({
        canSearch: true,
        isPremium: true,
        searchCount: fullUser.searchesUsed || fullUser.searchCount || 0,
        isAcademicTester: isAcademicTester,
        user: {
          id: fullUser.id,
          email: fullUser.email,
        }
      });
    }

    // For free users, check if they've exceeded their limit
    const searchesUsed = fullUser.searchesUsed || fullUser.searchCount || 0;
    const searchesLimit = fullUser.searchesLimit || 1;
    const canSearch = searchesUsed < searchesLimit;

    return NextResponse.json({
      canSearch,
      isPremium: false,
      searchCount: searchesUsed,
      searchLimit: searchesLimit,
      paperLimit: 10,
      user: {
        id: fullUser.id,
        email: fullUser.email,
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