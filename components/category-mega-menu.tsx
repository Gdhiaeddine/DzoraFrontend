'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { CATEGORIES_DETAILED, type CategoryDetail } from '@/lib/categories'

interface CategoryMegaMenuProps {
  onNavigate?: () => void
}

export function CategoryMegaMenu({ onNavigate }: CategoryMegaMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetail>(CATEGORIES_DETAILED[0])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)

  // Clear hover timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Mouse enter with timeout clearing to prevent abrupt close
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  // Grace timer before closing when mouse leaves trigger or dropdown
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 180)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <div
      ref={menuContainerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Link */}
      <Link
        href="/products"
        onClick={handleLinkClick}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`flex items-center gap-2 font-bold transition-all duration-150 py-2 ${
          isOpen
            ? 'text-[#006B55]'
            : 'text-[#102A2A] hover:text-[#006B55]'
        }`}
      >
        <Menu size={16} className="text-[#006B55] transition-transform duration-200" />
        <span>Toutes les catégories</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#006B55]' : 'text-[#60716F]'}`}
        />
      </Link>

      {/* Invisible bridge to prevent gap flickering between trigger and panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 h-2 bg-transparent z-50" />
      )}

      {/* Dropdown Mega-Menu Panel */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Menu des catégories"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[940px] xl:w-[1040px] rounded-2xl border border-[#DCE8E3] bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden"
        >
            {/* Main Split Content: Left Categories & Right Subcategories */}
            <div className="grid grid-cols-12 min-h-[460px]">
              {/* Left Column: Category Navigation List (4 cols) */}
              <div className="col-span-4 border-r border-[#E7F0EC] bg-[#F9FBFA] p-3 flex flex-col justify-between">
                <div>
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#738885]">
                    Rayons & Univers
                  </div>
                  <nav className="flex flex-col gap-1">
                    {CATEGORIES_DETAILED.map((cat) => {
                      const isSelected = selectedCategory.name === cat.name
                      const IconComp = cat.lucideIcon

                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onMouseEnter={() => setSelectedCategory(cat)}
                          onClick={() => {
                            router.push(`/products?category=${encodeURIComponent(cat.name)}`)
                            handleLinkClick()
                          }}
                          className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#E7F2EF] text-[#006B55] shadow-xs font-bold'
                              : 'text-[#324B48] hover:bg-[#EFF5F3] hover:text-[#102A2A]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`grid size-7 shrink-0 place-items-center rounded-lg transition-transform duration-150 group-hover:scale-105 ${cat.bg} ${cat.color}`}
                            >
                              <IconComp size={15} strokeWidth={2} />
                            </span>
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <ChevronRight
                            size={14}
                            className={`shrink-0 transition-transform ${
                              isSelected
                                ? 'translate-x-0.5 text-[#006B55]'
                                : 'text-[#A0B3AE] opacity-0 group-hover:opacity-100'
                            }`}
                          />
                        </button>
                      )
                    })}
                  </nav>
                </div>

                <div className="mt-3 border-t border-[#E7F0EC] pt-3 px-2">
                  <Link
                    href="/products"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between rounded-xl bg-white border border-[#DCE8E3] p-2.5 text-xs font-bold text-[#006B55] hover:bg-[#F2F8F6] transition"
                  >
                    <span>Voir tout le catalogue Dzora</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Subcategories & Highlights (8 cols) */}
              <div className="col-span-8 p-6 flex flex-col justify-between bg-white">
                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between border-b border-[#F0F5F3] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-10 place-items-center rounded-xl shadow-xs ${selectedCategory.bg} ${selectedCategory.color}`}
                      >
                        <selectedCategory.lucideIcon size={20} strokeWidth={2} />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-[#102A2A]">
                          {selectedCategory.name}
                        </h3>
                        <p className="text-xs text-[#708481] line-clamp-1">
                          {selectedCategory.description}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/products?category=${encodeURIComponent(selectedCategory.name)}`}
                      onClick={handleLinkClick}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#E7F2EF] px-3 py-1.5 text-xs font-bold text-[#006B55] hover:bg-[#D5EAE4] transition"
                    >
                      <span>Tous les articles</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {/* Subcategories Grid */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#738885] mb-3">
                      Sous-catégories populaires
                    </h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                      {selectedCategory.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/products?category=${encodeURIComponent(
                            selectedCategory.name
                          )}&subCategory=${encodeURIComponent(sub.name)}`}
                          onClick={handleLinkClick}
                          className="group flex items-center justify-between rounded-lg p-2 text-xs font-medium text-[#294340] hover:bg-[#F4F8F6] hover:text-[#006B55] transition"
                        >
                          <span className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                            <span className="size-1.5 rounded-full bg-[#A2B7B2] group-hover:bg-[#006B55]" />
                            <span>{sub.name}</span>
                          </span>
                          {sub.badge && (
                            <span className="rounded-full bg-[#E7F2EF] px-2 py-0.5 text-[10px] font-bold text-[#006B55]">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Featured Highlight Card */}
                {selectedCategory.featuredHighlight && (
                  <div className="mt-6 rounded-xl border border-[#DCE8E3] bg-gradient-to-r from-[#F4F8F6] to-[#EAF3F0] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-[#006B55] text-white shadow-xs">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#102A2A]">
                          {selectedCategory.featuredHighlight.title}
                        </div>
                        <div className="text-[11px] text-[#607572]">
                          {selectedCategory.featuredHighlight.subtitle}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/products?category=${encodeURIComponent(selectedCategory.name)}`}
                      onClick={handleLinkClick}
                      className="text-xs font-bold text-[#006B55] hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>{selectedCategory.featuredHighlight.linkText}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
