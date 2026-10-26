/**
 * Dzora Marketplace Commission Engine
 * Evaluates dynamic commissions based on Category, Subcategory, Price Tiers,
 * and Seller Subscription Plans.
 */

import { CATEGORIES_DETAILED } from './categories'

export type SellerPlanTier = 'TRIAL' | 'BASIC' | 'PRO' | 'BUSINESS'
export type CommissionFeeType = 'PERCENT' | 'FIXED' | 'HYBRID'

export interface PriceIntervalTier {
  id: string
  minPrice: number
  maxPrice: number | null // null means unlimited/above
  ratePercent: number
  fixedFeeDa?: number // Montant fixe en DA (ex: 100 DA, 500 DA)
  feeType?: CommissionFeeType // 'PERCENT' | 'FIXED' | 'HYBRID'
  label?: string
}

export interface CommissionRule {
  id: string
  categorySlug: string
  categoryName: string
  subcategorySlug?: string
  subcategoryName?: string
  targetPlan: 'ALL' | SellerPlanTier
  baseRatePercent: number
  baseFixedFeeDa?: number // Montant fixe en DA
  feeType?: CommissionFeeType // 'PERCENT' | 'FIXED' | 'HYBRID'
  priceTiers?: PriceIntervalTier[]
  updatedAt: string
}

export interface CommissionCalculationResult {
  sellingPriceDa: number
  ratePercent: number
  fixedFeeDa: number
  feeType: CommissionFeeType
  commissionAmountDa: number
  netSellerPayoutDa: number
  ruleSource: 'SUBCATEGORY_TIER' | 'SUBCATEGORY' | 'CATEGORY_TIER' | 'CATEGORY' | 'PLAN_DEFAULT'
  appliedRuleLabel: string
  planApplied: 'ALL' | SellerPlanTier
}

export interface CalculationInput {
  category: string
  subcategory?: string
  price: number
  sellerPlan?: 'ALL' | SellerPlanTier
}

const STORAGE_KEY = 'dzora_marketplace_commission_rules'

/**
 * Standard default commission rates per plan if no category override applies
 */
export const DEFAULT_PLAN_RATES: Record<SellerPlanTier, number> = {
  TRIAL: 8.0,
  BASIC: 6.0,
  PRO: 4.0,
  BUSINESS: 2.5,
}

/**
 * Initial standard marketplace rules seed based on Algerian e-commerce practices:
 * - High-Tech / Electronics: lower margins (3% - 5%), lower on expensive items
 * - Fashion / Beauty: standard margins (7% - 9%)
 * - Home / Furniture: intermediate margins (5% - 7%)
 */
