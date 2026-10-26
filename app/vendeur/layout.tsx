'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { SellerLayoutShell } from '@/components/seller-layout-shell'

/**
 * Determines whether a route under /vendeur is a seller management dashboard page
 * (dashboard, abonnement, securite) that requires the shared SellerLayoutShell
 * (sidebar + topbar header), or a public consumer storefront / directory.
 */
export function isSellerWorkspaceRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/'

  return (
    clean === '/vendeur/dashboard' ||
    clean.startsWith('/vendeur/dashboard/') ||
    clean === '/vendeur/produits' ||
    clean.startsWith('/vendeur/produits/') ||
    clean === '/vendeur/abonnement' ||
    clean.startsWith('/vendeur/abonnement/') ||
    clean === '/vendeur/securite' ||
    clean.startsWith('/vendeur/securite/')
  )
}

export default function VendeurRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  if (isSellerWorkspaceRoute(pathname)) {
    return <SellerLayoutShell>{children}</SellerLayoutShell>
  }

  return <>{children}</>
}
