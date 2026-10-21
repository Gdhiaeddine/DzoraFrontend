'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

/**
 * Account Route Layout
 * Allows direct customer account access without throwing visitors to /connexion.
 * Redirects Sellers and Admins to their respective management workspaces.
 */
export default function AccountGuardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const roles = user?.roles || []
  const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')
  const isSeller = roles.includes('SELLER') || roles.includes('SELLER_STAFF')

  useEffect(() => {
    if (isLoading) return

    // 1. Administrator: redirect to admin dashboard
    if (isAdmin) {
      router.replace('/admin/dashboard')
      return
    }

    // 2. Seller: redirect to seller workspace
    if (isSeller) {
      router.replace('/vendeur/dashboard')
      return
    }
  }, [isLoading, isAdmin, isSeller, router])

  if (isLoading) {
    return (
      <div className="min-h-[75vh] bg-[#FAFDFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
        <p className="text-sm font-bold text-[#102A2A]">Chargement de votre compte…</p>
        <p className="text-xs text-[#60716F] mt-1">Espace client Dzora</p>
      </div>
    )
  }

  // If Admin or Seller, show brief redirection state
  if (isAdmin || isSeller) {
    return (
      <div className="min-h-[75vh] bg-[#FAFDFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
        <p className="text-sm font-bold text-[#102A2A]">Redirection en cours…</p>
        <p className="text-xs text-[#60716F] mt-1">
          {isAdmin
            ? 'Redirection vers votre tableau de bord administrateur…'
            : 'Redirection vers votre espace vendeur…'}
        </p>
      </div>
    )
  }

  // Allow direct access to account child pages
  return <>{children}</>
}
