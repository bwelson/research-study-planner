import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      return NextResponse.json(
        { message: 'User already exists' }, 
        { status: 400 }
      );
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );
    
    const response = NextResponse.json({ 
      user: { id: user.id, email: user.email } 
    });
    
    response.cookies.set('token', token, { 
      httpOnly: true, 
      maxAge: 60 * 60 * 24 * 7
    });
    
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Signup failed' }, 
      { status: 500 }
    );
  }
}