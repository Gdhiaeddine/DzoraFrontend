'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ChevronRight,
  Filter,
  X,
  RotateCcw,
  Star,
  Search,
  Check,
  Truck,
  ShieldCheck,
  Heart,
  ShoppingCart,
  Store,
  MapPin,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react'
import { DZORA_PRODUCTS, type CatalogProduct } from '@/lib/products-data'
import { useCart } from '@/components/cart-context'
import { useFavorites } from '@/components/favorites-context'
import { CATEGORIES_DETAILED } from '@/lib/categories'
import { CategoryFilterAccordion } from '@/components/category-filter-accordion'

const CATEGORIES = [
  'Électronique',
  'Mode',
  'Maison & Cuisine',
  'Beauté & Santé',
  'Sport & Loisirs',
  'Enfants & Bébés',
  'Auto & Moto',
  'High-Tech',
  'Meubles',
  'Jardin & Bricolage',
] as const

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'best-sellers' | 'rating'

function ProductsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialSearch = searchParams.get('q') || searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialSubCategory = searchParams.get('subCategory') || searchParams.get('subcategory') || ''

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    initialSubCategory ? [initialSubCategory] : []
  )
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    initialCategory ? { [initialCategory]: true } : {}
  )
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(50000)
  const [minRating, setMinRating] = useState<number | null>(null) // 4 or 3
  const [inStockOnly, setInStockOnly] = useState(false)
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false)
  const [verifiedSellerOnly, setVerifiedSellerOnly] = useState(false)
  const [cashOnDeliveryOnly, setCashOnDeliveryOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Feedback toast, Cart & Favorites
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({})

  // Sync when search params change
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch)
    }
    if (initialCategory && !selectedCategories.includes(initialCategory)) {
      setSelectedCategories([initialCategory])
      setExpandedCategories((prev) => ({ ...prev, [initialCategory]: true }))
    }
    if (initialSubCategory) {
      setSelectedSubCategories((prev) =>
        prev.includes(initialSubCategory) ? prev : [...prev, initialSubCategory]
      )
      const parentCat = CATEGORIES_DETAILED.find((c) =>
        c.subcategories.some((s) => s.name === initialSubCategory)
      )
      if (parentCat) {
        setSelectedCategories((prev) =>
          prev.includes(parentCat.name) ? prev : [...prev, parentCat.name]
        )
        setExpandedCategories((prev) => ({ ...prev, [parentCat.name]: true }))
      }
    }
  }, [initialSearch, initialCategory, initialSubCategory])

  // Toggle category expand/collapse
  const toggleCategoryCollapse = (catName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }))
  }

  // Check/uncheck entire category (selects/deselects all its subcategories)
  const handleCategoryToggle = (catName: string) => {
    const catObj = CATEGORIES_DETAILED.find((c) => c.name === catName)
    const catSubNames = catObj ? catObj.subcategories.map((s) => s.name) : []

    const isCatChecked = selectedCategories.includes(catName)
    const hasSomeSubChecked = catSubNames.some((s) => selectedSubCategories.includes(s))

    if (isCatChecked || hasSomeSubChecked) {
      // Uncheck category and uncheck all its subcategories
      setSelectedCategories((prev) => prev.filter((c) => c !== catName))
      setSelectedSubCategories((prev) => prev.filter((s) => !catSubNames.includes(s)))
    } else {
      // Check category and check all its subcategories
      setSelectedCategories((prev) => [...prev, catName])
      setSelectedSubCategories((prev) => Array.from(new Set([...prev, ...catSubNames])))
      setExpandedCategories((prev) => ({ ...prev, [catName]: true }))
    }
  }

  // Check/uncheck individual subcategory
  const handleSubCategoryToggle = (catName: string, subName: string) => {
    const catObj = CATEGORIES_DETAILED.find((c) => c.name === catName)
    const catSubNames = catObj ? catObj.subcategories.map((s) => s.name) : []

    const isSubChecked = selectedSubCategories.includes(subName)
    let nextSubs: string[]

    if (isSubChecked) {
      nextSubs = selectedSubCategories.filter((s) => s !== subName)
    } else {
      nextSubs = [...selectedSubCategories, subName]
    }
    setSelectedSubCategories(nextSubs)

    // Check if any subcategory in this category is now checked
    const anySubInCatChecked = catSubNames.some((s) => nextSubs.includes(s))
    if (anySubInCatChecked) {
      if (!selectedCategories.includes(catName)) {
        setSelectedCategories((prev) => [...prev, catName])
      }
    } else {
      // If none checked, remove category
      setSelectedCategories((prev) => prev.filter((c) => c !== catName))
    }
  }

  // Category counts based on ALL products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    CATEGORIES.forEach((cat) => {
      counts[cat] = DZORA_PRODUCTS.filter((p) => p.category === cat).length
    })
    return counts
  }, [])

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedSubCategories([])
    setMinPrice(0)
    setMaxPrice(50000)
    setMinRating(null)
    setInStockOnly(false)
    setFastDeliveryOnly(false)
    setVerifiedSellerOnly(false)
    setCashOnDeliveryOnly(false)
    setSortBy('relevance')
    setCurrentPage(1)
  }

  // Active filter count
  const activeFiltersCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedSubCategories.length > 0 ? 1 : 0) +
    (minPrice > 0 || maxPrice < 50000 ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (fastDeliveryOnly ? 1 : 0) +
    (verifiedSellerOnly ? 1 : 0) +
    (cashOnDeliveryOnly ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0)

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return DZORA_PRODUCTS.filter((product) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesBrand = product.brand.toLowerCase().includes(query)
        const matchesCategory = product.category.toLowerCase().includes(query)
        const matchesStore = product.store.toLowerCase().includes(query)
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesStore) {
          return false
        }
      }

      // Categories & Subcategories Filter
      if (selectedCategories.length > 0 || selectedSubCategories.length > 0) {
        if (!selectedCategories.includes(product.category)) {
          return false
        }

        const catObj = CATEGORIES_DETAILED.find((c) => c.name === product.category)
        const catSubNames = catObj ? catObj.subcategories.map((s) => s.name) : []
        const activeSubsForThisCat = catSubNames.filter((s) => selectedSubCategories.includes(s))

        if (activeSubsForThisCat.length > 0 && activeSubsForThisCat.length < catSubNames.length) {
          const pName = product.name.toLowerCase()
          const pSub = product.subCategory?.toLowerCase() || ''
          const pSubtitle = product.subtitle?.toLowerCase() || ''
          const pBrand = product.brand.toLowerCase()

          const matchesAnySelectedSub = activeSubsForThisCat.some((subName) => {
            const subLower = subName.toLowerCase()
            if (pSub && (pSub.includes(subLower) || subLower.includes(pSub))) {
              return true
            }
            if (pName.includes(subLower) || pSubtitle.includes(subLower) || pBrand.includes(subLower)) {
              return true
            }
            const keywords = subLower.split(/[\s,&]+/).filter((w) => w.length > 3)
            return keywords.some((kw) => pName.includes(kw) || pSubtitle.includes(kw))
          })

          if (!matchesAnySelectedSub) {
            return false
          }
        }
      }

      // Price range
      if (product.price < minPrice || product.price > maxPrice) {
        return false
      }

      // Rating
      if (minRating !== null && product.rating < minRating) {
        return false
      }

      // In stock
      if (inStockOnly && !product.inStock) {
        return false
      }

      // Fast delivery
      if (fastDeliveryOnly && !product.fastDelivery) {
        return false
      }

      // Verified seller
      if (verifiedSellerOnly && !product.verifiedSeller) {
        return false
      }

      // Cash on delivery
      if (cashOnDeliveryOnly && !product.cashOnDelivery) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'best-sellers') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
      if (sortBy === 'rating') return b.rating - a.rating
      return 0 // relevance
    })
  }, [
    searchQuery,
    selectedCategories,
    selectedSubCategories,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    fastDeliveryOnly,
    verifiedSellerOnly,
    cashOnDeliveryOnly,
    sortBy,
  ])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchQuery,
    selectedCategories,
    selectedSubCategories,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    fastDeliveryOnly,
    verifiedSellerOnly,
    cashOnDeliveryOnly,
    sortBy,
  ])

  // Pagination (8 items per page: 2 rows of 4 on desktop)
  const ITEMS_PER_PAGE = 8
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  // Handle Add To Cart
  const handleAddToCart = (product: CatalogProduct, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart({
      id: product.id,
      name: product.name,
      variant: product.subtitle,
      description: `${product.store} · ${product.storeLocation}`,
      currentPrice: product.price,
      previousPrice: product.oldPrice,
      discount: product.discount,
      quantity: 1,
      image: product.image,
      link: `/products/${product.slug}`,
    })

    setAddedItems((prev) => ({ ...prev, [product.id]: true }))
    setToastMessage(`« ${product.name} » ajouté au panier !`)

    window.setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }))
    }, 1800)

    window.setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Handle Favorite toggle
  const handleToggleFavorite = (product: CatalogProduct, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const wasFavorite = isFavorite(product.id)
    const nextState = toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      currentPrice: product.price,
      previousPrice: product.oldPrice,
      discount: product.discount,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      link: `/products/${product.slug}`,
    })
    
    // Only display toast if authenticated (if toggle succeeded or removed)
    if (nextState) {
      setToastMessage(`« ${product.name} » ajouté à vos favoris.`)
      window.setTimeout(() => setToastMessage(null), 2500)
    } else if (wasFavorite) {
      setToastMessage(`« ${product.name} » retiré de vos favoris.`)
      window.setTimeout(() => setToastMessage(null), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#102A2A]">
      {/* Toast notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#006B55] px-4 py-3 text-xs font-bold text-white shadow-xl shadow-[#006B55]/20 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Check size={16} className="text-[#85E1C8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-4 flex items-center gap-1.5 text-xs text-[#71827D]">
          <Link href="/" className="hover:text-[#006B55] transition-colors">
            Accueil
          </Link>
          <ChevronRight size={13} className="text-[#A2B3AE]" />
          <span className="font-semibold text-[#102A2A]">Produits</span>
          {selectedCategories.length === 1 && (
            <>
              <ChevronRight size={13} className="text-[#A2B3AE]" />
              <span className="text-[#006B55] font-semibold">{selectedCategories[0]}</span>
            </>
          )}
          {selectedSubCategories.length === 1 && (
            <>
              <ChevronRight size={13} className="text-[#A2B3AE]" />
              <span className="text-[#006B55] font-bold">{selectedSubCategories[0]}</span>
            </>
          )}
        </nav>

        {/* Page Intro Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#E3ECE8] pb-5 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#102A2A] sm:text-3xl">
              Tous les produits
            </h1>
            <p className="mt-1 text-xs text-[#60716F] sm:text-sm">
              Découvrez les produits de vendeurs de confiance partout en Algérie.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
            <span className="text-xs font-bold text-[#60716F]">
              <span className="text-[#006B55] font-extrabold">{filteredProducts.length}</span>{' '}
              produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
            </span>

            {/* Mobile filter button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[#CFE0DA] bg-white px-3.5 py-2 text-xs font-bold text-[#102A2A] shadow-2xs hover:border-[#006B55] lg:hidden"
            >
              <Filter size={14} className="text-[#006B55]" />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="grid size-4 place-items-center rounded-full bg-[#006B55] text-[10px] font-extrabold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-semibold text-[#60716F] whitespace-nowrap">
                Trier par :
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 rounded-xl border border-[#CFE0DA] bg-white px-3 text-xs font-bold text-[#102A2A] outline-none transition focus:border-[#006B55] focus:ring-2 focus:ring-[#006B55]/10 cursor-pointer shadow-2xs"
              >
                <option value="relevance">Pertinence</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="best-sellers">Meilleures ventes</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar (Desktop) + Products Area */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-[#E3ECE8] bg-white p-5 shadow-xs">
              <div className="mb-5 border-b border-[#F0F5F2] pb-3">
                <div className="flex items-center gap-2 font-display text-sm font-extrabold text-[#102A2A]">
                  <SlidersHorizontal size={16} className="text-[#006B55]" />
                  <span>Filtrer les produits</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {/* FILTER GROUP 1: Catégories & Sous-Catégories */}
              <div className="mb-6 border-b border-[#F0F5F2] pb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                    Catégories
                  </h3>
                  {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategories([])
                        setSelectedSubCategories([])
                      }}
                      className="text-[11px] font-bold text-[#006B55] hover:underline cursor-pointer"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <CategoryFilterAccordion
                  selectedCategories={selectedCategories}
                  selectedSubCategories={selectedSubCategories}
                  expandedCategories={expandedCategories}
                  categoryCounts={categoryCounts}
                  onToggleCategory={handleCategoryToggle}
                  onToggleSubCategory={handleSubCategoryToggle}
                  onToggleCollapse={toggleCategoryCollapse}
                />
              </div>

              {/* FILTER GROUP 2: Prix (DA) */}
              <div className="mb-6 border-b border-[#F0F5F2] pb-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                    Prix (DA)
                  </h3>
                  <span className="text-[11px] font-bold text-[#006B55]">
                    {maxPrice.toLocaleString()} DA
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  aria-label="Prix maximum"
                  className="h-1.5 w-full cursor-pointer accent-[#006B55] bg-[#E3ECE8] rounded-lg"
                />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-medium text-[#71827D]">Min (DA)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                      className="mt-0.5 h-8 w-full rounded-lg border border-[#CFE0DA] bg-[#F7FAF9] px-2 text-xs font-bold text-[#102A2A] outline-none focus:border-[#006B55]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#71827D]">Max (DA)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.min(100000, Number(e.target.value)))}
                      className="mt-0.5 h-8 w-full rounded-lg border border-[#CFE0DA] bg-[#F7FAF9] px-2 text-xs font-bold text-[#102A2A] outline-none focus:border-[#006B55]"
                    />
                  </div>
                </div>
              </div>

              {/* FILTER GROUP 3: Évaluation */}
              <div className="mb-6 border-b border-[#F0F5F2] pb-5">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                  Évaluation
                </h3>
                <div className="space-y-2.5">
                  <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                    <input
                      type="checkbox"
                      checked={minRating === 4}
                      onChange={() => setMinRating(minRating === 4 ? null : 4)}
                      className="sr-only"
                    />
                    <span
                      className={`grid size-4 place-items-center rounded-md border transition ${
                        minRating === 4
                          ? 'border-[#006B55] bg-[#006B55] text-white'
                          : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                      }`}
                    >
                      {minRating === 4 && <Check size={12} strokeWidth={3} />}
                    </span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span className="flex text-[#F28C28]">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                        <Star size={13} className="text-[#DCE8E3]" />
                      </span>
                      <span className={minRating === 4 ? 'font-bold text-[#006B55]' : ''}>
                        4 étoiles et plus
                      </span>
                    </div>
                  </label>

                  <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                    <input
                      type="checkbox"
                      checked={minRating === 3}
                      onChange={() => setMinRating(minRating === 3 ? null : 3)}
                      className="sr-only"
                    />
                    <span
                      className={`grid size-4 place-items-center rounded-md border transition ${
                        minRating === 3
                          ? 'border-[#006B55] bg-[#006B55] text-white'
                          : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                      }`}
                    >
                      {minRating === 3 && <Check size={12} strokeWidth={3} />}
                    </span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span className="flex text-[#F28C28]">
                        {[...Array(3)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                        <Star size={13} className="text-[#DCE8E3]" />
                        <Star size={13} className="text-[#DCE8E3]" />
                      </span>
                      <span className={minRating === 3 ? 'font-bold text-[#006B55]' : ''}>
                        3 étoiles et plus
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* FILTER GROUP 4: Disponibilité & Options */}
              <div className="space-y-2.5">
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                  Disponibilité & Vendeurs
                </h3>

                <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-md border transition ${
                      inStockOnly
                        ? 'border-[#006B55] bg-[#006B55] text-white'
                        : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                    }`}
                  >
                    {inStockOnly && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={inStockOnly ? 'font-bold text-[#006B55]' : ''}>
                    En stock
                  </span>
                </label>

                <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                  <input
                    type="checkbox"
                    checked={fastDeliveryOnly}
                    onChange={(e) => setFastDeliveryOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-md border transition ${
                      fastDeliveryOnly
                        ? 'border-[#006B55] bg-[#006B55] text-white'
                        : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                    }`}
                  >
                    {fastDeliveryOnly && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={fastDeliveryOnly ? 'font-bold text-[#006B55]' : ''}>
                    Livraison rapide
                  </span>
                </label>

                <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                  <input
                    type="checkbox"
                    checked={verifiedSellerOnly}
                    onChange={(e) => setVerifiedSellerOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-md border transition ${
                      verifiedSellerOnly
                        ? 'border-[#006B55] bg-[#006B55] text-white'
                        : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                    }`}
                  >
                    {verifiedSellerOnly && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={verifiedSellerOnly ? 'font-bold text-[#006B55]' : ''}>
                    Vendeurs vérifiés
                  </span>
                </label>

                <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                  <input
                    type="checkbox"
                    checked={cashOnDeliveryOnly}
                    onChange={(e) => setCashOnDeliveryOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-md border transition ${
                      cashOnDeliveryOnly
                        ? 'border-[#006B55] bg-[#006B55] text-white'
                        : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                    }`}
                  >
                    {cashOnDeliveryOnly && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={cashOnDeliveryOnly ? 'font-bold text-[#006B55]' : ''}>
                    Paiement à la livraison
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main>
            {/* Quick filter chips */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFastDeliveryOnly((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs ${
                  fastDeliveryOnly
                    ? 'bg-[#006B55] text-white'
                    : 'bg-white border border-[#D5E4DE] text-[#43615C] hover:border-[#006B55] hover:text-[#006B55]'
                }`}
              >
                <Truck size={13} />
                <span>Livraison rapide</span>
              </button>

              <button
                type="button"
                onClick={() => setCashOnDeliveryOnly((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs ${
                  cashOnDeliveryOnly
                    ? 'bg-[#006B55] text-white'
                    : 'bg-white border border-[#D5E4DE] text-[#43615C] hover:border-[#006B55] hover:text-[#006B55]'
                }`}
              >
                <ShieldCheck size={13} />
                <span>Paiement à la livraison</span>
              </button>

              <button
                type="button"
                onClick={() => setVerifiedSellerOnly((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs ${
                  verifiedSellerOnly
                    ? 'bg-[#006B55] text-white'
                    : 'bg-white border border-[#D5E4DE] text-[#43615C] hover:border-[#006B55] hover:text-[#006B55]'
                }`}
              >
                <Store size={13} />
                <span>Vendeurs vérifiés</span>
              </button>

              <button
                type="button"
                onClick={() => setInStockOnly((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs ${
                  inStockOnly
                    ? 'bg-[#006B55] text-white'
                    : 'bg-white border border-[#D5E4DE] text-[#43615C] hover:border-[#006B55] hover:text-[#006B55]'
                }`}
              >
                <Sparkles size={13} />
                <span>En stock</span>
              </button>

              {selectedSubCategories.map((subName) => (
                <span
                  key={subName}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F2EF] border border-[#BDE0D6] px-3.5 py-1.5 text-xs font-bold text-[#006B55] shadow-2xs"
                >
                  <span>{subName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const catObj = CATEGORIES_DETAILED.find((c) =>
                        c.subcategories.some((s) => s.name === subName)
                      )
                      if (catObj) {
                        handleSubCategoryToggle(catObj.name, subName)
                      } else {
                        setSelectedSubCategories((prev) => prev.filter((s) => s !== subName))
                      }
                    }}
                    className="hover:text-red-600 transition ml-0.5 cursor-pointer"
                    aria-label={`Retirer le filtre ${subName}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 rounded-full bg-[#E7F2EF] px-3 py-1.5 text-xs font-bold text-[#006B55] hover:bg-[#D5EAE2] transition cursor-pointer"
                >
                  <X size={13} />
                  <span>Effacer les filtres</span>
                </button>
              )}
            </div>

            {/* PRODUCT GRID */}
            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => {
                  const isLiked = isFavorite(product.id)
                  const isAdded = Boolean(addedItems[product.id])

                  return (
                    <article
                      key={product.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5EEEB] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#B9D8D0] hover:shadow-[0_12px_30px_rgba(0,107,85,0.08)]"
                    >
                      {/* Product Image Box */}
                      <div className="relative aspect-square overflow-hidden bg-[#F4F8F6] p-4 sm:p-5">
                        {product.discount && (
                          <span className="absolute left-3 top-3 z-10 rounded-md bg-[#E53935] px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            {product.discount}
                          </span>
                        )}

                        {/* Favorite button */}
                        <button
                          type="button"
                          aria-label={`Ajouter ${product.name} aux favoris`}
                          onClick={(e) => handleToggleFavorite(product, e)}
                          className={`absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border bg-white transition-colors cursor-pointer shadow-2xs ${
                            isLiked
                              ? 'border-[#F28C28] text-[#F28C28]'
                              : 'border-[#E5EEEB] text-[#71827D] hover:text-[#F28C28] hover:border-[#F28C28]'
                          }`}
                        >
                          <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>

                        <Link
                          href={`/products/${product.slug}`}
                          aria-label={`Voir ${product.name}`}
                          className="flex size-full items-center justify-center"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="size-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>
                      </div>

                      {/* Product Content Details */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          {/* Rating & Reviews */}
                          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#F28C28]">
                            <Star size={13} fill="currentColor" />
                            <span>{product.rating}</span>
                            <span className="font-normal text-[#94A4A0]">({product.reviews})</span>
                          </div>

                          {/* Product Name */}
                          <Link href={`/products/${product.slug}`} className="block">
                            <h3 className="line-clamp-2 min-h-[38px] text-xs sm:text-sm font-bold leading-snug text-[#102A2A] transition-colors group-hover:text-[#006B55]">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Seller & Location */}
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#60716F]">
                            <Store size={12} className="shrink-0 text-[#008F72]" />
                            <span className="truncate font-medium">{product.store}</span>
                            {product.storeLocation && (
                              <span className="flex items-center text-[10px] text-[#889994]">
                                · {product.storeLocation}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="mt-4 border-t border-[#F0F5F2] pt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-base sm:text-lg font-extrabold text-[#006B55]">
                              {product.price.toLocaleString()} DA
                            </span>
                            {product.oldPrice && (
                              <span className="text-xs text-[#94A4A0] line-through">
                                {product.oldPrice.toLocaleString()} DA
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#43615C]">
                              <Truck size={12} className="text-[#008F72]" />
                              <span>{product.fastDelivery ? 'Livraison rapide' : 'Standard'}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleAddToCart(product, e)}
                              aria-label={
                                isAdded
                                  ? `${product.name} ajouté au panier !`
                                  : `Ajouter ${product.name} au panier`
                              }
                              title={isAdded ? 'Ajouté !' : 'Ajouter au panier'}
                              className={`grid size-8 shrink-0 place-items-center rounded-xl transition-all duration-200 cursor-pointer ${
                                isAdded
                                  ? 'bg-[#E7F2EF] text-[#006B55] scale-105'
                                  : 'bg-[#006B55] text-white hover:bg-[#008F72] active:scale-95 shadow-xs'
                              }`}
                            >
                              {isAdded ? <Check size={16} /> : <ShoppingCart size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-2xl border border-dashed border-[#CFE0DA] bg-white p-12 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#E7F2EF] text-[#006B55]">
                  <Search size={22} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#102A2A]">
                  Aucun produit ne correspond à vos critères
                </h3>
                <p className="mt-1 text-xs text-[#60716F]">
                  Essayez de modifier ou réinitialiser vos filtres de recherche.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#006B55] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#008F72] shadow-xs cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Réinitialiser tous les filtres</span>
                </button>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1 sm:gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-[#CFE0DA] bg-white px-3 py-2 text-xs font-bold text-[#102A2A] transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#006B55] hover:text-[#006B55]"
                >
                  Précédent
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1
                  const isActive = pageNum === currentPage

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`grid size-9 place-items-center rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#006B55] text-white shadow-xs'
                          : 'border border-[#CFE0DA] bg-white text-[#102A2A] hover:border-[#006B55] hover:text-[#006B55]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl border border-[#CFE0DA] bg-white px-3 py-2 text-xs font-bold text-[#102A2A] transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#006B55] hover:text-[#006B55]"
                >
                  Suivant
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs lg:hidden">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#F0F5F2] pb-3">
              <div className="flex items-center gap-2 font-display text-sm font-extrabold text-[#102A2A]">
                <SlidersHorizontal size={16} className="text-[#006B55]" />
                <span>Filtres</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                    Catégories
                  </h4>
                  {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategories([])
                        setSelectedSubCategories([])
                      }}
                      className="text-[11px] font-bold text-[#006B55] hover:underline"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <CategoryFilterAccordion
                  selectedCategories={selectedCategories}
                  selectedSubCategories={selectedSubCategories}
                  expandedCategories={expandedCategories}
                  categoryCounts={categoryCounts}
                  onToggleCategory={handleCategoryToggle}
                  onToggleSubCategory={handleSubCategoryToggle}
                  onToggleCollapse={toggleCategoryCollapse}
                />
              </div>

              {/* Price */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                    Prix max (DA)
                  </h4>
                  <span className="text-xs font-bold text-[#006B55]">
                    {maxPrice.toLocaleString()} DA
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="h-1.5 w-full accent-[#006B55]"
                />
              </div>

              {/* Évaluation */}
              <div>
                <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                  Évaluation
                </h4>
                <div className="space-y-2">
                  <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                    <input
                      type="checkbox"
                      checked={minRating === 4}
                      onChange={() => setMinRating(minRating === 4 ? null : 4)}
                      className="sr-only"
                    />
                    <span
                      className={`grid size-4 place-items-center rounded-md border transition ${
                        minRating === 4
                          ? 'border-[#006B55] bg-[#006B55] text-white'
                          : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                      }`}
                    >
                      {minRating === 4 && <Check size={12} strokeWidth={3} />}
                    </span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span className="flex text-[#F28C28]">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                        <Star size={13} className="text-[#DCE8E3]" />
                      </span>
                      <span className={minRating === 4 ? 'font-bold text-[#006B55]' : ''}>
                        4 étoiles et plus
                      </span>
                    </div>
                  </label>

                  <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                    <input
                      type="checkbox"
                      checked={minRating === 3}
                      onChange={() => setMinRating(minRating === 3 ? null : 3)}
                      className="sr-only"
                    />
                    <span
                      className={`grid size-4 place-items-center rounded-md border transition ${
                        minRating === 3
                          ? 'border-[#006B55] bg-[#006B55] text-white'
                          : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                      }`}
                    >
                      {minRating === 3 && <Check size={12} strokeWidth={3} />}
                    </span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span className="flex text-[#F28C28]">
                        {[...Array(3)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                        <Star size={13} className="text-[#DCE8E3]" />
                        <Star size={13} className="text-[#DCE8E3]" />
                      </span>
                      <span className={minRating === 3 ? 'font-bold text-[#006B55]' : ''}>
                        3 étoiles et plus
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Trust checkboxes */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                  Options
                </h4>
                <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-md border transition ${
                      inStockOnly
                        ? 'border-[#006B55] bg-[#006B55] text-white'
                        : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                    }`}
                  >
                    {inStockOnly && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={inStockOnly ? 'font-bold text-[#006B55]' : ''}>En stock</span>
                </label>
                <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                  <input
                    type="checkbox"
                    checked={fastDeliveryOnly}
                    onChange={(e) => setFastDeliveryOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-md border transition ${
                      fastDeliveryOnly
                        ? 'border-[#006B55] bg-[#006B55] text-white'
                        : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                    }`}
                  >
                    {fastDeliveryOnly && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={fastDeliveryOnly ? 'font-bold text-[#006B55]' : ''}>Livraison rapide</span>
                </label>
                <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                  <input
                    type="checkbox"
                    checked={verifiedSellerOnly}
                    onChange={(e) => setVerifiedSellerOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-md border transition ${
                      verifiedSellerOnly
                        ? 'border-[#006B55] bg-[#006B55] text-white'
                        : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                    }`}
                  >
                    {verifiedSellerOnly && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={verifiedSellerOnly ? 'font-bold text-[#006B55]' : ''}>Vendeurs vérifiés</span>
                </label>
                <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                  <input
                    type="checkbox"
                    checked={cashOnDeliveryOnly}
                    onChange={(e) => setCashOnDeliveryOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-md border transition ${
                      cashOnDeliveryOnly
                        ? 'border-[#006B55] bg-[#006B55] text-white'
                        : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                    }`}
                  >
                    {cashOnDeliveryOnly && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={cashOnDeliveryOnly ? 'font-bold text-[#006B55]' : ''}>Paiement à la livraison</span>
                </label>
              </div>
            </div>

            <div className="border-t border-[#F0F5F2] pt-3 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 rounded-xl border border-[#CFE0DA] py-2.5 text-xs font-bold text-[#60716F]"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-[#006B55] py-2.5 text-xs font-bold text-white shadow-xs"
              >
                Voir ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-3 border-[#006B55] border-t-transparent" />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  )
}
