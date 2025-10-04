import { NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

export async function POST() {
  try {
    // Clear the authentication cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    // Clear the auth token cookie
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Expire immediately
      path: '/',
    });

    // Sign out from NextAuth
    await signOut({ redirect: false });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Failed to log out' },
      { status: 500 }
    );
  }
}
