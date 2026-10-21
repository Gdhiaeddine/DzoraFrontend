'use client'

import Link from 'next/link'
import { Menu, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function MobileNav() {
  const { user } = useAuth()

  return (
    <div className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-[#D9E7E2] bg-white/95 px-5 py-3 text-[10px] font-semibold text-[#60716F] shadow-lg backdrop-blur-md lg:hidden">
      <Link href="/" className="flex flex-col items-center gap-1 text-[#006B55]">
        <ShoppingBag size={17} />
        <span>Accueil</span>
      </Link>
      <Link href="/products" className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#006B55]">
        <Menu size={17} />
        <span>Catégories</span>
      </Link>
      <Link href="/panier" className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#006B55]">
        <ShoppingCart size={17} />
        <span>Panier</span>
      </Link>
      {user ? (
        <Link
          href={
            user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN')
              ? '/admin/dashboard'
              : user.roles?.includes('SELLER') || user.roles?.includes('SELLER_STAFF')
              ? '/vendeur/dashboard'
              : '/account/settings'
          }
          className="flex flex-col items-center gap-1 cursor-pointer text-[#60716F] hover:text-[#006B55]"
        >
          <UserRound size={17} />
          <span>Compte</span>
        </Link>
      ) : (
        <button
          type="button"
          data-open-login="true"
          aria-label="Ouvrir la connexion"
          className="flex flex-col items-center gap-1 cursor-pointer text-[#60716F] hover:text-[#006B55]"
        >
          <UserRound size={17} />
          <span>Compte</span>
        </button>
      )}
    </div>
  )
}
