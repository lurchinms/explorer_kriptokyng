import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Static API URL
    const apiUrl = `https://api.kriptoking.info/pools`;
    
    
    // Pass along any query parameters
    const searchParams = new URL(request.url).searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const fullUrl = `${apiUrl}${queryString}`;
    
    // Fetch data from the API
    const response = await fetch(fullUrl, {
      headers: {
        'Accept': request.headers.get('accept') || 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });
    
    // Get the response data as text (to preserve exact format)
    const data = await response.text();
    
    // Create a new response with the API data and status
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch data from API' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
