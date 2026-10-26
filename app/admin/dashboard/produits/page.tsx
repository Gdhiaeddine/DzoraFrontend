'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Boxes,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Store,
  Filter,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Download,
  Package,
  DollarSign,
  Tag,
  Layers,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react'
import {
  sellerProductsService,
  SellerProductItem,
  ProductStatus,
} from '@/lib/seller-products-service'

const REJECTION_PRESETS = [
  'Image de couverture non conforme (filigrane, logo externe ou basse résolution).',
  'Description du produit insuffisante ou trompeuse.',
  'Prix ou stock anormalement renseigné.',
  'Article non conforme aux conditions générales de vente de Dzora.',
  'Classification de catégorie ou marque incorrecte.',
]

export default function AdminProductsModerationPage() {
  const [products, setProducts] = useState<SellerProductItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filtering states
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | ProductStatus>('PENDING_REVIEW')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'low-stock'>('newest')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modals state
  const [inspectingProduct, setInspectingProduct] = useState<SellerProductItem | null>(null)
  const [inspectImageIndex, setInspectImageIndex] = useState(0)
  const [rejectingProduct, setRejectingProduct] = useState<SellerProductItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3500)
  }

  // Load products across all registered seller stores
  const loadData = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        const all = await sellerProductsService.getAllProductsAcrossSellers()
        setProducts(all)
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    showToast('Liste des produits actualisée.')
  }

  // Status counts for KPIs & Tabs
  const pendingCount = useMemo(() => products.filter((p) => p.status === 'PENDING_REVIEW').length, [products])
  const approvedCount = useMemo(() => products.filter((p) => p.status === 'APPROVED').length, [products])
  const rejectedCount = useMemo(() => products.filter((p) => p.status === 'REJECTED').length, [products])
  const draftCount = useMemo(() => products.filter((p) => p.status === 'DRAFT').length, [products])

  // Extract unique stores & categories for filter dropdowns
  const availableStores = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.storeName) set.add(p.storeName)
    })
    return Array.from(set).sort()
  }, [products])

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set).sort()
  }, [products])

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      )
    }

    if (selectedStatusTab !== 'ALL') {
      result = result.filter((p) => p.status === selectedStatusTab)
    }

    if (selectedStore !== 'ALL') {
      result = result.filter((p) => p.storeName === selectedStore)
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'low-stock') return a.stock - b.stock
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [products, searchQuery, selectedStatusTab, selectedStore, selectedCategory, sortBy])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatusTab, selectedStore, selectedCategory, sortBy])

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  // Action: Approve
  const handleApprove = async (p: SellerProductItem) => {
    try {
      const updated = await sellerProductsService.adminApproveProduct(
        p.storeSlug,
        p.id,
        'Super Admin Dzora'
      )
      setProducts((prev) => prev.map((item) => (item.id === p.id ? updated : item)))
      if (inspectingProduct?.id === p.id) {
        setInspectingProduct(updated)
      }
      showToast(`Le produit « ${p.name} » a été approuvé et publié en ligne.`)
    } catch {
      showToast('Erreur lors de la validation du produit.')
    }
  }

  // Action: Reject
  const handleRejectConfirm = async () => {
    if (!rejectingProduct) return
    if (!rejectionReason.trim()) {
      alert('Veuillez spécifier le motif du refus.')
      return
    }

    try {
      const updated = await sellerProductsService.adminRejectProduct(
        rejectingProduct.storeSlug,
        rejectingProduct.id,
        rejectionReason.trim(),
        'Super Admin Dzora'
      )
      setProducts((prev) =>
        prev.map((item) => (item.id === rejectingProduct.id ? updated : item))
      )
      if (inspectingProduct?.id === rejectingProduct.id) {
        setInspectingProduct(updated)
      }
      showToast(`Le produit « ${rejectingProduct.name} » a été rejeté avec motif.`)
      setRejectingProduct(null)
      setRejectionReason('')
    } catch {
      showToast('Erreur lors du rejet du produit.')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      showToast('Aucun produit à exporter.')
      return
    }

    const headers = [
      'ID',
      'Article',
      'SKU',
      'Boutique',
      'Catégorie',
      'Sous-catégorie',
      'Marque',
      'Prix (DA)',
      'Stock',
      'Statut',
      'Date Création',
      'Motif Refus',
    ]

    const rows = filteredProducts.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.storeName.replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      `"${p.subcategory || ''}"`,
      `"${p.brand || ''}"`,
      p.price,
      p.stock,
      p.status,
      `"${new Date(p.createdAt).toLocaleDateString('fr-FR')}"`,
      `"${(p.rejectionReason || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `dzora-produits-moderation-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast(`${filteredProducts.length} articles exportés au format CSV.`)
  }

  // Format price
  const formatPrice = (val: number) => {
    return (val || 0).toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
  }

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStore !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    sortBy !== 'newest' ||
    selectedStatusTab !== 'ALL'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedStore('ALL')
    setSelectedCategory('ALL')
    setSortBy('newest')
    setSelectedStatusTab('ALL')
  }

  return (
    <>
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
              <span className="text-[#102A2A] font-semibold">Produits</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
              Modération des Produits
            </h1>
            <p className="text-xs font-medium text-[#60716F] mt-0.5">
              Contrôle qualité, conformité et approbation des articles soumis par les vendeurs partenaires
            </p>
          </div>

          {/* Quick stats pill & Refresh */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4]">
              <Boxes size={14} />
              <span>
                {products.length} article{products.length > 1 ? 's' : ''} au total
              </span>
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2 text-[#4A5D58] hover:text-[#006B55] hover:bg-white rounded-xl border border-[#DCE8E3] transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Rafraîchir les produits"
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
          {/* Card 1: En attente */}
          <div
            onClick={() => setSelectedStatusTab(selectedStatusTab === 'PENDING_REVIEW' ? 'ALL' : 'PENDING_REVIEW')}
            className={`bg-white rounded-2xl p-5 border shadow-[0_2px_10px_rgba(16,42,42,0.03)] transition duration-200 flex flex-col justify-between cursor-pointer ${
              selectedStatusTab === 'PENDING_REVIEW'
                ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/40'
                : 'border-[#DCE8E3] hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">À modérer (En attente)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {pendingCount}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Nécessite votre validation avant mise en ligne</span>
              </div>
            </div>
          </div>

          {/* Card 2: Approuvés */}
          <div
            onClick={() => setSelectedStatusTab(selectedStatusTab === 'APPROVED' ? 'ALL' : 'APPROVED')}
            className={`bg-white rounded-2xl p-5 border shadow-[0_2px_10px_rgba(16,42,42,0.03)] transition duration-200 flex flex-col justify-between cursor-pointer ${
              selectedStatusTab === 'APPROVED'
                ? 'border-[#006B55] ring-2 ring-[#006B55]/15 bg-[#E7F2EF]/40'
                : 'border-[#DCE8E3] hover:border-[#BBDDD4]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Articles Approuvés</span>
              <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {approvedCount}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                <span>Actuellement visibles sur la marketplace</span>
              </div>
            </div>
          </div>

          {/* Card 3: Refusés */}
          <div
            onClick={() => setSelectedStatusTab(selectedStatusTab === 'REJECTED' ? 'ALL' : 'REJECTED')}
            className={`bg-white rounded-2xl p-5 border shadow-[0_2px_10px_rgba(16,42,42,0.03)] transition duration-200 flex flex-col justify-between cursor-pointer ${
              selectedStatusTab === 'REJECTED'
                ? 'border-red-400 ring-2 ring-red-400/20 bg-red-50/40'
                : 'border-[#DCE8E3] hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Articles Refusés</span>
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-display tracking-[-0.035em]">
                {rejectedCount}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-700">
                <span>Retournés aux vendeurs avec motif précis</span>
              </div>
            </div>
          </div>

          {/* Card 4: Brouillons */}
          <div
            onClick={() => setSelectedStatusTab(selectedStatusTab === 'DRAFT' ? 'ALL' : 'DRAFT')}
            className={`bg-white rounded-2xl p-5 border shadow-[0_2px_10px_rgba(16,42,42,0.03)] transition duration-200 flex flex-col justify-between cursor-pointer ${
              selectedStatusTab === 'DRAFT'
                ? 'border-slate-400 ring-2 ring-slate-400/20 bg-slate-50'
                : 'border-[#DCE8E3] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Brouillons Vendeurs</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {draftCount}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#71827D]">
                <span>En cours de préparation dans les boutiques</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: STATUS TABS PILLS                                  */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          {[
            { id: 'ALL' as const, label: 'Tous les produits', count: products.length },
            {
              id: 'PENDING_REVIEW' as const,
              label: 'En attente modération',
              count: pendingCount,
              highlight: pendingCount > 0,
            },
            { id: 'APPROVED' as const, label: 'Approuvés', count: approvedCount },
            { id: 'REJECTED' as const, label: 'Refusés', count: rejectedCount },
            { id: 'DRAFT' as const, label: 'Brouillons', count: draftCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
                selectedStatusTab === tab.id
                  ? 'bg-[#006B55] text-white shadow-xs font-bold'
                  : 'bg-white border border-[#DCE8E3] text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  selectedStatusTab === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.highlight
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-[#E7F2EF] text-[#006B55]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* ROW 3: FILTERS & CONTROLS TOOLBAR                         */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-4 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A4A0] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher article, SKU, boutique, marque…"
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

            {/* Store filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Boutique :</span>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer max-w-[170px]"
              >
                <option value="ALL">Toutes les boutiques</option>
                {availableStores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Catégorie :</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer max-w-[160px]"
              >
                <option value="ALL">Toutes</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Trier :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
              >
                <option value="newest">Plus récents</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="price-asc">Prix croissant</option>
                <option value="low-stock">Stock faible</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#006B55] hover:underline px-2 py-1 cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* Export CSV button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4] hover:bg-[#d5eae4] transition shadow-xs cursor-pointer shrink-0"
            >
              <Download size={13} />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 4: PRODUCTS MODERATION TABLE                          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DCE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                Catalogue des Articles Soumis
              </h3>
              <p className="text-xs text-[#60716F]">
                {filteredProducts.length} article{filteredProducts.length > 1 ? 's' : ''} correspondant aux filtres appliqués
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#71827D] font-medium">
                Page <strong className="text-[#102A2A]">{currentPage}</strong> sur{' '}
                <strong className="text-[#102A2A]">{totalPages}</strong>
              </span>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-[#E7F2EF] text-[#006B55] mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-base text-[#102A2A] font-display">
                Aucun produit dans cette sélection
              </h4>
              <p className="text-xs text-[#60716F] max-w-sm mx-auto">
                Tous les articles soumis ont été traités ou aucun article ne correspond aux filtres de recherche.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition cursor-pointer"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAF9] text-[#60716F] font-bold border-b border-[#DCE8E3] text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Article & SKU</th>
                    <th className="py-3 px-4">Boutique Vendeuse</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4">Tarification & Stock</th>
                    <th className="py-3 px-4">Statut Modération</th>
                    <th className="py-3 px-4 text-right">Actions & Décision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF0ED]">
                  {paginatedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F4FAF7]/70 transition">
                      {/* Article & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-xl overflow-hidden border border-[#DCE8E3] shrink-0 bg-gray-50">
                            {p.mainImage ? (
                              <Image
                                src={p.mainImage}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-[#94A4A0]">
                                <Package size={18} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectingProduct(p)
                                setInspectImageIndex(0)
                              }}
                              className="font-extrabold text-xs text-[#102A2A] hover:text-[#006B55] transition text-left line-clamp-1 cursor-pointer"
                              title={p.name}
                            >
                              {p.name}
                            </button>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="font-mono text-[10px] text-[#71827D]">
                                SKU: {p.sku}
                              </span>
                              {p.brand && (
                                <span className="text-[10px] font-semibold text-[#006B55] bg-[#E7F2EF] px-1.5 py-0.2 rounded border border-[#BBDDD4]">
                                  {p.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Store */}
                      <td className="py-3.5 px-4 font-medium text-[#102A2A]">
                        <div className="flex items-center gap-1.5">
                          <Store size={13} className="text-[#006B55]" />
                          <span className="font-bold">{p.storeName}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#71827D]">
                          /{p.storeSlug}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-[#4A5D58]">
                        <div className="font-semibold text-[#102A2A]">{p.category}</div>
                        {p.subcategory && (
                          <p className="text-[10px] text-[#71827D]">{p.subcategory}</p>
                        )}
                      </td>

                      {/* Price & Stock */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-xs text-[#102A2A]">
                            {formatPrice(p.price)}
                          </span>
                          {p.compareAtPrice && p.compareAtPrice > p.price && (
                            <span className="text-[10px] text-[#94A4A0] line-through font-mono">
                              {formatPrice(p.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                          <span
                            className={`font-bold ${
                              p.stock === 0
                                ? 'text-red-600'
                                : p.stock <= (p.lowStockAlert || 5)
                                ? 'text-amber-700'
                                : 'text-[#60716F]'
                            }`}
                          >
                            {p.stock} en stock
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {p.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006B55]" />
                            Approuvé
                          </span>
                        ) : p.status === 'PENDING_REVIEW' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                            En attente
                          </span>
                        ) : p.status === 'REJECTED' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                              Refusé
                            </span>
                            {p.rejectionReason && (
                              <p
                                className="text-[10px] text-red-700 max-w-xs truncate cursor-help"
                                title={p.rejectionReason}
                              >
                                {p.rejectionReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                            Brouillon
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect / View Details Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setInspectingProduct(p)
                              setInspectImageIndex(0)
                            }}
                            className="p-1.5 rounded-lg border border-[#DCE8E3] bg-[#F7FAF9] text-[#4A5D58] hover:bg-[#E7F2EF] hover:text-[#006B55] transition cursor-pointer"
                            title="Inspecter le produit en détail"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Approve Button */}
                          {p.status !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleApprove(p)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#006B55] text-white font-bold text-xs hover:bg-[#005544] transition flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Valider et publier ce produit"
                            >
                              <Check size={13} />
                              <span className="hidden sm:inline">Approuver</span>
                            </button>
                          )}

                          {/* Reject Button */}
                          {p.status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingProduct(p)
                                setRejectionReason(p.rejectionReason || '')
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition flex items-center gap-1 cursor-pointer"
                              title="Refuser avec motif"
                            >
                              <X size={13} />
                              <span className="hidden sm:inline">Rejeter</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#DCE8E3] bg-[#F8FAF9] flex items-center justify-between text-xs">
              <div className="text-[#60716F]">
                Affichage de <strong className="text-[#102A2A]">{(currentPage - 1) * itemsPerPage + 1}</strong> à{' '}
                <strong className="text-[#102A2A]">
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                </strong>{' '}
                sur <strong className="text-[#102A2A]">{filteredProducts.length}</strong> produits
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 font-bold text-[#102A2A]">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: INSPECTION & PRÉVISUALISATION DÉTAILLÉE PRODUIT   */}
      {/* ========================================================= */}
      {inspectingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#DCE8E3] max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE8E3]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold text-[#71827D]">
                    SKU: {inspectingProduct.sku}
                  </span>
                  {inspectingProduct.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EF] text-[#006B55]">
                      <CheckCircle2 size={11} />
                      Approuvé
                    </span>
                  ) : inspectingProduct.status === 'PENDING_REVIEW' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
                      <Clock size={11} />
                      En attente de modération
                    </span>
                  ) : inspectingProduct.status === 'REJECTED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800">
                      <AlertCircle size={11} />
                      Refusé
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                      Brouillon
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-[#102A2A] font-display">
                  {inspectingProduct.name}
                </h3>
                <p className="text-xs text-[#60716F]">
                  Boutique : <strong>{inspectingProduct.storeName}</strong> (/{inspectingProduct.storeSlug})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingProduct(null)}
                className="p-1.5 rounded-lg text-[#71827D] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Gallery Preview */}
            <div className="space-y-2">
              <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-[#F8FAF9] border border-[#DCE8E3]">
                {inspectingProduct.images && inspectingProduct.images.length > 0 ? (
                  <Image
                    src={inspectingProduct.images[inspectImageIndex] || inspectingProduct.mainImage}
                    alt={inspectingProduct.name}
                    fill
                    className="object-contain"
                  />
                ) : inspectingProduct.mainImage ? (
                  <Image
                    src={inspectingProduct.mainImage}
                    alt={inspectingProduct.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-[#94A4A0]">
                    <Package size={32} />
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {inspectingProduct.images && inspectingProduct.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {inspectingProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInspectImageIndex(idx)}
                      className={`relative size-14 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                        inspectImageIndex === idx
                          ? 'border-[#006B55] ring-2 ring-[#006B55]/20'
                          : 'border-[#DCE8E3] hover:border-[#94A4A0]'
                      }`}
                    >
                      <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#DCE8E3]">
                <span className="text-[10px] text-[#71827D] font-bold uppercase tracking-wider block">
                  Prix de Vente
                </span>
                <span className="text-base font-extrabold text-[#102A2A] mt-0.5 block">
                  {formatPrice(inspectingProduct.price)}
                </span>
                {inspectingProduct.compareAtPrice && (
                  <span className="text-[10px] text-[#94A4A0] line-through">
                    {formatPrice(inspectingProduct.compareAtPrice)}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#DCE8E3]">
                <span className="text-[10px] text-[#71827D] font-bold uppercase tracking-wider block">
                  Stock Réel
                </span>
                <span className="text-base font-extrabold text-[#102A2A] mt-0.5 block">
                  {inspectingProduct.stock} unités
                </span>
                <span className="text-[10px] text-[#60716F]">
                  Alerte : {inspectingProduct.lowStockAlert || 5}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#DCE8E3]">
                <span className="text-[10px] text-[#71827D] font-bold uppercase tracking-wider block">
                  Catégorie
                </span>
                <span className="font-bold text-[#102A2A] mt-0.5 block truncate">
                  {inspectingProduct.category}
                </span>
                <span className="text-[10px] text-[#60716F] truncate block">
                  {inspectingProduct.subcategory || 'Générale'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#DCE8E3]">
                <span className="text-[10px] text-[#71827D] font-bold uppercase tracking-wider block">
                  Marque
                </span>
                <span className="font-bold text-[#102A2A] mt-0.5 block truncate">
                  {inspectingProduct.brand || 'Générique'}
                </span>
                <span className="text-[10px] text-[#60716F]">
                  Poids : {inspectingProduct.weightKg ? `${inspectingProduct.weightKg} kg` : 'Non spécifié'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-[#102A2A]">Description fournie par le vendeur :</span>
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#DCE8E3] text-[#4A5D58] leading-relaxed whitespace-pre-wrap">
                {inspectingProduct.description || 'Aucune description rédigée.'}
              </div>
            </div>

            {/* Rejection / Review feedback if present */}
            {inspectingProduct.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-700">
                  <AlertCircle size={14} />
                  <span>Motif du précédent rejet :</span>
                </div>
                <p>{inspectingProduct.rejectionReason}</p>
              </div>
            )}

            {/* Footer Decision Buttons */}
            <div className="pt-4 flex items-center justify-between gap-3 border-t border-[#DCE8E3]">
              <button
                type="button"
                onClick={() => setInspectingProduct(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#DCE8E3] text-[#60716F] font-bold text-xs hover:bg-[#F4FAF7] transition cursor-pointer"
              >
                Fermer
              </button>

              <div className="flex items-center gap-2">
                {inspectingProduct.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingProduct(inspectingProduct)
                      setRejectionReason(inspectingProduct.rejectionReason || '')
                    }}
                    className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={14} />
                    <span>Rejeter avec motif</span>
                  </button>
                )}

                {inspectingProduct.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(inspectingProduct)}
                    className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold text-xs hover:bg-[#005544] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Approuver et Publier</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CONFIRMATION REJET PRODUIT AVEC MOTIF PRÉCIS     */}
      {/* ========================================================= */}
      {rejectingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#DCE8E3] bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
              <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                <AlertTriangle size={18} />
                <span>Refuser l'article pour motif non-conforme</span>
              </div>
              <button
                type="button"
                onClick={() => setRejectingProduct(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#60716F]">
              Article : <strong>{rejectingProduct.name}</strong> (Boutique {rejectingProduct.storeName})
            </p>

            {/* Presets chips */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-[#102A2A]">Motifs prédéfinis fréquents :</span>
              <div className="flex flex-wrap gap-1.5">
                {REJECTION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[#DCE8E3] bg-[#F7FAF9] hover:bg-[#E7F2EF] hover:text-[#006B55] text-[#4A5D58] transition text-left cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A2A] mb-1.5">
                Motif précis communiqué au vendeur :
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Indiquez clairement au vendeur ce qui doit être corrigé pour que son produit soit validé..."
                className="w-full p-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-medium text-[#102A2A] outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#DCE8E3]">
              <button
                type="button"
                onClick={() => setRejectingProduct(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
