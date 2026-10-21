'use client'

import React, { useState, useEffect, useRef, useId } from 'react'
import Image from 'next/image'
import {
  ShoppingBag,
  X,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Check,
  Star,
  Sparkles,
  Smartphone,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { PhoneOtpForm } from './auth/phone-otp-form'
import { ProfileCompletionForm } from './auth/profile-completion-form'
import { GoogleAuthButton } from './auth/google-auth-button'
import { AlgeriaFlag } from './algeria-flag'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export interface SignInDialogProps {
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
  initialTab?: 'login' | 'signup'
}

export function SignInDialog({
  isOpen,
  onClose,
  triggerRef,
  initialTab = 'login',
}: SignInDialogProps) {
  const { loginWithPassword, registerWithPassword } = useAuth()
  const router = useRouter()

  const [authTab, setAuthTab] = useState<'login' | 'signup'>(initialTab)
  const [method, setMethod] = useState<'phone' | 'email'>('phone')
  const [profileStep, setProfileStep] = useState(false)

  // Email form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (isOpen) {
      setAuthTab(initialTab)
    }
  }, [isOpen, initialTab])

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setMethod('phone')
    setProfileStep(false)
    setAgreeTerms(false)
    onClose()
  }

  // Focus and body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalOverflow
        triggerRef?.current?.focus()
      }
    }
  }, [isOpen, triggerRef])

  // Escape key & focus trapping
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Veuillez renseigner votre e-mail et mot de passe.')
      return
    }

    if (authTab === 'signup') {
      if (password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères.')
        return
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.')
        return
      }
      if (!agreeTerms) {
        setError('Veuillez accepter les Conditions Générales de Dzora.')
        return
      }
    }

    setLoading(true)
    try {
      if (authTab === 'login') {
        await loginWithPassword(email.trim(), password)
      } else {
        await registerWithPassword({
          email: email.trim(),
          password,
        })
      }
      router.refresh()
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l’authentification.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102A2A]/60 p-3.5 backdrop-blur-sm transition-opacity duration-200 sm:p-5"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex max-h-[92vh] w-full max-w-[440px] md:max-w-[920px] flex-col md:flex-row overflow-hidden rounded-[28px] border border-[#E5EEEB] bg-white text-[#102A2A] shadow-[0_25px_60px_rgba(0,61,49,0.22)]"
      >
        {/* Close Button at upper-right corner */}
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Fermer la boîte de dialogue"
          onClick={handleClose}
          className="absolute right-3.5 top-3.5 z-20 grid size-8 place-items-center rounded-full border border-[#E5EEEB] bg-white text-[#60716F] transition hover:bg-[#F4F8F6] hover:text-[#102A2A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B55] cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* ========================================================= */}
        {/*           LEFT WELCOME PANEL (Desktop ~45% width)         */}
        {/* ========================================================= */}
        <div className="relative hidden md:flex md:w-[44%] lg:w-[45%] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#006B55] via-[#005544] to-[#003B2E] p-7 lg:p-9 text-white">
          {/* Algerian-inspired geometric decorative watermark */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-64 text-white/5 select-none"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <rect x="52" y="52" width="96" height="96" stroke="currentColor" strokeWidth="1.5" />
            <rect x="52" y="52" width="96" height="96" transform="rotate(45 100 100)" stroke="currentColor" strokeWidth="1.5" />
          </svg>

          {/* Top content: Branding, Eyebrow, Heading, Benefits */}
          <div className="relative z-10">
            <div className="flex items-center">
              <Image
                src="/assets/dzoraLogo-white-text.webp"
                alt="Dzora"
                width={320}
                height={144}
                priority
                className="h-12 w-auto object-contain"
              />
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#FFB84D] uppercase">
                VOTRE MARKETPLACE ALGÉRIENNE
              </p>
              <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight text-white lg:text-[26px]">
                {authTab === 'signup' ? 'Rejoignez Dzora' : 'Bienvenue chez Dzora'}
              </h3>
              <p className="mt-2 text-xs leading-5 text-[#C6E1D9] lg:text-[13px]">
                Retrouvez vos produits préférés et achetez en toute confiance auprès de vendeurs vérifiés, partout en Algérie.
              </p>
            </div>

            {/* Three concise benefits */}
            <ul className="mt-6 space-y-3 text-xs font-semibold text-white/95 lg:text-[13px]">
              <li className="flex items-center gap-2.5">
                <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[#FFB84D] shrink-0">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span>Des vendeurs locaux certifiés</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[#FFB84D] shrink-0">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span>Livraison sur 58 wilayas</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[#FFB84D] shrink-0">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span>Paiement à la livraison sécurisé</span>
              </li>
            </ul>
          </div>

          {/* Bottom decorative visual card & trust badge */}
          <div className="relative z-10 mt-8 pt-5 border-t border-white/15">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-xs border border-white/10">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F28C28] text-white shadow-xs">
                <ShoppingBag size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#FFB84D]">
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Sparkles size={11} className="ml-1 text-white" />
                </div>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-white/90">
                  Ensemble pour une Algérie connectée
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/*           RIGHT AUTH PANEL (~55% width)                   */}
        {/* ========================================================= */}
        <div className="relative flex flex-1 flex-col overflow-y-auto p-6 sm:p-8 lg:p-9 bg-white text-[#102A2A]">
          {/* Mobile Logo Brand */}
          <div className="flex items-center md:hidden mb-2">
            <Image
              src="/assets/dzoraLogo.webp"
              alt="Dzora"
              width={320}
              height={144}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Top Pill Tabs: [ Se connecter ] | [ S'inscrire ] */}
          {!profileStep && (
            <div className="grid grid-cols-2 rounded-2xl bg-[#F0F5F2] p-1 text-xs font-bold mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login')
                  setError(null)
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-white text-[#006B55] shadow-xs'
                    : 'text-[#60716F] hover:text-[#102A2A]'
                }`}
              >
                <span>Se connecter</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup')
                  setError(null)
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition cursor-pointer ${
                  authTab === 'signup'
                    ? 'bg-white text-[#006B55] shadow-xs'
                    : 'text-[#60716F] hover:text-[#102A2A]'
                }`}
              >
                <span>S&apos;inscrire</span>
              </button>
            </div>
          )}

          {/* Panel Heading */}
          <h2
            id={titleId}
            className="font-display text-2xl font-extrabold tracking-tight text-[#102A2A]"
          >
            {profileStep
              ? 'Complétez votre profil'
              : authTab === 'signup'
              ? 'Créer votre compte Dzora'
              : 'Bienvenue sur Dzora'}
          </h2>
          <p id={descriptionId} className="mt-1 text-xs text-[#60716F]">
            {profileStep
              ? 'Quelques secondes pour finaliser votre inscription.'
              : authTab === 'signup'
              ? 'Inscrivez-vous en moins d’une minute sans mot de passe complexe.'
              : 'Poursuivez vos achats et retrouvez vos coordonnées enregistrées.'}
          </p>

          {/* Error notice */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Content Area */}
          <div className="mt-5">
            {profileStep ? (
              /* Step 3 (Only post-signup): Profile Completion */
              <ProfileCompletionForm
                onSuccess={() => {
                  handleClose()
                  router.refresh()
                }}
              />
            ) : method === 'phone' ? (
              /* Primary: Phone OTP Form */
              <div className="space-y-4">
                <PhoneOtpForm
                  mode={authTab}
                  onSuccess={() => {
                    handleClose()
                    router.refresh()
                  }}
                  onNeedProfileCompletion={() => {
                    setProfileStep(true)
                  }}
                  onSwitchToLogin={() => {
                    setAuthTab('login')
                  }}
                  onSwitchToSignup={() => {
                    setAuthTab('signup')
                  }}
                />

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ou
                  </span>
                </div>

                {/* Google OAuth Button */}
                <GoogleAuthButton />

                {/* Switch to Email option */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('email')
                      setError(null)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006B55] hover:text-[#005544] hover:underline cursor-pointer"
                  >
                    <Mail size={14} />
                    <span>Utiliser un e-mail à la place</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Secondary: Email / Password Flow */
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Adresse e-mail
                  </label>
                  <div className="relative mt-1.5">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="vous@exemple.dz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-[#F7FAF9] pl-9 pr-3 text-xs outline-none transition focus:border-[#006B55] focus:bg-white text-[#102A2A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Mot de passe
                    </label>
                    {authTab === 'login' && (
                      <span className="text-[11px] font-semibold text-[#006B55] hover:underline cursor-pointer">
                        Mot de passe oublié ?
                      </span>
                    )}
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-[#F7FAF9] pl-3 pr-9 text-xs outline-none transition focus:border-[#006B55] focus:bg-white text-[#102A2A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {authTab === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-[#F7FAF9] pl-3 pr-9 text-xs outline-none transition focus:border-[#006B55] focus:bg-white text-[#102A2A]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#006B55] focus:ring-[#006B55]"
                      />
                      <label htmlFor="agreeTerms" className="text-[11px] text-slate-600 leading-tight">
                        J&apos;accepte les <span className="font-semibold text-[#006B55] hover:underline cursor-pointer">Conditions Générales</span> et la <span className="font-semibold text-[#006B55] hover:underline cursor-pointer">Politique de Confidentialité</span> de Dzora.
                      </label>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006B55] text-xs font-bold text-white shadow-md shadow-[#006B55]/20 hover:bg-[#005544] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  ) : authTab === 'signup' ? (
                    'Créer mon compte'
                  ) : (
                    'Se connecter'
                  )}
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ou
                  </span>
                </div>

                <GoogleAuthButton />

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('phone')
                      setError(null)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006B55] hover:text-[#005544] hover:underline cursor-pointer"
                  >
                    <Smartphone size={14} />
                    <span>Utiliser mon numéro de téléphone</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom helper prompt */}
          {!profileStep && (
            <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
              {authTab === 'signup' ? (
                <span>
                  Vous avez déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login')
                      setError(null)
                    }}
                    className="font-bold text-[#006B55] hover:underline cursor-pointer"
                  >
                    Se connecter
                  </button>
                </span>
              ) : (
                <span>
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup')
                      setError(null)
                    }}
                    className="font-bold text-[#006B55] hover:underline cursor-pointer"
                  >
                    S&apos;inscrire
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Quality Guarantee Footer */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <span>Paiement à la livraison garanti partout en Algérie</span>
            <AlgeriaFlag className="h-3 w-4.5 rounded-[2px] shadow-2xs border border-black/10 inline-block align-middle" />
          </div>
        </div>
      </div>
    </div>
  )
}
