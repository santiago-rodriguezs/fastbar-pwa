import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/firebase/admin';

// Define paths that require authentication and their required roles
const protectedPaths = {
  // User paths
  '/cart': ['user', 'admin'],
  '/orders': ['user', 'admin'],
  
  // Staff paths
  '/staff': ['staff', 'admin'],
  
  // Admin paths
  '/admin': ['admin'],
};

// Function to check if a path is protected
function isProtectedPath(path: string): [boolean, string[]] {
  // Check exact matches
  if (protectedPaths[path]) {
    return [true, protectedPaths[path]];
  }
  
  // Check path patterns
  for (const [protectedPath, roles] of Object.entries(protectedPaths)) {
    if (
      (protectedPath.endsWith('/') && path.startsWith(protectedPath)) ||
      (path.startsWith(`${protectedPath}/`)) ||
      (path === protectedPath)
    ) {
      return [true, roles];
    }
  }
  
  return [false, []];
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const [isProtected, requiredRoles] = isProtectedPath(path);
  
  // If path is not protected, allow access
  if (!isProtected) {
    return NextResponse.next();
  }
  
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      // Redirect to login if no session cookie
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify session cookie
    const decodedToken = await auth.verifySessionCookie(sessionCookie);
    const uid = decodedToken.uid;
    
    // Get user data from Firestore
    const userRecord = await auth.getUser(uid);
    const userRole = userRecord.customClaims?.role || 'user';
    
    // Check if user has required role
    if (requiredRoles.includes(userRole)) {
      return NextResponse.next();
    } else {
      // Redirect based on role
      if (userRole === 'staff') {
        return NextResponse.redirect(new URL('/staff', request.url));
      } else if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // #TODO: For demo purposes, allow access to protected routes
    if (process.env.NODE_ENV !== 'production') {
      console.log('Demo mode: Allowing access to protected route');
      return NextResponse.next();
    }
    
    // Redirect to login on error
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    '/cart/:path*',
    '/orders/:path*',
    '/staff/:path*',
    '/admin/:path*',
  ],
};
