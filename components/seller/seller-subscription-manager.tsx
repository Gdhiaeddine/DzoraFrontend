'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  Store,
  Download,
  ChevronRight,
  ChevronLeft,
  Truck,
  Globe,
  Sliders,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Zap,
  Check,
  X,
  RefreshCw,
  Percent,
  Layers,
  HelpCircle,
  FileText,
  BadgeCheck,
  Calendar,
  Lock,
} from 'lucide-react'
import { api, SellerSubscriptionDetails } from '@/lib/api'

// ==========================================
// STATIC COMPARATIVE PLANS SPECIFICATIONS
// ==========================================

export interface PublicPlanTier {
  id: 'TRIAL' | 'BASIC' | 'PRO' | 'BUSINESS'
  name: string
  badgeText: string
  monthlyPriceDa: number
  yearlyPriceDa: number
  commissionPercent: number
  maxProducts: number // -1 = illimité
  maxMonthlyOrders: number // -1 = illimité
  maxStaffAccounts: number
  hasLogisticsSync: boolean
  hasMultiPixels: boolean
  hasCustomDomain: boolean
  hasApiAccess: boolean
  supportType: string
  popular?: boolean
}

const COMPARATIVE_PLANS: PublicPlanTier[] = [
  {
    id: 'TRIAL',
    name: 'Free Trial',
    badgeText: 'Essai 14 jours',
    monthlyPriceDa: 0,
    yearlyPriceDa: 0,
    commissionPercent: 8,
    maxProducts: 5,
    maxMonthlyOrders: 20,
    maxStaffAccounts: 1,
    hasLogisticsSync: false,
    hasMultiPixels: false,
    hasCustomDomain: false,
    hasApiAccess: false,
    supportType: 'Centre d’aide standard',
  },
  {
    id: 'BASIC',
    name: 'Basic',
    badgeText: 'Démarrage',
    monthlyPriceDa: 1500,
    yearlyPriceDa: 15000,
    commissionPercent: 6,
    maxProducts: 50,
    maxMonthlyOrders: 100,
    maxStaffAccounts: 1,
    hasLogisticsSync: false,
    hasMultiPixels: false,
    hasCustomDomain: false,
    hasApiAccess: false,
    supportType: 'Support E-mail (48h)',
  },
  {
    id: 'PRO',
    name: 'Pro',
    badgeText: 'Le plus populaire',
    monthlyPriceDa: 3500,
    yearlyPriceDa: 35000,
    commissionPercent: 4,
    maxProducts: 250,
    maxMonthlyOrders: 500,
    maxStaffAccounts: 3,
    hasLogisticsSync: true,
    hasMultiPixels: true,
    hasCustomDomain: false,
    hasApiAccess: false,
    supportType: 'Prioritaire WhatsApp 7j/7',
    popular: true,
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    badgeText: 'Entreprise & Marque',
    monthlyPriceDa: 7500,
    yearlyPriceDa: 75000,
    commissionPercent: 2.5,
    maxProducts: -1,
    maxMonthlyOrders: -1,
    maxStaffAccounts: 10,
    hasLogisticsSync: true,
    hasMultiPixels: true,
    hasCustomDomain: true,
    hasApiAccess: true,
    supportType: 'Account Manager dédié 7j/7',
  },
]

