import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login', '/api/auth'];
const staticExtensions = ['.ico', '.png', '.jpg', '.svg', '.css', '.js'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/invitation/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    staticExtensions.some((ext) => pathname.endsWith(ext))
  ) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
