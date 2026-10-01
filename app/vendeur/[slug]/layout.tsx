import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'techno-blida') {
    return {
      title: 'Techno Blida — Boutique Dzora',
      description: 'Boutique officielle Techno Blida sur Dzora. Smartphones, accessoires & audio sélectionnés pour vous en Algérie.',
    }
  }

  const formatted = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return {
    title: `${formatted} — Boutique Dzora`,
    description: `Boutique officielle ${formatted} sur Dzora. Marketplace algérien.`,
  }
}

export default function VendeurDynamicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
