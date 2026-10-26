'use client'

import React, { useState, useEffect, createContext, useContext, Suspense, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Menu,
  X,
  HelpCircle,
  Bell,
  ChevronDown,
  Store,
  Settings,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Truck,
  CreditCard,
  Megaphone,
  BarChart3,
  Star,
  MessageSquare,
  Sparkles,
  Package,
  Layers,
  Boxes,
  Clock,
  ArrowUpDown,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { getClientOrders } from '@/lib/client-account'
import { sellerProductsService } from '@/lib/seller-products-service'

/* -------------------------------------------------------------------------- */
/*                                Context Types                               */
/* -------------------------------------------------------------------------- */

export interface SellerContextType {
  sellerStatus: any | null
  sellerProfile: any | null
  storeDisplayName: string
  storeSlug: string
  userPhone: string | null
  userInitials: string
  sellerTypeBadge: string
  pendingOrdersCount: number
  setPendingOrdersCount: (count: number) => void
  storeProductsCount: number
  setStoreProductsCount: (count: number) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showToast: (msg: string) => void
  toastMessage: string | null
}

const SellerDashboardContext = createContext<SellerContextType | null>(null)

export function useSellerDashboard() {
  const context = useContext(SellerDashboardContext)
  if (!context) {
    throw new Error('useSellerDashboard must be used within a SellerLayoutShell')
  }
  return context
}

/* -------------------------------------------------------------------------- */
/*                            Navigation Constants                            */
/* -------------------------------------------------------------------------- */

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  tab?: string
  href: string
  badgeType?: 'orders' | 'products'
}

const CATALOG_ITEMS: NavItem[] = [
  { id: 'cat-produits', label: 'Produits', icon: Boxes, tab: 'cat-produits', href: '/vendeur/produits', badgeType: 'products' },
  { id: 'cat-categories', label: 'Catégories', icon: Layers, tab: 'cat-categories', href: '/vendeur/dashboard?tab=cat-categories' },
  { id: 'cat-inventaire', label: 'Inventaire & Stocks', icon: Clock, tab: 'cat-inventaire', href: '/vendeur/dashboard?tab=cat-inventaire' },
  { id: 'cat-import-export', label: 'Import / Export', icon: ArrowUpDown, tab: 'cat-import-export', href: '/vendeur/dashboard?tab=cat-import-export' },
]

const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'commandes', label: 'Commandes', icon: ShoppingCart, tab: 'commandes', href: '/vendeur/dashboard?tab=commandes', badgeType: 'orders' },
  { id: 'boutique', label: 'Ma boutique', icon: Store, tab: 'boutique', href: '/vendeur/dashboard?tab=boutique' },
  { id: 'livraison', label: 'Expédition & Wilayas', icon: Truck, tab: 'livraison', href: '/vendeur/dashboard?tab=livraison' },
  { id: 'finance', label: 'Finance & Reversement', icon: CreditCard, tab: 'finance', href: '/vendeur/dashboard?tab=finance' },
  { id: 'marketing', label: 'Promotions', icon: Megaphone, tab: 'marketing', href: '/vendeur/dashboard?tab=marketing' },
  { id: 'analytique', label: 'Analytique', icon: BarChart3, tab: 'analytique', href: '/vendeur/dashboard?tab=analytique' },
  { id: 'avis', label: 'Avis clients', icon: Star, tab: 'avis', href: '/vendeur/dashboard?tab=avis' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, tab: 'messages', href: '/vendeur/dashboard?tab=messages' },
]

/* -------------------------------------------------------------------------- */
/*                            Shell Inner Component                           */
/* -------------------------------------------------------------------------- */

function SellerLayoutShellContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentTab = pathname === '/vendeur/dashboard' ? (searchParams.get('tab') || 'overview') : null
  const isAbonnementActive = pathname?.startsWith('/vendeur/abonnement')
  const isSecurityActive = pathname?.startsWith('/vendeur/securite')

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(
    currentTab?.startsWith('cat-') || false
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [storeProductsCount, setStoreProductsCount] = useState(0)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }, [])

  // Auto-expand catalogue accordion if on a catalogue tab or products page
  useEffect(() => {
    if (currentTab?.startsWith('cat-') || pathname?.startsWith('/vendeur/produits')) {
      setIsCatalogueOpen(true)
    }
  }, [currentTab, pathname])

  // Close mobile menu on path or tab change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
  }, [pathname, searchParams])

  // Seller status & profile from backend API
  const [sellerStatus, setSellerStatus] = useState<any | null>(null)
  const [sellerProfile, setSellerProfile] = useState<any | null>(null)

  useEffect(() => {
    let isMounted = true

    Promise.allSettled([
      api.seller.getStatus(),
      api.seller.getProfile(),
    ]).then(([statusRes, profileRes]) => {
      if (!isMounted) return

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        setSellerStatus(statusRes.value)
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setSellerProfile(profileRes.value)
      }
    })

    return () => {
      isMounted = false
    }
  }, [user?.id])

  // Derive Display Identity
  const storeDisplayName =
    sellerStatus?.storeName ||
    sellerProfile?.storeName ||
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
    'Ma Boutique Dzora'

  const storeSlug =
    sellerStatus?.slug ||
    sellerProfile?.slug ||
    'techno-blida'

  const userPhone = user?.phone || sellerProfile?.user?.phone || null
  const userInitials = (storeDisplayName.slice(0, 2) || 'DZ').toUpperCase()

  const sellerTypeBadge =
    sellerStatus?.type === 'PHYSICAL_STORE' || sellerProfile?.type === 'PHYSICAL_STORE'
      ? 'Magasin Physique'
      : sellerStatus?.type === 'ECOMMERCE'
      ? 'Boutique E-commerce'
      : 'Vendeur Pro'

  // Load orders count initially from local stores
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      let count = 0
      const clientOrders = getClientOrders()
      if (clientOrders) {
        count += clientOrders.filter((o) => !o.status || o.status === 'PENDING').length
      }

      const realOrdersKey = `dzora_seller_orders_${storeSlug}`
      const stored = localStorage.getItem(realOrdersKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          count += parsed.filter((o: any) => o.status === 'to_confirm').length
        }
      }
      setPendingOrdersCount(count)
    } catch {
      // Fallback
    }

    sellerProductsService.getProducts(storeDisplayName, storeSlug).then((prods) => {
      setStoreProductsCount(prods.length)
    }).catch(() => {})
  }, [storeDisplayName, storeSlug])

  const contextValue = useMemo<SellerContextType>(
    () => ({
      sellerStatus,
      sellerProfile,
      storeDisplayName,
      storeSlug,
      userPhone,
      userInitials,
      sellerTypeBadge,
      pendingOrdersCount,
      setPendingOrdersCount,
      storeProductsCount,
      setStoreProductsCount,
      searchQuery,
      setSearchQuery,
      showToast,
      toastMessage,
    }),
    [
      sellerStatus,
      sellerProfile,
      storeDisplayName,
      storeSlug,
      userPhone,
      userInitials,
      sellerTypeBadge,
      pendingOrdersCount,
      storeProductsCount,
      searchQuery,
      showToast,
      toastMessage,
    ]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pathname !== '/vendeur/dashboard') {
      router.push(`/vendeur/dashboard?tab=commandes&q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <SellerDashboardContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-[#F4FAF7] text-[#102A2A] antialiased">
        {/* ========================================================= */}
        {/* 1. LEFT FIXED SIDEBAR (Desktop 260px)                     */}
        {/* ========================================================= */}
        <aside
          aria-label="Navigation Espace Vendeur"
          className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-[#DCE8E3] bg-white transition-transform duration-200 lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Brand header */}
          <div className="flex h-16 items-center justify-between border-b border-[#DCE8E3] px-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/assets/dzoraLogo.webp"
                alt="Dzora"
                width={110}
                height={36}
                priority
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="rounded-lg bg-[#E7F2EF] px-2 py-0.5 text-[9px] font-extrabold tracking-[0.14em] text-[#006B55]">
                PRO
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-[#60716F] hover:bg-[#F4FAF7] lg:hidden"
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Current Store Preview Header in Sidebar */}
          <div className="border-b border-[#DCE8E3] bg-[#F7FBF9] p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#006B55] text-xs font-black text-white shadow-xs">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xs font-extrabold text-[#102A2A]">
                  {storeDisplayName}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full bg-[#008F72]" />
                  <span className="truncate text-[10px] font-semibold text-[#60716F]">
                    {sellerTypeBadge}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation list */}
          <nav
            aria-label="Menu principal vendeur"
            className="flex-1 space-y-1 overflow-y-auto px-3 py-3.5 text-xs font-semibold scrollbar-none"
          >
            {/* Vue d'ensemble */}
            <Link
              href="/vendeur/dashboard"
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition text-left ${
                pathname === '/vendeur/dashboard' && (!currentTab || currentTab === 'overview')
                  ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                  : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <LayoutDashboard
                size={17}
                className={
                  pathname === '/vendeur/dashboard' && (!currentTab || currentTab === 'overview')
                    ? 'text-[#006B55]'
                    : 'text-[#71827D]'
                }
              />
              <span>Vue d’ensemble</span>
            </Link>

            {/* Catalogue (Accordion) */}
            <div>
              <button
                type="button"
                onClick={() => setIsCatalogueOpen(!isCatalogueOpen)}
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Package size={17} className="text-[#71827D]" />
                  <span>Catalogue</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[#71827D] transition-transform duration-200 ${
                    isCatalogueOpen ? 'rotate-180 text-[#006B55]' : ''
                  }`}
                />
              </button>

              {isCatalogueOpen && (
                <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-[#DCE8E3] pl-3">
                  {CATALOG_ITEMS.map((sub) => {
                    const isActive =
                      sub.href === '/vendeur/produits'
                        ? pathname?.startsWith('/vendeur/produits') || (pathname === '/vendeur/dashboard' && currentTab === 'cat-produits')
                        : pathname === '/vendeur/dashboard' && currentTab === sub.tab
                    return (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11.5px] transition ${
                          isActive
                            ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                            : 'text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <sub.icon
                            size={13}
                            className={isActive ? 'text-[#006B55]' : 'text-[#889B95]'}
                          />
                          <span>{sub.label}</span>
                        </div>
                        {sub.badgeType === 'products' && storeProductsCount > 0 && (
                          <span className="text-[10px] font-bold text-[#006B55] bg-[#E7F2EF] px-1.5 py-0.5 rounded">
                            {storeProductsCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Main Navigation Items */}
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === '/vendeur/dashboard' && currentTab === item.tab
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition text-left ${
                    isActive
                      ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                      : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={17}
                      className={isActive ? 'text-[#006B55]' : 'text-[#71827D]'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badgeType === 'orders' && pendingOrdersCount > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-[#006B55] text-[10px] font-bold text-white">
                      {pendingOrdersCount}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Abonnement PRO (Independent Page Link) */}
            <Link
              href="/vendeur/abonnement"
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition text-left ${
                isAbonnementActive
                  ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                  : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles size={17} className="text-[#006B55]" />
                <span>Abonnement PRO</span>
              </div>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                  isAbonnementActive
                    ? 'bg-[#006B55] text-white'
                    : 'bg-[#E7F2EF] text-[#006B55]'
                }`}
              >
                PRO
              </span>
            </Link>

            {/* Paramètres */}
            <Link
              href="/vendeur/dashboard?tab=parametres"
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition text-left ${
                pathname === '/vendeur/dashboard' && currentTab === 'parametres'
                  ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                  : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings
                  size={17}
                  className={
                    pathname === '/vendeur/dashboard' && currentTab === 'parametres'
                      ? 'text-[#006B55]'
                      : 'text-[#71827D]'
                  }
                />
                <span>Paramètres</span>
              </div>
            </Link>
          </nav>

          {/* Sidebar Footer Links */}
          <div className="border-t border-[#DCE8E3] p-3.5 space-y-2">
            <Link
              href={storeSlug ? `/vendeur/${storeSlug}` : '/vendeur/techno-blida'}
              target="_blank"
              className="flex items-center justify-between rounded-xl border border-[#CCE2DB] bg-[#EDF7F4] px-3 py-2.5 text-xs font-bold text-[#006B55] transition hover:bg-[#E0F0EB]"
            >
              <span className="flex items-center gap-2">
                <Store size={14} />
                Voir ma vitrine
              </span>
              <ExternalLink size={12} className="text-[#008F72]" />
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E5EEEB] bg-white px-3 py-2 text-xs font-semibold text-[#60716F] transition hover:bg-[#F4FAF7] hover:text-[#102A2A]"
            >
              <span>Retour au marketplace</span>
            </Link>
          </div>
        </aside>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div
            role="presentation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ========================================================= */}
        {/* 2. MAIN WORKSPACE LAYOUT (FULL WIDTH)                     */}
        {/* ========================================================= */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px] w-full">
          {/* Top Bar (Full Width) */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#DCE8E3] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 2xl:px-10 w-full">
            <div className="flex flex-1 items-center gap-3">
              {/* Mobile menu trigger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="grid size-9 place-items-center rounded-xl border border-[#DCE8E3] text-[#006B55] hover:bg-[#F4FAF7] lg:hidden cursor-pointer"
                aria-label="Ouvrir le menu latéral"
              >
                <Menu size={18} />
              </button>

              {/* Wide Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A4A0]"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une commande, un produit, un client, une wilaya…"
                  className="h-10 w-full rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] pl-10 pr-4 text-xs font-medium text-[#102A2A] placeholder:text-[#71827D] outline-none transition focus:border-[#008F72] focus:bg-white focus:ring-2 focus:ring-[#008F72]/15"
                />
              </form>
            </div>

            {/* Right Topbar actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Link to Store */}
              <Link
                href={storeSlug ? `/vendeur/${storeSlug}` : '/vendeur/techno-blida'}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8E3] px-3 py-1.5 text-xs font-bold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55] transition"
              >
                <Store size={14} className="text-[#006B55]" />
                <span>Vitrine en ligne</span>
              </Link>

              {/* Help */}
              <button
                type="button"
                onClick={() => showToast('Centre d’assistance Dzora Vendeur : Support disponible 7j/7')}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#006B55] cursor-pointer"
              >
                <HelpCircle size={16} className="text-[#006B55]" />
                <span className="hidden sm:inline">Aide</span>
              </button>

              {/* Notification bell */}
              <button
                type="button"
                onClick={() =>
                  showToast(
                    pendingOrdersCount > 0
                      ? `Vous avez ${pendingOrdersCount} commande(s) en attente de confirmation.`
                      : 'Aucune notification urgente.'
                  )
                }
                className="relative grid size-9 place-items-center rounded-xl text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#006B55] cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {pendingOrdersCount > 0 && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-[#F28C28] ring-2 ring-white" />
                )}
              </button>

              <div className="h-5 w-px bg-[#DCE8E3]" />

              {/* Seller Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 rounded-xl p-1.5 text-left transition hover:bg-[#F4FAF7] cursor-pointer"
                  aria-expanded={isProfileMenuOpen}
                >
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#006B55] text-xs font-bold text-white shadow-xs">
                    {userInitials[0]}
                  </div>
                  <div className="hidden text-left min-[480px]:block">
                    <p className="max-w-[150px] truncate text-xs font-bold text-[#102A2A]">
                      {storeDisplayName}
                    </p>
                    <p className="text-[10px] font-medium text-[#60716F]">
                      {sellerStatus?.isApproved ? 'Vendeur vérifié' : 'Compte Pro actif'}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-[#94A4A0]" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-[#DCE8E3] bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="border-b border-[#E8F0ED] p-2.5 bg-[#F7FAF9] rounded-xl mb-1">
                      <p className="truncate text-xs font-bold text-[#102A2A]">{storeDisplayName}</p>
                      <p className="truncate text-[11px] font-mono text-[#60716F]">
                        {userPhone || user?.email || 'Vendeur Dzora'}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-block size-1.5 rounded-full bg-[#008F72]" />
                        <span className="text-[10px] font-bold text-[#006B55]">
                          {sellerTypeBadge}
                        </span>
                      </div>
                    </div>
                    <div className="py-1 space-y-0.5">
                      <Link
                        href={storeSlug ? `/vendeur/${storeSlug}` : '/vendeur/techno-blida'}
                        target="_blank"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55]"
                      >
                        <Store size={14} className="text-[#006B55]" />
                        Voir ma vitrine publique
                      </Link>
                      <Link
                        href="/vendeur/dashboard?tab=parametres"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55]"
                      >
                        <Settings size={14} className="text-[#006B55]" />
                        Paramètres du compte
                      </Link>
                      <Link
                        href="/vendeur/securite"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55]"
                      >
                        <ShieldCheck size={14} className="text-[#006B55]" />
                        Sécurité & 2FA
                      </Link>
                    </div>
                    <div className="border-t border-[#E8F0ED] pt-1 mt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsProfileMenuOpen(false)
                          await logout()
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut size={14} />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full">
            {children}
          </main>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-[#CCE2DB] bg-white px-4 py-3 text-xs font-bold text-[#102A2A] shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="grid size-5 place-items-center rounded-full bg-[#006B55] text-white">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </SellerDashboardContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Exported Shell                             */
/* -------------------------------------------------------------------------- */

export function SellerLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4FAF7] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
          <p className="text-sm font-bold text-[#102A2A]">Chargement de votre espace Vendeur…</p>
        </div>
      }
    >
      <SellerLayoutShellContent>{children}</SellerLayoutShellContent>
    </Suspense>
  )
}
