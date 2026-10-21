'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import { SellerSubscriptionManager } from '@/components/seller/seller-subscription-manager'

function SellerSubscriptionPageContent() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

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

  const storeDisplayName =
    sellerStatus?.storeName ||
    sellerProfile?.storeName ||
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
    'Ma Boutique Dzora'

  const storeSlug = sellerStatus?.slug || sellerProfile?.slug || ''
  const userInitials = (storeDisplayName.slice(0, 2) || 'DZ').toUpperCase()
  const userPhone = user?.phone || sellerProfile?.phone || null

  const sellerTypeBadge =
    sellerStatus?.type === 'ECOMMERCE'
      ? 'E-commerce'
      : sellerStatus?.type === 'PHYSICAL_STORE'
      ? 'Boutique physique'
      : 'Vendeur Pro'

  return (
    <div className="flex min-h-screen bg-[#F4FAF7] text-[#102A2A] antialiased">
      {/* ------------------------------------------------------------------ */}
      {/* 1. Left Fixed Sidebar (Desktop 260px) - Matches /vendeur/dashboard */}
      {/* ------------------------------------------------------------------ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-[#DCE8E3] bg-white transition-transform duration-200 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
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
          aria-label="Navigation Espace Vendeur"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-3.5 text-xs font-semibold scrollbar-none"
        >
          {/* Vue d'ensemble */}
          <Link
            href="/vendeur/dashboard"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <LayoutDashboard size={17} className="text-[#71827D]" />
            <span>Vue d’ensemble</span>
          </Link>

          {/* Catalogue (Accordion) */}
          <div>
            <button
              type="button"
              onClick={() => setIsCatalogueOpen(!isCatalogueOpen)}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
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
                <Link
                  href="/vendeur/dashboard?tab=cat-produits"
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11.5px] text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
                >
                  <div className="flex items-center gap-2">
                    <Boxes size={13} className="text-[#889B95]" />
                    <span>Produits</span>
                  </div>
                </Link>
                <Link
                  href="/vendeur/dashboard?tab=cat-categories"
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11.5px] text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-[#889B95]" />
                    <span>Catégories</span>
                  </div>
                </Link>
                <Link
                  href="/vendeur/dashboard?tab=cat-inventaire"
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11.5px] text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-[#889B95]" />
                    <span>Inventaire & Stocks</span>
                  </div>
                </Link>
                <Link
                  href="/vendeur/dashboard?tab=cat-import-export"
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11.5px] text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpDown size={13} className="text-[#889B95]" />
                    <span>Import / Export</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Direct Section Links */}
          <Link
            href="/vendeur/dashboard?tab=commandes"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <ShoppingCart size={17} className="text-[#71827D]" />
            <span>Commandes</span>
          </Link>

          <Link
            href="/vendeur/dashboard?tab=boutique"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <Store size={17} className="text-[#71827D]" />
            <span>Ma boutique</span>
          </Link>

          <Link
            href="/vendeur/dashboard?tab=livraison"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <Truck size={17} className="text-[#71827D]" />
            <span>Expédition & Wilayas</span>
          </Link>

          <Link
            href="/vendeur/dashboard?tab=finance"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <CreditCard size={17} className="text-[#71827D]" />
            <span>Finance & Reversement</span>
          </Link>

          <Link
            href="/vendeur/dashboard?tab=marketing"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <Megaphone size={17} className="text-[#71827D]" />
            <span>Promotions</span>
          </Link>

          <Link
            href="/vendeur/dashboard?tab=analytique"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <BarChart3 size={17} className="text-[#71827D]" />
            <span>Analytique</span>
          </Link>

          <Link
            href="/vendeur/dashboard?tab=avis"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <Star size={17} className="text-[#71827D]" />
            <span>Avis clients</span>
          </Link>

          <Link
            href="/vendeur/dashboard?tab=messages"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <MessageSquare size={17} className="text-[#71827D]" />
            <span>Messages</span>
          </Link>

          {/* ACTIVE INDEPENDENT PAGE: Abonnement PRO */}
          <Link
            href="/vendeur/abonnement"
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 bg-[#E7F2EF] font-bold text-[#006B55] transition"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={17} className="text-[#006B55]" />
              <span>Abonnement PRO</span>
            </div>
            <span className="rounded-md bg-[#006B55] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
              PRO
            </span>
          </Link>

          {/* Paramètres */}
          <Link
            href="/vendeur/dashboard?tab=parametres"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition"
          >
            <Settings size={17} className="text-[#71827D]" />
            <span>Paramètres</span>
          </Link>
        </nav>

        {/* Sidebar Footer Link */}
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

      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. Main Workspace Layout (Matches /vendeur/dashboard Full Width)    */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px] w-full">
        {/* Top Bar (Full Width, Exact Replica of /vendeur/dashboard) */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#DCE8E3] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 2xl:px-10 w-full">
          <div className="flex flex-1 items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="grid size-9 place-items-center rounded-xl border border-[#DCE8E3] text-[#006B55] hover:bg-[#F4FAF7] lg:hidden"
              aria-label="Ouvrir le menu latéral"
            >
              <Menu size={18} />
            </button>

            {/* Wide Search Bar */}
            <div className="relative w-full max-w-lg">
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
            </div>
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
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#006B55]"
            >
              <HelpCircle size={16} className="text-[#006B55]" />
              <span className="hidden sm:inline">Aide</span>
            </button>

            {/* Notification bell */}
            <button
              type="button"
              onClick={() => showToast('Aucune notification urgente.')}
              className="relative grid size-9 place-items-center rounded-xl text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#006B55]"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="h-5 w-px bg-[#DCE8E3]" />

            {/* Seller Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl p-1.5 text-left transition hover:bg-[#F4FAF7]"
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
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55]"
                    >
                      <Store size={14} className="text-[#006B55]" />
                      Voir ma vitrine publique
                    </Link>
                    <Link
                      href="/vendeur/dashboard?tab=parametres"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55]"
                    >
                      <Settings size={14} className="text-[#006B55]" />
                      Paramètres du compte
                    </Link>
                    <Link
                      href="/vendeur/securite"
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
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
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

        {/* ------------------------------------------------------------------ */}
        {/* Main Content Area (FULL WIDTH, Exact Match to /vendeur/dashboard)  */}
        {/* ------------------------------------------------------------------ */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full space-y-6">
          <SellerSubscriptionManager storeName={storeDisplayName} />
        </main>
      </div>

      {/* Accessible Toast Notification */}
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
  )
}

export default function SellerSubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4FAF7] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
          <p className="text-sm font-bold text-[#102A2A]">Chargement de votre abonnement…</p>
        </div>
      }
    >
      <SellerSubscriptionPageContent />
    </Suspense>
  )
}
