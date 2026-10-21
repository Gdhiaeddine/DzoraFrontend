'use client'

import React from 'react'
import { Check, Minus, ChevronDown } from 'lucide-react'
import { CATEGORIES_DETAILED } from '@/lib/categories'

interface CategoryFilterAccordionProps {
  selectedCategories: string[]
  selectedSubCategories: string[]
  expandedCategories: Record<string, boolean>
  categoryCounts: Record<string, number>
  onToggleCategory: (catName: string) => void
  onToggleSubCategory: (catName: string, subName: string) => void
  onToggleCollapse: (catName: string, e?: React.MouseEvent) => void
}

export function CategoryFilterAccordion({
  selectedCategories,
  selectedSubCategories,
  expandedCategories,
  categoryCounts,
  onToggleCategory,
  onToggleSubCategory,
  onToggleCollapse,
}: CategoryFilterAccordionProps) {
  return (
    <div className="space-y-1">
      {CATEGORIES_DETAILED.map((catObj) => {
        const cat = catObj.name
        const catSubNames = catObj.subcategories.map((s) => s.name)
        const selectedSubsInCat = catSubNames.filter((s) =>
          selectedSubCategories.includes(s)
        )
        const allSubsChecked =
          catSubNames.length > 0 && selectedSubsInCat.length === catSubNames.length
        const someSubsChecked =
          selectedSubsInCat.length > 0 && !allSubsChecked
        const isCatChecked = selectedCategories.includes(cat) || allSubsChecked
        const isExpanded = Boolean(expandedCategories[cat])
        const count = categoryCounts[cat] || 0

        return (
          <div
            key={cat}
            className="rounded-xl transition-colors hover:bg-[#F6FAF8] p-1.5 -mx-1"
          >
            {/* Category Header Row */}
            <div className="flex items-center justify-between select-none">
              <div
                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                onClick={() => onToggleCategory(cat)}
              >
                <span
                  className={`grid size-4 shrink-0 place-items-center rounded-md border transition ${
                    isCatChecked || someSubsChecked
                      ? 'border-[#006B55] bg-[#006B55] text-white shadow-2xs'
                      : 'border-[#CADBD5] bg-white hover:border-[#006B55]'
                  }`}
                >
                  {allSubsChecked || (isCatChecked && !someSubsChecked) ? (
                    <Check size={12} strokeWidth={3} />
                  ) : someSubsChecked ? (
                    <Minus size={12} strokeWidth={3} />
                  ) : null}
                </span>
                <span
                  className={`text-xs truncate transition-colors ${
                    isCatChecked || someSubsChecked
                      ? 'font-bold text-[#006B55]'
                      : 'font-medium text-[#38524D] hover:text-[#102A2A]'
                  }`}
                >
                  {cat}
                </span>
              </div>

              {/* Count & Collapse Toggle */}
              <div className="flex items-center gap-1 shrink-0 pl-1">
                <span className="text-[10px] font-semibold text-[#8DA09B]">
                  ({count})
                </span>
                <button
                  type="button"
                  onClick={(e) => onToggleCollapse(cat, e)}
                  aria-label={`Déplier ${cat}`}
                  className="grid size-6 place-items-center rounded-md text-[#728A85] hover:bg-[#EAF1EE] hover:text-[#006B55] transition cursor-pointer"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#006B55]' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Subcategories Collapsible List */}
            {isExpanded && catObj.subcategories.length > 0 && (
              <div className="mt-2 space-y-1 pl-5 ml-2 border-l-2 border-[#DCE8E3] animate-in fade-in slide-in-from-top-1 duration-150">
                {catObj.subcategories.map((sub) => {
                  const isSubChecked = selectedSubCategories.includes(sub.name)

                  return (
                    <div
                      key={sub.slug}
                      onClick={() => onToggleSubCategory(cat, sub.name)}
                      className="group flex cursor-pointer items-center justify-between py-1 px-1 rounded-lg hover:bg-[#EBF3F0] text-[11px] text-[#48635F] hover:text-[#006B55] select-none transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`grid size-3.5 shrink-0 place-items-center rounded border transition ${
                            isSubChecked
                              ? 'border-[#006B55] bg-[#006B55] text-white shadow-2xs'
                              : 'border-[#CFDED8] bg-white group-hover:border-[#006B55]'
                          }`}
                        >
                          {isSubChecked && <Check size={10} strokeWidth={3} />}
                        </span>
                        <span
                          className={`truncate ${
                            isSubChecked ? 'font-bold text-[#006B55]' : ''
                          }`}
                        >
                          {sub.name}
                        </span>
                      </div>
                      {sub.badge && (
                        <span className="text-[9px] font-bold text-[#006B55] bg-[#E7F2EF] px-1.5 py-0.5 rounded-full shrink-0">
                          {sub.badge}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
