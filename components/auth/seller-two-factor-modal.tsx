'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  ShieldCheck,
  KeyRound,
  Lock,
  X,
  AlertCircle,
  Copy,
  Check,
  Download,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { api, User } from '@/lib/api'

interface SellerTwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: User) => void
}

export function SellerTwoFactorModal({
  isOpen,
  onClose,
  onSuccess,
}: SellerTwoFactorModalProps) {
  const { pending2Fa, complete2Fa, cancel2Fa } = useAuth()

  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [totpDigits, setTotpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [recoveryCode, setRecoveryCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setTotpDigits(['', '', '', '', '', ''])
      setRecoveryCode('')
      setUseRecoveryCode(false)
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])

  if (!isOpen || !pending2Fa) return null

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '')
    const newDigits = [...totpDigits]

    // Handle full paste
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('')
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char
      })
      setTotpDigits(newDigits)
      const nextIdx = Math.min(pasted.length, 5)
      inputRefs.current[nextIdx]?.focus()
      if (pasted.length === 6) {
        handleSubmit(newDigits.join(''))
      }
      return
    }

    newDigits[index] = cleaned.slice(-1)
    setTotpDigits(newDigits)

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every((d) => d.length === 1)) {
      handleSubmit(newDigits.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (directCode?: string) => {
    setError(null)
    const code = directCode || (useRecoveryCode ? recoveryCode.trim() : totpDigits.join(''))

    if (!code) {
      setError(
        useRecoveryCode
          ? 'Veuillez saisir votre code de récupération.'
          : 'Veuillez saisir le code à 6 chiffres de votre application.',
      )
      return
    }

    setLoading(true)
    try {
      const user = await complete2Fa(code)
      if (onSuccess) {
        onSuccess(user)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Code de vérification incorrect ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    cancel2Fa()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F2EF] text-[#006B55]">
            <ShieldCheck className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <h3 className="mt-3.5 text-lg font-bold text-slate-900">
            Vérification en deux étapes
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {pending2Fa.email
              ? `Compte vendeur sécurisé (${pending2Fa.email})`
              : 'Compte vendeur protégé par 2FA'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Inputs */}
        <div className="mt-6 space-y-5">
          {!useRecoveryCode ? (
            <div>
              <label className="mb-2 block text-center text-xs font-bold text-slate-700">
                Code Google Authenticator / Authy
              </label>
              <div className="flex justify-between gap-2">
                {totpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={loading}
                    className="h-12 w-11 rounded-xl border border-slate-200 text-center text-xl font-bold text-slate-900 shadow-sm focus:border-[#006B55] focus:outline-none focus:ring-2 focus:ring-[#006B55]/20 sm:h-14 sm:w-12 sm:text-2xl"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Code de secours d’urgence (format: 8A3F-92BC)
              </label>
              <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white focus-within:border-[#006B55] focus-within:ring-2 focus-within:ring-[#006B55]/20">
                <div className="pl-3.5 text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  placeholder="ABCD-1234"
                  disabled={loading}
                  autoFocus
                  className="w-full bg-transparent px-3 py-3 font-mono text-sm font-bold tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={
              loading ||
              (!useRecoveryCode && totpDigits.some((d) => !d)) ||
              (useRecoveryCode && !recoveryCode.trim())
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#006B55] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-[#006B55]/20 transition-all hover:bg-[#005544] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Confirmer et se connecter</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Mode switch link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setError(null)
                setUseRecoveryCode(!useRecoveryCode)
              }}
              className="text-xs font-semibold text-[#006B55] hover:underline"
            >
              {useRecoveryCode
                ? 'Revenir au code d’application (TOTP)'
                : 'Appareil perdu ? Utiliser un code de récupération'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
