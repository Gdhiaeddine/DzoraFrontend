'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  CreditCard,
  RotateCcw,
  Star,
  MapPin,
  MessageSquare,
  UserPlus,
  Headphones,
  HelpCircle,
  Package,
  Plus,
  ArrowRight,
  CheckCircle2,
  Edit3,
  X,
  ShieldCheck,
  Truck,
  Phone,
  Trash2,
  Check,
} from 'lucide-react'
import { wilayasData } from '@/lib/wilayas'
import {
  ClientOrder,
  ClientAddress,
  PaymentMethodType,
  PAYMENT_METHODS,
} from '@/lib/client-account'

interface AccountPlaceholderTabProps {
  tabSlug: string
  orders?: ClientOrder[]
  primaryAddress?: ClientAddress | null
  addresses?: ClientAddress[]
  paymentMethod?: PaymentMethodType
  currentUserFullName?: string
  currentUserPhone?: string
  onGoToSettings?: () => void
  onUpdateAddress?: (address: Partial<ClientAddress>) => void
  onSaveAddress?: (address: Partial<ClientAddress>) => void
  onDeleteAddress?: (addressId: string) => void
  onSetDefaultAddress?: (addressId: string) => void
  onUpdatePaymentMethod?: (method: PaymentMethodType) => void
}

const TAB_METADATA: Record<
  string,
  {
    title: string
    description: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    emptyTitle: string
    emptyDescription: string
    actionText?: string
    actionHref?: string
  }
> = {
  commandes: {
    title: 'Mes commandes',
    description: 'Consultez l’historique et le suivi en direct de vos commandes passées sur Dzora.',
    icon: ShoppingBag,
    emptyTitle: 'Vous n’avez aucune commande pour le moment',
    emptyDescription:
      'Lorsque vous confirmez un achat, vos colis apparaîtront ici avec leur numéro de suivi et l’état de livraison.',
    actionText: 'Parcourir les produits',
    actionHref: '/products',
  },
  paiements: {
    title: 'Moyens de paiement',
    description: 'Gérez vos préférences de règlement et factures.',
    icon: CreditCard,
    emptyTitle: 'Paiement à la livraison par défaut (Cash on Delivery)',
    emptyDescription:
      'Vos commandes Dzora sont payables en dinars algériens (DZD / DA) directement auprès du livreur à la réception.',
  },
  retours: {
    title: 'Retours & remboursements',
    description: 'Suivez vos demandes de retour sous garantie et vos remboursements d’avoirs.',
    icon: RotateCcw,
    emptyTitle: 'Aucun retour en cours',
    emptyDescription:
      'Tous vos articles livrés respectent la politique de conformité Dzora sous 7 jours après réception.',
  },
  avis: {
    title: 'Mes avis & évaluations',
    description: 'Consultez les notes et retours d’expérience que vous avez laissés aux vendeurs.',
    icon: Star,
    emptyTitle: 'Aucun avis rédigé',
    emptyDescription:
      'Après réception d’un article, vous pouvez noter la boutique et aider les autres acheteurs Dzora.',
    actionText: 'Découvrir les boutiques',
    actionHref: '/vendeur',
  },
  adresses: {
    title: 'Adresses de livraison',
    description: 'Adresses enregistrées pour accélérer la validation de votre panier.',
    icon: MapPin,
    emptyTitle: 'Votre adresse de livraison',
    emptyDescription:
      'Vous pouvez ajouter une adresse de livraison personnelle ou professionnelle pour chaque wilaya.',
    actionText: 'Ajouter une nouvelle adresse',
  },
  messages: {
    title: 'Mes messages',
    description: 'Échanges et communications avec les vendeurs partenaires et le service client.',
    icon: MessageSquare,
    emptyTitle: 'Aucun message dans votre boîte',
    emptyDescription:
      'Vos questions posées aux boutiques partenaires sur les fiches produits s’afficheront dans cet espace.',
  },
  inviter: {
    title: 'Inviter un ami',
    description: 'Partagez Dzora Marketplace avec vos proches et bénéficiez de réductions.',
    icon: UserPlus,
    emptyTitle: 'Programme de parrainage Dzora',
    emptyDescription:
      'Invitez vos amis à commander sur Dzora pour débloquer des bons de réduction exclusifs sur vos prochains achats.',
  },
  support: {
    title: 'Service client Dzora',
    description: 'Une équipe dédiée à votre écoute pour toute question relative à vos achats.',
    icon: Headphones,
    emptyTitle: 'Support client 7j/7',
    emptyDescription:
      'Contactez-nous directement par e-mail à contact@dzora.dz ou par téléphone au +213 (0) 23 00 00 00.',
  },
  aide: {
    title: 'Centre d’aide',
    description: 'Guides d’achat, foire aux questions et politiques de livraison.',
    icon: HelpCircle,
    emptyTitle: 'Questions fréquentes (FAQ)',
    emptyDescription:
      'Retrouvez toutes les réponses concernant les délais d’expédition, les frais de livraison par wilaya et les garanties vendeurs.',
  },
}

