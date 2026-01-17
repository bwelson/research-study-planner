import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateCode(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix + '-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
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

    const { count, prefix } = await request.json();
    const codes = [];

    for (let i = 0; i < count; i++) {
      const code = generateCode(prefix || 'ACAD');
      codes.push({
        code,
        isUsed: false
      });
    }

    await prisma.academicCode.createMany({
      data: codes
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}