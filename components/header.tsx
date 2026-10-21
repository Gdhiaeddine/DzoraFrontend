'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowRight,
  ChevronDown,
  CircleUserRound,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserRound,
  X,
} from 'lucide-react'
import { Logo } from './logo'
import { AlgeriaFlag } from './algeria-flag'
import { useCart } from './cart-context'
import { useFavorites } from './favorites-context'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { SignInDialog } from './sign-in-dialog'
import { CategoryMegaMenu } from './category-mega-menu'
import { CATEGORIES_DETAILED } from '@/lib/categories'

function formatPhoneDisplay(raw?: string | null): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return raw
  if (digits.startsWith('213')) {
    return `+${digits}`
  }
  if (digits.startsWith('0')) {
    return `+213${digits.slice(1)}`
  }
  if (digits.length === 9) {
    return `+213${digits}`
  }
  return raw.startsWith('+') ? raw : `+${raw}`
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [signInInitialTab, setSignInInitialTab] = useState<'login' | 'signup'>('login')
  const [sellerStatus, setSellerStatus] = useState<{
    hasProfile: boolean;
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null;
    type?: 'PHYSICAL_STORE' | 'ECOMMERCE' | null;
    isApproved: boolean;
    storeName: string | null;
    slug: string | null;
  } | null>(null)
  const [mobileCategoriesExpanded, setMobileCategoriesExpanded] = useState(false)
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null)

  const signInButtonRef = useRef<HTMLButtonElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { cartCount, user: cartUser } = useCart()
  const { favoritesCount } = useFavorites()
  const { user: authUser, logout } = useAuth()
  const currentUser = authUser || cartUser
  const pathname = usePathname()
  const router = useRouter()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`)
    } else {
      router.push('/products')
    }
  }

  // Fetch seller status if user has SELLER role or is logged in
  useEffect(() => {
    let isCancelled = false
    if (!currentUser) {
      setSellerStatus(null)
      return
    }

    api.seller
      .getStatus()
      .then((res) => {
        if (!isCancelled && res) {
          setSellerStatus(res)
        }
      })
      .catch(() => {
        // Guest or non-seller
        if (!isCancelled) {
          setSellerStatus(null)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [currentUser?.id, currentUser?.roles])

  const formattedPhone = formatPhoneDisplay(currentUser?.phone)

  const username =
    currentUser?.firstName ||
    (currentUser?.fullName ? currentUser.fullName.split(' ')[0] : null) ||
    sellerStatus?.storeName ||
    (currentUser?.email ? currentUser.email.split('@')[0] : null) ||
    'Client'

  const userFullName =
    currentUser?.fullName ||
    (currentUser?.firstName
      ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
      : null) ||
    sellerStatus?.storeName ||
    username

  const isAdmin =
    Boolean(currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('SUPER_ADMIN'))

  const isSuperAdmin = Boolean(currentUser?.roles?.includes('SUPER_ADMIN'))

  const isSeller =
    currentUser?.roles?.includes('SELLER') ||
    sellerStatus?.isApproved ||
    sellerStatus?.status === 'APPROVED'

  const isPendingSeller =
    sellerStatus?.status === 'PENDING' ||
    sellerStatus?.status === 'UNDER_REVIEW'

  const sellerTypeLabel =
    sellerStatus?.type === 'PHYSICAL_STORE'
      ? 'Magasin Physique'
      : sellerStatus?.type === 'ECOMMERCE'
      ? 'Boutique E-commerce'
      : 'Vendeur Vérifié'

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setUserMenuOpen(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false)
    }, 180)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const isVendeursLocaux = pathname?.startsWith('/vendeur')

  const handleCartClick = () => {
    const msg =
      cartCount > 0
        ? `${cartCount} article${cartCount > 1 ? 's' : ''} dans votre panier.`
        : 'Votre panier est vide.'
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(''), 2500)
  }

  // Global listener for any element with data-open-login or CustomEvent 'dzora:open-login'
  useEffect(() => {
    const handleGlobalOpen = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-open-login]')
      if (target) {
        e.preventDefault()
        const tab = target.getAttribute('data-auth-tab') === 'signup' ? 'signup' : 'login'
        setSignInInitialTab(tab)
        setIsSignInOpen(true)
      }
    }

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ tab?: 'login' | 'signup' }>
      setSignInInitialTab(custom?.detail?.tab === 'signup' ? 'signup' : 'login')
      setIsSignInOpen(true)
    }

    document.addEventListener('click', handleGlobalOpen)
    window.addEventListener('dzora:open-login', handleCustomEvent)
    return () => {
      document.removeEventListener('click', handleGlobalOpen)
      window.removeEventListener('dzora:open-login', handleCustomEvent)
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E8F0ED] bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[84px] sm:h-[92px] md:h-[96px] items-center gap-5">
            <button
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid size-10 place-items-center rounded-xl border border-[#E5EEEB] text-[#006B55] lg:hidden"
            >
              {menuOpen ? <X size={19} /> : <Menu size={20} />}
            </button>
            <Logo />
            <form onSubmit={handleSearchSubmit} className="relative hidden max-w-[670px] flex-1 lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A4A0]" size={19} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit, une marque, une catégorie…"
                className="h-11 w-full rounded-xl border border-[#D9E7E2] bg-[#F7FAF9] pl-11 pr-12 text-sm outline-none transition focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/10"
              />
              <button
                type="submit"
                aria-label="Rechercher"
                className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-lg bg-[#006B55] text-white transition hover:bg-[#008F72] cursor-pointer"
              >
                <Search size={16} />
              </button>
            </form>
            <div className="ml-auto flex items-center gap-4 text-[#102A2A]">
              {/* Trigger for Sign-in Dialog or Account Popover */}
              {currentUser ? (
                <div
                  className="relative hidden lg:block"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="group flex cursor-pointer items-center gap-2.5 rounded-xl p-1.5 text-left transition-all duration-200 hover:bg-[#E7F2EF]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B55]"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[#006B55] text-xs font-bold text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
                      {username[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold leading-tight text-[#102A2A] transition-colors duration-200 group-hover:text-[#006B55]">
                        Bonjour, {username}
                      </span>
                      <span className="text-[11px] font-normal text-[#60716F]">
                        {isAdmin
                          ? (isSuperAdmin ? 'Super Admin' : 'Administrateur')
                          : isSeller
                          ? (sellerStatus?.storeName || 'Espace Vendeur')
                          : isPendingSeller
                          ? 'Demande en cours'
                          : 'Mon compte'}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 group-hover:text-[#006B55] ${
                        userMenuOpen ? 'rotate-180 text-[#006B55]' : ''
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 w-72 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl shadow-slate-900/10 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* User Info Header */}
                      <div className="border-b border-slate-100 p-3 bg-slate-50/70 rounded-xl mb-1">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#006B55] text-sm font-bold text-white">
                            {username[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {userFullName}
                            </p>
                            <p className="truncate text-[11px] font-medium text-slate-600 font-mono">
                              {formattedPhone || currentUser.email || 'Connecté'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#006B55]/10 border border-[#006B55]/20 px-2 py-0.5 text-[10px] font-bold text-[#006B55]">
                              <ShieldCheck size={11} className="text-[#006B55]" />
                              <span>{isSuperAdmin ? 'Super Admin Dzora' : 'Administrateur Dzora'}</span>
                            </span>
                          ) : isSeller ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#E7F2EF] px-2 py-0.5 text-[10px] font-bold text-[#006B55]">
                              <Store size={11} />
                              <span>{sellerTypeLabel}</span>
                            </span>
                          ) : isPendingSeller ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              <Store size={11} />
                              <span>En attente de validation</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              Client Dzora
                            </span>
                          )}
                          {sellerStatus?.storeName && sellerStatus.storeName !== userFullName && (
                            <span className="truncate rounded-md bg-white border border-[#DCE8E3] px-1.5 py-0.5 text-[10px] font-semibold text-[#006B55]">
                              {sellerStatus.storeName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu Navigation Links */}
                      <div className="py-1 space-y-0.5">
                        {isAdmin && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold bg-[#E7F2EF] text-[#006B55] transition-colors hover:bg-[#D5EAE2]"
                          >
                            <div className="flex items-center gap-2.5">
                              <LayoutDashboard size={15} className="text-[#006B55]" />
                              <span>Panneau d’administration</span>
                            </div>
                            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-[#006B55] text-white px-1.5 py-0.5 rounded">
                              Admin
                            </span>
                          </Link>
                        )}

                        {isSeller && !isAdmin && (
                          <Link
                            href="/vendeur/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold bg-[#E7F2EF]/80 text-[#006B55] transition-colors hover:bg-[#D5EAE2]"
                          >
                            <div className="flex items-center gap-2.5">
                              <LayoutDashboard size={15} className="text-[#006B55]" />
                              <span>Tableau de bord Vendeur</span>
                            </div>
                            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-[#006B55] text-white px-1.5 py-0.2 rounded">
                              Pro
                            </span>
                          </Link>
                        )}

                        {!isAdmin && !isSeller && (
                          <Link
                            href="/account/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#E7F2EF]/60 hover:text-[#006B55]"
                          >
                            <div className="flex items-center gap-2.5">
                              <UserRound size={15} className="text-[#006B55]" />
                              <span>Mon compte & Paramètres</span>
                            </div>
                          </Link>
                        )}

                        <Link
                          href="/favoris"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#E7F2EF]/60 hover:text-[#006B55]"
                        >
                          <div className="flex items-center gap-2.5">
                            <Heart size={15} className="text-[#006B55]" />
                            <span>Mes favoris</span>
                          </div>
                          {favoritesCount > 0 && (
                            <span className="rounded-full bg-[#006B55] px-2 py-0.5 text-[10px] font-bold text-white">
                              {favoritesCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/panier"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#E7F2EF]/60 hover:text-[#006B55]"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShoppingCart size={15} className="text-[#006B55]" />
                            <span>Mon panier</span>
                          </div>
                          {cartCount > 0 && (
                            <span className="rounded-full bg-[#006B55] px-2 py-0.5 text-[10px] font-bold text-white">
                              {cartCount}
                            </span>
                          )}
                        </Link>

                        {isAdmin ? null : isSeller ? (
                          sellerStatus?.slug ? (
                            <Link
                              href={`/vendeur/${sellerStatus.slug}`}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#E7F2EF]/60 hover:text-[#006B55]"
                            >
                              <Store size={15} className="text-[#006B55]" />
                              <span>Voir ma boutique</span>
                            </Link>
                          ) : null
                        ) : isPendingSeller ? (
                          <Link
                            href="/devenir-vendeur/creer"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#E7F2EF]/60 hover:text-[#006B55]"
                          >
                            <Store size={15} className="text-[#006B55]" />
                            <span>Suivre ma demande</span>
                          </Link>
                        ) : (
                          <Link
                            href="/devenir-vendeur"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#E7F2EF]/60 hover:text-[#006B55]"
                          >
                            <Store size={15} className="text-[#006B55]" />
                            <span>Devenir Vendeur</span>
                          </Link>
                        )}

                        <Link
                          href={isAdmin ? "/admin/dashboard/parametres?tab=security" : "/vendeur/securite"}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#E7F2EF]/60 hover:text-[#006B55]"
                        >
                          <ShieldCheck size={15} className="text-[#006B55]" />
                          <span>Sécurité & 2FA</span>
                        </Link>
                      </div>

                      {/* Logout Action */}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            setUserMenuOpen(false)
                            await logout()
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          <LogOut size={15} />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  ref={signInButtonRef}
                  type="button"
                  data-open-login="true"
                  onClick={() => setIsSignInOpen(true)}
                  className="group hidden cursor-pointer items-center gap-2 text-left transition-colors duration-200 lg:flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B55] rounded-lg p-1"
                >
                  <CircleUserRound className="text-[#006B55] transition-colors duration-200 group-hover:text-[#008F72]" size={22} />
                  <span className="text-xs font-semibold leading-4 text-[#102A2A] transition-colors duration-200 group-hover:text-[#006B55]">
                    Se connecter<br />
                    <span className="font-normal text-[#60716F] transition-colors duration-200 group-hover:text-[#008F72]">/ S&apos;inscrire</span>
                  </span>
                </button>
              )}

              <Link
                href="/panier"
                aria-label="Panier"
                className="relative flex items-center gap-2 group"
              >
                <ShoppingCart size={22} className="text-[#006B55] transition group-hover:text-[#008F72]" />
                <span className="hidden text-xs font-semibold lg:block text-[#102A2A] transition group-hover:text-[#006B55]">Panier</span>
                <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#F28C28] text-[9px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              </Link>
              <span className="hidden items-center gap-1.5 border-l border-[#E5EEEB] pl-3 text-xs font-bold text-[#60716F] sm:flex select-none">
                <AlgeriaFlag className="h-3 w-4.5 rounded-[2px] shadow-2xs border border-black/10" />
                <span>FR</span>
              </span>
            </div>
          </div>
          <form onSubmit={handleSearchSubmit} className="relative pb-3 lg:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A4A0]" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit, une marque, une catégorie…"
              className="h-10 w-full rounded-xl border border-[#D9E7E2] bg-[#F7FAF9] pl-10 pr-4 text-sm outline-none"
            />
          </form>
        </div>
        {menuOpen && (
          <div className="border-t border-[#E8F0ED] bg-white px-5 py-4 lg:hidden">
            <nav className="flex flex-col gap-4 text-sm font-semibold">
              {currentUser ? (
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#006B55] text-xs font-bold text-white">
                        {username[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{userFullName}</p>
                        <p className="text-[10px] font-medium text-slate-600 font-mono">
                          {formattedPhone || currentUser.email || 'Connecté'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuOpen(false)
                        await logout()
                      }}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut size={13} />
                      <span>Déconnexion</span>
                    </button>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#006B55]/10 border border-[#006B55]/20 px-2 py-0.5 text-[10px] font-bold text-[#006B55]">
                        <ShieldCheck size={11} className="text-[#006B55]" />
                        <span>{isSuperAdmin ? 'Super Admin Dzora' : 'Administrateur Dzora'}</span>
                      </span>
                    ) : isSeller ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E7F2EF] px-2 py-0.5 text-[10px] font-bold text-[#006B55]">
                        <Store size={11} />
                        <span>{sellerTypeLabel}</span>
                      </span>
                    ) : isPendingSeller ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <Store size={11} />
                        <span>En attente de validation</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Client Dzora
                      </span>
                    )}
                    {sellerStatus?.storeName && sellerStatus.storeName !== userFullName && (
                      <span className="truncate rounded-md bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-[#006B55]">
                        {sellerStatus.storeName}
                      </span>
                    )}
                  </div>

                  {isAdmin ? (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="mt-3 flex items-center justify-between rounded-xl bg-[#E7F2EF] px-3 py-2 text-xs font-bold text-[#006B55]"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard size={15} />
                        <span>Panneau d’administration</span>
                      </div>
                      <span className="rounded bg-[#006B55] px-1.5 py-0.5 text-[9px] text-white">ADMIN</span>
                    </Link>
                  ) : isSeller ? (
                    <Link
                      href="/vendeur/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="mt-3 flex items-center justify-between rounded-xl bg-[#E7F2EF] px-3 py-2 text-xs font-bold text-[#006B55]"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard size={15} />
                        <span>Tableau de bord Vendeur</span>
                      </div>
                      <span className="rounded bg-[#006B55] px-1.5 py-0.5 text-[9px] text-white">PRO</span>
                    </Link>
                  ) : null}

                  {!isAdmin && !isSeller && (
                    <Link
                      href="/account/settings"
                      onClick={() => setMenuOpen(false)}
                      className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <UserRound size={15} className="text-[#006B55]" />
                        <span>Mon compte & Paramètres</span>
                      </div>
                    </Link>
                  )}

                  <Link
                    href="/favoris"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <Heart size={15} className="text-[#006B55]" />
                      <span>Mes favoris</span>
                    </div>
                    {favoritesCount > 0 && (
                      <span className="rounded-full bg-[#006B55] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  data-open-login="true"
                  onClick={() => {
                    setMenuOpen(false)
                    setIsSignInOpen(true)
                  }}
                  className="flex cursor-pointer items-center gap-2 text-left font-bold text-[#006B55] transition-colors hover:text-[#008F72]"
                >
                  <CircleUserRound size={18} />
                  <span>Se connecter / S&apos;inscrire</span>
                </button>
              )}
              {isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="text-[#006B55] font-bold flex items-center gap-2"
                >
                  <LayoutDashboard size={16} />
                  <span>Accéder au panneau d’administration</span>
                </Link>
              ) : isSeller ? (
                sellerStatus?.slug ? (
                  <Link
                    href={`/vendeur/${sellerStatus.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-[#006B55] font-bold flex items-center gap-2"
                  >
                    <Store size={16} />
                    <span>Voir ma boutique</span>
                  </Link>
                ) : null
              ) : isPendingSeller ? (
                <Link href="/devenir-vendeur/creer" onClick={() => setMenuOpen(false)} className="text-amber-600 font-bold flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  <span>Suivre ma demande</span>
                </Link>
              ) : (
                <Link href="/devenir-vendeur" onClick={() => setMenuOpen(false)}>
                  Devenir vendeur
                </Link>
              )}
              <Link href={isAdmin ? "/admin/dashboard/parametres?tab=security" : "/vendeur/securite"} onClick={() => setMenuOpen(false)}>
                Sécurité & 2FA
              </Link>
              <div className="border-b border-[#F0F4F2] pb-2">
                <button
                  type="button"
                  onClick={() => setMobileCategoriesExpanded(!mobileCategoriesExpanded)}
                  className="flex w-full items-center justify-between text-left font-bold text-[#102A2A] hover:text-[#006B55] py-1"
                >
                  <span className="flex items-center gap-2">
                    <Menu size={16} className="text-[#006B55]" />
                    <span>Toutes les catégories</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      mobileCategoriesExpanded ? 'rotate-180 text-[#006B55]' : 'text-[#60716F]'
                    }`}
                  />
                </button>
                {mobileCategoriesExpanded && (
                  <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-[#DCE8E3] ml-1">
                    <Link
                      href="/products"
                      onClick={() => setMenuOpen(false)}
                      className="block text-xs font-bold text-[#006B55] py-1"
                    >
                      → Tout voir dans le catalogue
                    </Link>
                    {CATEGORIES_DETAILED.map((cat) => {
                      const isCatOpen = mobileExpandedCat === cat.name
                      return (
                        <div key={cat.name} className="py-1">
                          <button
                            type="button"
                            onClick={() =>
                              setMobileExpandedCat(isCatOpen ? null : cat.name)
                            }
                            className="flex w-full items-center justify-between text-xs font-semibold text-[#324B48] hover:text-[#006B55]"
                          >
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                            <ChevronDown
                              size={12}
                              className={`transition-transform duration-150 ${
                                isCatOpen ? 'rotate-180 text-[#006B55]' : 'text-[#859995]'
                              }`}
                            />
                          </button>
                          {isCatOpen && (
                            <div className="mt-1.5 space-y-1 pl-4 border-l border-[#E2EBE7] ml-1">
                              <Link
                                href={`/products?category=${encodeURIComponent(cat.name)}`}
                                onClick={() => setMenuOpen(false)}
                                className="block text-[11px] font-bold text-[#006B55] py-0.5"
                              >
                                Tous les produits {cat.name}
                              </Link>
                              {cat.subcategories.map((sub) => (
                                <Link
                                  key={sub.slug}
                                  href={`/products?category=${encodeURIComponent(
                                    cat.name
                                  )}&subCategory=${encodeURIComponent(sub.name)}`}
                                  onClick={() => setMenuOpen(false)}
                                  className="block text-[11px] text-[#526B67] hover:text-[#006B55] py-0.5"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <Link href="/" onClick={() => setMenuOpen(false)}>Promotions</Link>
              <Link
                href="/vendeur"
                onClick={() => setMenuOpen(false)}
                className={isVendeursLocaux ? 'text-[#006B55] font-bold' : ''}
              >
                Vendeurs locaux
              </Link>
              <Link href="/" onClick={() => setMenuOpen(false)}>Livraison rapide</Link>
              <Link href="/" onClick={() => setMenuOpen(false)}>Cash à la livraison</Link>
              <Link href="/" onClick={() => setMenuOpen(false)}>Nos engagements</Link>
            </nav>
          </div>
        )}
        <div className="hidden border-t border-[#F0F4F2] lg:block">
          <nav className="mx-auto flex h-11 max-w-[1440px] items-center gap-6 px-4 text-xs font-semibold text-[#60716F] sm:px-6 lg:px-8">
            <CategoryMegaMenu />
            <span className="text-[#D7E2DE]">|</span>
            <Link href="/" className="hover:text-[#006B55]">Promotions</Link>
            <Link
              href="/vendeur"
              className={isVendeursLocaux ? 'font-bold text-[#006B55]' : 'hover:text-[#006B55]'}
            >
              Vendeurs locaux
            </Link>
            <Link href="/" className="hover:text-[#006B55]">Livraison rapide</Link>
            <Link href="/" className="hover:text-[#006B55]">Cash à la livraison</Link>
            <Link href="/" className="hover:text-[#006B55]">Nos engagements</Link>
            <Link
              href="/devenir-vendeur"
              className="ml-auto text-[#006B55] transition-colors hover:text-[#008F72]"
            >
              Devenir vendeur <ArrowRight className="ml-1 inline" size={13} />
            </Link>
          </nav>
        </div>
        {toastMessage && (
          <div
            aria-live="polite"
            className="fixed bottom-16 sm:bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#173B36] px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
          >
            {toastMessage}
          </div>
        )}
      </header>

      {/* Shared Sign-in Dialog */}
      <SignInDialog
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        triggerRef={signInButtonRef}
        initialTab={signInInitialTab}
      />
    </>
  )
}
