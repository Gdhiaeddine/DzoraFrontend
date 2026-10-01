import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative grid size-10 place-items-center rounded-[13px] bg-[#006B55] text-white shadow-sm">
        <ShoppingBag size={20} strokeWidth={2.5} />
        <span className="absolute right-[8px] top-[6px] size-2 rounded-full bg-[#F28C28]" />
      </div>
      <div>
        <div className="font-display text-[25px] font-extrabold leading-none tracking-[-0.04em] text-[#006B55]">
          Dzora
        </div>
        <div className="mt-1 text-[9px] font-semibold tracking-[0.1em] text-[#60716F]">
          TOUT PRÈS DE VOUS
        </div>
      </div>
    </Link>
  )
}
