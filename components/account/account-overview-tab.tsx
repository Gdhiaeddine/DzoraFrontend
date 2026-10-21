'use client'

import React from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  CreditCard,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Package,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

import { ClientOrder } from '@/lib/client-account'

interface AccountOverviewTabProps {
  fullName: string
  maskedPhone: string
  maskedEmail: string
  wilaya?: string
  commune?: string
  twoFactorActive?: boolean
  favoritesCount?: number
  ordersCount?: number
  activeOrdersCount?: number
  lastOrder?: ClientOrder | null
  paymentMethodTitle?: string
  paymentMethodSubtitle?: string
  onNavigateTab: (tabSlug: string) => void
}

export function AccountOverviewTab({
  fullName,
  maskedPhone,
  maskedEmail,
  wilaya,
  commune,
  twoFactorActive = true,
  favoritesCount = 0,
  ordersCount = 0,
  activeOrdersCount = 0,
  lastOrder = null,
  paymentMethodTitle = 'Cash (COD)',
  paymentMethodSubtitle = 'Paiement à la livraison',
  onNavigateTab,
}: AccountOverviewTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Commandes en cours */}
        <div
          onClick={() => onNavigateTab('commandes')}
          className="bg-white rounded-2xl border border-[#DCE8E3] p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)] hover:border-[#BBDDD4] hover:shadow-xs transition duration-150 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#60716F]">Commandes</span>
            <div className="size-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-[#102A2A]">
              {activeOrdersCount} en cours
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-[#006B55]">
              <span>
                {ordersCount > 0
                  ? `${ordersCount} commande${ordersCount > 1 ? 's' : ''} au total`
                  : 'Historique & suivi'}
              </span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: Paiements & Solde */}
        <div
          onClick={() => onNavigateTab('paiements')}
          className="bg-white rounded-2xl border border-[#DCE8E3] p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)] hover:border-[#BBDDD4] hover:shadow-xs transition duration-150 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#60716F]">Mode de paiement</span>
            <div className="size-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-[#102A2A] truncate" title={paymentMethodTitle}>
              {paymentMethodTitle}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-[#006B55]">
              <span className="truncate max-w-[180px]">{paymentMethodSubtitle}</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>
        </div>

        {/* Card 3: Adresses de livraison */}
        <div
          onClick={() => onNavigateTab('adresses')}
          className="bg-white rounded-2xl border border-[#DCE8E3] p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)] hover:border-[#BBDDD4] hover:shadow-xs transition duration-150 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#60716F]">Adresse principale</span>
            <div className="size-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-[#102A2A] truncate" title={wilaya || 'Non renseignée'}>
              {wilaya || 'Non renseignée'}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-[#006B55]">
              <span className="truncate max-w-[160px]">
                {commune ? commune : wilaya ? 'Gérer mes adresses' : 'Définir mon adresse'}
              </span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Dernières activités & Profil résumé */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3): Statut des commandes récentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DCE8E3] p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8F0ED] mb-4">
            <div>
              <h3 className="font-display font-extrabold text-base text-[#102A2A]">
                Dernière commande
              </h3>
              <p className="text-xs text-[#60716F] mt-0.5">
                Suivez en temps réel la préparation et l’expédition de vos colis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('commandes')}
              className="text-xs font-bold text-[#006B55] hover:underline cursor-pointer"
            >
              Toutes les commandes →
            </button>
          </div>

          {lastOrder ? (
            <div className="p-4 sm:p-5 bg-[#FAFDFB] rounded-xl border border-[#E5EEEB] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8F0ED]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#E7F2EF] text-[#006B55] text-xs font-black font-mono">
                    #{lastOrder.orderId}
                  </span>
                  <span className="text-xs text-[#60716F] font-medium">{lastOrder.date}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                  <span className="size-1.5 rounded-full bg-[#006B55] animate-pulse" />
                  {lastOrder.statusLabel || 'En cours de préparation'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-[#71827D] block">Destination</span>
                  <span className="font-bold text-[#102A2A]">
                    {lastOrder.wilaya}{lastOrder.commune ? ` (${lastOrder.commune})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#71827D] block">Livraison</span>
                  <span className="font-bold text-[#102A2A]">{lastOrder.deliveryType || 'À domicile'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#71827D] block">Montant</span>
                  <span className="font-black text-[#006B55] text-sm">
                    {lastOrder.totalAmount?.toLocaleString('fr-FR')} DA
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onNavigateTab('commandes')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] hover:text-[#005544] transition cursor-pointer"
                >
                  <span>Voir le suivi complet</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3 bg-[#FAFDFB] rounded-xl border border-[#E5EEEB]">
              <div className="size-12 rounded-2xl bg-[#E7F2EF] text-[#006B55] mx-auto flex items-center justify-center">
                <Package size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#102A2A]">
                  Aucune commande récente en cours
                </h4>
                <p className="text-xs text-[#71827D] max-w-sm mx-auto mt-1">
                  Explorez le catalogue Dzora et profitez de milliers de produits disponibles en livraison express dans 58 wilayas.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs"
                >
                  <span>Découvrir les produits</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite (1/3): Résumé Sécurité & Raccourci Paramètres */}
        <div className="bg-white rounded-2xl border border-[#DCE8E3] p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)] flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#E8F0ED] mb-4">
              <h3 className="font-display font-extrabold text-base text-[#102A2A]">
                Sécurité du compte
              </h3>
              <p className="text-xs text-[#60716F] mt-0.5">
                Niveau de protection de vos accès.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                <span className="font-semibold text-[#60716F]">Double facteur (2FA)</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#006B55] bg-[#E7F2EF] px-2 py-0.5 rounded-full text-[10.5px]">
                  <span className="size-1.5 rounded-full bg-[#006B55]" />
                  {twoFactorActive ? 'Activé' : 'Désactivé'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                <span className="font-semibold text-[#60716F]">Téléphone lié</span>
                <span className="font-mono font-bold text-[#102A2A]">
                  {maskedPhone}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                <span className="font-semibold text-[#60716F]">Adresse e-mail</span>
                <span className="font-mono font-medium text-[#102A2A]">
                  {maskedEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E8F0ED]">
            <button
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F0F7F4] hover:bg-[#E2F0EA] border border-[#BBDDD4] text-[#006B55] text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>Accéder aux paramètres complets</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Reassurance & Bannière service client */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#004D3D] to-[#006B55] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-[#85E1C8]" />
          </div>
          <div>
            <div className="text-sm font-extrabold font-display">
              Besoin d’aide pour une commande ou un retour ?
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Notre équipe d’assistance clientèle en Algérie est joignable 7j/7.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('support')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-[#006B55] hover:bg-[#F4FAF7] text-xs font-bold transition shrink-0 cursor-pointer"
        >
          Contacter le support
        </button>
      </div>
    </div>
  )
}
