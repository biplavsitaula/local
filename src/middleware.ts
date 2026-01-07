import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/dashboard',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Get the token from cookies (set during login)
  const token = request.cookies.get('auth_token')?.value;
  
  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Store the intended destination URL as a query parameter
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Don't redirect logged-in users from login/register - let them access these pages
  // This allows users to log out and log in as a different user
  
  // If accessing /dashboard directly, redirect to /admin
  if (token && (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match admin routes
    '/admin/:path*',
    '/admin',
    '/dashboard/:path*',
    '/dashboard',
  ],
};






