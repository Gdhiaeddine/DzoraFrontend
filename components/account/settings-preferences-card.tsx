'use client'

import React, { useState } from 'react'
import { Globe, Bell, CheckCircle2, Shield } from 'lucide-react'

interface SettingsPreferencesCardProps {
  onSave?: (prefs: any) => void
}

export function SettingsPreferencesCard({ onSave }: SettingsPreferencesCardProps) {
  // Selectors State
  const [langue, setLangue] = useState('fr')
  const [pays, setPays] = useState('DZ')
  const [devise, setDevise] = useState('DZD')

  // Notification Toggles State
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [promoUpdates, setPromoUpdates] = useState(true)

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setToastMessage('Vos préférences ont été enregistrées avec succès.')
      if (onSave) {
        onSave({ langue, pays, devise, orderUpdates, promoUpdates })
      }
      setTimeout(() => setToastMessage(null), 3000)
    }, 400)
  }

  const handleCancel = () => {
    setLangue('fr')
    setPays('DZ')
    setDevise('DZD')
    setOrderUpdates(true)
    setPromoUpdates(true)
    setToastMessage('Modifications annulées.')
    setTimeout(() => setToastMessage(null), 2500)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.02)] p-5 sm:p-6 mb-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#006B55] px-4 py-3 text-xs font-bold text-white shadow-xl shadow-[#006B55]/20 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 size={16} className="text-[#85E1C8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="pb-4 border-b border-[#E8F0ED] mb-4">
        <h2 className="font-display font-extrabold text-base text-[#102A2A] tracking-tight">
          Préférences
        </h2>
        <p className="text-xs text-[#60716F] mt-0.5">
          Langue d’affichage, localisation régionale et alertes personnalisées.
        </p>
      </div>

      {/* Selectors Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-[#E8F0ED]">
        {/* 1. Langue */}
        <div>
          <label htmlFor="pref-langue" className="block text-xs font-bold text-[#102A2A] mb-1.5">
            Langue
          </label>
          <select
            id="pref-langue"
            value={langue}
            onChange={(e) => setLangue(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
          >
            <option value="fr">Français</option>
            <option value="ar">العربية (Arabe)</option>
            <option value="en">English (Anglais)</option>
          </select>
        </div>

        {/* 2. Pays / région */}
        <div>
          <label htmlFor="pref-pays" className="block text-xs font-bold text-[#102A2A] mb-1.5">
            Pays / région
          </label>
          <select
            id="pref-pays"
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
          >
            <option value="DZ">Algérie (DZ)</option>
          </select>
        </div>

        {/* 3. Devise */}
        <div>
          <label htmlFor="pref-devise" className="block text-xs font-bold text-[#102A2A] mb-1.5">
            Devise
          </label>
          <select
            id="pref-devise"
            value={devise}
            onChange={(e) => setDevise(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
          >
            <option value="DZD">Dinar algérien (DZD / DA)</option>
          </select>
        </div>
      </div>

      {/* Toggles Section */}
      <div className="pt-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#60716F]">
          Communications & Notifications
        </h3>

        {/* Toggle 1: Mises à jour de commande */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white border border-[#DCE8E3] text-[#006B55] flex items-center justify-center shrink-0">
              <Bell size={15} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#102A2A]">
                Mises à jour de commande
              </div>
              <p className="text-[11px] text-[#60716F]">
                Recevez le suivi de colis, alertes d’expédition et confirmation de réception par SMS et e-mail.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={orderUpdates}
              onChange={(e) => setOrderUpdates(e.target.checked)}
              className="sr-only peer"
              aria-label="Activer les mises à jour de commande"
            />
            <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#006B55]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006B55]"></div>
          </label>
        </div>

        {/* Toggle 2: Promotions et nouveautés */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white border border-[#DCE8E3] text-[#006B55] flex items-center justify-center shrink-0">
              <Globe size={15} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#102A2A]">
                Promotions et nouveautés
              </div>
              <p className="text-[11px] text-[#60716F]">
                Soyez alerté des codes coupons exclusifs, remises saisonnières et nouvelles boutiques partenaires.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={promoUpdates}
              onChange={(e) => setPromoUpdates(e.target.checked)}
              className="sr-only peer"
              aria-label="Activer les promotions et nouveautés"
            />
            <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#006B55]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006B55]"></div>
          </label>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="mt-6 pt-5 border-t border-[#E8F0ED] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Pale-mint reassurance notice */}
        <div className="flex items-center gap-2 text-xs text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4]">
          <Shield size={14} className="shrink-0 text-[#006B55]" />
          <span>Vos informations sont protégées et modifiables à tout moment.</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  )
}
