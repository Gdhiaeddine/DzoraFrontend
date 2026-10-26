'use client'

import React, { useState, useEffect, useMemo, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Edit3,
  Layers,
  Percent,
  Coins,
  Tag,
  CheckCircle2,
  Package,
  Sparkles,
  Calculator,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Plus,
  SlidersHorizontal,
} from 'lucide-react'
import { categoriesStore } from '@/lib/categories-store'
import { CategoryDetail, categoryIcons } from '@/lib/categories'
import {
  commissionService,
  CommissionRule,
  SellerPlanTier,
  CommissionCalculationResult,
} from '@/lib/commission-service'
import { sellerProductsService, SellerProductItem } from '@/lib/seller-products-service'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const categorySlug = resolvedParams.slug
  const router = useRouter()

  const [category, setCategory] = useState<CategoryDetail | null>(null)
  const [rules, setRules] = useState<CommissionRule[]>([])
  const [products, setProducts] = useState<SellerProductItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulator state
  const [simSubcategory, setSimSubcategory] = useState<string>('')
  const [simPrice, setSimPrice] = useState<number>(35000)
  const [simPlan, setSimPlan] = useState<SellerPlanTier>('PRO')

  const loadData = async () => {
    const found = categoriesStore.getCategoryBySlug(categorySlug)
    if (found) {
      setCategory(found)
      const catRules = commissionService.getRulesForCategory(found.slug)
      setRules(catRules)

      // Find products in this category
      try {
        const approved = await sellerProductsService.getAllApprovedProducts()
        const matchingProds = approved.filter(
          (p: SellerProductItem) =>
            p.category.toLowerCase().trim() === found.name.toLowerCase().trim() ||
            p.category.toLowerCase().trim() === found.slug.toLowerCase().trim()
        )
        setProducts(matchingProds)
      } catch (err) {
        console.warn('Erreur chargement articles pour catégorie:', err)
      }

      if (found.subcategories && found.subcategories.length > 0 && !simSubcategory) {
        setSimSubcategory(found.subcategories[0].name)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()

    const onUpdate = () => loadData()
    window.addEventListener('dzora-categories-updated', onUpdate)
    window.addEventListener('dzora-commission-rules-updated', onUpdate)
    return () => {
      window.removeEventListener('dzora-categories-updated', onUpdate)
      window.removeEventListener('dzora-commission-rules-updated', onUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug])

  // Main category rule
  const mainCategoryRule = useMemo(() => {
    return rules.find((r) => !r.subcategorySlug && !r.subcategoryName) || null
  }, [rules])

  // Calculation in simulator
  const simResult: CommissionCalculationResult = useMemo(() => {
    if (!category) {
      return {
        sellingPriceDa: simPrice,
        ratePercent: 5.0,
        fixedFeeDa: 0,
        feeType: 'PERCENT',
        commissionAmountDa: Math.round((simPrice * 5) / 100),
        netSellerPayoutDa: Math.round(simPrice - (simPrice * 5) / 100),
        ruleSource: 'CATEGORY',
        appliedRuleLabel: 'Taux standard',
        planApplied: simPlan,
      }
    }
    return commissionService.calculateCommission({
      category: category.name,
      subcategory: simSubcategory || undefined,
      price: simPrice,
      sellerPlan: simPlan,
    })
  }, [category, simSubcategory, simPrice, simPlan])

  if (isLoading) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
          <div className="size-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-3" />
          <p className="text-xs font-bold text-[#102A2A]">Chargement du rayon…</p>
        </div>
      </main>
    )
  }

  if (!category) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div className="max-w-3xl mx-auto p-6 sm:p-10 space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 inline-block mx-auto">
            <AlertCircle size={32} className="mx-auto mb-2 text-amber-700" />
            <h2 className="text-lg font-bold">Catégorie introuvable</h2>
            <p className="text-xs text-[#60716F] mt-1">
              Aucune catégorie ne correspond au slug <strong>« {categorySlug} »</strong>.
            </p>
          </div>
          <div>
            <Link
              href="/admin/dashboard/categories"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition"
            >
              <ArrowLeft size={14} />
              <span>Retour à la liste des rayons</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const LucideIconComp = categoryIcons[category.name]?.icon || Package

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      {/* 1. Header Navigation & Actions (Full Width) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <ChevronRight size={12} className="text-[#94A4A0]" />
            <span className="text-[#102A2A] font-semibold">{category.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
            Rayon : {category.name}
          </h1>
          <p className="text-xs font-medium text-[#60716F] mt-0.5">
            Détails du rayon officiel, arborescence des sous-catégories et barèmes des commissions marketplace
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/dashboard/categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE8E3] bg-white text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <ArrowLeft size={14} />
            <span>Retour aux rayons</span>
          </Link>

          <Link
            href={`/admin/dashboard/categories/${category.slug}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs"
          >
            <Edit3 size={15} />
            <span>Modifier ce rayon & barème</span>
          </Link>
        </div>
      </div>

      {/* 2. Category Identity Banner Card */}
      <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,42,42,0.02)] w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-2xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center text-3xl shrink-0 border border-[#BBDDD4] shadow-xs">
              {category.icon || <LucideIconComp size={32} />}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#102A2A] font-display">
                  {category.name}
                </h2>
                <span className="font-mono text-xs text-[#006B55] bg-[#E7F2EF] px-2 py-0.5 rounded-md border border-[#BBDDD4]">
                  /{category.slug}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Actif sur Dzora
                </span>
                {category.featuredHighlight && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>En vedette accueil</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#60716F] max-w-3xl leading-relaxed">
                {category.description || 'Rayon officiel de la marketplace Dzora.'}
              </p>
            </div>
          </div>

          {/* Quick Summary Stats */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-[#F7FAF9] p-3.5 rounded-xl border border-[#DCE8E3]">
            <div className="text-center px-2">
              <span className="text-xl font-extrabold text-[#102A2A] font-display block">
                {category.subcategories.length}
              </span>
              <span className="text-[10px] font-bold text-[#60716F] uppercase tracking-wider">
                Sous-rayons
              </span>
            </div>
            <div className="w-px h-8 bg-[#DCE8E3]" />
            <div className="text-center px-2">
              <span className="text-xl font-extrabold text-[#006B55] font-display block">
                {mainCategoryRule?.baseRatePercent ?? 5.0} %
              </span>
              <span className="text-[10px] font-bold text-[#60716F] uppercase tracking-wider">
                Taux Rayon
              </span>
            </div>
            <div className="w-px h-8 bg-[#DCE8E3]" />
            <div className="text-center px-2">
              <span className="text-xl font-extrabold text-[#102A2A] font-display block">
                {products.length}
              </span>
              <span className="text-[10px] font-bold text-[#60716F] uppercase tracking-wider">
                Articles en ligne
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Grid (Full Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Subcategories & Detailed Commission Tiers (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.02)] overflow-hidden">
            <div className="p-5 border-b border-[#DCE8E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E7F2EF] text-[#006B55]">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#102A2A] font-display">
                    Sous-catégories & Barèmes de Commission Détaillés
                  </h3>
                  <p className="text-xs text-[#60716F]">
                    Chaque sous-catégorie possède ses propres taux et paliers de prix en DA
                  </p>
                </div>
              </div>

              <Link
                href={`/admin/dashboard/categories/${category.slug}/edit#subcategories`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BBDDD4] bg-[#E7F2EF] text-xs font-bold text-[#006B55] hover:bg-[#d4ede6] transition shrink-0"
              >
                <Plus size={13} />
                <span>Modifier barèmes</span>
              </Link>
            </div>

            {/* Subcategories Detailed List */}
            <div className="divide-y divide-[#EAF0ED]">
              {category.subcategories.map((sub, idx) => {
                const subRule = rules.find(
                  (r) =>
                    r.subcategorySlug?.toLowerCase().trim() === sub.slug.toLowerCase().trim() ||
                    r.subcategoryName?.toLowerCase().trim() === sub.name.toLowerCase().trim()
                )

                const baseRate = subRule ? subRule.baseRatePercent : (mainCategoryRule?.baseRatePercent ?? 5.0)
                const hasCustomRule = Boolean(subRule)
                const hasPriceTiers = Boolean(subRule?.priceTiers && subRule.priceTiers.length > 0)

                return (
                  <div key={sub.slug} className="p-5 hover:bg-[#F9FCFA] transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="size-6 rounded-lg bg-[#E7F2EF] text-[#006B55] font-black text-xs grid place-items-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-[#102A2A]">{sub.name}</h4>
                            <span className="font-mono text-[10px] text-[#71827D]">
                              /{sub.slug}
                            </span>
                            {sub.badge && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {sub.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                            hasCustomRule
                              ? 'bg-[#E7F2EF] text-[#006B55] border-[#BBDDD4]'
                              : 'bg-[#F4FAF7] text-[#4A5D58] border-[#DCE8E3]'
                          }`}
                        >
                          {subRule?.feeType === 'FIXED'
                            ? `${(subRule.baseFixedFeeDa ?? 200).toLocaleString()} DA fixe`
                            : subRule?.feeType === 'HYBRID'
                            ? `${baseRate}% + ${(subRule.baseFixedFeeDa ?? 150).toLocaleString()} DA`
                            : `Taux de base : ${baseRate} %`}
                        </span>
                        <span className="text-[10px] font-bold text-[#71827D] bg-white border border-[#DCE8E3] px-2 py-1 rounded-lg">
                          {subRule ? (subRule.targetPlan === 'ALL' ? 'Tous forfaits' : `Forfait ${subRule.targetPlan}`) : 'Hérite rayon'}
                        </span>
                      </div>
                    </div>

                    {/* Price Tiers if any */}
                    {hasPriceTiers && subRule?.priceTiers ? (
                      <div className="mt-2 p-3 rounded-xl bg-[#F7FAF9] border border-[#DCE8E3] space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4A5D58] block">
                          Paliers de montants (DA) & commissions configurés ({subRule.priceTiers.length}) :
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {subRule.priceTiers.map((tier) => {
                            const tierType = tier.feeType || 'PERCENT'
                            const tierDisplay =
                              tierType === 'FIXED'
                                ? `${(tier.fixedFeeDa ?? 0).toLocaleString()} DA fixe`
                                : tierType === 'HYBRID'
                                ? `${tier.ratePercent}% + ${(tier.fixedFeeDa ?? 0).toLocaleString()} DA`
                                : `${tier.ratePercent} %`

                            return (
                              <div
                                key={tier.id}
                                className="bg-white p-2.5 rounded-lg border border-[#DCE8E3] flex items-center justify-between shadow-2xs"
                              >
                                <div>
                                  <span className="text-xs font-bold text-[#102A2A] block">
                                    {tier.minPrice.toLocaleString()} DA -{' '}
                                    {tier.maxPrice !== null ? `${tier.maxPrice.toLocaleString()} DA` : 'Illimité'}
                                  </span>
                                  {tier.label && (
                                    <span className="text-[10px] text-[#71827D]">
                                      {tier.label}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-black text-[#006B55] bg-[#E7F2EF] px-2 py-0.5 rounded">
                                  {tierDisplay}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#71827D] flex items-center gap-1.5 pl-8">
                        <CheckCircle2 size={13} className="text-[#006B55]" />
                        <span>
                          {hasCustomRule
                            ? 'Taux fixe uniforme sans paliers de montant.'
                            : 'Aucun barème spécifique défini. Ce sous-rayon hérite du taux standard de 5.0 %.'}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Approved Products in this category */}
          <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E7F2EF] text-[#006B55]">
                  <Package size={15} />
                </div>
                <h3 className="font-bold text-sm text-[#102A2A] font-display">
                  Articles approuvés dans ce rayon ({products.length})
                </h3>
              </div>
              <Link
                href="/admin/dashboard/produits"
                className="text-xs font-bold text-[#006B55] hover:text-[#005544] flex items-center gap-1"
              >
                <span>Gérer les articles</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {products.length === 0 ? (
              <p className="text-xs text-[#71827D] py-4 text-center">
                Aucun article actuellement en ligne dans ce rayon.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.slice(0, 4).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-xs text-[#102A2A] line-clamp-1 block">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-[#71827D]">
                        {prod.subcategory || category.name} · {prod.price.toLocaleString()} DA
                      </span>
                    </div>
                    <Link
                      href={`/products/${prod.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-white border border-[#DCE8E3] text-[#006B55] hover:bg-[#E7F2EF] transition shrink-0"
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Commission Simulator for this Category (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E8F0ED]">
              <div className="p-1.5 rounded-lg bg-[#006B55] text-white">
                <Calculator size={15} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#102A2A] font-display">
                  Simulateur en Direct
                </h3>
                <p className="text-[10px] text-[#60716F]">
                  Testez les commissions appliquées aux vendeurs
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Sous-catégorie testée
                </label>
                <select
                  value={simSubcategory}
                  onChange={(e) => setSimSubcategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                >
                  <option value="">Général ({category.name})</option>
                  {category.subcategories.map((sub) => (
                    <option key={sub.slug} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#102A2A] mb-1">
                  Prix de vente vendeur (DA)
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
                  Forfait vendeur souscrit
                </label>
                <select
                  value={simPlan}
                  onChange={(e) => setSimPlan(e.target.value as SellerPlanTier)}
                  className="w-full h-9 px-3 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] outline-none focus:border-[#006B55] focus:bg-white"
                >
                  <option value="TRIAL">Essai Gratuit (8%)</option>
                  <option value="BASIC">Starter (6%)</option>
                  <option value="PRO">Pro (4%)</option>
                  <option value="BUSINESS">Business (2.5%)</option>
                </select>
              </div>

              {/* Calculation Output Box */}
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
                  <span className="text-[#4A5D58] font-medium">Commission Dzora :</span>
                  <span className="font-extrabold text-amber-900">
                    -{simResult.commissionAmountDa.toLocaleString()} DA
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border-2 border-[#006B55] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#4A5D58] uppercase tracking-wider block">
                      Net Vendeur
                    </span>
                    <span className="text-[9px] text-[#71827D]">Montant reversé</span>
                  </div>
                  <span className="text-base font-black text-[#006B55] font-display">
                    {simResult.netSellerPayoutDa.toLocaleString()} DA
                  </span>
                </div>

                <div className="text-[10px] text-[#4A5D58] bg-white/70 p-2 rounded-lg border border-[#DCE8E3] leading-snug">
                  <span className="font-bold">Source : </span>
                  <span>{simResult.appliedRuleLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-[#DCE8E3] p-5 shadow-[0_2px_10px_rgba(16,42,42,0.02)] space-y-3">
            <h4 className="font-bold text-xs text-[#102A2A]">Actions rapides</h4>
            <Link
              href={`/admin/dashboard/categories/${category.slug}/edit`}
              className="w-full py-2.5 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Edit3 size={14} />
              <span>Modifier le barème & sous-rayons</span>
            </Link>
            <Link
              href="/admin/dashboard/categories"
              className="w-full py-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] text-xs font-bold text-[#60716F] hover:bg-[#E7F2EF] hover:text-[#006B55] transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Retour à la liste des catégories</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