export const INITIAL_COMMISSION_RULES: CommissionRule[] = [
  // 1. Électronique
  {
    id: 'rule-cat-electronique',
    categorySlug: 'electronique',
    categoryName: 'Électronique',
    targetPlan: 'ALL',
    baseRatePercent: 5.0,
    priceTiers: [
      { id: 'tier-elec-1', minPrice: 0, maxPrice: 15000, ratePercent: 5.5, label: 'Moins de 15 000 DA' },
      { id: 'tier-elec-2', minPrice: 15001, maxPrice: 60000, ratePercent: 4.0, label: '15 001 à 60 000 DA' },
      { id: 'tier-elec-3', minPrice: 60001, maxPrice: null, ratePercent: 3.0, label: 'Plus de 60 000 DA' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-sub-smartphones',
    categorySlug: 'electronique',
    categoryName: 'Électronique',
    subcategorySlug: 'smartphones',
    subcategoryName: 'Smartphones & Téléphones',
    targetPlan: 'ALL',
    baseRatePercent: 3.5,
    priceTiers: [
      { id: 'tier-sp-1', minPrice: 0, maxPrice: 30000, ratePercent: 4.0, label: 'Entrée de gamme (< 30k)' },
      { id: 'tier-sp-2', minPrice: 30001, maxPrice: 80000, ratePercent: 3.0, label: 'Milieu de gamme (30k-80k)' },
      { id: 'tier-sp-3', minPrice: 80001, maxPrice: null, ratePercent: 2.5, label: 'Haut de gamme (> 80k)' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-sub-accessoires-mobiles',
    categorySlug: 'electronique',
    categoryName: 'Électronique',
    subcategorySlug: 'accessoires-mobiles',
    subcategoryName: 'Accessoires & Chargeurs',
    targetPlan: 'ALL',
    baseRatePercent: 7.5,
    updatedAt: new Date().toISOString(),
  },

  // 2. High-Tech
  {
    id: 'rule-cat-high-tech',
    categorySlug: 'high-tech',
    categoryName: 'High-Tech',
    targetPlan: 'ALL',
    baseRatePercent: 4.5,
    priceTiers: [
      { id: 'tier-ht-1', minPrice: 0, maxPrice: 40000, ratePercent: 5.0, label: 'Périphériques & Accessoires' },
      { id: 'tier-ht-2', minPrice: 40001, maxPrice: null, ratePercent: 3.0, label: 'PC, Laptops & Composants' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-sub-pc-portables',
    categorySlug: 'high-tech',
    categoryName: 'High-Tech',
    subcategorySlug: 'pc-portables',
    subcategoryName: 'PC portables & Ordinateurs',
    targetPlan: 'ALL',
    baseRatePercent: 2.8,
    updatedAt: new Date().toISOString(),
  },

  // 3. Mode
  {
    id: 'rule-cat-mode',
    categorySlug: 'mode',
    categoryName: 'Mode',
    targetPlan: 'ALL',
    baseRatePercent: 8.0,
    priceTiers: [
      { id: 'tier-mode-1', minPrice: 0, maxPrice: 10000, ratePercent: 8.5, label: 'Articles légers & T-shirts' },
      { id: 'tier-mode-2', minPrice: 10001, maxPrice: null, ratePercent: 7.0, label: 'Tenues premium & Cuir' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-sub-traditionnel',
    categorySlug: 'mode',
    categoryName: 'Mode',
    subcategorySlug: 'traditionnel',
    subcategoryName: 'Tenues traditionnelles & Karakous',
    targetPlan: 'ALL',
    baseRatePercent: 6.0, // Tarif réduit pour soutenir l'artisanat local algérien
    updatedAt: new Date().toISOString(),
  },

  // 4. Maison & Cuisine
  {
    id: 'rule-cat-maison-cuisine',
    categorySlug: 'maison-cuisine',
    categoryName: 'Maison & Cuisine',
    targetPlan: 'ALL',
    baseRatePercent: 6.5,
    priceTiers: [
      { id: 'tier-mc-1', minPrice: 0, maxPrice: 20000, ratePercent: 7.0, label: 'Petit électroménager' },
      { id: 'tier-mc-2', minPrice: 20001, maxPrice: null, ratePercent: 5.0, label: 'Gros électroménager' },
    ],
    updatedAt: new Date().toISOString(),
  },

  // 5. Beauté & Santé
  {
    id: 'rule-cat-beaute-sante',
    categorySlug: 'beaute-sante',
    categoryName: 'Beauté & Santé',
    targetPlan: 'ALL',
    baseRatePercent: 8.0,
    updatedAt: new Date().toISOString(),
  },

  // 6. Sport & Loisirs
  {
    id: 'rule-cat-sport-loisirs',
    categorySlug: 'sport-loisirs',
    categoryName: 'Sport & Loisirs',
    targetPlan: 'ALL',
    baseRatePercent: 7.0,
    updatedAt: new Date().toISOString(),
  },

  // 7. Enfants & Bébés
  {
    id: 'rule-cat-enfants-bebes',
    categorySlug: 'enfants-bebes',
    categoryName: 'Enfants & Bébés',
    targetPlan: 'ALL',
    baseRatePercent: 7.0,
    updatedAt: new Date().toISOString(),
  },

  // 8. Auto & Moto
  {
    id: 'rule-cat-auto-moto',
    categorySlug: 'auto-moto',
    categoryName: 'Auto & Moto',
    targetPlan: 'ALL',
    baseRatePercent: 6.0,
    priceTiers: [
      { id: 'tier-am-1', minPrice: 0, maxPrice: 15000, ratePercent: 6.5, label: 'Consommables & Huiles' },
      { id: 'tier-am-2', minPrice: 15001, maxPrice: null, ratePercent: 4.5, label: 'Pièces lourdes & Équipement' },
    ],
    updatedAt: new Date().toISOString(),
  },

  // 9. Meubles
  {
    id: 'rule-cat-meubles',
    categorySlug: 'meubles',
    categoryName: 'Meubles',
    targetPlan: 'ALL',
    baseRatePercent: 5.5,
    updatedAt: new Date().toISOString(),
  },

  // 10. Jardin & Bricolage
  {
    id: 'rule-cat-jardin-bricolage',
    categorySlug: 'jardin-bricolage',
    categoryName: 'Jardin & Bricolage',
    targetPlan: 'ALL',
    baseRatePercent: 6.0,
    updatedAt: new Date().toISOString(),
  },
]

function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const commissionService = {
  /**
   * Retrieves all active commission rules from localStorage (or seeds default)
   */
  getRules(): CommissionRule[] {
    if (typeof window === 'undefined') return INITIAL_COMMISSION_RULES
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMISSION_RULES))
    } catch {
      // Fallback
    }
    return INITIAL_COMMISSION_RULES
  },

  /**
   * Persists rules list
   */
  saveRules(rules: CommissionRule[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
      window.dispatchEvent(new Event('dzora-commission-rules-updated'))
    } catch (err) {
      console.error('Erreur sauvegarde règles commission:', err)
    }
  },

  /**
   * Restores initial default commission rules
   */
  resetToDefaults(): CommissionRule[] {
    this.saveRules(INITIAL_COMMISSION_RULES)
    return INITIAL_COMMISSION_RULES
  },

  /**
   * Upsert a rule (add new or update existing)
   */
  upsertRule(ruleInput: Omit<CommissionRule, 'id' | 'updatedAt'> & { id?: string }): CommissionRule {
    const rules = this.getRules()
    const id = ruleInput.id || `rule-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const updatedRule: CommissionRule = {
      ...ruleInput,
      id,
      updatedAt: new Date().toISOString(),
    }

    const idx = rules.findIndex((r) => r.id === id)
    if (idx >= 0) {
      rules[idx] = updatedRule
    } else {
      rules.push(updatedRule)
    }

    this.saveRules(rules)
    return updatedRule
  },

  /**
   * Delete a rule
   */
  deleteRule(ruleId: string): void {
    const rules = this.getRules()
    const filtered = rules.filter((r) => r.id !== ruleId)
    this.saveRules(filtered)
  },

  /**
   * Retrieves all rules for a given category (main category + all subcategories)
   */
  getRulesForCategory(categorySlug: string): CommissionRule[] {
    const norm = normalize(categorySlug)
    return this.getRules().filter(
      (r) => normalize(r.categorySlug) === norm || normalize(r.categoryName) === norm
    )
  },

  /**
   * Replaces all rules for a specific category with updated rules atomically
   */
  saveRulesForCategory(categorySlug: string, newCategoryRules: CommissionRule[]): void {
    const norm = normalize(categorySlug)
    const otherRules = this.getRules().filter(
      (r) => normalize(r.categorySlug) !== norm && normalize(r.categoryName) !== norm
    )
    this.saveRules([...otherRules, ...newCategoryRules])
  },

  /**
   * Pure evaluation calculation:
   * Finds the most specific commission rule matching Category, Subcategory, Price Interval, and Seller Plan.
   */
  calculateCommission(input: CalculationInput): CommissionCalculationResult {
    const price = Math.max(0, input.price || 0)
    const plan: SellerPlanTier = input.sellerPlan && input.sellerPlan !== 'ALL' ? input.sellerPlan : 'PRO'
    const rules = this.getRules()

    const normCat = normalize(input.category || '')
    const normSub = input.subcategory ? normalize(input.subcategory) : ''

    const isCatMatch = (r: CommissionRule) =>
      normalize(r.categorySlug) === normCat || normalize(r.categoryName) === normCat

    const isSubMatch = (r: CommissionRule) => {
      if (!normSub) return false
      return (
        (Boolean(r.subcategorySlug) && normalize(r.subcategorySlug!) === normSub) ||
        (Boolean(r.subcategoryName) && normalize(r.subcategoryName!) === normSub)
      )
    }

    // 1. Try finding specific Subcategory rule
    if (normSub) {
      // 1a. Plan-specific subcategory rule
      const subPlanRule = rules.find(
        (r) => isCatMatch(r) && isSubMatch(r) && r.targetPlan === plan
      )

      if (subPlanRule) {
        return this.evaluateRuleTiers(subPlanRule, price, 'SUBCATEGORY_TIER', plan)
      }

      // 1b. Global 'ALL' plans subcategory rule
      const subAllRule = rules.find(
        (r) => isCatMatch(r) && isSubMatch(r) && r.targetPlan === 'ALL'
      )

      if (subAllRule) {
        // If a plan discount applies from seller plan, we can adjust or use rule rate
        return this.evaluateRuleTiers(subAllRule, price, 'SUBCATEGORY_TIER', 'ALL', plan)
      }
    }

    // 2. Try finding Category rule
    // 2a. Plan-specific category rule
    const catPlanRule = rules.find(
      (r) => isCatMatch(r) && !r.subcategorySlug && r.targetPlan === plan
    )
    if (catPlanRule) {
      return this.evaluateRuleTiers(catPlanRule, price, 'CATEGORY_TIER', plan)
    }

    // 2b. Global 'ALL' plans category rule
    const catAllRule = rules.find(
      (r) => isCatMatch(r) && !r.subcategorySlug && r.targetPlan === 'ALL'
    )
    if (catAllRule) {
      return this.evaluateRuleTiers(catAllRule, price, 'CATEGORY_TIER', 'ALL', plan)
    }

    // 3. Fallback to Seller Plan Default Rate
    const fallbackRate = DEFAULT_PLAN_RATES[plan] || 4.0
    const commissionAmt = Math.round((price * fallbackRate) / 100)
    return {
      sellingPriceDa: price,
      ratePercent: fallbackRate,
      fixedFeeDa: 0,
      feeType: 'PERCENT',
      commissionAmountDa: commissionAmt,
      netSellerPayoutDa: Math.max(0, price - commissionAmt),
      ruleSource: 'PLAN_DEFAULT',
      appliedRuleLabel: `Taux standard forfait ${plan} (${fallbackRate} %)`,
      planApplied: plan,
    }
  },

  /**
   * Helper to check price interval tiers on a rule
   */
  evaluateRuleTiers(
    rule: CommissionRule,
    price: number,
    source: 'SUBCATEGORY_TIER' | 'CATEGORY_TIER',
    planScope: 'ALL' | SellerPlanTier,
    activeSellerPlan?: SellerPlanTier
  ): CommissionCalculationResult {
    let feeType: CommissionFeeType = rule.feeType || 'PERCENT'
    let rate = rule.baseRatePercent
    let fixedFee = rule.baseFixedFeeDa || 0
    let tierLabel = ''

    // Check price intervals
    if (rule.priceTiers && rule.priceTiers.length > 0) {
      const matchedTier = rule.priceTiers.find((t) => {
        if (t.maxPrice === null) {
          return price >= t.minPrice
        }
        return price >= t.minPrice && price <= t.maxPrice
      })

      if (matchedTier) {
        if (matchedTier.feeType) {
          feeType = matchedTier.feeType
        }
        rate = matchedTier.ratePercent
        if (matchedTier.fixedFeeDa !== undefined) {
          fixedFee = matchedTier.fixedFeeDa
        }
        tierLabel = matchedTier.label ? ` · Tranche: ${matchedTier.label}` : ''
      }
    }

    // If rule is for 'ALL' plans, Business and Pro sellers get preferential adjustments:
    if (planScope === 'ALL' && activeSellerPlan) {
      if (activeSellerPlan === 'BUSINESS') {
        rate = Math.max(1.5, Number((rate - 1.0).toFixed(1)))
        fixedFee = Math.max(0, Math.round(fixedFee * 0.85)) // 15% discount on fixed fee for Business
      } else if (activeSellerPlan === 'PRO') {
        rate = Math.max(2.0, Number((rate - 0.5).toFixed(1)))
        fixedFee = Math.max(0, Math.round(fixedFee * 0.92)) // 8% discount on fixed fee for Pro
      }
    }

    // Compute commission depending on feeType
    let commissionAmt = 0
    if (feeType === 'FIXED') {
      commissionAmt = fixedFee
    } else if (feeType === 'HYBRID') {
      commissionAmt = Math.round((price * rate) / 100) + fixedFee
    } else {
      commissionAmt = Math.round((price * rate) / 100)
    }

    commissionAmt = Math.max(0, commissionAmt)
    const netPayout = Math.max(0, price - commissionAmt)

    const entityName = rule.subcategoryName
      ? `${rule.categoryName} > ${rule.subcategoryName}`
      : rule.categoryName

    const planLabel =
      planScope === 'ALL'
        ? activeSellerPlan ? `Tous forfaits (${activeSellerPlan})` : 'Tous forfaits'
        : `Forfait ${planScope}`

    let feeSummary = ''
    if (feeType === 'FIXED') {
      feeSummary = `${fixedFee.toLocaleString()} DA fixe`
    } else if (feeType === 'HYBRID') {
      feeSummary = `${rate}% + ${fixedFee.toLocaleString()} DA`
    } else {
      feeSummary = `${rate}%`
    }

    return {
      sellingPriceDa: price,
      ratePercent: rate,
      fixedFeeDa: fixedFee,
      feeType,
      commissionAmountDa: commissionAmt,
      netSellerPayoutDa: netPayout,
      ruleSource: source,
      appliedRuleLabel: `Barème ${entityName}${tierLabel} [${feeSummary}] [${planLabel}]`,
      planApplied: planScope,
    }
  },
}
