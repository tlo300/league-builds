import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = new URL(request.url)
  if (!pathname.startsWith('/sign-in')) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\.ico|sitemap\.xml|robots\.txt).*)',
  ],
}
