'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectToSellerAbonnement() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/vendeur/abonnement')
  }, [router])

  return (
    <div className="min-h-screen bg-[#F4FAF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
      <p className="text-sm font-bold text-[#102A2A]">Redirection vers votre espace Abonnement…</p>
    </div>
  )
}
