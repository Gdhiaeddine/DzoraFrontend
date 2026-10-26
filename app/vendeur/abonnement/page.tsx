'use client'

import React, { Suspense } from 'react'
import { SellerSubscriptionManager } from '@/components/seller/seller-subscription-manager'
import { useSellerDashboard } from '@/components/seller-layout-shell'

function SellerSubscriptionPageContent() {
  const { storeDisplayName } = useSellerDashboard()

  return (
    <div className="w-full space-y-6">
      <SellerSubscriptionManager storeName={storeDisplayName} />
    </div>
  )
}

export default function SellerSubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
          <p className="text-sm font-bold text-[#102A2A]">Chargement de votre abonnement…</p>
        </div>
      }
    >
      <SellerSubscriptionPageContent />
    </Suspense>
  )
}
