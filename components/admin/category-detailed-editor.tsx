'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Layers,
  Coins,
  Percent,
  Tag,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calculator,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Package,
} from 'lucide-react'
import { CategoryDetail, SubCategoryItem, categoryIcons } from '@/lib/categories'
import {
  commissionService,
  CommissionRule,
  PriceIntervalTier,
  SellerPlanTier,
  CommissionCalculationResult,
  CommissionFeeType,
} from '@/lib/commission-service'
import { categoriesStore } from '@/lib/categories-store'
import { sellerProductsService, SellerProductItem } from '@/lib/seller-products-service'

interface CategoryDetailedEditorProps {
  initialCategory?: CategoryDetail | null
  isNew?: boolean
}

interface EditableSubcategoryCommission {
  subName: string
  subSlug: string
  badge?: string
  feeType: CommissionFeeType
  baseRatePercent: number
  baseFixedFeeDa: number
  targetPlan: 'ALL' | SellerPlanTier
  priceTiers: PriceIntervalTier[]
  isExpanded?: boolean
}

export function CategoryDetailedEditor({
  initialCategory,
  isNew = false,
}: CategoryDetailedEditorProps) {
  const router = useRouter()

  // Form State: Category Metadata
  const [name, setName] = useState(initialCategory?.name || '')
  const [slug, setSlug] = useState(initialCategory?.slug || '')
  const [icon, setIcon] = useState(initialCategory?.icon || '📁')
  const [description, setDescription] = useState(initialCategory?.description || '')
  const [isFeatured, setIsFeatured] = useState(Boolean(initialCategory?.featuredHighlight))
  const [featuredTitle, setFeaturedTitle] = useState(
    initialCategory?.featuredHighlight?.title || ''
  )
  const [featuredSubtitle, setFeaturedSubtitle] = useState(
    initialCategory?.featuredHighlight?.subtitle || ''
  )

  // Main Category Commission
  const [mainCategoryFeeType, setMainCategoryFeeType] = useState<CommissionFeeType>('PERCENT')
  const [mainCategoryBaseRate, setMainCategoryBaseRate] = useState<number>(5.0)
  const [mainCategoryFixedFee, setMainCategoryFixedFee] = useState<number>(200)
  const [mainCategoryPlan, setMainCategoryPlan] = useState<'ALL' | SellerPlanTier>('ALL')
  const [mainCategoryTiers, setMainCategoryTiers] = useState<PriceIntervalTier[]>([])

  // Subcategories + their detailed commissions state
  const [subcategories, setSubcategories] = useState<EditableSubcategoryCommission[]>([])
  const [newSubName, setNewSubName] = useState('')
  const [newSubBadge, setNewSubBadge] = useState('')

  // Simulator State
  const [simSub, setSimSub] = useState('')
  const [simPrice, setSimPrice] = useState(35000)
  const [simPlan, setSimPlan] = useState<SellerPlanTier>('PRO')

  // Retroactive commission modal state for already approved articles
  const [showApprovedModal, setShowApprovedModal] = useState(false)
  const [approvedCount, setApprovedCount] = useState(0)
  const [retroactiveMode, setRetroactiveMode] = useState<'KEEP_EXISTING' | 'RETROACTIVE'>('KEEP_EXISTING')

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'commissions' | 'subcategories' | 'general'>('commissions')

  // Slug auto-generation for new categories
  const handleNameChange = (val: string) => {
    setName(val)
    if (isNew && !slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(generated)
    }
  }

  // Load existing rules for this category
  useEffect(() => {
    if (initialCategory) {
      const existingRules = commissionService.getRulesForCategory(initialCategory.slug)

      // Main category rule
      const mainRule = existingRules.find((r) => !r.subcategorySlug && !r.subcategoryName)
      if (mainRule) {
        setMainCategoryFeeType(mainRule.feeType || 'PERCENT')
        setMainCategoryBaseRate(mainRule.baseRatePercent)
        setMainCategoryFixedFee(mainRule.baseFixedFeeDa || 200)
        setMainCategoryPlan(mainRule.targetPlan)
        setMainCategoryTiers(mainRule.priceTiers || [])
      }

      // Map subcategories with their rules
      const mappedSubs: EditableSubcategoryCommission[] = initialCategory.subcategories.map(
        (sub, idx) => {
          const rule = existingRules.find(
            (r) =>
              r.subcategorySlug?.toLowerCase().trim() === sub.slug.toLowerCase().trim() ||
              r.subcategoryName?.toLowerCase().trim() === sub.name.toLowerCase().trim()
          )

          return {
            subName: sub.name,
            subSlug: sub.slug,
            badge: sub.badge,
            feeType: rule?.feeType || 'PERCENT',
            baseRatePercent: rule ? rule.baseRatePercent : 4.0,
            baseFixedFeeDa: rule?.baseFixedFeeDa || 200,
            targetPlan: rule ? rule.targetPlan : 'ALL',
            priceTiers: rule?.priceTiers ? [...rule.priceTiers] : [],
            isExpanded:
              typeof window !== 'undefined' &&
              window.location.hash.toLowerCase().includes('subcategories')
                ? true
                : idx === 0,
          }
        }
      )

      setSubcategories(mappedSubs)
      if (mappedSubs.length > 0) {
        setSimSub(mappedSubs[0].subName)
      }

      if (
        typeof window !== 'undefined' &&
        window.location.hash.toLowerCase().includes('subcategories')
      ) {
        setTimeout(() => {
          const el = document.getElementById('subcategories')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      }
    } else {
      // Defaults for brand new category
      setSubcategories([
        {
          subName: 'Articles Principaux',
          subSlug: 'articles-principaux',
          feeType: 'PERCENT',
          baseRatePercent: 5.0,
          baseFixedFeeDa: 200,
          targetPlan: 'ALL',
          priceTiers: [
            { id: 'tier-init-1', minPrice: 0, maxPrice: 20000, ratePercent: 5.0, label: '< 20 000 DA' },
            { id: 'tier-init-2', minPrice: 20001, maxPrice: null, ratePercent: 4.0, label: '> 20 000 DA' },
          ],
          isExpanded: true,
        },
      ])
    }
  }, [initialCategory])

  // Subcategory Management
  const handleAddSubcategory = () => {
    if (!newSubName.trim()) return
    const subSlug = newSubName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (subcategories.some((s) => s.subSlug === subSlug)) {
      alert('Une sous-catégorie avec cet identifiant existe déjà.')
      return
    }

    setSubcategories((prev) => [
      ...prev,
      {
        subName: newSubName.trim(),
        subSlug,
        badge: newSubBadge.trim() || undefined,
        feeType: mainCategoryFeeType,
        baseRatePercent: mainCategoryBaseRate,
        baseFixedFeeDa: mainCategoryFixedFee,
        targetPlan: 'ALL',
        priceTiers: [],
        isExpanded: true,
      },
    ])
    setNewSubName('')
    setNewSubBadge('')
  }

  const handleRemoveSubcategory = (index: number) => {
    if (confirm('Voulez-vous supprimer cette sous-catégorie et son barème ?')) {
      setSubcategories((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const toggleSubExpanded = (index: number) => {
    setSubcategories((prev) =>
      prev.map((sub, i) => (i === index ? { ...sub, isExpanded: !sub.isExpanded } : sub))
    )
  }

  // Price Tier Management for Subcategories
  const handleAddTierToSub = (
    subIndex: number,
    defaultType: CommissionFeeType = 'PERCENT',
    defaultRate = 3.5,
    defaultFixed = 200,
    label?: string
  ) => {
    setSubcategories((prev) => {
      const copy = [...prev]
      const sub = { ...copy[subIndex] }
      const currentTiers = sub.priceTiers || []

      let nextMin = 0
      if (currentTiers.length > 0) {
        const last = currentTiers[currentTiers.length - 1]
        nextMin = last.maxPrice !== null ? last.maxPrice + 1 : last.minPrice + 20000
      }

      const newTier: PriceIntervalTier = {
        id: `tier-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        minPrice: nextMin,
        maxPrice: null,
        feeType: defaultType,
        ratePercent: defaultType === 'FIXED' ? 0 : defaultRate,
        fixedFeeDa: defaultType === 'PERCENT' ? 0 : defaultFixed,
        label: label || `Palier ${currentTiers.length + 1}`,
      }

      sub.priceTiers = [...currentTiers, newTier]
      copy[subIndex] = sub
      return copy
    })
  }

  const handleUpdateSubTier = (
    subIndex: number,
    tierIndex: number,
    field: keyof PriceIntervalTier,
    value: any
  ) => {
    setSubcategories((prev) => {
      const copy = [...prev]
      const sub = { ...copy[subIndex] }
      const tiers = [...sub.priceTiers]
      tiers[tierIndex] = { ...tiers[tierIndex], [field]: value }
      sub.priceTiers = tiers
      copy[subIndex] = sub
      return copy
    })
  }

  const handleRemoveSubTier = (subIndex: number, tierIndex: number) => {
    setSubcategories((prev) => {
      const copy = [...prev]
      const sub = { ...copy[subIndex] }
      sub.priceTiers = sub.priceTiers.filter((_, idx) => idx !== tierIndex)
      copy[subIndex] = sub
      return copy
    })
  }

  // Preset Generator for Subcategory Tiers
  const handleApplyPresetTiers = (
    subIndex: number,
    type: 'HIGH_TECH' | 'FIXED_FEES' | 'HYBRID' | 'STANDARD'
  ) => {
    setSubcategories((prev) => {
      const copy = [...prev]
      const sub = { ...copy[subIndex] }

      if (type === 'FIXED_FEES') {
        // Montants Fixes en DA (ex: 100 DA ou 500 DA)
        sub.feeType = 'FIXED'
        sub.baseFixedFeeDa = 200
        sub.baseRatePercent = 0
        sub.priceTiers = [
          {
            id: `t1-${Date.now()}`,
            minPrice: 0,
            maxPrice: 2000,
            feeType: 'FIXED',
            ratePercent: 0,
            fixedFeeDa: 100,
            label: 'Petits articles (< 2 000 DA : 100 DA fixe)',
          },
          {
            id: `t2-${Date.now()}`,
            minPrice: 2001,
            maxPrice: 15000,
            feeType: 'FIXED',
            ratePercent: 0,
            fixedFeeDa: 300,
            label: 'Articles moyens (2k-15k DA : 300 DA fixe)',
          },
          {
            id: `t3-${Date.now()}`,
            minPrice: 15001,
            maxPrice: null,
            feeType: 'FIXED',
            ratePercent: 0,
            fixedFeeDa: 500,
            label: 'Articles chers (> 15k DA : 500 DA fixe)',
          },
        ]
      } else if (type === 'HYBRID') {
        // Mixte (% + DA fixe)
        sub.feeType = 'HYBRID'
        sub.baseRatePercent = 2.5
        sub.baseFixedFeeDa = 150
        sub.priceTiers = [
          {
            id: `t1-${Date.now()}`,
            minPrice: 0,
            maxPrice: 5000,
            feeType: 'FIXED',
            ratePercent: 0,
            fixedFeeDa: 150,
            label: '< 5 000 DA (150 DA fixe)',
          },
          {
            id: `t2-${Date.now()}`,
            minPrice: 5001,
            maxPrice: 30000,
            feeType: 'HYBRID',
            ratePercent: 2.5,
            fixedFeeDa: 150,
            label: '5k à 30k DA (2.5% + 150 DA)',
          },
          {
            id: `t3-${Date.now()}`,
            minPrice: 30001,
            maxPrice: null,
            feeType: 'PERCENT',
            ratePercent: 3.0,
            fixedFeeDa: 0,
            label: '> 30k DA (3.0% pur)',
          },
        ]
      } else if (type === 'HIGH_TECH') {
        sub.feeType = 'PERCENT'
        sub.baseRatePercent = 3.5
        sub.priceTiers = [
          { id: `t1-${Date.now()}`, minPrice: 0, maxPrice: 30000, feeType: 'PERCENT', ratePercent: 4.0, fixedFeeDa: 0, label: 'Moins de 30k DA' },
          { id: `t2-${Date.now()}`, minPrice: 30001, maxPrice: 80000, feeType: 'PERCENT', ratePercent: 3.0, fixedFeeDa: 0, label: '30k à 80k DA' },
          { id: `t3-${Date.now()}`, minPrice: 80001, maxPrice: null, feeType: 'PERCENT', ratePercent: 2.5, fixedFeeDa: 0, label: 'Plus de 80k DA' },
        ]
      } else {
        sub.feeType = 'PERCENT'
        sub.baseRatePercent = 5.0
        sub.priceTiers = [
          { id: `t1-${Date.now()}`, minPrice: 0, maxPrice: 15000, feeType: 'PERCENT', ratePercent: 5.5, fixedFeeDa: 0, label: '< 15 000 DA' },
          { id: `t2-${Date.now()}`, minPrice: 15001, maxPrice: 50000, feeType: 'PERCENT', ratePercent: 4.5, fixedFeeDa: 0, label: '15k - 50k DA' },
          { id: `t3-${Date.now()}`, minPrice: 50001, maxPrice: null, feeType: 'PERCENT', ratePercent: 3.5, fixedFeeDa: 0, label: '> 50k DA' },
        ]
      }

      copy[subIndex] = sub
      return copy
    })
  }

  // Live Simulator calculation
  const simResult: CommissionCalculationResult = useMemo(() => {
    const targetSub = subcategories.find(
      (s) => s.subName.toLowerCase() === simSub.toLowerCase() || s.subSlug === simSub.toLowerCase()
    )

    let feeType: CommissionFeeType = targetSub ? targetSub.feeType : mainCategoryFeeType
    let rate = targetSub ? targetSub.baseRatePercent : mainCategoryBaseRate
    let fixedFee = targetSub ? targetSub.baseFixedFeeDa : mainCategoryFixedFee
    let label = targetSub ? `Sous-rayon : ${targetSub.subName}` : `Rayon : ${name || 'Nouveau'}`

    if (targetSub && targetSub.priceTiers.length > 0) {
      const match = targetSub.priceTiers.find((t) => {
        if (t.maxPrice === null) return simPrice >= t.minPrice
        return simPrice >= t.minPrice && simPrice <= t.maxPrice
      })
      if (match) {
        if (match.feeType) feeType = match.feeType
        rate = match.ratePercent
        if (match.fixedFeeDa !== undefined) fixedFee = match.fixedFeeDa
        label += ` (Palier: ${match.label || `${match.minPrice}-${match.maxPrice || '∞'}`})`
      }
    }

    if (simPlan === 'BUSINESS') {
      rate = Math.max(1.5, Number((rate - 1.0).toFixed(1)))
      fixedFee = Math.max(0, Math.round(fixedFee * 0.85))
    } else if (simPlan === 'PRO') {
      rate = Math.max(2.0, Number((rate - 0.5).toFixed(1)))
      fixedFee = Math.max(0, Math.round(fixedFee * 0.92))
    }

    let commDa = 0
    if (feeType === 'FIXED') {
      commDa = fixedFee
    } else if (feeType === 'HYBRID') {
      commDa = Math.round((simPrice * rate) / 100) + fixedFee
    } else {
      commDa = Math.round((simPrice * rate) / 100)
    }

    commDa = Math.max(0, commDa)
    return {
      sellingPriceDa: simPrice,
      ratePercent: rate,
      fixedFeeDa: fixedFee,
      feeType,
      commissionAmountDa: commDa,
      netSellerPayoutDa: Math.max(0, simPrice - commDa),
      ruleSource: targetSub ? 'SUBCATEGORY_TIER' : 'CATEGORY',
      appliedRuleLabel: label,
      planApplied: simPlan,
    }
  }, [name, subcategories, mainCategoryFeeType, mainCategoryBaseRate, mainCategoryFixedFee, simSub, simPrice, simPlan])

  // Save Validation & Trigger
  const handleSave = async () => {
    setFormError(null)

    if (!name.trim()) {
      setFormError('Veuillez renseigner le nom de la catégorie.')
      return
    }

    if (!slug.trim()) {
      setFormError('Veuillez renseigner le slug identifiant de la catégorie.')
      return
    }

    if (subcategories.length === 0) {
      setFormError('Veuillez définir au moins une sous-catégorie.')
      return
    }

    // Check if there are already approved products in this category
    const targetSlug = slug.toLowerCase().trim()
    try {
      const allApproved = await sellerProductsService.getAllApprovedProducts()
      const matching = allApproved.filter(
        (p) =>
          p.category.toLowerCase().trim() === name.toLowerCase().trim() ||
          p.category.toLowerCase().trim() === targetSlug ||
          (initialCategory && p.category.toLowerCase().trim() === initialCategory.name.toLowerCase().trim())
      )

      if (matching.length > 0) {
        setApprovedCount(matching.length)
        setShowApprovedModal(true)
        return
      }
    } catch (err) {
      console.warn('Erreur vérification articles approuvés:', err)
    }

    // If no approved articles exist, proceed directly with standard save
    await executeSave('KEEP_EXISTING')
  }

  // Atomically execute save with user-chosen policy
  const executeSave = async (mode: 'KEEP_EXISTING' | 'RETROACTIVE') => {
    setIsSubmitting(true)
    setShowApprovedModal(false)
    try {
      const targetSlug = slug.toLowerCase().trim()

      // 1. Prepare Category Detail Object
      const categoryData: CategoryDetail = {
        name: name.trim(),
        slug: targetSlug,
        icon: icon.trim() || '📁',
        lucideIcon: initialCategory?.lucideIcon || categoryIcons[name.trim()]?.icon || Package,
        color: initialCategory?.color || 'text-[#006B55]',
        bg: initialCategory?.bg || 'bg-[#E8F4F1]',
        description: description.trim() || `Rayon officiel ${name.trim()} sur Dzora Marketplace.`,
        subcategories: subcategories.map((s) => ({
          name: s.subName.trim(),
          slug: s.subSlug.trim(),
          badge: s.badge ? s.badge.trim() : undefined,
        })),
        featuredHighlight: isFeatured && featuredTitle.trim()
          ? {
              title: featuredTitle.trim(),
              subtitle: featuredSubtitle.trim() || 'Sélection officielle certifiée Dzora',
              linkText: 'Découvrir la sélection',
            }
          : undefined,
      }

      // 2. Prepare Commission Rules for Category + Every Subcategory
      const generatedRules: CommissionRule[] = []

      // Main category rule
      generatedRules.push({
        id: `rule-cat-${targetSlug}`,
        categorySlug: targetSlug,
        categoryName: name.trim(),
        targetPlan: mainCategoryPlan,
        feeType: mainCategoryFeeType,
        baseRatePercent: Number(mainCategoryBaseRate) || 0,
        baseFixedFeeDa: Number(mainCategoryFixedFee) || 0,
        priceTiers: mainCategoryTiers.length > 0 ? mainCategoryTiers : undefined,
        updatedAt: new Date().toISOString(),
      })

      // Rules for each subcategory
      subcategories.forEach((sub) => {
        generatedRules.push({
          id: `rule-sub-${targetSlug}-${sub.subSlug}`,
          categorySlug: targetSlug,
          categoryName: name.trim(),
          subcategorySlug: sub.subSlug,
          subcategoryName: sub.subName,
          targetPlan: sub.targetPlan,
          feeType: sub.feeType || 'PERCENT',
          baseRatePercent: Number(sub.baseRatePercent) || 0,
          baseFixedFeeDa: Number(sub.baseFixedFeeDa) || 0,
          priceTiers: sub.priceTiers.length > 0 ? sub.priceTiers : undefined,
          updatedAt: new Date().toISOString(),
        })
      })

      // 3. Persist to Stores
      categoriesStore.upsertCategory(categoryData)
      commissionService.saveRulesForCategory(targetSlug, generatedRules)

      // 4. Update policy on existing approved products
      await sellerProductsService.updateApprovedProductsCommissionPolicy(targetSlug, mode)

      // 5. Redirect to category view page
      router.push(`/admin/dashboard/categories/${targetSlug}`)
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement de la catégorie.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6 pb-28 max-w-none">
      {/* Top Header & Breadcrumb (Matches other admin pages) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE8E3] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#60716F] mb-1">
            <Link href="/admin/dashboard" className="hover:text-[#006B55] transition">
              Tableau de bord
            </Link>
            <ChevronRight size={12} className="text-[#94A4A0]" />
            <span className="text-[#60716F]">Catalogue</span>
            <ChevronRight size={12} className="text-[#94A4A0]" />
            <Link href="/admin/dashboard/categories" className="hover:text-[#006B55] transition">
              Catégories
            </Link>
            {initialCategory && (
              <>
                <ChevronRight size={12} className="text-[#94A4A0]" />
                <Link
                  href={`/admin/dashboard/categories/${initialCategory.slug}`}
                  className="hover:text-[#006B55] transition"
                >
                  {initialCategory.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} className="text-[#94A4A0]" />
            <span className="text-[#102A2A] font-semibold">{isNew ? 'Nouveau Rayon' : 'Édition Barème'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
            {isNew ? 'Créer un Nouveau Rayon' : `Modifier : ${name || initialCategory?.name}`}
          </h1>
          <p className="text-xs font-medium text-[#60716F] mt-0.5">
            Configurez les commissions en pourcentage (%) ou montant fixe en DA (ex: 100 DA, 500 DA) par palier
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={initialCategory ? `/admin/dashboard/categories/${initialCategory.slug}` : '/admin/dashboard/categories'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <ArrowLeft size={14} />
            <span>{initialCategory ? 'Retour à la fiche' : 'Retour aux rayons'}</span>
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            <span>Enregistrer le rayon & barèmes</span>
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE8E3] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'commissions'
              ? 'bg-[#006B55] text-white shadow-xs'
              : 'bg-[#F7FAF9] text-[#4A5D58] hover:bg-[#E7F2EF] hover:text-[#006B55]'
          }`}
        >
          <Coins size={14} />
          <span>1. Barèmes & Montants Fixes DA ({subcategories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subcategories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'subcategories'
              ? 'bg-[#006B55] text-white shadow-xs'
              : 'bg-[#F7FAF9] text-[#4A5D58] hover:bg-[#E7F2EF] hover:text-[#006B55]'
          }`}
        >
          <Layers size={14} />
          <span>2. Liste des Sous-catégories</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'general'
              ? 'bg-[#006B55] text-white shadow-xs'
              : 'bg-[#F7FAF9] text-[#4A5D58] hover:bg-[#E7F2EF] hover:text-[#006B55]'
          }`}
        >
          <Tag size={14} />
          <span>3. Identité du Rayon & Visuel</span>
        </button>
      </div>

      {/* Main Content Grid (Full Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Form Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: COMMISSIONS & PRICE TIERS FOR EACH SUBCATEGORY */}
          {activeTab === 'commissions' && (
            <div className="space-y-6">
              {/* Card A: Main Category Default Commission */}
              <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#E7F2EF] text-[#006B55]">
                      <Coins size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#102A2A] font-display">
                        Taux Général du Rayon ({name || 'Ce rayon'})
                      </h3>
                      <p className="text-[11px] text-[#60716F]">
                        Barème par défaut appliqué aux sous-rayons sans règle personnalisée
                      </p>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-[#F7FAF9] p-1 rounded-xl border border-[#DCE8E3]">
                    <button
                      type="button"
                      onClick={() => setMainCategoryFeeType('PERCENT')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        mainCategoryFeeType === 'PERCENT'
                          ? 'bg-[#006B55] text-white shadow-xs'
                          : 'text-[#4A5D58] hover:text-[#102A2A]'
                      }`}
                    >
                      % Pourcentage
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainCategoryFeeType('FIXED')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        mainCategoryFeeType === 'FIXED'
                          ? 'bg-[#006B55] text-white shadow-xs'
                          : 'text-[#4A5D58] hover:text-[#102A2A]'
                      }`}
                    >
                      DA Fixe
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainCategoryFeeType('HYBRID')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        mainCategoryFeeType === 'HYBRID'
                          ? 'bg-[#006B55] text-white shadow-xs'
                          : 'text-[#4A5D58] hover:text-[#102A2A]'
                      }`}
                    >
                      Mixte (% + DA)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Rate % (if PERCENT or HYBRID) */}
                  {mainCategoryFeeType !== 'FIXED' && (
                    <div>
                      <label className="block font-bold text-[#102A2A] mb-1">
                        Taux de base (%) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="30"
                          value={mainCategoryBaseRate}
                          onChange={(e) => setMainCategoryBaseRate(Number(e.target.value) || 0)}
                          className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-base text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71827D]">
                          %
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fixed Fee DA (if FIXED or HYBRID) */}
                  {(mainCategoryFeeType === 'FIXED' || mainCategoryFeeType === 'HYBRID') && (
                    <div>
                      <label className="block font-bold text-[#102A2A] mb-1">
                        Montant fixe retenu (DA) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="50"
                          min="0"
                          placeholder="ex: 100 ou 500"
                          value={mainCategoryFixedFee}
                          onChange={(e) => setMainCategoryFixedFee(Number(e.target.value) || 0)}
                          className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-base text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71827D]">
                          DA
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-[#102A2A] mb-1">
                      Forfait vendeur cible
                    </label>
                    <select
                      value={mainCategoryPlan}
                      onChange={(e) => setMainCategoryPlan(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-xs text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                    >
                      <option value="ALL">Tous les forfaits (ALL)</option>
                      <option value="TRIAL">Forfait Essai uniquement</option>
                      <option value="BASIC">Forfait Starter uniquement</option>
                      <option value="PRO">Forfait Pro uniquement</option>
                      <option value="BUSINESS">Forfait Business uniquement</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card B: Granular Commission for EACH Subcategory */}
              <div id="subcategories" className="space-y-4 scroll-mt-24">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-[#102A2A] font-display">
                      Barèmes Spécifiques par Sous-catégorie
                    </h3>
                    <p className="text-xs text-[#60716F]">
                      Définissez des pourcentages ou montants fixes (ex: 100 DA, 500 DA) par palier de prix
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3 py-1 rounded-full border border-[#BBDDD4]">
                    {subcategories.length} sous-rayon{subcategories.length > 1 ? 's' : ''}
                  </span>
                </div>

                {subcategories.map((sub, subIdx) => {
                  const feeSummary =
                    sub.feeType === 'FIXED'
                      ? `${sub.baseFixedFeeDa.toLocaleString()} DA fixe`
                      : sub.feeType === 'HYBRID'
                      ? `${sub.baseRatePercent}% + ${sub.baseFixedFeeDa.toLocaleString()} DA`
                      : `${sub.baseRatePercent} %`

                  return (
                    <div
                      key={sub.subSlug}
                      className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.02)] overflow-hidden"
                    >
                      {/* Subcategory Accordion Header */}
                      <div
                        onClick={() => toggleSubExpanded(subIdx)}
                        className="p-4 sm:p-5 bg-gradient-to-r from-[#F9FCFA] to-white flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F4FAF7] transition border-b border-[#EAF0ED]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="size-8 rounded-xl bg-[#006B55] text-white font-black text-xs grid place-items-center shrink-0">
                            {subIdx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-[#102A2A] font-display">
                                {sub.subName}
                              </h4>
                              <span className="font-mono text-[10px] text-[#71827D] bg-white px-1.5 py-0.5 rounded border border-[#DCE8E3]">
                                /{sub.subSlug}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#60716F]">
                              Base : <strong>{feeSummary}</strong> ·{' '}
                              {sub.priceTiers.length} palier{sub.priceTiers.length > 1 ? 's' : ''} de montant DA
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-black text-[#006B55] bg-[#E7F2EF] px-2.5 py-1 rounded-lg border border-[#BBDDD4]">
                            {sub.priceTiers.length > 0 ? `${sub.priceTiers.length} paliers actifs` : feeSummary}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-[#71827D] transition-transform ${
                              sub.isExpanded ? 'rotate-180 text-[#006B55]' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* Subcategory Commission Details Form */}
                      {sub.isExpanded && (
                        <div className="p-5 space-y-5 bg-white">
                          {/* Subcategory Base Rate & Plan */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end">
                            {/* Fee Type Selector */}
                            <div className="sm:col-span-3">
                              <label className="block font-bold text-[#102A2A] mb-1">
                                Type de barème
                              </label>
                              <select
                                value={sub.feeType}
                                onChange={(e) => {
                                  const val = e.target.value as CommissionFeeType
                                  setSubcategories((prev) => {
                                    const copy = [...prev]
                                    copy[subIdx] = { ...copy[subIdx], feeType: val }
                                    return copy
                                  })
                                }}
                                className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-xs text-[#006B55] outline-none focus:border-[#006B55]"
                              >
                                <option value="PERCENT">% Pourcentage</option>
                                <option value="FIXED">Montant Fixe (DA)</option>
                                <option value="HYBRID">Mixte (% + DA)</option>
                              </select>
                            </div>

                            {/* Percentage (if not fixed) */}
                            {sub.feeType !== 'FIXED' && (
                              <div className={sub.feeType === 'HYBRID' ? 'sm:col-span-2' : 'sm:col-span-3'}>
                                <label className="block font-bold text-[#102A2A] mb-1">
                                  Taux base (%)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="30"
                                  value={sub.baseRatePercent}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0
                                    setSubcategories((prev) => {
                                      const copy = [...prev]
                                      copy[subIdx] = { ...copy[subIdx], baseRatePercent: val }
                                      return copy
                                    })
                                  }}
                                  className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                                />
                              </div>
                            )}

                            {/* Fixed DA (if not percent) */}
                            {(sub.feeType === 'FIXED' || sub.feeType === 'HYBRID') && (
                              <div className={sub.feeType === 'HYBRID' ? 'sm:col-span-2' : 'sm:col-span-3'}>
                                <label className="block font-bold text-[#102A2A] mb-1">
                                  Fixe base (DA)
                                </label>
                                <input
                                  type="number"
                                  step="50"
                                  min="0"
                                  placeholder="ex: 100 ou 500"
                                  value={sub.baseFixedFeeDa}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0
                                    setSubcategories((prev) => {
                                      const copy = [...prev]
                                      copy[subIdx] = { ...copy[subIdx], baseFixedFeeDa: val }
                                      return copy
                                    })
                                  }}
                                  className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                                />
                              </div>
                            )}

                            <div className="sm:col-span-2">
                              <label className="block font-bold text-[#102A2A] mb-1">
                                Forfait cible
                              </label>
                              <select
                                value={sub.targetPlan}
                                onChange={(e) => {
                                  const val = e.target.value as any
                                  setSubcategories((prev) => {
                                    const copy = [...prev]
                                    copy[subIdx] = { ...copy[subIdx], targetPlan: val }
                                    return copy
                                  })
                                }}
                                className="w-full h-9 px-2 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-xs text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                              >
                                <option value="ALL">Tous (ALL)</option>
                                <option value="TRIAL">Essai</option>
                                <option value="BASIC">Starter</option>
                                <option value="PRO">Pro</option>
                                <option value="BUSINESS">Business</option>
                              </select>
                            </div>

                            {/* Quick Presets */}
                            <div className="sm:col-span-5">
                              <label className="block font-bold text-[#102A2A] mb-1">
                                Modèles rapides
                              </label>
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleApplyPresetTiers(subIdx, 'FIXED_FEES')}
                                  className="px-2 py-1 text-[10px] font-bold bg-[#E7F2EF] text-[#006B55] rounded-lg hover:bg-[#d5ebe5] transition cursor-pointer"
                                  title="Montants fixes en DA : 100 DA (<2k), 300 DA (2k-15k), 500 DA (>15k)"
                                >
                                  Fixes DA (100 / 300 / 500 DA)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyPresetTiers(subIdx, 'HYBRID')}
                                  className="px-2 py-1 text-[10px] font-bold bg-[#FFF0E4] text-[#C56816] rounded-lg hover:bg-[#ffe3cf] transition cursor-pointer"
                                  title="Mixte : 150 DA (<5k), 2.5% + 150 DA (5k-30k), 3% (>30k)"
                                >
                                  Mixte % + DA
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyPresetTiers(subIdx, 'HIGH_TECH')}
                                  className="px-2 py-1 text-[10px] font-bold bg-[#F0F4F2] text-[#4A5D58] rounded-lg hover:bg-[#e4ece9] transition cursor-pointer"
                                  title="Pourcentage High-Tech : 4%, 3%, 2.5%"
                                >
                                  % Tech
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price Intervals Builder for this Subcategory */}
                          <div className="pt-3 border-t border-[#EAF0ED] space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-xs font-extrabold text-[#102A2A]">
                                Paliers de Montant (DA) & Pourcentages pour {sub.subName}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddTierToSub(
                                      subIdx,
                                      'PERCENT',
                                      3.5,
                                      200,
                                      `Palier ${sub.priceTiers.length + 1}`
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-[#006B55] hover:bg-[#005544] px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                                >
                                  <Plus size={13} />
                                  <span>+ Ajouter un palier de prix</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddTierToSub(
                                      subIdx,
                                      'FIXED',
                                      0,
                                      100,
                                      `Petit montant (100 DA fixe)`
                                    )
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006B55] bg-[#E7F2EF] hover:bg-[#d5ebe5] px-2.5 py-1.5 rounded-xl transition cursor-pointer border border-[#CCE2DB]"
                                >
                                  <span>+ 100 DA fixe</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddTierToSub(
                                      subIdx,
                                      'FIXED',
                                      0,
                                      500,
                                      `Montant standard (500 DA fixe)`
                                    )
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006B55] bg-[#E7F2EF] hover:bg-[#d5ebe5] px-2.5 py-1.5 rounded-xl transition cursor-pointer border border-[#CCE2DB]"
                                >
                                  <span>+ 500 DA fixe</span>
                                </button>
                              </div>
                            </div>

                            {sub.priceTiers.length === 0 ? (
                              <div className="p-4 rounded-xl bg-[#F7FAF9] border border-dashed border-[#CCE2DB] text-center text-xs text-[#60716F]">
                                Aucun palier défini : le barème de base (<strong>{feeSummary}</strong>) s'applique à tous les montants.
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {sub.priceTiers.map((tier, tierIdx) => {
                                  const tierType: CommissionFeeType = tier.feeType || 'PERCENT'

                                  return (
                                    <div
                                      key={tier.id}
                                      className="p-3.5 rounded-2xl border border-[#DCE8E3] bg-[#F7FAF9] space-y-3 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-3 items-center"
                                    >
                                      {/* Min Price */}
                                      <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-[#60716F] mb-1">
                                          Prix Min (DA)
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            min="0"
                                            value={tier.minPrice}
                                            onChange={(e) =>
                                              handleUpdateSubTier(
                                                subIdx,
                                                tierIdx,
                                                'minPrice',
                                                Number(e.target.value) || 0
                                              )
                                            }
                                            className="w-full h-9 pl-2.5 pr-7 rounded-xl border border-[#DCE8E3] bg-white text-xs font-black text-[#102A2A] outline-none focus:border-[#006B55]"
                                          />
                                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#71827D]">
                                            DA
                                          </span>
                                        </div>
                                      </div>

                                      {/* Max Price */}
                                      <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-[#60716F] mb-1">
                                          Prix Max (DA ou vide)
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            placeholder="Illimité (au-delà)"
                                            value={tier.maxPrice !== null ? tier.maxPrice : ''}
                                            onChange={(e) =>
                                              handleUpdateSubTier(
                                                subIdx,
                                                tierIdx,
                                                'maxPrice',
                                                e.target.value === '' ? null : Number(e.target.value)
                                              )
                                            }
                                            className="w-full h-9 pl-2.5 pr-7 rounded-xl border border-[#DCE8E3] bg-white text-xs font-black text-[#102A2A] placeholder:text-[#94A4A0] placeholder:font-normal outline-none focus:border-[#006B55]"
                                          />
                                          {tier.maxPrice !== null && (
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#71827D]">
                                              DA
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Commission Rate / Fixed Amount with % or DA Switcher */}
                                      <div className="sm:col-span-4">
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-[10px] font-bold text-[#60716F]">
                                            {tierType === 'FIXED'
                                              ? 'Montant fixe'
                                              : tierType === 'HYBRID'
                                              ? 'Mixte (% + DA)'
                                              : 'Taux (%)'}
                                          </label>
                                          {/* Direct % / DA / Mixte switcher */}
                                          <div className="inline-flex rounded-lg p-0.5 bg-[#E8F0ED] border border-[#CCE2DB]">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleUpdateSubTier(subIdx, tierIdx, 'feeType', 'PERCENT')
                                                if (!tier.ratePercent || tier.ratePercent === 0) {
                                                  handleUpdateSubTier(subIdx, tierIdx, 'ratePercent', 3.5)
                                                }
                                              }}
                                              className={`px-2 py-0.5 text-[10px] font-black rounded-md transition cursor-pointer ${
                                                tierType === 'PERCENT'
                                                  ? 'bg-[#006B55] text-white shadow-xs'
                                                  : 'text-[#4A5D58] hover:text-[#006B55]'
                                              }`}
                                              title="Appliquer un pourcentage (%)"
                                            >
                                              % Taux
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleUpdateSubTier(subIdx, tierIdx, 'feeType', 'FIXED')
                                                if (!tier.fixedFeeDa || tier.fixedFeeDa === 0) {
                                                  handleUpdateSubTier(subIdx, tierIdx, 'fixedFeeDa', 100)
                                                }
                                              }}
                                              className={`px-2 py-0.5 text-[10px] font-black rounded-md transition cursor-pointer ${
                                                tierType === 'FIXED'
                                                  ? 'bg-[#006B55] text-white shadow-xs'
                                                  : 'text-[#4A5D58] hover:text-[#006B55]'
                                              }`}
                                              title="Appliquer un montant fixe en DA"
                                            >
                                              DA Fixe
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleUpdateSubTier(subIdx, tierIdx, 'feeType', 'HYBRID')
                                                if (!tier.ratePercent || tier.ratePercent === 0) {
                                                  handleUpdateSubTier(subIdx, tierIdx, 'ratePercent', 2.5)
                                                }
                                                if (!tier.fixedFeeDa || tier.fixedFeeDa === 0) {
                                                  handleUpdateSubTier(subIdx, tierIdx, 'fixedFeeDa', 100)
                                                }
                                              }}
                                              className={`px-1.5 py-0.5 text-[10px] font-black rounded-md transition cursor-pointer ${
                                                tierType === 'HYBRID'
                                                  ? 'bg-[#006B55] text-white shadow-xs'
                                                  : 'text-[#4A5D58] hover:text-[#006B55]'
                                              }`}
                                              title="Mixte (% + DA fixe)"
                                            >
                                              Mixte
                                            </button>
                                          </div>
                                        </div>

                                        {/* Input field according to feeType */}
                                        {tierType === 'PERCENT' && (
                                          <div className="relative">
                                            <input
                                              type="number"
                                              step="0.1"
                                              min="0"
                                              max="30"
                                              value={tier.ratePercent}
                                              onChange={(e) =>
                                                handleUpdateSubTier(
                                                  subIdx,
                                                  tierIdx,
                                                  'ratePercent',
                                                  Number(e.target.value) || 0
                                                )
                                              }
                                              className="w-full h-9 pl-2.5 pr-8 rounded-xl border border-[#DCE8E3] bg-white text-xs font-black text-[#006B55] outline-none focus:border-[#006B55]"
                                            />
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#006B55]">
                                              %
                                            </span>
                                          </div>
                                        )}

                                        {tierType === 'FIXED' && (
                                          <div className="space-y-1">
                                            <div className="relative">
                                              <input
                                                type="number"
                                                step="10"
                                                min="0"
                                                placeholder="100 ou 500"
                                                value={tier.fixedFeeDa ?? 100}
                                                onChange={(e) =>
                                                  handleUpdateSubTier(
                                                    subIdx,
                                                    tierIdx,
                                                    'fixedFeeDa',
                                                    Number(e.target.value) || 0
                                                  )
                                                }
                                                className="w-full h-9 pl-2.5 pr-9 rounded-xl border border-[#DCE8E3] bg-white text-xs font-black text-[#006B55] outline-none focus:border-[#006B55]"
                                              />
                                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#006B55]">
                                                DA
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              {[100, 250, 500].map((da) => (
                                                <button
                                                  key={da}
                                                  type="button"
                                                  onClick={() =>
                                                    handleUpdateSubTier(subIdx, tierIdx, 'fixedFeeDa', da)
                                                  }
                                                  className={`px-1.5 py-0.5 rounded text-[9px] font-black border transition cursor-pointer ${
                                                    tier.fixedFeeDa === da
                                                      ? 'bg-[#006B55] text-white border-[#006B55]'
                                                      : 'bg-white text-[#4A5D58] border-[#DCE8E3] hover:border-[#006B55]'
                                                  }`}
                                                >
                                                  {da} DA
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {tierType === 'HYBRID' && (
                                          <div className="grid grid-cols-2 gap-1.5">
                                            <div className="relative">
                                              <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="30"
                                                value={tier.ratePercent}
                                                onChange={(e) =>
                                                  handleUpdateSubTier(
                                                    subIdx,
                                                    tierIdx,
                                                    'ratePercent',
                                                    Number(e.target.value) || 0
                                                  )
                                                }
                                                className="w-full h-9 pl-2 pr-6 rounded-xl border border-[#DCE8E3] bg-white text-xs font-black text-[#006B55] outline-none focus:border-[#006B55]"
                                              />
                                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#006B55]">
                                                %
                                              </span>
                                            </div>
                                            <div className="relative">
                                              <input
                                                type="number"
                                                step="10"
                                                min="0"
                                                value={tier.fixedFeeDa ?? 100}
                                                onChange={(e) =>
                                                  handleUpdateSubTier(
                                                    subIdx,
                                                    tierIdx,
                                                    'fixedFeeDa',
                                                    Number(e.target.value) || 0
                                                  )
                                                }
                                                className="w-full h-9 pl-2 pr-7 rounded-xl border border-[#DCE8E3] bg-white text-xs font-black text-[#006B55] outline-none focus:border-[#006B55]"
                                              />
                                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#006B55]">
                                                DA
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Label */}
                                      <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-bold text-[#60716F] mb-1">
                                          Libellé indicatif
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Ex: Palier 1"
                                          value={tier.label || ''}
                                          onChange={(e) =>
                                            handleUpdateSubTier(subIdx, tierIdx, 'label', e.target.value)
                                          }
                                          className="w-full h-9 px-2.5 rounded-xl border border-[#DCE8E3] bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#006B55]"
                                        />
                                      </div>

                                      {/* Delete Tier */}
                                      <div className="sm:col-span-1 flex justify-end pt-2 sm:pt-4">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSubTier(subIdx, tierIdx)}
                                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                                          title="Supprimer ce palier"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SUBCATEGORIES MANAGEMENT */}
          {activeTab === 'subcategories' && (
            <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#E7F2EF] text-[#006B55]">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A2A] font-display">
                      Arborescence des Sous-catégories
                    </h3>
                    <p className="text-xs text-[#60716F]">
                      Ajoutez, renommez ou réorganisez les sous-catégories de ce rayon
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Subcategory input */}
              <div className="p-4 rounded-xl border border-[#CCE2DB] bg-[#F7FAF9] space-y-3">
                <span className="text-xs font-bold text-[#102A2A] block">
                  + Ajouter une nouvelle sous-catégorie
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      placeholder="Nom de la sous-catégorie (ex: Smartphones & Tablettes)"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#006B55]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Badge optionnel (ex: Tendance)"
                      value={newSubBadge}
                      onChange={(e) => setNewSubBadge(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-white text-xs font-medium text-[#102A2A] outline-none focus:border-[#006B55]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddSubcategory}
                      className="w-full h-9 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Subcategories List */}
              <div className="space-y-2">
                {subcategories.map((sub, idx) => (
                  <div
                    key={sub.subSlug}
                    className="p-3.5 rounded-xl border border-[#DCE8E3] bg-white hover:bg-[#F9FCFA] transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-7 rounded-lg bg-[#E7F2EF] text-[#006B55] font-black text-xs grid place-items-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#102A2A]">{sub.subName}</span>
                          <span className="font-mono text-[10px] text-[#71827D]">/{sub.subSlug}</span>
                          {sub.badge && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {sub.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#60716F]">
                          {sub.feeType === 'FIXED'
                            ? `${sub.baseFixedFeeDa} DA fixe`
                            : sub.feeType === 'HYBRID'
                            ? `${sub.baseRatePercent}% + ${sub.baseFixedFeeDa} DA`
                            : `${sub.baseRatePercent}%`} · {sub.priceTiers.length} paliers configurés
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('commissions')
                          toggleSubExpanded(idx)
                        }}
                        className="text-xs font-bold text-[#006B55] hover:underline cursor-pointer"
                      >
                        Configurer barème
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(idx)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Supprimer la sous-catégorie"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GENERAL IDENTITY */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4 text-xs">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8F0ED]">
                <div className="p-2 rounded-xl bg-[#E7F2EF] text-[#006B55]">
                  <Tag size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#102A2A] font-display">
                    Identité & Visuel du Rayon
                  </h3>
                  <p className="text-[11px] text-[#60716F]">
                    Nom officiel affiché aux acheteurs et slug SEO
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Nom du rayon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Électronique & Objets Connectés"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Icône / Emoji
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📱 ou 🎧"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-center text-lg text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Slug URL identifiant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="electronique"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-mono text-xs font-semibold text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Description du rayon
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les catégories d'articles regroupées dans ce rayon..."
                  className="w-full p-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                />
              </div>

              {/* Featured banner toggle */}
              <div className="pt-3 border-t border-[#EAF0ED] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="size-4 accent-[#006B55] rounded"
                  />
                  <span className="font-bold text-[#102A2A]">
                    Mettre en avant ce rayon sur la page d'accueil Dzora
                  </span>
                </label>

                {isFeatured && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                    <div>
                      <label className="block font-bold text-[#102A2A] mb-1">
                        Titre du bandeau
                      </label>
                      <input
                        type="text"
                        value={featuredTitle}
                        onChange={(e) => setFeaturedTitle(e.target.value)}
                        placeholder="Ex: Tendance High-Tech 2026"
                        className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#102A2A] mb-1">
                        Sous-titre
                      </label>
                      <input
                        type="text"
                        value={featuredSubtitle}
                        onChange={(e) => setFeaturedSubtitle(e.target.value)}
                        placeholder="Ex: Jusqu'à -40% sur les smartphones"
                        className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Real-Time Verification Simulator (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E8F0ED]">
              <div className="p-1.5 rounded-lg bg-[#006B55] text-white">
                <Calculator size={15} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#102A2A] font-display">
                  Test en Temps Réel
                </h3>
                <p className="text-[10px] text-[#60716F]">
                  Vérifiez le calcul selon vos taux & montants fixes
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Sous-catégorie à tester
                </label>
                <select
                  value={simSub}
                  onChange={(e) => setSimSub(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                >
                  <option value="">Général ({name || 'Rayon'})</option>
                  {subcategories.map((sub) => (
                    <option key={sub.subSlug} value={sub.subName}>
                      {sub.subName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Prix de vente testé (DA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="500"
                    value={simPrice}
                    onChange={(e) => setSimPrice(Number(e.target.value) || 0)}
                    className="w-full h-9 pl-3 pr-10 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71827D]">
                    DA
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Forfait vendeur
                </label>
                <select
                  value={simPlan}
                  onChange={(e) => setSimPlan(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                >
                  <option value="TRIAL">Essai (8%)</option>
                  <option value="BASIC">Starter (6%)</option>
                  <option value="PRO">Pro (4%)</option>
                  <option value="BUSINESS">Business (2.5%)</option>
                </select>
              </div>

              {/* Simulation Result Card */}
              <div className="mt-4 p-4 rounded-xl border border-[#CCE2DB] bg-gradient-to-br from-[#F4FAF7] to-[#E9F5F1] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4A5D58] font-medium">Barème appliqué :</span>
                  <span className="font-black text-[#006B55] bg-white border border-[#BBDDD4] px-2 py-0.5 rounded-lg text-xs">
                    {simResult.feeType === 'FIXED'
                      ? `${simResult.fixedFeeDa.toLocaleString()} DA fixe`
                      : simResult.feeType === 'HYBRID'
                      ? `${simResult.ratePercent}% + ${simResult.fixedFeeDa.toLocaleString()} DA`
                      : `${simResult.ratePercent} %`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#4A5D58] font-medium">Retenue Dzora :</span>
                  <span className="font-extrabold text-amber-900">
                    -{simResult.commissionAmountDa.toLocaleString()} DA
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border-2 border-[#006B55] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#4A5D58] uppercase tracking-wider block">
                      Net Vendeur
                    </span>
                    <span className="text-[9px] text-[#71827D]">Gain versé</span>
                  </div>
                  <span className="text-base font-black text-[#006B55] font-display">
                    {simResult.netSellerPayoutDa.toLocaleString()} DA
                  </span>
                </div>

                <div className="text-[10px] text-[#4A5D58] bg-white/70 p-2 rounded-lg border border-[#DCE8E3] leading-snug">
                  <span className="font-bold">Règle : </span>
                  <span>{simResult.appliedRuleLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DCE8E3] p-4 lg:pl-[240px]">
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#60716F]">
            <Info size={15} className="text-[#006B55]" />
            <span>
              Les modifications de barème (pourcentages et montants fixes DA) s'appliquent en temps réel aux vendeurs.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={initialCategory ? `/admin/dashboard/categories/${initialCategory.slug}` : '/admin/dashboard/categories'}
              className="px-5 py-2.5 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
            >
              Annuler
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-md shadow-[#006B55]/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isNew ? 'Créer le rayon et barèmes' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL : CONFIRMATION ARTICLES DÉJÀ APPROUVÉS ET EN LIGNE   */}
      {/* ========================================================= */}
      {showApprovedModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl border border-[#DCE8E3] max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                  Articles actuellement en ligne détectés
                </h3>
                <p className="text-xs text-[#60716F]">
                  <strong>{approvedCount} article(s)</strong> sont déjà approuvés et en vente dans le rayon « {name} » avec l'ancien barème.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7FAF9] border border-[#CCE2DB] space-y-3">
              <p className="text-xs font-bold text-[#102A2A]">
                Comment souhaitez-vous appliquer ce nouveau barème de commission ?
              </p>

              {/* Option 1 : Keep existing */}
              <label
                className={`p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                  retroactiveMode === 'KEEP_EXISTING'
                    ? 'bg-[#E7F2EF] border-[#006B55] shadow-xs'
                    : 'bg-white border-[#DCE8E3] hover:border-[#BBDDD4]'
                }`}
              >
                <input
                  type="radio"
                  name="retroactiveMode"
                  checked={retroactiveMode === 'KEEP_EXISTING'}
                  onChange={() => setRetroactiveMode('KEEP_EXISTING')}
                  className="size-4 mt-0.5 accent-[#006B55]"
                />
                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-[#102A2A] block">
                    Conserver l'ancien barème pour les {approvedCount} articles en ligne (Recommandé)
                  </span>
                  <p className="text-[11px] text-[#60716F] leading-relaxed">
                    Les articles existants conservent le taux et la commission déjà validés lors de leur mise en vente. Le nouveau barème s'appliquera uniquement aux futurs articles créés ou réédités par les vendeurs.
                  </p>
                </div>
              </label>

              {/* Option 2 : Retroactive update */}
              <label
                className={`p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                  retroactiveMode === 'RETROACTIVE'
                    ? 'bg-[#E7F2EF] border-[#006B55] shadow-xs'
                    : 'bg-white border-[#DCE8E3] hover:border-[#BBDDD4]'
                }`}
              >
                <input
                  type="radio"
                  name="retroactiveMode"
                  checked={retroactiveMode === 'RETROACTIVE'}
                  onChange={() => setRetroactiveMode('RETROACTIVE')}
                  className="size-4 mt-0.5 accent-[#006B55]"
                />
                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-[#102A2A] block">
                    Mettre à jour rétroactivement tous les articles approuvés
                  </span>
                  <p className="text-[11px] text-[#60716F] leading-relaxed">
                    La commission et le versement net des {approvedCount} articles en ligne seront immédiatement recalculés selon vos nouveaux pourcentages et tranches de prix.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAF0ED]">
              <button
                type="button"
                onClick={() => setShowApprovedModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => executeSave(retroactiveMode)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                <span>Confirmer et Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
