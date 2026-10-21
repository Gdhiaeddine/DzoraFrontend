import Link from 'next/link'
import { Logo } from './logo'
import { AlgeriaFlag } from './algeria-flag'

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
          <Logo variant="white-text" imageClassName="h-16 sm:h-20 md:h-24" />
          <p className="mt-3 max-w-[240px] text-xs leading-5 text-[#A5C8BF]">
            Tout près de vous partout en Algérie.
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
            <span className="inline-flex items-center gap-1.5">
              <AlgeriaFlag className="h-3 w-4.5 rounded-[2px] shadow-2xs border border-white/20" />
              <span>Algérie</span>
            </span>
            <span>FR | العربية</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
