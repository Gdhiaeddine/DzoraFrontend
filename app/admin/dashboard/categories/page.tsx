'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  X,
  Layers,
  Tag,
  Download,
  AlertTriangle,
  Smartphone,
  Shirt,
  Utensils,
  Dumbbell,
  Baby,
  Car,
  Headphones,
  Armchair,
  Wrench,
  Boxes,
  HelpCircle,
  ArrowUpRight,
  RotateCcw,
  Percent,
  Sliders,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  SlidersHorizontal,
  Calculator,
} from 'lucide-react'
import {
  CATEGORIES_DETAILED,
  CategoryDetail,
  SubCategoryItem,
} from '@/lib/categories'
import {
  commissionService,
  CommissionRule,
  CommissionFeeType,
  PriceIntervalTier,
  SellerPlanTier,
  CommissionCalculationResult,
  DEFAULT_PLAN_RATES,
} from '@/lib/commission-service'

const STORAGE_KEY = 'dzora_admin_categories'

const EMOJI_PRESETS = [
  '📱', '👕', '🏠', '💄', '⚽', '🧸', '🚗', '🎧', '🛋️', '🔧',
  '💻', '🎮', '📚', '🎁', '💎', '👟', '🍕', '⌚', '🎨', '🚲'
]

const BADGE_PRESETS = [
  'Populaire',
  'Tendance',
  'Nouveau',
  'Top Vente',
  'Local DZ',
  'Pro',
  'Essentiel',
  'Confort',
  'Doux',
]

// Fallback icon helper
function getCategoryIcon(name: string) {
  switch (name.toLowerCase()) {
    case 'électronique':
      return Smartphone
    case 'mode':
      return Shirt
    case 'maison & cuisine':
      return Utensils
    case 'beauté & santé':
      return Sparkles
    case 'sport & loisirs':
      return Dumbbell
    case 'enfants & bébés':
      return Baby
    case 'auto & moto':
      return Car
    case 'high-tech':
      return Headphones
    case 'meubles':
      return Armchair
    case 'jardin & bricolage':
      return Wrench
    default:
      return FolderTree
  }
}

