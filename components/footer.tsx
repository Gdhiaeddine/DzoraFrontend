import Link from 'next/link'
import { Logo } from './logo'

const footerSections = [
  ['À propos', 'Qui sommes-nous ?', 'Nos engagements', 'Carrières', 'Presse'],
  ['Acheter', 'Toutes les catégories', 'Promotions', 'Meilleures ventes', 'Suivre ma commande'],
  ['Vendre', 'Devenir vendeur', 'Centre vendeur', 'Tarifs et commissions', 'Règles marketplace'],
  ['Aide', 'Centre d’aide', 'Livraison', 'Paiement', 'Retours', 'Nous contacter'],
]

export function Footer() {
  return (
    <footer className="bg-[#003D31] text-[#C6E1D9]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-5 max-w-[190px] text-sm leading-6">
            Tout ce dont vous avez besoin, tout près de vous.
          </p>
          <div className="mt-5 flex gap-3 text-xs font-bold">
            <span className="cursor-pointer hover:text-white">f</span>
            <span className="cursor-pointer hover:text-white">◎</span>
            <span className="cursor-pointer hover:text-white">tk</span>
            <span className="cursor-pointer hover:text-white">▶</span>
          </div>
        </div>
        {footerSections.map(([title, ...links]) => (
          <div key={title}>
            <h3 className="mb-5 text-sm font-bold text-white">{title}</h3>
            <div className="flex flex-col gap-3 text-xs">
              {links.map((link) => (
                <Link key={link} href="/" className="transition hover:text-[#FFB84D]">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-5 text-[11px] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <span>© 2026 Dzora. Tous droits réservés.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-white">Conditions générales</Link>
            <Link href="/" className="hover:text-white">Politique de confidentialité</Link>
            <Link href="/" className="hover:text-white">Politique de retour</Link>
            <span>🇩🇿 Algérie</span>
            <span>FR | العربية</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
