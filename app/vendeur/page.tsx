'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Heart,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Store,
  X,
} from 'lucide-react'
import { api, PublicStoreDetails } from '@/lib/api'
import { DZORA_PRODUCTS } from '@/lib/products-data'

function getSellerReviewStats(seller: PublicStoreDetails) {
  const storeNameNorm = seller.storeName.toLowerCase().trim()
  const slugNorm = (seller.slug || '').toLowerCase().trim()

  const matchingProducts = DZORA_PRODUCTS.filter((p) => {
    const pStore = p.store.toLowerCase().trim()
    const pSlug = pStore.replace(/[^a-z0-9]+/g, '-')
    return (
      pStore === storeNameNorm ||
      pSlug === slugNorm ||
      (slugNorm && pSlug.includes(slugNorm)) ||
      (storeNameNorm && pStore.includes(storeNameNorm))
    )
  })

  const productsWithReviews = matchingProducts.filter((p) => (p.reviews ?? 0) > 0)
  const totalReviews = productsWithReviews.reduce((sum, p) => sum + (p.reviews || 0), 0)

  if (totalReviews === 0) {
    return {
      hasReviews: false,
      totalReviews: 0,
      averageRating: 0,
      productCount: matchingProducts.length,
    }
  }

  const weightedScore = productsWithReviews.reduce(
    (sum, p) => sum + (p.rating || 5) * (p.reviews || 0),
    0
  )
  const averageRating = Math.round((weightedScore / totalReviews) * 10) / 10

  return {
    hasReviews: true,
    totalReviews,
    averageRating,
    productCount: matchingProducts.length,
  }
}

