'use client'

import React, { useState } from 'react'
import { User, Mail, Phone, MapPin, X, CheckCircle2 } from 'lucide-react'

const WILAYAS_ALGERIE = [
  '01 - Adrar',
  '02 - Chlef',
  '03 - Laghouat',
  '04 - Oum El Bouaghi',
  '05 - Batna',
  '06 - Béjaïa',
  '07 - Biskra',
  '08 - Béchar',
  '09 - Blida',
  '10 - Bouira',
  '11 - Tamanrasset',
  '12 - Tébessa',
  '13 - Tlemcen',
  '14 - Tiaret',
  '15 - Tizi Ouzou',
  '16 - Alger',
  '17 - Djelfa',
  '18 - Jijel',
  '19 - Sétif',
  '20 - Saïda',
  '21 - Skikda',
  '22 - Sidi Bel Abbès',
  '23 - Annaba',
  '24 - Guelma',
  '25 - Constantine',
  '26 - Médéa',
  '27 - Mostaganem',
  '28 - M\'Sila',
  '29 - Mascara',
  '30 - Ouargla',
  '31 - Oran',
  '32 - El Bayadh',
  '33 - Illizi',
  '34 - Bordj Bou Arréridj',
  '35 - Boumerdès',
  '36 - El Tarf',
  '37 - Tindouf',
  '38 - Tissemsilt',
  '39 - El Oued',
  '40 - Khenchela',
  '41 - Souk Ahras',
  '42 - Tipaza',
  '43 - Mila',
  '44 - Aïn Defla',
  '45 - Naâma',
  '46 - Aïn Témouchent',
  '47 - Ghardaïa',
  '48 - Relizane',
  '49 - Timimoun',
  '50 - Bordj Badji Mokhtar',
  '51 - Ouled Djellal',
  '52 - Béni Abbès',
  '53 - In Salah',
  '54 - In Guezzam',
  '55 - Touggourt',
  '56 - Djanet',
  '57 - El M\'Ghair',
  '58 - El Meniaa',
]

interface PersonalInfoData {
  fullName: string
  email: string
  maskedEmail: string
  phone: string
  maskedPhone: string
  wilaya: string
}

interface SettingsPersonalCardProps {
  initialData?: Partial<PersonalInfoData>
  onSave?: (updated: PersonalInfoData) => void
}

