'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
import { sellerProductsService } from '@/lib/seller-products-service'

interface ProductVariant {
  price: string
  old: string
  discount: string
  ram: string
}

interface ProductDetailData {
  id: string
  name: string
  subtitle: string
  category: string
  subCategory: string
  store: string
  storeMark: string
  rating: string
  reviews: string
  soldCount: string
  colors: [string, string][]
  variants: Record<string, ProductVariant>
  gallery: string[]
  description: string
  tags: string[]
  highlights: string[]
  specs: [string, string][]
}

const productCatalog: Record<string, ProductDetailData> = {
  'galaxy-a15': {
    id: 'samsung-galaxy-a15',
    name: 'Samsung Galaxy A15',
    subtitle: 'Écran Super AMOLED 6,5″ · 4G · Dual SIM',
    category: 'Électronique',
    subCategory: 'Téléphones & accessoires',
    store: 'Techno Blida',
    storeMark: 'TB',
    rating: '4.8',
    reviews: '219',
    soldCount: '+120',
    colors: [
      ['Bleu nuit', '#1D3557'],
      ['Bleu clair', '#8CB9D9'],
      ['Jaune', '#E5BF42'],
    ],
    variants: {
      '128 Go': { price: '34 990', old: '42 990', discount: '−19 %', ram: '4 Go RAM' },
      '256 Go': { price: '39 990', old: '47 990', discount: '−17 %', ram: '6 Go RAM' },
    },
    gallery: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=90',
    ],
    description:
      'Le Galaxy A15 vous accompagne au quotidien avec son écran Super AMOLED 6,5 pouces, son triple appareil photo 50 MP et sa batterie 5 000 mAh. Un design fin et élégant, pensé pour rester fluide et agréable toute la journée.',
    tags: ['Écran Super AMOLED', 'Appareil photo 50 MP', 'Batterie 5 000 mAh', 'Garantie 12 mois'],
    highlights: [
      'Grand écran 6,5″ aux couleurs éclatantes',
      'Jusqu’à 256 Go de stockage interne extensible',
      'Triple capteur photo arrière avec ultra grand-angle',
      'Batterie longue durée 5 000 mAh avec charge rapide',
    ],
    specs: [
      ['Marque', 'Samsung'],
      ['Modèle', 'Galaxy A15'],
      ['Écran', 'Super AMOLED, 6,5 pouces'],
      ['Résolution', '1080 × 2340 pixels'],
      ['Extension', 'MicroSD jusqu’à 1 To'],
      ['Appareil photo', '50 MP + 5 MP + 2 MP'],
      ['Batterie', '5 000 mAh'],
      ['Réseau', '4G LTE · Dual SIM'],
      ['Garantie', '12 mois vendeur'],
    ],
  },
  'ecouteurs-bluetooth-tws': {
    id: 'tws-earbuds',
    name: 'Écouteurs Bluetooth TWS',
    subtitle: 'Sans fil · Boîtier de recharge · Réduction de bruit passive',
    category: 'Électronique',
    subCategory: 'Audio & Écouteurs',
    store: 'Tech Sétif',
    storeMark: 'TS',
    rating: '4.8',
    reviews: '125',
    soldCount: '+250',
    colors: [
      ['Noir mat', '#1E1E1E'],
      ['Blanc pur', '#F2F2F2'],
    ],
    variants: {
      'Standard': { price: '3 990', old: '6 990', discount: '−43 %', ram: 'Autonomie 24h' },
      'Pro ANC': { price: '5 490', old: '7 990', discount: '−31 %', ram: 'Réduction de bruit ANC' },
    },
    gallery: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=90',
    ],
    description:
      'Profitez d’un son haute fidélité sans fil avec les écouteurs TWS. Confort ergonomique, basses profondes, microphones intégrés pour des appels limpides et boîtier compact offrant jusqu’à 24 heures d’écoute totale.',
    tags: ['Bluetooth 5.3', 'Autonomie 24h', 'Son HD Stéréo', 'Microphone intégré'],
    highlights: [
      'Connexion Bluetooth 5.3 ultra stable et basse latence',
      'Boîtier de charge compact avec voyant LED de batterie',
      'Résistant aux éclaboussures et à la transpiration',
      'Commandes tactiles intuitives sur les écouteurs',
    ],
    specs: [
      ['Type', 'Intra-auriculaires Bluetooth sans fil'],
      ['Version Bluetooth', 'Bluetooth 5.3'],
      ['Autonomie', 'Jusqu’à 6h par charge (24h avec boîtier)'],
      ['Port de charge', 'USB Type-C rapide'],
      ['Compatibilité', 'Android, iOS, PC / Mac'],
      ['Garantie', '6 mois vendeur'],
    ],
  },
  'montre-connectee-smartwatch': {
    id: 'smartwatch-watch',
    name: 'Montre connectée SmartWatch',
    subtitle: 'Écran HD 1.85″ · Suivi santé complet · Étanche IP68',
    category: 'High-Tech',
    subCategory: 'Montres & Objets connectés',
    store: 'Techno Blida',
    storeMark: 'TB',
    rating: '4.7',
    reviews: '89',
    soldCount: '+90',
    colors: [
      ['Noir sidéral', '#232323'],
      ['Argent métal', '#D6D6D6'],
    ],
    variants: {
      'Édition Sport': { price: '7 990', old: '9 990', discount: '−20 %', ram: 'Bracelet silicone' },
      'Édition Métal': { price: '9 490', old: '11 990', discount: '−21 %', ram: 'Bracelet acier' },
    },
    gallery: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90',
    ],
    description:
      'Gardez le contrôle sur votre journée avec cette montre connectée moderne. Suivi cardiaque en continu, mesure du sommeil, plus de 100 modes sportifs et notifications instantanées de vos messages et appels.',
    tags: ['Écran HD 1.85″', 'Étanche IP68', 'Autonomie 7 jours', 'Cardio & Sommeil'],
    highlights: [
      'Écran tactile couleur haute définition lumineux',
      'Suivi de la fréquence cardiaque, SpO2 et du sommeil',
      'Notifications d’appels, SMS et applications',
      'Batterie durable avec jusqu’à 7 jours d’autonomie',
    ],
    specs: [
      ['Écran', '1,85 pouce HD TFT Tactile'],
      ['Étanchéité', 'Norme IP68 (résistant à l’eau)'],
      ['Autonomie', '5 à 7 jours d’utilisation'],
      ['Connectivité', 'Bluetooth 5.2 BLE'],
      ['Garantie', '12 mois vendeur'],
    ],
  },
  'baskets-homme-casual': {
    id: 'baskets-homme',
    name: 'Baskets Homme Casual',
    subtitle: 'Confort quotidien · Semelle amortissante · Tissu respirant',
    category: 'Mode',
    subCategory: 'Chaussures Homme',
    store: 'DZ Fashion',
    storeMark: 'DZ',
    rating: '4.9',
    reviews: '214',
    soldCount: '+340',
    colors: [
      ['Gris / Rouge', '#333333'],
      ['Blanc / Bleu', '#F5F5F5'],
    ],
    variants: {
      'Pointure 41': { price: '4 990', old: '6 000', discount: '−15 %', ram: 'Taille 41 EU' },
      'Pointure 42': { price: '4 990', old: '6 000', discount: '−15 %', ram: 'Taille 42 EU' },
      'Pointure 43': { price: '4 990', old: '6 000', discount: '−15 %', ram: 'Taille 43 EU' },
      'Pointure 44': { price: '4 990', old: '6 000', discount: '−15 %', ram: 'Taille 44 EU' },
    },
    gallery: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=90',
    ],
    description:
      'Alliez style et confort avec ces baskets décontractées conçues pour le quotidien. Leur semelle amortissante absorbe les chocs tout en offrant un maintien optimal du pied.',
    tags: ['Semelle souple', 'Respirant', 'Léger', 'Usage quotidien'],
    highlights: [
      'Matière textile mesh ultra respirante et légère',
      'Semelle extérieure antidérapante en caoutchouc souple',
      'Confort longue durée pour marche et travail',
    ],
    specs: [
      ['Matière', 'Mesh respirant et empiècements synthétiques'],
      ['Semelle', 'Caoutchouc amortissant'],
      ['Fermeture', 'Lacets'],
      ['Origine', 'Qualité certifiée DZ Fashion'],
    ],
  },
  'air-fryer-5l': {
    id: 'air-fryer-5l',
    name: 'Air Fryer 5L Friteuse Sans Huile',
    subtitle: 'Cuisson saine · Cuve 5 Litres · 1500W · 8 programmes',
    category: 'Maison & Cuisine',
    subCategory: 'Petit électroménager',
    store: 'Maison Alger',
    storeMark: 'MA',
    rating: '4.6',
    reviews: '53',
    soldCount: '+75',
    colors: [
      ['Noir mat', '#1C1C1C'],
      ['Inox brossé', '#7A7A7A'],
    ],
    variants: {
      '5L Standard': { price: '9 990', old: '12 000', discount: '−17 %', ram: 'Cuve anti-adhésive' },
      '5L + Pack Accessoires': { price: '11 490', old: '13 500', discount: '−15 %', ram: 'Grille XXL & Pince' },
    },
    gallery: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=90',
    ],
    description:
      'Cuisinez croustillant avec jusqu’à 85% de matière grasse en moins ! La friteuse à air chaud Dzora Air Fryer 5L propose 8 programmes automatiques pour des frites dorées, des viandes savoureuses et des pâtisseries réussies.',
    tags: ['85% moins de gras', 'Capacité 5L', 'Puissance 1500W', 'Écran tactile'],
    highlights: [
      'Grande capacité 5 litres idéale pour toute la famille',
      'Circulation d’air chaud 360° pour une cuisson homogène',
      'Panier anti-adhésif amovible facile à nettoyer',
      'Minuteur réglable et arrêt automatique de sécurité',
    ],
    specs: [
      ['Capacité', '5 Litres (pour 4 à 6 personnes)'],
      ['Puissance', '1 500 Watts'],
      ['Température', '80°C à 200°C réglable'],
      ['Garantie', '12 mois pièces et main d’œuvre'],
    ],
  },
}

