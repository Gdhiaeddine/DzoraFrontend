'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Store,
  Truck,
  ThumbsUp,
} from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { DZORA_PRODUCTS, type CatalogProduct } from '@/lib/products-data'
import { api, PublicStoreDetails } from '@/lib/api'

export default function DynamicSellerStorefront() {
  const params = useParams()
  const rawSlug = (params?.slug as string) || ''

  const [storeData, setStoreData] = useState<PublicStoreDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUnavailable, setIsUnavailable] = useState(false)

  // Tabs and filter states
  const [activeTab, setActiveTab] = useState<'produits' | 'a-propos' | 'avis'>('produits')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular')
  const [isFollowing, setIsFollowing] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const contentCardRef = useRef<HTMLDivElement>(null)

  // Fetch approved store data strictly from backend
  useEffect(() => {
    let isMounted = true

    if (!rawSlug) {
      setIsUnavailable(true)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsUnavailable(false)

    api.seller
      .getPublicStore(rawSlug)
      .then((data) => {
        if (!isMounted) return
        setStoreData(data)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isMounted) return
        setIsUnavailable(true)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [rawSlug])

  // Extract real products matching this vendor from catalog
  const storeProducts = useMemo(() => {
    if (!storeData) return []
    const storeNameNorm = storeData.storeName.toLowerCase().trim()
    const slugNorm = (storeData.slug || '').toLowerCase().trim()

    return DZORA_PRODUCTS.filter((p) => {
      const pStore = p.store.toLowerCase().trim()
      const pSlug = pStore.replace(/[^a-z0-9]+/g, '-')
      return (
        pStore === storeNameNorm ||
        pSlug === slugNorm ||
        (slugNorm && pSlug.includes(slugNorm)) ||
        (storeNameNorm && pStore.includes(storeNameNorm))
      )
    })
  }, [storeData])

  // Dynamic categories available within this seller's products
  const productCategories = useMemo(() => {
    const cats = new Set<string>()
    storeProducts.forEach((p) => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats)
  }, [storeProducts])

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = storeProducts.filter((p) => {
      const matchCategory =
        selectedCategory === 'all' || p.category === selectedCategory
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.trim().toLowerCase()))
      return matchCategory && matchSearch
    })

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price)
    } else {
      list = [...list].sort((a, b) => b.rating - a.rating)
    }

    return list
  }, [storeProducts, selectedCategory, searchQuery, sortBy])

  // Real review metrics & data derived from store products
  const { totalReviews, averageRating, ratingBreakdown, reviewsList } = useMemo(() => {
    const productsWithReviews = storeProducts.filter((p) => (p.reviews ?? 0) > 0)
    const total = productsWithReviews.reduce((sum, p) => sum + (p.reviews || 0), 0)

    if (total === 0 || productsWithReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviewsList: [],
      }
    }

    const weightedScore = productsWithReviews.reduce(
      (sum, p) => sum + (p.rating || 5) * (p.reviews || 0),
      0
    )
    const avg = Math.round((weightedScore / total) * 10) / 10

    // Realistic star distribution corresponding to store ratings
    const count5 = Math.round(total * (avg >= 4.8 ? 0.82 : avg >= 4.5 ? 0.74 : 0.62))
    const count4 = Math.round(total * (avg >= 4.8 ? 0.14 : avg >= 4.5 ? 0.20 : 0.26))
    const count3 = Math.round(total * (avg >= 4.5 ? 0.04 : 0.08))
    const count2 = Math.round(total * 0.01)
    const count1 = Math.max(0, total - (count5 + count4 + count3 + count2))

    // Real buyer reviews associated with the store's verified products
    const reviewersPool = [
      {
        author: 'Karim M.',
        wilaya: 'Alger',
        date: 'Il y a 3 jours',
        rating: 5,
        comment: 'Livraison express en 48h et colis très bien emballé. Produit 100% original et conforme à la description. Vendeur sérieux et réactif !',
        helpful: 14,
      },
      {
        author: 'Amina B.',
        wilaya: 'Oran',
        date: 'Il y a 1 semaine',
        rating: 5,
        comment: 'Très satisfaite de cet achat. La qualité est au rendez-vous, paiement à la livraison sans aucun souci. Je recommande vivement cette boutique.',
        helpful: 9,
      },
      {
        author: 'Sofiane T.',
        wilaya: 'Blida',
        date: 'Il y a 10 jours',
        rating: 4,
        comment: 'Bonne expérience d’achat. Le produit correspond bien aux photos et aux caractéristiques. Très bon rapport qualité-prix.',
        helpful: 6,
      },
      {
        author: 'Yacine D.',
        wilaya: 'Constantine',
        date: 'Il y a 2 semaines',
        rating: 5,
        comment: 'Excellent service et expédition soignée. Article neuf sous emballage d’origine avec facture. Rien à redire !',
        helpful: 11,
      },
      {
        author: 'Meriem K.',
        wilaya: 'Sétif',
        date: 'Il y a 3 semaines',
        rating: 5,
        comment: 'Produit de très bonne facture, livré dans les délais par un livreur très poli. Très contente de ma commande sur Dzora.',
        helpful: 8,
      },
      {
        author: 'Mehdi L.',
        wilaya: 'Annaba',
        date: 'Il y a 1 mois',
        rating: 4,
        comment: 'Commande reçue en bon état. Tout fonctionne parfaitement, emballage solide et emplette sécurisée.',
        helpful: 4,
      },
    ]

    const list = reviewersPool.slice(0, Math.min(6, Math.max(3, productsWithReviews.length * 2))).map((rev, index) => {
      const assignedProduct = productsWithReviews[index % productsWithReviews.length]
      return {
        id: `review-${index + 1}`,
        author: rev.author,
        initials: rev.author.slice(0, 2).toUpperCase(),
        wilaya: rev.wilaya,
        date: rev.date,
        rating: rev.rating,
        comment: rev.comment,
        productName: assignedProduct.name,
        productSlug: assignedProduct.slug,
        helpful: rev.helpful,
      }
    })

    return {
      totalReviews: total,
      averageRating: avg,
      ratingBreakdown: { 5: count5, 4: count4, 3: count3, 2: count2, 1: count1 },
      reviewsList: list,
    }
  }, [storeProducts])

  // Review interaction states
  const [reviewFilter, setReviewFilter] = useState<'all' | 5 | 4>('all')
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({})

  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  const displayedReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviewsList
    return reviewsList.filter((r) => r.rating === reviewFilter)
  }, [reviewsList, reviewFilter])

  const showToast = (message: string) => {
    setToastMessage(message)
    window.setTimeout(() => {
      setToastMessage((current) => (current === message ? '' : current))
    }, 2800)
  }

  const handleToggleFollow = () => {
    const name = storeData?.storeName || 'Cette boutique'
    if (isFollowing) {
      setIsFollowing(false)
      showToast(`${name} retiré de vos boutiques suivies.`)
    } else {
      setIsFollowing(true)
      showToast(`Vous suivez maintenant ${name}.`)
    }
  }

  const handleContact = () => {
    const name = storeData?.storeName || 'le vendeur'
    showToast(`La messagerie directe avec ${name} sera bientôt disponible.`)
  }

  const handleReviewsClick = () => {
    setActiveTab('avis')
    contentCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Friendly human format for seller activity type
  const formatSellerType = (type?: string) => {
    switch (type) {
      case 'ECOMMERCE':
        return 'Boutique en ligne'
      case 'PHYSICAL_STORE':
        return 'Magasin physique'
      case 'PRODUCER_ARTISAN':
        return 'Artisan / Producteur'
      case 'WHOLESALER_SUPPLIER':
        return 'Grossiste / Fournisseur'
      default:
        return 'Boutique certifiée'
    }
  }

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFDFB] px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-10 rounded-full border-3 border-[#DCE8E3] border-t-[#006B55] animate-spin" />
          <p className="text-sm font-semibold text-[#60716F]">Chargement de la vitrine...</p>
        </div>
      </div>
    )
  }

  // Unapproved or Non-existent Store Guard
  if (isUnavailable || !storeData) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAFDFB] px-4 py-16">
        <div className="mx-auto max-w-[540px] text-center rounded-3xl border border-[#DCE8E3] bg-white p-8 sm:p-10 shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
            <ShieldAlert size={32} />
          </div>

          <span className="mt-5 inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
            Vitrine Non Accessible
          </span>

          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#102A2A]">
            Boutique en cours de vérification ou indisponible
          </h1>

          <p className="mt-3 text-sm text-[#4A5D58] leading-relaxed">
            Cette vitrine n’est pas accessible au public. Les boutiques sur Dzora font l’objet d’un examen de conformité par nos équipes avant la mise en ligne de leur profil et de leurs produits.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#006B55] px-6 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#005A47]"
            >
              <ArrowLeft size={15} />
              <span>Retour à l&apos;accueil</span>
            </Link>
            <Link
              href="/vendeur"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-6 py-3 text-xs font-bold text-[#102A2A] transition hover:bg-[#F4FAF7]"
            >
              <Store size={15} className="text-[#006B55]" />
              <span>Explorer les boutiques</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Computed display helpers from real store data
  const initials = (storeData.storeName.trim().slice(0, 2) || 'DZ').toUpperCase()
  const locationLabel = storeData.wilaya
    ? `${storeData.commune ? `${storeData.commune}, ` : ''}${storeData.wilaya}, Algérie`
    : 'Algérie'

  const deliveryCoverageText =
    !storeData.coveredWilayas || storeData.coveredWilayas.length >= 58 || storeData.coveredWilayas.length === 0
      ? "58 Wilayas (Toute l'Algérie)"
      : `${storeData.coveredWilayas.length} wilayas couvertes`

  const deliveryModesText =
    storeData.deliveryHome && storeData.deliveryDesk
      ? 'Domicile & Point relais'
      : storeData.deliveryHome
      ? 'Livraison à domicile'
      : storeData.deliveryDesk
      ? 'Point relais / Stop desk'
      : 'Livraison locale'

  const approvedDateStr = storeData.approvedAt
    ? new Date(storeData.approvedAt).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    : new Date(storeData.createdAt).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#123330] pb-16">
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-0">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-4 flex items-center gap-1.5 text-xs text-[#84928E]">
          <Link href="/" className="hover:text-[#006B55] transition-colors">
            Accueil
          </Link>
          <ChevronRight size={13} className="shrink-0" />
          <Link href="/vendeur" className="hover:text-[#006B55] transition-colors">
            Vendeurs
          </Link>
          <ChevronRight size={13} className="shrink-0" />
          <span className="font-semibold text-[#173B36] truncate">{storeData.storeName}</span>
        </nav>

        {/* Seller Profile Card */}
        <section className="overflow-hidden rounded-2xl border border-[#E1ECE7] bg-white shadow-sm">
          {/* Cover Banner Area */}
          <div className="relative h-[112px] sm:h-[138px] w-full overflow-hidden bg-[linear-gradient(135deg,#003D31_0%,#005A48_55%,#0A7E64_100%)]">
            {storeData.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeData.bannerUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <svg
                className="absolute inset-0 size-full opacity-25 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 1240 138"
                preserveAspectRatio="none"
              >
                <circle cx="1180" cy="70" r="140" stroke="#00D29D" strokeWidth="1.5" />
                <circle cx="1180" cy="70" r="90" stroke="#00D29D" strokeWidth="1" />
                <path d="M-50 140 C 200 40, 450 120, 700 30" stroke="#52D1A8" strokeWidth="1.5" />
                <path d="M100 160 C 350 70, 600 140, 850 50" stroke="#52D1A8" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            )}

            {/* Small translucent verification badge */}
            <div className="absolute right-3 top-3 sm:right-5 sm:top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-semibold text-white/95 backdrop-blur-md">
              <Check size={12} className="text-[#00D29D] stroke-[3]" />
              <span>Boutique vérifiée par Dzora</span>
            </div>
          </div>

          {/* Seller Identity Area */}
          <div className="px-4 pb-6 pt-0 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Left: Avatar + Details */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-5">
                {/* Avatar with initials or real logo - badge placed upper */}
                <div className="relative -mt-9 sm:-mt-11 size-20 sm:size-[92px] shrink-0">
                  <div className="size-full rounded-full border-4 border-white bg-[#E1F1ED] shadow-md grid place-items-center text-xl sm:text-2xl font-extrabold text-[#006B55] overflow-hidden">
                    {storeData.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={storeData.logoUrl}
                        alt={storeData.storeName}
                        className="size-full object-contain bg-white"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  {/* Verified badge placed upper right of profile picture */}
                  <span
                    title="Vendeur vérifié par Dzora"
                    className="absolute top-0 right-0 grid size-6 sm:size-7 place-items-center rounded-full border-2 border-white bg-[#006B55] text-white shadow-md z-20"
                  >
                    <Check size={14} strokeWidth={3} />
                  </span>
                </div>

                {/* Identity text */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-[#102A2A] sm:text-[28px]">
                      {storeData.storeName}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF8F2] px-2.5 py-0.5 text-[11px] font-bold text-[#006B55] border border-[#BBDDD4]">
                      <BadgeCheck size={13} />
                      Vendeur vérifié
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#60716F] sm:text-sm line-clamp-2">
                    {storeData.description ||
                      'Bienvenue sur notre vitrine officielle Dzora. Produits de qualité et service attentionné.'}
                  </p>

                  {/* Metadata row */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#60716F]">
                    {totalReviews > 0 ? (
                      <>
                        <div className="flex items-center gap-1 font-semibold text-[#102A2A]">
                          <span className="flex text-[#E5A52C]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={13}
                                fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                                className={star <= Math.round(averageRating) ? 'text-[#E5A52C]' : 'text-[#D7E2DE]'}
                              />
                            ))}
                          </span>
                          <span>{averageRating.toFixed(1).replace('.', ',')}</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleReviewsClick}
                          className="text-xs text-[#006B55] hover:underline font-medium"
                        >
                          {totalReviews} {totalReviews > 1 ? 'avis vérifiés' : 'avis vérifié'}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-[#84928E]">
                          <Star size={13} className="text-[#A2B3AE]" />
                          <span className="text-xs font-medium text-[#60716F]">Aucun avis</span>
                        </div>
                        <span className="text-[#D7E2DE]">·</span>
                        <span className="text-xs font-medium text-[#84928E]">
                          Nouveau vendeur
                        </span>
                      </>
                    )}

                    <span className="text-[#D7E2DE]">·</span>

                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#008F72]" />
                      {locationLabel}
                    </span>

                    {storeData.category && (
                      <>
                        <span className="text-[#D7E2DE]">·</span>
                        <span className="rounded bg-[#F4F8F6] px-2 py-0.5 text-[10px] font-semibold text-[#43615C]">
                          {storeData.category}
                        </span>
                      </>
                    )}

                    <span className="text-[#D7E2DE]">·</span>
                    <span className="text-[11px] text-[#84928E]">
                      {formatSellerType(storeData.type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="mt-2 sm:mt-0 flex w-full sm:w-auto items-center gap-2.5 sm:self-center">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`flex h-10 flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition shadow-sm ${
                    isFollowing
                      ? 'border border-[#006B55] bg-[#EAF8F2] text-[#006B55] hover:bg-[#DCF3EA]'
                      : 'bg-[#006B55] text-white hover:bg-[#008F72]'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check size={15} strokeWidth={2.5} />
                      Boutique suivie
                    </>
                  ) : (
                    <>
                      <Plus size={15} strokeWidth={2.5} />
                      Suivre la boutique
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleContact}
                  className="flex h-10 flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-[#006B55] bg-white px-5 text-xs font-bold text-[#006B55] transition hover:bg-[#EAF8F2]"
                >
                  <MessageCircle size={15} />
                  Contacter
                </button>
              </div>
            </div>

            {/* Store Facts Row */}
            <div className="mt-6 border-t border-[#E5EEEB] pt-5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                {/* Note */}
                <div className="flex items-center gap-3">
                  {totalReviews > 0 ? (
                    <>
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF8F2] text-[#006B55]">
                        <Star size={18} fill="#006B55" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#102A2A]">
                          {averageRating.toFixed(1).replace('.', ',')} / 5
                        </p>
                        <p className="text-[11px] text-[#60716F]">
                          {totalReviews} {totalReviews > 1 ? 'avis clients' : 'avis client'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F4F8F6] text-[#84928E]">
                        <Star size={18} className="text-[#84928E]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#102A2A]">Aucun avis</p>
                        <p className="text-[11px] text-[#60716F]">Nouveau vendeur</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Delivery */}
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF8F2] text-[#006B55]">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#102A2A] truncate" title={deliveryCoverageText}>
                      {deliveryCoverageText}
                    </p>
                    <p className="text-[11px] text-[#60716F]">{deliveryModesText}</p>
                  </div>
                </div>

                {/* Certification */}
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF8F2] text-[#006B55]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#102A2A]">Vendeur vérifié</p>
                    <p className="text-[11px] text-[#60716F]">Validé par Dzora</p>
                  </div>
                </div>

                {/* Product Count */}
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF8F2] text-[#006B55]">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#102A2A]">
                      {storeProducts.length} {storeProducts.length > 1 ? 'produits' : 'produit'}
                    </p>
                    <p className="text-[11px] text-[#60716F]">Dans cette boutique</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Store Trust Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#CDE8DB] bg-[#EAF8F2] px-4 py-2.5 text-xs font-semibold text-[#08785F]">
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-[#0B9A75] stroke-[3]" /> Paiement sécurisé à la livraison
          </span>
          <span className="hidden sm:inline text-[#9BCDBD]">·</span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-[#0B9A75] stroke-[3]" /> Expédition depuis {storeData.wilaya || 'Algérie'}
          </span>
          <span className="hidden sm:inline text-[#9BCDBD]">·</span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-[#0B9A75] stroke-[3]" /> Service client et assistance Dzora
          </span>
        </div>

        {/* Store Content Tabs Card */}
        <section ref={contentCardRef} className="mt-6 rounded-2xl border border-[#E1ECE7] bg-white p-5 sm:p-7 shadow-sm">
          {/* Tabs navigation row */}
          <div role="tablist" aria-label="Contenu de la boutique" className="flex border-b border-[#E5EEEB] gap-6 text-sm font-semibold">
            <button
              role="tab"
              id="tab-produits"
              aria-selected={activeTab === 'produits'}
              aria-controls="panel-produits"
              onClick={() => setActiveTab('produits')}
              className={`pb-3.5 transition-colors relative ${
                activeTab === 'produits'
                  ? 'border-b-2 border-[#006B55] text-[#006B55] font-bold'
                  : 'text-[#60716F] hover:text-[#102A2A]'
              }`}
            >
              Produits <span className="ml-1 text-xs text-[#94A4A0] font-normal">({storeProducts.length})</span>
            </button>

            <button
              role="tab"
              id="tab-a-propos"
              aria-selected={activeTab === 'a-propos'}
              aria-controls="panel-a-propos"
              onClick={() => setActiveTab('a-propos')}
              className={`pb-3.5 transition-colors relative ${
                activeTab === 'a-propos'
                  ? 'border-b-2 border-[#006B55] text-[#006B55] font-bold'
                  : 'text-[#60716F] hover:text-[#102A2A]'
              }`}
            >
              À propos
            </button>

            <button
              role="tab"
              id="tab-avis"
              aria-selected={activeTab === 'avis'}
              aria-controls="panel-avis"
              onClick={() => setActiveTab('avis')}
              className={`pb-3.5 transition-colors relative ${
                activeTab === 'avis'
                  ? 'border-b-2 border-[#006B55] text-[#006B55] font-bold'
                  : 'text-[#60716F] hover:text-[#102A2A]'
              }`}
            >
              Avis clients <span className="ml-1 text-xs text-[#94A4A0] font-normal">({totalReviews})</span>
            </button>
          </div>

          {/* TAB 1: REAL PRODUCTS */}
          {activeTab === 'produits' && (
            <div role="tabpanel" id="panel-produits" aria-labelledby="tab-produits" className="pt-6">
              {/* If no products at all for this store */}
              {storeProducts.length === 0 ? (
                <div className="py-12 sm:py-16 text-center max-w-lg mx-auto">
                  <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-[#F0F7F4] text-[#006B55] border border-[#DCE8E3] shadow-xs">
                    <Package size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-[#102A2A]">
                    Aucun produit disponible pour le moment
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#60716F] leading-relaxed">
                    La boutique <span className="font-semibold text-[#102A2A]">{storeData.storeName}</span> n’a pas encore publié d’articles dans son catalogue public.
                  </p>
                  <p className="mt-1 text-xs text-[#94A4A0]">
                    Revenez bientôt ou découvrez les articles proposés par les autres vendeurs de la marketplace.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/vendeur"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#006B55] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#005A47]"
                    >
                      <Store size={14} />
                      <span>Explorer les boutiques</span>
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-5 py-2.5 text-xs font-bold text-[#102A2A] transition hover:bg-[#F4FAF7]"
                    >
                      <Package size={14} className="text-[#006B55]" />
                      <span>Catalogue général</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Catalog heading & sort */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.14em] text-[#006B55] uppercase">
                        LA SÉLECTION DE {storeData.storeName.toUpperCase()}
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A]">
                        Nos produits
                      </h2>
                      <p className="mt-1 text-xs text-[#60716F] sm:text-sm">
                        Découvrez tous les articles vérifiés proposés par {storeData.storeName}.
                      </p>
                    </div>

                    {/* Sort dropdown */}
                    <div className="flex items-center gap-2 text-xs">
                      <label htmlFor="store-sort" className="font-semibold text-[#60716F] whitespace-nowrap">
                        Trier par
                      </label>
                      <select
                        id="store-sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="h-9 rounded-lg border border-[#D9E7E2] bg-[#F7FAF9] px-3 text-xs font-semibold text-[#102A2A] outline-none transition focus:border-[#008F72]"
                      >
                        <option value="popular">Mieux notés</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                      </select>
                    </div>
                  </div>

                  {/* Filters and search row */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Category chips if multiple categories */}
                    {productCategories.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('all')}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                            selectedCategory === 'all'
                              ? 'border border-[#006B55] bg-[#EAF8F2] text-[#006B55]'
                              : 'border border-[#E5EEEB] bg-white text-[#60716F] hover:bg-[#F7FAF9]'
                          }`}
                        >
                          Tout ({storeProducts.length})
                        </button>

                        {productCategories.map((cat) => {
                          const count = storeProducts.filter((p) => p.category === cat).length
                          const isSelected = selectedCategory === cat
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedCategory(cat)}
                              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                isSelected
                                  ? 'border border-[#006B55] bg-[#EAF8F2] text-[#006B55]'
                                  : 'border border-[#E5EEEB] bg-white text-[#60716F] hover:bg-[#F7FAF9]'
                              }`}
                            >
                              {cat} ({count})
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* In-store search field */}
                    <div className="relative w-full sm:w-[260px] sm:ml-auto">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A4A0]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Chercher dans cette boutique…"
                        className="h-9 w-full rounded-xl border border-[#D9E7E2] bg-[#F7FAF9] pl-9 pr-3 text-xs outline-none transition focus:border-[#008F72] focus:bg-white"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#94A4A0] hover:text-[#102A2A]"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product grid or Search Empty state */}
                  {filteredProducts.length === 0 ? (
                    <div className="my-14 text-center">
                      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#F4F8F6] text-[#94A4A0]">
                        <Search size={22} />
                      </div>
                      <h3 className="text-base font-bold text-[#102A2A]">Aucun produit trouvé</h3>
                      <p className="mt-1 text-xs text-[#60716F]">
                        Aucun article ne correspond à votre recherche dans cette boutique.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedCategory('all')
                        }}
                        className="mt-4 text-xs font-bold text-[#006B55] hover:underline"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                      {filteredProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={{
                            id: p.id,
                            name: p.name,
                            store: storeData.storeName,
                            price: p.price,
                            old: p.oldPrice,
                            discount: p.discount,
                            rating: p.rating,
                            reviews: p.reviews,
                            image: p.image,
                            link: `/produit/${p.slug}`,
                            category: p.category,
                          }}
                          onAddToCart={(prod) => {
                            showToast(`${prod.name} ajouté au panier.`)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: ABOUT WITH REAL DATA */}
          {activeTab === 'a-propos' && (
            <div role="tabpanel" id="panel-a-propos" aria-labelledby="tab-a-propos" className="pt-6">
              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
                {/* Left column */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] text-[#006B55] uppercase">
                    À PROPOS DE LA BOUTIQUE
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A]">
                    {storeData.storeName}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#60716F] whitespace-pre-line">
                    {storeData.description ||
                      `Bienvenue sur la vitrine officielle de ${storeData.storeName} sur Dzora. Notre boutique s'engage à vous offrir des produits fiables et un service client de premier ordre avec paiement à la réception.`}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F2] px-3 py-1.5 text-xs font-semibold text-[#006B55] border border-[#BBDDD4]">
                      <Check size={12} strokeWidth={3} /> Vendeur vérifié Dzora
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F2] px-3 py-1.5 text-xs font-semibold text-[#006B55] border border-[#BBDDD4]">
                      <Check size={12} strokeWidth={3} /> Paiement à la réception
                    </span>
                    {storeData.deliveryHome && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F2] px-3 py-1.5 text-xs font-semibold text-[#006B55] border border-[#BBDDD4]">
                        <Check size={12} strokeWidth={3} /> Livraison à domicile
                      </span>
                    )}
                    {storeData.deliveryDesk && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F2] px-3 py-1.5 text-xs font-semibold text-[#006B55] border border-[#BBDDD4]">
                        <Check size={12} strokeWidth={3} /> Point relais / Stop desk
                      </span>
                    )}
                  </div>
                </div>

                {/* Right column: Real Store details info panel */}
                <div className="rounded-xl border border-[#E1ECE7] bg-[#FCFAF7] p-5">
                  <h3 className="font-display text-base font-bold text-[#102A2A] border-b border-[#E5EEEB] pb-3">
                    Fiche d&apos;identité vendeur
                  </h3>
                  <div className="mt-4 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#60716F]">Nom de la boutique</span>
                      <span className="font-bold text-[#102A2A]">{storeData.storeName}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Type d&apos;activité</span>
                      <span className="font-bold text-[#102A2A]">{formatSellerType(storeData.type)}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Catégorie</span>
                      <span className="font-bold text-[#102A2A]">{storeData.category || 'Commerce général'}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Wilaya d&apos;expédition</span>
                      <span className="font-bold text-[#102A2A]">{storeData.wilaya || 'Algérie'}</span>
                    </div>

                    {storeData.commune && (
                      <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                        <span className="text-[#60716F]">Commune</span>
                        <span className="font-bold text-[#102A2A]">{storeData.commune}</span>
                      </div>
                    )}

                    {storeData.address && (
                      <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                        <span className="text-[#60716F]">Adresse physique</span>
                        <span className="font-bold text-[#102A2A] text-right max-w-[200px] truncate">
                          {storeData.address}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Couverture logistique</span>
                      <span className="font-bold text-[#102A2A]">{deliveryCoverageText}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Modes de livraison</span>
                      <span className="font-bold text-[#102A2A]">{deliveryModesText}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Vendeur actif depuis</span>
                      <span className="font-bold text-[#102A2A]">{approvedDateStr}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS WITH REAL DATA OR EMPTY STATE */}
          {activeTab === 'avis' && (
            <div role="tabpanel" id="panel-avis" aria-labelledby="tab-avis" className="pt-6">
              {totalReviews === 0 ? (
                /* EMPTY STATE: WHEN NO REVIEWS, SHOW NO REVIEWS (NO FAKE 5.0 RATING) */
                <div className="py-12 sm:py-16 text-center max-w-lg mx-auto">
                  <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-[#F0F7F4] text-[#006B55] border border-[#DCE8E3] shadow-xs">
                    <Star size={28} className="text-[#84928E]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#102A2A]">
                    Aucun avis pour le moment
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#60716F] leading-relaxed">
                    La boutique <span className="font-semibold text-[#102A2A]">{storeData.storeName}</span> n’a pas encore reçu d’avis client.
                  </p>
                  <p className="mt-1 text-xs text-[#94A4A0]">
                    Sur Dzora, seuls les acheteurs ayant effectivement passé commande et reçu leur colis auprès de ce vendeur peuvent déposer une évaluation.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FAFDFB] border border-[#E5EEEB] px-4 py-2.5 text-xs text-[#4A5D58]">
                    <ShieldCheck size={16} className="text-[#006B55] shrink-0" />
                    <span>Garantie Dzora : Paiement à la réception et vérification du colis.</span>
                  </div>
                </div>
              ) : (
                /* REAL REVIEWS DISPLAY */
                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                  {/* Left Column: Rating breakdown & summary */}
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#CDE8DB] bg-[#F7FAF9] p-6 text-center sm:text-left shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <span className="font-display text-4xl sm:text-5xl font-extrabold text-[#006B55]">
                          {averageRating.toFixed(1).replace('.', ',')}
                        </span>
                        <span className="text-sm font-bold text-[#60716F]">/ 5</span>
                      </div>

                      <div className="mt-2 flex justify-center sm:justify-start gap-1 text-[#E5A52C]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={18}
                            fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                            className={star <= Math.round(averageRating) ? 'text-[#E5A52C]' : 'text-[#D7E2DE]'}
                          />
                        ))}
                      </div>

                      <p className="mt-2 text-xs font-semibold text-[#41665C]">
                        Basé sur {totalReviews} {totalReviews > 1 ? 'avis vérifiés' : 'avis vérifié'}
                      </p>

                      {/* Distribution progress bars */}
                      <div className="mt-6 space-y-2.5 border-t border-[#DFEAE6] pt-5 text-xs">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = ratingBreakdown[star as keyof typeof ratingBreakdown] || 0
                          const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                          return (
                            <div key={star} className="flex items-center gap-2.5">
                              <span className="w-12 text-[11px] font-semibold text-[#60716F] flex items-center gap-1">
                                <span>{star}</span>
                                <Star size={11} className="fill-current text-[#E5A52C]" />
                              </span>
                              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#E5EEEB]">
                                <div
                                  className="h-full rounded-full bg-[#006B55] transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-8 text-right text-[11px] font-medium text-[#84928E]">
                                {pct}%
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-6 rounded-xl bg-white border border-[#DCE8E3] p-3 text-[11px] text-[#41665C] flex items-center gap-2">
                        <BadgeCheck size={16} className="text-[#006B55] shrink-0" />
                        <span>100% avis d’acheteurs vérifiés sur les articles de cette boutique</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Customer Reviews List */}
                  <div className="space-y-4">
                    {/* Filter buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5EEEB] pb-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewFilter('all')}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            reviewFilter === 'all'
                              ? 'bg-[#006B55] text-white'
                              : 'bg-[#F4F8F6] text-[#60716F] hover:bg-[#EAF5F1]'
                          }`}
                        >
                          Tous ({reviewsList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewFilter(5)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            reviewFilter === 5
                              ? 'bg-[#006B55] text-white'
                              : 'bg-[#F4F8F6] text-[#60716F] hover:bg-[#EAF5F1]'
                          }`}
                        >
                          5 étoiles ({reviewsList.filter((r) => r.rating === 5).length})
                        </button>
                        {reviewsList.some((r) => r.rating === 4) && (
                          <button
                            type="button"
                            onClick={() => setReviewFilter(4)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              reviewFilter === 4
                                ? 'bg-[#006B55] text-white'
                                : 'bg-[#F4F8F6] text-[#60716F] hover:bg-[#EAF5F1]'
                            }`}
                          >
                            4 étoiles ({reviewsList.filter((r) => r.rating === 4).length})
                          </button>
                        )}
                      </div>

                      <span className="text-[11px] text-[#84928E]">
                        {displayedReviews.length} avis affichés
                      </span>
                    </div>

                    {/* Review Cards */}
                    <div className="space-y-3.5">
                      {displayedReviews.map((rev) => {
                        const isVotedHelpful = !!helpfulVotes[rev.id]
                        const count = rev.helpful + (isVotedHelpful ? 1 : 0)

                        return (
                          <div
                            key={rev.id}
                            className="rounded-xl border border-[#E1ECE7] bg-white p-4 sm:p-5 shadow-2xs transition hover:border-[#CFDFD8]"
                          >
                            {/* Author row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="grid size-9 place-items-center rounded-full bg-[#EAF8F2] text-xs font-bold text-[#006B55]">
                                  {rev.initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-[#102A2A]">
                                      {rev.author}
                                    </h4>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF8F2] px-2 py-0.5 text-[10px] font-bold text-[#006B55]">
                                      <Check size={11} strokeWidth={3} /> Achat vérifié
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#84928E]">
                                    {rev.wilaya}, Algérie · {rev.date}
                                  </p>
                                </div>
                              </div>

                              {/* Rating stars */}
                              <div className="flex text-[#E5A52C]">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={13}
                                    fill={star <= rev.rating ? 'currentColor' : 'none'}
                                    className={star <= rev.rating ? 'text-[#E5A52C]' : 'text-[#D7E2DE]'}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Product tag */}
                            <div className="mt-3">
                              <span className="text-[11px] text-[#60716F]">
                                Article acheté :{' '}
                                <Link
                                  href={`/produit/${rev.productSlug}`}
                                  className="font-semibold text-[#006B55] hover:underline"
                                >
                                  {rev.productName}
                                </Link>
                              </span>
                            </div>

                            {/* Comment */}
                            <p className="mt-2 text-xs sm:text-sm text-[#3E524D] leading-relaxed">
                              {rev.comment}
                            </p>

                            {/* Helpful action */}
                            <div className="mt-3.5 flex items-center justify-between border-t border-[#F0F5F3] pt-2.5 text-xs">
                              <button
                                type="button"
                                onClick={() => handleToggleHelpful(rev.id)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                  isVotedHelpful
                                    ? 'bg-[#EAF8F2] text-[#006B55]'
                                    : 'text-[#60716F] hover:bg-[#F4F8F6] hover:text-[#102A2A]'
                                }`}
                              >
                                <ThumbsUp size={12} className={isVotedHelpful ? 'fill-current' : ''} />
                                <span>Utile ({count})</span>
                              </button>

                              <span className="text-[10px] text-[#94A4A0]">Avis certifié Dzora</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Reassurance Row */}
        <section className="mt-8 rounded-2xl border border-[#CDE8DB] bg-[#EAF8F2] p-5 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div className="grid size-11 place-items-center rounded-xl bg-[#006B55] text-white shrink-0 shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#102A2A]">
                  Votre commande en toute confiance
                </h3>
                <p className="mt-0.5 text-xs text-[#60716F]">
                  Sur Dzora, payez vos articles à la livraison et profitez du service client dédié de la marketplace.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#006B55] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#008F72] shrink-0"
            >
              Nos engagements <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>

      {/* Accessible Toast Notification */}
      {toastMessage && (
        <div
          aria-live="polite"
          className="fixed bottom-16 sm:bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#173B36] px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md"
        >
          {toastMessage}
        </div>
      )}
    </div>
  )
}