export function AccountPlaceholderTab({
  tabSlug,
  orders = [],
  primaryAddress,
  addresses = [],
  paymentMethod = 'COD',
  currentUserFullName = '',
  currentUserPhone = '',
  onGoToSettings,
  onUpdateAddress,
  onSaveAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onUpdatePaymentMethod,
}: AccountPlaceholderTabProps) {
  // Address edit / add modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addrTitle, setAddrTitle] = useState('Adresse principale')
  const [addrFullName, setAddrFullName] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrWilaya, setAddrWilaya] = useState('16 - Alger')
  const [addrCommune, setAddrCommune] = useState('')
  const [addrStreet, setAddrStreet] = useState('')
  const [addrIsDefault, setAddrIsDefault] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const meta = TAB_METADATA[tabSlug] || {
    title: 'Rubrique de compte',
    description: 'Espace client Dzora',
    icon: Package,
    emptyTitle: 'Information en cours de chargement',
    emptyDescription: 'Cette rubrique est en cours d’actualisation.',
  }

  const IconComp = meta.icon

  // Determine effective list of addresses to display
  const displayAddresses: ClientAddress[] =
    addresses.length > 0
      ? addresses
      : primaryAddress && primaryAddress.wilaya
      ? [primaryAddress]
      : []

  // Open modal to EDIT a specific address pre-filled with its current default values
  const handleOpenEditAddress = (addr: ClientAddress) => {
    setEditingAddressId(addr.id)
    setAddrTitle(addr.title || 'Adresse principale')
    setAddrFullName(addr.fullName || currentUserFullName || '')
    setAddrPhone(addr.phone || currentUserPhone || '')
    setAddrWilaya(addr.wilaya || '16 - Alger')
    setAddrCommune(addr.commune || '')
    setAddrStreet(addr.address || '')
    setAddrIsDefault(Boolean(addr.isDefault))
    setAddressModalOpen(true)
  }

  // Open modal to ADD a new address
  const handleOpenAddAddress = () => {
    setEditingAddressId(null)
    setAddrTitle(displayAddresses.length === 0 ? 'Adresse principale' : 'Autre adresse')
    setAddrFullName(currentUserFullName || primaryAddress?.fullName || '')
    setAddrPhone(currentUserPhone || primaryAddress?.phone || '')
    setAddrWilaya(primaryAddress?.wilaya || '16 - Alger')
    setAddrCommune('')
    setAddrStreet('')
    setAddrIsDefault(displayAddresses.length === 0)
    setAddressModalOpen(true)
  }

  const handleSaveAddressForm = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: Partial<ClientAddress> = {
      id: editingAddressId || undefined,
      title: addrTitle.trim() || 'Adresse de livraison',
      fullName: addrFullName.trim(),
      phone: addrPhone.trim(),
      wilaya: addrWilaya,
      commune: addrCommune.trim(),
      address: addrStreet.trim(),
      isDefault: addrIsDefault,
    }

    if (onSaveAddress) {
      onSaveAddress(payload)
    } else if (onUpdateAddress) {
      onUpdateAddress(payload)
    }

    setAddressModalOpen(false)
    setToastMessage(
      editingAddressId
        ? 'Adresse de livraison mise à jour avec succès.'
        : 'Nouvelle adresse ajoutée avec succès.',
    )
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleDelete = (addrId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette adresse de livraison ?')) {
      if (onDeleteAddress) onDeleteAddress(addrId)
      setToastMessage('Adresse supprimée avec succès.')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleSetDefault = (addrId: string) => {
    if (onSetDefaultAddress) onSetDefaultAddress(addrId)
    setToastMessage('Adresse principale mise à jour.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSelectPayment = (type: PaymentMethodType) => {
    if (onUpdatePaymentMethod) {
      onUpdatePaymentMethod(type)
      setToastMessage('Mode de paiement par défaut mis à jour.')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.02)] p-6 mb-6 animate-in fade-in duration-200">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8F0ED] mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
              <IconComp size={16} />
            </div>
            <h2 className="font-display font-extrabold text-lg text-[#102A2A]">
              {meta.title}
            </h2>
          </div>
          <p className="text-xs text-[#60716F] mt-1">{meta.description}</p>
        </div>

        {onGoToSettings && (
          <button
            type="button"
            onClick={onGoToSettings}
            className="self-start sm:self-auto text-xs font-bold text-[#006B55] hover:underline cursor-pointer"
          >
            ← Retour aux paramètres
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB: COMMANDES                                           */}
      {/* ======================================================== */}
      {tabSlug === 'commandes' && (
        <div>
          {orders.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#60716F] pb-2">
                <span>{orders.length} commande{orders.length > 1 ? 's' : ''} enregistrée{orders.length > 1 ? 's' : ''}</span>
                <span className="text-[#006B55] font-bold">Livraison 58 wilayas</span>
              </div>

              {orders.map((ord) => (
                <div
                  key={ord.orderId}
                  className="rounded-2xl border border-[#DCE8E3] bg-[#FAFDFB] p-5 shadow-xs hover:border-[#BBDDD4] transition space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5EEEB]">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center font-bold">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#102A2A]">
                            #{ord.orderId}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                            <span className="size-1.5 rounded-full bg-[#006B55] animate-pulse" />
                            {ord.statusLabel || 'En cours de préparation'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#71827D] mt-0.5">Commandée le {ord.date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-[#006B55]">
                        {ord.totalAmount?.toLocaleString('fr-FR')} DA
                      </div>
                      <p className="text-[10.5px] text-[#71827D] font-medium">{ord.paymentMethodLabel || 'Cash (COD)'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-[#E8F0ED]">
                    <div>
                      <span className="text-[11px] text-[#71827D] font-semibold block">Destinataire</span>
                      <span className="font-bold text-[#102A2A]">{ord.clientName}</span>
                      {ord.phone && <p className="text-[11px] text-[#60716F] font-mono mt-0.5">{ord.phone}</p>}
                    </div>
                    <div>
                      <span className="text-[11px] text-[#71827D] font-semibold block">Adresse de livraison</span>
                      <span className="font-bold text-[#102A2A]">{ord.wilaya}</span>
                      <p className="text-[11px] text-[#60716F] truncate mt-0.5">
                        {ord.commune ? `${ord.commune}, ` : ''}{ord.address}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#71827D] font-semibold block">Expédition</span>
                      <span className="font-bold text-[#102A2A]">{ord.deliveryType}</span>
                      <p className="text-[11px] text-[#60716F] mt-0.5">Frais : {ord.deliveryFee} DA</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#60716F] flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={14} className="text-[#006B55]" />
                      Garantie conformité Dzora
                    </span>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] hover:text-[#005544] transition"
                    >
                      <span>Commander à nouveau</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
              <div className="size-14 rounded-2xl bg-[#E7F2EF] text-[#006B55] mx-auto flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
              <h3 className="font-display font-bold text-sm text-[#102A2A]">
                {meta.emptyTitle}
              </h3>
              <p className="text-xs text-[#71827D] leading-relaxed">
                {meta.emptyDescription}
              </p>
              <div className="pt-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs"
                >
                  <span>Parcourir les produits</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: MOYENS DE PAIEMENT                                  */}
      {/* ======================================================== */}
      {tabSlug === 'paiements' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#FAFDFB] p-4 border border-[#E5EEEB] text-xs text-[#60716F]">
            Choisissez votre mode de règlement préféré pour accélérer le passage de vos commandes sur la marketplace.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['COD', 'CIB', 'BANK'] as PaymentMethodType[]).map((type) => {
              const info = PAYMENT_METHODS[type]
              const isSelected = paymentMethod === type

              return (
                <div
                  key={type}
                  onClick={() => handleSelectPayment(type)}
                  className={`rounded-2xl border p-5 transition cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-[#006B55] bg-[#E7F2EF]/30 shadow-xs ring-1 ring-[#006B55]'
                      : 'border-[#DCE8E3] bg-white hover:border-[#BBDDD4]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`size-9 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-[#006B55] text-white' : 'bg-[#E7F2EF] text-[#006B55]'
                      }`}>
                        <CreditCard size={18} />
                      </div>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#006B55] bg-white px-2 py-0.5 rounded-full border border-[#BBDDD4]">
                          <CheckCircle2 size={12} />
                          Par défaut
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-semibold text-[#71827D]">
                          Cliquer pour choisir
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-extrabold text-sm text-[#102A2A]">
                      {info.title}
                    </h4>
                    <p className="text-xs font-semibold text-[#006B55] mt-0.5">
                      {info.subtitle}
                    </p>
                    <p className="text-[11px] text-[#60716F] mt-2 leading-relaxed">
                      {info.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E8F0ED] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-[#60716F]">{info.badgeText}</span>
                    <button
                      type="button"
                      className={`text-xs font-bold transition cursor-pointer ${
                        isSelected ? 'text-[#006B55]' : 'text-slate-400 hover:text-[#102A2A]'
                      }`}
                    >
                      {isSelected ? 'Actif' : 'Sélectionner'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: ADRESSES DE LIVRAISON                               */}
      {/* ======================================================== */}
      {tabSlug === 'adresses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 text-xs font-semibold text-[#60716F] gap-3">
            <span>
              {displayAddresses.length > 0
                ? `${displayAddresses.length} adresse${displayAddresses.length > 1 ? 's' : ''} de livraison enregistrée${displayAddresses.length > 1 ? 's' : ''}`
                : 'Adresse enregistrée pour les livraisons à domicile et en point relais'}
            </span>
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005544] transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus size={14} />
              <span>Ajouter une autre adresse</span>
            </button>
          </div>

          {displayAddresses.length > 0 ? (
            <div className="space-y-4">
              {displayAddresses.map((addr) => {
                const isDefault = Boolean(addr.isDefault)

                return (
                  <div
                    key={addr.id}
                    className={`rounded-2xl border p-5 shadow-xs transition relative ${
                      isDefault
                        ? 'border-[#006B55]/60 bg-[#FAFDFB] ring-1 ring-[#006B55]/20'
                        : 'border-[#DCE8E3] bg-white hover:border-[#BBDDD4]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E5EEEB] mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        {isDefault ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                            <CheckCircle2 size={12} />
                            Adresse Principale (Par défaut)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Adresse secondaire
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#102A2A]">{addr.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-xs font-semibold text-[#006B55] hover:underline cursor-pointer px-2 py-1 rounded-lg hover:bg-[#E7F2EF]/50 transition flex items-center gap-1"
                          >
                            <Check size={12} />
                            <span>Définir par défaut</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="text-xs font-bold text-[#006B55] hover:underline cursor-pointer px-2 py-1 rounded-lg hover:bg-[#E7F2EF]/50 transition flex items-center gap-1"
                        >
                          <Edit3 size={12} />
                          <span>Modifier</span>
                        </button>

                        {displayAddresses.length > 1 && !isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDelete(addr.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                            title="Supprimer cette adresse"
                          >
                            <Trash2 size={12} />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-[#71827D] block">Destinataire</span>
                        <span className="font-bold text-[#102A2A] text-sm">
                          {addr.fullName || currentUserFullName || 'Client Dzora'}
                        </span>
                        {addr.phone && (
                          <p className="text-[11px] font-mono text-[#60716F] mt-1 flex items-center gap-1">
                            <Phone size={11} className="text-[#006B55]" />
                            {addr.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-[#71827D] block">Wilaya &amp; Commune</span>
                        <span className="font-bold text-[#102A2A] text-sm">
                          {addr.wilaya || 'Non renseignée'}
                        </span>
                        {addr.commune && (
                          <p className="text-xs text-[#60716F] mt-1">{addr.commune}</p>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-[#71827D] block">Adresse détaillée</span>
                        <p className="font-medium text-[#102A2A] mt-0.5 leading-relaxed">
                          {addr.address || 'Aucune adresse de rue renseignée'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
              <div className="size-14 rounded-2xl bg-[#E7F2EF] text-[#006B55] mx-auto flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <h3 className="font-display font-bold text-sm text-[#102A2A]">
                Aucune adresse de livraison enregistrée
              </h3>
              <p className="text-xs text-[#71827D] leading-relaxed">
                Renseignez votre wilaya de résidence et votre adresse pour accélérer vos commandes sur Dzora.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Ajouter une adresse de livraison</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* OTHER TABS: Fallback view                                */}
      {/* ======================================================== */}
      {tabSlug !== 'commandes' && tabSlug !== 'paiements' && tabSlug !== 'adresses' && (
        <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
          <div className="size-14 rounded-2xl bg-[#E7F2EF] text-[#006B55] mx-auto flex items-center justify-center">
            <IconComp size={24} />
          </div>
          <h3 className="font-display font-bold text-sm text-[#102A2A]">
            {meta.emptyTitle}
          </h3>
          <p className="text-xs text-[#71827D] leading-relaxed">
            {meta.emptyDescription}
          </p>

          {meta.actionText && (
            <div className="pt-3">
              {meta.actionHref ? (
                <Link
                  href={meta.actionHref}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs"
                >
                  <span>{meta.actionText}</span>
                  <ArrowRight size={13} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{meta.actionText}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Address Edit / Add Modal */}
      {addressModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <h3 className="font-display font-extrabold text-base text-[#102A2A]">
                  {editingAddressId ? 'Modifier l’adresse de livraison' : 'Ajouter une nouvelle adresse'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAddressForm} className="space-y-4">
              {/* Address Title */}
              <div>
                <label className="block text-xs font-bold text-[#102A2A] mb-1">
                  Nom ou étiquette de l’adresse
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {['Domicile', 'Bureau', 'Famille', 'Autre'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddrTitle(preset)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        addrTitle === preset
                          ? 'bg-[#006B55] text-white shadow-xs'
                          : 'bg-[#F7FAF9] border border-[#DCE8E3] text-[#60716F] hover:bg-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  placeholder="Ex: Domicile, Bureau, etc."
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#008F72] transition"
                />
              </div>

              {/* Recipient Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#102A2A] mb-1">
                    Nom complet du destinataire *
                  </label>
                  <input
                    type="text"
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    placeholder="Ex: Mohamed Benali"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#008F72] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A2A] mb-1">
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="Ex: 0550 12 34 56"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#008F72] transition font-mono"
                  />
                </div>
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#102A2A] mb-1">
                    Wilaya (58 wilayas) *
                  </label>
                  <select
                    value={addrWilaya}
                    onChange={(e) => setAddrWilaya(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#008F72] transition cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Choisir une wilaya --</option>
                    {wilayasData.map((w) => (
                      <option key={w.code} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A2A] mb-1">
                    Commune / Ville *
                  </label>
                  <input
                    type="text"
                    value={addrCommune}
                    onChange={(e) => setAddrCommune(e.target.value)}
                    placeholder="Ex: Chéraga, Bab Ezzouar, etc."
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#008F72] transition"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-[#102A2A] mb-1">
                  Adresse détaillée (Rue, Bâtiment, Étage, N°) *
                </label>
                <textarea
                  rows={2}
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="Ex: Résidence Les Palmiers, Bloc B, N° 14"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#008F72] transition"
                />
              </div>

              {/* Is Default Checkbox */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-default-addr"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="size-4 rounded text-[#006B55] focus:ring-[#006B55] border-gray-300 cursor-pointer"
                />
                <label
                  htmlFor="chk-default-addr"
                  className="text-xs font-semibold text-[#102A2A] cursor-pointer"
                >
                  Définir comme adresse principale de livraison (par défaut)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E8F0ED]">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-slate-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Enregistrer l’adresse</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
