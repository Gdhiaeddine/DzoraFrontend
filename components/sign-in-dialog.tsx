'use client'

import React, { useState, useEffect, useRef, useId } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShoppingBag,
  X,
  AlertCircle,
  Info,
} from 'lucide-react'

interface SignInDialogProps {
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
}

export function SignInDialog({ isOpen, onClose, triggerRef }: SignInDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'info' | 'error'; message: string } | null>(null)

  const dialogRef = useRef<HTMLDivElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const titleId = useId()
  const descriptionId = useId()

  // Reset fields & feedback when closing
  const handleClose = () => {
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setFeedback(null)
    onClose()
  }

  // Focus email field on open, restore focus on close, prevent body scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // Focus email input once modal opens
      const timer = setTimeout(() => {
        emailInputRef.current?.focus()
      }, 50)

      return () => {
        clearTimeout(timer)
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
        return
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusableElements.length) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate fields browser-side
    const trimmedEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!trimmedEmail) {
      setFeedback({
        type: 'error',
        message: 'Veuillez saisir votre adresse e-mail.',
      })
      emailInputRef.current?.focus()
      return
    }

    if (!emailRegex.test(trimmedEmail)) {
      setFeedback({
        type: 'error',
        message: 'Veuillez saisir une adresse e-mail valide (ex: vous@exemple.dz).',
      })
      emailInputRef.current?.focus()
      return
    }

    if (!password) {
      setFeedback({
        type: 'error',
        message: 'Veuillez saisir votre mot de passe.',
      })
      return
    }

    if (password.length < 8) {
      setFeedback({
        type: 'error',
        message: 'Le mot de passe doit comporter au moins 8 caractères.',
      })
      return
    }

    // Required valid demo response (explicitly not logging in or sending data)
    setFeedback({
      type: 'info',
      message:
        'Démo uniquement : le formulaire est valide, mais aucune connexion réelle n’a été effectuée et aucune information n’a été envoyée.',
    })
  }

  const handleCreateAccountClick = () => {
    setFeedback({
      type: 'info',
      message: 'La création de compte n’est pas activée dans cette prévisualisation.',
    })
  }

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102A2A]/55 p-3.5 sm:p-5 backdrop-blur-sm transition-opacity duration-200"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-2xl border border-[#E5EEEB] bg-white text-[#102A2A] shadow-[0_20px_50px_rgba(0,61,49,0.18)]"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Fermer la boîte de dialogue"
          onClick={handleClose}
          className="absolute right-3.5 top-3.5 z-10 grid size-8 place-items-center rounded-full border border-[#E5EEEB] bg-white text-[#60716F] transition hover:bg-[#F4F8F6] hover:text-[#102A2A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B55]"
        >
          <X size={16} />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
          {/* 1. Small Dzora bag mark and wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="relative grid size-8 place-items-center rounded-[10px] bg-[#006B55] text-white shadow-sm">
              <ShoppingBag size={17} strokeWidth={2.5} />
              <span className="absolute right-[6px] top-[5px] size-1.5 rounded-full bg-[#F28C28]" />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold leading-none tracking-[-0.04em] text-[#006B55]">
                Dzora
              </span>
            </div>
          </div>

          {/* 2. Small uppercase eyebrow */}
          <p className="mt-3.5 text-[10px] font-bold tracking-[0.14em] text-[#006B55] uppercase">
            ESPACE CLIENT
          </p>

          {/* 3. Main heading */}
          <h2
            id={titleId}
            className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A]"
          >
            Se connecter à Dzora
          </h2>

          {/* 4. Prominent pale-mint preview notice */}
          <div
            id={descriptionId}
            className="mt-3.5 rounded-xl border border-[#CDE8DB] bg-[#EAF8F2] p-3 sm:p-3.5 text-xs leading-5 text-[#234F45]"
          >
            <div className="flex items-start gap-2">
              <Info size={16} className="mt-0.5 shrink-0 text-[#006B55]" />
              <p>
                <b>Mode prévisualisation :</b> ceci est une maquette d’interface uniquement. Aucun compte n’est authentifié. N’entrez pas de vrais identifiants : le formulaire ne transmet et n’enregistre aucune donnée.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            {/* 5. Email label & field */}
            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs font-semibold text-[#102A2A]"
              >
                Adresse e-mail
              </label>
              <input
                ref={emailInputRef}
                id="signin-email"
                type="email"
                name="email"
                autoComplete="off"
                placeholder="vous@exemple.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#D9E7E2] bg-[#F7FAF9] px-3.5 text-sm outline-none transition focus:border-[#008F72] focus:bg-white focus:ring-2 focus:ring-[#008F72]/15"
              />
            </div>

            {/* 6. Password label & field with toggle */}
            <div>
              <label
                htmlFor="signin-password"
                className="block text-xs font-semibold text-[#102A2A]"
              >
                Mot de passe
              </label>
              <div className="relative mt-1.5">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="off"
                  placeholder="8 caractères minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#D9E7E2] bg-[#F7FAF9] pl-3.5 pr-11 text-sm outline-none transition focus:border-[#008F72] focus:bg-white focus:ring-2 focus:ring-[#008F72]/15"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-7 place-items-center rounded-lg text-[#60716F] transition hover:text-[#102A2A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B55]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 7. Emerald primary button */}
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006B55] px-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,107,85,0.22)] transition hover:bg-[#008F72] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B55] focus-visible:ring-offset-2 active:scale-[0.99]"
            >
              Tester le formulaire <ArrowRight size={16} />
            </button>
          </form>

          {/* 8. Feedback area below button */}
          <div aria-live="polite" className="mt-3.5 min-h-[1.25rem]">
            {feedback && (
              <div
                className={`flex items-start gap-2.5 rounded-xl p-3 text-xs leading-5 ${
                  feedback.type === 'error'
                    ? 'border border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B]'
                    : 'border border-[#CDE8DB] bg-[#EAF8F2] text-[#1E4D40]'
                }`}
              >
                {feedback.type === 'error' ? (
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-[#DC2626]" />
                ) : (
                  <Info size={15} className="mt-0.5 shrink-0 text-[#006B55]" />
                )}
                <p className="font-medium">{feedback.message}</p>
              </div>
            )}
          </div>

          {/* 9. Footer line */}
          <div className="mt-5 border-t border-[#F0F4F2] pt-4 text-center text-xs text-[#60716F]">
            <span>Vous découvrez Dzora ?</span>
            <button
              type="button"
              onClick={handleCreateAccountClick}
              className="ml-1.5 font-bold text-[#006B55] transition hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[#006B55] rounded"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
