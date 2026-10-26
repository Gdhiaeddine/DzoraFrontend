'use client'

import React, { useState, useRef, useEffect, useId, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react'
import { api, User } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function AdminLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading: isAuthLoading, handleAuthSuccess } = useAuth()

  const redirectParam = searchParams.get('redirect')
  const targetUrl =
    redirectParam && redirectParam.startsWith('/admin')
      ? redirectParam
      : '/admin/dashboard'

  const roles = user?.roles || []
  const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')

  // Automatically navigate to dashboard if already logged in as administrator
  useEffect(() => {
    if (isAuthLoading) return

    if (isAuthenticated && isAdmin) {
      router.replace(targetUrl)
    }
  }, [isAuthLoading, isAuthenticated, isAdmin, router, targetUrl])

  // ================= Step state =================
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Credentials
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 2: Two-Factor Authentication
  const [tempToken, setTempToken] = useState<string | null>(null)
  const [totpDigits, setTotpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [backupCode, setBackupCode] = useState('')

  // UI status & errors
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [assistanceModalOpen, setAssistanceModalOpen] = useState(false)

  // Accessibility refs & IDs
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const backupCodeInputRef = useRef<HTMLInputElement>(null)
  const emailErrorId = useId()
  const passwordErrorId = useId()

  // Focus management on step change
  useEffect(() => {
    if (step === 2) {
      if (useBackupCode) {
        backupCodeInputRef.current?.focus()
      } else {
        digitInputRefs.current[0]?.focus()
      }
    } else {
      emailInputRef.current?.focus()
    }
  }, [step, useBackupCode])

  // Clear transient error when inputs change
  const clearError = () => {
    if (errorMessage) setErrorMessage(null)
  }

  // ================= Step 1 Submission =================
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Veuillez saisir une adresse e-mail professionnelle valide.')
      emailInputRef.current?.focus()
      return
    }

    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe.')
      passwordInputRef.current?.focus()
      return
    }

    setIsLoading(true)

    try {
      // Call backend dedicated admin endpoint POST /api/v1/admin/auth/login (with fallback)
      const result = await api.auth.loginAdminWithPassword(cleanEmail, password)

      // Zero out password from memory immediately once sent
      setPassword('')

      if (result.requires2Fa && result.tempToken) {
        setTempToken(result.tempToken)
        setStep(2)
        setTotpDigits(['', '', '', '', '', ''])
        setBackupCode('')
      } else {
        // If 2FA wasn't strictly returned by backend, verify whether the user has admin role
        const roles = result.user?.roles || []
        if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
          // Admin verified
          if (result.user) {
            handleAuthSuccess(result.user)
          }
          window.location.href = targetUrl
        } else {
          setErrorMessage('Accès refusé. Ce compte ne dispose pas des privilèges administrateur requis.')
        }
      }
    } catch (err: any) {
      // Neutral, non-revealing error message to prevent user enumeration
      const defaultMsg = 'Identifiants incorrects ou accès non autorisé.'
      setErrorMessage(err.data?.message || err.message || defaultMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // ================= Step 2 Digit Handlers =================
  const handleDigitChange = (index: number, val: string) => {
    clearError()
    const cleaned = val.replace(/\D/g, '')
    const newDigits = [...totpDigits]

    // Handle full paste of 6 digits
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('')
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char
      })
      setTotpDigits(newDigits)
      const nextIdx = Math.min(pasted.length, 5)
      digitInputRefs.current[nextIdx]?.focus()

      if (pasted.length === 6) {
        verifyTwoFactorCode(newDigits.join(''))
      }
      return
    }

    newDigits[index] = cleaned.slice(-1)
    setTotpDigits(newDigits)

    if (cleaned && index < 5) {
      digitInputRefs.current[index + 1]?.focus()
    }

    // Auto submit if all 6 digits are populated
    if (newDigits.every((d) => d.length === 1)) {
      verifyTwoFactorCode(newDigits.join(''))
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitInputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      digitInputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newDigits = [...totpDigits]
    pastedData.split('').forEach((char, i) => {
      newDigits[i] = char
    })
    setTotpDigits(newDigits)

    const nextIndex = Math.min(pastedData.length, 5)
    digitInputRefs.current[nextIndex]?.focus()

    if (pastedData.length === 6) {
      verifyTwoFactorCode(pastedData)
    }
  }

  // ================= Step 2 Verification =================
  const verifyTwoFactorCode = async (providedCode?: string) => {
    if (!tempToken) {
      setErrorMessage('Session de validation expirée. Veuillez vous reconnecter.')
      handleReturnToStep1()
      return
    }

    const codeToVerify =
      providedCode || (useBackupCode ? backupCode.trim() : totpDigits.join(''))

    if (!codeToVerify) {
      setErrorMessage(
        useBackupCode
          ? 'Veuillez saisir votre code de secours.'
          : 'Veuillez saisir le code à 6 chiffres.'
      )
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // POST /api/v1/admin/auth/2fa/login with tempToken and code (with fallback)
      const result = await api.auth.loginAdminWith2Fa(tempToken, codeToVerify)

      const roles = result.user?.roles || []
      if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
        // Authenticated as Administrator
        if (result.user) {
          handleAuthSuccess(result.user)
        }
        window.location.href = targetUrl
      } else {
        setErrorMessage('Accès refusé. Privilèges administrateur requis.')
      }
    } catch (err: any) {
      // Neutral error for invalid code
      setErrorMessage('Code de vérification invalide ou expiré.')
    } finally {
      setIsLoading(false)
    }
  }

  // Safely return to step 1 without leaking or retaining sensitive credentials
  const handleReturnToStep1 = () => {
    setStep(1)
    setPassword('')
    setTempToken(null)
    setTotpDigits(['', '', '', '', '', ''])
    setBackupCode('')
    setErrorMessage(null)
    setUseBackupCode(false)
  }

  if (isAuthLoading || (isAuthenticated && isAdmin)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
        <p className="text-sm font-bold text-[#102A2A]">Redirection vers le tableau de bord…</p>
        <p className="text-xs text-[#60716F] mt-1">Session administrateur active détectée</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-[#006B55]/20 selection:text-[#006B55] overflow-x-hidden">
      {/* ========================================================= */}
      {/* LEFT BRAND & SECURITY PANEL                               */}
      {/* ========================================================= */}
      <section
        aria-label="Présentation sécurité Dzora Admin"
        className="relative lg:w-1/2 bg-gradient-to-br from-[#052F26] via-[#094134] to-[#04241D] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden shadow-2xl z-10"
      >
        {/* Subtle geometric pattern & Algerian micro-ornaments background */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />

        {/* Ambient atmospheric glows */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#5CE1B6]/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#006B55]/30 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* --- Top: Logo & ADMIN Tag --- */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center group transition focus:outline-none focus:ring-2 focus:ring-[#5CE1B6]/60 rounded-lg p-0.5"
              aria-label="Dzora - Accueil marketplace"
            >
              <Image
                src="/assets/dzoraLogo-white-text.webp"
                alt="Dzora"
                width={170}
                height={64}
                priority
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-widest uppercase bg-white/10 text-emerald-200 border border-white/15 backdrop-blur-sm">
              ADMIN
            </span>
          </div>
        </div>

        {/* --- Center: Headings & Restrained Security Illustration --- */}
        <div className="relative z-10 my-10 lg:my-auto max-w-lg">
          <div className="space-y-3">
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#5CE1B6] uppercase">
              PORTAIL D’ADMINISTRATION
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight leading-[1.15]">
              Le centre de contrôle de Dzora
            </h1>
            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed pt-1">
              Gérez la marketplace dans un espace réservé et sécurisé.
            </p>
          </div>

          {/* Restrained Shield-and-Lock Illustration */}
          <div className="mt-8 sm:mt-12 flex justify-center lg:justify-start">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              {/* Outer decorative protective rings */}
              <div
                className="absolute inset-0 rounded-full border border-emerald-400/15 animate-[spin_60s_linear_infinite]"
                style={{ strokeDasharray: '6 6' }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-4 rounded-full border border-emerald-300/10"
                aria-hidden="true"
              />
              <div
                className="absolute inset-10 rounded-full bg-emerald-500/5 backdrop-blur-xs border border-white/5"
                aria-hidden="true"
              />

              {/* Central stylized Shield & Algerian marketplace motif */}
              <svg
                viewBox="0 0 200 220"
                className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] relative z-10 transition-transform duration-500 hover:scale-105"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Illustration de protection sécurisée"
              >
                <defs>
                  <linearGradient id="shieldGrad" x1="20" y1="20" x2="180" y2="200" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0E5D4B" />
                    <stop offset="0.6" stopColor="#083E32" />
                    <stop offset="1" stopColor="#04271F" />
                  </linearGradient>
                  <linearGradient id="shieldBorder" x1="20" y1="20" x2="180" y2="200" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5CE1B6" stopOpacity="0.8" />
                    <stop offset="0.5" stopColor="#2BB688" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#104D3F" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="lockGrad" x1="80" y1="70" x2="120" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#D1E7DF" />
                  </linearGradient>
                </defs>

                {/* Shield Outline & Base */}
                <path
                  d="M100 15L170 48V108C170 156.4 140.2 195.8 100 208C59.8 195.8 30 156.4 30 108V48L100 15Z"
                  fill="url(#shieldGrad)"
                  stroke="url(#shieldBorder)"
                  strokeWidth="2.5"
                />

                {/* Inner Shield Contour */}
                <path
                  d="M100 28L158 55V106C158 147.2 133.2 181.1 100 192C66.8 181.1 42 147.2 42 106V55L100 28Z"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1.5"
                />

                {/* Subtle Algerian Commerce Starburst Accents */}
                <circle cx="100" cy="115" r="38" fill="rgba(92,225,182,0.06)" />
                <path
                  d="M100 48V58M100 172V182M55 115H65M135 115H145"
                  stroke="rgba(92,225,182,0.25)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Padlock Shackle */}
                <path
                  d="M84 104V88C84 79.16 91.16 72 100 72C108.84 72 116 79.16 116 88V104"
                  stroke="url(#lockGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Padlock Body */}
                <rect
                  x="76"
                  y="102"
                  width="48"
                  height="38"
                  rx="7"
                  fill="url(#lockGrad)"
                  className="drop-shadow-sm"
                />

                {/* Padlock Keyhole */}
                <circle cx="100" cy="117" r="3.5" fill="#083E32" />
                <path d="M100 119V127" stroke="#083E32" strokeWidth="2.5" strokeLinecap="round" />

                {/* Small warm orange security status node */}
                <circle cx="116" cy="108" r="2.5" fill="#F97316" />
              </svg>
            </div>
          </div>
        </div>

        {/* --- Bottom: Three Compact Security Assurances --- */}
        <div className="relative z-10 pt-6 border-t border-emerald-400/15">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-100/90">
              <KeyRound className="h-4 w-4 shrink-0 text-[#5CE1B6]" aria-hidden="true" />
              <span className="font-medium">Authentification à deux facteurs obligatoire</span>
            </div>
            <div className="flex items-center gap-2.5 text-emerald-100/90">
              <Lock className="h-4 w-4 shrink-0 text-[#5CE1B6]" aria-hidden="true" />
              <span className="font-medium">Sessions administrateur sécurisées</span>
            </div>
            <div className="flex items-center gap-2.5 text-emerald-100/90">
              <FileCheck className="h-4 w-4 shrink-0 text-[#5CE1B6]" aria-hidden="true" />
              <span className="font-medium">Actions sensibles journalisées</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RIGHT LOGIN AREA                                          */}
      {/* ========================================================= */}
      <section
        aria-label="Formulaire d'authentification administrateur"
        className="flex-1 bg-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between overflow-y-auto"
      >
        <div className="max-w-[440px] w-full mx-auto my-auto py-6">
          {/* Status badge & Step indicator Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>ACCÈS SÉCURISÉ</span>
            </div>
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              {step === 1 ? 'ÉTAPE 1 SUR 2' : 'ÉTAPE 2 SUR 2'}
            </span>
          </div>

          {/* Dynamic Headings based on Step */}
          {step === 1 ? (
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-tight">
                Connexion administrateur
              </h2>
              <p className="text-sm text-gray-500 mt-1.5">
                Connectez-vous avec votre compte administrateur.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-tight">
                Vérification en deux étapes
              </h2>
              <p className="text-sm text-gray-500 mt-1.5">
                {useBackupCode
                  ? 'Saisissez l’un de vos codes de secours de sauvegarde.'
                  : 'Saisissez le code temporaire à 6 chiffres généré par votre application d’authentification.'}
              </p>
            </div>
          )}

          {/* Neutral Error Display */}
          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed font-medium">{errorMessage}</p>
            </div>
          )}

          {/* =================================================== */}
          {/* STEP 1: Email and Password Form                     */}
          {/* =================================================== */}
          {step === 1 && (
            <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-4" noValidate>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5"
                >
                  Adresse e-mail professionnelle
                </label>
                <input
                  ref={emailInputRef}
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError()
                  }}
                  placeholder="admin@dzora.dz"
                  disabled={isLoading}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:border-[#006B55] focus:ring-4 focus:ring-[#006B55]/10 outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    Mot de passe
                  </label>
                </div>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearError()
                    }}
                    disabled={isLoading}
                    className="w-full px-3.5 py-3 pr-11 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:border-[#006B55] focus:ring-4 focus:ring-[#006B55]/10 outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#006B55]/30 rounded p-1 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Pale-mint Security Notice */}
              <div className="rounded-xl border border-[#BBDDD4] bg-[#E7F2EF] p-3.5 text-xs text-[#0B4639] flex items-start gap-2.5 leading-relaxed">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#006B55] mt-0.5" aria-hidden="true" />
                <span>
                  La vérification en deux étapes est obligatoire. Après validation de vos identifiants, un code temporaire de votre application d’authentification vous sera demandé.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#006B55] hover:bg-[#005544] text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm hover:shadow transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#006B55]/20 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Validation des identifiants...</span>
                  </>
                ) : (
                  <>
                    <span>Continuer</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>

              {/* Informative Assistance & Policy Notice */}
              <div className="pt-2 text-center space-y-2">
                <div>
                  <button
                    type="button"
                    onClick={() => setAssistanceModalOpen(true)}
                    className="text-xs text-[#006B55] hover:text-[#005544] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#006B55]/30 rounded px-1"
                  >
                    Besoin d’aide ? Contacter l’assistance
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Accès réservé au personnel autorisé. Chaque connexion est journalisée.
                </p>
              </div>
            </form>
          )}

          {/* =================================================== */}
          {/* STEP 2: Two-Factor Authentication Form              */}
          {/* =================================================== */}
          {step === 2 && (
            <div className="mt-6 space-y-5 animate-fadeIn">
              {!useBackupCode ? (
                /* 6-Digit TOTP Positions */
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 text-center">
                    Code d’authentification (TOTP)
                  </label>
                  <div
                    className="flex justify-between items-center gap-2 max-w-[340px] mx-auto"
                    onPaste={handleDigitPaste}
                  >
                    {totpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          digitInputRefs.current[idx] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        aria-label={`Chiffre ${idx + 1} du code d'authentification`}
                        disabled={isLoading}
                        className="w-12 h-13 text-center text-xl font-bold font-mono rounded-xl border border-gray-200 text-[#102A2A] focus:border-[#006B55] focus:ring-4 focus:ring-[#006B55]/10 outline-none transition disabled:bg-gray-50"
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 text-center mt-2.5">
                    Collez ou saisissez le code à 6 chiffres depuis votre application d’authentification.
                  </p>
                </div>
              ) : (
                /* Emergency Backup Code Input */
                <div>
                  <label
                    htmlFor="backup-code"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5"
                  >
                    Code de secours
                  </label>
                  <input
                    ref={backupCodeInputRef}
                    id="backup-code"
                    type="text"
                    value={backupCode}
                    onChange={(e) => {
                      setBackupCode(e.target.value)
                      clearError()
                    }}
                    placeholder="Ex: 8A4F-91C2"
                    disabled={isLoading}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-gray-900 font-mono placeholder:text-gray-400 text-sm focus:border-[#006B55] focus:ring-4 focus:ring-[#006B55]/10 outline-none transition disabled:bg-gray-50"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Utilisez l’un des codes de secours de sauvegarde.
                  </p>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => verifyTwoFactorCode()}
                disabled={
                  isLoading ||
                  (!useBackupCode && totpDigits.some((d) => d === '')) ||
                  (useBackupCode && !backupCode.trim())
                }
                className="w-full bg-[#006B55] hover:bg-[#005544] text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#006B55]/20 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Vérification en cours...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>Vérifier</span>
                  </>
                )}
              </button>

              {/* Toggle Backup Code vs TOTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode)
                    setErrorMessage(null)
                  }}
                  className="text-xs text-[#006B55] hover:text-[#005544] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#006B55]/30 rounded px-1"
                >
                  {useBackupCode
                    ? 'Utiliser l’application d’authentification'
                    : 'Utiliser un code de secours'}
                </button>
              </div>

              {/* Return to Step 1 without keeping or displaying password */}
              <div className="pt-2 text-center border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleReturnToStep1}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Retour à la saisie des identifiants</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- Discreet Footer --- */}
        <footer className="pt-6 border-t border-gray-100 max-w-[440px] w-full mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>© 2026 Dzora · Portail d’administration</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            Connexion surveillée
          </span>
        </footer>
      </section>

      {/* ========================================================= */}
      {/* Informative Assistance Dialog (Modal)                     */}
      {/* ========================================================= */}
      {assistanceModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistance-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-[#006B55] mb-3">
              <HelpCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
              <h3 id="assistance-title" className="text-base font-bold text-gray-900 font-display">
                Assistance Administrateur Dzora
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pour des raisons de conformité et de sécurité, la réinitialisation des accès administrateur ou des clés TOTP requiert l’intervention directe du département Sécurité des Systèmes d’Information.
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-700 space-y-1.5 border border-gray-100">
              <p>
                <strong>E-mail interne :</strong>{' '}
                <span className="font-mono text-emerald-800">security@dzora.dz</span>
              </p>
              <p>
                <strong>Permanence IT / SOC :</strong> Extension interne 4400
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setAssistanceModalOpen(false)}
                className="px-4 py-2 bg-[#006B55] text-white text-xs font-semibold rounded-lg hover:bg-[#005544] transition cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
          <p className="text-sm font-bold text-[#102A2A]">Chargement du portail d’administration…</p>
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  )
}
