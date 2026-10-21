'use client'

import React from 'react'
import Link from 'next/link'
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Star,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react'
import { useFavorites, FavoriteItem } from '@/components/favorites-context'
import { useCart } from '@/components/cart-context'
import { useAuth } from '@/lib/auth-context'

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth()
  const { favorites, removeFavorite, promptLogin } = useFavorites()
  const { addToCart } = useCart()
  const [addedItems, setAddedItems] = React.useState<Record<string, boolean>>({})

  const handleAddToCart = (product: FavoriteItem, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const priceNum =
      typeof product.currentPrice === 'number'
        ? product.currentPrice
        : typeof product.price === 'number'
        ? product.price
        : typeof product.price === 'string'
        ? parseInt(product.price.replace(/[^\d]/g, ''), 10) || 0
        : 0

    const prevPriceNum =
      typeof product.previousPrice === 'number'
        ? product.previousPrice
        : undefined

    addToCart({
      id: product.id,
      name: product.name,
      variant: product.category,
      currentPrice: priceNum,
      previousPrice: prevPriceNum,
      discount: product.discount,
      quantity: 1,
      image: product.image,
      link: product.link || `/products/${product.id}`,
    })

    setAddedItems((prev) => ({ ...prev, [product.id]: true }))
    window.setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }))
    }, 1800)
  }

  // Formatting helpers
  const formatPrice = (price?: number | string) => {
    if (typeof price === 'number') {
      return price.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
    }
    if (typeof price === 'string') {
      return price
    }
    return '0 DA'
  }

  return (
    <div className="bg-[#FAFDFB] min-h-screen text-[#102A2A] pb-16">
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs font-medium text-[#60716F]">
          <Link href="/" className="transition hover:text-[#006B55]">
            Accueil
          </Link>
          <ChevronRight size={13} className="text-[#94A4A0]" />
          <span className="font-semibold text-[#102A2A]">Mes favoris</span>
        </nav>

        {/* Page Heading */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0F5F2] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#006B55]/10 text-[#006B55] shadow-xs">
              <Heart size={24} className="fill-[#006B55]" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.035em] text-[#102A2A]">
                Mes favoris
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#60716F]">
                {isAuthenticated
                  ? `${favorites.length} produit${favorites.length > 1 ? 's' : ''} sauvegardé${favorites.length > 1 ? 's' : ''} dans votre compte (${user?.fullName || user?.phone})`
                  : 'Connectez-vous pour retrouver et gérer vos favoris'}
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#006B55] hover:text-[#008F72] transition-colors"
          >
            <span>Continuer mes achats</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Content Section */}
        <div className="mt-7">

        {/* Not Logged In View */}
        {!isAuthenticated ? (
          <div className="rounded-3xl border border-[#E5EEEB] bg-white p-8 sm:p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#006B55]/10 text-[#006B55]">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-bold text-[#102A2A] sm:text-2xl">
              Connectez-vous pour voir vos favoris
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#71827D]">
              Vos coups de cœur sont sauvegardés directement sur votre compte Dzora afin que vous puissiez les retrouver sur tous vos appareils.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={promptLogin}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006B55] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#006B55]/20 hover:bg-[#005241] transition-all cursor-pointer"
              >
                <span>Se connecter / S&apos;inscrire</span>
              </button>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-xl border border-[#E5EEEB] bg-[#F4F8F6] px-5 py-3 text-sm font-bold text-[#102A2A] hover:bg-[#E5EEEB] transition-all"
              >
                Explorer le catalogue
              </Link>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          /* Logged In but Empty */
          <div className="rounded-3xl border border-[#E5EEEB] bg-white p-8 sm:p-14 text-center shadow-xs">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#F4F8F6] text-[#94A4A0]">
              <Heart size={30} />
            </div>
            <h2 className="text-xl font-bold text-[#102A2A] sm:text-2xl">
              Votre liste de favoris est vide
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#71827D]">
              Vous n&apos;avez pas encore de produit favori. Explorez nos offres et cliquez sur le cœur pour sauvegarder ce qui vous plaît !
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006B55] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#006B55]/20 hover:bg-[#005241] transition-all"
              >
                <Sparkles size={16} />
                <span>Découvrir les produits</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favorites.map((product) => {
              const isAdded = Boolean(addedItems[product.id])
              const displayPrice = product.currentPrice ?? product.price
              const displayOldPrice = product.previousPrice

              return (
                <article
                  key={product.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5EEEB] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#B9D8D0] hover:shadow-[0_12px_30px_rgba(0,107,85,0.08)]"
                >
                  {/* Top Image Box */}
                  <div className="relative aspect-square overflow-hidden bg-[#F4F8F6] p-4 sm:p-5">
                    {product.discount && (
                      <span className="absolute left-3 top-3 z-10 rounded-md bg-[#E53935] px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                        {product.discount}
                      </span>
                    )}

                    {/* Remove from favorites button */}
                    <button
                      type="button"
                      aria-label={`Retirer ${product.name} des favoris`}
                      onClick={() => removeFavorite(product.id)}
                      className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border border-[#E5EEEB] bg-white text-[#E53935] hover:bg-[#FDE8E8] transition-colors cursor-pointer shadow-2xs"
                      title="Retirer des favoris"
                    >
                      <Trash2 size={15} />
                    </button>

                    <Link
                      href={product.link || `/products/${product.id}`}
                      aria-label={`Voir ${product.name}`}
                      className="flex size-full items-center justify-center"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="size-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      {/* Rating & Reviews */}
                      {product.rating && (
                        <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#F28C28]">
                          <Star size={13} fill="currentColor" />
                          <span>{product.rating}</span>
                          {product.reviews && (
                            <span className="font-normal text-[#94A4A0]">
                              ({product.reviews})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Title */}
                      <Link
                        href={product.link || `/products/${product.id}`}
                        className="block"
                      >
                        <h3 className="line-clamp-2 min-h-[38px] text-xs sm:text-sm font-bold leading-snug text-[#102A2A] transition-colors group-hover:text-[#006B55]">
                          {product.name}
                        </h3>
                      </Link>

                      {product.category && (
                        <p className="mt-1 text-[11px] text-[#71827D]">
                          {product.category}
                        </p>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div className="mt-4 border-t border-[#E5EEEB]/60 pt-3">
                      <div className="mb-3 flex items-baseline gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-[#006B55]">
                          {formatPrice(displayPrice)}
                        </span>
                        {displayOldPrice && (
                          <span className="text-xs text-[#94A4A0] line-through">
                            {formatPrice(displayOldPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-[#006B55] text-white shadow-xs'
                            : 'bg-[#006B55]/10 text-[#006B55] hover:bg-[#006B55] hover:text-white'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        <span>{isAdded ? 'Ajouté !' : 'Ajouter au panier'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
