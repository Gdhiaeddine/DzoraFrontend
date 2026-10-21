'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, ShieldCheck, ArrowLeft, Store, Lock } from 'lucide-react'
import { SellerTwoFactorSetup } from '@/components/auth/seller-two-factor-setup'
import { useAuth } from '@/lib/auth-context'

export default function SellerSecurityPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#FAFDFB] text-[#102A2A] pb-16">
      {/* Breadcrumb Header */}
      <div className="border-b border-[#E8F0ED] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs font-medium text-[#60716F]">
            <Link href="/" className="hover:text-[#006B55]">Accueil</Link>
            <ChevronRight size={13} className="text-[#94A4A0]" />
            <Link href="/vendeur/dashboard" className="hover:text-[#006B55]">Espace Vendeur</Link>
            <ChevronRight size={13} className="text-[#94A4A0]" />
            <span className="font-semibold text-[#102A2A]">Sécurité & Double Authentification</span>
          </nav>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A2A]">
                Sécurité du compte vendeur
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#60716F]">
                Protégez votre boutique, vos catalogues et vos paiements avec la double authentification.
              </p>
            </div>
            <Link
              href="/vendeur/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Retour au tableau de bord</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Security Setup Content */}
      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 space-y-6">
        {/* 2FA Setup Component */}
        <SellerTwoFactorSetup
          initialEnabled={false}
          onStatusChange={(enabled) => {
            // Updated 2FA status
          }}
        />

        {/* Security Best Practices Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
              <Lock size={16} className="text-[#006B55]" />
              <span>Mots de passe renforcés</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Dzora utilise l'algorithme cryptographique <strong>Argon2id</strong> recommandé par l'OWASP pour sécuriser vos mots de passe et bloque automatiquement les tentatives d'intrusion par force brute.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
              <ShieldCheck size={16} className="text-[#006B55]" />
              <span>Sessions chiffrées & Rotation</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Vos sessions sont scellées dans des cookies <strong>HttpOnly sécurisés</strong> avec rotation automatique des jetons de rafraîchissement et détection instantanée de réutilisation suspecte.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
