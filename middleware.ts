import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Dzora Edge Security Middleware
 * Enforces Access Link Cloaking, Gatekeeper Token Verification, Honeypot Trapping,
 * and Strict Security Headers on all /admin routes.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Only intercept /admin routes
  if (pathname.startsWith('/admin')) {
    // 1. Decoy / Honeypot Trapping
    if (
      pathname === '/admin/trap' ||
      pathname === '/admin/honeypot' ||
      pathname === '/admin/wp-login.php' ||
      pathname === '/admin/phpmyadmin'
    ) {
      return new NextResponse(null, { status: 404 })
    }

    // 2. Access Link Gatekeeper Security
    const requiredGatekeeper =
      process.env.ADMIN_GATEWAY_TOKEN ||
      process.env.NEXT_PUBLIC_ADMIN_GATEWAY_KEY

    const gateQuery =
      searchParams.get('gatekeeper') ||
      searchParams.get('key') ||
      searchParams.get('token')
    const gateCookie = request.cookies.get('dzora_admin_gate')?.value

    if (requiredGatekeeper) {
      const isAuthorized =
        gateCookie === requiredGatekeeper || gateQuery === requiredGatekeeper

      if (!isAuthorized) {
        // Obfuscation / Cloaking: Disguise admin existence by redirecting to public home
        return NextResponse.redirect(new URL('/', request.url))
      }

      // If authorized via query param, set secure cookie and redirect to clean URL
      if (gateQuery === requiredGatekeeper) {
        const cleanUrl = new URL(request.url)
        cleanUrl.searchParams.delete('gatekeeper')
        cleanUrl.searchParams.delete('key')
        cleanUrl.searchParams.delete('token')

        const response = NextResponse.redirect(cleanUrl)
        response.cookies.set('dzora_admin_gate', requiredGatekeeper, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/admin',
          maxAge: 60 * 60 * 8, // 8 hours
        })
        return applySecurityHeaders(response)
      }
    }

    // 3. Apply Strict Security Headers
    const response = NextResponse.next()
    return applySecurityHeaders(response)
  }

  return NextResponse.next()
}

function applySecurityHeaders(response: NextResponse) {
  // Prevent indexing, archiving, and snippet generation
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  // Anti-Clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  // Anti-MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Strict Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Cross-Origin Opener Policy
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
