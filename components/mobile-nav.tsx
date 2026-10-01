'use client'

import Link from 'next/link'
import { Menu, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react'

export function MobileNav() {
  return (
    <div className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-[#D9E7E2] bg-white/95 px-5 py-3 text-[10px] font-semibold text-[#60716F] shadow-lg backdrop-blur-md lg:hidden">
      <Link href="/" className="flex flex-col items-center gap-1 text-[#006B55]">
        <ShoppingBag size={17} />
        <span>Accueil</span>
      </Link>
      <span className="flex flex-col items-center gap-1 cursor-pointer">
        <Menu size={17} />
        <span>Catégories</span>
      </span>
      <span className="flex flex-col items-center gap-1 cursor-pointer">
        <ShoppingCart size={17} />
        <span>Panier</span>
      </span>
      <button
        type="button"
        data-open-login="true"
        aria-label="Ouvrir la connexion"
        className="flex flex-col items-center gap-1 cursor-pointer text-[#60716F] hover:text-[#006B55]"
      >
        <UserRound size={17} />
        <span>Compte</span>
      </button>
    </div>
  )
}
