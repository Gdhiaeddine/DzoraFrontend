'use client'

import Link from 'next/link'
import { ArrowRight, BadgeCheck, CheckCircle, ChevronRight, Eye, Package, Sparkles, Store, Truck } from 'lucide-react'
import { categories, categoryIcons } from '@/lib/categories'


const sellerSteps = [
  {
    number: 1,
    title: 'Présentez votre boutique',
    description: 'Indiquez son nom et son activité.',
    icon: Store,
  },
  {
    number: 2,
    title: 'Ajoutez vos produits',
    description: 'Composez votre catalogue et présentez votre sélection.',
    icon: Package,
  },
  {
    number: 3,
    title: 'Préparez vos commandes',
    description: 'Faites découvrir vos produits aux clients Dzora.',
    icon: Truck,
  },
]

export default function DevenirVendeurPage() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }
  }

  const handleScrollToSteps = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollTo('comment-ca-marche')
    window.history.pushState(null, '', '#comment-ca-marche')
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-[url('/assets/dzoraDevenirVendeurHero.webp')] bg-cover bg-right md:bg-center min-h-[480px] sm:min-h-[540px] md:min-h-[580px] lg:min-h-[620px]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E7F2EF]/95 via-[#E7F2EF]/85 to-transparent sm:w-3/4 md:w-2/3 lg:w-3/5" />
        <div className="relative mx-auto flex min-h-[480px] sm:min-h-[540px] md:min-h-[580px] lg:min-h-[620px] max-w-[1440px] flex-col justify-between px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-[#84928E]">
            <Link href="/" className="shrink-0 hover:text-[#08785F]">Accueil</Link>
            <ChevronRight size={13} />
            <span className="truncate font-semibold text-[#35504B]">Devenir vendeur</span>
          </nav>

          <div className="my-auto max-w-[580px] py-6">
            <p className="text-sm font-medium uppercase text-[#006B55]">ESPACE VENDEUR</p>
            <h1 className="font-display text-[40px] sm:text-[52px] md:text-[60px] font-extrabold leading-[1.04] tracking-[-0.055em] text-[#102A2A]">
              Votre boutique a sa place sur Dzora
            </h1>
            <p className="mt-5 max-w-[460px] text-base leading-7 text-[#60716F] sm:text-lg">
              Rejoignez la marketplace algérienne et présentez vos produits à des clients partout en Algérie.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/devenir-vendeur/creer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#006B55] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,107,85,0.22)] transition hover:bg-[#008F72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B55] focus-visible:ring-offset-2"
              >
                Créer ma boutique <ArrowRight size={17} />
              </Link>
              <a
                href="#comment-ca-marche"
                onClick={handleScrollToSteps}
                className="rounded-xl border border-[#B7D6CE] bg-white/80 px-6 py-3.5 text-sm font-bold text-[#006B55] transition hover:bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B55]"
              >
                Découvrir les étapes
              </a>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[#60716F]">
              <CheckCircle size={20} className="text-[#006B55]" />
              <span>Une marketplace pensée pour les vendeurs locaux</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[#DDEDE8] bg-[#F1F9F6]">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            [Eye, 'Visibilité nationale', 'Partout en Algérie'],
            [Store, 'Boutique à votre image', 'Un espace clair et soigné'],
            [BadgeCheck, 'Vendeurs locaux vérifiés', 'Une relation de confiance'],
            [Truck, 'Paiement à la livraison', 'Livraison et encaissement fiables'],
          ].map(([Icon, title, text]) => (
            <div key={title as string} className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#006B55] shadow-sm">
                <Icon size={21} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#102A2A]">{title as string}</p>
                <p className="mt-1 text-xs text-[#60716F]">{text as string}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-[620px]">
            <p className="text-sm font-medium uppercase text-[#006B55]">
              POURQUOI VENDRE SUR DZORA ?
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A] sm:text-[32px] md:text-[38px] leading-tight">
              Développez votre activité, <span className="text-[#006B55]">à votre rythme</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#60716F]">
              Rejoignez une marketplace pensée pour valoriser les commerçants algériens, avec des outils clairs et un accompagnement de proximité.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Store,
                title: 'Une vitrine à votre nom',
                text: 'Présentez votre boutique, votre univers et vos produits dans un espace moderne, clair et rassurant pour vos clients.',
              },
              {
                icon: Eye,
                title: 'De nouveaux clients qualifiés',
                text: 'Faites découvrir votre catalogue bien au-delà de votre wilaya et touchez des acheteurs actifs dans toute l’Algérie.',
              },
              {
                icon: Truck,
                title: 'Un commerce plus proche',
                text: 'Bénéficiez de la confiance des clients grâce à notre focus sur les vendeurs locaux, les avis vérifiés et le paiement à la livraison.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#DDEDE8] bg-[#F7FBF9]/60 p-7 transition duration-200 hover:border-[#B9D8D0] hover:bg-white hover:shadow-[0_12px_28px_rgba(0,107,85,0.08)]"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-[#EAF5F1] text-[#006B55]">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-base font-bold text-[#102A2A]">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#60716F]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche ? */}
      <section
        id="comment-ca-marche"
        aria-labelledby="comment-ca-marche-heading"
        className="scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32 bg-[#E7F2EF] py-14 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[620px] text-center">
            <p className="text-sm font-medium uppercase text-[#006B55]">
              PROCESSUS SIMPLE & RAPIDE
            </p>
            <h2
              id="comment-ca-marche-heading"
              className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A] sm:text-[32px] md:text-[36px]"
            >
              Comment ça marche ?
            </h2>
          </div>

          <div className="relative mt-12 sm:mt-16">
            {/* Desktop horizontal connector line between markers */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-[22px] left-[16.666%] right-[16.666%] h-[2px] bg-[#006B55]/30 pointer-events-none"
            />

            <ol className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6 lg:gap-8 list-none p-0 m-0">
              {sellerSteps.map((step, index) => (
                <li
                  key={step.number}
                  className="relative flex items-start gap-4 sm:gap-5 md:flex-col md:items-stretch md:gap-0"
                >
                  {/* Marker container with mobile connector line */}
                  <div className="relative flex flex-col items-center shrink-0 md:mb-6">
                    {/* Numbered circular marker */}
                    <span
                      aria-hidden="true"
                      className="relative z-10 grid size-11 place-items-center rounded-full border-2 border-[#006B55] bg-white text-base font-extrabold text-[#006B55] shadow-xs"
                    >
                      {step.number}
                    </span>

                    {/* Mobile vertical connector */}
                    {index < sellerSteps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="md:hidden absolute top-11 -bottom-6 left-1/2 w-[2px] -translate-x-1/2 bg-[#006B55]/30 pointer-events-none"
                      />
                    )}
                  </div>

                  {/* Step card */}
                  <div className="flex-1 rounded-2xl border border-[#DDEDE8] bg-white p-6 sm:p-7 shadow-xs transition duration-200 hover:border-[#B7D6CE] hover:shadow-[0_8px_20px_rgba(0,107,85,0.06)] md:flex md:flex-col md:items-center md:text-center">
                    <span
                      aria-hidden="true"
                      className="mb-4 grid size-12 sm:size-14 place-items-center rounded-xl bg-[#F1F9F6] text-[#006B55] md:mb-5 shrink-0"
                    >
                      <step.icon size={26} strokeWidth={1.75} />
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#102A2A]">
                      <span className="sr-only">Étape {step.number} : </span>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#60716F]">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[620px] text-center">
            <p className="text-sm font-medium uppercase text-[#006B55]">
              SECTEURS D’ACTIVITÉ
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A] sm:text-[32px] md:text-[38px]">
              Quel que soit votre domaine,<br />
              <span className="text-[#006B55]">votre boutique a sa place</span>
            </h2>
            <p className="mt-3 text-sm text-[#60716F]">
              Des milliers de clients explorent quotidiennement nos catégories à la recherche de vos produits.
            </p>
          </div>

          <div className="mt-10 flex gap-5 overflow-x-auto pb-3 scrollbar-none sm:grid sm:grid-cols-5 sm:gap-6 lg:grid-cols-10">
            {categories.map(([name, , bg]) => {
              const meta = categoryIcons[name]
              const IconComponent = meta?.icon
              const colorClass = meta?.color || 'text-[#006B55]'

              return (
                <div key={name} className="group flex min-w-[92px] shrink-0 flex-col items-center gap-3 text-center">
                  <span
                    className={`grid size-[68px] place-items-center rounded-full transition duration-200 group-hover:scale-110 shadow-sm ${bg} ${colorClass}`}
                  >
                    {IconComponent && <IconComponent size={26} strokeWidth={1.85} aria-hidden="true" />}
                  </span>
                  <span className="text-xs font-semibold text-[#43615C] transition group-hover:text-[#006B55]">
                    {name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing Call to Action */}
      <section className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-[24px] bg-[#004C3D] bg-[url('/assets/dzoraCTA.webp')] bg-cover bg-center sm:aspect-[2172/375] min-h-[200px] sm:min-h-0 flex items-center px-6 sm:px-10 md:px-12 lg:px-16 shadow-xl shadow-[#004C3D]/10">
          <div className="relative z-10 max-w-[540px] py-6 sm:py-0">
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-[-0.03em] text-white leading-tight drop-shadow-xs">
              Prêt à faire grandir votre boutique ?
            </h2>
            <p className="mt-1.5 sm:mt-2 md:mt-2.5 text-xs sm:text-sm md:text-base leading-snug sm:leading-relaxed text-white/95">
              Présentez vos produits à la communauté Dzora.
            </p>
            <div className="mt-4 sm:mt-4 md:mt-6">
              <Link
                href="/devenir-vendeur/creer"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 sm:px-7 sm:py-2.5 md:px-8 md:py-3 text-xs sm:text-sm font-bold text-[#006B55] shadow-md transition-all duration-200 hover:bg-[#E7F2EF] hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98]"
              >
                Créer ma boutique →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
