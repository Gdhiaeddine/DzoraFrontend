'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, setAccessToken } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleAuthSuccess } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function processOAuthCallback() {
      const token = searchParams.get('token')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError(decodeURIComponent(errorParam))
        return
      }

      if (!token) {
        setError('Jeton d\'authentification manquant dans la redirection.')
        return
      }

      try {
        // Save the access token
        setAccessToken(token)

        // Fetch user profile and sync state
        const user = await api.auth.getMe()
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dzora_user', JSON.stringify(user))
        }

        // Trigger context update directly
        handleAuthSuccess(user)

        // Redirect back to home or intended page
        router.replace('/')
      } catch (err: any) {
        setError(err.message || 'Échec de la validation de la session.')
      }
    }

    processOAuthCallback()
  }, [searchParams, router, handleAuthSuccess])

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-red-100 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur d'authentification</h2>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/connexion')}
            className="w-full py-3 bg-[#006B55] hover:bg-[#005241] text-white font-medium rounded-xl transition-colors"
          >
            Retourner à la page de connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006B55] flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Connexion en cours...</h2>
        <p className="text-sm text-slate-500">
          Nous synchronisons vos données de compte Dzora. Veuillez patienter.
        </p>
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#006B55]" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
