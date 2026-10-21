'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
  Headphones,
  CheckCircle2,
} from 'lucide-react'
import { useCart, CartItem } from '@/components/cart-context'

export default function CartPage() {
  const router = useRouter()
  const {
    cartItems,
    updateQuantity: setQuantity,
    removeItem,
    user,
    justMergedCart,
    dismissMergeNotice,
  } = useCart()

  const items = cartItems

  const updateQuantity = (id: string, delta: number) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      setQuantity(id, Math.max(1, item.quantity + delta))
    }
  }

  // Formatting helpers
  const formatPrice = (price?: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '0 DA'
    return price.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
  }

  const subtotal = items.reduce((sum, item) => sum + (item.currentPrice || 0) * item.quantity, 0)
  const totalOld = items.reduce(
    (sum, item) =>
      sum +
      (typeof item.previousPrice === 'number' && !isNaN(item.previousPrice) && item.previousPrice > item.currentPrice
        ? item.previousPrice
        : item.currentPrice || 0) *
        item.quantity,
    0
  )
  const savings = Math.max(0, totalOld - subtotal)
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-[#FAFDFB] min-h-screen text-[#102A2A] pb-16">
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs font-medium text-[#60716F]">
          <Link href="/" className="transition hover:text-[#006B55]">
            Accueil
          </Link>
          <ChevronRight size={13} className="text-[#94A4A0]" />
          <span className="font-semibold text-[#102A2A]">Mon panier</span>
        </nav>

        {/* Page Heading */}
        <div className="mt-4">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.035em] text-[#102A2A]">
            Votre panier
          </h1>

          {/* 3-Step Checkout Indicator */}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
            {/* Step 1: Panier (Active) */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#006B55] px-4 py-1.5 text-white shadow-xs">
              <span className="flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#006B55]">
                1
              </span>
              <span>Panier</span>
            </div>

            <span className="text-[#CADBD5]">―</span>

            {/* Step 2: Livraison (Inactive) */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE8E3] bg-white px-4 py-1.5 text-[#889994]">
              <span className="flex size-4 items-center justify-center rounded-full bg-[#F0F5F2] text-[10px] font-bold text-[#889994]">
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

          {/* Delivery Note */}
          <div className="mt-3.5 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#006B55]">
            <Truck size={17} className="text-[#006B55] shrink-0" />
            <span>Paiement à la livraison disponible partout en Algérie.</span>
          </div>

          {/* Guest Cart Merge Notification */}
          {justMergedCart && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#BBDDD4] bg-[#E7F2EF] p-4 text-xs font-semibold text-[#006B55] shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#006B55]" />
                <span>
                  Votre panier invité a été synchronisé avec succès à votre compte Dzora !
                </span>
              </div>
              <button
                type="button"
                onClick={dismissMergeNotice}
                className="text-xs font-bold underline hover:text-[#005544]"
              >
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* Main Content Layout (Two Columns on Desktop) */}
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] items-start">
          {/* Left Column: Cart Items (approx. 2/3) */}
          <div className="space-y-6">
            <div className="rounded-2xl sm:rounded-3xl border border-[#E3ECE8] bg-white p-5 sm:p-7 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#F0F5F2] pb-4">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#102A2A]">
                  Votre panier ({totalItemsCount} article{totalItemsCount > 1 ? 's' : ''})
                </h2>
                {/* Verified Seller Row */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#60716F]">
                  <span>Vendu par</span>
                  <Link
                    href="/vendeur/techno-blida"
                    className="inline-flex items-center gap-1 font-bold text-[#006B55] hover:underline"
                  >
                    <span>Techno Blida</span>
                    <BadgeCheck size={14} className="text-[#006B55]" />
                  </Link>
                </div>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#60716F]">Votre panier est vide.</p>
                  <Link
                    href="/"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#006B55] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#008F72]"
                  >
                    Découvrir les produits <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#F0F5F2]">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Clean White Thumbnail with Light Border */}
                        <div className="relative size-20 sm:size-24 shrink-0 rounded-xl sm:rounded-2xl border border-[#E3ECE8] bg-white p-2 shadow-2xs flex items-center justify-center overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-full object-contain"
                          />
                        </div>

                        {/* Product Information */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={item.link || `/products/${encodeURIComponent(item.name)}`}
                            className="font-display text-sm sm:text-base font-extrabold text-[#102A2A] hover:text-[#006B55] transition line-clamp-2"
                          >
                            {item.name}
                          </Link>

                          {item.variant && (
                            <p className="mt-1 text-xs font-medium text-[#60716F]">
                              {item.variant}
                            </p>
                          )}
                          {item.description && (
                            <p className="mt-1 text-xs font-medium text-[#60716F]">
                              {item.description}
                            </p>
                          )}

                          {/* Price Row */}
                          <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
                            <span className="text-base sm:text-lg font-extrabold text-[#006B55]">
                              {formatPrice(item.currentPrice)}
                            </span>
                            {typeof item.previousPrice === 'number' && item.previousPrice > item.currentPrice && (
                              <span className="text-xs font-semibold text-[#94A4A0] line-through">
                                {formatPrice(item.previousPrice)}
                              </span>
                            )}
                            {item.discount && (
                              <span className="rounded-md bg-[#E8F5F1] px-1.5 py-0.5 text-[10px] font-bold text-[#006B55]">
                                {item.discount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Remove Controls */}
                      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0">
                        {/* Quantity Control [- 1 +] */}
                        <div className="flex items-center rounded-xl border border-[#D5E4DE] bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            aria-label="Diminuer la quantité"
                            className="grid size-8 place-items-center rounded-l-xl text-[#43615C] transition hover:bg-[#F2F8F5] disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="grid size-8 place-items-center text-xs font-bold text-[#102A2A] select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label="Augmenter la quantité"
                            className="grid size-8 place-items-center rounded-r-xl text-[#43615C] transition hover:bg-[#F2F8F5]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C9E99] transition hover:text-[#C53030]"
                        >
                          <Trash2 size={15} />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Pale-Mint Delivery Information Panel */}
            <div className="rounded-2xl border border-[#D1E6DF] bg-gradient-to-r from-[#E7F2EF] to-[#EDF6F3] p-5 sm:p-6 shadow-xs flex items-start sm:items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#006B55] shadow-xs">
                <Truck size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-[#102A2A]">
                  Livraison partout en Algérie
                </h3>
                <p className="mt-0.5 text-xs font-medium text-[#43615C]">
                  Frais calculés après le choix de l’adresse
                </p>
              </div>
            </div>

            {/* Continue Shopping Link */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#006B55] transition hover:text-[#008F72] hover:underline"
              >
                <ArrowLeft size={16} />
                <span>Continuer mes achats</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary Card (approx. 1/3) */}
          <aside className="sticky top-28 space-y-4">
            <div className="rounded-2xl sm:rounded-3xl border border-[#E3ECE8] bg-white p-6 sm:p-7 shadow-sm">
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#102A2A] pb-4 border-b border-[#F0F5F2]">
                Résumé de la commande
              </h2>

              <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-[#43615C]">
                  <span>Sous-total</span>
                  <span className="font-extrabold text-[#102A2A]">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-[#43615C]">
                  <span>Économies</span>
                  <span className="font-extrabold text-[#006B55]">
                    {savings > 0 ? `−${formatPrice(savings)}` : '0 DA'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#43615C]">
                  <span>Livraison</span>
                  <span className="font-semibold text-[#60716F]">Calculée à l’étape suivante</span>
                </div>
              </div>

              {/* Divider before Total */}
              <div className="my-5 border-t border-[#F0F5F2]" />

              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-[#102A2A]">Total provisoire</span>
                  <p className="text-[11px] font-medium text-[#889994]">Hors frais de livraison</p>
                </div>
                <span className="font-display text-xl sm:text-2xl font-extrabold text-[#102A2A]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                data-open-login={!user ? 'true' : undefined}
                onClick={() => {
                  if (user) {
                    router.push('/commander')
                  } else {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('dzora:open-login', { detail: { tab: 'login' } })
                      )
                    }
                  }
                }}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#006B55] py-3.5 px-6 text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,107,85,0.25)] transition hover:bg-[#008F72] active:scale-[0.99] cursor-pointer"
              >
                <span>Continuer la commande</span>
                <ArrowRight size={16} />
              </button>

              {/* Trust Badge under button */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#43615C]">
                <ShieldCheck size={16} className="text-[#008F72]" />
                <span>Paiement à la livraison disponible</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Horizontal Pale-Mint Trust Strip */}
        <section className="mt-14 rounded-2xl border border-[#D5E6E0] bg-gradient-to-r from-[#E7F2EF] via-[#EDF6F3] to-[#E7F2EF] p-6 sm:p-8 shadow-xs">
          <div className="grid gap-6 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#D0E3DD]">
            {/* Pillar 1 */}
            <div className="flex items-center gap-4 pt-4 first:pt-0 sm:pt-0 sm:px-4 first:pl-0">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#006B55] shadow-xs">
                <Truck size={22} />
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-[#102A2A]">Livraison rapide</h4>
                <p className="text-xs text-[#43615C]">Partout en Algérie</p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#006B55] shadow-xs">
                <ShieldCheck size={22} />
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-[#102A2A]">Paiement à la livraison</h4>
                <p className="text-xs text-[#43615C]">Simple et sécurisé</p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4 last:pr-0">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#006B55] shadow-xs">
                <Headphones size={22} />
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-[#102A2A]">Service client</h4>
                <p className="text-xs text-[#43615C]">Toujours à votre écoute</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
