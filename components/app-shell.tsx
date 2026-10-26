'use client'

import { usePathname } from 'next/navigation'
import { AnnouncementBar } from '@/components/announcement-bar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileNav } from '@/components/mobile-nav'

/**
 * Determines whether a route is a dedicated workspace (vendeur dashboard, admin panel,
 * seller onboarding) that must NEVER render the marketplace consumer shell
 * (announcement bar, customer header, footer, mobile navigation).
 */
export function isShellFree(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/'

  // All admin management routes
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return true
  }

  // All seller workspaces (dashboard, abonnement, securite, onboarding flow)
  if (
    cleanPath === '/vendeur/dashboard' ||
    cleanPath.startsWith('/vendeur/dashboard/') ||
    cleanPath === '/vendeur/produits' ||
    cleanPath.startsWith('/vendeur/produits/') ||
    cleanPath === '/vendeur/abonnement' ||
    cleanPath.startsWith('/vendeur/abonnement/') ||
    cleanPath === '/vendeur/securite' ||
    cleanPath.startsWith('/vendeur/securite/') ||
    cleanPath === '/devenir-vendeur/creer' ||
    cleanPath.startsWith('/devenir-vendeur/creer/')
  ) {
    return true
  }

  return false
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideShell = isShellFree(pathname)

  if (hideShell) {
    return <div className="flex-1">{children}</div>
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <MobileNav />
    </>
  )
}
