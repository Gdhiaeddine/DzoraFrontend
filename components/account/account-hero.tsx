'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, Clock, Tag, Wallet } from 'lucide-react'

interface AccountHeroProps {
  fullName?: string
  initials?: string
  memberSinceYear?: number | string
  favoritesCount?: number
  isVerified?: boolean
  accountRoleLabel?: string
}

export function AccountHero({
  fullName = 'Client Dzora',
  initials = 'CD',
  memberSinceYear = 2026,
  favoritesCount = 0,
  isVerified = true,
  accountRoleLabel = 'Compte client',
}: AccountHeroProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.02)] p-5 sm:p-6 mb-6">
      {/* Identity Profile Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8F0ED]">
        <div className="flex items-center gap-4">
          <div className="size-14 sm:size-16 rounded-full bg-[#E7F2EF] text-[#006B55] border-2 border-[#BBDDD4] flex items-center justify-center font-display font-extrabold text-xl sm:text-2xl shadow-xs shrink-0 select-none">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[#102A2A] tracking-tight">
                {fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                {accountRoleLabel}
              </span>
            </div>
            <p className="text-xs font-medium text-[#60716F] mt-1">
              Membre depuis {memberSinceYear} · Marketplace Dzora
            </p>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="self-start sm:self-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
              isVerified
                ? 'bg-[#E7F2EF] text-[#006B55] border-[#BBDDD4]'
                : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                isVerified ? 'bg-[#006B55]' : 'bg-[#D97706]'
              }`}
            />
            {isVerified ? 'Compte vérifié' : 'Vérification en attente'}
          </span>
        </div>
      </div>

      {/* Row of 4 Account Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
        {/* 1. Mes favoris */}
        <Link
          href="/favoris"
          className="group flex flex-col items-center p-3 rounded-xl bg-[#FAFDFB] border border-[#E5EEEB] hover:border-[#BBDDD4] hover:bg-[#F0F7F4] hover:shadow-xs transition duration-150 text-center"
        >
          <div className="size-9 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Heart size={18} />
          </div>
          <span className="text-xs font-bold text-[#102A2A] group-hover:text-[#006B55] transition-colors">
            Mes favoris
          </span>
          <span className="text-[11px] font-medium text-[#71827D] mt-0.5">
            {favoritesCount > 0 ? `${favoritesCount} article${favoritesCount > 1 ? 's' : ''}` : 'Consulter'}
          </span>
        </Link>

        {/* 2. Vu récemment */}
        <Link
          href="/products"
          className="group flex flex-col items-center p-3 rounded-xl bg-[#FAFDFB] border border-[#E5EEEB] hover:border-[#BBDDD4] hover:bg-[#F0F7F4] hover:shadow-xs transition duration-150 text-center"
        >
          <div className="size-9 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Clock size={18} />
          </div>
          <span className="text-xs font-bold text-[#102A2A] group-hover:text-[#006B55] transition-colors">
            Vu récemment
          </span>
          <span className="text-[11px] font-medium text-[#71827D] mt-0.5">
            Historique
          </span>
        </Link>

        {/* 3. Mes coupons */}
        <div
          role="region"
          aria-label="Mes coupons promotionnels"
          className="flex flex-col items-center p-3 rounded-xl bg-[#FAFDFB] border border-[#E5EEEB] text-center cursor-default select-none"
        >
          <div className="size-9 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center mb-2">
            <Tag size={18} />
          </div>
          <span className="text-xs font-bold text-[#102A2A]">
            Mes coupons
          </span>
          <span className="text-[11px] font-medium text-[#71827D] mt-0.5">
            0 actif
          </span>
        </div>

        {/* 4. Mon portefeuille */}
        <div
          role="region"
          aria-label="Mon portefeuille solde et avoirs"
          className="flex flex-col items-center p-3 rounded-xl bg-[#FAFDFB] border border-[#E5EEEB] text-center cursor-default select-none"
        >
          <div className="size-9 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center mb-2">
            <Wallet size={18} />
          </div>
          <span className="text-xs font-bold text-[#102A2A]">
            Mon portefeuille
          </span>
          <span className="text-[11px] font-bold text-[#006B55] mt-0.5">
            0,00 DA
          </span>
        </div>
      </div>
    </div>
  )
}
