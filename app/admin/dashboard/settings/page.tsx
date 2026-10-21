'use client'
 
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
 
export default function AdminSettingsRedirectPage() {
  const router = useRouter()
 
  useEffect(() => {
    router.replace('/admin/dashboard/parametres')
  }, [router])
 
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-3" />
      <p className="text-xs font-semibold text-[#60716F]">
        Redirection vers les paramètres de la plateforme…
      </p>
    </div>
  )
}
