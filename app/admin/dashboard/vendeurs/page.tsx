'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Store,
  Users,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  X,
  ChevronRight,
  Building2,
  ShoppingBag,
  MapPin,
  FileText,
  CreditCard,
  Truck,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  ExternalLink,
  ChevronDown,
  Phone,
  Mail,
  UserCheck,
  UserX,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import {
  api,
  AdminSellerItem,
  AdminSellerStats,
  SellerStatusType,
  SellerTypeEnum,
} from '@/lib/api'

// Format Algerian phone numbers consistently
function formatPhoneDisplay(raw?: string | null): string {
  if (!raw) return 'Non renseigné'
  const digits = raw.replace(/\D/g, '')
  if (!digits) return raw
  if (digits.startsWith('213')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`
  }
  if (digits.startsWith('0')) {
    const withoutZero = digits.slice(1)
    return `+213 ${withoutZero.slice(0, 2)} ${withoutZero.slice(2, 4)} ${withoutZero.slice(4, 6)} ${withoutZero.slice(6)}`
  }
  return raw
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const ALGERIAN_WILAYAS = [
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
  '34 - Bordj Bou Arreridj',
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

export default function AdminVendeursPage() {
  // Data states
  const [sellers, setSellers] = useState<AdminSellerItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<AdminSellerStats>({
    totalSellers: 0,
    approvedSellers: 0,
    pendingReview: 0,
    physicalStores: 0,
    ecommerceStores: 0,
  })

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filters state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedWilaya, setSelectedWilaya] = useState<string>('ALL')

  // Action Confirmation Modal state
  const [pendingAction, setPendingAction] = useState<{
    seller: AdminSellerItem
    type: 'REVIEW' | 'APPROVE' | 'REJECT' | 'SUSPEND'
  } | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [isActionSubmitting, setIsActionSubmitting] = useState(false)

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch real sellers from backend API
  const fetchSellers = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true)
      else setIsRefreshing(true)

      try {
        const res = await api.admin.getSellers({
          page,
          limit: 15,
          search: debouncedSearch.trim() || undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          type: selectedType !== 'ALL' ? selectedType : undefined,
          wilaya: selectedWilaya !== 'ALL' ? selectedWilaya.replace(/^\d+\s*-\s*/, '').trim() : undefined,
        })

        setSellers(res.data)
        setTotal(res.total)
        setTotalPages(res.totalPages)
        setStats(res.stats)
      } catch (err: any) {
        console.warn('Failed to fetch admin sellers:', err)
        if (err?.statusCode === 403) {
          setToastMessage('Accès restreint. Privilèges administrateur requis.')
        } else {
          setToastMessage(err.message || 'Erreur lors du chargement des vendeurs réels.')
        }
        window.setTimeout(() => setToastMessage(null), 4000)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [page, debouncedSearch, selectedStatus, selectedType, selectedWilaya]
  )

  useEffect(() => {
    fetchSellers()
  }, [fetchSellers])

  // Execute Seller Workflow Action
  const handleConfirmAction = async () => {
    if (!pendingAction) return
    setIsActionSubmitting(true)

    const { seller, type } = pendingAction

    try {
      if (type === 'REVIEW') {
        await api.admin.moveSellerToReview(seller.id)
        setToastMessage(`La candidature de « ${seller.storeName} » est passée en cours d’examen.`)
      } else if (type === 'APPROVE') {
        await api.admin.approveSeller(seller.id)
        setToastMessage(`La boutique « ${seller.storeName} » a été approuvée avec succès.`)
      } else if (type === 'REJECT') {
        await api.admin.rejectSeller(seller.id, actionReason.trim() || undefined)
        setToastMessage(`La candidature de « ${seller.storeName} » a été rejetée.`)
      } else if (type === 'SUSPEND') {
        await api.admin.suspendSeller(seller.id)
        setToastMessage(`La boutique « ${seller.storeName} » a été suspendue.`)
      }

      window.setTimeout(() => setToastMessage(null), 3500)
      setPendingAction(null)
      setActionReason('')

      fetchSellers(true)
    } catch (err: any) {
      setToastMessage(err.message || 'Impossible d’exécuter l’action sur ce vendeur.')
      window.setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setIsActionSubmitting(false)
    }
  }

  // Helper status badge renderer
  const renderStatusBadge = (status: SellerStatusType) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006B55]" />
            Approuvé
          </span>
        )
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            En examen
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Clock className="w-3 h-3 text-[#2563EB]" />
            En attente
          </span>
        )
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            <ShieldAlert className="w-3 h-3 text-[#475569]" />
            Suspendu
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            Rejeté
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        )
    }
  }

  // Helper legal status renderer
  const renderLegalStatus = (legalStatus?: string | null) => {
    switch (legalStatus) {
      case 'COMPANY':
        return 'Société (SARL / EURL)'
      case 'AUTO_ENTREPRENEUR':
        return 'Auto-entrepreneur'
      case 'INDIVIDUAL':
        return 'Personne physique'
      default:
        return legalStatus || '—'
    }
  }

  // Helper status bar progress config
  const getSellerProgressConfig = (status?: string | null, rawPercentage?: number | null) => {
    const normalized = (status || '').toUpperCase().trim().replace(/[\s-]+/g, '_')
    switch (normalized) {
      case 'APPROVED':
        return {
          percentage: 100,
          color: 'bg-[#006B55]',
          textColor: 'text-[#006B55]',
          label: '100%',
          sublabel: 'Dossier validé et approuvé',
        }
      case 'UNDER_REVIEW':
      case 'REVIEW':
      case 'PENDING_REVIEW':
        return {
          percentage: 75,
          color: 'bg-[#D97706]',
          textColor: 'text-[#D97706]',
          label: '75%',
          sublabel: 'En cours d’examen administratif',
        }
      case 'PENDING':
        return {
          percentage: 40,
          color: 'bg-[#2563EB]',
          textColor: 'text-[#2563EB]',
          label: '40%',
          sublabel: 'En attente de traitement',
        }
      case 'REJECTED':
        return {
          percentage: 100,
          color: 'bg-red-600',
          textColor: 'text-red-600',
          label: 'Rejeté',
          sublabel: 'Dossier refusé',
        }
      case 'SUSPENDED':
        return {
          percentage: 100,
          color: 'bg-slate-500',
          textColor: 'text-slate-600',
          label: 'Suspendu',
          sublabel: 'Boutique suspendue',
        }
      default:
        return {
          percentage: rawPercentage || 40,
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          label: `${rawPercentage || 40}%`,
          sublabel: 'En cours',
        }
    }
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
              <span className="text-[#102A2A] font-semibold">Vendeurs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
              Gestion des Vendeurs
            </h1>
            <p className="text-xs font-medium text-[#60716F] mt-0.5">
              Données réelles des boutiques et vendeurs enregistrés sur Dzora Marketplace
            </p>
          </div>

          {/* Quick stats pills & Refresh */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4]">
              <Store size={14} />
              <span>
                {stats.totalSellers} boutique{stats.totalSellers > 1 ? 's' : ''} au total
              </span>
            </span>

            <button
              type="button"
              onClick={() => fetchSellers(true)}
              disabled={isRefreshing || isLoading}
              className="p-2 text-[#4A5D58] hover:text-[#006B55] hover:bg-white rounded-xl border border-[#DCE8E3] transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Rafraîchir les vendeurs"
              aria-label="Rafraîchir les données"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-[#006B55]' : ''} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 1: REAL KPIS CARDS (Full Width 4 Cols)                */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Vendeurs */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Total Boutiques</span>
              <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {stats.totalSellers}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                <span>Candidatures enregistrées en base</span>
              </div>
            </div>
          </div>

          {/* Card 2: Vendeurs Approuvés */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Vendeurs Approuvés</span>
              <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {stats.approvedSellers}
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                Boutiques en activité commerciale
              </p>
            </div>
          </div>

          {/* Card 3: En Attente / Examen */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">En Attente & Examen</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF6E7] text-[#D97706] flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {stats.pendingReview}
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                Candidatures nécessitant validation
              </p>
            </div>
          </div>

          {/* Card 4: Répartition Canaux */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Physique vs E-commerce</span>
              <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {stats.physicalStores}{' '}
                <span className="text-base text-gray-400 font-normal">/</span>{' '}
                {stats.ecommerceStores}
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                Magasins physiques · 100% en ligne
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: FILTERS & CONTROLS TOOLBAR                         */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-4 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A4A0] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher boutique, gérant, wilaya, RC…"
                className="w-full pl-9 pr-3 py-1.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] placeholder:text-[#71827D] focus:bg-white focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 outline-none transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Effacer la recherche"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Statut :</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setPage(1)
                }}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="APPROVED">Approuvé</option>
                <option value="UNDER_REVIEW">En examen</option>
                <option value="PENDING">En attente</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="REJECTED">Rejeté</option>
              </select>
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Type :</span>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value)
                  setPage(1)
                }}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
              >
                <option value="ALL">Tous les types</option>
                <option value="PHYSICAL_STORE">Boutique physique</option>
                <option value="ECOMMERCE">E-commerce</option>
              </select>
            </div>

            {/* Wilaya filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Wilaya :</span>
              <select
                value={selectedWilaya}
                onChange={(e) => {
                  setSelectedWilaya(e.target.value)
                  setPage(1)
                }}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer max-w-[150px]"
              >
                <option value="ALL">Toutes</option>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters if active */}
            {(selectedStatus !== 'ALL' ||
              selectedType !== 'ALL' ||
              selectedWilaya !== 'ALL' ||
              search) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('ALL')
                  setSelectedType('ALL')
                  setSelectedWilaya('ALL')
                  setSearch('')
                  setPage(1)
                }}
                className="text-xs font-bold text-[#006B55] hover:underline px-2 py-1 cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-[#60716F] text-right shrink-0">
            Affichage de {sellers.length} sur {total} vendeur{total > 1 ? 's' : ''}
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 3: SELLERS TABLE (Full Width)                         */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto w-8 h-8 rounded-full border-2 border-[#006B55] border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-[#60716F]">
                Chargement des vendeurs réels en base…
              </p>
            </div>
          ) : sellers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[#E7F2EF] text-[#006B55] grid place-items-center">
                <Store size={24} />
              </div>
              <h3 className="text-base font-bold text-[#102A2A]">
                Aucun vendeur trouvé
              </h3>
              <p className="text-xs text-[#71827D] max-w-sm mx-auto">
                Aucune boutique ne correspond à vos critères de recherche actuels.
              </p>
              {(search ||
                selectedStatus !== 'ALL' ||
                selectedType !== 'ALL' ||
                selectedWilaya !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedStatus('ALL')
                    setSelectedType('ALL')
                    setSelectedWilaya('ALL')
                    setPage(1)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005544] transition cursor-pointer"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5EEEB] bg-[#F7FAF9] text-[11px] font-bold text-[#71827D] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Boutique & Gérant</th>
                    <th className="py-3 px-4 font-bold">Type & Catégorie</th>
                    <th className="py-3 px-4 font-bold">Localisation</th>
                    <th className="py-3 px-4 font-bold">Cadre Légal & RC</th>
                    <th className="py-3 px-4 font-bold">Statut</th>
                    <th className="py-3 px-4 font-bold">Inscrite le</th>
                    <th className="py-3 px-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EEEB]">
                  {sellers.map((s) => {
                    const ownerName =
                      s.user?.firstName || s.user?.lastName
                        ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim()
                        : 'Propriétaire inconnu'
                    const storeInitial = (s.storeName || 'B').charAt(0).toUpperCase()

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-[#F9FCFA] transition-colors group"
                      >
                        {/* Boutique & Gérant */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {s.logoUrl ? (
                              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#DCE8E3] shrink-0 bg-[#F4F8F6]">
                                <Image
                                  src={s.logoUrl}
                                  alt={s.storeName}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-[#E7F2EF] text-[#006B55] font-extrabold flex items-center justify-center shrink-0 border border-[#BBDDD4] text-xs">
                                {storeInitial}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#102A2A] truncate">
                                  {s.storeName}
                                </span>
                                {s.slug && (
                                  <Link
                                    href={`/vendeur/${s.slug}`}
                                    target="_blank"
                                    className="text-gray-400 hover:text-[#006B55] transition"
                                    title="Voir la vitrine publique"
                                  >
                                    <ExternalLink size={11} />
                                  </Link>
                                )}
                              </div>
                              <div className="text-[11px] text-[#71827D] truncate">
                                {ownerName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Catégorie */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {s.type === 'PHYSICAL_STORE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <Building2 size={11} />
                                Magasin physique
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                                <ShoppingBag size={11} />
                                E-commerce
                              </span>
                            )}
                            <div className="text-[11px] text-[#60716F]">
                              {s.category || 'Général'}
                            </div>
                          </div>
                        </td>

                        {/* Localisation */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-[#102A2A] flex items-center gap-1">
                              <MapPin size={11} className="text-[#006B55] shrink-0" />
                              <span>{s.wilaya || 'Algérie'}</span>
                            </div>
                            <div className="text-[11px] text-[#71827D]">
                              {s.commune || '—'}
                            </div>
                          </div>
                        </td>

                        {/* Cadre Légal & RC */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-medium text-[#102A2A]">
                              {renderLegalStatus(s.legalStatus)}
                            </div>
                            <div className="text-[11px] font-mono text-[#71827D]">
                              RC : {s.businessRegistration || 'Non renseigné'}
                            </div>
                          </div>
                        </td>

                        {/* Statut & Complétion */}
                        <td className="py-3.5 px-4">
                          {(() => {
                            const progress = getSellerProgressConfig(s.status, s.completionPercentage)
                            return (
                              <div className="space-y-1.5">
                                {renderStatusBadge(s.status)}
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full transition-all duration-300 ${progress.color}`}
                                      style={{ width: `${progress.percentage}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-mono font-bold ${progress.textColor}`}>
                                    {progress.label}
                                  </span>
                                </div>
                              </div>
                            )
                          })()}
                        </td>

                        {/* Inscrite le */}
                        <td className="py-3.5 px-4 text-[#60716F] font-medium whitespace-nowrap">
                          {formatDate(s.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/dashboard/utilisateurs/${s.userId}?tab=vendeur`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#006B55] bg-[#E7F2EF] hover:bg-[#D5EBE4] border border-[#BBDDD4] transition cursor-pointer"
                              title="Inspecter le profil et documents"
                            >
                              <Eye size={13} />
                              <span>Inspecter</span>
                            </Link>

                            {/* Contextual quick action buttons */}
                            {s.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingAction({ seller: s, type: 'REVIEW' })
                                }
                                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-[#D97706] hover:bg-amber-50 border border-amber-200 transition cursor-pointer"
                                title="Passer en examen"
                              >
                                Examen
                              </button>
                            )}

                            {(s.status === 'PENDING' || s.status === 'UNDER_REVIEW') && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingAction({ seller: s, type: 'APPROVE' })
                                }
                                className="px-2 py-1.5 rounded-lg text-xs font-bold text-white bg-[#006B55] hover:bg-[#005544] transition cursor-pointer"
                                title="Approuver la boutique"
                              >
                                Approuver
                              </button>
                            )}

                            {s.status === 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingAction({ seller: s, type: 'SUSPEND' })
                                }
                                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-red-700 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition cursor-pointer"
                                title="Suspendre la boutique"
                              >
                                Suspendre
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E5EEEB] bg-[#F7FAF9] flex items-center justify-between">
              <div className="text-xs text-[#60716F] font-medium">
                Page <span className="font-bold text-[#102A2A]">{page}</span> sur{' '}
                <span className="font-bold text-[#102A2A]">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#102A2A] bg-white hover:bg-[#F4FAF7] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#102A2A] bg-white hover:bg-[#F4FAF7] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </main>



      {/* ========================================================= */}
      {/* ACTION CONFIRMATION MODAL                                 */}
      {/* ========================================================= */}
      {pendingAction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4">
            <div className="flex items-center gap-3">
              {pendingAction.type === 'APPROVE' ? (
                <div className="w-10 h-10 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              ) : pendingAction.type === 'REVIEW' ? (
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-[#102A2A] font-display">
                  {pendingAction.type === 'APPROVE'
                    ? 'Approuver la boutique'
                    : pendingAction.type === 'REVIEW'
                    ? 'Mettre en examen'
                    : pendingAction.type === 'REJECT'
                    ? 'Rejeter la candidature'
                    : 'Suspendre la boutique'}
                </h3>
                <p className="text-xs text-[#71827D]">
                  Boutique : « {pendingAction.seller.storeName} »
                </p>
              </div>
            </div>

            <p className="text-xs text-[#60716F] leading-relaxed">
              {pendingAction.type === 'APPROVE'
                ? 'Cette action valide le profil vendeur et lui attribue les privilèges nécessaires pour publier des produits sur Dzora Marketplace.'
                : pendingAction.type === 'REVIEW'
                ? 'La candidature passera au statut « En cours d’examen » pour analyse des documents légaux.'
                : pendingAction.type === 'REJECT'
                ? 'La candidature sera refusée. Vous pouvez indiquer le motif du rejet ci-dessous.'
                : 'La boutique sera suspendue et ses produits retirés temporairement de la vitrine publique.'}
            </p>

            {(pendingAction.type === 'REJECT' || pendingAction.type === 'SUSPEND') && (
              <div>
                <label
                  htmlFor="action-reason"
                  className="block text-[11px] font-bold text-[#60716F] uppercase mb-1.5"
                >
                  Motif {pendingAction.type === 'REJECT' ? 'du rejet' : 'de la suspension'} (optionnel)
                </label>
                <textarea
                  id="action-reason"
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Ex : Document du registre de commerce illisible, numéro NIF non conforme…"
                  className="w-full p-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] placeholder:text-[#94A4A0] focus:bg-white focus:border-[#008F72] outline-none transition"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isActionSubmitting}
                onClick={() => {
                  setPendingAction(null)
                  setActionReason('')
                }}
                className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isActionSubmitting}
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                  pendingAction.type === 'APPROVE'
                    ? 'bg-[#006B55] hover:bg-[#005544]'
                    : pendingAction.type === 'REVIEW'
                    ? 'bg-[#D97706] hover:bg-[#B45309]'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isActionSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Traitement en cours…</span>
                  </>
                ) : (
                  <span>Confirmer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
