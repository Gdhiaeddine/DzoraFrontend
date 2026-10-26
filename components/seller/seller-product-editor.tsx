'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Tag,
  DollarSign,
  Package,
  Layers,
  Truck,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
  Percent,
  Coins,
  Calculator,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { SellerProductItem, CreateProductInput } from '@/lib/seller-products-service'
import {
  commissionService,
  SellerPlanTier,
  CommissionCalculationResult,
  DEFAULT_PLAN_RATES,
} from '@/lib/commission-service'
import { CATEGORIES_DETAILED } from '@/lib/categories'
import { api } from '@/lib/api'

const CATEGORIES = [
  'Électronique',
  'High-Tech',
  'Mode',
  'Maison & Cuisine',
  'Beauté & Santé',
  'Sport & Loisirs',
  'Enfants & Bébés',
  'Auto & Moto',
  'Meubles',
  'Jardin & Bricolage',
]

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Smartphone Tech', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80' },
  { label: 'Écouteurs Pro', url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80' },
  { label: 'Casque Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Montre Connectée', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { label: 'Baskets Sport', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Accessoires GaN', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
]

interface SellerProductEditorProps {
  initialProduct?: SellerProductItem | null
  storeName: string
  storeSlug: string
  onSave: (data: CreateProductInput, isUpdate?: boolean) => Promise<void>
  onCancel: () => void
}

export function SellerProductEditor({
  initialProduct,
  storeName,
  storeSlug,
  onSave,
  onCancel,
}: SellerProductEditorProps) {
  const isEditing = Boolean(initialProduct)

  // Form State
  const [name, setName] = useState(initialProduct?.name || '')
  const [description, setDescription] = useState(initialProduct?.description || '')
  const [category, setCategory] = useState(initialProduct?.category || 'Électronique')
  const [subcategory, setSubcategory] = useState(initialProduct?.subcategory || '')
  const [brand, setBrand] = useState(initialProduct?.brand || storeName || '')

  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '')
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialProduct?.compareAtPrice ? String(initialProduct.compareAtPrice) : ''
  )
  const [costPrice, setCostPrice] = useState(
    initialProduct?.costPrice ? String(initialProduct.costPrice) : ''
  )

  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : '20')
  const [lowStockAlert, setLowStockAlert] = useState(
    initialProduct?.lowStockAlert ? String(initialProduct.lowStockAlert) : '5'
  )
  const [sku, setSku] = useState(
    initialProduct?.sku || `DZ-${(storeName.slice(0, 3) || 'ITM').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
  )
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '')
  const [weightKg, setWeightKg] = useState(
    initialProduct?.weightKg ? String(initialProduct.weightKg) : '0.45'
  )

  // Seller Plan & Commission Rules Sync
  const [sellerPlan, setSellerPlan] = useState<SellerPlanTier>('PRO')
  const [rulesRevision, setRulesRevision] = useState(0)

  // Load seller's actual subscription plan
  useEffect(() => {
    let isMounted = true
    api.seller
      .getSubscription()
      .then((res) => {
        if (!isMounted) return
        const planId = (res?.subscription?.planId || res?.plan?.id || '').toUpperCase()
        if (planId.includes('TRIAL') || planId.includes('ESSAI')) {
          setSellerPlan('TRIAL')
        } else if (planId.includes('START') || planId.includes('BASIC')) {
          setSellerPlan('BASIC')
        } else if (planId.includes('BUSINESS')) {
          setSellerPlan('BUSINESS')
        } else {
          setSellerPlan('PRO')
        }
      })
      .catch(() => {
        // Fallback to PRO
      })

    const onRulesUpdated = () => setRulesRevision((prev) => prev + 1)
    window.addEventListener('dzora-commission-rules-updated', onRulesUpdated)
    window.addEventListener('storage', onRulesUpdated)

    return () => {
      isMounted = false
      window.removeEventListener('dzora-commission-rules-updated', onRulesUpdated)
      window.removeEventListener('storage', onRulesUpdated)
    }
  }, [])

  // Find subcategories list for current category
  const currentCategoryDetail = useMemo(() => {
    return (
      CATEGORIES_DETAILED.find(
        (c) =>
          c.name.toLowerCase() === category.toLowerCase() ||
          c.slug.toLowerCase() === category.toLowerCase()
      ) || null
    )
  }, [category])

  // Images state
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80']
  )
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Auto calculate discount percentage
  const numPrice = Number(price) || 0
  const numCompare = Number(compareAtPrice) || 0
  const numCost = Number(costPrice) || 0

  const discountPercent =
    numCompare > numPrice && numPrice > 0
      ? Math.round(((numCompare - numPrice) / numCompare) * 100)
      : null

  // Live Commission Engine Result
  const commissionResult: CommissionCalculationResult | null = useMemo(() => {
    if (numPrice <= 0) return null
    return commissionService.calculateCommission({
      category,
      subcategory: subcategory.trim() || undefined,
      price: numPrice,
      sellerPlan,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subcategory, numPrice, sellerPlan, rulesRevision])

  const netSellerPayout = commissionResult?.netSellerPayoutDa ?? 0
  const commissionAmount = commissionResult?.commissionAmountDa ?? 0
  const commissionRate = commissionResult?.ratePercent ?? (DEFAULT_PLAN_RATES[sellerPlan] || 4.0)

  // Estimated gross profit if cost price is provided
  const netProfit = numCost > 0 && commissionResult ? netSellerPayout - numCost : null
  const marginPercent =
    numCost > 0 && numPrice > 0 && netProfit !== null
      ? Math.round((netProfit / numPrice) * 100)
      : null

  const handleAddImage = (url: string) => {
    if (!url.trim()) return
    if (!images.includes(url.trim())) {
      setImages((prev) => [...prev, url.trim()])
    }
    setCustomImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    if (images.length === 1) {
      alert('Le produit doit avoir au moins une photo de présentation.')
      return
    }
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSetMainCover = (index: number) => {
    if (index === 0) return
    setImages((prev) => {
      const copy = [...prev]
      const [selected] = copy.splice(index, 1)
      return [selected, ...copy]
    })
  }

  const handleSubmit = async (submitForReview: boolean) => {
    setFormError(null)

    if (!name.trim()) {
      setFormError('Veuillez renseigner le nom du produit.')
      return
    }

    if (!numPrice || numPrice <= 0) {
      setFormError('Veuillez renseigner un prix de vente valide supérieur à 0 DA.')
      return
    }

    if (images.length === 0) {
      setFormError('Veuillez ajouter au moins une photo pour ce produit.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(
        {
          name: name.trim(),
          description: description.trim(),
          category,
          subcategory: subcategory.trim() || undefined,
          brand: brand.trim() || storeName,
          price: numPrice,
          compareAtPrice: numCompare > 0 ? numCompare : undefined,
          costPrice: Number(costPrice) > 0 ? Number(costPrice) : undefined,
          stock: Number(stock) >= 0 ? Number(stock) : 0,
          lowStockAlert: Number(lowStockAlert) || 5,
          sku: sku.trim(),
          barcode: barcode.trim() || undefined,
          weightKg: Number(weightKg) || 0.5,
          images,
          mainImage: images[0],
          submitForReview,
        },
        isEditing
      )
    } catch (err: any) {
      setFormError(err?.message || 'Une erreur est survenue lors de l’enregistrement.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* ----------------------------------------------------------- */}
      {/* 1. Header Navigation & Breadcrumb                           */}
      {/* ----------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE8E3] pb-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] hover:text-[#005544] transition mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Retour au catalogue des produits</span>
          </button>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-tight">
              {isEditing ? `Modifier : ${initialProduct?.name}` : 'Ajouter un nouveau produit'}
            </h1>
            {isEditing && (
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  initialProduct?.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : initialProduct?.status === 'PENDING_REVIEW'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : initialProduct?.status === 'REJECTED'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {initialProduct?.status === 'APPROVED'
                  ? 'En ligne'
                  : initialProduct?.status === 'PENDING_REVIEW'
                  ? 'En cours de validation'
                  : initialProduct?.status === 'REJECTED'
                  ? 'Refusé par l’admin'
                  : 'Brouillon'}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#60716F]">
            Renseignez les détails précis de votre article. Chaque soumission est examinée par notre équipe de modération.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-[#BBDDD4] bg-[#E7F2EF] text-xs font-bold text-[#006B55] hover:bg-[#d5eae4] transition cursor-pointer disabled:opacity-50"
          >
            Enregistrer brouillon
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <ShieldCheck size={14} />
            <span>Soumettre pour validation</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {formError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Rejection Notice if product was previously rejected */}
      {initialProduct?.status === 'REJECTED' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle size={17} className="text-red-600 shrink-0" />
            <span>Motif de refus par la modération Dzora :</span>
          </div>
          <p className="text-xs text-red-800 pl-6 leading-relaxed">
            « {initialProduct.rejectionReason || 'Non-conformité aux exigences de qualité de la marketplace Dzora.'} »
          </p>
          <p className="text-[11px] text-red-700 pl-6 font-medium">
            → Corrigez les points signalés ci-dessous, puis cliquez sur <strong>« Soumettre pour validation »</strong> pour réexamen prioritaire.
          </p>
        </div>
      )}

      {/* Verification Notice Banner */}
      <div className="rounded-2xl border border-[#CCE2DB] bg-gradient-to-r from-[#F0F8F5] to-[#E7F2EF] p-4 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#006B55] text-white shrink-0 mt-0.5">
          <Clock size={16} />
        </div>
        <div className="text-xs">
          <p className="font-bold text-[#102A2A]">
            Contrôle qualité & Vérification administrative
          </p>
          <p className="text-[#4A5D58] mt-0.5 leading-relaxed">
            Pour garantir la confiance des acheteurs en Algérie, chaque nouvel article soumis passe par l'équipe de modération Dzora.
            Délai moyen de vérification : <strong>2 à 12 heures ouvrées</strong>.
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. Main Form Grid (2 Columns on Desktop)                    */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column : General Info + Media Gallery (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Identité du Produit */}
          <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8F0ED]">
              <div className="p-2 rounded-xl bg-[#E7F2EF] text-[#006B55]">
                <Package size={16} />
              </div>
              <h3 className="font-bold text-sm text-[#102A2A] font-display">
                Informations Principales
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#102A2A] mb-1.5">
                  Nom officiel du produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Smartphone Samsung Galaxy A15 128 Go 4G"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] placeholder:text-[#889B95] outline-none focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/15 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1.5">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-[#102A2A]">
                      Sous-catégorie
                    </label>
                    {currentCategoryDetail && currentCategoryDetail.subcategories.length > 0 && (
                      <span className="text-[10px] text-[#006B55] font-semibold">
                        {currentCategoryDetail.subcategories.length} suggestions
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    list="subcategory-suggestions"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder={
                      currentCategoryDetail?.subcategories[0]?.name
                        ? `Ex : ${currentCategoryDetail.subcategories[0].name}`
                        : 'Ex : Smartphones'
                    }
                    className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white transition"
                  />
                  <datalist id="subcategory-suggestions">
                    {currentCategoryDetail?.subcategories.map((sub) => (
                      <option key={sub.slug} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-[#102A2A] mb-1.5">
                    Marque / Fabricant
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex : Samsung"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1.5">
                  Description détaillée & Fiche technique
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les atouts majeurs, caractéristiques techniques, garantie et accessoires inclus dans le coffret…"
                  className="w-full p-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] placeholder:text-[#889B95] outline-none focus:border-[#006B55] focus:bg-white focus:ring-2 focus:ring-[#006B55]/15 transition leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Galerie Photos & Médias */}
          <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E7F2EF] text-[#006B55]">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#102A2A] font-display">
                    Photos & Visuels du Produit ({images.length})
                  </h3>
                  <p className="text-[11px] text-[#60716F]">
                    La première photo sera utilisée comme couverture principale sur la vitrine.
                  </p>
                </div>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border transition ${
                    idx === 0
                      ? 'border-[#006B55] ring-2 ring-[#006B55]/20 shadow-sm'
                      : 'border-[#DCE8E3] hover:border-[#BBDDD4]'
                  }`}
                >
                  {url && url.trim() ? (
                    <Image
                      src={url.trim()}
                      alt={`Photo produit ${idx + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[#E7F2EF] text-[#006B55]">
                      <Package size={20} />
                    </div>
                  )}

                  {/* Main cover badge */}
                  {idx === 0 ? (
                    <span className="absolute top-2 left-2 rounded-md bg-[#006B55] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                      Couverture
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetMainCover(idx)}
                      className="absolute top-2 left-2 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-[#102A2A] opacity-0 group-hover:opacity-100 transition hover:bg-white shadow-xs cursor-pointer"
                    >
                      Définir principale
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-700 shadow-xs cursor-pointer"
                    title="Supprimer la photo"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image Controls */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Coller l'URL d'une image (https://...)"
                  className="flex-1 h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddImage(customImageUrl)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E7F2EF] text-xs font-bold text-[#006B55] hover:bg-[#d5eae4] transition cursor-pointer flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Ajouter</span>
                </button>
              </div>

              {/* Sample Preset Photos for Instant Demo */}
              <div>
                <p className="text-[11px] font-semibold text-[#60716F] mb-1.5">
                  Exemples de photos certifiées (fond blanc studio) :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleAddImage(preset.url)}
                      className="text-[11px] font-medium bg-[#F4FAF7] hover:bg-[#E7F2EF] text-[#4A5D58] hover:text-[#006B55] border border-[#DCE8E3] px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column : Pricing, Inventory & Logistics (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 3: Tarification & Promotions */}
          <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8F0ED]">
              <div className="p-2 rounded-xl bg-[#E7F2EF] text-[#006B55]">
                <Tag size={16} />
              </div>
              <h3 className="font-bold text-sm text-[#102A2A] font-display">
                Tarification & Promotions
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Prix de vente client <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3500"
                    className="w-full h-10 pl-3.5 pr-12 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-base text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#71827D]">
                    DA
                  </span>
                </div>
              </div>

              {/* Dynamic Commission & Net Payout Card */}
              <div className="rounded-2xl border border-[#CCE2DB] bg-gradient-to-b from-[#F4FAF7] to-[#E9F5F1] p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#CCE2DB]/80">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#006B55] text-white">
                      <Coins size={14} />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#102A2A] block leading-none">
                        Commission Dzora
                      </span>
                      <span className="text-[10px] text-[#4A5D58]">
                        Barème calculé en direct
                      </span>
                    </div>
                  </div>

                  {/* Plan Badge / Selector */}
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-[#CCE2DB]">
                    <span className="text-[10px] text-[#4A5D58] font-bold">Plan :</span>
                    <select
                      value={sellerPlan}
                      onChange={(e) => setSellerPlan(e.target.value as SellerPlanTier)}
                      className="text-[11px] font-black text-[#006B55] bg-transparent outline-none cursor-pointer"
                      title="Simuler sous un autre forfait vendeur"
                    >
                      <option value="TRIAL">Essai (8%)</option>
                      <option value="BASIC">Starter (6%)</option>
                      <option value="PRO">Pro (4%)</option>
                      <option value="BUSINESS">Business (2.5%)</option>
                    </select>
                  </div>
                </div>

                {commissionResult ? (
                  <div className="space-y-2.5">
                    {/* Rate & Deduction Row */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4A5D58] font-medium flex items-center gap-1.5">
                        <span>{commissionResult.feeType === 'FIXED' ? 'Montant fixe :' : 'Taux appliqué :'}</span>
                        <span className="font-black text-[#006B55] bg-white border border-[#BBDDD4] px-1.5 py-0.5 rounded text-[11px]">
                          {commissionResult.feeType === 'FIXED'
                            ? `${(commissionResult.fixedFeeDa ?? commissionResult.commissionAmountDa).toLocaleString()} DA`
                            : commissionResult.feeType === 'HYBRID'
                            ? `${commissionResult.ratePercent}% + ${(commissionResult.fixedFeeDa ?? 0).toLocaleString()} DA`
                            : `${commissionResult.ratePercent} %`}
                        </span>
                      </span>
                      <span className="font-extrabold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs">
                        - {commissionResult.commissionAmountDa.toLocaleString()} DA
                      </span>
                    </div>

                    {/* Applied Rule Source Badge */}
                    <div className="text-[10px] text-[#4A5D58] bg-white/90 p-2 rounded-xl border border-[#DCE8E3] leading-snug">
                      <span className="font-bold text-[#102A2A]">Règle active : </span>
                      <span className="font-medium">{commissionResult.appliedRuleLabel}</span>
                    </div>

                    {/* Net Payout Prominent Card */}
                    <div className="p-3 rounded-xl bg-white border-2 border-[#006B55] shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#006B55] block">
                          Votre Versement Net
                        </span>
                        <span className="text-[9px] text-[#71827D]">
                          Montant viré sur votre compte vendeur
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#006B55] font-display">
                          {commissionResult.netSellerPayoutDa.toLocaleString()} DA
                        </span>
                      </div>
                    </div>

                    {/* Optional Gross Margin Estimation */}
                    {netProfit !== null && (
                      <div className="pt-2 border-t border-[#CCE2DB]/80 flex items-center justify-between text-[11px]">
                        <span className="text-[#4A5D58] font-medium">
                          Bénéfice net estimé :
                        </span>
                        <span
                          className={`font-black ${
                            netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {netProfit >= 0 ? '+' : ''}
                          {netProfit.toLocaleString()} DA ({marginPercent} % marge)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3 text-[11px] text-[#4A5D58] space-y-1">
                    <Calculator size={18} className="mx-auto text-[#006B55]/70" />
                    <p className="font-medium">
                      Indiquez un prix de vente pour prévisualiser la retenue Dzora et votre gain net en temps réel selon le barème de {category}.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#102A2A]">
                    Prix comparatif barré
                  </label>
                  {discountPercent && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                      -{discountPercent} %
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full h-10 pl-3.5 pr-12 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-xs text-[#60716F] outline-none focus:border-[#006B55] focus:bg-white transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71827D]">
                    DA
                  </span>
                </div>
                <p className="text-[10px] text-[#71827D] mt-1">
                  Affiché barré à côté du prix pour indiquer une promotion aux acheteurs.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Coût de revient estimé (confidentiel)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="2200"
                    className="w-full h-10 pl-3.5 pr-12 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-xs text-[#60716F] outline-none focus:border-[#006B55] focus:bg-white transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71827D]">
                    DA
                  </span>
                </div>
                <p className="text-[10px] text-[#71827D] mt-1">
                  Visible uniquement par vous dans l'onglet Finance & Rentabilité.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Inventaire & Stock */}
          <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8F0ED]">
              <div className="p-2 rounded-xl bg-[#E7F2EF] text-[#006B55]">
                <Layers size={16} />
              </div>
              <h3 className="font-bold text-sm text-[#102A2A] font-display">
                Inventaire & Réf (SKU)
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Quantité en stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-sm text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Seuil alerte stock bas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-xs text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Référence SKU (Code Article)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-mono text-xs font-semibold text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Code-barres EAN / GTIN
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="613..."
                  className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-mono text-xs text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Poids estimé (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-xs text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                />
                <p className="text-[10px] text-[#71827D] mt-1">
                  Requis pour l'estimation automatique du tarif de livraison Yalidine / ZR Express.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. Sticky Bottom Action Bar (Clear & Accessible)            */}
      {/* ----------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DCE8E3] p-4 lg:pl-[280px]">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#60716F]">
            <Info size={15} className="text-[#006B55]" />
            <span>
              Les modifications d'articles existants sont soumises à revalidation pour protéger les acheteurs.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#BBDDD4] bg-[#E7F2EF] text-xs font-bold text-[#006B55] hover:bg-[#d5eae4] transition cursor-pointer disabled:opacity-50"
            >
              Enregistrer en brouillon
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-md shadow-[#006B55]/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              <span>{isEditing ? 'Mettre à jour & Soumettre' : 'Soumettre pour validation admin'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
