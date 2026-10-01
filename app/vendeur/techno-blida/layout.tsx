import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Techno Blida — Boutique Dzora',
  description: 'Boutique officielle Techno Blida sur Dzora. Smartphones, accessoires & audio sélectionnés pour vous en Algérie.',
}

export default function VendeurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
