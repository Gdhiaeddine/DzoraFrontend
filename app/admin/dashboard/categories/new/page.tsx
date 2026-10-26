'use client'

import React from 'react'
import { CategoryDetailedEditor } from '@/components/admin/category-detailed-editor'

export default function NewCategoryPage() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      <CategoryDetailedEditor initialCategory={null} isNew={true} />
    </main>
  )
}