// ==========================================
// SKELETON LOADER
// ==========================================

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-44 w-full bg-white rounded-3xl border border-[#DCE8E3] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-gray-200 rounded-lg" />
          <div className="h-6 w-24 bg-gray-100 rounded-full" />
        </div>
        <div className="h-8 w-36 bg-gray-200 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-[#DCE8E3] p-5 space-y-3">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-6 w-36 bg-gray-200 rounded" />
            <div className="h-2 w-full bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-96 bg-white rounded-2xl border border-[#DCE8E3] p-5 space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-8 w-28 bg-gray-200 rounded" />
            <div className="h-px w-full bg-gray-100" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-full bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function SellerSubscriptionManager({
  storeName,
  onBackToOverview,
}: {
  storeName?: string
  onBackToOverview?: () => void
}) {
  const [subDetails, setSubDetails] = useState<SellerSubscriptionDetails | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [invTotal, setInvTotal] = useState(0)
  const [invPage, setInvPage] = useState(1)
  const [invTotalPages, setInvTotalPages] = useState(1)
  const invLimit = 6

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  // Modal Plan Change
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PublicPlanTier | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CIB / Edahabia' | 'BaridiMob' | 'Virement CCP'>('CIB / Edahabia')
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3500)
  }

  const formatPrice = (val: number) => {
    return (val || 0).toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
  }

  // Fetch subscription details
  const fetchSubscriptionData = useCallback(async () => {
    try {
      const res = await api.seller.getSubscription()
      if (res) {
        setSubDetails(res)
      }
    } catch (err) {
      console.error('Error fetching seller subscription:', err)
    }
  }, [])

  // Fetch invoices with pagination
  const fetchInvoicesData = useCallback(async () => {
    try {
      const res = await api.seller.getInvoices({ page: invPage, limit: invLimit })
      if (res && res.data) {
        setInvoices(res.data)
        setInvTotal(res.meta?.total || 0)
        setInvTotalPages(res.meta?.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching seller invoices:', err)
    }
  }, [invPage])

  // Initial load
  useEffect(() => {
    setIsLoading(true)
    Promise.all([fetchSubscriptionData(), fetchInvoicesData()]).finally(() => {
      setIsLoading(false)
    })
  }, [fetchSubscriptionData, fetchInvoicesData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchSubscriptionData(), fetchInvoicesData()])
    setIsRefreshing(false)
    showToast('Abonnement et quotas actualisés.')
  }

  // Handle Plan Change submit
  const handleConfirmPlanChange = async () => {
    if (!selectedPlanForUpgrade) return
    try {
      setIsSubmittingPlan(true)
      const res = await api.seller.changePlan({
        planId: selectedPlanForUpgrade.id,
        billingCycle,
        paymentMethod: selectedPaymentMethod,
      })

      if (res) {
        setSubDetails(res)
      }

      await fetchInvoicesData()
      setSelectedPlanForUpgrade(null)
      showToast(`Félicitations ! Votre boutique est désormais sur la formule ${selectedPlanForUpgrade.name}.`)
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du changement de plan.')
    } finally {
      setIsSubmittingPlan(false)
    }
  }

  const activePlanId = subDetails?.subscription.planId || 'TRIAL'
  const quotas = subDetails?.quotas || {
    productsUsed: 0,
    productsMax: 50,
    ordersUsed: 0,
    ordersMax: 100,
    staffAccountsMax: 1,
    commissionRate: 0.04,
    remainingDays: 14,
  }

  // Quota percentage calculations
  const productPercent = Math.min(
    100,
    quotas.productsMax === -1
      ? 15
      : Math.round(((quotas.productsUsed || 0) / Math.max(1, quotas.productsMax)) * 100)
  )

  const orderPercent = Math.min(
    100,
    quotas.ordersMax === -1
      ? 20
      : Math.round(((quotas.ordersUsed || 0) / Math.max(1, quotas.ordersMax)) * 100)
  )

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
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

      {/* Top Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#60716F] mb-1">
            {onBackToOverview ? (
              <button
                type="button"
                onClick={onBackToOverview}
                className="hover:text-[#006B55] transition cursor-pointer flex items-center gap-1"
              >
                <span>Tableau de bord</span>
              </button>
            ) : (
              <Link href="/vendeur/dashboard" className="hover:text-[#006B55] transition">
                Tableau de bord
              </Link>
            )}
            <ChevronRight size={12} className="text-[#94A4A0]" />
            <span className="text-[#102A2A] font-semibold">Mon Abonnement Pro</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
              Abonnement & Formules Vendeur
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F2EF] px-2.5 py-0.5 text-xs font-extrabold text-[#006B55]">
              <Sparkles size={13} />
              {subDetails?.plan.name || 'Pro'}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-[#60716F]">
            Gérez votre forfait Dzora, suivez vos quotas de vente en temps réel et téléchargez vos quittances officielles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4] hover:bg-[#d5eae4] transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Rafraîchir les quotas"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          <a
            href="#changer-de-plan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Changer de formule</span>
          </a>
        </div>
      </div>

      {isLoading ? (
        <SubscriptionSkeleton />
      ) : (
        <>
          {/* ========================================================= */}
          {/* 1. HERO CARD : STATUT DE L'ABONNEMENT ACTIF              */}
          {/* ========================================================= */}
          <div className="relative overflow-hidden rounded-3xl border border-[#BBDDD4] bg-gradient-to-br from-[#006B55] to-[#004D3D] p-6 sm:p-8 text-white shadow-xl shadow-[#006B55]/10">
            {/* Background design elements */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-white/5 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 right-32 size-56 rounded-full bg-[#85E1C8]/10 blur-xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white border border-white/25">
                    <Sparkles size={13} className="text-[#85E1C8]" />
                    Formule {subDetails?.plan.name || 'Pro'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#85E1C8]/20 px-3 py-1 text-xs font-bold text-[#85E1C8] border border-[#85E1C8]/30">
                    <CheckCircle2 size={13} />
                    {subDetails?.subscription.status === 'TRIAL' ? 'Période d’évaluation 14j' : 'Abonnement Actif'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                    {subDetails?.plan.priceDa === 0
                      ? 'Gratuit'
                      : formatPrice(subDetails?.plan.priceDa || 3500)}
                  </h2>
                  <span className="text-sm font-semibold text-[#BBDDD4]">
                    / {subDetails?.plan.billingPeriod || 'par mois'}
                  </span>
                </div>

                <p className="text-xs text-[#E7F2EF]/90 max-w-xl leading-relaxed">
                  Boutique : <strong>{storeName || 'Ma Boutique'}</strong>. Votre abonnement vous permet d’exposer jusqu’à{' '}
                  <strong>{quotas.productsMax === -1 ? 'un nombre illimité de' : quotas.productsMax} produits</strong> avec une commission préférentielle réduite à{' '}
                  <strong>{(quotas.commissionRate * 100).toFixed(1)} %</strong>.
                </p>
              </div>

              {/* Renewal Box */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 shrink-0 flex flex-col justify-between space-y-3 min-w-[240px]">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#BBDDD4] font-medium">
                    <span>Prochain renouvellement</span>
                    <Clock size={14} className="text-[#85E1C8]" />
                  </div>
                  <div className="text-xl font-bold font-display text-white mt-1">
                    {subDetails?.subscription.renewalDate
                      ? new Date(subDetails.subscription.renewalDate).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </div>
                  <div className="text-xs font-semibold text-[#85E1C8] mt-0.5">
                    {quotas.remainingDays > 0
                      ? `Dans ${quotas.remainingDays} jour${quotas.remainingDays > 1 ? 's' : ''}`
                      : 'Échéance aujourd’hui'}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 text-[11px] text-[#BBDDD4] flex items-center justify-between">
                  <span>Moyen : {subDetails?.subscription.paymentMethod || 'CIB / Edahabia'}</span>
                  <span className="text-white font-bold">Auto-renouvelé</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. REAL USAGE QUOTA GAUGES                                */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gauge 1: Produits Actifs */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#60716F]">Produits Actifs</span>
                  <span className="text-xs font-extrabold text-[#006B55]">
                    {quotas.productsUsed} / {quotas.productsMax === -1 ? '∞' : quotas.productsMax}
                  </span>
                </div>
                <div className="h-2 w-full bg-[#E5EEEB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006B55] rounded-full transition-all duration-500"
                    style={{ width: `${productPercent}%` }}
                  />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#71827D]">
                {quotas.productsMax === -1
                  ? 'Catalogue illimité inclus dans votre plan'
                  : `${Math.max(0, quotas.productsMax - quotas.productsUsed)} places restantes dans votre catalogue`}
              </p>
            </div>

            {/* Gauge 2: Commandes Mensuelles */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#60716F]">Commandes (Ce mois)</span>
                  <span className="text-xs font-extrabold text-[#006B55]">
                    {quotas.ordersUsed} / {quotas.ordersMax === -1 ? '∞' : quotas.ordersMax}
                  </span>
                </div>
                <div className="h-2 w-full bg-[#E5EEEB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006B55] rounded-full transition-all duration-500"
                    style={{ width: `${orderPercent}%` }}
                  />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#71827D]">
                Réinitialisation du quota de commandes le 1er du mois
              </p>
            </div>

            {/* Gauge 3: Commission Plateforme */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#60716F]">Commission Vente</span>
                  <div className="w-7 h-7 rounded-lg bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                    <Percent size={14} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-[#102A2A] font-display">
                  {(quotas.commissionRate * 100).toFixed(1)} %
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#006B55] font-semibold">
                Taux réduit sur toutes vos ventes marketplace
              </p>
            </div>

            {/* Gauge 4: Comptes Employés */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#60716F]">Comptes Collaborateurs</span>
                  <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Store size={14} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-[#102A2A] font-display">
                  1 / {quotas.staffAccountsMax}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#71827D]">
                Accès pour préparateurs et centre d’appels
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. UNLOCKED PRO FEATURES HUB                              */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAF0ED] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                  Fonctionnalités Débloquées avec Votre Formule
                </h3>
                <p className="text-xs text-[#60716F]">
                  Modules avancés pour automatiser vos livraisons et maximiser vos ventes en Algérie
                </p>
              </div>
              <span className="text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3 py-1 rounded-full border border-[#BBDDD4]">
                Inclus dans {subDetails?.plan.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* Feature 1: Logistics */}
              <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#E7F2EF] text-[#006B55] shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#102A2A]">
                      Sync Yalidine, ZR & Procolis
                    </h4>
                    {subDetails?.features.logisticsSync ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        Actif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.2 rounded-full">
                        Dès Pro
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#60716F] mt-1">
                    Génération automatique des bordereaux d’expédition et suivi des colis 58 wilayas.
                  </p>
                </div>
              </div>

              {/* Feature 2: Pixels */}
              <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#102A2A]">
                      Pixels Meta & TikTok CAPI
                    </h4>
                    {subDetails?.features.multiPixels ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        Actif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.2 rounded-full">
                        Dès Pro
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#60716F] mt-1">
                    Tracking publicitaire côté serveur sans perte de données due aux ad-blockers.
                  </p>
                </div>
              </div>

              {/* Feature 3: Custom Domain */}
              <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#FFF6E7] text-[#D97706] shrink-0">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#102A2A]">
                      Nom de Domaine Personnalisé (.dz)
                    </h4>
                    {subDetails?.features.customDomain ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        Actif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.2 rounded-full">
                        Business
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#60716F] mt-1">
                    Connectez votre propre adresse web (`maboutique.dz`) tout en conservant le moteur Dzora.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. CHANGER DE PLAN : GRILLE COMPARATIVE DES 4 FORMULES    */}
          {/* ========================================================= */}
          <div id="changer-de-plan" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#102A2A] font-display">
                  Choisir une Formule Supérieure
                </h3>
                <p className="text-xs text-[#60716F] mt-0.5">
                  Surclassez votre formule pour étendre vos quotas de vente et débloquer plus d’automatisation
                </p>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="inline-flex items-center p-1 rounded-xl bg-[#E7F2EF] border border-[#BBDDD4] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    billingCycle === 'monthly'
                      ? 'bg-[#006B55] text-white shadow-xs'
                      : 'text-[#4A5D58] hover:text-[#006B55]'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-[#006B55] text-white shadow-xs'
                      : 'text-[#4A5D58] hover:text-[#006B55]'
                  }`}
                >
                  <span>Annuel</span>
                  <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.2 rounded font-extrabold">
                    -16%
                  </span>
                </button>
              </div>
            </div>

            {/* 4 Plans Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COMPARATIVE_PLANS.map((plan) => {
                const isCurrent = activePlanId === plan.id
                const price =
                  billingCycle === 'yearly' && plan.yearlyPriceDa > 0
                    ? Math.round(plan.yearlyPriceDa / 12)
                    : plan.monthlyPriceDa

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl p-5 border flex flex-col justify-between relative transition duration-200 ${
                      isCurrent
                        ? 'border-[#006B55] ring-2 ring-[#006B55]/15 shadow-md'
                        : plan.popular
                        ? 'border-[#006B55]/50 shadow-xs hover:border-[#006B55]'
                        : 'border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4]'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#006B55] text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        Formule Actuelle
                      </span>
                    )}

                    {!isCurrent && plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        Recommandé
                      </span>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-extrabold text-lg text-[#102A2A] font-display">
                          {plan.name}
                        </h4>
                        <span className="text-[11px] font-extrabold text-[#006B55] bg-[#E7F2EF] px-2 py-0.5 rounded-full">
                          {plan.commissionPercent} % com.
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-3xl font-extrabold text-[#102A2A] font-display tracking-tight">
                          {price === 0 ? '0 DA' : formatPrice(price)}
                        </div>
                        <div className="text-xs text-[#71827D] mt-0.5">
                          {billingCycle === 'yearly' && plan.yearlyPriceDa > 0
                            ? `Facturé ${formatPrice(plan.yearlyPriceDa)} / an`
                            : 'par mois'}
                        </div>
                      </div>

                      <hr className="border-[#EAF0ED] mb-4" />

                      {/* Specs Checklist */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-[#006B55] shrink-0" />
                          <span className="text-[#102A2A]">
                            <strong>{plan.maxProducts === -1 ? 'Illimités' : plan.maxProducts}</strong> produits actifs
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-[#006B55] shrink-0" />
                          <span className="text-[#102A2A]">
                            <strong>{plan.maxMonthlyOrders === -1 ? 'Illimitées' : plan.maxMonthlyOrders}</strong> commandes/mois
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-[#006B55] shrink-0" />
                          <span className="text-[#102A2A]">
                            <strong>{plan.maxStaffAccounts}</strong> compte{plan.maxStaffAccounts > 1 ? 's' : ''} employé
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.hasLogisticsSync ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.hasLogisticsSync ? 'text-[#102A2A] font-semibold' : 'text-[#71827D]'}>
                            Sync Yalidine / ZR / Procolis
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.hasMultiPixels ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.hasMultiPixels ? 'text-[#102A2A]' : 'text-[#71827D]'}>
                            Pixels Meta & TikTok CAPI
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.hasCustomDomain ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.hasCustomDomain ? 'text-[#102A2A] font-semibold' : 'text-[#71827D]'}>
                            Nom de domaine personnalisé (.dz)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-[#F4FAF7]">
                          <span className="text-[#71827D] text-[11px]">{plan.supportType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action CTA Button */}
                    <div className="mt-6 pt-3 border-t border-[#EAF0ED]">
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 px-3 rounded-xl bg-[#E7F2EF] text-[#006B55] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <CheckCircle2 size={14} />
                          <span>Formule Actuelle</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedPlanForUpgrade(plan)}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                            plan.popular
                              ? 'bg-[#006B55] text-white hover:bg-[#005544]'
                              : 'bg-white border border-[#006B55] text-[#006B55] hover:bg-[#E7F2EF]'
                          }`}
                        >
                          <span>{plan.monthlyPriceDa > (subDetails?.plan.priceDa || 0) ? 'Passer à' : 'Choisir'} {plan.name}</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. HISTORIQUE DES FACTURES & QUITTANCES                   */}
          {/* ========================================================= */}
          <div className="space-y-4 pt-4">
            <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#DCE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                    Historique des Règlements & Quittances
                  </h3>
                  <p className="text-xs text-[#60716F]">
                    Retrouvez l’ensemble de vos factures d’abonnement Dzora Marketplace ({invTotal} règlements)
                  </p>
                </div>
              </div>

              {invoices.length === 0 ? (
                <div className="p-12 text-center text-xs space-y-2">
                  <FileText className="mx-auto h-10 w-10 text-[#9CAFA9] mb-2" />
                  <p className="font-bold text-[#102A2A] text-sm">
                    Aucune facture enregistrée pour le moment
                  </p>
                  <p className="text-[#60716F] max-w-sm mx-auto">
                    Vos quittances officielles et justificatifs de paiement apparaîtront ici lors de vos renouvellements.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8FAF9] text-[#60716F] font-bold border-b border-[#DCE8E3] text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">N° Quittance</th>
                        <th className="py-3 px-4">Formule</th>
                        <th className="py-3 px-4">Date de Facturation</th>
                        <th className="py-3 px-4">Montant Réglé</th>
                        <th className="py-3 px-4">Mode de Paiement</th>
                        <th className="py-3 px-4">Statut</th>
                        <th className="py-3 px-4 text-right">Justificatif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAF0ED]">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#F4FAF7]/60 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#102A2A]">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#006B55]">
                            {inv.planId}
                          </td>
                          <td className="py-3.5 px-4 text-[#60716F]">
                            {inv.createdAt
                              ? new Date(inv.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-[#102A2A]">
                            {formatPrice(inv.amountDa)}
                          </td>
                          <td className="py-3.5 px-4 text-[#60716F]">
                            {inv.paymentMethod}
                          </td>
                          <td className="py-3.5 px-4">
                            {inv.status === 'PAID' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                                <CheckCircle2 size={12} className="text-[#006B55]" />
                                Payé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                                <Clock size={12} className="text-[#D97706]" />
                                En attente
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => showToast(`Téléchargement de la quittance ${inv.invoiceNumber}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#DCE8E3] bg-[#F7FAF9] hover:bg-[#E7F2EF] text-[#006B55] font-bold text-[11px] transition cursor-pointer"
                            >
                              <Download size={12} />
                              <span>Reçu</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Invoices Pagination */}
              {invTotalPages > 1 && (
                <div className="p-4 border-t border-[#DCE8E3] bg-[#F8FAF9] flex items-center justify-between text-xs">
                  <div className="text-[#60716F]">
                    Page <strong className="text-[#102A2A]">{invPage}</strong> sur{' '}
                    <strong className="text-[#102A2A]">{invTotalPages}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInvPage((p) => Math.max(p - 1, 1))}
                      disabled={invPage <= 1}
                      className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] disabled:opacity-40 transition"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvPage((p) => Math.min(p + 1, invTotalPages))}
                      disabled={invPage >= invTotalPages}
                      className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] disabled:opacity-40 transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* MODAL : CONFIRMATION CHANGEMENT DE PLAN                   */}
      {/* ========================================================= */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE8E3] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE8E3]">
              <div>
                <h3 className="text-base font-extrabold text-[#102A2A] font-display tracking-tight">
                  Passer à la formule : {selectedPlanForUpgrade.name}
                </h3>
                <p className="text-xs text-[#60716F] mt-0.5">
                  Vos nouveaux quotas et fonctionnalités seront appliqués immédiatement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="p-1.5 rounded-lg text-[#71827D] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              {/* Plan Recap Box */}
              <div className="p-4 rounded-2xl bg-[#E7F2EF]/60 border border-[#BBDDD4] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#006B55] uppercase tracking-wider">
                    Montant de l’abonnement
                  </span>
                  <div className="text-2xl font-extrabold text-[#102A2A] font-display mt-0.5">
                    {billingCycle === 'yearly' && selectedPlanForUpgrade.yearlyPriceDa > 0
                      ? formatPrice(selectedPlanForUpgrade.yearlyPriceDa)
                      : formatPrice(selectedPlanForUpgrade.monthlyPriceDa)}
                    <span className="text-xs font-normal text-[#60716F]">
                      {' '}/ {billingCycle === 'yearly' ? 'an (-16%)' : 'mois'}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#006B55] text-white">
                  Commission {selectedPlanForUpgrade.commissionPercent} %
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-[#102A2A] mb-2">
                  Sélectionnez votre mode de règlement :
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'CIB / Edahabia' as const,
                      title: 'Carte CIB / Edahabia (Satim)',
                      sub: 'Activation immédiate et sécurisée en temps réel',
                      icon: CreditCard,
                    },
                    {
                      id: 'BaridiMob' as const,
                      title: 'Application BaridiMob',
                      sub: 'Règlement par virement direct RIP Algérie Poste',
                      icon: Zap,
                    },
                    {
                      id: 'Virement CCP' as const,
                      title: 'Virement CCP ou Versement Bancaire',
                      sub: 'Validation manuelle sous 24h ouvrées par Dzora',
                      icon: FileText,
                    },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        selectedPaymentMethod === m.id
                          ? 'border-[#006B55] bg-[#E7F2EF]/40 ring-1 ring-[#006B55]'
                          : 'border-[#DCE8E3] hover:bg-[#F4FAF7]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod === m.id}
                        onChange={() => setSelectedPaymentMethod(m.id)}
                        className="mt-0.5 text-[#006B55] focus:ring-[#006B55]"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-[#102A2A] flex items-center gap-1.5">
                          <m.icon size={13} className="text-[#006B55]" />
                          <span>{m.title}</span>
                        </div>
                        <p className="text-[11px] text-[#60716F] mt-0.5">{m.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#DCE8E3]">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForUpgrade(null)}
                  disabled={isSubmittingPlan}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE8E3] text-[#60716F] font-bold hover:bg-[#F4FAF7] transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPlanChange}
                  disabled={isSubmittingPlan}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold hover:bg-[#005544] shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPlan ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Activation en cours…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirmer et Activer la formule</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
