'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  Star,
  Settings,
  MapPin,
  MessageSquare,
  UserPlus,
  Headphones,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

interface AccountNavProps {
  activeSlug?: string
  onSelectTab?: (slug: string) => void
}

const PRIMARY_LINKS = [
  { label: 'Vue d’ensemble', icon: LayoutDashboard, slug: 'overview' },
  { label: 'Commandes', icon: ShoppingBag, slug: 'commandes' },
  { label: 'Paiements', icon: CreditCard, slug: 'paiements' },
  { label: 'Retours & remboursements', icon: RotateCcw, slug: 'retours' },
  { label: 'Avis', icon: Star, slug: 'avis' },
  { label: 'Paramètres', icon: Settings, slug: 'settings' },
  { label: 'Adresses de livraison', icon: MapPin, slug: 'adresses' },
  { label: 'Mes messages', icon: MessageSquare, slug: 'messages' },
]

const SECONDARY_LINKS = [
  { label: 'Inviter un ami', icon: UserPlus, slug: 'inviter' },
  { label: 'Service client', icon: Headphones, slug: 'support' },
  { label: 'Centre d’aide', icon: HelpCircle, slug: 'aide' },
]

export function AccountNav({ activeSlug = 'overview', onSelectTab }: AccountNavProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const handleLinkClick = (slug: string, e?: React.MouseEvent) => {
    if (onSelectTab) {
      if (e) e.preventDefault()
      onSelectTab(slug)
      setMobileDrawerOpen(false)
    }
  }

  const getLinkHref = (slug: string) => {
    if (slug === 'overview') return '/account/settings'
    return `/account/settings?tab=${slug}`
  }

  const activeItemLabel =
    [...PRIMARY_LINKS, ...SECONDARY_LINKS].find((i) => i.slug === activeSlug)?.label || 'Vue d’ensemble'

  return (
    <>
      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden mb-4 sticky top-[140px] sm:top-[148px] z-30 bg-[#FAFDFB]/95 backdrop-blur-xs py-1">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-[#DCE8E3] shadow-xs text-xs font-bold text-[#102A2A] hover:bg-[#F7FAF9] transition cursor-pointer"
          aria-expanded={mobileDrawerOpen}
          aria-label="Ouvrir le menu du compte client"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-[#60716F]">Mon compte :</span>
            <span className="text-[#006B55] font-extrabold">{activeItemLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#006B55]">
            <span className="text-[11px] font-semibold">Changer de rubrique</span>
            <Menu size={16} />
          </div>
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Dialog */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-[280px] max-w-[85vw] bg-white h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED] mb-3">
                <h3 className="font-display font-extrabold text-sm text-[#102A2A]">
                  Mon compte
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-[#60716F] hover:text-[#102A2A] rounded-lg hover:bg-[#F4FAF7] cursor-pointer"
                  aria-label="Fermer le menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {PRIMARY_LINKS.map((item) => {
                  const Icon = item.icon
                  const isActive = item.slug === activeSlug
                  return (
                    <Link
                      key={item.label}
                      href={getLinkHref(item.slug)}
                      onClick={(e) => handleLinkClick(item.slug, e)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#E7F2EF] text-[#006B55] border-l-3 border-[#006B55] font-bold'
                          : 'text-[#4A5D58] hover:text-[#102A2A] hover:bg-[#F4FAF7]'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-[#006B55]' : 'text-[#71827D]'} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                <div className="py-2">
                  <div className="h-px bg-[#E8F0ED]" />
                </div>

                {SECONDARY_LINKS.map((item) => {
                  const Icon = item.icon
                  const isActive = item.slug === activeSlug
                  return (
                    <Link
                      key={item.label}
                      href={getLinkHref(item.slug)}
                      onClick={(e) => handleLinkClick(item.slug, e)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-[#E7F2EF] text-[#006B55] font-bold'
                          : 'text-[#60716F] hover:text-[#102A2A] hover:bg-[#F4FAF7]'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-[#006B55]' : 'text-[#889994]'} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-[#E8F0ED] text-[11px] text-[#889994] text-center">
              Dzora Marketplace Client
            </div>
          </div>
        </div>
      )}

      {/* Desktop Left Account Navigation Sidebar (240px wide, STICKY on scroll) */}
      <aside
        aria-label="Navigation Mon compte"
        className="hidden lg:block w-[240px] shrink-0 sticky top-[120px] xl:top-[124px] z-30 self-start"
      >
        <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.02)] p-3">
          <div className="px-3 pt-2 pb-3 border-b border-[#E8F0ED]">
            <h2 className="font-display font-extrabold text-sm text-[#102A2A] tracking-tight">
              Mon compte
            </h2>
          </div>

          <nav className="mt-2 space-y-1">
            {PRIMARY_LINKS.map((item) => {
              const Icon = item.icon
              const isActive = item.slug === activeSlug
              return (
                <Link
                  key={item.label}
                  href={getLinkHref(item.slug)}
                  onClick={(e) => handleLinkClick(item.slug, e)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#E7F2EF] text-[#006B55] border-l-3 border-[#006B55] font-bold shadow-2xs'
                      : 'font-medium text-[#4A5D58] hover:text-[#102A2A] hover:bg-[#F4FAF7]'
                  }`}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[#006B55]' : 'text-[#71827D]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}

            {/* Subtle Divider */}
            <div className="py-2 px-2">
              <div className="h-px bg-[#E8F0ED]" />
            </div>

            {SECONDARY_LINKS.map((item) => {
              const Icon = item.icon
              const isActive = item.slug === activeSlug
              return (
                <Link
                  key={item.label}
                  href={getLinkHref(item.slug)}
                  onClick={(e) => handleLinkClick(item.slug, e)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                    isActive
                      ? 'bg-[#E7F2EF] text-[#006B55] font-bold'
                      : 'font-medium text-[#60716F] hover:text-[#102A2A] hover:bg-[#F4FAF7]'
                  }`}
                >
                  <Icon
                    size={15}
                    className={`shrink-0 ${isActive ? 'text-[#006B55]' : 'text-[#889994]'}`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
