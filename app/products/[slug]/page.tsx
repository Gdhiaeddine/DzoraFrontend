'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  ZoomIn,
} from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { ProductCard, type Product } from '@/components/product-card'

const gallery = [
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=90',
]

const variants = {
  '128 Go': { price: '34 990', old: '42 990', discount: '−19 %', ram: '4 Go RAM' },
  '256 Go': { price: '39 990', old: '47 990', discount: '−17 %', ram: '6 Go RAM' },
}

const relatedProducts: Product[] = [
  { name: 'Écouteurs Bluetooth TWS', store: 'Tech Sétif', price: '3 990', old: '6 990', discount: '-43%', rating: '4.8', reviews: '125', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=85' },
  { name: 'Montre connectée SmartWatch', store: 'Techno Blida', price: '7 990', old: '9 990', discount: '-20%', rating: '4.7', reviews: '89', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=85' },
  { name: 'Baskets Homme Casual', store: 'DZ Fashion', price: '4 990', old: '6 000', discount: '-15%', rating: '4.9', reviews: '214', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=85' },
  { name: 'Air Fryer 5L', store: 'Maison Alger', price: '9 990', old: '12 000', discount: '-17%', rating: '4.6', reviews: '53', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=85' },
]

export default function ProductDetailPage() {
  const [imageIndex, setImageIndex] = useState(0)
  const [color, setColor] = useState('Bleu nuit')
  const [capacity, setCapacity] = useState<'128 Go' | '256 Go'>('128 Go')
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)
  const [following, setFollowing] = useState(false)
  const [tab, setTab] = useState('Description')
  const [status, setStatus] = useState('')
  const { addToCart: addCartItem } = useCart()
  const current = variants[capacity]

  const notify = (message: string) => {
    setStatus(message)
    window.setTimeout(() => setStatus(''), 2600)
  }

  const addToCart = (count = quantity) => {
    addCartItem(count)
    notify(`${count} × Galaxy A15 ${capacity} ajouté au panier`)
  }

  const changeQuantity = (next: number) => {
    if (next > 8) notify('Vous avez atteint la quantité disponible pour ce vendeur.')
    setQuantity(Math.min(8, Math.max(1, next)))
  }

  return (
    <div className="bg-[#FCFAF7] text-[#123330] pb-16">
      <main className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 lg:px-0 lg:py-7">
        <nav className="mb-5 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-[#84928E]">
          <Link href="/" className="shrink-0 hover:text-[#08785F]">Accueil</Link>
          <ChevronRight size={13} />
          <Link href="/" className="shrink-0 hover:text-[#08785F]">Électronique</Link>
          <ChevronRight size={13} />
          <Link href="/" className="shrink-0 hover:text-[#08785F]">Téléphones & accessoires</Link>
          <ChevronRight size={13} />
          <span className="truncate font-semibold text-[#35504B]">Samsung Galaxy A15</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.04fr_.96fr] lg:gap-12">
          <div>
            <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-[#E1ECE7] bg-white p-8 sm:h-[480px]">
              <span className="absolute left-4 top-4 rounded-md bg-[#E86E5B] px-2.5 py-1.5 text-xs font-bold text-white">{current.discount}</span>
              <button aria-label="Image précédente" onClick={() => setImageIndex((imageIndex + gallery.length - 1) % gallery.length)} className="absolute left-3 grid size-9 place-items-center rounded-full border border-[#E1ECE7] bg-white text-[#08785F] shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <img src={gallery[imageIndex]} alt={`Samsung Galaxy A15, vue ${imageIndex + 1}`} className="size-full object-contain" />
              <button aria-label="Image suivante" onClick={() => setImageIndex((imageIndex + 1) % gallery.length)} className="absolute right-3 grid size-9 place-items-center rounded-full border border-[#E1ECE7] bg-white text-[#08785F] shadow-sm">
                <ChevronRight size={18} />
              </button>
              <button aria-label="Agrandir l'image" className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-white text-[#71827D] shadow-sm">
                <ZoomIn size={16} />
              </button>
            </div>
            <div className="mt-3 flex gap-2.5">
              {gallery.map((src, index) => (
                <button key={src} aria-label={`Sélectionner la vue ${index + 1}`} onClick={() => setImageIndex(index)} className={`size-[72px] overflow-hidden rounded-lg border-2 bg-white p-1 ${index === imageIndex ? 'border-[#08785F]' : 'border-[#E1ECE7]'}`}>
                  <img src={src} alt="" className="size-full object-contain" />
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[#84928E]">Visuels du Samsung Galaxy A15</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#EAF8F2] px-2.5 py-1 text-[11px] font-bold text-[#08785F]">Électronique</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#08785F]">
                <span className="size-2 rounded-full bg-[#1BA477]" />En stock
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-[-.04em] text-[#173B36] sm:text-[38px]">
              Samsung Galaxy A15 <span className="font-medium text-[#5B706A]">{capacity}</span>
            </h1>
            <p className="mt-2 text-sm text-[#71827D]">Écran Super AMOLED 6,5″ · 4G · Dual SIM</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex gap-0.5 text-[#E5A52C]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} fill="currentColor" />
                ))}
              </span>
              <button onClick={() => { setTab('Avis clients 219'); document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' }) }} className="font-bold">
                4,8 <span className="font-normal text-[#71827D]">(219 avis)</span>
              </button>
              <span className="text-[#C7D5D0]">|</span>
              <span className="text-[#71827D]">+120 vendus</span>
            </div>

            <div className="my-5 border-y border-[#E5EEEA] py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-[#D9574A]">{current.price} DA</span>
                <span className="text-sm text-[#8A9995] line-through">{current.old} DA</span>
                <span className="rounded bg-[#FFF0ED] px-2 py-1 text-[11px] font-bold text-[#D9574A]">{current.discount}</span>
              </div>
              <p className="mt-2 text-xs text-[#84928E]">Prix TTC · Paiement à la livraison disponible</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold">Couleur : <span>{color}</span></p>
                <div className="flex gap-3">
                  {[['Bleu nuit', '#1D3557'], ['Bleu clair', '#8CB9D9'], ['Jaune', '#E5BF42']].map(([name, swatch]) => (
                    <button key={name} aria-label={name} aria-pressed={color === name} onClick={() => setColor(name)} className={`size-8 rounded-full border-2 p-0.5 ${color === name ? 'border-[#08785F]' : 'border-transparent'}`}>
                      <span style={{ backgroundColor: swatch }} className="block size-full rounded-full border border-black/10" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Capacité :</p>
                <div className="flex gap-2">
                  {(['128 Go', '256 Go'] as const).map((option) => (
                    <button key={option} aria-pressed={capacity === option} onClick={() => setCapacity(option)} className={`rounded-lg border px-4 py-2 text-xs ${capacity === option ? 'border-[#08785F] bg-[#EAF8F2] font-bold text-[#08785F]' : 'border-[#D7E7E1]'}`}>
                      {option}<span className="ml-1 text-[#71827D]">{variants[option].ram}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Quantité :</span>
                <div className="flex h-9 items-center rounded-lg border border-[#D7E7E1]">
                  <button aria-label="Diminuer la quantité" onClick={() => changeQuantity(quantity - 1)} className="grid size-9 place-items-center text-[#08785F]">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <button aria-label="Augmenter la quantité" onClick={() => changeQuantity(quantity + 1)} className="grid size-9 place-items-center text-[#08785F]">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs font-semibold text-[#08785F]">● Plus que 8 pièces</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => addToCart()} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#08785F] text-sm font-bold text-[#08785F] transition hover:bg-[#EAF8F2]">
                  <ShoppingCart size={17} />Ajouter au panier
                </button>
                <button onClick={() => notify('Votre sélection est prête dans le panier.')} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#08785F] text-sm font-bold text-white transition hover:bg-[#065F4B]">
                  Acheter maintenant <ArrowRight size={16} />
                </button>
                <button aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={liked} onClick={() => { setLiked(!liked); notify(liked ? 'Retiré de vos favoris.' : 'Ajouté à vos favoris.') }} className={`grid size-11 shrink-0 place-items-center rounded-lg border ${liked ? 'border-[#E86E5B] text-[#E86E5B]' : 'border-[#D7E7E1] text-[#08785F]'}`}>
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#CDE8DB] bg-[#EAF8F2] p-4">
              <div className="flex gap-3">
                <Truck size={20} className="shrink-0 text-[#08785F]" />
                <div className="text-xs">
                  <p className="font-bold">Livraison partout en Algérie</p>
                  <p className="mt-1 text-[#607A72]">À domicile ou en point relais</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#CDE8DB] pt-3">
                    <span>Livraison estimée<br /><b>2 à 4 jours ouvrés</b></span>
                    <span>Frais de livraison<br /><b>À partir de 400 DA</b></span>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 border-t border-[#CDE8DB] pt-3 text-[#41665C]">
                    <ShieldCheck size={14} />Payez en espèces à la réception — simplement et en toute sécurité
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E1ECE7] bg-white p-3">
              <Link href="/vendeur/techno-blida" className="grid size-10 place-items-center rounded-full bg-[#EAF8F2] text-xs font-bold text-[#08785F] transition hover:opacity-80">TB</Link>
              <div className="min-w-0 flex-1 text-xs">
                <p className="text-[#84928E]">Vendu par</p>
                <Link href="/vendeur/techno-blida" className="font-bold hover:text-[#08785F] transition-colors">
                  Techno Blida <BadgeCheck className="ml-1 inline text-[#08785F]" size={13} />
                </Link>
                <p className="mt-0.5 text-[#71827D]">★★★★★ 4,9 · Blida, Algérie</p>
              </div>
              <button onClick={() => { setFollowing(!following); notify(following ? 'Vous ne suivez plus ce vendeur.' : 'Vous suivez maintenant Techno Blida.') }} className="rounded-lg border border-[#B7D9CE] px-3 py-2 text-xs font-bold text-[#08785F]">
                {following ? 'Suivi ✓' : 'Suivre'}
              </button>
            </div>
          </div>
        </section>

        <div aria-live="polite" className={`fixed bottom-16 sm:bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-[#173B36] px-4 py-3 text-xs font-semibold text-white shadow-lg transition ${status ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          {status}
        </div>

        <section className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-[#EAF8F2] p-4 sm:grid-cols-4 sm:gap-5 sm:p-6">
          {[['Livraison rapide', 'Partout en Algérie', Truck], ['Paiement à la livraison', 'Simple et sécurisé', ShieldCheck], ['Service client', 'Toujours à votre écoute', BadgeCheck], ['Vendeurs vérifiés', 'Des boutiques de confiance', Check]].map(([title, subtitle, Icon]) => (
            <div key={title as string} className="flex items-center gap-2">
              <Icon size={20} className="shrink-0 text-[#08785F]" />
              <div>
                <p className="text-[11px] font-bold sm:text-xs">{title as string}</p>
                <p className="text-[10px] text-[#71827D]">{subtitle as string}</p>
              </div>
            </div>
          ))}
        </section>

        <section id="details" className="mt-8 rounded-2xl border border-[#E1ECE7] bg-white p-5 sm:p-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[.16em] text-[#08785F]">TOUT SAVOIR</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold">Le Galaxy A15, en détail</h2>
            </div>
            <span className="hidden text-xs text-[#84928E] sm:block">Samsung · Série Galaxy A</span>
          </div>
          <div className="mt-5 flex gap-5 overflow-x-auto border-b border-[#E5EEEA] text-sm font-semibold">
            {['Description', 'Caractéristiques', 'Avis clients 219'].map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 pb-3 ${tab === item ? 'border-[#08785F] text-[#08785F]' : 'border-transparent text-[#84928E]'}`}>
                {item}
              </button>
            ))}
          </div>
          {tab === 'Description' && (
            <div className="grid gap-7 pt-6 lg:grid-cols-[1.4fr_.8fr]">
              <div>
                <h3 className="text-xl font-bold">Vos journées en grand format</h3>
                <p className="mt-3 text-sm leading-7 text-[#607A72]">Le Galaxy A15 vous accompagne au quotidien avec son écran Super AMOLED 6,5 pouces, son appareil photo 50 MP et sa batterie 5 000 mAh. Un design fin et élégant, pensé pour rester confortable toute la journée.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Écran Super AMOLED', 'Appareil photo 50 MP', 'Batterie 5 000 mAh', 'Garantie 12 mois'].map((chip) => (
                    <span key={chip} className="rounded-full bg-[#EAF8F2] px-3 py-2 text-xs font-semibold text-[#08785F]">{chip}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-[#FCFAF7] p-5">
                <h3 className="font-bold">Les points forts</h3>
                <ul className="mt-3 space-y-3 text-xs text-[#607A72]">
                  {['Grand écran 6,5″, couleurs éclatantes', 'Jusqu’à 256 Go de stockage interne', 'Triple appareil photo arrière', 'Batterie 5 000 mAh, charge rapide 25 W'].map((item) => (
                    <li key={item} className="flex gap-2"><Check size={15} className="text-[#08785F]" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {tab === 'Caractéristiques' && (
            <div className="grid gap-x-8 gap-y-3 pt-6 text-sm sm:grid-cols-2">
              {[['Marque', 'Samsung'], ['Modèle', 'Galaxy A15'], ['Écran', 'Super AMOLED, 6,5 pouces'], ['Résolution', '1080 × 2340 pixels'], ['Mémoire', `${capacity} · ${variants[capacity].ram}`], ['Extension', 'MicroSD jusqu’à 1 To'], ['Appareil photo', '50 MP + 5 MP + 2 MP'], ['Batterie', '5 000 mAh'], ['Réseau', '4G LTE · Dual SIM'], ['Garantie', '12 mois vendeur']].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-[#EDF3F0] py-2">
                  <span className="text-[#84928E]">{label}</span><b>{value}</b>
                </div>
              ))}
            </div>
          )}
          {tab === 'Avis clients 219' && (
            <div className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="rounded-xl bg-[#FCFAF7] p-5">
                <p className="text-2xl font-extrabold">4,8/5</p>
                <p className="text-sm text-[#E5A52C]">★★★★★</p>
                <p className="mt-2 text-xs text-[#71827D]">Basé sur 219 avis vérifiés</p>
              </div>
              {['Livraison rapide à Blida, téléphone conforme et bien emballé.', 'Très bon écran et la batterie tient vraiment toute la journée.'].map((review, index) => (
                <div key={review} className="rounded-xl border border-[#E1ECE7] p-4 text-xs">
                  <p className="text-[#E5A52C]">★★★★★</p>
                  <p className="mt-2 font-bold">Très satisfait</p>
                  <p className="mt-1 leading-5 text-[#607A72]">{review}</p>
                  <p className="mt-3 text-[#84928E]">Client vérifié · {index ? '12 sept. 2024' : '18 sept. 2024'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="related" className="mt-9">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[.16em] text-[#08785F]">À DÉCOUVRIR AUSSI</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold">Vous aimerez peut-être aussi</h2>
            </div>
            <Link href="/" className="text-xs font-bold text-[#08785F] hover:text-[#F28C28] transition-colors">
              Voir tout →
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.name}
                product={product}
                onAddToCart={(p) => {
                  addCartItem(1)
                  notify(`1 × ${p.name} ajouté au panier`)
                }}
              />
            ))}
          </div>
        </section>
      </main>

      <section className="mx-auto mt-2 max-w-[1240px] px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#EAF8F2] p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="font-display text-lg font-extrabold">Ensemble pour une Algérie connectée</p>
            <p className="mt-1 text-xs text-[#607A72]">Des produits de confiance, livrés chez vous partout en Algérie.</p>
          </div>
          <Link href="/" className="rounded-lg bg-[#08785F] px-4 py-3 text-xs font-bold text-white">Découvrir Dzora →</Link>
        </div>
      </section>
    </div>
  )
}
