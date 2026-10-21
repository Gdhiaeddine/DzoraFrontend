'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AdminLayoutShell } from '@/components/admin-layout-shell'
import { getAccessToken } from '@/lib/api'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [checkingAuth, setCheckingAuth] = useState(true)

  const roles = user?.roles || []
  const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')

  useEffect(() => {
    if (isLoading) return

    const token = getAccessToken()
    if (!token || !isAuthenticated || !isAdmin) {
      const redirectTarget = pathname || '/admin/dashboard'
      router.replace(`/admin/connexion?redirect=${encodeURIComponent(redirectTarget)}`)
      return
    }

    setCheckingAuth(false)
  }, [isLoading, isAuthenticated, isAdmin, pathname, router])

  if (isLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F4F8F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
        <p className="text-sm font-bold text-[#102A2A]">Vérification des accès administrateur…</p>
        <p className="text-xs text-[#60716F] mt-1">Espace réservé Dzora Administration</p>
      </div>
    )
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>
}
