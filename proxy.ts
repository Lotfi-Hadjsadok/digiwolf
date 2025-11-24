import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, detectLocale } from './lib/i18n';
import { auth } from './lib/auth';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Admin routes should not have locale prefixes - redirect if they do
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/admin`) || pathname === `/${locale}/admin`) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(`/${locale}`, '');
      return NextResponse.redirect(url);
    }
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    try {
      const session = await auth.api.getSession({ 
        headers: request.headers 
      });
      
      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If session check fails, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // Allow admin login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Admin routes should not get locale prefixes - allow them through
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Detect user's preferred locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  const preferredLocale = detectLocale(acceptLanguage);

  // Redirect root to user's preferred locale
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale}`;
    return NextResponse.redirect(url);
  }

  // For other paths, add user's preferred locale
  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

