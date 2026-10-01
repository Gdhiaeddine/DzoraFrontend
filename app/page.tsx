'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CircleUserRound,
  Clock3,
  Heart,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Truck,
  ChevronRight,
} from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { ProductCard } from '@/components/product-card'

const categories = [
  ['Électronique', '📱', 'bg-[#E8F4F1]'],
  ['Mode', '👕', 'bg-[#FFF0E4]'],
  ['Maison & Cuisine', '🏠', 'bg-[#FFF7D9]'],
  ['Beauté & Santé', '💄', 'bg-[#FDEBF1]'],
  ['Sport & Loisirs', '⚽', 'bg-[#E9F3FF]'],
  ['Enfants & Bébés', '🧸', 'bg-[#FFF1E5]'],
  ['Auto & Moto', '🚗', 'bg-[#EAF0F4]'],
  ['High-Tech', '🎧', 'bg-[#EEEAFE]'],
  ['Meubles', '🛋️', 'bg-[#F6EDE4]'],
  ['Jardin & Bricolage', '🔧', 'bg-[#EAF5E8]'],
]

const products = [
  { name: 'Écouteurs Bluetooth TWS', store: 'Tech Sétif', price: '3 990', old: '6 990', discount: '-43%', rating: '4.8', reviews: '125', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=85' },
  { name: 'Montre connectée SmartWatch', store: 'Techno Blida', price: '7 990', old: '9 990', discount: '-20%', rating: '4.7', reviews: '89', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=85' },
  { name: 'Baskets Homme Casual', store: 'DZ Fashion', price: '4 990', old: '6 000', discount: '-15%', rating: '4.9', reviews: '214', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=85' },
  { name: 'Samsung Galaxy A15', store: 'Techno Blida', price: '34 990', old: '42 000', discount: '-17%', rating: '4.8', reviews: '67', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=85' },
  { name: 'Air Fryer 5L', store: 'Maison Alger', price: '9 990', old: '12 000', discount: '-17%', rating: '4.6', reviews: '53', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=85' },
]

const sellers = [
  { name: 'Tech Sétif', city: 'Sétif', rating: '4.8', products: '248 produits', color: 'bg-[#E1F1ED]', mark: 'TS' },
  { name: 'Maison Alger', city: 'Alger', rating: '4.7', products: '183 produits', color: 'bg-[#FFF0DF]', mark: 'MA' },
  { name: 'DZ Fashion', city: 'Oran', rating: '4.9', products: '421 produits', color: 'bg-[#EFEAFE]', mark: 'DZ' },
]



function SectionHeading({ title, subtitle, action = 'Voir tout →' }: { title: string; subtitle?: string; action?: string }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A] sm:text-[30px]">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-[#60716F]">{subtitle}</p>}
      </div>
      <button className="hidden shrink-0 items-center gap-2 text-sm font-bold text-[#006B55] transition-colors hover:text-[#F28C28] sm:flex">
        {action}
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

function PromoCard({ className, eyebrow, title, text, cta, image, dark = false }: { className: string; eyebrow: string; title: string; text: string; cta: string; image: string; dark?: boolean }) {
  return (
    <article className={`relative min-h-[230px] overflow-hidden rounded-2xl p-6 ${className} ${dark ? 'text-white' : 'text-[#102A2A]'}`}>
      <div className="relative z-10 max-w-[220px]">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-[#A8D6C9]' : 'text-[#C56816]'}`}>{eyebrow}</p>
        <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-[-0.04em]">{title}</h3>
        <p className={`mt-2 text-xs ${dark ? 'text-[#C6E1D9]' : 'text-[#60716F]'}`}>{text}</p>
        <button className={`mt-5 inline-flex items-center gap-1 text-xs font-bold ${dark ? 'text-[#FFB84D]' : 'text-[#006B55]'}`}>
          {cta} <ArrowRight size={14} />
        </button>
      </div>
      <img src={image} alt="" className="absolute bottom-0 right-[-15px] h-[82%] w-[58%] object-cover object-left opacity-90 mix-blend-multiply" />
    </article>
  )
}

export default function Page() {
  const { addToCart } = useCart()

  return (
    <div className="overflow-x-hidden">
      <main>
        <section className="relative mx-auto max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-7">
          <div className="relative min-h-[520px] overflow-hidden rounded-[24px] bg-[#E7F2EF] sm:min-h-[550px]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(231,242,239,0.98)_0%,rgba(231,242,239,0.9)_37%,rgba(231,242,239,0.15)_75%)]" />
            <img src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1800&q=85" alt="Architecture moderne et lumière méditerranéenne en Algérie" className="absolute inset-0 size-full object-cover object-center opacity-45" />
            <div className="relative flex min-h-[520px] items-center px-7 py-12 sm:min-h-[550px] sm:px-12 lg:px-16">
              <div className="max-w-[570px]">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BBDDD4] bg-white/70 px-3 py-1.5 text-xs font-bold text-[#006B55] backdrop-blur-sm">
                  🇩🇿 Marketplace 100% algérien
                </div>
                <h1 className="font-display text-[42px] font-extrabold leading-[1.04] tracking-[-0.055em] text-[#102A2A] sm:text-[58px]">
                  Tout ce dont vous avez besoin,<br />
                  <span className="text-[#006B55]">au même endroit.</span>
                </h1>
                <p className="mt-5 max-w-[450px] text-base leading-7 text-[#43615C] sm:text-lg">
                  Des milliers de produits. Des vendeurs de confiance. Une livraison partout en Algérie.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-[#006B55] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,107,85,0.22)] transition hover:bg-[#008F72]">
                    Découvrir maintenant <ArrowRight size={17} />
                  </button>
                  <button className="rounded-xl border border-[#B7D6CE] bg-white/70 px-5 py-3.5 text-sm font-bold text-[#006B55] transition hover:bg-white">
                    Voir les promotions
                  </button>
                </div>
                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[#43615C]">
                  <span className="flex items-center gap-2"><Truck size={16} className="text-[#008F72]" /> Livraison partout</span>
                  <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#008F72]" /> Paiement sécurisé</span>
                  <span className="flex items-center gap-2"><CircleUserRound size={16} className="text-[#008F72]" /> Service local</span>
                </div>
              </div>
              <div className="absolute bottom-8 right-8 hidden max-w-[190px] rotate-[-5deg] rounded-2xl bg-white/80 p-4 shadow-xl backdrop-blur-md xl:block">
                <Sparkles size={17} className="text-[#F28C28]" />
                <p className="mt-2 font-display text-sm font-bold italic leading-5 text-[#006B55]">
                  « Dzora, c'est plus qu'un achat. C'est la confiance. »
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionHeading title="Catégories populaires" action="Voir toutes les catégories" />
          <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-none sm:grid sm:grid-cols-5 sm:gap-6 lg:grid-cols-10">
            {categories.map(([name, icon, bg]) => (
              <button key={name} className="group flex min-w-[92px] shrink-0 flex-col items-center gap-3 text-center">
                <span className={`grid size-[68px] place-items-center rounded-full text-2xl transition duration-200 group-hover:scale-110 ${bg}`}>
                  {icon}
                </span>
                <span className="text-xs font-semibold text-[#43615C] transition group-hover:text-[#006B55]">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            <PromoCard className="bg-[#006B55]" eyebrow="Électronique" title="Les dernières technologies" text="Smartphones, accessoires et plus." cta="Voir la sélection" image="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=85" dark />
            <PromoCard className="bg-[#FFF0E4]" eyebrow="Mode" title="Style & élégance" text="Pour toutes les occasions." cta="Découvrir" image="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85" />
            <PromoCard className="bg-[#FFF7D9]" eyebrow="Maison & Cuisine" title="Équipez votre maison" text="Qualité et confort au quotidien." cta="Voir les offres" image="https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=85" />
          </div>
        </section>

        <section className="border-y border-[#DDEDE8] bg-[#F1F9F6]">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[[Truck, 'Livraison rapide', 'Partout en Algérie'], [ShieldCheck, 'Paiement sécurisé', 'Simple et sécurisé'], [CircleUserRound, 'Service client', 'Toujours à votre écoute'], [BadgeCheck, 'Vendeurs vérifiés', 'Des boutiques de confiance']].map(([Icon, title, text]) => (
              <div key={title as string} className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#006B55] shadow-sm">
                  <Icon size={21} />
                </span>
                <div>
                  <p className="text-sm font-bold">{title as string}</p>
                  <p className="mt-1 text-xs text-[#60716F]">{text as string}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading title="Meilleures ventes" subtitle="Les produits les plus populaires sur Dzora" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.name} product={product} onAddToCart={() => addToCart(1)} />
            ))}
          </div>
        </section>

        <section className="bg-[#F4FAF7]">
          <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#FFF0E4] px-3 py-1.5 text-xs font-bold text-[#C56816]">
                  <Sparkles size={14} /> Offre limitée
                </div>
                <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-[30px]">Offres flash</h2>
                <p className="mt-2 text-sm text-[#60716F]">Profitez-en avant la fin !</p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Clock3 size={18} className="text-[#F28C28]" />
                <span className="rounded-lg bg-white px-3 py-2 font-mono text-sm font-bold tracking-wider text-[#102A2A]">02 : 14 : 36</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
              {products.slice(0, 5).map((product, i) => (
                <div key={product.name}>
                  <ProductCard product={{ ...product, discount: i === 0 ? '-50%' : product.discount }} onAddToCart={() => addToCart(1)} />
                  <div className="px-1 pt-2 text-[10px] font-semibold text-[#60716F]">
                    <div className="mb-1 flex justify-between">
                      <span>{i * 5 + 23} vendus / 30</span>
                      <span className="text-[#E53935]">Plus que {30 - i * 5}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#DDEDE8]">
                      <div className="h-full rounded-full bg-[#F28C28]" style={{ width: `${62 - i * 7}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading title="Découvrez les vendeurs locaux" subtitle="Achetez auprès de boutiques vérifiées partout en Algérie." />
          <div className="grid gap-4 md:grid-cols-3">
            {sellers.map((seller) => (
              <article key={seller.name} className="flex items-center gap-4 rounded-2xl border border-[#E5EEEB] bg-white p-5 transition hover:border-[#B9D8D0] hover:shadow-[0_12px_28px_rgba(0,107,85,0.08)]">
                <div className={`grid size-14 shrink-0 place-items-center rounded-2xl text-sm font-extrabold text-[#006B55] ${seller.color}`}>
                  {seller.mark}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{seller.name}</h3>
                    <BadgeCheck size={15} className="text-[#008F72]" />
                  </div>
                  <p className="mt-1 text-xs text-[#60716F]">📍 {seller.city} <span className="mx-1">•</span> {seller.products}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#F28C28]">
                    <Star size={12} fill="currentColor" /> {seller.rating} <span className="font-normal text-[#94A4A0]">Vendeur vérifié</span>
                  </p>
                </div>
                <button aria-label={`Visiter ${seller.name}`} className="grid size-9 place-items-center rounded-lg bg-[#F1F9F6] text-[#006B55] transition hover:bg-[#008F72] hover:text-white">
                  <ChevronRight size={17} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#F7FBF9]">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-20">
            <div className="max-w-[500px]">
              <span className="mb-4 inline-flex rounded-full bg-[#E1F1ED] px-3 py-1.5 text-xs font-bold text-[#006B55]">Une expérience plus proche</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-[40px]">
                Pourquoi choisir <span className="text-[#006B55]">Dzora</span> ?
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#60716F]">
                Parce que nous croyons qu'un e-commerce plus proche, plus simple et plus fiable est possible. Dzora réunit les meilleurs vendeurs de toute l'Algérie pour vous offrir une expérience d'achat unique.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#006B55]">
                En savoir plus <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid max-w-[650px] flex-1 grid-cols-2 gap-3 sm:gap-5">
              {[['Large choix', 'Des milliers de produits dans un même endroit'], ['Prix compétitifs', 'Des offres adaptées au marché algérien'], ['Livraison rapide', 'Dans toutes les wilayas d’Algérie'], ['Support local', 'Une équipe basée en Algérie']].map(([title, text], i) => (
                <div key={title} className="rounded-2xl border border-[#DDEDE8] bg-white p-5 sm:p-7">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#EAF5F1] text-sm font-bold text-[#006B55]">0{i + 1}</span>
                  <h3 className="mt-5 font-bold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#60716F]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[24px] bg-[#004C3D] px-7 py-12 text-white sm:px-12 lg:px-16">
            <div className="absolute -right-12 -top-24 size-72 rounded-full border-[35px] border-white/5" />
            <div className="relative max-w-[560px]">
              <Store size={25} className="mb-5 text-[#FFB84D]" />
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-[40px]">
                Vous êtes vendeur ?<br />
                <span className="text-[#FFB84D]">Développez votre activité</span> avec Dzora.
              </h2>
              <p className="mt-4 max-w-[480px] text-sm leading-6 text-[#C6E1D9]">
                Créez votre boutique, publiez vos produits et touchez des clients partout en Algérie.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button className="rounded-xl bg-[#F28C28] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#FFB84D]">
                  Devenir vendeur <ArrowRight className="ml-1 inline" size={16} />
                </button>
                <button className="rounded-xl border border-white/25 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                  Découvrir les avantages
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#E8F0ED] bg-[#F1F9F6]">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-4 py-14 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-8 lg:py-16 lg:text-left">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.04em]">Dzora dans votre poche.</h2>
              <p className="mt-3 max-w-[420px] text-sm leading-6 text-[#60716F]">
                Découvrez, commandez et suivez vos achats où que vous soyez.
              </p>
              <div className="mt-6 flex justify-center gap-3 lg:justify-start">
                <button className="flex items-center gap-2 rounded-xl bg-[#102A2A] px-4 py-2.5 text-left text-white">
                  <Play size={17} fill="white" />
                  <span className="text-[10px] leading-3">Disponible sur<br /><b className="text-sm">Google Play</b></span>
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-[#102A2A] px-4 py-2.5 text-left text-white">
                  <span className="text-xl"></span>
                  <span className="text-[10px] leading-3">Télécharger dans<br /><b className="text-sm">l'App Store</b></span>
                </button>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="h-44 w-24 rounded-[19px] border-4 border-[#102A2A] bg-white p-1 shadow-xl sm:h-52 sm:w-28">
                <div className="h-full rounded-[14px] bg-[#E1F1ED] p-2">
                  <div className="mt-2 h-2 w-12 rounded bg-[#006B55]" />
                  <div className="mt-3 h-20 rounded-lg bg-[#FFF0E4]" />
                  <div className="mt-3 grid grid-cols-2 gap-1">
                    <div className="h-9 rounded bg-white" />
                    <div className="h-9 rounded bg-white" />
                  </div>
                </div>
              </div>
              <div className="h-52 w-28 rounded-[21px] border-4 border-[#102A2A] bg-white p-1 shadow-xl sm:h-64 sm:w-32">
                <div className="h-full rounded-[16px] bg-[#006B55] p-2">
                  <div className="mt-4 text-[10px] font-bold text-white">Bonjour, Sarah</div>
                  <div className="mt-3 h-24 rounded-xl bg-[#FFB84D]" />
                  <div className="mt-3 h-2 w-16 rounded bg-white/50" />
                  <div className="mt-3 h-12 rounded-lg bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em]">Ne manquez aucune bonne affaire.</h2>
          <p className="mt-2 text-sm text-[#60716F]">Recevez nos nouveautés et offres exclusives.</p>
          <div className="mx-auto mt-6 flex max-w-[490px] rounded-xl border border-[#D9E7E2] bg-white p-1.5 shadow-sm">
            <input type="email" placeholder="Votre adresse e-mail" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
            <button className="rounded-lg bg-[#006B55] px-4 py-2.5 text-xs font-bold text-white">S'inscrire</button>
          </div>
        </section>
      </main>
    </div>
  )
}