export function SettingsPersonalCard({ initialData, onSave }: SettingsPersonalCardProps) {
  const [data, setData] = useState<PersonalInfoData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    maskedEmail: initialData?.maskedEmail || 'Non renseignée',
    phone: initialData?.phone || '',
    maskedPhone: initialData?.maskedPhone || 'Non renseigné',
    wilaya: initialData?.wilaya || '',
  })

  React.useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        fullName: initialData.fullName ?? prev.fullName,
        email: initialData.email ?? prev.email,
        maskedEmail: initialData.maskedEmail ?? prev.maskedEmail,
        phone: initialData.phone ?? prev.phone,
        maskedPhone: initialData.maskedPhone ?? prev.maskedPhone,
        wilaya: initialData.wilaya !== undefined ? initialData.wilaya : prev.wilaya,
      }))
    }
  }, [initialData])

  // Modal State for editing a specific row
  const [editingField, setEditingField] = useState<'fullName' | 'email' | 'phone' | 'wilaya' | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null)

  const handleOpenEdit = (field: 'fullName' | 'email' | 'phone' | 'wilaya') => {
    setEditingField(field)
    if (field === 'fullName') setTempValue(data.fullName)
    else if (field === 'email') setTempValue(data.email)
    else if (field === 'phone') setTempValue(data.phone)
    else if (field === 'wilaya') setTempValue(data.wilaya || '16 - Alger')
  }

  const handleCloseModal = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingField) return

    let updated = { ...data }

    if (editingField === 'fullName') {
      const val = tempValue.trim() || data.fullName
      updated.fullName = val
    } else if (editingField === 'email') {
      const val = tempValue.trim()
      if (val && val.includes('@')) {
        updated.email = val
        const [userPart, domain] = val.split('@')
        updated.maskedEmail = `${userPart.slice(0, 2)}••••@${domain}`
      }
    } else if (editingField === 'phone') {
      const val = tempValue.trim()
      if (val) {
        updated.phone = val
        const digits = val.replace(/\D/g, '')
        const lastTwo = digits.slice(-2) || '48'
        updated.maskedPhone = `+213 •• •• •• ${lastTwo}`
      }
    } else if (editingField === 'wilaya') {
      updated.wilaya = tempValue
    }

    setData(updated)
    if (onSave) onSave(updated)

    setFeedbackToast('Informations personnelles mises à jour avec succès.')
    window.setTimeout(() => setFeedbackToast(null), 3000)
    handleCloseModal()
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.02)] p-5 sm:p-6 mb-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#006B55] px-4 py-3 text-xs font-bold text-white shadow-xl shadow-[#006B55]/20 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 size={16} className="text-[#85E1C8]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="pb-4 border-b border-[#E8F0ED] mb-4">
        <h2 className="font-display font-extrabold text-base text-[#102A2A] tracking-tight">
          Informations personnelles
        </h2>
        <p className="text-xs text-[#60716F] mt-0.5">
          Coordonnées associées à vos livraisons et communications Dzora.
        </p>
      </div>

      {/* Rows with consistent Label / Value / Action layout */}
      <div className="divide-y divide-[#F0F4F2]">
        {/* Row 1: Nom complet */}
        <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 w-48 shrink-0">
            <div className="size-8 rounded-lg bg-[#F7FAF9] text-[#006B55] border border-[#E5EEEB] flex items-center justify-center">
              <User size={15} />
            </div>
            <span className="text-xs font-semibold text-[#60716F]">Nom complet</span>
          </div>
          <div className="flex-1 text-xs font-bold text-[#102A2A] sm:text-left">
            {data.fullName}
          </div>
          <button
            type="button"
            onClick={() => handleOpenEdit('fullName')}
            className="self-end sm:self-auto text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline px-2.5 py-1 rounded-lg transition"
          >
            Modifier
          </button>
        </div>

        {/* Row 2: Adresse e-mail */}
        <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 w-48 shrink-0">
            <div className="size-8 rounded-lg bg-[#F7FAF9] text-[#006B55] border border-[#E5EEEB] flex items-center justify-center">
              <Mail size={15} />
            </div>
            <span className="text-xs font-semibold text-[#60716F]">Adresse e-mail</span>
          </div>
          <div className="flex-1 text-xs font-mono font-medium text-[#102A2A]">
            {data.maskedEmail}
          </div>
          <button
            type="button"
            onClick={() => handleOpenEdit('email')}
            className="self-end sm:self-auto text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline px-2.5 py-1 rounded-lg transition"
          >
            Modifier
          </button>
        </div>

        {/* Row 3: Téléphone */}
        <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 w-48 shrink-0">
            <div className="size-8 rounded-lg bg-[#F7FAF9] text-[#006B55] border border-[#E5EEEB] flex items-center justify-center">
              <Phone size={15} />
            </div>
            <span className="text-xs font-semibold text-[#60716F]">Téléphone</span>
          </div>
          <div className="flex-1 text-xs font-mono font-bold text-[#102A2A]">
            {data.maskedPhone}
          </div>
          <button
            type="button"
            onClick={() => handleOpenEdit('phone')}
            className="self-end sm:self-auto text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline px-2.5 py-1 rounded-lg transition"
          >
            Modifier
          </button>
        </div>

        {/* Row 4: Wilaya */}
        <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 w-48 shrink-0">
            <div className="size-8 rounded-lg bg-[#F7FAF9] text-[#006B55] border border-[#E5EEEB] flex items-center justify-center">
              <MapPin size={15} />
            </div>
            <span className="text-xs font-semibold text-[#60716F]">Wilaya de résidence</span>
          </div>
          <div className="flex-1 text-xs font-bold text-[#102A2A]">
            {data.wilaya ? (
              <span>{data.wilaya}</span>
            ) : (
              <span className="text-[#94A4A0] font-normal italic">Non renseignée</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleOpenEdit('wilaya')}
            className="self-end sm:self-auto text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline px-2.5 py-1 rounded-lg transition cursor-pointer"
          >
            {data.wilaya ? 'Modifier' : 'Définir'}
          </button>
        </div>
      </div>

      {/* Edit Modal Dialog */}
      {editingField && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED] mb-4">
              <h3 className="font-display font-bold text-sm text-[#102A2A]">
                {editingField === 'fullName' && 'Modifier votre nom complet'}
                {editingField === 'email' && 'Modifier votre adresse e-mail'}
                {editingField === 'phone' && 'Modifier votre numéro de téléphone'}
                {editingField === 'wilaya' && 'Sélectionner votre wilaya de résidence'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 text-[#60716F] hover:text-[#102A2A] rounded-lg hover:bg-[#F4FAF7]"
                aria-label="Fermer la boîte de dialogue"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {editingField === 'fullName' && (
                <div>
                  <label htmlFor="input-fullName" className="block text-xs font-bold text-[#102A2A] mb-1.5">
                    Nom et prénom
                  </label>
                  <input
                    id="input-fullName"
                    type="text"
                    required
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="Ex: Samira Khelifi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 transition"
                  />
                </div>
              )}

              {editingField === 'email' && (
                <div>
                  <label htmlFor="input-email" className="block text-xs font-bold text-[#102A2A] mb-1.5">
                    Nouvelle adresse e-mail
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    required
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="Ex: samira@exemple.dz"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 transition"
                  />
                  <p className="text-[11px] text-[#71827D] mt-1.5">
                    Un e-mail de confirmation sera transmis pour valider ce changement.
                  </p>
                </div>
              )}

              {editingField === 'phone' && (
                <div>
                  <label htmlFor="input-phone" className="block text-xs font-bold text-[#102A2A] mb-1.5">
                    Numéro de téléphone (+213)
                  </label>
                  <input
                    id="input-phone"
                    type="tel"
                    required
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="Ex: 0550 12 34 56"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-mono font-medium text-[#102A2A] outline-none focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 transition"
                  />
                  <p className="text-[11px] text-[#71827D] mt-1.5">
                    Un code OTP par SMS sera requis pour vérifier le nouveau numéro.
                  </p>
                </div>
              )}

              {editingField === 'wilaya' && (
                <div>
                  <label htmlFor="select-wilaya" className="block text-xs font-bold text-[#102A2A] mb-1.5">
                    Wilaya
                  </label>
                  <select
                    id="select-wilaya"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Sélectionner votre wilaya --
                    </option>
                    {WILAYAS_ALGERIE.map((w) => {
                      const simpleName = w.split(' - ')[1] || w
                      return (
                        <option key={w} value={simpleName}>
                          {w}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8F0ED]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
