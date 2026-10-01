'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowRight,
  Check,
  ChevronRight,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { ProductCard } from '@/components/product-card'

interface StoreProduct {
  id: string
  name: string
  category: 'Smartphone' | 'Audio'
  discount?: string
  rating: string
  reviews: string
  specification: string
  price: string
  numericPrice: number
  old: string
  image: string
  link: string
  popularity: number
}

const initialProducts: StoreProduct[] = [
  {
    id: 'a15-128',
    name: 'Samsung Galaxy A15 128 Go',
    category: 'Smartphone',
    discount: '−19 %',
    rating: '4.8',
    reviews: '219',
    specification: '4 Go RAM · 4G · Dual SIM',
    price: '34 990',
    numericPrice: 34990,
    old: '42 990',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=85',
    link: '/produit/galaxy-a15',
    popularity: 219,
  },
  {
    id: 'a15-256',
    name: 'Samsung Galaxy A15 256 Go',
    category: 'Smartphone',
    rating: '4.8',
    reviews: '89',
    specification: '6 Go RAM · 4G · Dual SIM',
    price: '44 990',
    numericPrice: 44990,
    old: '49 990',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=85',
    link: '/produit/galaxy-a15',
    popularity: 140,
  },
  {
    id: 'tws-audio',
    name: 'Écouteurs Bluetooth TWS',
    category: 'Audio',
    discount: '−23 %',
    rating: '4.7',
    reviews: '125',
    specification: 'Sans fil · Boîtier de recharge',
    price: '3 990',
    numericPrice: 3990,
    old: '5 200',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=85',
    link: '/produit/galaxy-a15',
    popularity: 125,
  },
]

const sellerProfiles: Record<
  string,
  {
    name: string
    mark: string
    city: string
    specialty: string
    intro: string
    avatarBg: string
    avatarText: string
  }
> = {
  'techno-blida': {
    name: 'Techno Blida',
    mark: 'TB',
    city: 'Blida, Algérie',
    specialty: 'Téléphonie & High-Tech',
    intro: 'Smartphones, accessoires & audio — sélectionnés pour vous en Algérie.',
    avatarBg: 'bg-[#FFF0DF]',
    avatarText: 'text-[#D97706]',
  },
  'tech-setif': {
    name: 'Tech Sétif',
    mark: 'TS',
    city: 'Sétif, Algérie',
    specialty: 'High-Tech & Informatique',
    intro: 'Le meilleur de la tech à Sétif, livré partout en Algérie.',
    avatarBg: 'bg-[#E1F1ED]',
    avatarText: 'text-[#006B55]',
  },
  'maison-alger': {
    name: 'Maison Alger',
    mark: 'MA',
    city: 'Alger, Algérie',
    specialty: 'Maison, Cuisine & Électroménager',
    intro: 'Équipez votre intérieur avec goût et au meilleur prix.',
    avatarBg: 'bg-[#FFF0DF]',
    avatarText: 'text-[#D97706]',
  },
  'dz-fashion': {
    name: 'DZ Fashion',
    mark: 'DZ',
    city: 'Oran, Algérie',
    specialty: 'Mode & Baskets',
    intro: 'Tendances et streetwear pour toutes les occasions.',
    avatarBg: 'bg-[#EFEAFE]',
    avatarText: 'text-[#6D28D9]',
  },
}

