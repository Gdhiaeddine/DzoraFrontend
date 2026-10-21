'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Home,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
  Plus,
  Edit3,
} from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { wilayasData, Wilaya } from '@/lib/wilayas'
import { AlgeriaFlag } from '@/components/algeria-flag'
import {
  ClientAddress,
  getClientAddresses,
  saveClientAddresses,
  saveClientOrder,
  saveClientPrimaryAddress,
} from '@/lib/client-account'
import { CheckoutAddressModal } from '@/components/checkout/checkout-address-modal'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, cartItems } = useCart()

  // Addresses State
  const [addresses, setAddresses] = useState<ClientAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<ClientAddress | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

  // Secondary contact phone
  const [secondPhone, setSecondPhone] = useState('')

  // Delivery & Payment selection
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'cib'>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load and synchronize client addresses on mount / user change
  useEffect(() => {
    const list = getClientAddresses(user?.id)

    if (list.length > 0) {
      setAddresses(list)
      // Pick default address or first address
      const defaultAddr = list.find((a) => a.isDefault) || list[0]
      setSelectedAddress(defaultAddr)
    } else {
      // Default initial fallback address
      const initialAddr: ClientAddress = {
        id: 'addr_init_blida',
        title: 'Adresse principale',
        fullName: user?.fullName || 'Mohamed Benali',
        phone: user?.phone || '0550 12 34 56',
        wilaya: '09 - Blida',
        commune: 'Blida Centre',
        address: 'Rue de la Liberté, Bâtiment C, N° 14',
        isDefault: true,
        updatedAt: new Date().toISOString(),
      }
      setAddresses([initialAddr])
      setSelectedAddress(initialAddr)
      saveClientAddresses([initialAddr], user?.id)
    }
  }, [user])

  // Find wilaya data corresponding to currently selected address
  const selectedWilaya: Wilaya = (() => {
    if (!selectedAddress?.wilaya) return wilayasData[8] // Default 09 - Blida
    const raw = selectedAddress.wilaya.trim()
    const found = wilayasData.find(
      (w) =>
        raw.includes(w.name) ||
        w.name.includes(raw) ||
        raw.startsWith(w.code) ||
        w.name.split('-')[1]?.trim().toLowerCase() === raw.toLowerCase(),
    )
    return found || wilayasData[8]
  })()

  // Dynamic delivery fee based on selected address's wilaya and chosen delivery type
  const deliveryFee = deliveryType === 'home' ? selectedWilaya.feeHome : selectedWilaya.feeDesk

  // Dynamic cart subtotal calculation from cart items or fallback demo items
  const itemsSubtotal =
    cartItems && cartItems.length > 0
      ? cartItems.reduce((acc, it) => acc + it.currentPrice * it.quantity, 0)
      : 38980

  const itemsCount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce((acc, it) => acc + it.quantity, 0)
      : 2

  const totalAmount = itemsSubtotal + deliveryFee

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
  }

  // Address selection handler
  const handleSelectAddress = (addr: ClientAddress) => {
    setSelectedAddress(addr)
  }

  // Address list update handler
  const handleSaveAddresses = (updated: ClientAddress[]) => {
    setAddresses(updated)
    saveClientAddresses(updated, user?.id)
  }

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const activeFullName = selectedAddress?.fullName || user?.fullName || 'Client Dzora'
    const activePhone = selectedAddress?.phone || user?.phone || '0550 12 34 56'
    const activeCommune = selectedAddress?.commune || 'Blida Centre'
    const activeStreet = selectedAddress?.address || 'Rue de la Liberté, Bâtiment C'

    // Store order payload in sessionStorage for the confirmation screen
    const orderData = {
      orderId: 'DZ-' + Math.floor(100000 + Math.random() * 900000),
      clientName: activeFullName,
      phone: activePhone,
      secondPhone: secondPhone.trim() || undefined,
      wilaya: selectedWilaya.name,
      commune: activeCommune,
      address: activeStreet,
      deliveryType: deliveryType === 'home' ? 'Livraison à domicile' : 'Point relais (Stop Desk)',
      deliveryFee,
      totalAmount,
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      status: 'PENDING' as const,
      statusLabel: 'En cours de préparation',
      paymentMethod: (paymentMethod === 'cod' ? 'COD' : 'CIB') as any,
      paymentMethodLabel:
        paymentMethod === 'cod' ? 'Cash à la livraison (COD)' : 'Carte CIB / Edahabia',
      itemsCount,
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dzora_last_order', JSON.stringify(orderData))
      saveClientOrder(orderData, user?.id)
      if (selectedAddress) {
        saveClientPrimaryAddress(selectedAddress, user?.id)
      }
    }

    setTimeout(() => {
      router.push('/commande-confirmee')
    }, 700)
  }

  return (
    <div className="bg-[#FAFDFB] min-h-screen text-[#102A2A] pb-20">
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs font-medium text-[#60716F]">
          <Link href="/" className="transition hover:text-[#006B55]">
            Accueil
          </Link>
          <ChevronRight size={13} className="text-[#94A4A0]" />
          <Link href="/panier" className="transition hover:text-[#006B55]">
            Mon panier
          </Link>
          <ChevronRight size={13} className="text-[#94A4A0]" />
          <span className="font-semibold text-[#102A2A]">Livraison &amp; Coordonnées</span>
        </nav>

        {/* Page Heading & Step Indicator */}
        <div className="mt-4">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.035em] text-[#102A2A]">
            Coordonnées &amp; Livraison
          </h1>

          {/* 3-Step Checkout Indicator */}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
            {/* Step 1: Panier (Done) */}
            <Link
              href="/panier"
              className="inline-flex items-center gap-2 rounded-full border border-[#DCE8E3] bg-white px-3.5 py-1.5 text-[#006B55] hover:bg-[#F0F5F2]"
            >
              <CheckCircle2 size={15} className="text-[#006B55]" />
              <span>Panier</span>
            </Link>

            <span className="text-[#CADBD5]">―</span>

            {/* Step 2: Livraison (Active) */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#006B55] px-4 py-1.5 text-white shadow-xs">
              <span className="flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#006B55]">
                2
              </span>
              <span>Livraison</span>
            </div>

            <span className="text-[#CADBD5]">―</span>

            {/* Step 3: Confirmation (Inactive) */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE8E3] bg-white px-4 py-1.5 text-[#889994]">
              <span className="flex size-4 items-center justify-center rounded-full bg-[#F0F5F2] text-[10px] font-bold text-[#889994]">
                3
              </span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <form
          onSubmit={handleConfirmOrder}
          className="mt-7 grid gap-8 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] items-start"
        >
          {/* Left Column: Delivery Details Form */}
          <div className="space-y-6">
            {/* Account Recognition Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-[#D7ECE5] bg-gradient-to-r from-[#E7F2EF] to-[#F1F8F5] p-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-[#006B55] text-white font-bold text-sm">
                  {(selectedAddress?.fullName || user?.fullName || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#102A2A]">
                    Commande liée au compte :{' '}
                    <span className="text-[#006B55]">
                      {selectedAddress?.fullName || user?.fullName || 'Client Dzora'}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#60716F]">
                    Vos coordonnées sont enregistrées pour accélérer la validation de vos achats.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-bold text-[10px] text-[#006B55] border border-[#BBDDD4]">
                <BadgeCheck size={12} /> Compte actif
              </span>
            </div>

            {/* SECTION 1: ADRESSE DE LIVRAISON (AliExpress Style Card) */}
            <div className="rounded-2xl sm:rounded-3xl border border-[#E3ECE8] bg-white p-5 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F0F5F2] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#E7F2EF] text-[#006B55] font-bold text-xs">
                    1
                  </span>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-extrabold text-[#102A2A]">
                      Adresse de livraison
                    </h2>
                    <p className="text-xs text-[#60716F]">
                      L’adresse principale est sélectionnée par défaut. Vous pouvez la changer en 1 clic.
                    </p>
                  </div>
                </div>

                {/* AliExpress Style "Changer d'adresse" Action */}
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D5E4DE] bg-[#F7FAF9] hover:bg-[#E7F2EF] text-[#006B55] text-xs font-bold transition cursor-pointer shadow-2xs hover:border-[#BBDDD4]"
                >
                  <Edit3 size={13} />
                  <span>Changer d’adresse</span>
                </button>
              </div>

              {/* Active Selected Address Display Box (AliExpress Highlight) */}
              <div className="mt-5">
                {selectedAddress ? (
                  <div
                    onClick={() => setIsAddressModalOpen(true)}
                    className="p-4 sm:p-5 rounded-2xl border-2 border-[#006B55]/40 bg-[#FAFDFB] hover:border-[#006B55] transition cursor-pointer relative group shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5EEEB] mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="size-6 rounded-lg bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                          <MapPin size={14} />
                        </div>

                        <span className="text-xs font-extrabold text-[#102A2A]">
                          {selectedAddress.title || 'Mon adresse'}
                        </span>

                        {selectedAddress.isDefault ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                            <CheckCircle2 size={11} />
                            Adresse Principale (Par défaut)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            Adresse secondaire
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-[#006B55] group-hover:underline flex items-center gap-0.5">
                        <span>Modifier ou changer</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-[#71827D] block">Destinataire</span>
                        <div className="font-extrabold text-sm text-[#102A2A] mt-0.5">
                          {selectedAddress.fullName || user?.fullName || 'Client Dzora'}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#43615C] mt-1">
                          <Phone size={11} className="text-[#006B55]" />
                          <span>{selectedAddress.phone || user?.phone || '0550 12 34 56'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-[#71827D] block">
                          Destination ({selectedWilaya.name})
                        </span>
                        <p className="font-bold text-[#102A2A] mt-0.5">
                          {selectedAddress.commune ? `${selectedAddress.commune}, ` : ''}
                          <span className="text-[#006B55] font-extrabold">{selectedWilaya.name}</span>
                        </p>
                        <p className="text-[11px] text-[#60716F] mt-0.5 line-clamp-2">
                          {selectedAddress.address}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsAddressModalOpen(true)}
                    className="p-6 rounded-2xl border-2 border-dashed border-[#CADBD5] hover:border-[#006B55] bg-[#F7FAF9] text-center cursor-pointer transition"
                  >
                    <MapPin size={24} className="text-[#006B55] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#102A2A]">
                      Aucune adresse enregistrée. Cliquez pour en ajouter une.
                    </p>
                    <p className="text-[11px] text-[#60716F] mt-0.5">
                      Livraison disponible sur l’ensemble des 58 wilayas d’Algérie.
                    </p>
                  </div>
                )}

                {/* Secondary Phone Input (Optional in case of unreachable) */}
                <div className="mt-4 pt-3 border-t border-[#F0F5F2]">
                  <label className="block text-xs font-bold text-[#102A2A]">
                    Numéro de téléphone secondaire (Optionnel en cas d’injoignabilité)
                  </label>
                  <div className="relative mt-1.5 flex items-center rounded-xl border border-[#D5E4DE] bg-[#F7FAF9] transition focus-within:border-[#006B55] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#006B55]/10">
                    <span className="flex items-center gap-1.5 border-r border-[#D5E4DE] bg-slate-50/70 px-3 py-2.5 text-xs font-bold text-[#006B55] rounded-l-xl select-none">
                      <AlgeriaFlag className="h-3.5 w-5 rounded-[2px] shadow-2xs border border-black/10" />
                      <span>+213</span>
                    </span>
                    <input
                      type="tel"
                      value={secondPhone}
                      onChange={(e) => setSecondPhone(e.target.value)}
                      placeholder="Ex: 07 70 11 22 33 (Livreur alternatif)"
                      className="h-10 w-full bg-transparent px-3 text-xs outline-none text-[#102A2A] placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: MODE DE LIVRAISON (Dynamically recalculated per wilaya) */}
            <div className="rounded-2xl sm:rounded-3xl border border-[#E3ECE8] bg-white p-5 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F0F5F2] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#E7F2EF] text-[#006B55] font-bold text-xs">
                    2
                  </span>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-extrabold text-[#102A2A]">
                      Option de livraison ({selectedWilaya.name})
                    </h2>
                    <p className="text-xs text-[#60716F]">
                      Tarifs calculés automatiquement selon la wilaya de destination sélectionnée.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {/* Option A: Domicile */}
                <label
                  onClick={() => setDeliveryType('home')}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    deliveryType === 'home'
                      ? 'border-[#006B55] bg-[#F2F8F5] ring-2 ring-[#006B55]/20 shadow-xs'
                      : 'border-[#E3ECE8] bg-white hover:border-[#CADBD5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'home'}
                    onChange={() => setDeliveryType('home')}
                    className="mt-1 text-[#006B55] focus:ring-[#006B55]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#102A2A]">À domicile</span>
                      <span className="text-sm font-extrabold text-[#006B55]">
                        {formatPrice(selectedWilaya.feeHome)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#60716F] leading-relaxed">
                      Remis en mains propres à votre porte (24h à 48h) dans la wilaya de {selectedWilaya.name.split('-')[1]?.trim()}.
                    </p>
                  </div>
                </label>

                {/* Option B: Stop Desk */}
                <label
                  onClick={() => setDeliveryType('desk')}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    deliveryType === 'desk'
                      ? 'border-[#006B55] bg-[#F2F8F5] ring-2 ring-[#006B55]/20 shadow-xs'
                      : 'border-[#E3ECE8] bg-white hover:border-[#CADBD5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'desk'}
                    onChange={() => setDeliveryType('desk')}
                    className="mt-1 text-[#006B55] focus:ring-[#006B55]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#102A2A]">Point relais (Stop Desk)</span>
                      <span className="text-sm font-extrabold text-[#006B55]">
                        {formatPrice(selectedWilaya.feeDesk)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#60716F] leading-relaxed">
                      À récupérer au bureau transporteur le plus proche de votre commune.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* SECTION 3: MODE DE RÈGLEMENT */}
            <div className="rounded-2xl sm:rounded-3xl border border-[#E3ECE8] bg-white p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#F0F5F2] pb-4">
                <span className="grid size-7 place-items-center rounded-lg bg-[#E7F2EF] text-[#006B55] font-bold text-xs">
                  3
                </span>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-extrabold text-[#102A2A]">
                    Mode de règlement
                  </h2>
                  <p className="text-xs text-[#60716F]">
                    Choisissez votre méthode préférée : paiement en espèces à la réception ou paiement électronique instantané.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {/* Option 1: Cash à la livraison (COD) */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4.5 transition ${
                    paymentMethod === 'cod'
                      ? 'border-[#006B55] bg-[#F2F8F5] ring-2 ring-[#006B55]/20 shadow-xs'
                      : 'border-[#E3ECE8] bg-white hover:border-[#CADBD5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-[#006B55] focus:ring-[#006B55]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#102A2A]">
                        Paiement cash à la livraison (COD)
                      </span>
                      <span className="rounded-md bg-[#006B55] px-2 py-0.5 text-[10px] font-bold text-white">
                        Recommandé
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#43615C] leading-relaxed">
                      Vous ne payez rien maintenant. Préparez le montant exact en espèces en dinars (DA) pour le livreur à la réception de votre colis.
                    </p>
                  </div>
                </label>

                {/* Option 2: Carte CIB / Edahabia */}
                <label
                  onClick={() => setPaymentMethod('cib')}
                  className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4.5 transition ${
                    paymentMethod === 'cib'
                      ? 'border-[#006B55] bg-[#F2F8F5] ring-2 ring-[#006B55]/20 shadow-xs'
                      : 'border-[#E3ECE8] bg-white hover:border-[#CADBD5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cib'}
                    onChange={() => setPaymentMethod('cib')}
                    className="mt-1 text-[#006B55] focus:ring-[#006B55]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#102A2A]">
                          Carte bancaire CIB / Edahabia
                        </span>
                        <span className="rounded-md bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4] px-2 py-0.5 text-[10px] font-bold">
                          Paiement en ligne
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#0C356A] text-white text-[10px] font-extrabold tracking-wider shadow-2xs">
                          CIB
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#CCA01D] text-white text-[10px] font-extrabold tracking-wider shadow-2xs">
                          EDAHABIA
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-[#43615C] leading-relaxed">
                      Paiement électronique instantané et 100% sécurisé via le réseau interbancaire SATIM &amp; Algérie Poste.
                    </p>
                    {paymentMethod === 'cib' && (
                      <div className="mt-3 p-3 rounded-xl bg-white border border-[#BBDDD4] text-[11px] text-[#006B55] flex items-center gap-2 font-medium">
                        <CreditCard size={14} className="shrink-0" />
                        <span>Vous serez redirigé vers l’espace de paiement sécurisé SATIM avec code de vérification SMS 3D-Secure.</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary with delivery fee dynamically added */}
          <aside className="sticky top-28 space-y-4">
            <div className="rounded-2xl sm:rounded-3xl border border-[#E3ECE8] bg-white p-6 sm:p-7 shadow-sm">
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#102A2A] pb-4 border-b border-[#F0F5F2]">
                Récapitulatif de commande
              </h2>

              <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-[#43615C]">
                  <span>
                    Articles ({itemsCount} produit{itemsCount > 1 ? 's' : ''})
                  </span>
                  <span className="font-extrabold text-[#102A2A]">
                    {formatPrice(itemsSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#43615C]">
                  <span>Vendeur</span>
                  <span className="font-bold text-[#006B55]">Techno Blida ✓</span>
                </div>

                <div className="flex justify-between items-center text-[#43615C]">
                  <span>
                    Frais de livraison ({selectedWilaya.name.split('-')[1]?.trim() || selectedWilaya.name})
                  </span>
                  <span className="font-extrabold text-[#006B55] transition-all">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#43615C] text-xs">
                  <span>Mode de livraison</span>
                  <span className="font-semibold text-[#102A2A]">
                    {deliveryType === 'home' ? 'À domicile' : 'Point relais (Stop Desk)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#43615C] text-xs">
                  <span>Règlement</span>
                  <span className="font-semibold text-[#006B55]">
                    {paymentMethod === 'cod' ? 'Cash (COD)' : 'CIB / Edahabia'}
                  </span>
                </div>
              </div>

              {/* Total final */}
              <div className="my-5 border-t border-[#F0F5F2]" />

              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-[#102A2A]">Montant total à payer</span>
                  <p className="text-[11px] font-medium text-[#006B55]">
                    {paymentMethod === 'cod'
                      ? 'Livraison incluse · En espèces'
                      : 'Paiement sécurisé CIB / Edahabia'}
                  </p>
                </div>
                <span className="font-display text-2xl font-extrabold text-[#102A2A] transition-all">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              {/* Confirm CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedAddress}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#006B55] py-3.5 px-6 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,107,85,0.25)] transition hover:bg-[#008F72] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Enregistrement de la commande...</span>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'cib'
                        ? 'Payer par carte CIB / Edahabia'
                        : 'Confirmer ma commande'}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#43615C]">
                <ShieldCheck size={16} className="text-[#008F72]" />
                <span>
                  {paymentMethod === 'cib'
                    ? 'Paiement 100% sécurisé SATIM & Algérie Poste'
                    : 'Paiement sécurisé à la réception'}
                </span>
              </div>
            </div>
          </aside>
        </form>
      </div>

      {/* AliExpress Style Address Modal */}
      <CheckoutAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        selectedAddressId={selectedAddress?.id || null}
        onSelectAddress={handleSelectAddress}
        onSaveAddresses={handleSaveAddresses}
        currentUserName={user?.fullName || ''}
        currentUserPhone={user?.phone || ''}
      />
    </div>
  )
}
