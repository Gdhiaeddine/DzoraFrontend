'use client'

import React, { useState, useEffect } from 'react'
import {
  MapPin,
  CheckCircle2,
  Plus,
  Edit3,
  X,
  Phone,
  User,
  Check,
  Building,
  Home,
  Trash2,
} from 'lucide-react'
import { ClientAddress } from '@/lib/client-account'
import { wilayasData } from '@/lib/wilayas'
import { AlgeriaFlag } from '@/components/algeria-flag'

interface CheckoutAddressModalProps {
  isOpen: boolean
  onClose: () => void
  addresses: ClientAddress[]
  selectedAddressId: string | null
  onSelectAddress: (address: ClientAddress) => void
  onSaveAddresses: (addresses: ClientAddress[]) => void
  currentUserName?: string
  currentUserPhone?: string
}

export function CheckoutAddressModal({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onSaveAddresses,
  currentUserName = '',
  currentUserPhone = '',
}: CheckoutAddressModalProps) {
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST')
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  // Form Fields
  const [formTitle, setFormTitle] = useState('Domicile')
  const [formFullName, setFormFullName] = useState(currentUserName)
  const [formPhone, setFormPhone] = useState(currentUserPhone)
  const [formWilaya, setFormWilaya] = useState('09 - Blida')
  const [formCommune, setFormCommune] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formIsDefault, setFormIsDefault] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setView(addresses.length === 0 ? 'FORM' : 'LIST')
      setEditingAddressId(null)
      setFormError(null)
    }
  }, [isOpen, addresses.length])

  if (!isOpen) return null

  const handleOpenAdd = () => {
    setEditingAddressId(null)
    setFormTitle(addresses.length === 0 ? 'Adresse principale' : `Adresse ${addresses.length + 1}`)
    setFormFullName(currentUserName)
    setFormPhone(currentUserPhone)
    setFormWilaya(wilayasData[8]?.name || '09 - Blida')
    setFormCommune('')
    setFormAddress('')
    setFormIsDefault(addresses.length === 0)
    setFormError(null)
    setView('FORM')
  }

  const handleOpenEdit = (addr: ClientAddress, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingAddressId(addr.id)
    setFormTitle(addr.title || 'Mon adresse')
    setFormFullName(addr.fullName || currentUserName)
    setFormPhone(addr.phone || currentUserPhone)
    setFormWilaya(addr.wilaya || wilayasData[8]?.name)
    setFormCommune(addr.commune || '')
    setFormAddress(addr.address || '')
    setFormIsDefault(Boolean(addr.isDefault))
    setFormError(null)
    setView('FORM')
  }

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formFullName.trim()) {
      setFormError('Veuillez renseigner le nom complet du destinataire.')
      return
    }
    if (!formPhone.trim()) {
      setFormError('Veuillez renseigner un numéro de téléphone valide.')
      return
    }
    if (!formCommune.trim()) {
      setFormError('Veuillez préciser la commune.')
      return
    }
    if (!formAddress.trim()) {
      setFormError('Veuillez indiquer une adresse ou un repère précis.')
      return
    }

    let updatedList: ClientAddress[] = []
    let activeSavedAddr: ClientAddress

    if (editingAddressId) {
      // Edit existing address
      updatedList = addresses.map((addr) => {
        if (addr.id === editingAddressId) {
          const updated: ClientAddress = {
            ...addr,
            title: formTitle.trim() || 'Mon adresse',
            fullName: formFullName.trim(),
            phone: formPhone.trim(),
            wilaya: formWilaya,
            commune: formCommune.trim(),
            address: formAddress.trim(),
            isDefault: formIsDefault,
            updatedAt: new Date().toISOString(),
          }
          activeSavedAddr = updated
          return updated
        }
        // If the edited address was marked as default, uncheck others
        if (formIsDefault) {
          return { ...addr, isDefault: false }
        }
        return addr
      })
    } else {
      // Create new address
      const newAddr: ClientAddress = {
        id: `addr_${Date.now()}`,
        title: formTitle.trim() || `Adresse ${addresses.length + 1}`,
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        wilaya: formWilaya,
        commune: formCommune.trim(),
        address: formAddress.trim(),
        isDefault: formIsDefault || addresses.length === 0,
        updatedAt: new Date().toISOString(),
      }
      activeSavedAddr = newAddr

      if (newAddr.isDefault) {
        updatedList = [newAddr, ...addresses.map((a) => ({ ...a, isDefault: false }))]
      } else {
        updatedList = [...addresses, newAddr]
      }
    }

    onSaveAddresses(updatedList)
    if (activeSavedAddr!) {
      onSelectAddress(activeSavedAddr)
    }
    onClose()
  }

  const handleSetDefault = (addrId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === addrId,
    }))
    onSaveAddresses(updated)
    const target = updated.find((a) => a.id === addrId)
    if (target) {
      onSelectAddress(target)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#DCE8E3] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8F0ED] mb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center shrink-0 border border-[#BBDDD4]">
              <MapPin size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-[#102A2A] tracking-tight">
                {view === 'LIST' ? 'Choisir une adresse de livraison' : editingAddressId ? "Modifier l'adresse" : 'Ajouter une adresse'}
              </h3>
              <p className="text-[11px] font-medium text-[#60716F]">
                {view === 'LIST' ? 'Sélectionnez où vous souhaitez recevoir vos articles' : 'Renseignez les coordonnées exactes du destinataire'}
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

        {/* ======================================================== */}
        {/* VIEW 1: ADDRESS LIST (AliExpress / Amazon Style)        */}
        {/* ======================================================== */}
        {view === 'LIST' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#60716F]">
                {addresses.length} adresse{addresses.length > 1 ? 's' : ''} disponible{addresses.length > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E7F2EF] text-[#006B55] hover:bg-[#006B55] hover:text-white text-xs font-bold transition border border-[#BBDDD4]"
              >
                <Plus size={13} />
                <span>Nouvelle adresse</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId
                const isDefault = Boolean(addr.isDefault)

                return (
                  <div
                    key={addr.id}
                    onClick={() => onSelectAddress(addr)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#006B55] bg-[#FAFDFB] ring-2 ring-[#006B55]/20 shadow-xs'
                        : 'border-[#E3ECE8] bg-white hover:border-[#BBDDD4] hover:bg-[#F9FCFA]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F0F5F2] mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Radio Check Circle */}
                        <div
                          className={`size-4 rounded-full border flex items-center justify-center transition ${
                            isSelected
                              ? 'border-[#006B55] bg-[#006B55] text-white'
                              : 'border-[#CADBD5] bg-white'
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                        </div>

                        <span className="text-xs font-bold text-[#102A2A]">
                          {addr.title || 'Mon adresse'}
                        </span>

                        {isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                            <CheckCircle2 size={10} />
                            Par défaut
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={(e) => handleSetDefault(addr.id, e)}
                            className="text-[11px] font-semibold text-[#60716F] hover:text-[#006B55] hover:underline px-2 py-0.5 rounded-lg transition"
                          >
                            Définir par défaut
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(addr, e)}
                          className="text-[11px] font-bold text-[#006B55] hover:text-[#005544] hover:underline px-2 py-0.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Edit3 size={11} />
                          <span>Modifier</span>
                        </button>
                      </div>
                    </div>

                    {/* Address details */}
                    <div className="text-xs space-y-1 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#102A2A]">
                          {addr.fullName || currentUserName || 'Client'}
                        </span>
                        <span className="text-[#889994]">·</span>
                        <span className="font-mono text-[#60716F]">{addr.phone || currentUserPhone}</span>
                      </div>

                      <p className="text-[#43615C] leading-snug">
                        <strong className="text-[#102A2A]">{addr.wilaya}</strong>
                        {addr.commune && <span>, {addr.commune}</span>}
                      </p>

                      <p className="text-[#60716F] text-[11px] leading-snug truncate">
                        {addr.address}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E8F0ED]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs"
              >
                Confirmer l’adresse
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: ADD / EDIT ADDRESS FORM                         */}
        {/* ======================================================== */}
        {view === 'FORM' && (
          <form onSubmit={handleSaveForm} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#102A2A] mb-1">
                Titre de l’adresse (ex: Domicile, Bureau, Famille...)
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Domicile principal"
                className="h-10 w-full rounded-xl border border-[#D5E4DE] bg-[#F7FAF9] px-3.5 text-xs text-[#102A2A] outline-none transition focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/10"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#102A2A] mb-1">
                  Nom &amp; Prénom du destinataire <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Mohamed Benali"
                  className="h-10 w-full rounded-xl border border-[#D5E4DE] bg-[#F7FAF9] px-3.5 text-xs text-[#102A2A] outline-none transition focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A2A] mb-1">
                  Numéro de téléphone <span className="text-[#DC2626]">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-[#D5E4DE] bg-[#F7FAF9] focus-within:border-[#006B55] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#006B55]/10 overflow-hidden">
                  <span className="flex items-center gap-1 border-r border-[#D5E4DE] bg-slate-50 px-2.5 py-2 text-xs font-bold text-[#006B55] select-none">
                    <AlgeriaFlag className="h-3 w-4.5 rounded-[2px]" />
                    <span>+213</span>
                  </span>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="05 50 12 34 56"
                    className="h-10 w-full bg-transparent px-3 text-xs outline-none text-[#102A2A]"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#102A2A] mb-1">
                  Wilaya <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formWilaya}
                  onChange={(e) => setFormWilaya(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#D5E4DE] bg-[#F7FAF9] px-3 text-xs font-semibold text-[#102A2A] outline-none transition focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/10 cursor-pointer"
                >
                  {wilayasData.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A2A] mb-1">
                  Commune <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formCommune}
                  onChange={(e) => setFormCommune(e.target.value)}
                  placeholder="Ex: Blida Centre, Hydra..."
                  className="h-10 w-full rounded-xl border border-[#D5E4DE] bg-[#F7FAF9] px-3.5 text-xs text-[#102A2A] outline-none transition focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A2A] mb-1">
                Adresse précise ou repère <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                required
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Rue, N° de bâtiment, étage, repère connu..."
                className="h-10 w-full rounded-xl border border-[#D5E4DE] bg-[#F7FAF9] px-3.5 text-xs text-[#102A2A] outline-none transition focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/10"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="size-4 rounded border-[#D5E4DE] text-[#006B55] focus:ring-[#006B55]"
                />
                <span className="text-xs font-semibold text-[#102A2A]">
                  Définir comme adresse principale de livraison
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8F0ED]">
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setView('LIST')}
                  className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition"
                >
                  Retour
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs"
              >
                Enregistrer et utiliser
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
