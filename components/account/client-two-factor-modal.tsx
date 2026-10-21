'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Download,
  AlertCircle,
  X,
  KeyRound,
  RefreshCw,
  Lock,
  ArrowRight,
  Shield,
  Smartphone,
} from 'lucide-react'
import { api, TwoFactorSetupResult } from '@/lib/api'

interface ClientTwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  isCurrentlyEnabled: boolean
  onStatusChange: (enabled: boolean) => void
}

type ModalView =
  | 'INITIAL'
  | 'SETUP_QR'
  | 'SHOW_RECOVERY_CODES'
  | 'ENABLED_DASHBOARD'
  | 'REGEN_CODES_PROMPT'
  | 'DISABLE_PROMPT'

export function ClientTwoFactorModal({
  isOpen,
  onClose,
  isCurrentlyEnabled,
  onStatusChange,
}: ClientTwoFactorModalProps) {
  const [view, setView] = useState<ModalView>('INITIAL')
  const [setupData, setSetupData] = useState<TwoFactorSetupResult | null>(null)
  const [confirmCode, setConfirmCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [disableCode, setDisableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [regenCode, setRegenCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  // Sync initial view when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setConfirmCode('')
      setDisableCode('')
      setDisablePassword('')
      setRegenCode('')
      if (isCurrentlyEnabled) {
        setView('ENABLED_DASHBOARD')
      } else {
        setView('INITIAL')
      }
    }
  }, [isOpen, isCurrentlyEnabled])

  if (!isOpen) return null

  // 1. Start 2FA Setup
  const handleStartSetup = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await api.auth.setup2Fa()
      setSetupData(res)
      setView('SETUP_QR')
    } catch (err: any) {
      setError(err?.message || 'Impossible d’initialiser la configuration 2FA.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Confirm & Enable 2FA
  const handleConfirmEnable = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clean = confirmCode.trim().replace(/\s+/g, '')
    if (clean.length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres affiché sur votre application.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await api.auth.enable2Fa(clean)
      setRecoveryCodes(res.recoveryCodes || [])
      setView('SHOW_RECOVERY_CODES')
      onStatusChange(true)
    } catch (err: any) {
      setError(err?.message || 'Code de vérification invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Confirm & Disable 2FA
  const handleConfirmDisable = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clean = disableCode.trim()
    if (!clean) {
      setError('Veuillez saisir votre code d’authentification ou un code de secours.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await api.auth.disable2Fa(clean, disablePassword.trim() || undefined)
      onStatusChange(false)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Code ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  // 4. Regenerate Recovery Codes
  const handleRegenerateCodes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clean = regenCode.trim().replace(/\s+/g, '')
    if (clean.length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres pour valider cette action.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await api.auth.regenerateRecoveryCodes(clean)
      setRecoveryCodes(res.recoveryCodes || [])
      setView('SHOW_RECOVERY_CODES')
    } catch (err: any) {
      setError(err?.message || 'Code invalide. Vérifiez l’heure de votre application.')
    } finally {
      setLoading(false)
    }
  }

  // Copy secret key
  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  // Copy all recovery codes
  const handleCopyCodes = () => {
    if (recoveryCodes.length > 0) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'))
      setCopiedCodes(true)
      setTimeout(() => setCopiedCodes(false), 2000)
    }
  }

  // Download recovery codes as text file
  const handleDownloadCodes = () => {
    const text = `DZORA - CODES DE SECOURS DE VÉRIFICATION EN DEUX ÉTAPES (2FA)\nDate de génération : ${new Date().toLocaleDateString('fr-DZ')}\n\nIMPORTANT :\n- Chaque code ne peut être utilisé qu'une seule fois.\n- Conservez ce fichier dans un endroit sûr et confidentiel.\n\nCODES :\n${recoveryCodes.map((code, idx) => `${idx + 1}. ${code}`).join('\n')}\n`
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dzora-2fa-codes-secours-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#DCE8E3] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8F0ED] mb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center shrink-0 border border-[#BBDDD4]">
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-[#102A2A] tracking-tight">
                Vérification en deux étapes (2FA)
              </h3>
              <p className="text-[11px] font-medium text-[#60716F]">
                Sécurité renforcée de votre compte client Dzora
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#60716F] hover:text-[#102A2A] rounded-xl hover:bg-[#F4FAF7] transition"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: INITIAL / INTRO (When 2FA is Disabled)          */}
        {/* ======================================================== */}
        {view === 'INITIAL' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F7FAF9] border border-[#E5EEEB] space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-xl bg-white border border-[#DCE8E3] text-[#006B55] flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone size={16} />
                </div>
                <div className="text-xs text-[#102A2A] leading-relaxed">
                  <strong className="block font-bold text-[#102A2A] mb-1">
                    Comment cela fonctionne-t-il ?
                  </strong>
                  À chaque connexion, vous saisirez votre mot de passe habituel, suivi d'un code temporaire généré par une application sur votre téléphone (Google Authenticator, Microsoft Authenticator, etc.).
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#E8F0ED]">
                <div className="size-8 rounded-xl bg-white border border-[#DCE8E3] text-[#006B55] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={16} />
                </div>
                <div className="text-xs text-[#60716F] leading-relaxed">
                  Même si quelqu'un découvre votre mot de passe, il ne pourra pas accéder à vos commandes, adresses ou moyens de paiement sans votre téléphone.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8F0ED]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition"
              >
                Plus tard
              </button>
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Préparation…</span>
                  </>
                ) : (
                  <>
                    <span>Configurer la 2FA</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: SETUP QR & VERIFICATION CODE                    */}
        {/* ======================================================== */}
        {view === 'SETUP_QR' && setupData && (
          <form onSubmit={handleConfirmEnable} className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#006B55]">
                Étape 1 sur 2
              </h4>
              <p className="text-xs text-[#102A2A] font-semibold">
                Scannez le QR code ci-dessous avec votre application d'authentification
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#F7FAF9] border border-[#E5EEEB]">
              <div className="p-2 bg-white rounded-2xl border-2 border-[#DCE8E3] shadow-xs shrink-0">
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="QR Code d'authentification à deux facteurs"
                  className="size-36 object-contain"
                />
              </div>

              <div className="flex-1 space-y-2 text-left">
                <p className="text-[11px] text-[#60716F] leading-relaxed">
                  Vous ne parvenez pas à scanner le code ? Vous pouvez copier et saisir cette clé manuellement dans votre application :
                </p>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#DCE8E3] font-mono text-[11px] font-bold text-[#102A2A]">
                  <span className="flex-1 select-all break-all">{setupData.secret}</span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1 rounded-lg hover:bg-[#E7F2EF] text-[#006B55] transition shrink-0"
                    title="Copier la clé secrète"
                  >
                    {copiedSecret ? <Check size={14} className="text-[#006B55]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Verification code input */}
            <div className="space-y-2 pt-2 border-t border-[#E8F0ED]">
              <label className="block text-xs font-bold text-[#102A2A]">
                Étape 2 : Saisissez le code à 6 chiffres affiché par l’application
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  required
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000"
                  className="w-full text-center tracking-[0.4em] px-4 py-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-base font-mono font-bold text-[#102A2A] outline-none focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 transition"
                />
              </div>
              <p className="text-[11px] text-[#60716F]">
                Ce code change toutes les 30 secondes sur votre téléphone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8F0ED]">
              <button
                type="button"
                onClick={() => setView('INITIAL')}
                className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading || confirmCode.trim().length !== 6}
                className="px-5 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Activation…</span>
                  </>
                ) : (
                  <span>Valider et activer</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: SHOW RECOVERY CODES                             */}
        {/* ======================================================== */}
        {view === 'SHOW_RECOVERY_CODES' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#E7F2EF] border border-[#BBDDD4] text-[#006B55]">
              <div className="flex items-center gap-2 font-display font-extrabold text-sm mb-1">
                <Check size={18} strokeWidth={2.5} />
                <span>La double authentification est activée !</span>
              </div>
              <p className="text-xs text-[#102A2A] leading-relaxed">
                Voici vos <strong>codes de secours d’urgence</strong>. Si vous perdez votre smartphone, ils vous permettront de déverrouiller votre compte Dzora. Chaque code ne sert qu’une seule fois.
              </p>
            </div>

            {/* Codes Grid */}
            <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-[#F7FAF9] border border-[#E5EEEB]">
              {recoveryCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="p-2 text-center rounded-xl bg-white border border-[#DCE8E3] font-mono text-xs font-bold text-[#102A2A] tracking-wider select-all shadow-2xs"
                >
                  {code}
                </div>
              ))}
            </div>

            {/* Download / Copy Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadCodes}
                className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Download size={14} />
                <span>Télécharger (.txt)</span>
              </button>
              <button
                type="button"
                onClick={handleCopyCodes}
                className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl border border-[#DCE8E3] bg-white text-[#102A2A] hover:bg-[#F4FAF7] text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                {copiedCodes ? <Check size={14} className="text-[#006B55]" /> : <Copy size={14} />}
                <span>{copiedCodes ? 'Copié dans le presse-papier !' : 'Tout copier'}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#E8F0ED] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#102A2A] hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                J'ai sauvegardé mes codes
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: ENABLED DASHBOARD (When 2FA is already Active)   */}
        {/* ======================================================== */}
        {view === 'ENABLED_DASHBOARD' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#E7F2EF]/70 border border-[#BBDDD4] flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#006B55] text-white flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-[#006B55]">
                  Vérification en deux étapes active
                </h4>
                <p className="text-xs text-[#102A2A] mt-1 leading-relaxed">
                  Votre compte Dzora est protégé par votre application TOTP. Vos informations personnelles, adresses et paniers sont sécurisés.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setView('REGEN_CODES_PROMPT')
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-[#DCE8E3] hover:border-[#BBDDD4] hover:bg-[#F7FAF9] transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-[#F7FAF9] group-hover:bg-[#E7F2EF] text-[#006B55] border border-[#E5EEEB] flex items-center justify-center transition">
                    <KeyRound size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#102A2A]">
                      Régénérer mes codes de secours
                    </div>
                    <div className="text-[11px] text-[#60716F]">
                      Générer une nouvelle liste en cas de perte de vos anciens codes
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#94A4A0] group-hover:text-[#006B55] transition" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setView('DISABLE_PROMPT')
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-red-100 hover:border-red-200 hover:bg-red-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center transition">
                    <ShieldAlert size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-700">
                      Désactiver la vérification en deux étapes
                    </div>
                    <div className="text-[11px] text-red-500">
                      Retirer l'exigence du code temporaire lors de vos connexions
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-red-400 group-hover:text-red-600 transition" />
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8F0ED]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: REGENERATE CODES PROMPT                         */}
        {/* ======================================================== */}
        {view === 'REGEN_CODES_PROMPT' && (
          <form onSubmit={handleRegenerateCodes} className="space-y-4">
            <p className="text-xs text-[#102A2A] leading-relaxed">
              Pour des raisons de sécurité, veuillez saisir le code à 6 chiffres affiché sur votre application pour générer de nouveaux codes de secours :
            </p>

            <div>
              <label className="block text-xs font-bold text-[#102A2A] mb-1">
                Code TOTP actuel
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={regenCode}
                onChange={(e) => setRegenCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-sm font-mono font-bold tracking-widest text-[#102A2A] outline-none focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8F0ED]">
              <button
                type="button"
                onClick={() => setView('ENABLED_DASHBOARD')}
                className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || regenCode.trim().length !== 6}
                className="px-4 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Génération…</span>
                  </>
                ) : (
                  <span>Générer les codes</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 6: DISABLE 2FA PROMPT                              */}
        {/* ======================================================== */}
        {view === 'DISABLE_PROMPT' && (
          <form onSubmit={handleConfirmDisable} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                Attention : la désactivation réduira la sécurité de votre compte client. Vous ne serez plus invité à saisir de code temporaire lors de vos prochaines connexions.
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#102A2A] mb-1">
                  Code d’authentification ou code de secours
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="Code à 6 chiffres ou code secours"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-mono font-bold text-[#102A2A] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/15 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A2A] mb-1">
                  Mot de passe du compte (optionnel pour confirmation)
                </label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-mono text-[#102A2A] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/15 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8F0ED]">
              <button
                type="button"
                onClick={() => setView('ENABLED_DASHBOARD')}
                className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !disableCode.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Désactivation…</span>
                  </>
                ) : (
                  <span>Confirmer la désactivation</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
