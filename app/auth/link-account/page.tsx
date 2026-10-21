'use client'

import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react'

function LinkAccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const message =
    searchParams.get('message') ||
    'Un compte avec cette adresse email existe déjà. Veuillez vous connecter avec votre mot de passe pour lier votre compte Google en toute sécurité.'

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-amber-100">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
          Sécurité du compte Dzora
        </h1>

        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 mb-6 text-sm text-slate-700">
          <p className="font-semibold text-slate-900 mb-1">
            Compte existant détecté : {email}
          </p>
          <p className="text-slate-600 leading-relaxed">{message}</p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Lock className="w-5 h-5 text-[#006B55] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              Pour éviter toute usurpation d'identité, Dzora exige que vous vous authentifiiez d'abord avec vos identifiants actuels avant d'associer un compte tiers.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href={`/connexion?email=${encodeURIComponent(email)}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#006B55] hover:bg-[#005241] text-white font-semibold rounded-2xl transition-colors shadow-sm"
          >
            <span>Se connecter avec mot de passe</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/connexion"
            className="w-full py-3 text-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Annuler et revenir
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh]" />}>
      <LinkAccountContent />
    </Suspense>
  )
}
