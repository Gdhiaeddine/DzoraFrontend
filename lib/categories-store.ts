import { CATEGORIES_DETAILED, CategoryDetail, categoryIcons } from './categories'

const STORAGE_KEY = 'dzora_marketplace_categories_detailed'

export const categoriesStore = {
  getCategories(): CategoryDetail[] {
    if (typeof window === 'undefined') {
      return CATEGORIES_DETAILED
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: CategoryDetail[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Re-attach lucide icons if missing
          return parsed.map((cat) => {
            const mapped = categoryIcons[cat.name]
            return {
              ...cat,
              lucideIcon: mapped ? mapped.icon : cat.lucideIcon,
            }
          })
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CATEGORIES_DETAILED))
    } catch (err) {
      console.warn('Erreur lecture categoriesStore:', err)
    }
    return CATEGORIES_DETAILED
  },

  getCategoryBySlug(slug: string): CategoryDetail | undefined {
    const categories = this.getCategories()
    const cleanSlug = slug.toLowerCase().trim()
    return categories.find(
      (c) => c.slug.toLowerCase().trim() === cleanSlug || c.name.toLowerCase().trim() === cleanSlug
    )
  },

  saveCategories(categories: CategoryDetail[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
      window.dispatchEvent(new Event('dzora-categories-updated'))
    } catch (err) {
      console.error('Erreur sauvegarde categoriesStore:', err)
    }
  },

  upsertCategory(category: CategoryDetail): void {
    const categories = this.getCategories()
    const idx = categories.findIndex(
      (c) => c.slug.toLowerCase().trim() === category.slug.toLowerCase().trim()
    )
    if (idx >= 0) {
      categories[idx] = category
    } else {
      categories.push(category)
    }
    this.saveCategories(categories)
  },

  deleteCategory(slug: string): void {
    const categories = this.getCategories()
    const filtered = categories.filter(
      (c) => c.slug.toLowerCase().trim() !== slug.toLowerCase().trim()
    )
    this.saveCategories(filtered)
  },

  resetToDefaults(): CategoryDetail[] {
    this.saveCategories(CATEGORIES_DETAILED)
    return CATEGORIES_DETAILED
  },
}
