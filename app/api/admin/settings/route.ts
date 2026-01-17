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

    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          freeAccessEnabled: false
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
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

    const { freeAccessEnabled, freeAccessUntil } = await request.json();

    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          freeAccessEnabled,
          freeAccessUntil: freeAccessUntil ? new Date(freeAccessUntil) : null
        }
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          freeAccessEnabled,
          freeAccessUntil: freeAccessUntil ? new Date(freeAccessUntil) : null
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}