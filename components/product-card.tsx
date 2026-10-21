'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Heart, ShoppingCart, Star, Store, Truck } from 'lucide-react'
import { useCart } from './cart-context'
import { useFavorites } from './favorites-context'

export interface Product {
  id?: string
  name: string
  store?: string
  price: string | number
  old?: string | number
  discount?: string
  rating?: string | number
  reviews?: string | number
  image: string
  link?: string
  category?: string
  specification?: string
  variant?: string
  description?: string
}

export function ProductCard({
  product,
  compact = false,
  onAddToCart,
}: {
  product: Product
  compact?: boolean
  onAddToCart?: (product: Product) => void
}) {
  const [added, setAdded] = useState(false)
  const { addToCart: addGlobalCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const productId =
    product.id ||
    product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
    'product'

  const liked = isFavorite(productId)

  const cleanPrice =
    typeof product.price === 'number'
      ? product.price
      : Number(String(product.price).replace(/[^0-9.]/g, '')) || 0

  const cleanOld =
    product.old !== undefined
      ? typeof product.old === 'number'
        ? product.old
        : Number(String(product.old).replace(/[^0-9.]/g, '')) || undefined
      : undefined

  const href = product.link || `/products/${encodeURIComponent(product.name)}`

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const item = {
      id: productId,
      name: product.name,
      variant: product.variant || product.specification,
      description: product.description || product.store,
      currentPrice: cleanPrice,
      previousPrice: cleanOld,
      discount: product.discount,
      quantity: 1,
      image: product.image,
      link: href,
    }

    addGlobalCart(item)

    if (onAddToCart) {
      onAddToCart(product)
    }

    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite({
      id: productId,
      name: product.name,
      price: product.price,
      currentPrice: cleanPrice,
      previousPrice: cleanOld,
      discount: product.discount,
      image: product.image,
      link: href,
      rating: typeof product.rating === 'string' ? parseFloat(product.rating) : product.rating,
      reviews: product.reviews,
    })
  }

  return (
    <article className={`group relative overflow-hidden rounded-2xl border border-[#E5EEEB] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#B9D8D0] hover:shadow-[0_14px_35px_rgba(0,107,85,0.10)] ${compact ? 'min-w-[210px]' : ''}`}>
      <div className="relative aspect-square overflow-hidden bg-[#F4F8F6] p-5 sm:p-7">
        {product.discount && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-[#E53935] px-2 py-1 text-[10px] font-bold text-white">
            {product.discount}
          </span>
        )}
        <button
          type="button"
          aria-label={`Ajouter ${product.name} aux favoris`}
          onClick={handleToggleFavorite}
          className={`absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border bg-white transition-colors cursor-pointer ${liked ? 'border-[#F28C28] text-[#F28C28]' : 'border-[#E5EEEB] text-[#60716F] hover:text-[#F28C28]'}`}
        >
          <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <Link href={href} aria-label={`Voir les détails de ${product.name}`}>
          <img src={product.image} alt={product.name} className="size-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
        </Link>
      </div>
      <div className="p-4">
        {product.rating && (
          <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-[#F28C28]">
            <Star size={13} fill="currentColor" /> {product.rating} <span className="font-normal text-[#94A4A0]">({product.reviews || '0'})</span>
          </div>
        )}
        <Link href={href} className="block">
          <h3 className="min-h-[40px] text-sm font-semibold leading-5 text-[#102A2A] transition-colors hover:text-[#006B55]">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#60716F]">
          <Store size={12} className="shrink-0 text-[#008F72]" />
          <span className="truncate">{product.store || 'Boutique vérifiée'}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-[#006B55]">{product.price} DA</span>
          {product.old && <span className="text-xs text-[#94A4A0] line-through">{product.old} DA</span>}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#60716F]">
            <Truck size={13} className="text-[#008F72]" /> Livraison rapide
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={added ? `${product.name} ajouté au panier !` : `Ajouter ${product.name} au panier`}
            title={added ? 'Ajouté au panier !' : 'Ajouter au panier'}
            className={`grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
              added
                ? 'bg-[#E1F1ED] text-[#006B55] scale-105 shadow-xs'
                : 'bg-[#006B55] text-white hover:bg-[#008F72] active:scale-95'
            }`}
          >
            {added ? <Check size={16} /> : <ShoppingCart size={15} />}
          </button>
        </div>
      </div>
    </article>
  )
}