export default function VendeursLocauxPage() {
  const [approvedSellers, setApprovedSellers] = useState<PublicStoreDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'newest'>('newest')
  const [favorites, setFavorites] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filters state - STRICTLY NO DEFAULT FILTER ACTIVE
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedWilaya, setSelectedWilaya] = useState<string[]>([])
  const [minRatingSelected, setMinRatingSelected] = useState<boolean>(false)

  // Fetch approved sellers on mount
  useEffect(() => {
    let isMounted = true
    api.seller
      .listApproved()
      .then((data) => {
        if (isMounted) {
          setApprovedSellers(data || [])
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setApprovedSellers([])
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleWilaya = (wilaya: string) => {
    setSelectedWilaya((prev) =>
      prev.includes(wilaya) ? prev.filter((w) => w !== wilaya) : [...prev, wilaya]
    )
  }

  const toggleFavorite = (sellerId: string) => {
    setFavorites((prev) =>
      prev.includes(sellerId) ? prev.filter((id) => id !== sellerId) : [...prev, sellerId]
    )
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedWilaya([])
    setMinRatingSelected(false)
    setSearchTerm('')
  }

  // Dynamic category options derived from loaded approved sellers
  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    approvedSellers.forEach((s) => {
      if (s.category?.trim()) set.add(s.category.trim())
    })
    if (set.size === 0) {
      return ['High-Tech', 'Smartphones', 'Audio', 'Mode & Accessoires', 'Maison']
    }
    return Array.from(set)
  }, [approvedSellers])

  // Dynamic wilaya options derived from loaded approved sellers
  const wilayaOptions = useMemo(() => {
    const set = new Set<string>()
    approvedSellers.forEach((s) => {
      if (s.wilaya?.trim()) set.add(s.wilaya.trim())
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [approvedSellers])

  const getCategoryCount = (cat: string) => {
    return approvedSellers.filter(
      (s) => s.category?.trim().toLowerCase() === cat.trim().toLowerCase()
    ).length
  }

  const getWilayaCount = (wilaya: string) => {
    return approvedSellers.filter(
      (s) => s.wilaya?.trim().toLowerCase() === wilaya.trim().toLowerCase()
    ).length
  }

  // Dynamic filtering and sorting
  const filteredSellers = useMemo(() => {
    return approvedSellers
      .filter((seller) => {
        // Category filter
        if (
          selectedCategories.length > 0 &&
          (!seller.category || !selectedCategories.includes(seller.category))
        ) {
          return false
        }

        // Wilaya filter
        if (
          selectedWilaya.length > 0 &&
          (!seller.wilaya || !selectedWilaya.includes(seller.wilaya))
        ) {
          return false
        }

        // Search query filter
        if (searchTerm.trim()) {
          const q = searchTerm.trim().toLowerCase()
          const matchStore = seller.storeName.toLowerCase().includes(q)
          const matchCategory = seller.category?.toLowerCase().includes(q)
          const matchWilaya = seller.wilaya?.toLowerCase().includes(q)
          const matchCommune = seller.commune?.toLowerCase().includes(q)
          const matchDesc = seller.description?.toLowerCase().includes(q)

          if (!matchStore && !matchCategory && !matchWilaya && !matchCommune && !matchDesc) {
            return false
          }
        }

        // Minimum rating filter (4 stars and up)
        if (minRatingSelected) {
          const stats = getSellerReviewStats(seller)
          if (!stats.hasReviews || stats.averageRating < 4.0) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          const statsA = getSellerReviewStats(a)
          const statsB = getSellerReviewStats(b)
          if (statsB.averageRating !== statsA.averageRating) {
            return statsB.averageRating - statsA.averageRating
          }
          return statsB.totalReviews - statsA.totalReviews
        }
        if (sortBy === 'name') {
          return a.storeName.localeCompare(b.storeName)
        }
        return (
          new Date(b.approvedAt || b.createdAt).getTime() -
          new Date(a.approvedAt || a.createdAt).getTime()
        )
      })
  }, [approvedSellers, selectedCategories, selectedWilaya, minRatingSelected, searchTerm, sortBy])

  const activeFiltersCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedWilaya.length > 0 ? 1 : 0) +
    (minRatingSelected ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0)

  return (
    <div className="bg-[#FAFDFB] min-h-screen text-[#102A2A]">
      {/* Breadcrumb & Intro Section */}
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs font-medium text-[#60716F]">
          <Link href="/" className="transition hover:text-[#006B55]">
            Accueil
          </Link>
          <ChevronRight size={13} className="text-[#94A4A0]" />
          <span className="font-semibold text-[#102A2A]">Vendeurs locaux</span>
        </nav>

        {/* Compact Pale-Mint Introduction Banner */}
        <section className="relative mt-4 overflow-hidden rounded-2xl sm:rounded-3xl border border-[#D1E6DF] bg-gradient-to-br from-[#E7F2EF] via-[#EDF6F3] to-[#E3F0EB] p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-[620px]">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#006B55]">
                BOUTIQUES ALGÉRIENNES
              </span>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.035em] text-[#102A2A]">
                Découvrez nos vendeurs locaux
              </h1>
              <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#43615C]">
                Des boutiques vérifiées, des produits de confiance et une livraison partout en Algérie.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#BBDDD4] bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#006B55] shadow-sm backdrop-blur-sm">
                <BadgeCheck size={16} className="text-[#006B55]" />
                <span>Vendeurs vérifiés par Dzora</span>
              </div>
            </div>

            {/* Subtle Algerian Local-Shop Illustration */}
            <div className="relative flex shrink-0 items-center justify-center self-center md:self-auto">
              <div className="relative w-44 sm:w-52 h-36 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 150"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full drop-shadow-sm select-none"
                >
                  <rect x="35" y="45" width="130" height="90" rx="10" fill="white" stroke="#B4D5CC" strokeWidth="2.5" />
                  <path
                    d="M25 45 C 25 35, 175 35, 175 45 L 168 62 C 168 62, 145 68, 145 62 L 145 45 M145 62 C 145 68, 120 68, 120 62 L 120 45 M120 62 C 120 68, 95 68, 95 62 L 95 45 M95 62 C 95 68, 70 68, 70 62 L 70 45 M70 62 C 70 68, 48 68, 48 62 L 48 45"
                    fill="#E7F2EF"
                    stroke="#006B55"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <path d="M25 45 L 175 45 L 168 62 L 32 62 Z" fill="#006B55" opacity="0.12" />
                  <path d="M48 45 L 48 62 M95 45 L 95 62 M145 45 L 145 62" stroke="#006B55" strokeWidth="2" />
                  <rect x="65" y="24" width="70" height="18" rx="5" fill="#006B55" />
                  <text x="100" y="36.5" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="0.1em">
                    ALGÉRIE
                  </text>
                  <rect x="48" y="75" width="44" height="42" rx="6" fill="#F4FAF8" stroke="#006B55" strokeWidth="2" />
                  <line x1="70" y1="75" x2="70" y2="117" stroke="#006B55" strokeWidth="1.5" strokeDasharray="2 2" />
                  <line x1="48" y1="96" x2="92" y2="96" stroke="#006B55" strokeWidth="1.5" strokeDasharray="2 2" />
                  <rect x="108" y="72" width="40" height="63" rx="5" fill="#E8F4F1" stroke="#006B55" strokeWidth="2" />
                  <circle cx="140" cy="103" r="2.5" fill="#006B55" />
                  <circle cx="168" cy="120" r="14" fill="#D7ECE5" />
                  <circle cx="168" cy="116" r="10" fill="#006B55" opacity="0.25" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Boutique Search Field */}
        <div className="relative mt-7">
          <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#879B95]" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une boutique par nom, spécialité ou wilaya…"
            className="h-13 sm:h-14 w-full rounded-2xl border border-[#D3E3DD] bg-white pl-12 sm:pl-14 pr-5 text-sm sm:text-base text-[#102A2A] shadow-sm outline-none transition placeholder:text-[#879B95] focus:border-[#006B55] focus:ring-4 focus:ring-[#006B55]/10"
          />
        </div>

        {/* Results Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E7EFEA] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#102A2A]">
              {isLoading
                ? 'Chargement…'
                : `${filteredSellers.length} ${
                    filteredSellers.length > 1 ? 'boutiques vérifiées' : 'boutique vérifiée'
                  }`}
            </span>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
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
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#60716F]">
            <label htmlFor="sort-select" className="text-[#60716F]">
              Trier par :
            </label>
            <div className="relative inline-block">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none rounded-xl border border-[#D5E4DE] bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-[#102A2A] shadow-sm outline-none transition focus:border-[#006B55] focus:ring-2 focus:ring-[#006B55]/10 cursor-pointer"
              >
                <option value="newest">Récemment validées</option>
                <option value="rating">Les mieux notées</option>
                <option value="name">Nom (A-Z)</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#879B95]" />
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Filter Chips */}
        {categoryOptions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-3 lg:hidden scrollbar-none">
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategories.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-[#006B55] text-white'
                      : 'border border-[#D5E4DE] bg-white text-[#43615C]'
                  }`}
                >
                  {cat} {getCategoryCount(cat) > 0 && `(${getCategoryCount(cat)})`}
                </button>
              )
            })}
          </div>
        )}

        {/* Filters and Seller Listing (Two Columns on Desktop) */}
        <div className="mt-5 lg:mt-7 grid gap-6 lg:grid-cols-[240px_1fr] pb-14 items-start">
          {/* Left Column: Filter Panel */}
          <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-28 rounded-2xl border border-[#E3ECE8] bg-white p-5 shadow-xs">
              <div className="mb-5 border-b border-[#F0F5F2] pb-3">
                <div className="flex items-center gap-2 font-display text-sm font-extrabold text-[#102A2A]">
                  <SlidersHorizontal size={16} className="text-[#006B55]" />
                  <span>Filtrer les boutiques</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Réinitialiser les filtres</span>
                  </button>
                )}
              </div>

              {/* Filter Group: Catégories */}
              {categoryOptions.length > 0 && (
                <div className="mb-6 border-b border-[#F0F5F2] pb-5">
                  <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                    Catégories
                  </h3>
                  <div className="space-y-2.5">
                    {categoryOptions.map((cat) => {
                      const isChecked = selectedCategories.includes(cat)
                      const count = getCategoryCount(cat)
                      return (
                        <label
                          key={cat}
                          className="group flex cursor-pointer items-center justify-between text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none"
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(cat)}
                              className="sr-only"
                            />
                            <span
                              className={`grid size-4 place-items-center rounded-md border transition ${
                                isChecked
                                  ? 'border-[#006B55] bg-[#006B55] text-white'
                                  : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                              }`}
                            >
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </span>
                            <span className={isChecked ? 'font-bold text-[#006B55]' : ''}>
                              {cat}
                            </span>
                          </span>
                          <span className="text-[11px] font-semibold text-[#94A4A0]">
                            ({count})
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Filter Group: Wilaya */}
              {wilayaOptions.length > 0 && (
                <div className="mb-6 border-b border-[#F0F5F2] pb-5">
                  <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                    Wilaya
                  </h3>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {wilayaOptions.map((wilaya) => {
                      const isChecked = selectedWilaya.includes(wilaya)
                      const count = getWilayaCount(wilaya)
                      return (
                        <label
                          key={wilaya}
                          className="group flex cursor-pointer items-center justify-between text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none"
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleWilaya(wilaya)}
                              className="sr-only"
                            />
                            <span
                              className={`grid size-4 place-items-center rounded-md border transition ${
                                isChecked
                                  ? 'border-[#006B55] bg-[#006B55] text-white'
                                  : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                              }`}
                            >
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </span>
                            <span className={isChecked ? 'font-bold text-[#006B55]' : ''}>
                              {wilaya}
                            </span>
                          </span>
                          <span className="text-[11px] font-semibold text-[#94A4A0]">
                            ({count})
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Filter Group: Note */}
              <div>
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                  Évaluation
                </h3>
                <div className="space-y-2.5">
                  <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none">
                    <input
                      type="checkbox"
                      checked={minRatingSelected}
                      onChange={(e) => setMinRatingSelected(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`grid size-4 place-items-center rounded-md border transition ${
                        minRatingSelected
                          ? 'border-[#006B55] bg-[#006B55] text-white'
                          : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                      }`}
                    >
                      {minRatingSelected && <Check size={12} strokeWidth={3} />}
                    </span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span className="flex text-[#F28C28]">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                        <Star size={13} className="text-[#DCE8E3]" />
                      </span>
                      <span>4 étoiles et plus</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Seller Listing */}
          <main className="space-y-6">
            {/* Loading Skeleton */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl sm:rounded-3xl border border-[#E3ECE8] bg-white p-6 sm:p-7 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      <div className="size-18 sm:size-20 rounded-full bg-[#E8F0ED]" />
                      <div className="flex-1 space-y-3 w-full">
                        <div className="h-5 w-48 rounded-lg bg-[#E8F0ED]" />
                        <div className="h-4 w-32 rounded-lg bg-[#E8F0ED]" />
                        <div className="h-3 w-full max-w-md rounded-lg bg-[#E8F0ED]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredSellers.length === 0 && (
              <div className="rounded-2xl sm:rounded-3xl border border-[#DCE8E3] bg-white p-10 text-center shadow-xs">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#E7F2EF] text-[#006B55]">
                  <Store size={32} />
                </div>
                <h3 className="mt-4 font-display text-lg sm:text-xl font-bold text-[#102A2A]">
                  {approvedSellers.length === 0
                    ? 'Aucune boutique vérifiée pour le moment'
                    : 'Aucune boutique ne correspond à vos filtres'}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#60716F] max-w-md mx-auto leading-relaxed">
                  {approvedSellers.length === 0
                    ? 'Les nouvelles boutiques vérifiées et approuvées par notre équipe apparaîtront automatiquement sur cette page.'
                    : 'Essayez de modifier votre recherche ou de réinitialiser vos critères de filtrage.'}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#006B55] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#005A47]"
                  >
                    <RotateCcw size={14} />
                    <span>Réinitialiser les filtres</span>
                  </button>
                )}
              </div>
            )}

            {/* Dynamic Approved Seller Cards */}
            {!isLoading &&
              filteredSellers.map((seller) => {
                const initials = (seller.storeName.slice(0, 2) || 'DZ').toUpperCase()
                const storeSlug = seller.slug || seller.id
                const storeUrl = `/vendeur/${storeSlug}`
                const isFav = favorites.includes(seller.id)
                const stats = getSellerReviewStats(seller)

                return (
                  <article
                    key={seller.id}
                    className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E3ECE8] bg-white p-5 sm:p-7 shadow-sm transition hover:shadow-md hover:border-[#CCDED7]"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left & Center section */}
                      <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="grid size-18 sm:size-20 place-items-center rounded-full bg-[#E7F2EF] text-[#006B55] font-extrabold text-2xl tracking-wider shadow-sm select-none overflow-hidden border-2 border-[#DCE8E3]">
                            {seller.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={seller.logoUrl}
                                alt={seller.storeName}
                                className="size-full object-contain bg-white"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <span
                            title="Vendeur vérifié par Dzora"
                            className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-[#006B55] text-white ring-2 ring-white shadow-sm z-10"
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                        </div>

                        {/* Center info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                              href={storeUrl}
                              className="font-display text-xl sm:text-2xl font-extrabold text-[#102A2A] hover:text-[#006B55] transition"
                            >
                              {seller.storeName}
                            </Link>
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#BBDDD4] bg-[#EAF5F1] px-2.5 py-0.5 text-[11px] font-bold text-[#006B55]">
                              <BadgeCheck size={13} />
                              Vendeur vérifié
                            </span>
                          </div>

                          {/* Rating row */}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {stats.hasReviews ? (
                              <>
                                <div className="flex items-center text-[#E5A52C]">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={14}
                                      fill={star <= Math.round(stats.averageRating) ? 'currentColor' : 'none'}
                                      className={star <= Math.round(stats.averageRating) ? 'text-[#E5A52C]' : 'text-[#D7E2DE]'}
                                    />
                                  ))}
                                </div>
                                <span className="font-extrabold text-[#102A2A]">
                                  {stats.averageRating.toFixed(1).replace('.', ',')}
                                </span>
                                <span className="text-[#60716F]">
                                  ({stats.totalReviews} {stats.totalReviews > 1 ? 'avis' : 'avis'})
                                </span>
                                <span className="text-[#D7E2DE]">·</span>
                                <span className="text-[11px] font-medium text-[#006B55]">Boutique officielle</span>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center text-[#A2B3AE]">
                                  <Star size={14} className="text-[#A2B3AE]" />
                                </div>
                                <span className="font-medium text-[#60716F]">Aucun avis</span>
                                <span className="text-[#D7E2DE]">·</span>
                                <span className="text-[11px] font-medium text-[#84928E]">Nouveau vendeur</span>
                              </>
                            )}
                          </div>

                          {/* Location row */}
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#60716F]">
                            <MapPin size={14} className="text-[#008F72] shrink-0" />
                            <span>
                              {seller.wilaya
                                ? `${seller.wilaya}${seller.commune ? ` · ${seller.commune}` : ''}, Algérie`
                                : 'Algérie'}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#43615C]">
                            {seller.description ||
                              'Boutique vérifiée sur Dzora. Produits de confiance et expédition rapide.'}
                          </p>

                          {/* Category chips & options */}
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {seller.category && (
                              <span className="rounded-lg border border-[#E3ECE8] bg-[#F5F9F7] px-2.5 py-1 text-[11px] font-bold text-[#43615C]">
                                {seller.category}
                              </span>
                            )}
                            <span className="rounded-lg border border-[#E3ECE8] bg-[#F5F9F7] px-2.5 py-1 text-[11px] font-bold text-[#006B55]">
                              {seller.coveredWilayas?.length
                                ? `${seller.coveredWilayas.length} Wilayas livrées`
                                : 'Livraison nationale'}
                            </span>
                            {seller.deliveryHome && (
                              <span className="rounded-lg border border-[#DCE8E3] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#60716F]">
                                Domicile
                              </span>
                            )}
                            {seller.deliveryDesk && (
                              <span className="rounded-lg border border-[#DCE8E3] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#60716F]">
                                Point relais
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right section: Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-end justify-between gap-4 shrink-0 border-t sm:border-t-0 lg:border-l border-[#F0F5F2] pt-4 sm:pt-0 lg:pl-6">
                        <div className="flex w-full sm:w-auto items-center gap-2.5">
                          <Link
                            href={storeUrl}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[#006B55] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#008F72] active:scale-[0.98]"
                          >
                            <span>Voir la boutique</span>
                            <ArrowRight size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(seller.id)}
                            aria-label="Ajouter aux favoris"
                            className={`grid size-11 place-items-center rounded-xl border transition ${
                              isFav
                                ? 'border-[#F28C28] bg-[#FFF8F2] text-[#F28C28]'
                                : 'border-[#D9E7E2] bg-white text-[#60716F] hover:border-[#006B55] hover:text-[#006B55]'
                            }`}
                          >
                            <Heart size={18} className={isFav ? 'fill-[#F28C28]' : ''} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}

            {/* Seller Invitation Banner */}
            <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#D5E6E0] bg-gradient-to-r from-[#E7F2EF] to-[#F1F8F5] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#102A2A]">
                    Vous êtes vendeur en Algérie ?
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#43615C]">
                    Rejoignez Dzora et présentez votre boutique à de nouveaux clients.
                  </p>
                </div>
                <Link
                  href="/devenir-vendeur"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#006B55] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#008F72]"
                >
                  <span>Découvrir l’espace vendeur</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs lg:hidden">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#F0F5F2] pb-3">
              <div className="flex items-center gap-2 font-display text-sm font-extrabold text-[#102A2A]">
                <SlidersHorizontal size={16} className="text-[#006B55]" />
                <span>Filtres</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Categories */}
              {categoryOptions.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                    Catégories
                  </h4>
                  <div className="space-y-2">
                    {categoryOptions.map((cat) => {
                      const isChecked = selectedCategories.includes(cat)
                      const count = getCategoryCount(cat)
                      return (
                        <label
                          key={cat}
                          className="group flex cursor-pointer items-center justify-between text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none"
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(cat)}
                              className="sr-only"
                            />
                            <span
                              className={`grid size-4 place-items-center rounded-md border transition ${
                                isChecked
                                  ? 'border-[#006B55] bg-[#006B55] text-white'
                                  : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                              }`}
                            >
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </span>
                            <span className={isChecked ? 'font-bold text-[#006B55]' : ''}>{cat}</span>
                          </span>
                          <span className="text-[11px] font-semibold text-[#94A4A0]">({count})</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Wilaya */}
              {wilayaOptions.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">
                    Wilaya
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {wilayaOptions.map((wilaya) => {
                      const isChecked = selectedWilaya.includes(wilaya)
                      const count = getWilayaCount(wilaya)
                      return (
                        <label
                          key={wilaya}
                          className="group flex cursor-pointer items-center justify-between text-xs font-medium text-[#43615C] hover:text-[#102A2A] select-none"
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleWilaya(wilaya)}
                              className="sr-only"
                            />
                            <span
                              className={`grid size-4 place-items-center rounded-md border transition ${
                                isChecked
                                  ? 'border-[#006B55] bg-[#006B55] text-white'
                                  : 'border-[#CADBD5] bg-white group-hover:border-[#006B55]'
                              }`}
                            >
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </span>
                            <span className={isChecked ? 'font-bold text-[#006B55]' : ''}>
                              {wilaya}
                            </span>
                          </span>
                          <span className="text-[11px] font-semibold text-[#94A4A0]">({count})</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#F0F5F2] pt-3 flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 rounded-xl border border-[#CFE0DA] py-2.5 text-xs font-bold text-[#60716F]"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-xl bg-[#006B55] py-2.5 text-xs font-bold text-white shadow-xs"
              >
                Voir ({filteredSellers.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
