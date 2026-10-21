'use client'

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Receipt,
  Store,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit3,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Download,
  Check,
  X,
  Calendar,
  Building2,
  MapPin,
  Settings2,
  HelpCircle,
  AlertCircle,
  Truck,
  Globe,
  Sliders,
  DollarSign,
  Package,
  ShoppingBag,
} from 'lucide-react'
import { api } from '@/lib/api'
import { wilayasData } from '@/lib/wilayas'

// ==========================================
// TYPES
// ==========================================

export type SubscriptionTier = 'TRIAL' | 'BASIC' | 'PRO' | 'BUSINESS'

export interface PlanConfig {
  id: string
  name: string
  badgeText: string
  priceDa: number
  billingPeriod: string
  commissionRate: number
  maxProducts: number
  maxMonthlyOrders: number
  maxStaffAccounts: number
  customizationLevel: string
  advancedStats: boolean
  csvImportExport: boolean
  couponsLevel: string
  apiAccess: boolean
  supportType: string
  logisticsSync: boolean
  customDomain: boolean
  multiPixels: boolean
  popular?: boolean
}

export interface SubscriptionStats {
  mrr: number
  paidSellersCount: number
  trialSellersCount: number
  totalSubscriptions: number
  averageCommission: number
  breakdown: Record<string, number>
}

// ==========================================
// SKELETON LOADERS
// ==========================================

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-3 w-28 bg-gray-200 rounded-md" />
            <div className="w-8 h-8 rounded-xl bg-gray-100" />
          </div>
          <div>
            <div className="h-7 w-36 bg-gray-200 rounded-md mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ rows = 6, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden animate-pulse">
      <div className="p-4 border-b border-[#DCE8E3] bg-[#F8FAF9]">
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
      <div className="divide-y divide-[#EAF0ED]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-xl bg-gray-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-32 bg-gray-200 rounded" />
                <div className="h-2.5 w-24 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-6 w-24 bg-gray-100 rounded-full" />
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-7 w-16 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

