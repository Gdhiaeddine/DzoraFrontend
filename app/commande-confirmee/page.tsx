'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react'

interface SavedOrder {
  orderId: string
  clientName: string
  phone: string
  wilaya: string
  commune: string
  address: string
  deliveryType: string
  deliveryFee: number
  totalAmount: number
  date: string
  paymentMethod?: 'COD' | 'CIB'
  paymentMethodLabel?: string
}

export default function OrderConfirmedPage() {
  const [order, setOrder] = useState<SavedOrder | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('dzora_last_order')
      if (stored) {
        try {
          setOrder(JSON.parse(stored))
        } catch {
          // Fallback
        }
      }
    }
  }, [])

  const formatPrice = (price?: number) => {
    if (!price) return '39 330 DA'
    return price.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
  }

  const orderId = order?.orderId || 'DZ-849204'
  const clientName = order?.clientName || 'Mohamed Benali'
  const phone = order?.phone || '0550 12 34 56'
  const wilaya = order?.wilaya || '09 - Blida'
  const commune = order?.commune || 'Blida Centre'
  const address = order?.address || 'Rue de la Liberté, Bâtiment C, N° 14'
  const totalAmount = order?.totalAmount || 39330

  return (
    <div className="bg-[#FAFDFB] min-h-screen text-[#102A2A] pb-24">
      <div className="mx-auto max-w-[860px] px-4 pt-6 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="overflow-hidden rounded-3xl border border-[#D5E6E0] bg-white p-6 sm:p-10 shadow-sm text-center">
          {/* Animated Green Badge */}
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#E7F5F0] text-[#006B55] shadow-xs">
            <PackageCheck size={42} strokeWidth={2.2} />
          </div>

          <span className="mt-4 inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#006B55]">
            COMMANDE CONFIRMÉE
          </span>

          <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.035em] text-[#102A2A]">
            Merci pour votre commande, {clientName} !
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#43615C] max-w-[540px] mx-auto">
            Votre commande a bien été enregistrée sous la référence{' '}
            <span className="font-extrabold text-[#006B55]">{orderId}</span> et transmise à la boutique{' '}
            <b>Techno Blida</b>.
          </p>

          {/* 3 Steps Workflow Explainer */}
          <div className="mt-8 rounded-2xl border border-[#D7ECE5] bg-gradient-to-r from-[#F4FAF7] to-[#EAF5F1] p-5 sm:p-6 text-left">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#006B55]">
              Que se passe-t-il ensuite ? (Processus de livraison en Algérie)
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#006B55] text-white font-bold text-xs">
                  1
                </span>
                <div>
                  <h3 className="text-xs font-bold text-[#102A2A]">Appel de confirmation</h3>
                  <p className="mt-0.5 text-[11px] text-[#43615C] leading-4">
                    Un agent ou le vendeur vous appellera au <b>{phone}</b> pour confirmer l’adresse.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#006B55] text-white font-bold text-xs">
                  2
                </span>
                <div>
                  <h3 className="text-xs font-bold text-[#102A2A]">Expédition rapide</h3>
                  <p className="mt-0.5 text-[11px] text-[#43615C] leading-4">
                    Le colis est confié au transporteur. Vous recevrez un SMS avec le suivi.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#006B55] text-white font-bold text-xs">
                  3
                </span>
                <div>
                  <h3 className="text-xs font-bold text-[#102A2A]">
                    {order?.paymentMethod === 'CIB' ? 'Paiement en ligne validé' : 'Paiement à la livraison'}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[#43615C] leading-4">
                    {order?.paymentMethod === 'CIB' ? (
                      <>Règlement de <b>{formatPrice(totalAmount)}</b> validé via CIB / Edahabia.</>
                    ) : (
                      <>Préparez <b>{formatPrice(totalAmount)}</b> en espèces à remettre au livreur.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Receipt Box */}
          <div className="mt-7 rounded-2xl border border-[#E3ECE8] bg-[#FAFDFB] p-5 sm:p-6 text-left text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-[#E7EFEA] pb-3">
              <span className="font-bold text-[#102A2A]">Numéro de commande</span>
              <span className="font-extrabold text-[#006B55] font-mono text-sm">{orderId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#60716F]">Destinataire</span>
              <span className="font-semibold text-[#102A2A]">{clientName} ({phone})</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#60716F]">Lieu de livraison</span>
              <span className="font-semibold text-[#102A2A] text-right">
                {commune}, {wilaya}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#60716F]">Adresse renseignée</span>
              <span className="font-semibold text-[#102A2A] text-right max-w-[280px]">
                {address}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#60716F]">Mode de règlement</span>
              <span className="font-bold text-[#006B55]">
                {order?.paymentMethodLabel || (order?.paymentMethod === 'CIB' ? 'Carte CIB / Edahabia' : 'Paiement cash à la livraison (COD)')}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-[#E7EFEA] pt-3 text-sm">
              <span className="font-extrabold text-[#102A2A]">
                {order?.paymentMethod === 'CIB' ? 'Montant payé par carte' : 'Montant total en espèces'}
              </span>
              <span className="font-display text-lg font-extrabold text-[#006B55]">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#006B55] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#008F72]"
            >
              <span>Continuer mes achats</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/vendeur/techno-blida"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5E4DE] bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-[#43615C] transition hover:bg-[#F2F8F5]"
            >
              <span>Voir la boutique Techno Blida</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
