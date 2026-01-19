import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // 1. Protection basique : Rediriger vers login si pas connecté
  if (!session && (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/seller'))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. Protection des rôles (Nécessite de lire le profil)
  // Note: Idéalement, on stocke le rôle dans les "user_metadata" pour éviter un appel DB ici
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/seller/:path*', '/admin/:path*'],
}