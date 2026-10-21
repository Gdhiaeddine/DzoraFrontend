'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Copy,
  Check,
  Download,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Lock,
} from 'lucide-react'
import { api, TwoFactorSetupResult } from '@/lib/api'

interface SellerTwoFactorSetupProps {
  initialEnabled?: boolean
  onStatusChange?: (enabled: boolean) => void
}

export function SellerTwoFactorSetup({
  initialEnabled = false,
  onStatusChange,
}: SellerTwoFactorSetupProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled)
  const [setupData, setSetupData] = useState<TwoFactorSetupResult | null>(null)
  const [confirmCode, setConfirmCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')

  const [mode, setMode] = useState<'IDLE' | 'SETUP' | 'SHOW_CODES' | 'DISABLE'>('IDLE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  const handleStartSetup = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await api.auth.setup2Fa()
      setSetupData(res)
      setMode('SETUP')
    } catch (err: any) {
      setError(err.message || 'Impossible d’initialiser la configuration 2FA.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmEnable = async () => {
    if (!confirmCode.trim() || confirmCode.trim().length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres affiché sur votre application.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await api.auth.enable2Fa(confirmCode.trim())
      setRecoveryCodes(res.recoveryCodes)
      setIsEnabled(true)
      setMode('SHOW_CODES')
      onStatusChange?.(true)
    } catch (err: any) {
      setError(err.message || 'Code TOTP invalide. Vérifiez l’heure de votre appareil.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDisable = async () => {
    if (!disableCode.trim()) {
      setError('Veuillez saisir votre code de vérification pour confirmer la désactivation.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await api.auth.disable2Fa(disableCode.trim(), disablePassword || undefined)
      setIsEnabled(false)
      setMode('IDLE')
      setSetupData(null)
      onStatusChange?.(false)
    } catch (err: any) {
      setError(err.message || 'Code ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  const handleDownloadCodes = () => {
    const text = `DZORA MARKETPLACE - CODES DE SECOURS 2FA\nDate: ${new Date().toLocaleDateString()}\n\nConservez ces codes dans un endroit sûr. Chaque code ne peut être utilisé qu'une seule fois.\n\n${recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dzora-2fa-codes-secours.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isEnabled ? 'bg-[#E7F2EF] text-[#006B55]' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {isEnabled ? (
              <ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
            ) : (
              <ShieldAlert className="h-6 w-6" strokeWidth={2.2} />
            )}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Double authentification (2FA TOTP)
            </h4>
            <p className="text-xs text-slate-500">
              {isEnabled
                ? 'Votre compte vendeur est hautement sécurisé par Google Authenticator / Authy.'
                : 'Protégez votre boutique et vos revenus contre les accès non autorisés.'}
            </p>
          </div>
        </div>

        {mode === 'IDLE' && (
          <button
            type="button"
            onClick={isEnabled ? () => setMode('DISABLE') : handleStartSetup}
            disabled={loading}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              isEnabled
                ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-[#006B55] text-white hover:bg-[#005544]'
            }`}
          >
            {loading ? 'Chargement...' : isEnabled ? 'Désactiver' : 'Activer maintenant'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: SCAN QR CODE & ENTER CONFIRMATION CODE */}
      {mode === 'SETUP' && setupData && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h5 className="text-sm font-bold text-slate-900">
            1. Scannez le QR Code avec votre application d'authentification
          </h5>
          <p className="mt-1 text-xs text-slate-500">
            Ouvrez Google Authenticator, Authy ou Microsoft Authenticator et scannez le code :
          </p>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* QR Code image */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-inner">
              <img
                src={setupData.qrCodeDataUrl}
                alt="QR Code TOTP"
                className="h-44 w-44 object-contain"
              />
            </div>

            {/* Secret key backup */}
            <div className="flex-1 space-y-3">
              <p className="text-xs text-slate-600">
                Vous ne pouvez pas scanner ? Entrez cette clé secrète manuellement :
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs font-bold text-slate-800">
                <span className="flex-1 select-all break-all">{setupData.secret}</span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                >
                  {copiedSecret ? <Check className="h-4 w-4 text-[#006B55]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Code test confirmation */}
              <div className="pt-2">
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  2. Saisissez le code à 6 chiffres généré :
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-36 rounded-xl border border-slate-200 px-3 py-2 text-center font-mono text-base font-bold tracking-widest text-slate-900 focus:border-[#006B55] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmEnable}
                    disabled={loading || confirmCode.length !== 6}
                    className="rounded-xl bg-[#006B55] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#005544] disabled:opacity-50"
                  >
                    {loading ? 'Validation...' : 'Activer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('IDLE')
                      setSetupData(null)
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DISPLAY RECOVERY CODES */}
      {mode === 'SHOW_CODES' && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="rounded-2xl border border-[#BBDDD4] bg-[#E7F2EF]/60 p-4">
            <h5 className="text-sm font-bold text-[#006B55]">
              Sauvegardez vos codes de secours d'urgence
            </h5>
            <p className="mt-1 text-xs text-slate-600">
              Si vous perdez l'accès à votre téléphone, ces codes sont le seul moyen de vous reconnecter à votre espace vendeur.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {recoveryCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#BBDDD4] bg-white p-2.5 text-center font-mono text-xs font-bold text-slate-800 shadow-sm"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadCodes}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#006B55] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#005544]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Télécharger (.txt)</span>
              </button>
              <button
                type="button"
                onClick={handleCopyCodes}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                {copiedCodes ? <Check className="h-3.5 w-3.5 text-[#006B55]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCodes ? 'Copié !' : 'Tout copier'}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('IDLE')}
                className="ml-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                J'ai sauvegardé mes codes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISABLE 2FA FORM */}
      {mode === 'DISABLE' && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h5 className="text-sm font-bold text-red-700">
            Confirmation de désactivation du 2FA
          </h5>
          <p className="mt-1 text-xs text-slate-500">
            Pour des raisons de sécurité, veuillez entrer votre code d'authentification actuel :
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              placeholder="Code TOTP à 6 chiffres ou code secours"
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-red-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleConfirmDisable}
              disabled={loading || !disableCode.trim()}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Désactivation...' : 'Confirmer la désactivation'}
            </button>
            <button
              type="button"
              onClick={() => setMode('IDLE')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
