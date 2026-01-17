import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalUsers, premiumUsers, academicTesters, codes] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.user.count({ where: { isAcademicTester: true } }),
      prisma.academicCode.findMany()
    ]);

    const totalSearches = await prisma.user.aggregate({
      _sum: { searchCount: true }
    });

    const stats = {
      totalUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      academicTesters,
      totalSearches: totalSearches._sum.searchCount || 0,
      codesGenerated: codes.length,
      codesUsed: codes.filter(c => c.isUsed).length
    };

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}