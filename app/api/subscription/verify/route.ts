import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();
    
    // Get user from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await paystackResponse.json();

    if (data.status && data.data.status === 'success') {
      // Update user subscription
      await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          subscriptionStatus: 'active', // Changed from 'premium' to 'active'
          searchesLimit: 999999,
          paystackCustomerCode: data.data.customer.customer_code,
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'Payment verification failed' }, { status: 400 });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ message: 'Verification failed' }, { status: 500 });
  }
}