import { Truck } from 'lucide-react'

export function AnnouncementBar() {
  return (
    <div className="border-b border-[#0B7B63] bg-[#005A48] px-4 py-2.5 text-[11px] font-medium text-white sm:text-xs">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Truck size={14} className="shrink-0 text-[#FFB84D]" />
          <p className="tracking-[0.01em]">Livraison partout en Algérie</p>
          <span className="hidden text-white/30 sm:inline">|</span>
          <p className="hidden text-white/80 sm:block">Paiement sécurisé</p>
          <span className="hidden text-white/30 md:inline">|</span>
          <p className="hidden text-white/80 md:block">Des milliers de produits</p>
        </div>
        <span className="hidden items-center gap-2 text-[10px] font-semibold tracking-wide text-white/85 sm:flex">
          Algérie <span className="text-white/30">|</span> FR
        </span>
      </div>
    </div>
  )
}
