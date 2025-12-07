import { NextResponse } from 'next/server';

export function middleware() {
  // Get the response
  const response = NextResponse.next();
  
  // Set cache control headers to prevent caching at all levels
  response.headers.set('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Add timestamp header to ensure responses are unique (optional)
  response.headers.set('X-Response-Time', Date.now().toString());
  
  return response;
}

// Configure middleware to run on specific paths
// This will run on all routes except static files, api routes, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /images (inside /public)
     * 5. /favicon.ico, /sitemap.xml (common static files)
     */
    '/((?!api|_next/static|_next/image|_static|images|favicon.ico|sitemap.xml).*)',
  ],
};