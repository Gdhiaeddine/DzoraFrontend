'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Boxes,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileText,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Check,
  X,
  Package,
} from 'lucide-react'
import {
  sellerProductsService,
  SellerProductItem,
  ProductStatus,
} from '@/lib/seller-products-service'
import { useSellerDashboard } from '@/components/seller-layout-shell'
import { api, SellerSubscriptionDetails } from '@/lib/api'

interface SellerProductsManagerProps {
  storeName: string
  storeSlug: string
}

export function SellerProductsManager({ storeName, storeSlug }: SellerProductsManagerProps) {
  const { showToast, setStoreProductsCount } = useSellerDashboard()

  const [products, setProducts] = useState<SellerProductItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<SellerSubscriptionDetails | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | ProductStatus>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | 'stock_asc'>('date_desc')
  const [layoutMode, setLayoutMode] = useState<'table' | 'grid'>('table')

  // Product delete confirm state
  const [productToDelete, setProductToDelete] = useState<SellerProductItem | null>(null)

  // 1. Load products & subscription quotas
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [prods, sub] = await Promise.allSettled([
        sellerProductsService.getProducts(storeName, storeSlug),
        api.seller.getSubscription(),
      ])

      if (prods.status === 'fulfilled') {
        setProducts(prods.value)
        setStoreProductsCount(prods.value.length)
      }
      if (sub.status === 'fulfilled' && sub.value) {
        setSubscription(sub.value)
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }, [storeName, storeSlug, setStoreProductsCount])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Count metrics
  const approvedCount = useMemo(() => products.filter((p) => p.status === 'APPROVED').length, [products])
  const pendingCount = useMemo(() => products.filter((p) => p.status === 'PENDING_REVIEW').length, [products])
  const rejectedCount = useMemo(() => products.filter((p) => p.status === 'REJECTED').length, [products])
  const draftCount = useMemo(() => products.filter((p) => p.status === 'DRAFT').length, [products])
  const outOfStockCount = useMemo(() => products.filter((p) => p.stock <= 0).length, [products])

  const maxProductsQuota = subscription?.plan?.maxProducts ?? 250
  const quotaUsedPercent =
    maxProductsQuota === -1
      ? 15
      : Math.min(100, Math.round((products.length / Math.max(1, maxProductsQuota)) * 100))

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    // Status tab
    if (selectedStatusTab !== 'ALL') {
      result = result.filter((p) => p.status === selectedStatusTab)
    }

    // Category
    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'date_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price
      }
      if (sortBy === 'stock_asc') {
        return a.stock - b.stock
      }
      return 0
    })

    return result
  }, [products, searchQuery, selectedStatusTab, selectedCategory, sortBy])

  // Category list
  const availableCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return Array.from(set)
  }, [products])

  const handleDuplicate = async (p: SellerProductItem) => {
    try {
      await sellerProductsService.duplicateProduct(storeName, storeSlug, p.id)
      showToast(`Copie de « ${p.name} » créée en brouillon.`)
      await loadData()
    } catch {
      showToast('Erreur lors de la duplication.')
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!productToDelete) return
    try {
      await sellerProductsService.deleteProduct(storeSlug, productToDelete.id)
      showToast(`Le produit « ${productToDelete.name} » a été supprimé.`)
      setProductToDelete(null)
      await loadData()
    } catch {
      showToast('Erreur lors de la suppression.')
    }
  }

  // Format Algerian Dinars
  const formatPrice = (amount: number) => {
    return (amount || 0).toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
  }

  // Render Status Badge Component
  const renderStatusBadge = (product: SellerProductItem) => {
    switch (product.status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
            <CheckCircle2 size={12} className="text-[#006B55]" />
            <span>Approuvé & En ligne</span>
          </span>
        )
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            <Clock size={12} className="text-amber-600" />
            <span>En validation admin</span>
          </span>
        )
      case 'REJECTED':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200 cursor-pointer"
            title={product.rejectionReason || 'Non conforme aux règles'}
          >
            <AlertCircle size={12} className="text-red-600" />
            <span>Refusé (À corriger)</span>
          </span>
        )
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <FileText size={12} className="text-gray-500" />
            <span>Brouillon</span>
          </span>
        )
    }
  }


  return (
    <div className="w-full space-y-6 pb-12">
      {/* ----------------------------------------------------------- */}
      {/* 1. Header & Quota Progress Banner                           */}
      {/* ----------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#006B55] mb-1">
            <Boxes size={15} />
            <span>Catalogue Vendeur</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-tight">
            Gestion des Produits
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#60716F]">
            Gérez votre inventaire, suivez l'état de modération de vos articles et publiez de nouvelles références.
          </p>
        </div>

        {/* Primary CTA: Add New Product (NO MODAL) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55] transition shadow-xs cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <Link
            href="/vendeur/produits/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Nouveau produit</span>
          </Link>
        </div>
      </div>

      {/* Subscription Quota Card */}
      <div className="rounded-2xl border border-[#DCE8E3] bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#E7F2EF] text-[#006B55] shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-extrabold text-[#102A2A]">
                  Forfait Vendeur : {subscription?.plan?.name || 'Pro'}
                </p>
                <span className="rounded-md bg-[#006B55] px-1.5 py-0.2 text-[9px] font-extrabold text-white uppercase">
                  {subscription?.plan?.name || 'Pro'}
                </span>
              </div>
              <p className="text-[11px] text-[#60716F] mt-0.5">
                Capacité utilisée : <strong>{products.length}</strong> sur{' '}
                <strong>{maxProductsQuota === -1 ? 'Illimités' : maxProductsQuota}</strong> produits autorisés
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-48 space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-[#102A2A]">
                <span>Quota consommé</span>
                <span>{quotaUsedPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EAEFEF] overflow-hidden">
                <div
                  className="h-full bg-[#006B55] rounded-full transition-all duration-300"
                  style={{ width: `${quotaUsedPercent}%` }}
                />
              </div>
            </div>

            <Link
              href="/vendeur/abonnement"
              className="shrink-0 text-xs font-bold text-[#006B55] hover:underline"
            >
              Surclasser
            </Link>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. 4 Metric KPI Cards with Direct Filters                   */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: En Ligne */}
        <button
          type="button"
          onClick={() => setSelectedStatusTab(selectedStatusTab === 'APPROVED' ? 'ALL' : 'APPROVED')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedStatusTab === 'APPROVED'
              ? 'bg-[#E7F2EF] border-[#006B55] ring-2 ring-[#006B55]/15'
              : 'bg-white border-[#DCE8E3] hover:border-[#BBDDD4]'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-[#60716F]">
            <span className="font-semibold">Approuvés (En ligne)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#102A2A] font-display mt-2">
            {approvedCount}
          </div>
          <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
            Visibles sur la vitrine publique
          </p>
        </button>

        {/* KPI 2: En Attente de Validation Admin */}
        <button
          type="button"
          onClick={() => setSelectedStatusTab(selectedStatusTab === 'PENDING_REVIEW' ? 'ALL' : 'PENDING_REVIEW')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedStatusTab === 'PENDING_REVIEW'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20'
              : 'bg-white border-[#DCE8E3] hover:border-amber-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-[#60716F]">
            <span className="font-semibold">En validation admin</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Clock size={14} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#102A2A] font-display mt-2">
            {pendingCount}
          </div>
          <p className="text-[10px] text-amber-800 font-bold mt-0.5 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Examen en cours par Dzora
          </p>
        </button>

        {/* KPI 3: Rejetés / À corriger */}
        <button
          type="button"
          onClick={() => setSelectedStatusTab(selectedStatusTab === 'REJECTED' ? 'ALL' : 'REJECTED')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedStatusTab === 'REJECTED'
              ? 'bg-red-50/80 border-red-400 ring-2 ring-red-400/20'
              : 'bg-white border-[#DCE8E3] hover:border-red-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-[#60716F]">
            <span className="font-semibold">Refusés par l'admin</span>
            <div className="p-1.5 rounded-lg bg-red-100 text-red-800">
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 font-display mt-2">
            {rejectedCount}
          </div>
          <p className="text-[10px] text-red-700 font-bold mt-0.5">
            {rejectedCount > 0 ? 'Modifications requises' : 'Aucun rejet'}
          </p>
        </button>

        {/* KPI 4: Rupture & Brouillons */}
        <button
          type="button"
          onClick={() => setSelectedStatusTab(selectedStatusTab === 'DRAFT' ? 'ALL' : 'DRAFT')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedStatusTab === 'DRAFT'
              ? 'bg-gray-100 border-gray-400 ring-2 ring-gray-400/20'
              : 'bg-white border-[#DCE8E3] hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-[#60716F]">
            <span className="font-semibold">Brouillons & Ruptures</span>
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
              <FileText size={14} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#102A2A] font-display mt-2">
            {draftCount}{' '}
            <span className="text-xs font-semibold text-[#71827D]">
              ({outOfStockCount} hors stock)
            </span>
          </div>
          <p className="text-[10px] text-[#71827D] font-medium mt-0.5">
            Non publiés sur le marketplace
          </p>
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. Toolbar: Search, Category, Sorting & View Toggle         */}
      {/* ----------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#DCE8E3] p-4 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E8F0ED] text-xs font-semibold scrollbar-none">
          {[
            { id: 'ALL', label: 'Tous les produits', count: products.length },
            { id: 'APPROVED', label: 'En ligne', count: approvedCount },
            { id: 'PENDING_REVIEW', label: 'En attente modération', count: pendingCount, highlight: pendingCount > 0 },
            { id: 'REJECTED', label: 'Refusés', count: rejectedCount, alert: rejectedCount > 0 },
            { id: 'DRAFT', label: 'Brouillons', count: draftCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatusTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedStatusTab === tab.id
                  ? 'bg-[#006B55] text-white shadow-xs font-bold'
                  : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  selectedStatusTab === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.alert
                    ? 'bg-red-100 text-red-800'
                    : tab.highlight
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-[#EAEFEF] text-[#60716F]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Actions Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A4A0]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom de produit, SKU, marque…"
              className="h-10 w-full rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] pl-10 pr-4 text-xs font-medium text-[#102A2A] placeholder:text-[#71827D] outline-none focus:border-[#006B55] focus:bg-white transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-semibold text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white cursor-pointer"
            >
              <option value="ALL">Toutes les catégories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-semibold text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white cursor-pointer"
            >
              <option value="date_desc">Plus récents</option>
              <option value="date_asc">Plus anciens</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="stock_asc">Stock le plus bas</option>
            </select>

            {/* Layout Toggle: Table vs Grid */}
            <div className="inline-flex rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setLayoutMode('table')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  layoutMode === 'table' ? 'bg-white text-[#006B55] shadow-xs' : 'text-[#60716F]'
                }`}
                title="Vue Tableau"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  layoutMode === 'grid' ? 'bg-white text-[#006B55] shadow-xs' : 'text-[#60716F]'
                }`}
                title="Vue Grille"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. Products Presentation (Table or Grid View)               */}
      {/* ----------------------------------------------------------- */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DCE8E3] p-12 text-center space-y-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#E7F2EF] text-[#006B55] mx-auto">
            <Boxes size={24} />
          </div>
          {products.length === 0 ? (
            <>
              <h3 className="font-bold text-base text-[#102A2A] font-display">
                Votre catalogue est encore vide
              </h3>
              <p className="text-xs text-[#60716F] max-w-sm mx-auto">
                Commencez à publier vos articles pour les soumettre à la modération et commencer à vendre sur Dzora.
              </p>
              <div className="pt-2">
                <Link
                  href="/vendeur/produits/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Ajouter mon premier produit</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-bold text-base text-[#102A2A] font-display">
                Aucun produit ne correspond à vos critères
              </h3>
              <p className="text-xs text-[#60716F] max-w-sm mx-auto">
                Essayez de modifier votre recherche ou vos filtres de statut pour afficher d'autres articles.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedStatusTab('ALL')
                  setSelectedCategory('ALL')
                }}
                className="px-4 py-2 rounded-xl bg-[#E7F2EF] text-[#006B55] font-bold text-xs hover:bg-[#d5eae4] transition cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </>
          )}
        </div>
      ) : layoutMode === 'table' ? (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-[#DCE8E3] overflow-hidden shadow-[0_2px_10px_rgba(16,42,42,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAF9] text-[#60716F] font-bold border-b border-[#DCE8E3] text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Prix de Vente</th>
                  <th className="py-3 px-4">Inventaire</th>
                  <th className="py-3 px-4">Statut Modération</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF0ED]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F4FAF7]/70 transition">
                    {/* Article Preview */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-xl overflow-hidden border border-[#DCE8E3] shrink-0 bg-gray-50">
                          {p.mainImage && p.mainImage.trim() ? (
                            <Image
                              src={p.mainImage}
                              alt={p.name || 'Produit'}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center bg-[#E7F2EF] text-[#006B55]">
                              <Package size={18} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-extrabold text-xs text-[#102A2A] truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-[#71827D]">
                              SKU: {p.sku}
                            </span>
                            {p.brand && (
                              <span className="text-[10px] font-medium text-[#006B55] bg-[#E7F2EF] px-1.5 py-0.2 rounded">
                                {p.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-medium text-[#4A5D58]">
                      {p.category}
                      {p.subcategory && (
                        <p className="text-[10px] text-[#71827D]">{p.subcategory}</p>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-[#102A2A]">
                      <div>{formatPrice(p.price)}</div>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <div className="text-[10px] text-[#71827D] line-through">
                          {formatPrice(p.compareAtPrice)}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`size-2 rounded-full ${
                            p.stock > p.lowStockAlert
                              ? 'bg-emerald-500'
                              : p.stock > 0
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="font-bold text-[#102A2A]">
                          {p.stock > 0 ? `${p.stock} en stock` : 'Rupture'}
                        </span>
                      </div>
                      {p.stock > 0 && p.stock <= p.lowStockAlert && (
                        <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                          Alerte seuil bas
                        </p>
                      )}
                    </td>

                    {/* Moderation Status */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {renderStatusBadge(p)}
                        {p.status === 'REJECTED' && p.rejectionReason && (
                          <p className="text-[10px] text-red-700 font-medium max-w-xs truncate" title={p.rejectionReason}>
                            Refus : {p.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/vendeur/produits/new?edit=${p.id}`}
                          className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#006B55] hover:bg-[#E7F2EF] transition cursor-pointer"
                          title="Modifier le produit"
                        >
                          <Edit3 size={13} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
                          title="Dupliquer"
                        >
                          <Copy size={13} />
                        </button>

                        <Link
                          href={storeSlug ? `/vendeur/${storeSlug}` : '/vendeur/techno-blida'}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-[#DCE8E3] bg-white text-[#60716F] hover:bg-[#F4FAF7] transition"
                          title="Voir sur la vitrine"
                        >
                          <ExternalLink size={13} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#DCE8E3] overflow-hidden flex flex-col justify-between hover:border-[#BBDDD4] hover:shadow-md transition duration-200 group"
            >
              <div>
                {/* Product Image Cover */}
                <div className="relative aspect-4/3 w-full bg-gray-50 overflow-hidden">
                  {p.mainImage && p.mainImage.trim() ? (
                    <Image
                      src={p.mainImage}
                      alt={p.name || 'Produit'}
                      fill
                      sizes="300px"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[#E7F2EF] text-[#006B55]">
                      <Package size={32} />
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    {renderStatusBadge(p)}
                  </div>
                  {p.brand && (
                    <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-[#102A2A] shadow-xs">
                      {p.brand}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#71827D]">
                    <span>{p.category}</span>
                    <span className="font-mono">SKU: {p.sku}</span>
                  </div>

                  <h4 className="font-extrabold text-xs text-[#102A2A] line-clamp-2" title={p.name}>
                    {p.name}
                  </h4>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-base font-extrabold text-[#102A2A] font-display">
                        {formatPrice(p.price)}
                      </span>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="text-[11px] text-[#71827D] line-through ml-2">
                          {formatPrice(p.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.stock > p.lowStockAlert
                          ? 'bg-emerald-50 text-emerald-800'
                          : p.stock > 0
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {p.stock > 0 ? `${p.stock} dispo` : 'Rupture'}
                    </span>
                  </div>

                  {p.status === 'REJECTED' && p.rejectionReason && (
                    <p className="text-[10px] text-red-700 bg-red-50 p-2 rounded-lg font-medium">
                      Motif rejet : {p.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-[#EAF0ED] bg-[#FBFDFD] flex items-center justify-between gap-2">
                <Link
                  href={`/vendeur/produits/new?edit=${p.id}`}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005544] transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Modifier</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleDuplicate(p)}
                  className="p-1.5 rounded-xl border border-[#DCE8E3] text-[#60716F] hover:bg-white transition cursor-pointer"
                  title="Dupliquer"
                >
                  <Copy size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => setProductToDelete(p)}
                  className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* Delete Confirmation Modal                                   */}
      {/* ----------------------------------------------------------- */}
      {productToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#DCE8E3] bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="grid size-11 place-items-center rounded-2xl bg-red-50 text-red-600 mx-auto">
              <Trash2 size={22} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-[#102A2A] font-display">
                Supprimer cet article ?
              </h3>
              <p className="text-xs text-[#60716F] leading-relaxed">
                Êtes-vous certain de vouloir supprimer définitivement «{' '}
                <strong>{productToDelete.name}</strong> » ? Cette action est irréversible.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
