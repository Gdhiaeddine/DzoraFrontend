'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Lock,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Mail,
  User,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  Store,
  Smartphone,
  RefreshCw,
} from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Logo } from '@/components/logo'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { SellerTwoFactorModal } from '@/components/auth/seller-two-factor-modal'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/commander'
  const { cartCount, justMergedCart, dismissMergeNotice } = useCart()
  const { loginWithPassword, pending2Fa, cancel2Fa } = useAuth()

  // Immediately forward any /account or /commander redirection away from this page
  useEffect(() => {
    if (redirect) {
      if (redirect.startsWith('/account')) {
        router.replace(redirect)
      } else if (redirect === '/commander' || redirect.startsWith('/commander')) {
        router.replace('/panier')
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('dzora:open-login', { detail: { tab: 'login' } })
            )
          }, 150)
        }
      }
    }
  }, [redirect, router])

  // Mode: 'customer' (Phone OTP + Google) vs 'seller' (Email + Password + 2FA)
  const [authMode, setAuthMode] = useState<'customer' | 'seller'>('customer')

  // Seller Password form states
  const [sellerEmail, setSellerEmail] = useState('')
  const [sellerPassword, setSellerPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [sellerLoading, setSellerLoading] = useState(false)
  const [sellerError, setSellerError] = useState<string | null>(null)

  const handleSellerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSellerError(null)

    if (!sellerEmail || !sellerEmail.includes('@')) {
      setSellerError('Veuillez saisir une adresse e-mail valide.')
      return
    }

    if (!sellerPassword || sellerPassword.length < 6) {
      setSellerError('Le mot de passe doit comporter au moins 6 caractères.')
      return
    }

    setSellerLoading(true)
    try {
      const result = await loginWithPassword(sellerEmail.trim(), sellerPassword)
      if (!result.requires2Fa) {
        router.push(redirect === '/commander' && result.user?.roles.includes('SELLER') ? '/vendeur' : redirect)
      }
      // If requires2Fa is true, pending2Fa is set in AuthContext and SellerTwoFactorModal opens!
    } catch (err: any) {
      setSellerError(err.message || 'Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setSellerLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[480px]">
      {/* 2FA Challenge Modal for Sellers */}
      <SellerTwoFactorModal
        isOpen={Boolean(pending2Fa)}
        onClose={cancel2Fa}
        onSuccess={() => {
          router.push(redirect)
        }}
      />

      {/* Cart Merge Notification Banner */}
      {justMergedCart && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#BBDDD4] bg-[#E7F2EF] p-4 text-xs font-semibold text-[#006B55] shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#006B55]" />
            <span>Votre panier invité a été synchronisé avec succès à votre compte !</span>
          </div>
          <button
            type="button"
            onClick={dismissMergeNotice}
            className="text-[11px] font-bold underline hover:text-[#005544]"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Main Auth Card */}
      <div className="overflow-hidden rounded-3xl border border-[#D9E7E2] bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,107,85,0.08)]">
        {/* Header Icon & Tagline */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BBDDD4] bg-[#E7F2EF] px-3.5 py-1 text-xs font-bold text-[#006B55]">
            <Lock size={13} strokeWidth={2.5} />
            <span>Connexion sécurisée Dzora</span>
          </div>

          <h1 className="mt-3 font-display text-2xl font-extrabold text-[#102A2A] sm:text-3xl">
            {authMode === 'customer' ? 'Bienvenue sur Dzora' : 'Espace Vendeur & Gestion'}
          </h1>
          <p className="mt-1.5 text-xs text-[#60716F] sm:text-sm">
            {authMode === 'customer'
              ? 'Connectez-vous en un instant pour suivre vos colis et finaliser votre commande.'
              : 'Accédez à votre tableau de bord boutique avec mot de passe et sécurité 2FA.'}
          </p>
        </div>

        {/* Auth Mode Switcher */}
        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-[#F0F5F2] p-1 text-xs font-bold sm:text-sm">
          <button
            type="button"
            onClick={() => {
              setAuthMode('customer')
              setSellerError(null)
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
              authMode === 'customer'
                ? 'bg-white text-[#006B55] shadow-xs'
                : 'text-[#60716F] hover:text-[#102A2A]'
            }`}
          >
            <Smartphone size={15} />
            <span>Client (OTP SMS)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('seller')
              setSellerError(null)
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
              authMode === 'seller'
                ? 'bg-white text-[#006B55] shadow-xs'
                : 'text-[#60716F] hover:text-[#102A2A]'
            }`}
          >
            <Store size={15} />
            <span>Vendeur / Staff</span>
          </button>
        </div>

        {/* CUSTOMER MODE: Phone OTP + Google Button */}
        {authMode === 'customer' && (
          <div className="mt-6 space-y-5">
            {/* Phone OTP Component */}
            <PhoneOtpForm redirectTo={redirect} />

            {/* Social Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ou continuer avec
              </span>
            </div>

            {/* Google OAuth Button */}
            <GoogleAuthButton redirectTo={redirect} />

            {/* Guest Cart Assurance */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center text-xs text-slate-500">
              <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-700">
                <ShoppingBag className="h-3.5 w-3.5 text-[#006B55]" />
                <span>Panier conservé automatiquement</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Vos articles restent enregistrés et seront liés à votre compte.
              </p>
            </div>
          </div>
        )}

        {/* SELLER MODE: Email + Password + 2FA Trigger */}
        {authMode === 'seller' && (
          <form onSubmit={handleSellerLogin} className="mt-6 space-y-4">
            {sellerError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <span>{sellerError}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#102A2A]">
                Adresse e-mail professionnelle
              </label>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="vendeur@dzora.dz"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-[#F7FAF9] pl-10 pr-3.5 text-sm outline-none transition focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#102A2A]">
                <span>Mot de passe</span>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-[11px] font-semibold text-[#006B55] hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={sellerPassword}
                  onChange={(e) => setSellerPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-[#F7FAF9] pl-3.5 pr-11 text-sm outline-none transition focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-7 place-items-center rounded-lg text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={sellerLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#006B55] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-[#006B55]/20 transition-all hover:bg-[#005544] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sellerLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
              ) : (
                <span>Connexion Vendeur</span>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-500">
              <span>Vous souhaitez vendre sur Dzora ? </span>
              <Link href="/vendeur" className="font-bold text-[#006B55] hover:underline">
                Ouvrir ma boutique
              </Link>
            </div>
          </form>
        )}

        {/* Security Reassurance Footer */}
        <div className="mt-6 border-t border-[#EDF4F1] pt-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#60716F]">
            <ShieldCheck size={14} className="text-[#006B55]" />
            <span>Paiement à la livraison (COD) partout en Algérie</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#F8FAF9] px-4 py-10 sm:py-16">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#006B55]/20 border-t-[#006B55]" />
          </div>
        }
      >
        <AuthContent />
      </Suspense>
    </div>
  )
}
