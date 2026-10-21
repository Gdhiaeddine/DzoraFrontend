'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useFavorites } from '@/components/favorites-context'
import { AccountNav } from '@/components/account/account-nav'
import { AccountHero } from '@/components/account/account-hero'
import { AccountOverviewTab } from '@/components/account/account-overview-tab'
import { AccountPlaceholderTab } from '@/components/account/account-placeholder-tab'
import { SettingsPersonalCard } from '@/components/account/settings-personal-card'
import { SettingsSecurityCard } from '@/components/account/settings-security-card'
import { SettingsPreferencesCard } from '@/components/account/settings-preferences-card'
import {
  getClientOrders,
  getClientAddresses,
  getClientPrimaryAddress,
  saveOrUpdateClientAddress,
  saveClientPrimaryAddress,
  deleteClientAddress,
  setDefaultClientAddress,
  getClientPaymentMethod,
  saveClientPaymentMethod,
  PAYMENT_METHODS,
  ClientOrder,
  ClientAddress,
  PaymentMethodType,
} from '@/lib/client-account'

function CustomerAccountSettingsContent() {
  const { user } = useAuth()
  const { favoritesCount } = useFavorites()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Tab State: default to 'overview' (Vue d'ensemble) or read from URL (?tab=overview, ?tab=settings, etc.)
  const tabFromQuery = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<string>(tabFromQuery || 'overview')

  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(tabFromQuery)
    } else {
      setActiveTab('overview')
    }
  }, [tabFromQuery])

  const handleSelectTab = (slug: string) => {
    setActiveTab(slug)
    if (slug === 'overview') {
      router.push('/account/settings', { scroll: false })
    } else {
      router.push(`/account/settings?tab=${slug}`, { scroll: false })
    }

    // When switching tabs while scrolled down, smoothly reposition below the sticky header
    if (typeof window !== 'undefined' && window.scrollY > 140) {
      window.scrollTo({
        top: 60,
        behavior: 'smooth',
      })
    }
  }

  // Real Client Account Data (Orders, Delivery Address, Payment Preference)
  const [orders, setOrders] = useState<ClientOrder[]>([])
  const [addresses, setAddresses] = useState<ClientAddress[]>([])
  const [primaryAddress, setPrimaryAddress] = useState<ClientAddress | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD')

  const refreshClientData = useCallback(() => {
    const userOrders = getClientOrders(user?.id)
    setOrders(userOrders)
    const userAddresses = getClientAddresses(user?.id)
    setAddresses(userAddresses)
    const primary = userAddresses.find((a) => a.isDefault) || userAddresses[0] || null
    setPrimaryAddress(primary)
    const userPayment = getClientPaymentMethod(user?.id)
    setPaymentMethod(userPayment)
  }, [user?.id])

  useEffect(() => {
    refreshClientData()
  }, [refreshClientData])

  const handleSaveAddress = (addrUpdate: Partial<ClientAddress>) => {
    saveOrUpdateClientAddress(addrUpdate, user?.id)
    refreshClientData()
  }

  const handleDeleteAddress = (id: string) => {
    deleteClientAddress(id, user?.id)
    refreshClientData()
  }

  const handleSetDefaultAddress = (id: string) => {
    setDefaultClientAddress(id, user?.id)
    refreshClientData()
  }

  const handleUpdatePaymentMethod = (method: PaymentMethodType) => {
    saveClientPaymentMethod(method, user?.id)
    setPaymentMethod(method)
  }

  const activeOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'SHIPPED',
  )
  const activeOrdersCount = activeOrders.length
  const ordersCount = orders.length
  const lastOrder = orders[0] || null
  const paymentInfo = PAYMENT_METHODS[paymentMethod] || PAYMENT_METHODS.COD

  // Dynamic authenticated user name computation
  const userFullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'Client Dzora'

  const initials =
    (user?.firstName?.[0] && user?.lastName?.[0]
      ? `${user.firstName[0]}${user.lastName[0]}`
      : userFullName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join(''))
      .toUpperCase() || 'DZ'

  // Sensitive data mask fallback for real user data
  const rawEmail = user?.email || ''
  const maskedEmail = user?.email
    ? (() => {
        const parts = user.email.split('@')
        const namePart = parts[0] || 'user'
        const domain = parts[1] || 'dzora.dz'
        const prefix = namePart.length > 2 ? namePart.slice(0, 2) : namePart[0] || 'u'
        return `${prefix}••••@${domain}`
      })()
    : 'Non renseignée'

  const rawPhone = user?.phone || ''
  const maskedPhone = user?.phone
    ? (() => {
        const digits = user.phone.replace(/\D/g, '')
        const lastTwo = digits.slice(-2) || ''
        return lastTwo ? `+213 •• •• •• ${lastTwo}` : user.phone
      })()
    : 'Non renseigné'

  // Dynamic registration year from user creation date
  const memberSinceYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear()

  // Dynamic verification status
  const isVerified = Boolean(user?.phoneVerified || user?.emailVerified)

  // Dynamic 2FA status
  const twoFactorActive = Boolean(user?.twoFactorEnabled)

  // Breadcrumb current label
  const breadcrumbCurrent =
    activeTab === 'overview'
      ? 'Vue d’ensemble'
      : activeTab === 'settings'
      ? 'Paramètres'
      : activeTab === 'commandes'
      ? 'Commandes'
      : activeTab === 'paiements'
      ? 'Paiements'
      : activeTab === 'retours'
      ? 'Retours & remboursements'
      : activeTab === 'avis'
      ? 'Avis'
      : activeTab === 'adresses'
      ? 'Adresses'
      : activeTab === 'messages'
      ? 'Mes messages'
      : activeTab === 'inviter'
      ? 'Inviter un ami'
      : activeTab === 'support'
      ? 'Service client'
      : 'Centre d’aide'

  return (
    <div className="bg-[#FAFDFB] min-h-screen text-[#102A2A] pb-16 selection:bg-[#006B55]/20 selection:text-[#006B55]">
      <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
        {/* Breadcrumb: Accueil > Mon compte > [Onglet Courant] */}
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-1.5 text-xs font-medium text-[#60716F] mb-4 sm:mb-6"
        >
          <Link href="/" className="transition hover:text-[#006B55]">
            Accueil
          </Link>
          <ChevronRight size={13} className="text-[#94A4A0]" />
          <button
            type="button"
            onClick={() => handleSelectTab('overview')}
            className="transition hover:text-[#006B55] cursor-pointer"
          >
            Mon compte
          </button>
          <ChevronRight size={13} className="text-[#94A4A0]" />
          <span className="font-semibold text-[#102A2A]">{breadcrumbCurrent}</span>
        </nav>

        {/* Two-Column Account-Center Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Account Navigation (240px on desktop, STICKY on scroll) */}
          <AccountNav activeSlug={activeTab} onSelectTab={handleSelectTab} />

          {/* Right Column: Main Content Area */}
          <main className="flex-1 w-full min-w-0">
            {/* Identity Card & Quick Links (shared across account tabs) */}
            <AccountHero
              fullName={userFullName}
              initials={initials}
              memberSinceYear={memberSinceYear}
              favoritesCount={favoritesCount}
              isVerified={isVerified}
              accountRoleLabel="Compte client"
            />

            {/* TAB 1: Vue d'ensemble (Dashboard summary) */}
            {activeTab === 'overview' && (
              <div>
                <div className="mb-4">
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#102A2A] tracking-tight">
                    Vue d’ensemble du compte
                  </h2>
                  <p className="text-xs font-medium text-[#60716F] mt-1">
                    Résumé de vos activités d’achat, statut des colis et sécurité.
                  </p>
                </div>

                <AccountOverviewTab
                  fullName={userFullName}
                  maskedPhone={maskedPhone}
                  maskedEmail={maskedEmail}
                  wilaya={primaryAddress?.wilaya || ''}
                  commune={primaryAddress?.commune || ''}
                  twoFactorActive={twoFactorActive}
                  favoritesCount={favoritesCount}
                  ordersCount={ordersCount}
                  activeOrdersCount={activeOrdersCount}
                  lastOrder={lastOrder}
                  paymentMethodTitle={paymentInfo.title}
                  paymentMethodSubtitle={paymentInfo.subtitle}
                  onNavigateTab={handleSelectTab}
                />
              </div>
            )}

            {/* TAB 2: Paramètres du compte */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-200">
                {/* Settings Heading & Supporting text */}
                <div className="mb-4">
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#102A2A] tracking-tight">
                    Paramètres du compte
                  </h2>
                  <p className="text-xs font-medium text-[#60716F] mt-1">
                    Gérez vos informations personnelles et préférences.
                  </p>
                </div>

                {/* Card A: Informations personnelles */}
                <SettingsPersonalCard
                  initialData={{
                    fullName: userFullName,
                    email: rawEmail,
                    maskedEmail,
                    phone: rawPhone,
                    maskedPhone,
                    wilaya: primaryAddress?.wilaya || '',
                  }}
                  onSave={(updated) => {
                    handleSaveAddress({
                      fullName: updated.fullName,
                      phone: updated.phone,
                      wilaya: updated.wilaya,
                    })
                  }}
                />

                {/* Card B: Connexion et sécurité */}
                <SettingsSecurityCard
                  twoFactorActive={twoFactorActive}
                  activeSessionsCount={1}
                />

                {/* Card C: Préférences */}
                <SettingsPreferencesCard />
              </div>
            )}

            {/* OTHER TABS: Commandes, Paiements, Retours, Avis, Adresses, Messages, etc. */}
            {activeTab !== 'overview' && activeTab !== 'settings' && (
              <AccountPlaceholderTab
                tabSlug={activeTab}
                orders={orders}
                primaryAddress={primaryAddress}
                addresses={addresses}
                paymentMethod={paymentMethod}
                currentUserFullName={userFullName}
                currentUserPhone={rawPhone}
                onGoToSettings={() => handleSelectTab('settings')}
                onUpdateAddress={handleSaveAddress}
                onSaveAddress={handleSaveAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
                onUpdatePaymentMethod={handleUpdatePaymentMethod}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function CustomerAccountSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFDFB] p-8 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#006B55] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CustomerAccountSettingsContent />
    </Suspense>
  )
}