export default function AdminCategoriesPage() {
  // Navigation tabs: Categories vs Commissions
  const [activeMainTab, setActiveMainTab] = useState<'categories' | 'commissions'>('categories')

  const [categoriesList, setCategoriesList] = useState<CategoryDetail[]>([])
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters & Search for Categories
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroupTab, setSelectedGroupTab] = useState<'ALL' | 'TECH' | 'HOME' | 'LIFESTYLE'>('ALL')
  const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'name-desc' | 'sub-desc' | 'sub-asc'>('default')

  // Pagination for Categories
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Filters for Commission Rules
  const [ruleSearchQuery, setRuleSearchQuery] = useState('')
  const [rulePlanFilter, setRulePlanFilter] = useState<'ALL' | SellerPlanTier>('ALL')

  // Modals for Categories
  const [editingCategory, setEditingCategory] = useState<CategoryDetail | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [exploringCategory, setExploringCategory] = useState<CategoryDetail | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryDetail | null>(null)

  // Modals for Commission Rules
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null)
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [deletingRule, setDeletingRule] = useState<CommissionRule | null>(null)

  // Form State for Category Add / Edit
  const [formData, setFormData] = useState<{
    name: string
    slug: string
    icon: string
    description: string
    highlightTitle: string
    highlightSubtitle: string
    subcategories: SubCategoryItem[]
  }>({
    name: '',
    slug: '',
    icon: '📦',
    description: '',
    highlightTitle: '',
    highlightSubtitle: '',
    subcategories: [],
  })

  // Form State for Commission Rule Add / Edit
  const [ruleFormData, setRuleFormData] = useState<{
    id?: string
    categorySlug: string
    categoryName: string
    subcategorySlug: string
    subcategoryName: string
    targetPlan: 'ALL' | SellerPlanTier
    feeType: CommissionFeeType
    baseRatePercent: number
    baseFixedFeeDa: number
    priceTiers: PriceIntervalTier[]
  }>({
    categorySlug: '',
    categoryName: '',
    subcategorySlug: '',
    subcategoryName: '',
    targetPlan: 'ALL',
    feeType: 'PERCENT',
    baseRatePercent: 5.0,
    baseFixedFeeDa: 200,
    priceTiers: [],
  })

  // Quick tier input for rule modal
  const [newTierMin, setNewTierMin] = useState<number>(0)
  const [newTierMax, setNewTierMax] = useState<string>('')
  const [newTierFeeType, setNewTierFeeType] = useState<CommissionFeeType>('PERCENT')
  const [newTierRate, setNewTierRate] = useState<number>(4.0)
  const [newTierFixedDa, setNewTierFixedDa] = useState<number>(200)
  const [newTierLabel, setNewTierLabel] = useState<string>('')

  // Quick subcategory adder inside category form or explorer
  const [newSubName, setNewSubName] = useState('')
  const [newSubBadge, setNewSubBadge] = useState('')

  // Live Admin Simulator State
  const [simPrice, setSimPrice] = useState<number>(35000)
  const [simCategory, setSimCategory] = useState<string>('Électronique')
  const [simSubcategory, setSimSubcategory] = useState<string>('Smartphones & Téléphones')
  const [simPlan, setSimPlan] = useState<SellerPlanTier>('PRO')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3500)
  }

  // Load Categories and Commission Rules on mount
  const loadAllData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        // Categories
        const storedCats = localStorage.getItem(STORAGE_KEY)
        if (storedCats) {
          const parsed = JSON.parse(storedCats)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategoriesList(parsed)
          } else {
            setCategoriesList(CATEGORIES_DETAILED)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(CATEGORIES_DETAILED))
          }
        } else {
          setCategoriesList(CATEGORIES_DETAILED)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(CATEGORIES_DETAILED))
        }

        // Commission Rules
        const rules = commissionService.getRules()
        setCommissionRules(rules)
      }
    } catch {
      setCategoriesList(CATEGORIES_DETAILED)
      setCommissionRules(commissionService.getRules())
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadAllData()
  }, [loadAllData])

  // Save categories to storage
  const persistCategories = (list: CategoryDetail[]) => {
    setCategoriesList(list)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      } catch (err) {
        console.error('Erreur sauvegarde catégories:', err)
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    loadAllData()
    showToast('Données et barèmes de commission actualisés.')
  }

  const handleResetDefaults = () => {
    if (confirm('Voulez-vous réinitialiser toutes les catégories et le barème des commissions aux valeurs officielles par défaut ?')) {
      persistCategories(CATEGORIES_DETAILED)
      const resRules = commissionService.resetToDefaults()
      setCommissionRules(resRules)
      showToast('Arborescence et barème restaurés avec les valeurs par défaut.')
    }
  }

  // Group classification helper
  const getCategoryGroup = (slug: string): 'TECH' | 'HOME' | 'LIFESTYLE' => {
    if (['electronique', 'high-tech', 'auto-moto', 'jardin-bricolage'].includes(slug)) return 'TECH'
    if (['maison-cuisine', 'meubles'].includes(slug)) return 'HOME'
    return 'LIFESTYLE'
  }

  // Category Stats
  const totalCategories = categoriesList.length
  const totalSubcategories = useMemo(
    () => categoriesList.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0),
    [categoriesList]
  )
  const totalFeatured = useMemo(
    () => categoriesList.filter((c) => Boolean(c.featuredHighlight?.title)).length,
    [categoriesList]
  )

  const techCount = useMemo(
    () => categoriesList.filter((c) => getCategoryGroup(c.slug) === 'TECH').length,
    [categoriesList]
  )
  const homeCount = useMemo(
    () => categoriesList.filter((c) => getCategoryGroup(c.slug) === 'HOME').length,
    [categoriesList]
  )
  const lifestyleCount = useMemo(
    () => categoriesList.filter((c) => getCategoryGroup(c.slug) === 'LIFESTYLE').length,
    [categoriesList]
  )

  // Commission Stats
  const avgCommissionRate = useMemo(() => {
    if (commissionRules.length === 0) return 5.0
    const sum = commissionRules.reduce((acc, r) => acc + r.baseRatePercent, 0)
    return Number((sum / commissionRules.length).toFixed(1))
  }, [commissionRules])

  const totalPriceTiersConfigured = useMemo(() => {
    return commissionRules.reduce((acc, r) => acc + (r.priceTiers?.length || 0), 0)
  }, [commissionRules])

  // Filtered categories
  const filteredCategories = useMemo(() => {
    let result = [...categoriesList]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.subcategories.some((s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q))
      )
    }

    if (selectedGroupTab !== 'ALL') {
      result = result.filter((c) => getCategoryGroup(c.slug) === selectedGroupTab)
    }

    result.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'fr')
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'fr')
      if (sortBy === 'sub-desc') return (b.subcategories?.length || 0) - (a.subcategories?.length || 0)
      if (sortBy === 'sub-asc') return (a.subcategories?.length || 0) - (b.subcategories?.length || 0)
      return 0
    })

    return result
  }, [categoriesList, searchQuery, selectedGroupTab, sortBy])

  // Pagination for Categories
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage))
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCategories.slice(start, start + itemsPerPage)
  }, [filteredCategories, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedGroupTab, sortBy])

  // Filtered Commission Rules
  const filteredCommissionRules = useMemo(() => {
    let result = [...commissionRules]

    if (ruleSearchQuery.trim()) {
      const q = ruleSearchQuery.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.categoryName.toLowerCase().includes(q) ||
          (r.subcategoryName && r.subcategoryName.toLowerCase().includes(q))
      )
    }

    if (rulePlanFilter !== 'ALL') {
      result = result.filter((r) => r.targetPlan === rulePlanFilter || r.targetPlan === 'ALL')
    }

    return result
  }, [commissionRules, ruleSearchQuery, rulePlanFilter])

  // Live Simulator Calculation
  const simCalculationResult: CommissionCalculationResult = useMemo(() => {
    return commissionService.calculateCommission({
      price: simPrice,
      category: simCategory,
      subcategory: simSubcategory,
      sellerPlan: simPlan,
    })
  }, [simPrice, simCategory, simSubcategory, simPlan])

  // Open Category Create Modal
  const handleOpenCreateCategoryModal = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '📦',
      description: '',
      highlightTitle: '',
      highlightSubtitle: '',
      subcategories: [],
    })
    setNewSubName('')
    setNewSubBadge('')
    setIsCreateModalOpen(true)
  }

  // Open Category Edit Modal
  const handleOpenEditCategoryModal = (cat: CategoryDetail) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '📦',
      description: cat.description || '',
      highlightTitle: cat.featuredHighlight?.title || '',
      highlightSubtitle: cat.featuredHighlight?.subtitle || '',
      subcategories: [...cat.subcategories],
    })
    setNewSubName('')
    setNewSubBadge('')
  }

  const handleNameChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === formData.slug ? generatedSlug : prev.slug,
    }))
  }

  const handleAddSubcategoryToForm = () => {
    if (!newSubName.trim()) return
    const subSlug = newSubName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')

    const newSub: SubCategoryItem = {
      name: newSubName.trim(),
      slug: subSlug,
      badge: newSubBadge.trim() || undefined,
    }

    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, newSub],
    }))

    setNewSubName('')
    setNewSubBadge('')
  }

  const handleRemoveSubcategoryFromForm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, idx) => idx !== index),
    }))
  }

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('Veuillez renseigner le nom et l’identifiant URL (slug).')
      return
    }

    if (editingCategory) {
      const updated = categoriesList.map((cat) => {
        if (cat.slug === editingCategory.slug) {
          return {
            ...cat,
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            icon: formData.icon,
            description: formData.description.trim(),
            subcategories: formData.subcategories,
            featuredHighlight: formData.highlightTitle.trim()
              ? {
                  title: formData.highlightTitle.trim(),
                  subtitle: formData.highlightSubtitle.trim() || 'Offres vérifiées Dzora',
                  linkText: 'Découvrir le rayon',
                }
              : undefined,
          }
        }
        return cat
      })
      persistCategories(updated)
      showToast(`Le rayon « ${formData.name} » a été mis à jour avec succès.`)
      setEditingCategory(null)
    } else {
      const exists = categoriesList.some((c) => c.slug === formData.slug.trim())
      if (exists) {
        alert('Une catégorie avec ce slug existe déjà. Choisissez un autre slug.')
        return
      }

      const newCat: CategoryDetail = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        icon: formData.icon,
        lucideIcon: FolderTree,
        color: 'text-[#006B55]',
        bg: 'bg-[#E8F4F1]',
        description: formData.description.trim() || `Articles et produits dans le rayon ${formData.name}`,
        subcategories: formData.subcategories,
        featuredHighlight: formData.highlightTitle.trim()
          ? {
              title: formData.highlightTitle.trim(),
              subtitle: formData.highlightSubtitle.trim() || 'Offres vérifiées Dzora',
              linkText: 'Découvrir le rayon',
            }
          : undefined,
      }

      persistCategories([...categoriesList, newCat])
      showToast(`Le nouveau rayon « ${newCat.name} » a été créé avec succès.`)
      setIsCreateModalOpen(false)
    }
  }

  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return
    const updated = categoriesList.filter((c) => c.slug !== deletingCategory.slug)
    persistCategories(updated)
    showToast(`Le rayon « ${deletingCategory.name} » a été supprimé de la marketplace.`)
    setDeletingCategory(null)
  }

  /* -------------------------------------------------------------------------- */
  /*                      Commission Rules CRUD Handlers                        */
  /* -------------------------------------------------------------------------- */

  const handleOpenAddRuleModal = (presetCategory?: CategoryDetail) => {
    const cat = presetCategory || categoriesList[0]
    setRuleFormData({
      categorySlug: cat ? cat.slug : '',
      categoryName: cat ? cat.name : '',
      subcategorySlug: '',
      subcategoryName: '',
      targetPlan: 'ALL',
      feeType: 'PERCENT',
      baseRatePercent: 5.0,
      baseFixedFeeDa: 200,
      priceTiers: [],
    })
    setNewTierMin(0)
    setNewTierMax('')
    setNewTierFeeType('PERCENT')
    setNewTierRate(4.5)
    setNewTierFixedDa(200)
    setNewTierLabel('')
    setEditingRule(null)
    setIsRuleModalOpen(true)
  }

  const handleOpenEditRuleModal = (rule: CommissionRule) => {
    setEditingRule(rule)
    setRuleFormData({
      id: rule.id,
      categorySlug: rule.categorySlug,
      categoryName: rule.categoryName,
      subcategorySlug: rule.subcategorySlug || '',
      subcategoryName: rule.subcategoryName || '',
      targetPlan: rule.targetPlan,
      feeType: rule.feeType || 'PERCENT',
      baseRatePercent: rule.baseRatePercent,
      baseFixedFeeDa: rule.baseFixedFeeDa ?? 200,
      priceTiers: rule.priceTiers ? [...rule.priceTiers] : [],
    })
    setNewTierMin(0)
    setNewTierMax('')
    setNewTierFeeType('PERCENT')
    setNewTierRate(4.0)
    setNewTierFixedDa(200)
    setNewTierLabel('')
    setIsRuleModalOpen(true)
  }

  const handleAddPriceTierToRule = () => {
    const maxVal = newTierMax.trim() === '' ? null : Number(newTierMax)
    if (maxVal !== null && maxVal <= newTierMin) {
      alert('Le prix maximum du palier doit être strictement supérieur au prix minimum.')
      return
    }

    const newTier: PriceIntervalTier = {
      id: `tier-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      minPrice: Number(newTierMin),
      maxPrice: maxVal,
      feeType: newTierFeeType,
      ratePercent: Number(newTierRate),
      fixedFeeDa: newTierFeeType !== 'PERCENT' ? Number(newTierFixedDa) : undefined,
      label: newTierLabel.trim() || undefined,
    }

    setRuleFormData((prev) => ({
      ...prev,
      priceTiers: [...prev.priceTiers, newTier].sort((a, b) => a.minPrice - b.minPrice),
    }))

    setNewTierMin(maxVal !== null ? maxVal + 1 : 0)
    setNewTierMax('')
    setNewTierLabel('')
  }

  const handleRemovePriceTierFromRule = (tierId: string) => {
    setRuleFormData((prev) => ({
      ...prev,
      priceTiers: prev.priceTiers.filter((t) => t.id !== tierId),
    }))
  }

  const handleSaveCommissionRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleFormData.categorySlug) {
      alert('Veuillez sélectionner un rayon.')
      return
    }

    const saved = commissionService.upsertRule({
      id: ruleFormData.id,
      categorySlug: ruleFormData.categorySlug,
      categoryName: ruleFormData.categoryName,
      subcategorySlug: ruleFormData.subcategorySlug || undefined,
      subcategoryName: ruleFormData.subcategoryName || undefined,
      targetPlan: ruleFormData.targetPlan,
      feeType: ruleFormData.feeType,
      baseRatePercent: Number(ruleFormData.baseRatePercent),
      baseFixedFeeDa: ruleFormData.feeType !== 'PERCENT' ? Number(ruleFormData.baseFixedFeeDa) : undefined,
      priceTiers: ruleFormData.priceTiers.length > 0 ? ruleFormData.priceTiers : undefined,
    })

    setCommissionRules(commissionService.getRules())
    setIsRuleModalOpen(false)
    setEditingRule(null)
    const label = saved.feeType === 'FIXED' 
      ? `${saved.baseFixedFeeDa} DA fixe` 
      : saved.feeType === 'HYBRID' 
      ? `${saved.baseRatePercent}% + ${saved.baseFixedFeeDa} DA`
      : `${saved.baseRatePercent} %`
    showToast(`Règle de commission enregistrée (${label}).`)
  }

  const handleConfirmDeleteRule = () => {
    if (!deletingRule) return
    commissionService.deleteRule(deletingRule.id)
    setCommissionRules(commissionService.getRules())
    showToast('Règle de commission supprimée.')
    setDeletingRule(null)
  }

  // Export CSV for Commissions
  const handleExportCommissionsCSV = () => {
    if (commissionRules.length === 0) {
      showToast('Aucune règle à exporter.')
      return
    }

    const headers = [
      'ID Règle',
      'Rayon',
      'Sous-catégorie',
      'Forfait Vendeur Ciblé',
      'Taux de Base (%)',
      'Paliers de Prix Configurés',
    ]

    const rows = commissionRules.map((r) => [
      `"${r.id}"`,
      `"${r.categoryName}"`,
      `"${r.subcategoryName || 'Toutes'}"`,
      r.targetPlan,
      r.baseRatePercent,
      `"${(r.priceTiers || []).map((t) => `${t.minPrice}-${t.maxPrice || '∞'} DA: ${t.ratePercent}%`).join(' ; ')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `dzora-bareme-commissions-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast(`${commissionRules.length} règles de commission exportées avec succès.`)
  }

  const formatPrice = (val: number) => {
    return (val || 0).toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
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
              <span className="text-[#60716F]">Catalogue</span>
              <ChevronRight size={12} className="text-[#94A4A0]" />
              <span className="text-[#102A2A] font-semibold">
                {activeMainTab === 'categories' ? 'Catégories & Rayons' : 'Barème des Commissions & Paliers'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
              {activeMainTab === 'categories'
                ? 'Gestion des Catégories & Rayons'
                : 'Barème des Commissions Marketplace & Paliers'}
            </h1>
            <p className="text-xs font-medium text-[#60716F] mt-0.5">
              {activeMainTab === 'categories'
                ? 'Organisation de l’arborescence marketplace, rayons principaux, sous-catégories et bannières en vedette'
                : 'Définissez vos commissions dynamiques par catégorie, sous-catégorie, tranche de prix et forfait vendeur'}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {activeMainTab === 'categories' ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4]">
                  <FolderTree size={14} />
                  <span>
                    {totalCategories} rayons · {totalSubcategories} sous-catégories
                  </span>
                </span>

                <Link
                  href="/admin/dashboard/categories/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs"
                >
                  <Plus size={15} />
                  <span>Nouveau Rayon</span>
                </Link>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4]">
                  <Percent size={14} />
                  <span>
                    {commissionRules.length} règles actives · Taux moyen {avgCommissionRate} %
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenAddRuleModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Nouvelle Règle de Commission</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2 text-[#4A5D58] hover:text-[#006B55] hover:bg-white rounded-xl border border-[#DCE8E3] transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Rafraîchir les données"
              aria-label="Rafraîchir les données"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-[#006B55]' : ''} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN NAV TABS : RAYONS VS COMMISSIONS                     */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 border-b border-[#DCE8E3] pb-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveMainTab('categories')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'categories'
                ? 'bg-[#006B55] text-white shadow-xs'
                : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
            }`}
          >
            <FolderTree size={15} />
            <span>Arborescence des Rayons</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeMainTab === 'categories' ? 'bg-white/20 text-white' : 'bg-[#E7F2EF] text-[#006B55]'
              }`}
            >
              {totalCategories}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('commissions')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'commissions'
                ? 'bg-[#006B55] text-white shadow-xs'
                : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
            }`}
          >
            <Percent size={15} />
            <span>Barème des Commissions & Paliers (% DA)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeMainTab === 'commissions' ? 'bg-white/20 text-white' : 'bg-[#E7F2EF] text-[#006B55]'
              }`}
            >
              {commissionRules.length}
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1 : ARBORESCENCE DES RAYONS                         */}
        {/* ========================================================= */}
        {activeMainTab === 'categories' && (
          <div className="space-y-6">
            {/* ROW 1: REAL KPIS CARDS (Full Width 4 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Catégories */}
              <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#60716F]">Rayons Principaux</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                    <FolderTree className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                    {totalCategories}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                    <span>Rayons racines actifs sur Dzora</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Sous-catégories */}
              <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#60716F]">Sous-catégories</span>
                  <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                    {totalSubcategories}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#2563EB]">
                    <span>Filtres de recherche et tags produits</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Rayons en Vedette */}
              <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#60716F]">Rayons en Vedette</span>
                  <div className="w-8 h-8 rounded-xl bg-[#FFF6E7] text-[#D97706] flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                    {totalFeatured}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#D97706]">
                    <span>Bannières & mises en avant d'accueil</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Couverture Catalogue */}
              <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#60716F]">Couverture Catalogue</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                    100 %
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                    <span>Tous les rayons sont synchronisés</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: STATUS / GROUP TABS PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
              {[
                { id: 'ALL' as const, label: 'Tous les rayons', count: totalCategories },
                { id: 'TECH' as const, label: 'High-Tech & Auto', count: techCount },
                { id: 'HOME' as const, label: 'Maison & Mobilier', count: homeCount },
                { id: 'LIFESTYLE' as const, label: 'Mode, Beauté & Loisirs', count: lifestyleCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedGroupTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
                    selectedGroupTab === tab.id
                      ? 'bg-[#006B55] text-white shadow-xs font-bold'
                      : 'bg-white border border-[#DCE8E3] text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      selectedGroupTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E7F2EF] text-[#006B55]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ROW 3: FILTERS & CONTROLS TOOLBAR */}
            <div className="bg-white rounded-2xl p-4 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search Input */}
                <div className="relative min-w-[240px] max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A4A0] pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher rayon, sous-catégorie, mot-clé…"
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

                {/* Sort filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-[#60716F]">Trier :</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    <option value="default">Ordre par défaut</option>
                    <option value="name-asc">Nom (A - Z)</option>
                    <option value="name-desc">Nom (Z - A)</option>
                    <option value="sub-desc">Plus de sous-catégories</option>
                    <option value="sub-asc">Moins de sous-catégories</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#60716F] hover:text-[#102A2A] px-2.5 py-2 rounded-xl border border-[#DCE8E3] bg-[#F8FAF9] hover:bg-[#F0F4F2] transition cursor-pointer shrink-0"
                  title="Restaurer l'arborescence par défaut"
                >
                  <RotateCcw size={12} />
                  <span>Défaut</span>
                </button>
              </div>
            </div>

            {/* ROW 4: CATEGORIES TABLE */}
            <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#DCE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                    Arborescence Marketplace & Rayons
                  </h3>
                  <p className="text-xs text-[#60716F]">
                    {filteredCategories.length} rayon{filteredCategories.length > 1 ? 's' : ''} correspondant aux filtres
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#71827D] font-medium">
                    Page <strong className="text-[#102A2A]">{currentPage}</strong> sur{' '}
                    <strong className="text-[#102A2A]">{totalPages}</strong>
                  </span>
                </div>
              </div>

              {filteredCategories.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#E7F2EF] text-[#006B55] mx-auto">
                    <FolderTree size={24} />
                  </div>
                  <h4 className="font-bold text-base text-[#102A2A] font-display">
                    Aucun rayon trouvé
                  </h4>
                  <p className="text-xs text-[#60716F] max-w-sm mx-auto">
                    Aucune catégorie ne correspond à vos critères de recherche.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8FAF9] text-[#60716F] font-bold border-b border-[#DCE8E3] text-[11px] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Rayon & Icône</th>
                        <th className="py-3.5 px-4">Sous-catégories Actives</th>
                        <th className="py-3.5 px-4">Commission Marketplace</th>
                        <th className="py-3.5 px-4">Mise en avant (Highlight)</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAF0ED]">
                      {paginatedCategories.map((cat) => {
                        const LucideComp = getCategoryIcon(cat.name)
                        // Find matching rule if any
                        const catRule = commissionRules.find(
                          (r) => r.categorySlug === cat.slug && !r.subcategorySlug
                        )

                        return (
                          <tr key={cat.slug} className="hover:bg-[#F4FAF7]/70 transition">
                            {/* Rayon Name & Icon */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="size-11 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center text-xl shrink-0 border border-[#BBDDD4]">
                                  {cat.icon || <LucideComp size={20} />}
                                </div>
                                <div className="min-w-0 max-w-sm">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/admin/dashboard/categories/${cat.slug}`}
                                      className="font-extrabold text-xs text-[#102A2A] hover:text-[#006B55] transition"
                                    >
                                      {cat.name}
                                    </Link>
                                    <span className="font-mono text-[10px] text-[#71827D] bg-[#F7FAF9] px-1.5 py-0.2 rounded border border-[#DCE8E3]">
                                      /{cat.slug}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#60716F] mt-0.5 line-clamp-1">
                                    {cat.description}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Sous-catégories */}
                            <td className="py-4 px-4">
                              <div className="space-y-1.5">
                                <span className="font-bold text-[#102A2A]">
                                  {cat.subcategories.length} sous-catégorie{cat.subcategories.length > 1 ? 's' : ''}
                                </span>
                                <div className="flex items-center gap-1 flex-wrap max-w-md">
                                  {cat.subcategories.slice(0, 3).map((sub) => (
                                    <span
                                      key={sub.slug}
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#F7FAF9] text-[#4A5D58] px-2 py-0.5 rounded-md border border-[#DCE8E3]"
                                    >
                                      <span>{sub.name}</span>
                                    </span>
                                  ))}
                                  {cat.subcategories.length > 3 && (
                                    <span className="text-[10px] font-bold text-[#006B55]">
                                      +{cat.subcategories.length - 3} autres
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Commission quick indicator */}
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                                    <Percent size={11} />
                                    <span>{catRule ? catRule.baseRatePercent : 5.0} %</span>
                                  </span>
                                  {catRule?.priceTiers && catRule.priceTiers.length > 0 && (
                                    <span className="text-[10px] font-bold text-[#D97706] bg-[#FFF6E7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                                      {catRule.priceTiers.length} paliers
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenAddRuleModal(cat)
                                  }}
                                  className="text-[10px] font-bold text-[#006B55] hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <SlidersHorizontal size={11} />
                                  <span>Configurer le barème</span>
                                </button>
                              </div>
                            </td>

                            {/* Featured Highlight */}
                            <td className="py-4 px-4">
                              {cat.featuredHighlight ? (
                                <div className="p-2.5 rounded-xl bg-[#FFFBF0] border border-[#FDE68A] max-w-xs">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#9A6A08]">
                                    <Sparkles size={12} className="text-[#D97706]" />
                                    <span className="truncate">{cat.featuredHighlight.title}</span>
                                  </div>
                                  <p className="text-[10px] text-[#785408] mt-0.5 line-clamp-1">
                                    {cat.featuredHighlight.subtitle}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#94A4A0] italic">
                                  Standard
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/admin/dashboard/categories/${cat.slug}`}
                                  className="p-1.5 rounded-lg border border-[#DCE8E3] bg-[#F7FAF9] text-[#4A5D58] hover:bg-[#E7F2EF] hover:text-[#006B55] transition cursor-pointer"
                                  title="Consulter ce rayon"
                                >
                                  <Eye size={14} />
                                </Link>

                                <Link
                                  href={`/admin/dashboard/categories/${cat.slug}/edit`}
                                  className="p-1.5 rounded-lg border border-[#DCE8E3] bg-[#F7FAF9] text-[#4A5D58] hover:bg-[#E7F2EF] hover:text-[#006B55] transition cursor-pointer"
                                  title="Modifier ce rayon & barèmes"
                                >
                                  <Edit3 size={14} />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setDeletingCategory(cat)}
                                  className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer"
                                  title="Supprimer la catégorie"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2 : BARÈME DES COMMISSIONS & PALIERS                 */}
        {/* ========================================================= */}
        {activeMainTab === 'commissions' && (
          <div className="space-y-6">
            {/* ROW 1: REAL KPIS CARDS (Full Width 4 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Taux Moyen */}
              <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#60716F]">Taux Moyen Marketplace</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                    <Percent className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                    {avgCommissionRate} %
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                    <span>Calculé sur les règles de base</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Règles Actives */}
              <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#60716F]">Règles Actives</span>
                  <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Tag className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                    {commissionRules.length}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#2563EB]">
                    <span>Règles par rayon et sous-catégorie</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Paliers de Prix */}
              <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#60716F]">Paliers de Prix Configurés</span>
                  <div className="w-8 h-8 rounded-xl bg-[#FFF6E7] text-[#D97706] flex items-center justify-center">
                    <Sliders className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                    {totalPriceTiersConfigured} tranches
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#D97706]">
                    <span>Commissions dégressives par montant DA</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Forfaits Vendeurs */}
              <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#60716F]">Forfaits Vendeurs</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                    4 forfaits
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                    <span>Trial (8%), Basic (6%), Pro (4%), Business (2.5%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE COMMISSION SIMULATOR WIDGET */}
            <div className="rounded-2xl border border-[#CCE2DB] bg-gradient-to-br from-[#F4FAF7] to-white p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,107,85,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE8E3] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#006B55] text-white">
                    <Calculator size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A2A] font-display">
                      Simulateur de Commission en Temps Réel
                    </h3>
                    <p className="text-[11px] text-[#60716F]">
                      Testez immédiatement l'effet de votre barème sur n'importe quel prix et catégorie
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#006B55] bg-[#E7F2EF] px-3 py-1 rounded-full border border-[#BBDDD4]">
                  Moteur Actif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Price input */}
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Prix de vente de l'article :
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={simPrice}
                      onChange={(e) => setSimPrice(Number(e.target.value))}
                      className="w-full h-9 pl-3 pr-10 rounded-xl border border-[#DCE8E3] bg-white font-bold text-[#102A2A] outline-none focus:border-[#008F72]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[11px] text-[#71827D]">
                      DA
                    </span>
                  </div>
                </div>

                {/* Category select */}
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Rayon sélectionné :
                  </label>
                  <select
                    value={simCategory}
                    onChange={(e) => {
                      setSimCategory(e.target.value)
                      const found = categoriesList.find((c) => c.name === e.target.value)
                      if (found && found.subcategories.length > 0) {
                        setSimSubcategory(found.subcategories[0].name)
                      } else {
                        setSimSubcategory('')
                      }
                    }}
                    className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-white font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory select */}
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Sous-catégorie :
                  </label>
                  <select
                    value={simSubcategory}
                    onChange={(e) => setSimSubcategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-white font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    <option value="">Aucune (Taux rayon)</option>
                    {categoriesList
                      .find((c) => c.name === simCategory)
                      ?.subcategories.map((s) => (
                        <option key={s.slug} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Seller plan select */}
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Forfait Vendeur :
                  </label>
                  <select
                    value={simPlan}
                    onChange={(e) => setSimPlan(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-white font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    <option value="TRIAL">Trial (Essai gratuit)</option>
                    <option value="BASIC">Basic (Démarrage)</option>
                    <option value="PRO">Pro (Standard)</option>
                    <option value="BUSINESS">Business (Marque VIP)</option>
                  </select>
                </div>
              </div>

              {/* Simulation Result Banner */}
              <div className="p-4 rounded-xl bg-white border border-[#BBDDD4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#102A2A]">
                      Résultat de la simulation :
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#E7F2EF] text-[#006B55]">
                      {simCalculationResult.feeType === 'FIXED'
                        ? `${simCalculationResult.fixedFeeDa.toLocaleString()} DA fixe`
                        : simCalculationResult.feeType === 'HYBRID'
                        ? `${simCalculationResult.ratePercent}% + ${simCalculationResult.fixedFeeDa.toLocaleString()} DA`
                        : `${simCalculationResult.ratePercent} % de commission`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#60716F]">
                    Règle appliquée : <strong>{simCalculationResult.appliedRuleLabel}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-[#71827D] block">Commission Dzora</span>
                    <span className="text-sm font-extrabold text-[#D97706]">
                      - {formatPrice(simCalculationResult.commissionAmountDa)}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-[#EAF0ED]" />

                  <div className="text-right">
                    <span className="text-[10px] text-[#71827D] block">Net versé au vendeur</span>
                    <span className="text-base font-black text-[#006B55]">
                      = {formatPrice(simCalculationResult.netSellerPayoutDa)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COMMISSION RULES TABLE TOOLBAR */}
            <div className="bg-white rounded-2xl p-4 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search */}
                <div className="relative min-w-[240px] max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A4A0] pointer-events-none" />
                  <input
                    type="text"
                    value={ruleSearchQuery}
                    onChange={(e) => setRuleSearchQuery(e.target.value)}
                    placeholder="Filtrer les règles par rayon ou sous-catégorie…"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] placeholder:text-[#71827D] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                  {ruleSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setRuleSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Plan Scope Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-[#60716F]">Portée forfait :</span>
                  <select
                    value={rulePlanFilter}
                    onChange={(e) => setRulePlanFilter(e.target.value as any)}
                    className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    <option value="ALL">Tous les forfaits (Global)</option>
                    <option value="TRIAL">Trial</option>
                    <option value="BASIC">Basic</option>
                    <option value="PRO">Pro</option>
                    <option value="BUSINESS">Business</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCommissionsCSV}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4] hover:bg-[#d5eae4] transition shadow-xs cursor-pointer shrink-0"
                >
                  <Download size={13} />
                  <span>Exporter le Barème CSV</span>
                </button>
              </div>
            </div>

            {/* COMMISSION RULES TABLE */}
            <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#DCE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                    Règles de Commissionnement & Paliers Actifs
                  </h3>
                  <p className="text-xs text-[#60716F]">
                    {filteredCommissionRules.length} règles appliquées lors de la création d'articles par les vendeurs
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAF9] text-[#60716F] font-bold border-b border-[#DCE8E3] text-[11px] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Rayon & Sous-catégorie</th>
                      <th className="py-3.5 px-4">Portée du Forfait</th>
                      <th className="py-3.5 px-4">Taux de Base</th>
                      <th className="py-3.5 px-4">Paliers par Tranche de Prix</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF0ED]">
                    {filteredCommissionRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-[#F4FAF7]/70 transition">
                        {/* Rayon & Subcategory */}
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-extrabold text-xs text-[#102A2A]">
                              {rule.categoryName}
                            </div>
                            {rule.subcategoryName ? (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-[#60716F]">Sous-catégorie :</span>
                                <span className="font-bold text-[11px] text-[#006B55] bg-[#E7F2EF] px-1.5 py-0.2 rounded border border-[#BBDDD4]">
                                  {rule.subcategoryName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#71827D]">
                                S'applique à tout le rayon par défaut
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Plan Scope */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              rule.targetPlan === 'ALL'
                                ? 'bg-[#E7F2EF] text-[#006B55] border-[#BBDDD4]'
                                : rule.targetPlan === 'BUSINESS'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : rule.targetPlan === 'PRO'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {rule.targetPlan === 'ALL' ? 'Tous les forfaits' : `Forfait ${rule.targetPlan}`}
                          </span>
                        </td>

                        {/* Base Rate */}
                        <td className="py-3.5 px-4">
                          <span className="text-sm font-extrabold text-[#102A2A]">
                            {rule.feeType === 'FIXED'
                              ? `${(rule.baseFixedFeeDa ?? 0).toLocaleString()} DA fixe`
                              : rule.feeType === 'HYBRID'
                              ? `${rule.baseRatePercent} % + ${(rule.baseFixedFeeDa ?? 0).toLocaleString()} DA`
                              : `${rule.baseRatePercent} %`}
                          </span>
                        </td>

                        {/* Price tiers */}
                        <td className="py-3.5 px-4">
                          {rule.priceTiers && rule.priceTiers.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap max-w-md">
                              {rule.priceTiers.map((t) => (
                                <span
                                  key={t.id}
                                  className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#FFFBF0] text-[#9A6A08] px-2 py-0.5 rounded-md border border-[#FDE68A]"
                                >
                                  <strong>
                                    {t.feeType === 'FIXED'
                                      ? `${(t.fixedFeeDa ?? 0).toLocaleString()} DA fixe`
                                      : t.feeType === 'HYBRID'
                                      ? `${t.ratePercent} % + ${(t.fixedFeeDa ?? 0).toLocaleString()} DA`
                                      : `${t.ratePercent} %`}
                                  </strong>
                                  <span className="text-[9px] text-[#785408]">
                                    ({t.minPrice.toLocaleString()}{' '}
                                    {t.maxPrice ? `à ${t.maxPrice.toLocaleString()} DA` : 'DA+'})
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#94A4A0] italic">
                              Taux standard (aucun palier)
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRuleModal(rule)}
                              className="p-1.5 rounded-lg border border-[#DCE8E3] bg-[#F7FAF9] text-[#4A5D58] hover:bg-[#E7F2EF] hover:text-[#006B55] transition cursor-pointer"
                              title="Modifier cette règle"
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingRule(rule)}
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer"
                              title="Supprimer la règle"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL : CONFIGURER UNE RÈGLE DE COMMISSION & PALIERS      */}
      {/* ========================================================= */}
      {isRuleModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#DCE8E3] max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-[#DCE8E3]">
              <div>
                <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                  {editingRule ? 'Modifier le Barème de Commission' : 'Définir une Règle de Commission'}
                </h3>
                <p className="text-xs text-[#60716F]">
                  Ajustez les pourcentages par rayon, sous-catégorie et tranches de prix.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1.5 rounded-lg text-[#71827D] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCommissionRule} className="space-y-4 text-xs">
              {/* Category selector */}
              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Rayon / Catégorie principale <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={ruleFormData.categorySlug}
                  onChange={(e) => {
                    const cat = categoriesList.find((c) => c.slug === e.target.value)
                    setRuleFormData((prev) => ({
                      ...prev,
                      categorySlug: e.target.value,
                      categoryName: cat ? cat.name : '',
                      subcategorySlug: '',
                      subcategoryName: '',
                    }))
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-[#102A2A] outline-none focus:border-[#008F72] focus:bg-white"
                >
                  <option value="">Sélectionnez un rayon</option>
                  {categoriesList.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory selector */}
              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Sous-catégorie spécifique (Optionnel) :
                </label>
                <select
                  value={ruleFormData.subcategorySlug}
                  onChange={(e) => {
                    const cat = categoriesList.find((c) => c.slug === ruleFormData.categorySlug)
                    const sub = cat?.subcategories.find((s) => s.slug === e.target.value)
                    setRuleFormData((prev) => ({
                      ...prev,
                      subcategorySlug: e.target.value,
                      subcategoryName: sub ? sub.name : '',
                    }))
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-semibold text-[#102A2A] outline-none focus:border-[#008F72] focus:bg-white cursor-pointer"
                >
                  <option value="">S'applique à tout le rayon (Général)</option>
                  {categoriesList
                    .find((c) => c.slug === ruleFormData.categorySlug)
                    ?.subcategories.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Target Plan */}
              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Portée du Forfait Vendeur :
                </label>
                <select
                  value={ruleFormData.targetPlan}
                  onChange={(e) =>
                    setRuleFormData((prev) => ({ ...prev, targetPlan: e.target.value as any }))
                  }
                  className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
                >
                  <option value="ALL">Tous les forfaits (ALL)</option>
                  <option value="TRIAL">Forfait Trial uniquement</option>
                  <option value="BASIC">Forfait Basic uniquement</option>
                  <option value="PRO">Forfait Pro uniquement</option>
                  <option value="BUSINESS">Forfait Business uniquement</option>
                </select>
              </div>

              {/* Commission Fee Type Selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#102A2A]">
                  Type de commission Dzora :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRuleFormData((prev) => ({ ...prev, feeType: 'PERCENT' }))}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      ruleFormData.feeType === 'PERCENT'
                        ? 'border-[#006B55] bg-[#E7F2EF] text-[#006B55]'
                        : 'border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7]'
                    }`}
                  >
                    <Percent size={13} />
                    <span>% Pourcentage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRuleFormData((prev) => ({ ...prev, feeType: 'FIXED' }))}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      ruleFormData.feeType === 'FIXED'
                        ? 'border-[#006B55] bg-[#E7F2EF] text-[#006B55]'
                        : 'border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7]'
                    }`}
                  >
                    <DollarSign size={13} />
                    <span>DA Fixe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRuleFormData((prev) => ({ ...prev, feeType: 'HYBRID' }))}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      ruleFormData.feeType === 'HYBRID'
                        ? 'border-[#006B55] bg-[#E7F2EF] text-[#006B55]'
                        : 'border-[#DCE8E3] bg-white text-[#4A5D58] hover:bg-[#F4FAF7]'
                    }`}
                  >
                    <Sliders size={13} />
                    <span>Mixte (% + DA)</span>
                  </button>
                </div>
              </div>

              {/* Commission Values Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ruleFormData.feeType !== 'FIXED' && (
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
                        required
                        value={ruleFormData.baseRatePercent}
                        onChange={(e) =>
                          setRuleFormData((prev) => ({
                            ...prev,
                            baseRatePercent: Number(e.target.value),
                          }))
                        }
                        className="w-full p-2.5 pr-8 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-sm text-[#102A2A] outline-none focus:border-[#008F72] focus:bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[#71827D]">
                        %
                      </span>
                    </div>
                  </div>
                )}

                {ruleFormData.feeType !== 'PERCENT' && (
                  <div className={ruleFormData.feeType === 'FIXED' ? 'sm:col-span-2' : ''}>
                    <label className="block font-bold text-[#102A2A] mb-1">
                      Montant fixe (DA) <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-1.5">
                      <div className="relative">
                        <input
                          type="number"
                          step="10"
                          min="0"
                          required
                          value={ruleFormData.baseFixedFeeDa}
                          onChange={(e) =>
                            setRuleFormData((prev) => ({
                              ...prev,
                              baseFixedFeeDa: Number(e.target.value),
                            }))
                          }
                          className="w-full p-2.5 pr-10 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold text-sm text-[#102A2A] outline-none focus:border-[#008F72] focus:bg-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#71827D]">
                          DA
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#71827D]">Préréglages :</span>
                        {[100, 250, 500].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              setRuleFormData((prev) => ({ ...prev, baseFixedFeeDa: preset }))
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              ruleFormData.baseFixedFeeDa === preset
                                ? 'bg-[#006B55] text-white border-[#006B55]'
                                : 'bg-white text-[#4A5D58] border-[#DCE8E3] hover:border-[#006B55]'
                            }`}
                          >
                            {preset} DA
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Interval Tiers Management */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#DCE8E3] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#102A2A] block">
                      Paliers Dégressifs par Tranche de Prix (Optionnel) :
                    </span>
                    <span className="text-[10px] text-[#60716F]">
                      Ex : Baissez ou ajustez la commission sur les articles à valeur élevée
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#006B55]">
                    {ruleFormData.priceTiers.length} palier{ruleFormData.priceTiers.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tiers List */}
                {ruleFormData.priceTiers.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {ruleFormData.priceTiers.map((t) => (
                      <div
                        key={t.id}
                        className="p-2 rounded-xl bg-white border border-[#DCE8E3] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#102A2A]">
                            {t.minPrice.toLocaleString()} DA à{' '}
                            {t.maxPrice ? `${t.maxPrice.toLocaleString()} DA` : 'plus'}
                          </span>
                          {t.label && (
                            <span className="text-[10px] text-[#71827D] ml-2">
                              ({t.label})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#006B55] bg-[#E7F2EF] px-2 py-0.5 rounded-md">
                            {t.feeType === 'FIXED'
                              ? `${(t.fixedFeeDa ?? 0).toLocaleString()} DA fixe`
                              : t.feeType === 'HYBRID'
                              ? `${t.ratePercent} % + ${(t.fixedFeeDa ?? 0).toLocaleString()} DA`
                              : `${t.ratePercent} %`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePriceTierFromRule(t.id)}
                            className="text-[#9CAFA9] hover:text-red-600 transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Tier Form */}
                <div className="pt-2 border-t border-[#DCE8E3]/60 space-y-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#60716F] block mb-0.5">
                        Min (DA) :
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={newTierMin}
                        onChange={(e) => setNewTierMin(Number(e.target.value))}
                        placeholder="0"
                        className="w-full p-2 rounded-xl border border-[#DCE8E3] bg-white text-xs outline-none focus:border-[#008F72]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#60716F] block mb-0.5">
                        Max (DA) :
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={newTierMax}
                        onChange={(e) => setNewTierMax(e.target.value)}
                        placeholder="∞ si vide"
                        className="w-full p-2 rounded-xl border border-[#DCE8E3] bg-white text-xs outline-none focus:border-[#008F72]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#60716F] block mb-0.5">
                        Type palier :
                      </span>
                      <select
                        value={newTierFeeType}
                        onChange={(e) => setNewTierFeeType(e.target.value as CommissionFeeType)}
                        className="w-full p-2 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
                      >
                        <option value="PERCENT">% Taux</option>
                        <option value="FIXED">DA Fixe</option>
                        <option value="HYBRID">% + DA</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#60716F] block mb-0.5">
                        {newTierFeeType === 'FIXED' ? 'Montant (DA) :' : 'Taux (%) :'}
                      </span>
                      {newTierFeeType === 'FIXED' ? (
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={newTierFixedDa}
                          onChange={(e) => setNewTierFixedDa(Number(e.target.value))}
                          placeholder="200"
                          className="w-full p-2 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#006B55] outline-none focus:border-[#008F72]"
                        />
                      ) : (
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="30"
                          value={newTierRate}
                          onChange={(e) => setNewTierRate(Number(e.target.value))}
                          placeholder="4.0"
                          className="w-full p-2 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#006B55] outline-none focus:border-[#008F72]"
                        />
                      )}
                    </div>
                  </div>

                  {newTierFeeType === 'HYBRID' && (
                    <div className="flex items-center gap-2 bg-[#F4FAF7] p-2 rounded-xl border border-[#CCE2DB]">
                      <span className="text-[10px] font-bold text-[#4A5D58] shrink-0">
                        + Montant fixe additionnel (DA) :
                      </span>
                      <input
                        type="number"
                        step="10"
                        min="0"
                        value={newTierFixedDa}
                        onChange={(e) => setNewTierFixedDa(Number(e.target.value))}
                        className="w-24 p-1 rounded-lg border border-[#DCE8E3] bg-white text-xs font-bold text-[#006B55]"
                      />
                      <span className="text-[10px] text-[#71827D]">DA</span>
                    </div>
                  )}

                  {newTierFeeType === 'FIXED' && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-[#71827D]">Presets rapides :</span>
                      {[100, 250, 500].map((da) => (
                        <button
                          key={da}
                          type="button"
                          onClick={() => setNewTierFixedDa(da)}
                          className="px-2 py-0.5 rounded bg-white border border-[#DCE8E3] text-[#006B55] font-bold hover:bg-[#E7F2EF] cursor-pointer"
                        >
                          {da} DA
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTierLabel}
                      onChange={(e) => setNewTierLabel(e.target.value)}
                      placeholder="Libellé optionnel (ex: Petit article, Haut de gamme)"
                      className="flex-1 p-2 rounded-xl border border-[#DCE8E3] bg-white text-xs outline-none focus:border-[#008F72]"
                    />
                    <button
                      type="button"
                      onClick={handleAddPriceTierToRule}
                      className="px-3.5 py-2 rounded-xl bg-[#006B55] text-white font-bold text-xs hover:bg-[#005544] transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus size={13} />
                      <span>Ajouter palier</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DCE8E3]">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#DCE8E3] text-[#60716F] font-bold text-xs hover:bg-[#F4FAF7] transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold text-xs hover:bg-[#005544] transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Enregistrer la règle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CONFIRMATION SUPPRESSION RÈGLE COMMISSION         */}
      {/* ========================================================= */}
      {deletingRule && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#DCE8E3] bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
              <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                <AlertTriangle size={18} />
                <span>Supprimer la règle de commission</span>
              </div>
              <button
                type="button"
                onClick={() => setDeletingRule(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#60716F]">
              Êtes-vous sûr de vouloir supprimer la règle pour{' '}
              <strong>
                {deletingRule.categoryName}
                {deletingRule.subcategoryName ? ` > ${deletingRule.subcategoryName}` : ''}
              </strong>{' '}
              ({deletingRule.baseRatePercent} %) ?
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-[#DCE8E3]">
              <button
                type="button"
                onClick={() => setDeletingRule(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRule}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CRÉER / MODIFIER UN RAYON                         */}
      {/* ========================================================= */}
      {(isCreateModalOpen || editingCategory) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#DCE8E3] max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE8E3]">
              <div>
                <h3 className="text-lg font-extrabold text-[#102A2A] font-display">
                  {editingCategory ? `Modifier le rayon : ${editingCategory.name}` : 'Créer un nouveau rayon'}
                </h3>
                <p className="text-xs text-[#60716F]">
                  Configurez le nom, l'icône, les sous-catégories et les bannières en vedette.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setEditingCategory(null)
                }}
                className="p-1.5 rounded-lg text-[#71827D] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Nom du rayon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex : Gaming & Informatique"
                    className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-semibold text-[#102A2A] outline-none focus:border-[#008F72] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Slug URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Ex : gaming-informatique"
                    className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-mono text-[#102A2A] outline-none focus:border-[#008F72] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Icône du rayon (Emoji) :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-16 p-2 text-center text-lg rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white focus:border-[#008F72] outline-none"
                  />
                  <div className="flex items-center gap-1 flex-wrap flex-1">
                    {EMOJI_PRESETS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: em })}
                        className={`text-base p-1.5 rounded-lg transition hover:bg-[#E7F2EF] ${
                          formData.icon === em ? 'bg-[#E7F2EF] ring-1 ring-[#006B55]' : 'bg-[#F7FAF9]'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Description du rayon :
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brève présentation pour guider les acheteurs et orienter le catalogue..."
                  className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs text-[#102A2A] outline-none focus:border-[#008F72] focus:bg-white transition"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFBF0] border border-[#FDE68A] space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#9A6A08]">
                  <Sparkles size={14} className="text-[#D97706]" />
                  <span>Mise en avant sur la page d'accueil (Bannière rayon)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.highlightTitle}
                    onChange={(e) => setFormData({ ...formData, highlightTitle: e.target.value })}
                    placeholder="Titre accrocheur (ex: Univers Gaming)"
                    className="w-full p-2 rounded-xl border border-[#FDE68A] bg-white text-xs text-[#102A2A] outline-none focus:border-[#D97706]"
                  />
                  <input
                    type="text"
                    value={formData.highlightSubtitle}
                    onChange={(e) => setFormData({ ...formData, highlightSubtitle: e.target.value })}
                    placeholder="Sous-titre (ex: Les meilleures configs PC au meilleur prix)"
                    className="w-full p-2 rounded-xl border border-[#FDE68A] bg-white text-xs text-[#102A2A] outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#DCE8E3]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#102A2A]">
                    Sous-catégories rattachées ({formData.subcategories.length}) :
                  </label>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#F8FAF9] rounded-xl border border-[#DCE8E3]">
                  {formData.subcategories.length === 0 ? (
                    <span className="text-[#71827D] italic text-[11px]">
                      Aucune sous-catégorie.
                    </span>
                  ) : (
                    formData.subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white border border-[#DCE8E3] text-[#102A2A]"
                      >
                        <span className="font-semibold">{sub.name}</span>
                        {sub.badge && (
                          <span className="text-[9px] px-1 py-0.2 rounded font-extrabold bg-[#E7F2EF] text-[#006B55]">
                            {sub.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategoryFromForm(idx)}
                          className="text-[#9CAFA9] hover:text-red-600 transition cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Nom de la sous-catégorie"
                    className="flex-1 p-2 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs text-[#102A2A] outline-none focus:bg-white focus:border-[#008F72]"
                  />
                  <select
                    value={newSubBadge}
                    onChange={(e) => setNewSubBadge(e.target.value)}
                    className="p-2 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-semibold text-[#102A2A] outline-none focus:border-[#008F72] cursor-pointer"
                  >
                    <option value="">Sans badge</option>
                    {BADGE_PRESETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSubcategoryToForm}
                    className="px-3.5 py-2 rounded-xl bg-[#006B55] text-white font-bold text-xs hover:bg-[#005544] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#DCE8E3]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setEditingCategory(null)
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#DCE8E3] text-[#60716F] font-bold text-xs hover:bg-[#F4FAF7] transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold text-xs hover:bg-[#005544] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{editingCategory ? 'Enregistrer' : 'Créer le rayon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : EXPLORER LES SOUS-CATÉGORIES D'UN RAYON           */}
      {/* ========================================================= */}
      {exploringCategory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#DCE8E3] max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE8E3]">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-[#E7F2EF] border border-[#BBDDD4]">
                  {exploringCategory.icon || '📦'}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-[#102A2A] font-display">
                    Sous-catégories : {exploringCategory.name}
                  </h3>
                  <p className="text-xs text-[#60716F]">
                    {exploringCategory.subcategories.length} sous-catégories rattachées
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExploringCategory(null)}
                className="p-1.5 rounded-lg text-[#71827D] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#102A2A]">Liste détaillée :</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exploringCategory.subcategories.map((sub, idx) => (
                  <div
                    key={sub.slug || idx}
                    className="p-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-center justify-between hover:bg-white transition"
                  >
                    <div>
                      <div className="font-bold text-[#102A2A] flex items-center gap-1.5">
                        <span>{sub.name}</span>
                        {sub.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-[#E7F2EF] text-[#006B55]">
                            {sub.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#71827D]">
                        /{sub.slug}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end border-t border-[#DCE8E3]">
              <button
                type="button"
                onClick={() => setExploringCategory(null)}
                className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold text-xs hover:bg-[#005544] transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CONFIRMATION SUPPRESSION CATÉGORIE                */}
      {/* ========================================================= */}
      {deletingCategory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#DCE8E3] bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
              <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                <AlertTriangle size={18} />
                <span>Supprimer le rayon marketplace</span>
              </div>
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#60716F]">
              Êtes-vous certain de vouloir supprimer le rayon <strong>« {deletingCategory.name} »</strong> ?
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-[#DCE8E3]">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
