/**
 * Seller Products Management & Moderation Service
 * Handles full product lifecycle: Draft -> Pending Review -> Approved / Rejected,
 * multi-image management, inventory alerts, and admin moderation sync.
 */

import { DZORA_PRODUCTS, type CatalogProduct } from './products-data'

export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED'

export interface SellerProductItem {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  sku: string
  barcode?: string
  stock: number
  lowStockAlert: number
  category: string
  subcategory?: string
  brand: string
  images: string[]
  mainImage: string
  weightKg?: number
  dimensions?: { length?: number; width?: number; height?: number }
  status: ProductStatus
  rejectionReason?: string
  reviewedAt?: string
  reviewedBy?: string
  rating: number
  reviewsCount: number
  salesCount: number
  sellerId?: string
  storeName: string
  storeSlug: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  sku?: string
  barcode?: string
  stock: number
  lowStockAlert?: number
  category: string
  subcategory?: string
  brand?: string
  images: string[]
  mainImage?: string
  weightKg?: number
  submitForReview?: boolean // if true -> PENDING_REVIEW, else DRAFT
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
}

const STORAGE_PREFIX = 'dzora_seller_products_'
const ALL_SELLERS_KEY = 'dzora_all_seller_slugs'

export const DEFAULT_SELLER_SLUGS = [
  'techno-blida',
  'tech-dz',
  'fashion-setif',
  'sport-dz',
  'abc-store',
  'auto-pieces-alger',
  'bebe-paradis',
  'brico-plus-setif',
  'informatique-blida',
  'mobilier-deco-oran',
  'parapharmacie-setif',
]

function getStorageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug.toLowerCase().trim()}`
}

function registerSellerSlug(slug: string) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(ALL_SELLERS_KEY)
    const set = new Set<string>(raw ? JSON.parse(raw) : DEFAULT_SELLER_SLUGS)
    set.add(slug.toLowerCase().trim())
    localStorage.setItem(ALL_SELLERS_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Generate seed products for a seller if first time opening
 */
function generateSeedProducts(storeName: string, storeSlug: string): SellerProductItem[] {
  const normSlug = storeSlug.toLowerCase().trim()
  const normName = storeName.toLowerCase().trim()

  // Match existing marketplace products if any
  const matched = DZORA_PRODUCTS.filter((p) => {
    const pStore = p.store.toLowerCase().trim()
    const pSlug = pStore.replace(/[^a-z0-9]+/g, '-')
    return pStore === normName || pSlug === normSlug || normSlug.includes(pSlug) || pSlug.includes(normSlug)
  })

  const seeds: SellerProductItem[] = []

  // 1. Approved products
  matched.forEach((p, idx) => {
    seeds.push({
      id: p.id || `seed-${normSlug}-${idx}`,
      name: p.name,
      slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: `${p.subtitle || p.name}. Produit authentique garanti avec facture officielle et garantie constructeur.`,
      price: p.price,
      compareAtPrice: p.oldPrice,
      sku: `DZ-${p.brand.slice(0, 3).toUpperCase()}-${100 + idx}`,
      barcode: `613${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      stock: 18 + idx * 5,
      lowStockAlert: 5,
      category: p.category,
      subcategory: p.category === 'Électronique' ? 'Smartphones & Audio' : 'Général',
      brand: p.brand,
      images: [p.image],
      mainImage: p.image,
      weightKg: 0.45,
      status: 'APPROVED',
      rating: p.rating || 4.8,
      reviewsCount: p.reviews || 42,
      salesCount: 85 + idx * 12,
      storeName: storeName,
      storeSlug: normSlug,
      createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString(),
      reviewedAt: new Date(Date.now() - (idx + 1) * 86400000 * 4).toISOString(),
      reviewedBy: 'Admin Dzora',
    })
  })

  // 2. Pending review product (demonstrates admin moderation workflow)
  seeds.push({
    id: `prod-${normSlug}-pending-1`,
    name: 'Casque Audio ANC Sans Fil Pro Bass',
    slug: 'casque-audio-anc-pro-bass',
    description: 'Casque circum-aural avec réduction de bruit active (ANC -35dB), autonomie de 40 heures et charge ultra-rapide USB-C.',
    price: 8900,
    compareAtPrice: 11500,
    costPrice: 6200,
    sku: `DZ-SND-890`,
    barcode: '6138901234567',
    stock: 25,
    lowStockAlert: 5,
    category: 'Électronique',
    subcategory: 'Audio & Casques',
    brand: 'SoundPro DZ',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    ],
    mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    weightKg: 0.38,
    status: 'PENDING_REVIEW',
    rating: 0,
    reviewsCount: 0,
    salesCount: 0,
    storeName: storeName,
    storeSlug: normSlug,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  })

  // 3. Rejected product (demonstrates rejection feedback & correction workflow)
  seeds.push({
    id: `prod-${normSlug}-rejected-1`,
    name: 'Smartwatch Sport Fit Waterproof IP68',
    slug: 'smartwatch-sport-fit-ip68',
    description: 'Montre connectée sportive avec suivi cardiaque continu, mesure de SpO2 et podomètre dynamique.',
    price: 6400,
    compareAtPrice: 8500,
    costPrice: 4200,
    sku: `DZ-WCH-640`,
    barcode: '6136409876543',
    stock: 12,
    lowStockAlert: 3,
    category: 'High-Tech',
    subcategory: 'Montres Connectées',
    brand: 'FitDZ',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    ],
    mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    weightKg: 0.15,
    status: 'REJECTED',
    rejectionReason: 'La première photo comporte un filigrane promotionnel externe non autorisé. Veuillez téléverser une image de couverture nette sur fond neutre ou blanc pour validation.',
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    reviewedBy: 'Modérateur Dzora #4',
    rating: 0,
    reviewsCount: 0,
    salesCount: 0,
    storeName: storeName,
    storeSlug: normSlug,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  })

  // 4. Draft product
  seeds.push({
    id: `prod-${normSlug}-draft-1`,
    name: 'Chargeur Rapide GaN 65W Double Port Type-C',
    slug: 'chargeur-rapide-gan-65w',
    description: 'Bloc chargeur compact technologie GaN III compatible Power Delivery et Quick Charge.',
    price: 3200,
    sku: `DZ-PWR-065`,
    stock: 40,
    lowStockAlert: 10,
    category: 'Électronique',
    subcategory: 'Accessoires & Câbles',
    brand: 'Anker DZ',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    ],
    mainImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    weightKg: 0.12,
    status: 'DRAFT',
    rating: 0,
    reviewsCount: 0,
    salesCount: 0,
    storeName: storeName,
    storeSlug: normSlug,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  })

  return seeds
}

