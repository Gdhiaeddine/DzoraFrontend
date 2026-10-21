'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Store,
  FolderTree,
  ShoppingBag,
  CreditCard,
  Wallet,
  Receipt,
  Truck,
  Megaphone,
  Star,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  HelpCircle,
  Calendar,
  X,
  Menu,
  ExternalLink,
} from 'lucide-react'

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({
    sellers: !pathname?.startsWith('/admin/dashboard/vendeurs'),
    catalog: true,
    finance: true,
    support: true,
    admin: true,
  })

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isUsersActive = pathname?.startsWith('/admin/dashboard/utilisateurs')
  const isSellersActive = pathname?.startsWith('/admin/dashboard/vendeurs')
  const isAllSellersActive = pathname === '/admin/dashboard/vendeurs'
  const isCommandesActive = pathname?.startsWith('/admin/dashboard/commandes')
  const isAbonnementsActive = pathname?.startsWith('/admin/dashboard/abonnements')
  const isSettingsActive =
    pathname?.startsWith('/admin/dashboard/parametres') ||
    pathname?.startsWith('/admin/dashboard/settings')
  const isDashboardActive = pathname === '/admin/dashboard'

  return (
    <div className="min-h-screen bg-[#F4F8F6] text-[#102A2A] flex flex-col lg:flex-row selection:bg-[#006B55]/20 selection:text-[#006B55]">
      {/* ========================================================= */}
      {/* 1. FIXED LEFT SIDEBAR (240px wide)                        */}
      {/* ========================================================= */}
      {sidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        aria-label="Navigation principale administrateur Dzora"
        className={`fixed top-0 bottom-0 left-0 w-[240px] bg-white border-r border-[#DCE8E3] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#DCE8E3]">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/assets/dzoraLogo.webp"
                alt="Dzora"
                width={124}
                height={44}
                priority
                className="h-8.5 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                ADMIN
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#71827D] hover:text-[#102A2A] p-1.5 rounded-lg hover:bg-[#F4FAF7]"
              aria-label="Fermer le menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links Scrollable Area */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-none text-xs">
            {/* Tableau de bord */}
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                isDashboardActive
                  ? 'font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]/60 shadow-[0_1px_4px_rgba(0,107,85,0.06)]'
                  : 'font-medium text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <LayoutDashboard className={`h-4 w-4 shrink-0 ${isDashboardActive ? 'text-[#006B55]' : 'text-[#71827D]'}`} />
              <span className="font-display">Tableau de bord</span>
            </Link>

            {/* Utilisateurs */}
            <Link
              href="/admin/dashboard/utilisateurs"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                isUsersActive
                  ? 'font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]/60 shadow-[0_1px_4px_rgba(0,107,85,0.06)]'
                  : 'font-medium text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <Users className={`h-4 w-4 shrink-0 ${isUsersActive ? 'text-[#006B55]' : 'text-[#71827D]'}`} />
              <span className="font-display">Utilisateurs</span>
            </Link>

            {/* Vendeurs (Collapsible Group) */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('sellers')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium text-left ${
                  isSellersActive
                    ? 'font-bold bg-[#E7F2EF]/60 text-[#006B55]'
                    : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Store className={`h-4 w-4 shrink-0 ${isSellersActive ? 'text-[#006B55]' : 'text-[#71827D]'}`} />
                  <span>Vendeurs</span>
                </div>
                {collapsedGroups.sellers ? (
                  <ChevronRight className="h-3.5 w-3.5 text-[#9CAFA9]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[#006B55]" />
                )}
              </button>
              {!collapsedGroups.sellers && (
                <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-[#DCE8E3] pl-3 py-0.5">
                  <Link
                    href="/admin/dashboard/vendeurs"
                    className={`block py-1.5 text-[11.5px] transition ${
                      isAllSellersActive
                        ? 'font-bold text-[#006B55]'
                        : 'font-medium text-[#60716F] hover:text-[#006B55]'
                    }`}
                  >
                    Tous les vendeurs
                  </Link>
                  <div className="flex items-center justify-between py-1.5 text-[11.5px] font-bold text-[#102A2A] hover:text-[#006B55] cursor-pointer transition">
                    <span>Vérification</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                      87
                    </span>
                  </div>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Suspendus
                  </span>
                  <Link
                    href="/admin/dashboard/abonnements?tab=plans"
                    className={`block py-1.5 text-[11.5px] transition ${
                      isAbonnementsActive
                        ? 'font-bold text-[#006B55]'
                        : 'font-medium text-[#60716F] hover:text-[#006B55]'
                    }`}
                  >
                    Plans vendeurs
                  </Link>
                </div>
              )}
            </div>

            {/* Catalogue (Collapsible Group) */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('catalog')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
              >
                <div className="flex items-center gap-3">
                  <FolderTree className="h-4 w-4 shrink-0 text-[#71827D]" />
                  <span>Catalogue</span>
                </div>
                {collapsedGroups.catalog ? (
                  <ChevronRight className="h-3.5 w-3.5 text-[#9CAFA9]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[#006B55]" />
                )}
              </button>
              {!collapsedGroups.catalog && (
                <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-[#DCE8E3] pl-3 py-0.5">
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Produits
                  </span>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Catégories
                  </span>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Marques
                  </span>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Signalements
                  </span>
                </div>
              )}
            </div>

            {/* Commandes */}
            <Link
              href="/admin/dashboard/commandes"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                isCommandesActive
                  ? 'font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]/60 shadow-[0_1px_4px_rgba(0,107,85,0.06)]'
                  : 'font-medium text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <ShoppingBag className={`h-4 w-4 shrink-0 ${isCommandesActive ? 'text-[#006B55]' : 'text-[#71827D]'}`} />
              <span className="font-display">Commandes</span>
            </Link>

            {/* Paiements */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
            >
              <CreditCard className="h-4 w-4 shrink-0 text-[#71827D]" />
              <span>Paiements</span>
            </button>

            {/* Finance (Collapsible Group) */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('finance')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 shrink-0 text-[#71827D]" />
                  <span>Finance</span>
                </div>
                {collapsedGroups.finance ? (
                  <ChevronRight className="h-3.5 w-3.5 text-[#9CAFA9]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[#006B55]" />
                )}
              </button>
              {!collapsedGroups.finance && (
                <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-[#DCE8E3] pl-3 py-0.5">
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Commissions
                  </span>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Versements
                  </span>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Remboursements
                  </span>
                </div>
              )}
            </div>

            {/* Abonnements */}
            <Link
              href="/admin/dashboard/abonnements"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                isAbonnementsActive
                  ? 'font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]/60 shadow-[0_1px_4px_rgba(0,107,85,0.06)]'
                  : 'font-medium text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <Receipt className={`h-4 w-4 shrink-0 ${isAbonnementsActive ? 'text-[#006B55]' : 'text-[#71827D]'}`} />
              <span className="font-display">Abonnements</span>
            </Link>

            {/* Livraison */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
            >
              <Truck className="h-4 w-4 shrink-0 text-[#71827D]" />
              <span>Livraison</span>
            </button>

            {/* Marketing */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
            >
              <Megaphone className="h-4 w-4 shrink-0 text-[#71827D]" />
              <span>Marketing</span>
            </button>

            {/* Avis */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
            >
              <Star className="h-4 w-4 shrink-0 text-[#71827D]" />
              <span>Avis</span>
            </button>

            {/* Support (Collapsible Group) */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('support')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
              >
                <div className="flex items-center gap-3">
                  <LifeBuoy className="h-4 w-4 shrink-0 text-[#71827D]" />
                  <span>Support</span>
                </div>
                {collapsedGroups.support ? (
                  <ChevronRight className="h-3.5 w-3.5 text-[#9CAFA9]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[#006B55]" />
                )}
              </button>
              {!collapsedGroups.support && (
                <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-[#DCE8E3] pl-3 py-0.5">
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Tickets
                  </span>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Litiges
                  </span>
                </div>
              )}
            </div>

            {/* Analytique */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
            >
              <BarChart3 className="h-4 w-4 shrink-0 text-[#71827D]" />
              <span>Analytique</span>
            </button>

            {/* Administration (Collapsible Group) */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('admin')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A] transition font-medium text-left"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#71827D]" />
                  <span>Administration</span>
                </div>
                {collapsedGroups.admin ? (
                  <ChevronRight className="h-3.5 w-3.5 text-[#9CAFA9]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[#006B55]" />
                )}
              </button>
              {!collapsedGroups.admin && (
                <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-[#DCE8E3] pl-3 py-0.5">
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Admins
                  </span>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Rôles et permissions
                  </span>
                  <span className="block py-1.5 text-[11.5px] font-medium text-[#60716F] hover:text-[#006B55] cursor-pointer transition">
                    Journal d’audit
                  </span>
                </div>
              )}
            </div>

            {/* Paramètres */}
            <Link
              href="/admin/dashboard/parametres"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                isSettingsActive
                  ? 'font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]/60 shadow-[0_1px_4px_rgba(0,107,85,0.06)]'
                  : 'font-medium text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <Settings className={`h-4 w-4 shrink-0 ${isSettingsActive ? 'text-[#006B55]' : 'text-[#71827D]'}`} />
              <span className="font-display">Paramètres</span>
            </Link>
          </nav>

          {/* Bottom Sidebar Action: Link to live marketplace */}
          <div className="p-3 border-t border-[#DCE8E3] bg-[#F7FAF9]">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between text-xs font-bold text-[#006B55] p-2.5 rounded-xl bg-[#EDF7F4] border border-[#CCE2DB] hover:bg-[#E0F0EB] transition"
            >
              <span className="flex items-center gap-2">
                <Store className="h-3.5 w-3.5 text-[#008F72]" />
                <span>Boutique en direct</span>
              </span>
              <ExternalLink className="h-3 w-3 text-[#008F72]" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE CONTAINER (OFFSET BY 240px)             */}
      {/* ========================================================= */}
      <div className="flex-1 lg:pl-[240px] flex flex-col min-w-0">
        {/* --- Shared Slim Top Bar --- */}
        <header className="h-16 bg-white/95 border-b border-[#DCE8E3] backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Hamburger toggle on mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#4A5D58] hover:text-[#102A2A] p-1.5 rounded-xl hover:bg-[#F4FAF7] transition"
              aria-label="Ouvrir le menu latéral"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A4A0] pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher utilisateurs, vendeurs, commandes…"
                className="w-full pl-10 pr-3 py-2 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] placeholder:text-[#71827D] focus:bg-white focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 outline-none transition"
              />
            </div>
          </div>

          {/* Top Bar Actions & Super Admin Profile */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Current Date */}
            <span className="text-xs text-[#60716F] font-semibold hidden md:inline-flex items-center gap-1.5 bg-[#F7FAF9] px-2.5 py-1.5 rounded-xl border border-[#DCE8E3]">
              <Calendar className="h-3.5 w-3.5 text-[#006B55]" />
              <span>06 octobre 2026</span>
            </span>

            {/* Notifications Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-2 text-[#60716F] hover:text-[#006B55] rounded-xl hover:bg-[#F4FAF7] transition"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#F28C28] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                8
              </span>
            </button>

            {/* Super Admin Profile Pill & 2FA Badge */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#DCE8E3]">
              <div className="w-8.5 h-8.5 rounded-full bg-[#006B55] text-white flex items-center justify-center text-xs font-extrabold shadow-xs shrink-0 ring-2 ring-[#E7F2EF]">
                AB
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#102A2A] leading-tight">
                  Ahmed Benali
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-[#60716F]">
                    Super Admin
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006B55] animate-pulse" />
                    2FA actif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page children wrapped inside main */}
        {children}
      </div>
    </div>
  )
}