function AbonnementsContent() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as 'overview' | 'plans' | 'transactions') || 'overview'

  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'transactions'>(initialTab)

  // Real Data States from DB
  const [stats, setStats] = useState<SubscriptionStats>({
    mrr: 0,
    paidSellersCount: 0,
    trialSellersCount: 0,
    totalSubscriptions: 0,
    averageCommission: 4.3,
    breakdown: { TRIAL: 0, BASIC: 0, PRO: 0, BUSINESS: 0 },
  })
  const [plans, setPlans] = useState<PlanConfig[]>([])
  
  // Subscriptions Table State
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [subTotal, setSubTotal] = useState(0)
  const [subPage, setSubPage] = useState(1)
  const [subTotalPages, setSubTotalPages] = useState(1)
  const subLimit = 8

  // Invoices Table State
  const [invoices, setInvoices] = useState<any[]>([])
  const [invTotal, setInvTotal] = useState(0)
  const [invPage, setInvPage] = useState(1)
  const [invTotalPages, setInvTotalPages] = useState(1)
  const invLimit = 8

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL')
  const [selectedWilaya, setSelectedWilaya] = useState<string>('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL')

  // Loading States
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingSubs, setIsLoadingSubs] = useState(true)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals state
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null)
  const [selectedSubForEdit, setSelectedSubForEdit] = useState<any | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'plans', 'transactions'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
  }, [searchParams])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setSubPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3500)
  }

  // Format Algerian Dinars
  const formatPrice = (val: number) => {
    return (val || 0).toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
  }

  // 1. Fetch Real Stats
  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true)
      const res = await api.admin.getSubscriptionStats()
      if (res) {
        setStats(res)
      }
    } catch (err) {
      console.error('Error fetching subscription stats:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // 2. Fetch Real Plans
  const fetchPlans = useCallback(async () => {
    try {
      setIsLoadingPlans(true)
      const res = await api.admin.getSubscriptionPlans()
      if (res && Array.isArray(res)) {
        setPlans(res)
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
    } finally {
      setIsLoadingPlans(false)
    }
  }, [])

  // 3. Fetch Real Subscriptions with pagination & filters
  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoadingSubs(true)
      const res = await api.admin.listSubscriptions({
        page: subPage,
        limit: subLimit,
        search: debouncedSearch,
        tier: selectedTierFilter,
        status: selectedStatusFilter,
        wilaya: selectedWilaya,
      })
      if (res && res.data) {
        setSubscriptions(res.data)
        setSubTotal(res.meta?.total || 0)
        setSubTotalPages(res.meta?.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
    } finally {
      setIsLoadingSubs(false)
    }
  }, [subPage, debouncedSearch, selectedTierFilter, selectedStatusFilter, selectedWilaya])

  // 4. Fetch Real Invoices with pagination
  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoadingInvoices(true)
      const res = await api.admin.listSubscriptionInvoices({
        page: invPage,
        limit: invLimit,
      })
      if (res && res.data) {
        setInvoices(res.data)
        setInvTotal(res.meta?.total || 0)
        setInvTotalPages(res.meta?.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching subscription invoices:', err)
    } finally {
      setIsLoadingInvoices(false)
    }
  }, [invPage])

  // Initial load
  useEffect(() => {
    fetchStats()
    fetchPlans()
  }, [fetchStats, fetchPlans])

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchSubscriptions()
    } else if (activeTab === 'transactions') {
      fetchInvoices()
    }
  }, [activeTab, fetchSubscriptions, fetchInvoices])

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchStats(), fetchPlans(), fetchSubscriptions(), fetchInvoices()])
    setIsRefreshing(false)
    showToast('Données synchronisées avec la base de données.')
  }

  // Handle plan edit submit to backend
  const handleSavePlan = async (updated: PlanConfig) => {
    try {
      await api.admin.updateSubscriptionPlan(updated.id, updated)
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setEditingPlan(null)
      fetchStats()
      showToast(`Formule ${updated.name} mise à jour en base de données.`)
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour de la formule.')
    }
  }

  // Handle quick seller plan change in DB
  const handleUpdateSellerTier = async (subId: string, newTier: SubscriptionTier, extendDays?: number) => {
    try {
      await api.admin.updateSellerSubscription(subId, {
        tier: newTier,
        extendTrialDays: extendDays,
      })
      setSelectedSubForEdit(null)
      fetchSubscriptions()
      fetchStats()
      showToast(
        extendDays
          ? `Essai gratuit prolongé de ${extendDays} jours.`
          : `Plan mis à jour vers ${newTier} avec succès.`
      )
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du vendeur.')
    }
  }

  // Helper tier badge renderer
  const renderTierBadge = (tier: string) => {
    switch (tier) {
      case 'TRIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            <Clock size={12} className="text-[#475569]" />
            Free Trial (14j)
          </span>
        )
      case 'BASIC':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Store size={12} className="text-[#2563EB]" />
            Basic (1 500 DA)
          </span>
        )
      case 'PRO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
            <Sparkles size={12} className="text-[#006B55]" />
            Pro (3 500 DA)
          </span>
        )
      case 'BUSINESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
            <Zap size={12} className="text-[#D97706]" />
            Business (7 500 DA)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
            {tier}
          </span>
        )
    }
  }

  // Export CSV Handler
  const handleExportCSV = () => {
    if (subscriptions.length === 0) {
      showToast('Aucune souscription à exporter.')
      return
    }

    const headers = [
      'Boutique',
      'Vendeur',
      'Wilaya',
      'Formule',
      'Statut',
      'Commandes ce mois',
      'Date renouvellement',
      'Moyen de règlement',
    ]

    const rows = subscriptions.map((s) => [
      `"${s.storeName}"`,
      `"${s.sellerName}"`,
      `"${s.wilaya}"`,
      s.tier,
      s.status,
      s.ordersCountThisMonth,
      `"${new Date(s.renewalDate).toLocaleDateString('fr-FR')}"`,
      `"${s.paymentMethod}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `dzora-abonnements-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast(`${subscriptions.length} souscriptions exportées au format CSV.`)
  }

  return (
    <>
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

      {/* --- Main Dashboard Content Area (Full Width) --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        {/* Main Heading & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#60716F] mb-1">
              <Link href="/admin/dashboard" className="hover:text-[#006B55] transition">
                Tableau de bord
              </Link>
              <ChevronRight size={12} className="text-[#94A4A0]" />
              <span className="text-[#102A2A] font-semibold">Abonnements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
              Gestion des Abonnements
            </h1>
            <p className="text-xs font-medium text-[#60716F] mt-0.5">
              Supervision des formules tarifaires, suivi des revenus récurrents (MRR) et quotas vendeurs Dzora
            </p>
          </div>

          {/* Quick stats pills & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4]">
              <Receipt size={14} />
              <span>
                {plans.length} formules · {stats.totalSubscriptions} abonnements réels
              </span>
            </span>

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="p-2 text-[#4A5D58] hover:text-[#006B55] hover:bg-white rounded-xl border border-[#DCE8E3] transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Rafraîchir les données de la base"
              aria-label="Rafraîchir les données"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-[#006B55]' : ''} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 1: REAL KPIS CARDS (Full Width 4 Cols)                */}
        {/* ========================================================= */}
        {isLoadingStats ? (
          <KpiSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Revenu Récurrent MRR */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#60716F]">Revenu Récurrent (MRR)</span>
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                  {formatPrice(stats.mrr)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                  <ArrowUpRight size={13} />
                  <span>Calculé en temps réel depuis les souscriptions</span>
                </div>
              </div>
            </div>

            {/* Card 2: Vendeurs Payants */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#60716F]">Vendeurs Payants</span>
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Store className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                  {stats.paidSellersCount}
                </div>
                <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                  Basic ({stats.breakdown?.BASIC || 0}) · Pro ({stats.breakdown?.PRO || 0}) · Business ({stats.breakdown?.BUSINESS || 0})
                </p>
              </div>
            </div>

            {/* Card 3: En Période d'Essai (Trial) */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#60716F]">En Essai (Trial 14j)</span>
                <div className="w-8 h-8 rounded-xl bg-[#FFF6E7] text-[#D97706] flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#D97706] font-display tracking-[-0.035em]">
                  {stats.trialSellersCount}
                </div>
                <p className="mt-1 text-[11px] font-semibold text-amber-700">
                  {stats.totalSubscriptions > 0
                    ? `${Math.round((stats.trialSellersCount / stats.totalSubscriptions) * 100)} % du parc de vendeurs`
                    : 'En cours d’évaluation'}
                </p>
              </div>
            </div>

            {/* Card 4: Commission Plateforme Moyenne */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#60716F]">Commission Moyenne</span>
                <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                  {stats.averageCommission} %
                </div>
                <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                  Moyenne pondérée des formules actives
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ROW 2: SECTION NAVIGATION TABS                            */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-2 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)]">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]'
                  : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <Users size={14} />
              <span>Souscriptions Vendeurs</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                  activeTab === 'overview' ? 'bg-[#006B55] text-white' : 'bg-[#E5EEEB] text-[#4A5D58]'
                }`}
              >
                {subTotal}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]'
                  : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <Sliders size={14} />
              <span>Configuration des 4 Formules</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                  activeTab === 'plans' ? 'bg-[#006B55] text-white' : 'bg-[#E5EEEB] text-[#4A5D58]'
                }`}
              >
                {plans.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]'
                  : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <Receipt size={14} />
              <span>Règlements & Factures</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                  activeTab === 'transactions' ? 'bg-[#006B55] text-white' : 'bg-[#E5EEEB] text-[#4A5D58]'
                }`}
              >
                {invTotal}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SOUSCRIPTIONS VENDEURS (REAL DATA + PAGINATION)    */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Search & Multi-Filters Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search Input */}
                <div className="relative min-w-[240px] max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A4A0] pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par boutique, vendeur, wilaya…"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] placeholder:text-[#71827D] focus:bg-white focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label="Effacer la recherche"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Plan Tier Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-[#60716F]">Formule :</span>
                  <select
                    value={selectedTierFilter}
                    onChange={(e) => {
                      setSelectedTierFilter(e.target.value)
                      setSubPage(1)
                    }}
                    className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    <option value="ALL">Toutes les formules</option>
                    <option value="TRIAL">Free Trial</option>
                    <option value="BASIC">Basic</option>
                    <option value="PRO">Pro</option>
                    <option value="BUSINESS">Business</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-[#60716F]">Statut :</span>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => {
                      setSelectedStatusFilter(e.target.value)
                      setSubPage(1)
                    }}
                    className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="TRIAL">En essai</option>
                    <option value="EXPIRING_SOON">Échéance proche</option>
                    <option value="PAST_DUE">En retard</option>
                  </select>
                </div>

                {/* Wilaya Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-[#60716F]">Wilaya :</span>
                  <select
                    value={selectedWilaya}
                    onChange={(e) => {
                      setSelectedWilaya(e.target.value)
                      setSubPage(1)
                    }}
                    className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer max-w-[150px]"
                  >
                    <option value="ALL">Toutes (58)</option>
                    {wilayasData.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.name.replace(/^\d+\s*-\s*/, '')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear filters button */}
                {(searchQuery || selectedTierFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedWilaya !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedTierFilter('ALL')
                      setSelectedStatusFilter('ALL')
                      setSelectedWilaya('ALL')
                      setSubPage(1)
                    }}
                    className="text-xs font-bold text-[#006B55] hover:underline px-2 py-1 cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Subscriptions Table */}
            {isLoadingSubs ? (
              <TableSkeleton rows={subLimit} />
            ) : subscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#DCE8E3] p-12 text-center shadow-[0_2px_10px_rgba(16,42,42,0.03)]">
                <Receipt className="mx-auto h-12 w-12 text-[#9CAFA9] mb-3" />
                <h3 className="text-sm font-bold text-[#102A2A]">Aucune souscription trouvée</h3>
                <p className="text-xs text-[#60716F] mt-1 max-w-sm mx-auto">
                  Aucun vendeur ne correspond à vos critères de recherche actuels.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8FAF9] text-[#60716F] font-bold border-b border-[#DCE8E3] text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">Boutique & Vendeur</th>
                        <th className="py-3 px-4">Formule Active</th>
                        <th className="py-3 px-4">Statut</th>
                        <th className="py-3 px-4">Commandes / Quota</th>
                        <th className="py-3 px-4">Plafond Produits</th>
                        <th className="py-3 px-4">Prochain Règlement</th>
                        <th className="py-3 px-4">Moyen de règlement</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAF0ED]">
                      {subscriptions.map((sub) => {
                        const planInfo = sub.plan || plans.find((p) => p.id === sub.tier)
                        return (
                          <tr key={sub.id} className="hover:bg-[#F4FAF7]/60 transition">
                            {/* Boutique */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center font-extrabold text-xs shrink-0 border border-[#BBDDD4]">
                                  {sub.storeName?.charAt(0) || 'D'}
                                </div>
                                <div>
                                  <div className="font-bold text-[#102A2A] flex items-center gap-1.5">
                                    <span>{sub.storeName}</span>
                                    <Link
                                      href={`/vendeur/${sub.slug}`}
                                      target="_blank"
                                      className="text-[#94A4A0] hover:text-[#006B55] transition"
                                      title="Voir vitrine publique"
                                    >
                                      <ExternalLink size={12} />
                                    </Link>
                                  </div>
                                  <div className="text-[11px] text-[#60716F] mt-0.5">
                                    {sub.sellerName} · {sub.wilaya}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Tier */}
                            <td className="py-3.5 px-4">
                              {renderTierBadge(sub.tier)}
                              {planInfo && (
                                <div className="text-[10.5px] font-medium text-[#71827D] mt-1">
                                  Commission : {(planInfo.commissionRate * 100).toFixed(1)} %
                                </div>
                              )}
                            </td>

                            {/* Statut */}
                            <td className="py-3.5 px-4">
                              {sub.status === 'ACTIVE' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#006B55]" />
                                  Actif
                                </span>
                              )}
                              {sub.status === 'TRIAL' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                                  Essai
                                </span>
                              )}
                              {sub.status === 'EXPIRING_SOON' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]">
                                  <AlertTriangle size={12} className="text-[#B45309]" />
                                  Échéance proche
                                </span>
                              )}
                              {sub.status === 'PAST_DUE' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                                  <AlertCircle size={12} className="text-[#DC2626]" />
                                  En retard
                                </span>
                              )}
                            </td>

                            {/* Commandes / Quota */}
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-[#102A2A]">
                                {sub.ordersCountThisMonth || 0}
                              </span>
                              <span className="text-[11px] text-[#71827D] font-medium">
                                {' '}
                                / {planInfo?.maxMonthlyOrders === -1 ? 'Illimitées' : (planInfo?.maxMonthlyOrders || '—')}
                              </span>
                            </td>

                            {/* Plafond Produits */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-[#102A2A]">
                                {planInfo?.maxProducts === -1 ? 'Illimités' : (planInfo?.maxProducts || '—')}
                              </span>
                              <span className="text-[11px] text-[#71827D]"> max</span>
                            </td>

                            {/* Date de renouvellement */}
                            <td className="py-3.5 px-4 text-[#102A2A] font-medium">
                              {sub.renewalDate
                                ? new Date(sub.renewalDate).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>

                            {/* Moyen de règlement */}
                            <td className="py-3.5 px-4 text-[#60716F] font-medium">
                              {sub.paymentMethod}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedSubForEdit(sub)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E7F2EF] text-[#006B55] hover:bg-[#d5eae4] text-xs font-bold transition cursor-pointer"
                              >
                                <Edit3 size={13} />
                                <span>Gérer</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Subscriptions Pagination Footer */}
                <div className="p-4 border-t border-[#DCE8E3] bg-[#F8FAF9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-[#60716F]">
                    Affichage de{' '}
                    <strong className="text-[#102A2A]">
                      {Math.min((subPage - 1) * subLimit + 1, subTotal)}
                    </strong>{' '}
                    à{' '}
                    <strong className="text-[#102A2A]">
                      {Math.min(subPage * subLimit, subTotal)}
                    </strong>{' '}
                    sur <strong className="text-[#102A2A]">{subTotal}</strong> souscriptions
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSubPage((p) => Math.max(p - 1, 1))}
                      disabled={subPage <= 1}
                      className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Page précédente"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: subTotalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSubPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          subPage === p
                            ? 'bg-[#006B55] text-white shadow-xs'
                            : 'bg-white border border-[#DCE8E3] text-[#4A5D58] hover:bg-[#F4FAF7]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setSubPage((p) => Math.min(p + 1, subTotalPages))}
                      disabled={subPage >= subTotalPages}
                      className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Page suivante"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CONFIGURATION DES 4 FORMULES (DATABASE PLANS)      */}
        {/* ========================================================= */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center shrink-0">
                  <Sliders size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#102A2A] font-display">
                    Grille Tarifaire Stockée en Base de Données
                  </h2>
                  <p className="text-xs text-[#60716F]">
                    Les modifications apportées ici sont directement répercutées sur la plateforme Dzora et les règles d’abonnement.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRefreshAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs cursor-pointer"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Actualiser depuis la BD</span>
              </button>
            </div>

            {/* 4 Cards Grid */}
            {isLoadingPlans ? (
              <KpiSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl p-5 border ${
                      plan.popular ? 'border-[#006B55] ring-2 ring-[#006B55]/15' : 'border-[#DCE8E3]'
                    } shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between relative hover:border-[#BBDDD4] transition duration-200`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#006B55] text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        Recommandé
                      </span>
                    )}

                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-extrabold text-lg text-[#102A2A] font-display tracking-tight">
                          {plan.name}
                        </h3>
                        {renderTierBadge(plan.id)}
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-3xl font-extrabold text-[#102A2A] font-display tracking-tight">
                          {plan.priceDa === 0 ? '0 DA' : formatPrice(plan.priceDa)}
                        </div>
                        <div className="text-xs text-[#71827D] font-medium mt-0.5">
                          {plan.billingPeriod}
                        </div>
                      </div>

                      <hr className="border-[#EAF0ED] mb-4" />

                      {/* Quotas Specs */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-[#F4FAF7]">
                          <span className="text-[#60716F]">Commission vente :</span>
                          <span className="font-extrabold text-[#006B55]">
                            {(plan.commissionRate * 100).toFixed(1)} %
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-[#F4FAF7]">
                          <span className="text-[#60716F]">Produits actifs :</span>
                          <span className="font-bold text-[#102A2A]">
                            {plan.maxProducts === -1 ? 'Illimités' : plan.maxProducts}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-[#F4FAF7]">
                          <span className="text-[#60716F]">Commandes/mois :</span>
                          <span className="font-bold text-[#102A2A]">
                            {plan.maxMonthlyOrders === -1 ? 'Illimitées' : plan.maxMonthlyOrders}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-[#F4FAF7]">
                          <span className="text-[#60716F]">Comptes employés :</span>
                          <span className="font-bold text-[#102A2A]">{plan.maxStaffAccounts}</span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-[#F4FAF7]">
                          <span className="text-[#60716F]">Support :</span>
                          <span className="font-bold text-[#102A2A]">{plan.supportType}</span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="mt-4 pt-3 border-t border-[#EAF0ED] space-y-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          {plan.advancedStats ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.advancedStats ? 'text-[#102A2A] font-medium' : 'text-[#71827D]'}>
                            Statistiques & Ventes avancées
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.csvImportExport ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.csvImportExport ? 'text-[#102A2A] font-medium' : 'text-[#71827D]'}>
                            Import/export CSV & Excel
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.logisticsSync ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.logisticsSync ? 'text-[#102A2A] font-bold' : 'text-[#71827D]'}>
                            Sync Yalidine / ZR / Procolis
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.multiPixels ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.multiPixels ? 'text-[#102A2A] font-medium' : 'text-[#71827D]'}>
                            Pixels Meta & TikTok (CAPI)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.customDomain ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.customDomain ? 'text-[#102A2A] font-bold' : 'text-[#71827D]'}>
                            Nom de domaine personnalisé (.dz)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.apiAccess ? (
                            <Check size={14} className="text-[#006B55] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#A0B0AB] shrink-0" />
                          )}
                          <span className={plan.apiAccess ? 'text-[#102A2A] font-bold' : 'text-[#71827D]'}>
                            Accès API REST & Webhooks
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#EAF0ED]">
                      <button
                        type="button"
                        onClick={() => setEditingPlan(plan)}
                        className="w-full py-2 px-3 rounded-xl border border-[#DCE8E3] bg-[#F4FAF7] hover:bg-[#E7F2EF] text-[#006B55] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Modifier les paramètres</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FACTURES & RÈGLEMENTS (REAL DATA + PAGINATION)     */}
        {/* ========================================================= */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {isLoadingInvoices ? (
              <TableSkeleton rows={invLimit} />
            ) : invoices.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#DCE8E3] p-12 text-center shadow-[0_2px_10px_rgba(16,42,42,0.03)]">
                <Receipt className="mx-auto h-12 w-12 text-[#9CAFA9] mb-3" />
                <h3 className="text-sm font-bold text-[#102A2A]">Aucune facture trouvée</h3>
                <p className="text-xs text-[#60716F] mt-1 max-w-sm mx-auto">
                  Aucun règlement d’abonnement n’a encore été généré dans la base de données.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
                <div className="p-4 border-b border-[#DCE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#102A2A] font-display">
                      Historique Réel des Règlements d’Abonnement
                    </h3>
                    <p className="text-xs text-[#60716F]">
                      Factures générées en base de données pour les vendeurs Dzora Marketplace ({invTotal} factures au total)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Journal des règlements téléchargé.')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E7F2EF] text-xs font-bold text-[#006B55] hover:bg-[#d5eae4] transition cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Télécharger récapitulatif</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8FAF9] text-[#60716F] font-bold border-b border-[#DCE8E3] text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">N° Facture</th>
                        <th className="py-3 px-4">Boutique</th>
                        <th className="py-3 px-4">Formule</th>
                        <th className="py-3 px-4">Montant Réglé</th>
                        <th className="py-3 px-4">Mode de règlement</th>
                        <th className="py-3 px-4">Date de Facture</th>
                        <th className="py-3 px-4">Statut</th>
                        <th className="py-3 px-4 text-right">Reçu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAF0ED]">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#F4FAF7]/60 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#102A2A]">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#102A2A]">
                            {inv.storeName}
                          </td>
                          <td className="py-3.5 px-4">
                            {renderTierBadge(inv.tier)}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-[#102A2A]">
                            {formatPrice(inv.amountDa)}
                          </td>
                          <td className="py-3.5 px-4 text-[#60716F] font-medium">
                            {inv.paymentMethod}
                          </td>
                          <td className="py-3.5 px-4 text-[#60716F] font-medium">
                            {inv.createdAt
                              ? new Date(inv.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
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
                              onClick={() => showToast(`Téléchargement de la facture ${inv.invoiceNumber}`)}
                              className="p-1.5 rounded-lg text-[#71827D] hover:text-[#006B55] hover:bg-[#E7F2EF] transition cursor-pointer"
                              title="Télécharger reçu"
                            >
                              <Download size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Invoices Pagination Footer */}
                <div className="p-4 border-t border-[#DCE8E3] bg-[#F8FAF9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-[#60716F]">
                    Affichage de{' '}
                    <strong className="text-[#102A2A]">
                      {Math.min((invPage - 1) * invLimit + 1, invTotal)}
                    </strong>{' '}
                    à{' '}
                    <strong className="text-[#102A2A]">
                      {Math.min(invPage * invLimit, invTotal)}
                    </strong>{' '}
                    sur <strong className="text-[#102A2A]">{invTotal}</strong> factures
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInvPage((p) => Math.max(p - 1, 1))}
                      disabled={invPage <= 1}
                      className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Page précédente"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: invTotalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setInvPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          invPage === p
                            ? 'bg-[#006B55] text-white shadow-xs'
                            : 'bg-white border border-[#DCE8E3] text-[#4A5D58] hover:bg-[#F4FAF7]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setInvPage((p) => Math.min(p + 1, invTotalPages))}
                      disabled={invPage >= invTotalPages}
                      className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Page suivante"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: EDIT PLAN CONFIGURATION (SAVES TO DB)            */}
        {/* ========================================================= */}
        {editingPlan && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE8E3] animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-[#DCE8E3]">
                <div>
                  <h3 className="text-base font-extrabold text-[#102A2A] font-display tracking-tight">
                    Modifier la formule : {editingPlan.name}
                  </h3>
                  <p className="text-xs text-[#60716F] mt-0.5">
                    Modifiez le tarif en dinars, la commission et les plafonds stockés en base.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="p-1.5 rounded-lg text-[#71827D] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.target as HTMLFormElement
                  const updated: PlanConfig = {
                    ...editingPlan,
                    priceDa: Number((form.elements.namedItem('priceDa') as HTMLInputElement).value),
                    commissionRate: Number((form.elements.namedItem('commissionRate') as HTMLInputElement).value) / 100,
                    maxProducts: Number((form.elements.namedItem('maxProducts') as HTMLInputElement).value),
                    maxMonthlyOrders: Number((form.elements.namedItem('maxMonthlyOrders') as HTMLInputElement).value),
                    maxStaffAccounts: Number((form.elements.namedItem('maxStaffAccounts') as HTMLInputElement).value),
                    apiAccess: (form.elements.namedItem('apiAccess') as HTMLInputElement).checked,
                    logisticsSync: (form.elements.namedItem('logisticsSync') as HTMLInputElement).checked,
                    customDomain: (form.elements.namedItem('customDomain') as HTMLInputElement).checked,
                    multiPixels: (form.elements.namedItem('multiPixels') as HTMLInputElement).checked,
                  }
                  handleSavePlan(updated)
                }}
                className="space-y-4 mt-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#102A2A] mb-1">
                      Prix mensuel (DA)
                    </label>
                    <input
                      name="priceDa"
                      type="number"
                      defaultValue={editingPlan.priceDa}
                      className="w-full bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-2 text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#102A2A] mb-1">
                      Commission (%)
                    </label>
                    <input
                      name="commissionRate"
                      type="number"
                      step="0.1"
                      defaultValue={(editingPlan.commissionRate * 100).toFixed(1)}
                      className="w-full bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-2 text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#102A2A] mb-1">
                      Max Produits (-1 = ∞)
                    </label>
                    <input
                      name="maxProducts"
                      type="number"
                      defaultValue={editingPlan.maxProducts}
                      className="w-full bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-2 text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#102A2A] mb-1">
                      Max Commandes/m
                    </label>
                    <input
                      name="maxMonthlyOrders"
                      type="number"
                      defaultValue={editingPlan.maxMonthlyOrders}
                      className="w-full bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-2 text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#102A2A] mb-1">
                      Comptes employés
                    </label>
                    <input
                      name="maxStaffAccounts"
                      type="number"
                      defaultValue={editingPlan.maxStaffAccounts}
                      className="w-full bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-2 text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-[#DCE8E3]">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      name="logisticsSync"
                      type="checkbox"
                      defaultChecked={editingPlan.logisticsSync}
                      className="rounded text-[#006B55] focus:ring-[#006B55] cursor-pointer"
                    />
                    <span className="font-semibold text-[#102A2A]">
                      Synchronisation automatique transporteurs (Yalidine, ZR, Procolis)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      name="customDomain"
                      type="checkbox"
                      defaultChecked={editingPlan.customDomain}
                      className="rounded text-[#006B55] focus:ring-[#006B55] cursor-pointer"
                    />
                    <span className="font-semibold text-[#102A2A]">
                      Autoriser le nom de domaine personnalisé (.dz / .com)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      name="multiPixels"
                      type="checkbox"
                      defaultChecked={editingPlan.multiPixels}
                      className="rounded text-[#006B55] focus:ring-[#006B55] cursor-pointer"
                    />
                    <span className="font-semibold text-[#102A2A]">
                      Pixels Meta & TikTok (Conversions API)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      name="apiAccess"
                      type="checkbox"
                      defaultChecked={editingPlan.apiAccess}
                      className="rounded text-[#006B55] focus:ring-[#006B55] cursor-pointer"
                    />
                    <span className="font-semibold text-[#102A2A]">
                      Accès API REST & Webhooks développeur
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#DCE8E3]">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE8E3] text-[#60716F] font-bold hover:bg-[#F4FAF7] transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold hover:bg-[#005544] shadow-xs transition cursor-pointer"
                  >
                    Enregistrer en base
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: GÉRER L'ABONNEMENT VENDEUR (DIRECT DB UPDATE)    */}
        {/* ========================================================= */}
        {selectedSubForEdit && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3] animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE8E3]">
                <div>
                  <h3 className="text-base font-extrabold text-[#102A2A] font-display tracking-tight">
                    Gérer l’abonnement
                  </h3>
                  <p className="text-xs text-[#60716F] mt-0.5">
                    Boutique : <strong>{selectedSubForEdit.storeName}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubForEdit(null)}
                  className="p-1.5 rounded-lg text-[#71827D] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1.5">
                    Changer la formule du vendeur
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['TRIAL', 'BASIC', 'PRO', 'BUSINESS'] as SubscriptionTier[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleUpdateSellerTier(selectedSubForEdit.id, t)}
                        className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                          selectedSubForEdit.tier === t
                            ? 'border-[#006B55] bg-[#E7F2EF] text-[#006B55]'
                            : 'border-[#DCE8E3] hover:bg-[#F4FAF7] text-[#4A5D58]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF6E7] border border-[#FDE68A] text-[#B45309] text-[11.5px] space-y-1.5">
                  <div className="font-extrabold flex items-center gap-1.5 text-[#D97706]">
                    <Clock size={14} />
                    <span>Prolongation de l’essai gratuit</span>
                  </div>
                  <p className="font-medium text-[#92400E]">
                    Accorde 14 jours additionnels d’évaluation complète sans suspension.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUpdateSellerTier(selectedSubForEdit.id, 'TRIAL', 14)}
                    className="mt-1 px-3 py-1.5 bg-[#D97706] text-white font-bold rounded-xl hover:bg-[#B45309] transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>+14 jours d’essai offerts</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-[#DCE8E3] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedSubForEdit(null)}
                    className="px-4 py-2 rounded-xl bg-white border border-[#DCE8E3] text-[#60716F] font-bold hover:bg-[#F4FAF7] transition cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default function AbonnementsAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#006B55]/20 border-t-[#006B55] animate-spin" />
        </div>
      }
    >
      <AbonnementsContent />
    </Suspense>
  )
}
