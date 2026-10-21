import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer ma boutique — Espace vendeur Dzora',
  description: 'Présentez votre boutique aux clients Dzora : nom, catégorie, wilaya, description et logo.',
}

export default function CreerBoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children
}
