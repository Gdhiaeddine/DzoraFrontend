'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  ChevronDown,
  CircleUserRound,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react'
import { Logo } from './logo'
import { useCart } from './cart-context'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const { cartCount } = useCart()
  const pathname = usePathname()

  const isVendeursLocaux = pathname?.startsWith('/vendeur')

  const handleCartClick = () => {
    const msg =
      cartCount > 0
        ? `${cartCount} article${cartCount > 1 ? 's' : ''} dans votre panier.`
        : 'Votre panier est vide.'
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(''), 2500)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8F0ED] bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center gap-5">
          <button
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid size-10 place-items-center rounded-xl border border-[#E5EEEB] text-[#006B55] lg:hidden"
          >
            {menuOpen ? <X size={19} /> : <Menu size={20} />}
          </button>
          <Logo />
          <div className="relative hidden max-w-[670px] flex-1 lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A4A0]" size={19} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit, une marque, une catégorie…"
              className="h-11 w-full rounded-xl border border-[#D9E7E2] bg-[#F7FAF9] pl-11 pr-12 text-sm outline-none transition focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/10"
            />
            <button
              aria-label="Rechercher"
              className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-lg bg-[#006B55] text-white transition hover:bg-[#008F72]"
            >
              <Search size={16} />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-4 text-[#102A2A]">
            <button className="hidden items-center gap-2 text-left lg:flex">
              <CircleUserRound className="text-[#006B55]" size={22} />
              <span className="text-xs font-semibold leading-4">
                Se connecter<br />
                <span className="font-normal text-[#60716F]">/ S'inscrire</span>
              </span>
            </button>
            <button aria-label="Favoris" className="hidden xl:block">
              <Heart size={21} />
            </button>
            <button
              aria-label="Panier"
              onClick={handleCartClick}
              className="relative flex items-center gap-2"
            >
              <ShoppingCart size={22} className="text-[#006B55]" />
              <span className="hidden text-xs font-semibold lg:block">Panier</span>
              <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#F28C28] text-[9px] font-bold text-white">
                {cartCount}
              </span>
            </button>
            <span className="hidden items-center gap-1.5 border-l border-[#E5EEEB] pl-3 text-xs font-bold text-[#60716F] sm:flex">
              <span className="text-sm">🇩🇿</span> FR
            </span>
          </div>
        </div>
        <div className="relative pb-3 lg:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A4A0]" size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit, une marque, une catégorie…"
            className="h-10 w-full rounded-xl border border-[#D9E7E2] bg-[#F7FAF9] pl-10 pr-4 text-sm outline-none"
          />
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-[#E8F0ED] bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-4 text-sm font-semibold">
            <Link href="/" onClick={() => setMenuOpen(false)}>Toutes les catégories</Link>
            <Link href="/" onClick={() => setMenuOpen(false)}>Promotions</Link>
            <Link
              href="/vendeur/techno-blida"
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
          <button className="flex items-center gap-2 font-bold text-[#102A2A]">
            <Menu size={16} className="text-[#006B55]" /> Toutes les catégories <ChevronDown size={14} />
          </button>
          <span className="text-[#D7E2DE]">|</span>
          <Link href="/" className="hover:text-[#006B55]">Promotions</Link>
          <Link
            href="/vendeur/techno-blida"
            className={isVendeursLocaux ? 'font-bold text-[#006B55]' : 'hover:text-[#006B55]'}
          >
            Vendeurs locaux
          </Link>
          <Link href="/" className="hover:text-[#006B55]">Livraison rapide</Link>
          <Link href="/" className="hover:text-[#006B55]">Cash à la livraison</Link>
          <Link href="/" className="hover:text-[#006B55]">Nos engagements</Link>
          <Link href="/" className="ml-auto text-[#006B55]">
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
  )
}
