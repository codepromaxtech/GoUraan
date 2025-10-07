import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// This is the API route that will be called from the frontend
// It acts as a proxy to the backend API, adding authentication headers

export async function GET(request: Request) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract query parameters from the request
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'overview';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    // Build the backend API URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/${endpoint}`
    );
    
    // Add query parameters if they exist
    if (from) backendUrl.searchParams.append('from', from);
    if (to) backendUrl.searchParams.append('to', to);

    // Forward the request to the backend API
    const response = await fetch(backendUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return new NextResponse(
        JSON.stringify({ error: error.message || 'Failed to fetch analytics' }), 
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