export const sellerProductsService = {
  /**
   * Get all products belonging to this seller
   */
  async getProducts(storeName: string, storeSlug: string): Promise<SellerProductItem[]> {
    if (typeof window === 'undefined') return []
    registerSellerSlug(storeSlug)
    const key = getStorageKey(storeSlug)

    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // Fallback to seeding
    }

    const seeds = generateSeedProducts(storeName, storeSlug)
    try {
      localStorage.setItem(key, JSON.stringify(seeds))
    } catch {
      // Storage quota or error
    }
    return seeds
  },

  /**
   * Create a new product (defaults to PENDING_REVIEW for admin moderation, or DRAFT)
   */
  async createProduct(
    storeName: string,
    storeSlug: string,
    input: CreateProductInput
  ): Promise<SellerProductItem> {
    const products = await this.getProducts(storeName, storeSlug)
    const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const slug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const mainImg =
      input.mainImage ||
      input.images[0] ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'

    const newProduct: SellerProductItem = {
      id,
      name: input.name.trim(),
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      description: input.description?.trim() || '',
      price: Number(input.price) || 0,
      compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : undefined,
      costPrice: input.costPrice ? Number(input.costPrice) : undefined,
      sku: input.sku?.trim() || `DZ-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: input.barcode?.trim(),
      stock: Number(input.stock) || 0,
      lowStockAlert: Number(input.lowStockAlert) || 5,
      category: input.category,
      subcategory: input.subcategory?.trim(),
      brand: input.brand?.trim() || storeName,
      images: input.images.length > 0 ? input.images : [mainImg],
      mainImage: mainImg,
      weightKg: input.weightKg ? Number(input.weightKg) : 0.5,
      status: input.submitForReview === false ? 'DRAFT' : 'PENDING_REVIEW',
      rating: 0,
      reviewsCount: 0,
      salesCount: 0,
      storeName,
      storeSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newProduct, ...products]
    localStorage.setItem(getStorageKey(storeSlug), JSON.stringify(updated))
    return newProduct
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    storeName: string,
    storeSlug: string,
    input: UpdateProductInput
  ): Promise<SellerProductItem> {
    const products = await this.getProducts(storeName, storeSlug)
    const idx = products.findIndex((p) => p.id === input.id)
    if (idx === -1) {
      throw new Error('Produit introuvable')
    }

    const current = products[idx]
    const shouldResubmit = input.submitForReview === true

    const updatedProduct: SellerProductItem = {
      ...current,
      name: input.name !== undefined ? input.name.trim() : current.name,
      description: input.description !== undefined ? input.description.trim() : current.description,
      price: input.price !== undefined ? Number(input.price) : current.price,
      compareAtPrice: input.compareAtPrice !== undefined ? Number(input.compareAtPrice) : current.compareAtPrice,
      costPrice: input.costPrice !== undefined ? Number(input.costPrice) : current.costPrice,
      sku: input.sku !== undefined ? input.sku.trim() : current.sku,
      barcode: input.barcode !== undefined ? input.barcode.trim() : current.barcode,
      stock: input.stock !== undefined ? Number(input.stock) : current.stock,
      lowStockAlert: input.lowStockAlert !== undefined ? Number(input.lowStockAlert) : current.lowStockAlert,
      category: input.category !== undefined ? input.category : current.category,
      subcategory: input.subcategory !== undefined ? input.subcategory.trim() : current.subcategory,
      brand: input.brand !== undefined ? input.brand.trim() : current.brand,
      images: input.images !== undefined ? input.images : current.images,
      mainImage: input.mainImage || (input.images && input.images[0]) || current.mainImage,
      weightKg: input.weightKg !== undefined ? Number(input.weightKg) : current.weightKg,
      // If resubmitted from rejected or draft, clear rejection reason and go back to pending review
      status: shouldResubmit
        ? 'PENDING_REVIEW'
        : input.submitForReview === false
        ? 'DRAFT'
        : current.status === 'REJECTED' && shouldResubmit
        ? 'PENDING_REVIEW'
        : current.status,
      rejectionReason: shouldResubmit ? undefined : current.rejectionReason,
      updatedAt: new Date().toISOString(),
    }

    products[idx] = updatedProduct
    localStorage.setItem(getStorageKey(storeSlug), JSON.stringify(products))
    return updatedProduct
  },

  /**
   * Delete product
   */
  async deleteProduct(storeSlug: string, id: string): Promise<boolean> {
    const key = getStorageKey(storeSlug)
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return false
      const products: SellerProductItem[] = JSON.parse(stored)
      const filtered = products.filter((p) => p.id !== id)
      localStorage.setItem(key, JSON.stringify(filtered))
      return true
    } catch {
      return false
    }
  },

  /**
   * Duplicate product
   */
  async duplicateProduct(
    storeName: string,
    storeSlug: string,
    id: string
  ): Promise<SellerProductItem> {
    const products = await this.getProducts(storeName, storeSlug)
    const original = products.find((p) => p.id === id)
    if (!original) throw new Error('Produit source introuvable')

    const clone: SellerProductItem = {
      ...original,
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${original.name} (Copie)`,
      slug: `${original.slug}-copie-${Date.now().toString().slice(-4)}`,
      sku: `${original.sku}-CP`,
      status: 'DRAFT',
      salesCount: 0,
      rating: 0,
      reviewsCount: 0,
      rejectionReason: undefined,
      reviewedAt: undefined,
      reviewedBy: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [clone, ...products]
    localStorage.setItem(getStorageKey(storeSlug), JSON.stringify(updated))
    return clone
  },

  /* -------------------------------------------------------------------------- */
  /*                       Admin Product Moderation APIs                        */
  /* -------------------------------------------------------------------------- */

  /**
   * Get all registered seller slugs
   */
  getAllSellerSlugs(): string[] {
    if (typeof window === 'undefined') return DEFAULT_SELLER_SLUGS
    try {
      const raw = localStorage.getItem(ALL_SELLERS_KEY)
      const list: string[] = raw ? JSON.parse(raw) : DEFAULT_SELLER_SLUGS
      const set = new Set<string>([...DEFAULT_SELLER_SLUGS, ...list])
      localStorage.setItem(ALL_SELLERS_KEY, JSON.stringify(Array.from(set)))
      return Array.from(set)
    } catch {
      return DEFAULT_SELLER_SLUGS
    }
  },

  /**
   * Get all products across all sellers (all statuses)
   */
  async getAllProductsAcrossSellers(): Promise<SellerProductItem[]> {
    if (typeof window === 'undefined') return []
    const slugs = this.getAllSellerSlugs()
    const all: SellerProductItem[] = []

    for (const slug of slugs) {
      const storeName = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      const products = await this.getProducts(storeName, slug)
      all.push(...products)
    }

    const map = new Map<string, SellerProductItem>()
    all.forEach((p) => map.set(p.id, p))
    return Array.from(map.values())
  },

  /**
   * Get all approved products visible on public marketplace
   */
  async getAllApprovedProducts(): Promise<SellerProductItem[]> {
    const all = await this.getAllProductsAcrossSellers()
    return all.filter((p) => p.status === 'APPROVED')
  },

  /**
   * Lookup single product by slug or id across all sellers
   */
  async getProductBySlug(slugOrId: string): Promise<SellerProductItem | null> {
    const norm = slugOrId.toLowerCase().trim()
    const all = await this.getAllProductsAcrossSellers()
    return (
      all.find(
        (p) =>
          p.slug.toLowerCase() === norm ||
          p.id.toLowerCase() === norm ||
          p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === norm
      ) || null
    )
  },

  /**
   * Get all products requiring moderation across all sellers
   */
  async getAllPendingProducts(): Promise<SellerProductItem[]> {
    const all = await this.getAllProductsAcrossSellers()
    return all.filter((p) => p.status === 'PENDING_REVIEW')
  },

  /**
   * Admin approves a product for publication
   */
  async adminApproveProduct(
    storeSlug: string,
    productId: string,
    reviewerName: string = 'Administrateur Dzora'
  ): Promise<SellerProductItem> {
    const key = getStorageKey(storeSlug)
    const stored = localStorage.getItem(key)
    if (!stored) throw new Error('Boutique introuvable')

    const list: SellerProductItem[] = JSON.parse(stored)
    const idx = list.findIndex((p) => p.id === productId)
    if (idx === -1) throw new Error('Produit introuvable')

    list[idx] = {
      ...list[idx],
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerName,
      rejectionReason: undefined,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(key, JSON.stringify(list))
    return list[idx]
  },

  /**
   * Admin rejects a product with moderation reason
   */
  async adminRejectProduct(
    storeSlug: string,
    productId: string,
    reason: string,
    reviewerName: string = 'Administrateur Dzora'
  ): Promise<SellerProductItem> {
    const key = getStorageKey(storeSlug)
    const stored = localStorage.getItem(key)
    if (!stored) throw new Error('Boutique introuvable')

    const list: SellerProductItem[] = JSON.parse(stored)
    const idx = list.findIndex((p) => p.id === productId)
    if (idx === -1) throw new Error('Produit introuvable')

    list[idx] = {
      ...list[idx],
      status: 'REJECTED',
      rejectionReason: reason.trim() || 'Le produit ne répond pas aux critères de qualité et de conformité Dzora.',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerName,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(key, JSON.stringify(list))
    return list[idx]
  },

  /**
   * Updates commission policy for approved products in a category
   */
  async updateApprovedProductsCommissionPolicy(
    categoryNameOrSlug: string,
    mode: 'RETROACTIVE' | 'KEEP_EXISTING'
  ): Promise<{ updatedCount: number; mode: 'RETROACTIVE' | 'KEEP_EXISTING' }> {
    if (typeof window === 'undefined') return { updatedCount: 0, mode }
    const norm = categoryNameOrSlug.toLowerCase().trim()
    const slugs = this.getAllSellerSlugs()
    let updatedCount = 0

    for (const slug of slugs) {
      const key = getStorageKey(slug)
      const stored = localStorage.getItem(key)
      if (!stored) continue
      try {
        const list: SellerProductItem[] = JSON.parse(stored)
        let changed = false

        for (let i = 0; i < list.length; i++) {
          const p = list[i]
          const catNorm = p.category.toLowerCase().trim()
          if (
            p.status === 'APPROVED' &&
            (catNorm === norm || catNorm.replace(/[^a-z0-9]+/g, '-') === norm)
          ) {
            // Update product timestamp and note retroactive policy
            list[i] = {
              ...p,
              updatedAt: new Date().toISOString(),
            }
            changed = true
            updatedCount++
          }
        }

        if (changed) {
          localStorage.setItem(key, JSON.stringify(list))
        }
      } catch (err) {
        console.warn('Erreur mise à jour politique commission vendeur:', err)
      }
    }

    window.dispatchEvent(new Event('dzora-seller-products-updated'))
    return { updatedCount, mode }
  },
}

/**
 * Convert SellerProductItem (approved) to public CatalogProduct
 */
export function sellerProductToCatalogProduct(p: SellerProductItem): CatalogProduct {
  const discount =
    p.compareAtPrice && p.compareAtPrice > p.price
      ? `-${Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}%`
      : undefined

  return {
    id: p.id,
    name: p.name,
    subtitle: p.description?.slice(0, 90) || `${p.name} · Produit officiel avec garantie`,
    category: p.category as any,
    subCategory: p.subcategory || undefined,
    brand: p.brand || p.storeName || 'Dzora',
    store: p.storeName || 'Boutique Partenaire',
    storeLocation: 'Algérie',
    verifiedSeller: true,
    price: p.price,
    oldPrice: p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice : undefined,
    discount,
    rating: p.rating || 4.8,
    reviews: p.reviewsCount || 42,
    inStock: p.stock > 0,
    fastDelivery: true,
    cashOnDelivery: true,
    image: p.mainImage || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    slug: p.slug || p.id,
    isBestSeller: (p.salesCount || 0) >= 20,
  }
}