export default function DynamicSellerStorefront() {
  const params = useParams()
  const rawSlug = (params?.slug as string) || 'techno-blida'

  const profile = useMemo(() => {
    if (sellerProfiles[rawSlug]) {
      return sellerProfiles[rawSlug]
    }
    const formatted = rawSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    const mark = formatted
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return {
      name: formatted,
      mark: mark || 'DZ',
      city: 'Blida, Algérie',
      specialty: 'Téléphonie & High-Tech',
      intro: 'Smartphones, accessoires & audio — sélectionnés pour vous en Algérie.',
      avatarBg: 'bg-[#FFF0DF]',
      avatarText: 'text-[#D97706]',
    }
  }, [rawSlug])

  const [activeTab, setActiveTab] = useState<'produits' | 'a-propos' | 'avis'>('produits')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Smartphone' | 'Audio'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular')
  const [isFollowing, setIsFollowing] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const { addToCart } = useCart()
  const contentCardRef = useRef<HTMLDivElement>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    window.setTimeout(() => {
      setToastMessage((current) => (current === message ? '' : current))
    }, 2800)
  }

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false)
      showToast(`${profile.name} retiré de vos boutiques suivies.`)
    } else {
      setIsFollowing(true)
      showToast(`Vous suivez maintenant ${profile.name}.`)
    }
  }

  const handleContact = () => {
    showToast('La prise de contact sera bientôt disponible sur Dzora.')
  }

  const handleReviewsClick = () => {
    setActiveTab('avis')
    contentCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filteredProducts = useMemo(() => {
    let list = initialProducts.filter((p) => {
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory
      const matchSearch = p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      return matchCategory && matchSearch
    })

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.numericPrice - b.numericPrice)
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.numericPrice - a.numericPrice)
    } else {
      list = [...list].sort((a, b) => b.popularity - a.popularity)
    }

    return list
  }, [selectedCategory, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#123330] pb-16">
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-0">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-4 flex items-center gap-1.5 text-xs text-[#84928E]">
          <Link href="/" className="hover:text-[#006B55] transition-colors">
            Accueil
          </Link>
          <ChevronRight size={13} className="shrink-0" />
          <Link href="/vendeur/techno-blida" className="hover:text-[#006B55] transition-colors">
            Vendeurs locaux
          </Link>
          <ChevronRight size={13} className="shrink-0" />
          <span className="font-semibold text-[#173B36] truncate">{profile.name}</span>
        </nav>

        {/* Seller Profile Card */}
        <section className="overflow-hidden rounded-2xl border border-[#E1ECE7] bg-white shadow-sm">
          {/* Cover area: ~138px desktop, ~112px mobile */}
          <div className="relative h-[112px] sm:h-[138px] w-full overflow-hidden bg-[linear-gradient(135deg,#003D31_0%,#005A48_55%,#0A7E64_100%)]">
            {/* Subtle abstract curved outlines */}
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

            {/* Small translucent verification badge */}
            <div className="absolute right-3 top-3 sm:right-5 sm:top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-semibold text-white/95 backdrop-blur-md">
              <Check size={12} className="text-[#00D29D] stroke-[3]" />
              <span>Boutique vérifiée par Dzora</span>
            </div>
          </div>

          {/* Seller identity area */}
          <div className="px-4 pb-6 pt-0 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Left: Avatar + Details */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-5">
                {/* Avatar with initials */}
                <div
                  className={`relative -mt-9 sm:-mt-11 size-20 sm:size-[92px] shrink-0 rounded-full border-4 border-white ${profile.avatarBg} shadow-md grid place-items-center text-xl sm:text-2xl font-extrabold ${profile.avatarText}`}
                >
                  {profile.mark}
                  <span
                    title="Vendeur vérifié"
                    className="absolute bottom-0 right-0 grid size-6 place-items-center rounded-full border-2 border-white bg-[#006B55] text-white shadow-sm"
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                </div>

                {/* Identity text */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-[#102A2A] sm:text-[28px]">
                      {profile.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF8F2] px-2.5 py-0.5 text-[11px] font-bold text-[#006B55] border border-[#BBDDD4]">
                      <Check size={11} strokeWidth={3} />
                      Vendeur vérifié
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#60716F] sm:text-sm">
                    {profile.intro}
                  </p>

                  {/* Metadata row */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#60716F]">
                    <div className="flex items-center gap-1 font-semibold text-[#102A2A]">
                      <span className="flex text-[#E5A52C]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={13} fill="currentColor" />
                        ))}
                      </span>
                      <span>4,9</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleReviewsClick}
                      className="text-xs text-[#006B55] hover:underline font-medium"
                    >
                      Avis clients
                    </button>

                    <span className="text-[#D7E2DE]">·</span>

                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#008F72]" />
                      {profile.city}
                    </span>

                    <span className="text-[#D7E2DE]">·</span>

                    <span className="rounded bg-[#F4F8F6] px-2 py-0.5 text-[10px] font-semibold text-[#43615C]">
                      {profile.specialty}
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

            {/* Store facts row */}
            <div className="mt-6 border-t border-[#E5EEEB] pt-5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                {/* Star */}
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF8F2] text-[#006B55]">
                    <Star size={18} fill="#006B55" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#102A2A]">4,9 / 5</p>
                    <p className="text-[11px] text-[#60716F]">Note vendeur</p>
                  </div>
                </div>

                {/* Delivery */}
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF8F2] text-[#006B55]">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#102A2A]">Partout en Algérie</p>
                    <p className="text-[11px] text-[#60716F]">Livraison disponible</p>
                  </div>
                </div>

                {/* Shield */}
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF8F2] text-[#006B55]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#102A2A]">Vendeur vérifié</p>
                    <p className="text-[11px] text-[#60716F]">Par la marketplace Dzora</p>
                  </div>
                </div>

                {/* Products count */}
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF8F2] text-[#006B55]">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#102A2A]">3 produits</p>
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
            <Check size={13} className="text-[#0B9A75] stroke-[3]" /> Paiement à la livraison
          </span>
          <span className="hidden sm:inline text-[#9BCDBD]">·</span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-[#0B9A75] stroke-[3]" /> Vendeur local à {profile.city.split(',')[0]}
          </span>
          <span className="hidden sm:inline text-[#9BCDBD]">·</span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-[#0B9A75] stroke-[3]" /> Assistance Dzora
          </span>
        </div>

        {/* Store Content Tabs Card (approx 20-25px space) */}
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
              Produits <span className="ml-1 text-xs text-[#94A4A0]">3</span>
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
              Avis clients
            </button>
          </div>

          {/* TAB 1: PRODUCTS */}
          {activeTab === 'produits' && (
            <div role="tabpanel" id="panel-produits" aria-labelledby="tab-produits" className="pt-6">
              {/* Catalog heading & sort */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] text-[#006B55] uppercase">
                    LA SÉLECTION DE LA BOUTIQUE
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A]">
                    Nos produits
                  </h2>
                  <p className="mt-1 text-xs text-[#60716F] sm:text-sm">
                    Des indispensables high-tech, choisis pour votre quotidien.
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
                    <option value="popular">Les plus populaires</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                  </select>
                </div>
              </div>

              {/* Filters and search row */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Category chips */}
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
                    Tout 3
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Smartphone')}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      selectedCategory === 'Smartphone'
                        ? 'border border-[#006B55] bg-[#EAF8F2] text-[#006B55]'
                        : 'border border-[#E5EEEB] bg-white text-[#60716F] hover:bg-[#F7FAF9]'
                    }`}
                  >
                    Smartphones 2
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Audio')}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      selectedCategory === 'Audio'
                        ? 'border border-[#006B55] bg-[#EAF8F2] text-[#006B55]'
                        : 'border border-[#E5EEEB] bg-white text-[#60716F] hover:bg-[#F7FAF9]'
                    }`}
                  >
                    Audio 1
                  </button>
                </div>

                {/* In-store search field */}
                <div className="relative w-full sm:w-[260px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A4A0]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Chercher dans la boutique…"
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

              {/* Product grid / Empty state */}
              {filteredProducts.length === 0 ? (
                <div className="my-14 text-center">
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#F4F8F6] text-[#94A4A0]">
                    <Search size={22} />
                  </div>
                  <h3 className="text-base font-bold text-[#102A2A]">Aucun produit trouvé</h3>
                  <p className="mt-1 text-xs text-[#60716F]">Essayez un autre mot-clé ou une autre catégorie.</p>
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
                        name: p.name,
                        store: profile.name,
                        price: p.price,
                        old: p.old,
                        discount: p.discount,
                        rating: p.rating,
                        reviews: p.reviews,
                        image: p.image,
                        link: p.link,
                      }}
                      onAddToCart={(prod) => {
                        addToCart(1)
                        showToast(`${prod.name} ajouté au panier.`)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ABOUT */}
          {activeTab === 'a-propos' && (
            <div role="tabpanel" id="panel-a-propos" aria-labelledby="tab-a-propos" className="pt-6">
              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
                {/* Left column */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] text-[#006B55] uppercase">
                    À PROPOS DE LA BOUTIQUE
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A]">
                    La tech, plus proche de vous.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#60716F]">
                    {profile.name} vous propose une sélection de smartphones et d’accessoires high-tech. Retrouvez votre prochain appareil facilement, avec des informations claires, un vendeur local et la simplicité du paiement à la livraison sur Dzora.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F2] px-3 py-1.5 text-xs font-semibold text-[#006B55] border border-[#BBDDD4]">
                      <Check size={12} strokeWidth={3} /> Boutique vérifiée
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F2] px-3 py-1.5 text-xs font-semibold text-[#006B55] border border-[#BBDDD4]">
                      <Check size={12} strokeWidth={3} /> Paiement à la réception
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F2] px-3 py-1.5 text-xs font-semibold text-[#006B55] border border-[#BBDDD4]">
                      <Check size={12} strokeWidth={3} /> Livraison en Algérie
                    </span>
                  </div>
                </div>

                {/* Right column: Store info panel */}
                <div className="rounded-xl border border-[#E1ECE7] bg-[#FCFAF7] p-5">
                  <h3 className="font-display text-base font-bold text-[#102A2A] border-b border-[#E5EEEB] pb-3">
                    Informations boutique
                  </h3>
                  <div className="mt-4 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#60716F]">Localisation</span>
                      <span className="font-bold text-[#102A2A]">{profile.city}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Spécialité</span>
                      <span className="font-bold text-[#102A2A]">{profile.specialty}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Livraison</span>
                      <span className="font-bold text-[#102A2A]">Partout en Algérie</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E5EEEB] pt-3">
                      <span className="text-[#60716F]">Évaluation vendeur</span>
                      <span className="flex items-center gap-1 font-bold text-[#102A2A]">
                        <span className="flex text-[#E5A52C]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={11} fill="currentColor" />
                          ))}
                        </span>
                        4,9 / 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'avis' && (
            <div role="tabpanel" id="panel-avis" aria-labelledby="tab-avis" className="pt-6">
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                {/* Rating summary card on left */}
                <div className="rounded-xl border border-[#CDE8DB] bg-[#EAF8F2] p-6 text-center sm:text-left flex flex-col justify-center">
                  <p className="font-display text-4xl font-extrabold text-[#006B55]">4,9 / 5</p>
                  <div className="mt-2 flex justify-center sm:justify-start gap-1 text-[#E5A52C]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#41665C]">
                    La confiance de nos clients, partout en Algérie.
                  </p>
                </div>

                {/* Two customer reviews on right */}
                <div className="space-y-4">
                  {/* Review 1 */}
                  <div className="rounded-xl border border-[#E1ECE7] bg-white p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex text-[#E5A52C]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={12} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#94A4A0]">Il y a 3 jours</span>
                    </div>
                    <p className="mt-2 font-bold text-[#102A2A]">Très bon téléphone, livraison rapide</p>
                    <p className="mt-1 leading-5 text-[#60716F]">
                      Exactement comme décrit. Reçu à Alger en 3 jours. Le vendeur m’a appelé avant la livraison, je recommande.
                    </p>
                    <p className="mt-2.5 text-[11px] font-semibold text-[#006B55]">
                      Yacine <span className="font-normal text-[#94A4A0]">· Achat vérifié</span>
                    </p>
                  </div>

                  {/* Review 2 */}
                  <div className="rounded-xl border border-[#E1ECE7] bg-white p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex text-[#E5A52C]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={12} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#94A4A0]">Il y a 1 semaine</span>
                    </div>
                    <p className="mt-2 font-bold text-[#102A2A]">Une expérience simple et sérieuse</p>
                    <p className="mt-1 leading-5 text-[#60716F]">
                      Produit conforme et paiement à la réception. Le vendeur a répondu à mes questions avant la commande.
                    </p>
                    <p className="mt-2.5 text-[11px] font-semibold text-[#006B55]">
                      Amel <span className="font-normal text-[#94A4A0]">· Achat vérifié</span>
                    </p>
                  </div>
                </div>
              </div>
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
                  Votre achat, en toute confiance
                </h3>
                <p className="mt-0.5 text-xs text-[#60716F]">
                  Sur Dzora, payez votre commande à la livraison et profitez du service client de la marketplace.
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

      {/* Accessible Toast Status notification */}
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
