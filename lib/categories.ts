import type { LucideIcon } from 'lucide-react'
import {
  Smartphone,
  Shirt,
  Utensils,
  Sparkles,
  Dumbbell,
  Baby,
  Car,
  Headphones,
  Armchair,
  Wrench,
} from 'lucide-react'

export type Category = readonly [name: string, icon: string, bg: string]

export interface SubCategoryItem {
  name: string
  slug: string
  badge?: string
}

export interface CategoryDetail {
  name: string
  slug: string
  icon: string
  lucideIcon: LucideIcon
  color: string
  bg: string
  description: string
  subcategories: SubCategoryItem[]
  featuredHighlight?: {
    title: string
    subtitle: string
    linkText: string
  }
}

export const categories: Category[] = [
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

export const categoryIcons: Record<string, { icon: LucideIcon; color: string }> = {
  'Électronique': { icon: Smartphone, color: 'text-[#006B55]' },
  'Mode': { icon: Shirt, color: 'text-[#C56816]' },
  'Maison & Cuisine': { icon: Utensils, color: 'text-[#9A6A08]' },
  'Beauté & Santé': { icon: Sparkles, color: 'text-[#C23368]' },
  'Sport & Loisirs': { icon: Dumbbell, color: 'text-[#1E6FD9]' },
  'Enfants & Bébés': { icon: Baby, color: 'text-[#D46B08]' },
  'Auto & Moto': { icon: Car, color: 'text-[#2F5A72]' },
  'High-Tech': { icon: Headphones, color: 'text-[#6941C6]' },
  'Meubles': { icon: Armchair, color: 'text-[#87553B]' },
  'Jardin & Bricolage': { icon: Wrench, color: 'text-[#2E7D32]' },
}

export const CATEGORIES_DETAILED: CategoryDetail[] = [
  {
    name: 'Électronique',
    slug: 'electronique',
    icon: '📱',
    lucideIcon: Smartphone,
    color: 'text-[#006B55]',
    bg: 'bg-[#E8F4F1]',
    description: 'Smartphones de grandes marques, tablettes, téléviseurs et objets connectés.',
    featuredHighlight: {
      title: 'Smartphones & 4G/5G',
      subtitle: 'Garantie constructeur & livraison 58 wilayas',
      linkText: 'Découvrir les offres',
    },
    subcategories: [
      { name: 'Smartphones & Téléphones', slug: 'smartphones', badge: 'Populaire' },
      { name: 'Tablettes & Liseuses', slug: 'tablettes' },
      { name: 'Montres & Bracelets connectés', slug: 'montres-connectees' },
      { name: 'Écouteurs & Audio mobile', slug: 'ecouteurs' },
      { name: 'Accessoires & Chargeurs', slug: 'accessoires-mobiles' },
      { name: 'Téléviseurs & Box TV', slug: 'televiseurs' },
      { name: 'Powerbanks & Batteries', slug: 'powerbanks' },
    ],
  },
  {
    name: 'Mode',
    slug: 'mode',
    icon: '👕',
    lucideIcon: Shirt,
    color: 'text-[#C56816]',
    bg: 'bg-[#FFF0E4]',
    description: 'Vêtements, chaussures, maroquinerie et artisanat traditionnel algérien.',
    featuredHighlight: {
      title: 'Tenues Traditionnelles',
      subtitle: 'Karakous, Gandouras et artisanat local',
      linkText: 'Voir la collection',
    },
    subcategories: [
      { name: 'Mode Homme', slug: 'mode-homme' },
      { name: 'Mode Femme', slug: 'mode-femme', badge: 'Tendance' },
      { name: 'Tenues traditionnelles & Karakous', slug: 'traditionnel', badge: 'Local DZ' },
      { name: 'Chaussures & Baskets', slug: 'chaussures' },
      { name: 'Sacs & Maroquinerie', slug: 'maroquinerie' },
      { name: 'Montres & Lunettes de soleil', slug: 'montres-lunettes' },
      { name: 'Bijoux & Accessoires', slug: 'bijoux' },
    ],
  },
  {
    name: 'Maison & Cuisine',
    slug: 'maison-cuisine',
    icon: '🏠',
    lucideIcon: Utensils,
    color: 'text-[#9A6A08]',
    bg: 'bg-[#FFF7D9]',
    description: 'Appareils électroménagers, art de la table et équipement de la maison.',
    featuredHighlight: {
      title: 'Petit Électroménager',
      subtitle: 'Robots, cafetières et friteuses sans huile',
      linkText: 'Équiper ma cuisine',
    },
    subcategories: [
      { name: 'Petit électroménager', slug: 'petit-electromenager', badge: 'Populaire' },
      { name: 'Gros électroménager', slug: 'gros-electromenager' },
      { name: 'Ustensiles de cuisine & Poêles', slug: 'ustensiles' },
      { name: 'Art de la table & Vaisselle', slug: 'art-de-la-table' },
      { name: 'Linge de maison & Couettes', slug: 'linge-de-maison' },
      { name: 'Rangement & Organisation', slug: 'rangement' },
    ],
  },
  {
    name: 'Beauté & Santé',
    slug: 'beaute-sante',
    icon: '💄',
    lucideIcon: Sparkles,
    color: 'text-[#C23368]',
    bg: 'bg-[#FDEBF1]',
    description: 'Soins cosmétiques, parfumerie authentique et matériel de bien-être.',
    featuredHighlight: {
      title: 'Parfumerie & Soins',
      subtitle: 'Produits certifiés 100% authentiques',
      linkText: 'Explorer les parfums',
    },
    subcategories: [
      { name: 'Parfums Homme & Femme', slug: 'parfums', badge: 'Top Vente' },
      { name: 'Soins du visage & Crèmes', slug: 'soins-visage' },
      { name: 'Maquillage & Beauté', slug: 'maquillage' },
      { name: 'Soins capillaires & Coiffure', slug: 'cheveux' },
      { name: 'Hygiène & Bain', slug: 'hygiene' },
      { name: 'Matériel médical & Santé', slug: 'sante' },
    ],
  },
  {
    name: 'Sport & Loisirs',
    slug: 'sport-loisirs',
    icon: '⚽',
    lucideIcon: Dumbbell,
    color: 'text-[#1E6FD9]',
    bg: 'bg-[#E9F3FF]',
    description: 'Équipements de fitness, football, sports extérieurs et tenues sportives.',
    featuredHighlight: {
      title: 'Football & Fitness',
      subtitle: 'Maillots, ballons et bancs de musculation',
      linkText: 'S’équiper maintenant',
    },
    subcategories: [
      { name: 'Fitness & Musculation', slug: 'fitness', badge: 'Populaire' },
      { name: 'Football & Sports d’équipe', slug: 'football', badge: 'DZ Sport' },
      { name: 'Vêtements & Maillots de sport', slug: 'vetements-sport' },
      { name: 'Camping, Tentes & Randonnée', slug: 'camping' },
      { name: 'Vélos & Trottinettes', slug: 'velos-trottinettes' },
      { name: 'Nutrition sportive & Gourdes', slug: 'nutrition' },
    ],
  },
  {
    name: 'Enfants & Bébés',
    slug: 'enfants-bebes',
    icon: '🧸',
    lucideIcon: Baby,
    color: 'text-[#D46B08]',
    bg: 'bg-[#FFF1E5]',
    description: 'Puériculture, vêtements de naissance, poussettes et jeux d’éveil.',
    featuredHighlight: {
      title: 'Le Monde de Bébé',
      subtitle: 'Sécurité, confort et douceur pour les tout-petits',
      linkText: 'Voir la puériculture',
    },
    subcategories: [
      { name: 'Poussettes & Sièges auto', slug: 'poussettes' },
      { name: 'Vêtements bébé & Naissance', slug: 'vetements-bebe', badge: 'Doux' },
      { name: 'Jouets & Jeux d’éveil', slug: 'jouets', badge: 'Populaire' },
      { name: 'Chambre bébé & Berceaux', slug: 'chambre-bebe' },
      { name: 'Biberons, Allaitement & Repas', slug: 'allaitement' },
      { name: 'Couches & Soins bébé', slug: 'couches-soins' },
    ],
  },
  {
    name: 'Auto & Moto',
    slug: 'auto-moto',
    icon: '🚗',
    lucideIcon: Car,
    color: 'text-[#2F5A72]',
    bg: 'bg-[#EAF0F4]',
    description: 'Pièces mécaniques, accessoires intérieurs, GPS et produits d’entretien.',
    featuredHighlight: {
      title: 'Entretien & Pièces Auto',
      subtitle: 'Huiles, filtres et accessoires au meilleur prix',
      linkText: 'Trouver mes pièces',
    },
    subcategories: [
      { name: 'Pièces détachées & Filtres', slug: 'pieces-auto' },
      { name: 'Huiles, Liquides & Lavage', slug: 'entretien-auto', badge: 'Essentiel' },
      { name: 'Accessoires habitacle & Housses', slug: 'accessoires-auto' },
      { name: 'Électronique auto & Dashcam', slug: 'electronique-auto' },
      { name: 'Équipements deux-roues & Casques', slug: 'moto' },
      { name: 'Outillage & Diagnostic OBD', slug: 'outillage-mecanique' },
    ],
  },
  {
    name: 'High-Tech',
    slug: 'high-tech',
    icon: '🎧',
    lucideIcon: Headphones,
    color: 'text-[#6941C6]',
    bg: 'bg-[#EEEAFE]',
    description: 'Informatique pro, univers gaming, composants PC et matériel réseau.',
    featuredHighlight: {
      title: 'Univers Gaming & PC',
      subtitle: 'Cartes graphiques, PC portables et périphériques',
      linkText: 'Découvrir le setup',
    },
    subcategories: [
      { name: 'PC portables & Ordinateurs', slug: 'pc-portables', badge: 'Pro' },
      { name: 'Gaming, Consoles & Manettes', slug: 'gaming', badge: 'Populaire' },
      { name: 'Écrans PC & Moniteurs', slug: 'ecrans-pc' },
      { name: 'Casques gamer & Audio pro', slug: 'audio-pro' },
      { name: 'Composants PC (RAM, SSD, GPU)', slug: 'composants' },
      { name: 'Routeurs 4G/Fibre & Réseaux', slug: 'reseaux' },
    ],
  },
  {
    name: 'Meubles',
    slug: 'meubles',
    icon: '🛋️',
    lucideIcon: Armchair,
    color: 'text-[#87553B]',
    bg: 'bg-[#F6EDE4]',
    description: 'Salons modernes ou traditionnels, literie, rangements et mobilier de bureau.',
    featuredHighlight: {
      title: 'Mobilier & Confort',
      subtitle: 'Design moderne et finitions de qualité',
      linkText: 'Explorer les meubles',
    },
    subcategories: [
      { name: 'Canapés, Salons & Fauteuils', slug: 'salons', badge: 'Confort' },
      { name: 'Meubles TV & Séjour', slug: 'meubles-tv' },
      { name: 'Lits, Matelas & Literie', slug: 'literie' },
      { name: 'Tables à manger & Chaises', slug: 'salle-a-manger' },
      { name: 'Bureaux & Chaises ergonomiques', slug: 'bureau' },
      { name: 'Armoires, Dressings & Commodes', slug: 'dressings' },
    ],
  },
  {
    name: 'Jardin & Bricolage',
    slug: 'jardin-bricolage',
    icon: '🔧',
    lucideIcon: Wrench,
    color: 'text-[#2E7D32]',
    bg: 'bg-[#EAF5E8]',
    description: 'Outillage professionnel, matériel de rénovation, peinture et jardin.',
    featuredHighlight: {
      title: 'Outillage & Travaux',
      subtitle: 'Perceuses, meuleuses et boîtes à outils',
      linkText: 'Voir l’outillage',
    },
    subcategories: [
      { name: 'Outillage électroportatif', slug: 'electroportatif', badge: 'Pro' },
      { name: 'Boîtes à outils & Rangement', slug: 'boites-outils' },
      { name: 'Peinture, Enduits & Rénovation', slug: 'peinture' },
      { name: 'Éclairage LED & Électricité', slug: 'electricite' },
      { name: 'Robinetterie & Plomberie', slug: 'plomberie' },
      { name: 'Jardinage & Arrosage', slug: 'jardinage' },
    ],
  },
]
