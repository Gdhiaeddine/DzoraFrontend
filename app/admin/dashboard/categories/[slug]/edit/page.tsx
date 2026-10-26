'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { CategoryDetailedEditor } from '@/components/admin/category-detailed-editor'
import { categoriesStore } from '@/lib/categories-store'
import { CategoryDetail } from '@/lib/categories'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function CategoryEditPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const categorySlug = resolvedParams.slug

  const [category, setCategory] = useState<CategoryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const found = categoriesStore.getCategoryBySlug(categorySlug)
    if (found) {
      setCategory(found)
    }
    setIsLoading(false)
  }, [categorySlug])

  if (isLoading) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
          <div className="size-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-3" />
          <p className="text-xs font-bold text-[#102A2A]">Chargement de la catégorie…</p>
        </div>
      </main>
    )
  }

  if (!category) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div className="max-w-2xl mx-auto p-6 text-center space-y-4">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 inline-block">
            <AlertCircle size={28} className="mx-auto mb-2 text-amber-700" />
            <h2 className="text-base font-bold">Catégorie introuvable</h2>
            <p className="text-xs text-[#60716F] mt-1">
              Impossible de modifier « {categorySlug} », ce rayon n'existe pas.
            </p>
          </div>
          <div>
            <Link
              href="/admin/dashboard/categories"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white"
            >
              <ArrowLeft size={14} />
              <span>Retour à la liste des catégories</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      <CategoryDetailedEditor initialCategory={category} isNew={false} />
    </main>
  )
}