const relatedProducts: Product[] = [
  { name: 'Écouteurs Bluetooth TWS', store: 'Tech Sétif', price: '3 990', old: '6 990', discount: '-43%', rating: '4.8', reviews: '125', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=85' },
  { name: 'Montre connectée SmartWatch', store: 'Techno Blida', price: '7 990', old: '9 990', discount: '-20%', rating: '4.7', reviews: '89', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=85' },
  { name: 'Baskets Homme Casual', store: 'DZ Fashion', price: '4 990', old: '6 000', discount: '-15%', rating: '4.9', reviews: '214', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=85' },
  { name: 'Air Fryer 5L', store: 'Maison Alger', price: '9 990', old: '12 000', discount: '-17%', rating: '4.6', reviews: '53', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=85' },
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rawSlug = params?.slug ? String(params.slug) : ''
  const decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim()

  const [dynamicProduct, setDynamicProduct] = useState<ProductDetailData | null>(null)

  useEffect(() => {
    if (!decodedSlug) return
    sellerProductsService.getProductBySlug(decodedSlug).then((sp) => {
      if (sp) {
        const cleanPriceStr = sp.price.toLocaleString('fr-FR').replace(/\s/g, ' ')
        const cleanOldStr = sp.compareAtPrice ? sp.compareAtPrice.toLocaleString('fr-FR').replace(/\s/g, ' ') : ''
        const disc = sp.compareAtPrice && sp.compareAtPrice > sp.price
          ? `−${Math.round(((sp.compareAtPrice - sp.price) / sp.compareAtPrice) * 100)} %`
          : ''

        const detail: ProductDetailData = {
          id: sp.id,
          name: sp.name,
          subtitle: sp.description || `${sp.name} · Produit officiel avec garantie`,
          category: sp.category,
          subCategory: sp.subcategory || 'Général',
          store: sp.storeName,
          storeMark: sp.storeName.slice(0, 2).toUpperCase(),
          rating: String(sp.rating || 4.8),
          reviews: String(sp.reviewsCount || 42),
          soldCount: `+${sp.salesCount || 10}`,
          colors: [['Standard', '#006B55']],
          variants: {
            'Standard': {
              price: cleanPriceStr,
              old: cleanOldStr,
              discount: disc,
              ram: sp.brand || 'Original',
            },
          },
          gallery: sp.images && sp.images.length > 0 ? sp.images : [sp.mainImage],
          description: sp.description || `${sp.name}. Produit authentique disponible immédiatement en livraison 58 wilayas.`,
          tags: ['Garantie Vendeur', '100% Authentique', 'Livraison 58 wilayas', sp.brand || 'Dzora'],
          highlights: [
            `Article vérifié et approuvé par la modération Dzora`,
            `Vendu et expédié par la boutique officielle ${sp.storeName}`,
            `Paiement sécurisé à la livraison ou par carte CIB / Edahabia`,
            `Garantie retour et assistance client Dzora`,
          ],
          specs: [
            ['Marque', sp.brand || 'Original'],
            ['Référence SKU', sp.sku],
            ['Catégorie', sp.category],
            ['Boutique vendeuse', sp.storeName],
            ['Stock disponible', `${sp.stock} unités`],
            ['Poids estimé', sp.weightKg ? `${sp.weightKg} kg` : 'Standard'],
            ['Livraison', '58 Wilayas'],
          ],
        }
        setDynamicProduct(detail)
      }
    })
  }, [decodedSlug])

  const staticProductData = useMemo(() => {
    if (!decodedSlug) return productCatalog['galaxy-a15']

    const foundKey = Object.keys(productCatalog).find((k) => {
      const p = productCatalog[k]
      return (
        decodedSlug.includes(k) ||
        k.includes(decodedSlug) ||
        p.name.toLowerCase().includes(decodedSlug) ||
        decodedSlug.includes(p.name.toLowerCase()) ||
        p.id.toLowerCase().includes(decodedSlug)
      )
    })
    return productCatalog[foundKey || 'galaxy-a15']
  }, [decodedSlug])

  const productData = dynamicProduct || staticProductData

  const [imageIndex, setImageIndex] = useState(0)
  const [color, setColor] = useState(productData.colors[0]?.[0] || 'Défaut')
  const [variantKey, setVariantKey] = useState(Object.keys(productData.variants)[0])
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)
  const [following, setFollowing] = useState(false)
  const [tab, setTab] = useState('Description')
  const [status, setStatus] = useState('')
  const { addToCart: addCartItem } = useCart()

  // Sync state if product changes
  useEffect(() => {
    setImageIndex(0)
    setColor(productData.colors[0]?.[0] || 'Défaut')
    setVariantKey(Object.keys(productData.variants)[0])
    setQuantity(1)
    setAdded(false)
  }, [productData])

  const currentVariant = productData.variants[variantKey] || Object.values(productData.variants)[0]

  const notify = (message: string) => {
    setStatus(message)
    window.setTimeout(() => setStatus(''), 2600)
  }

  const addToCart = (count = quantity) => {
    const cleanPrice = Number(currentVariant.price.replace(/[^0-9.]/g, '')) || 0
    const cleanOld = currentVariant.old ? Number(currentVariant.old.replace(/[^0-9.]/g, '')) : undefined

    const item = {
      id: `${productData.id}-${variantKey}-${color}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: `${productData.name} ${variantKey}`,
      variant: `${variantKey} · ${color}`,
      description: productData.store,
      currentPrice: cleanPrice,
      previousPrice: cleanOld,
      discount: currentVariant.discount,
      quantity: count,
      image: productData.gallery[imageIndex] || productData.gallery[0],
      link: `/products/${encodeURIComponent(productData.name)}`,
    }

    addCartItem(item)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
    notify(`${count} × ${productData.name} (${variantKey}) ajouté au panier`)
  }

  const handleBuyNow = () => {
    addToCart(quantity)
    router.push('/panier')
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
          <Link href="/" className="shrink-0 hover:text-[#08785F]">{productData.category}</Link>
          <ChevronRight size={13} />
          <span className="shrink-0 text-[#84928E]">{productData.subCategory}</span>
          <ChevronRight size={13} />
          <span className="truncate font-semibold text-[#35504B]">{productData.name}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.04fr_.96fr] lg:gap-12">
          {/* Gallery View */}
          <div>
            <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-[#E1ECE7] bg-white p-8 sm:h-[480px]">
              {currentVariant.discount && (
                <span className="absolute left-4 top-4 rounded-md bg-[#E86E5B] px-2.5 py-1.5 text-xs font-bold text-white">
                  {currentVariant.discount}
                </span>
              )}
              {productData.gallery.length > 1 && (
                <button
                  type="button"
                  aria-label="Image précédente"
                  onClick={() => setImageIndex((imageIndex + productData.gallery.length - 1) % productData.gallery.length)}
                  className="absolute left-3 grid size-9 place-items-center rounded-full border border-[#E1ECE7] bg-white text-[#08785F] shadow-sm hover:bg-[#F2F8F5]"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <img
                src={productData.gallery[imageIndex] || productData.gallery[0]}
                alt={`${productData.name}, vue ${imageIndex + 1}`}
                className="size-full object-contain"
              />
              {productData.gallery.length > 1 && (
                <button
                  type="button"
                  aria-label="Image suivante"
                  onClick={() => setImageIndex((imageIndex + 1) % productData.gallery.length)}
                  className="absolute right-3 grid size-9 place-items-center rounded-full border border-[#E1ECE7] bg-white text-[#08785F] shadow-sm hover:bg-[#F2F8F5]"
                >
                  <ChevronRight size={18} />
                </button>
              )}
              <div className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-white text-[#71827D] shadow-sm">
                <ZoomIn size={16} />
              </div>
            </div>
            {productData.gallery.length > 1 && (
              <div className="mt-3 flex gap-2.5">
                {productData.gallery.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    aria-label={`Sélectionner la vue ${index + 1}`}
                    onClick={() => setImageIndex(index)}
                    className={`size-[72px] overflow-hidden rounded-lg border-2 bg-white p-1 transition ${
                      index === imageIndex ? 'border-[#08785F]' : 'border-[#E1ECE7] hover:border-[#B5D5CB]'
                    }`}
                  >
                    <img src={src} alt="" className="size-full object-contain" />
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-[#84928E]">Visuels officiels de {productData.name}</p>
          </div>

          {/* Product Details & Purchase Controls */}
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#EAF8F2] px-2.5 py-1 text-[11px] font-bold text-[#08785F]">
                {productData.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#08785F]">
                <span className="size-2 rounded-full bg-[#1BA477]" /> En stock
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-[-.04em] text-[#173B36] sm:text-[38px]">
              {productData.name} <span className="font-medium text-[#5B706A]">{variantKey}</span>
            </h1>
            <p className="mt-2 text-sm text-[#71827D]">{productData.subtitle}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex gap-0.5 text-[#E5A52C]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} fill="currentColor" />
                ))}
              </span>
              <button
                type="button"
                onClick={() => {
                  setTab('Avis')
                  document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="font-bold hover:text-[#08785F]"
              >
                {productData.rating} <span className="font-normal text-[#71827D]">({productData.reviews} avis)</span>
              </button>
              <span className="text-[#C7D5D0]">|</span>
              <span className="text-[#71827D]">{productData.soldCount} vendus</span>
            </div>

            <div className="my-5 border-y border-[#E5EEEA] py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-[#D9574A]">{currentVariant.price} DA</span>
                {currentVariant.old && (
                  <span className="text-sm text-[#8A9995] line-through">{currentVariant.old} DA</span>
                )}
                {currentVariant.discount && (
                  <span className="rounded bg-[#FFF0ED] px-2 py-1 text-[11px] font-bold text-[#D9574A]">
                    {currentVariant.discount}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[#84928E]">Prix TTC · Paiement en espèces à la livraison disponible</p>
            </div>

            <div className="space-y-4">
              {/* Color Selection */}
              {productData.colors.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">
                    Couleur : <span className="text-[#08785F]">{color}</span>
                  </p>
                  <div className="flex gap-3">
                    {productData.colors.map(([name, swatch]) => (
                      <button
                        key={name}
                        type="button"
                        aria-label={name}
                        aria-pressed={color === name}
                        onClick={() => setColor(name)}
                        className={`size-8 rounded-full border-2 p-0.5 transition ${
                          color === name ? 'border-[#08785F] scale-110' : 'border-transparent hover:scale-105'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: swatch }}
                          className="block size-full rounded-full border border-black/10"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant / Capacity Selection */}
              <div>
                <p className="mb-2 text-sm font-semibold">Option / Déclinaison :</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(productData.variants).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={variantKey === option}
                      onClick={() => setVariantKey(option)}
                      className={`rounded-lg border px-4 py-2 text-xs transition ${
                        variantKey === option
                          ? 'border-[#08785F] bg-[#EAF8F2] font-bold text-[#08785F]'
                          : 'border-[#D7E7E1] hover:border-[#B5D5CB]'
                      }`}
                    >
                      {option}
                      <span className="ml-1 text-[#71827D]">{productData.variants[option].ram}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Quantité :</span>
                <div className="flex h-9 items-center rounded-lg border border-[#D7E7E1] bg-white">
                  <button
                    type="button"
                    aria-label="Diminuer la quantité"
                    onClick={() => changeQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className="grid size-9 place-items-center text-[#08785F] disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Augmenter la quantité"
                    onClick={() => changeQuantity(quantity + 1)}
                    className="grid size-9 place-items-center text-[#08785F]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs font-semibold text-[#08785F]">● Plus que 8 pièces disponibles</span>
              </div>

              {/* Action Buttons: Add To Cart, Buy Now, Favorite */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => addToCart()}
                  className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                    added
                      ? 'bg-[#006B55] text-white shadow-md scale-[1.01]'
                      : 'border-2 border-[#006B55] text-[#006B55] hover:bg-[#EAF8F2] active:scale-[0.98]'
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={18} className="animate-in zoom-in-50 duration-150" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Ajouter au panier</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#006B55] text-sm font-bold text-white transition-all hover:bg-[#008F72] active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  <span>Acheter maintenant</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-pressed={liked}
                  onClick={() => {
                    setLiked(!liked)
                    notify(liked ? 'Retiré de vos favoris.' : 'Ajouté à vos favoris.')
                  }}
                  className={`grid size-12 shrink-0 place-items-center rounded-xl border transition cursor-pointer ${
                    liked ? 'border-[#E86E5B] text-[#E86E5B] bg-[#FFF3F0]' : 'border-[#D7E7E1] text-[#08785F] hover:bg-[#F2F8F5]'
                  }`}
                >
                  <Heart size={19} fill={liked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Delivery Assurance Panel */}
            <div className="mt-5 rounded-xl border border-[#CDE8DB] bg-[#EAF8F2] p-4">
              <div className="flex gap-3">
                <Truck size={20} className="shrink-0 text-[#08785F]" />
                <div className="text-xs">
                  <p className="font-bold">Livraison partout en Algérie</p>
                  <p className="mt-1 text-[#607A72]">À domicile ou en point relais 58 wilayas</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#CDE8DB] pt-3">
                    <span>Livraison estimée<br /><b>2 à 4 jours ouvrés</b></span>
                    <span>Frais de livraison<br /><b>À partir de 400 DA</b></span>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 border-t border-[#CDE8DB] pt-3 text-[#41665C]">
                    <ShieldCheck size={14} />Payez en espèces à la réception — simple et sécurisé
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E1ECE7] bg-white p-3">
              <Link
                href="/vendeur/techno-blida"
                className="grid size-10 place-items-center rounded-full bg-[#EAF8F2] text-xs font-bold text-[#08785F] transition hover:opacity-80"
              >
                {productData.storeMark}
              </Link>
              <div className="min-w-0 flex-1 text-xs">
                <p className="text-[#84928E]">Vendu par</p>
                <Link href="/vendeur/techno-blida" className="font-bold hover:text-[#08785F] transition-colors">
                  {productData.store} <BadgeCheck className="ml-1 inline text-[#08785F]" size={13} />
                </Link>
                <p className="mt-0.5 text-[#71827D]">★★★★★ 4,9 · Boutique vérifiée</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFollowing(!following)
                  notify(following ? `Vous ne suivez plus ${productData.store}.` : `Vous suivez maintenant ${productData.store}.`)
                }}
                className="rounded-lg border border-[#B7D9CE] px-3 py-2 text-xs font-bold text-[#08785F] hover:bg-[#F2F8F5]"
              >
                {following ? 'Suivi ✓' : 'Suivre'}
              </button>
            </div>
          </div>
        </section>

        {/* Global Toast Notification */}
        <div
          aria-live="polite"
          className={`fixed bottom-16 sm:bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#173B36] px-5 py-3 text-xs font-semibold text-white shadow-xl transition-all duration-200 ${
            status ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
          }`}
        >
          {status}
        </div>

        {/* Value Props Bar */}
        <section className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-[#EAF8F2] p-4 sm:grid-cols-4 sm:gap-5 sm:p-6">
          {[
            ['Livraison rapide', 'Partout en Algérie', Truck],
            ['Paiement à la livraison', 'Simple et sécurisé', ShieldCheck],
            ['Service client', 'Toujours à votre écoute', BadgeCheck],
            ['Vendeurs vérifiés', 'Des boutiques de confiance', Check],
          ].map(([title, subtitle, Icon]) => (
            <div key={title as string} className="flex items-center gap-2">
              <Icon size={20} className="shrink-0 text-[#08785F]" />
              <div>
                <p className="text-[11px] font-bold sm:text-xs">{title as string}</p>
                <p className="text-[10px] text-[#71827D]">{subtitle as string}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Detailed Tabs Section */}
        <section id="details" className="mt-8 rounded-2xl border border-[#E1ECE7] bg-white p-5 sm:p-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[.16em] text-[#08785F]">TOUT SAVOIR</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold">{productData.name}, en détail</h2>
            </div>
            <span className="hidden text-xs text-[#84928E] sm:block">{productData.store}</span>
          </div>

          <div className="mt-5 flex gap-5 overflow-x-auto border-b border-[#E5EEEA] text-sm font-semibold">
            {['Description', 'Caractéristiques', 'Avis'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`whitespace-nowrap border-b-2 pb-3 transition ${
                  tab === item ? 'border-[#08785F] text-[#08785F]' : 'border-transparent text-[#84928E] hover:text-[#123330]'
                }`}
              >
                {item === 'Avis' ? `Avis clients (${productData.reviews})` : item}
              </button>
            ))}
          </div>

          {tab === 'Description' && (
            <div className="grid gap-7 pt-6 lg:grid-cols-[1.4fr_.8fr]">
              <div>
                <h3 className="text-xl font-bold">Points clés & description</h3>
                <p className="mt-3 text-sm leading-7 text-[#607A72]">{productData.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {productData.tags.map((chip) => (
                    <span key={chip} className="rounded-full bg-[#EAF8F2] px-3 py-1.5 text-xs font-semibold text-[#08785F]">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-[#FCFAF7] p-5">
                <h3 className="font-bold">Les points forts</h3>
                <ul className="mt-3 space-y-3 text-xs text-[#607A72]">
                  {productData.highlights.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check size={15} className="shrink-0 text-[#08785F]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'Caractéristiques' && (
            <div className="grid gap-x-8 gap-y-3 pt-6 text-sm sm:grid-cols-2">
              {productData.specs.map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-[#EDF3F0] py-2">
                  <span className="text-[#84928E]">{label}</span>
                  <b>{value}</b>
                </div>
              ))}
            </div>
          )}

          {tab === 'Avis' && (
            <div className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="rounded-xl bg-[#FCFAF7] p-5">
                <p className="text-2xl font-extrabold">{productData.rating}/5</p>
                <p className="text-sm text-[#E5A52C]">★★★★★</p>
                <p className="mt-2 text-xs text-[#71827D]">Basé sur {productData.reviews} avis vérifiés</p>
              </div>
              {[
                'Livraison rapide, article 100% conforme et très bien emballé.',
                'Excellent produit, vendeur sérieux que je recommande sans hésiter.',
              ].map((review, index) => (
                <div key={review} className="rounded-xl border border-[#E1ECE7] p-4 text-xs">
                  <p className="text-[#E5A52C]">★★★★★</p>
                  <p className="mt-2 font-bold">Très satisfait</p>
                  <p className="mt-1 leading-5 text-[#607A72]">{review}</p>
                  <p className="mt-3 text-[#84928E]">Client vérifié Dzora · {index ? '12 sept. 2024' : '18 sept. 2024'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Products Carousel */}
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
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.name}
                product={p}
                onAddToCart={(prod) => {
                  notify(`1 × ${prod.name} ajouté au panier`)
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
          <Link href="/" className="rounded-lg bg-[#08785F] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#065F4B]">
            Découvrir Dzora →
          </Link>
        </div>
      </section>
    </div>
  )
}
