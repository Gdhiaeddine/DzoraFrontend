'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Edit2, UserCheck, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { User } from '@/lib/api'
import { AlgeriaFlag } from '@/components/algeria-flag'

interface PhoneOtpFormProps {
  mode?: 'login' | 'signup'
  onSuccess?: (user: User) => void
  onNeedProfileCompletion?: (user: User) => void
  onSwitchToLogin?: () => void
  onSwitchToSignup?: (preservedPhone?: string) => void
  redirectTo?: string
}

export function PhoneOtpForm({
  mode = 'login',
  onSuccess,
  onNeedProfileCompletion,
  onSwitchToLogin,
  onSwitchToSignup,
  redirectTo,
}: PhoneOtpFormProps) {
  const router = useRouter()
  const { sendOtp, verifyOtp } = useAuth()

  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(mode)
  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [existingAccountDetected, setExistingAccountDetected] = useState(false)
  const [noAccountDetected, setNoAccountDetected] = useState(false)

  // Resend Timer
  const [cooldown, setCooldown] = useState(0)
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setCurrentMode(mode)
    setExistingAccountDetected(false)
    setNoAccountDetected(false)
    setError(null)
  }, [mode])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Focus first digit box when switching to CODE step
  useEffect(() => {
    if (step === 'CODE') {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [step])

  const formatPhoneNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, '')
    if (raw.length <= 10) {
      setPhoneNumber(formatPhoneNumber(raw))
      setExistingAccountDetected(false)
      setNoAccountDetected(false)
      setError(null)
    }
  }

  const handleSendOtp = async (e?: React.FormEvent, forceLogin = false) => {
    if (e) e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setNoAccountDetected(false)

    const raw = phoneNumber.replace(/\s/g, '')
    if (!raw || (raw.length !== 9 && raw.length !== 10)) {
      setError('Veuillez saisir un numéro valide (ex: 0550 12 34 56 ou 550 12 34 56)')
      return
    }

    setLoading(true)
    try {
      const activeMode = currentMode
      const res = await sendOtp(raw, { checkExistence: true, purpose: activeMode })

      // If user is in SIGNUP mode and account already exists, show graceful notification
      if (activeMode === 'signup' && res.exists && !forceLogin) {
        setExistingAccountDetected(true)
        setNoAccountDetected(false)
        setLoading(false)
        return
      }

      // If user is in LOGIN mode and account does NOT exist, show feedback banner
      if (activeMode === 'login' && !res.exists) {
        setNoAccountDetected(true)
        setExistingAccountDetected(false)
        setLoading(false)
        return
      }

      setExistingAccountDetected(false)
      setNoAccountDetected(false)
      setCooldown(res.cooldownSeconds || 60)
      if (res.otpCodeForDev) {
        setDevOtpHint(res.otpCodeForDev)
      }
      setStep('CODE')
      setSuccessMsg('Code de vérification envoyé par SMS.')
    } catch (err: any) {
      setError(err.message || 'Impossible d’envoyer le code SMS. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const newDigits = [...codeDigits]

    // Handle paste of full 6-digit code
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('')
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char
      })
      setCodeDigits(newDigits)
      const nextIdx = Math.min(pasted.length, 5)
      inputRefs.current[nextIdx]?.focus()

      if (pasted.length === 6) {
        handleVerify(newDigits.join(''))
      }
      return
    }

    newDigits[index] = cleaned.slice(-1)
    setCodeDigits(newDigits)

    // Advance focus
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify if all 6 digits entered
    if (newDigits.every((d) => d.length === 1)) {
      handleVerify(newDigits.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || codeDigits.join('')
    if (code.length !== 6) {
      setError('Veuillez entrer le code à 6 chiffres.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '')
      const result = await verifyOtp(cleanPhone, code)

      // If user is newly created or missing full name, prompt for profile completion
      if ((result.isNewUser || !result.profileComplete) && onNeedProfileCompletion) {
        onNeedProfileCompletion(result.user)
        return
      }

      if (onSuccess) {
        onSuccess(result.user)
      } else if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Code de confirmation invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Alert banners */}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && !error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-[#BBDDD4] bg-[#E7F2EF]/80 p-3 text-xs font-semibold text-[#006B55]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#006B55]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Account Already Exists Banner (Friendly UX without rejection) */}
      {existingAccountDetected && (
        <div className="mb-4 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-3.5 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Ce numéro est déjà inscrit</p>
              <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
                Un compte Dzora existe déjà pour le <strong>+213 {phoneNumber}</strong>. Vous pouvez vous y connecter directement.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onSwitchToLogin) onSwitchToLogin()
                setCurrentMode('login')
                handleSendOtp(undefined, true)
              }}
              className="flex-1 rounded-xl bg-[#006B55] py-2 text-center text-xs font-bold text-white shadow-xs hover:bg-[#005544] transition-colors cursor-pointer"
            >
              Se connecter avec ce numéro
            </button>
            <button
              type="button"
              onClick={() => {
                setExistingAccountDetected(false)
                setPhoneNumber('')
              }}
              className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors cursor-pointer"
            >
              Changer
            </button>
          </div>
        </div>
      )}

      {/* Account Not Found Banner (Feedback when number isn't registered in login mode) */}
      {noAccountDetected && (
        <div className="mb-4 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-3.5 text-xs text-amber-900 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Aucun compte associé à ce numéro</p>
              <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
                Le numéro <strong>+213 {phoneNumber}</strong> n&apos;est pas encore inscrit sur Dzora. Vous pouvez créer un compte en quelques secondes.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setNoAccountDetected(false)
                setCurrentMode('signup')
                if (onSwitchToSignup) {
                  onSwitchToSignup(phoneNumber)
                }
              }}
              className="flex-1 rounded-xl bg-[#006B55] py-2 text-center text-xs font-bold text-white shadow-xs hover:bg-[#005544] transition-colors cursor-pointer"
            >
              Créer un compte
            </button>
            <button
              type="button"
              onClick={() => {
                setNoAccountDetected(false)
                const input = document.getElementById('phone-number-input') as HTMLInputElement | null
                input?.focus()
              }}
              className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors cursor-pointer"
            >
              Modifier
            </button>
          </div>
        </div>
      )}

      {step === 'PHONE' ? (
        <form onSubmit={(e) => handleSendOtp(e)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Numéro de téléphone
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-[#F7FAF9] transition-all focus-within:border-[#006B55] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#006B55]/15">
              {/* Flag & prefix */}
              <div className="flex items-center gap-1.5 border-r border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/70 rounded-l-xl select-none">
                <AlgeriaFlag className="h-3.5 w-5 rounded-[2px] shadow-xs border border-black/10" />
                <span>+213</span>
              </div>

              <input
                id="phone-number-input"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="5 XX XX XX XX"
                disabled={loading}
                autoFocus
                className="w-full bg-transparent px-3 py-2.5 text-xs font-semibold tracking-wider text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Mobilis (06), Djezzy (07) ou Ooredoo (05).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.replace(/\s/g, '').length < 9}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006B55] text-xs font-bold text-white shadow-md shadow-[#006B55]/20 hover:bg-[#005544] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Continuer</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Target Phone info + Change link */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-100">
            <div className="flex items-center gap-2">
              <AlgeriaFlag className="h-3 w-4.5 rounded-[2px] shadow-2xs border border-black/10" />
              <span className="font-semibold text-slate-800">+213 {phoneNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep('PHONE')
                setCodeDigits(['', '', '', '', '', ''])
                setError(null)
              }}
              className="flex items-center gap-1 font-bold text-[#006B55] hover:underline cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
              <span>Modifier</span>
            </button>
          </div>

          {/* Dev Hint if applicable */}
          {devOtpHint && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-center text-xs font-mono font-bold text-amber-800">
              Code de test : <span className="underline">{devOtpHint}</span>
            </div>
          )}

          {/* 6 Digit Inputs */}
          <div>
            <label className="mb-2 block text-center text-xs font-bold text-slate-700">
              Code de vérification à 6 chiffres
            </label>
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="h-11 w-10 sm:h-12 sm:w-11 rounded-xl border border-slate-200 bg-[#F7FAF9] text-center text-base sm:text-lg font-bold text-[#102A2A] shadow-xs transition-all focus:border-[#006B55] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006B55]/15"
                />
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={loading || codeDigits.some((d) => !d)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006B55] text-xs font-bold text-white shadow-md shadow-[#006B55]/20 hover:bg-[#005544] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
            ) : (
              <span>Vérifier et continuer</span>
            )}
          </button>

          {/* Resend button / cooldown */}
          <div className="text-center text-xs text-slate-500">
            {cooldown > 0 ? (
              <span>Renvoyer le code dans <strong className="text-slate-800">{cooldown}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={loading}
                className="font-bold text-[#006B55] hover:underline cursor-pointer"
              >
                Vous n’avez rien reçu ? Renvoyer le SMS
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
