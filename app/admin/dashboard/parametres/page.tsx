'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Truck,
  Bell,
  Store,
  Database,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  RotateCcw,
  Download,
  Flame,
  Globe,
  Lock,
  Smartphone,
  Mail,
  ChevronRight,
  Server,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  KeyRound,
  Layers,
  Sparkles,
} from 'lucide-react'
import { api, AdminSettingsData } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

// Fallback initial state in case API is loading or network is slow
const DEFAULT_SETTINGS: AdminSettingsData = {
  general: {
    marketplaceName: 'Dzora Marketplace',
    tagline: 'La marketplace algérienne de référence',
    contactEmail: 'contact@dzora.dz',
    supportPhone: '+213 23 88 12 40',
    headquartersAddress: 'Lotissement El Qods, Chéraga, Alger, Algérie',
    timezone: 'Africa/Algiers',
    defaultCurrency: 'Dinar algérien (DZD / DA)',
    defaultLanguage: 'Français',
    maintenanceMode: false,
    maintenanceNotice:
      'Dzora est actuellement en maintenance technique programmée pour optimiser vos services. De retour très vite !',
  },
  financial: {
    defaultCommissionRate: 8.5,
    fixedOrderFee: 50,
    sellerPayoutDelayDays: 7,
    minimumPayoutAmount: 5000,
    enableCod: true,
    enableCibEdahabia: true,
    enableBankTransfer: true,
  },
  logistics: {
    freeShippingThreshold: 12000,
    maxDispatchDelayHours: 48,
    returnWindowDays: 4,
    integratedCarriers: {
      yalidine: true,
      procolis: true,
      maystro: true,
      zrExpress: true,
    },
    nationalCoverageWilayas: 58,
  },
  security: {
    enforceAdmin2Fa: true,
    sessionTimeoutHours: 8,
    minPasswordLength: 12,
    requireStrongPassword: true,
    bruteForceProtection: true,
    maxFailedAttempts: 5,
    ipWhitelistEnabled: false,
    ipWhitelist: ['197.200.0.0/16', '105.101.0.0/16'],
  },
  notifications: {
    smsProvider: 'Dzora Telecom Gateway (Mobilis/Ooredoo/Djezzy)',
    smsSenderName: 'Dzora',
    smsOrderNotificationSeller: true,
    smsTrackingNotificationBuyer: true,
    emailTransactionalEnabled: true,
    emailSenderAddress: 'noreply@dzora.dz',
    emailAdminDisputeAlerts: true,
  },
  sellers: {
    requireProductApproval: true,
    requireLegalDocuments: true,
    maxProductsForNewSellers: 50,
    maxCancellationRatePercent: 8,
  },
  system: {
    databaseBackupFrequency: 'DAILY',
    lastBackupAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    auditLogRetentionDays: 365,
    appVersion: '2.6.4-prod',
    environment: 'production',
    servicesStatus: {
      database: 'UP',
      redis: 'UP',
      api: 'UP',
    },
  },
}

type TabType =
  | 'general'
  | 'financial'
  | 'logistics'
  | 'security'
  | 'notifications'
  | 'sellers'
  | 'system'

const VALID_TABS: TabType[] = [
  'general',
  'financial',
  'logistics',
  'security',
  'notifications',
  'sellers',
  'system',
]

function AdminParametresContent() {
  const { user } = useAuth()
  const roles = user?.roles || []
  const isSuperAdmin = roles.includes('SUPER_ADMIN')
  const isAdmin = roles.includes('ADMIN') || isSuperAdmin

  const searchParams = useSearchParams()
  const tabFromQuery = searchParams.get('tab') as TabType | null

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (tabFromQuery && VALID_TABS.includes(tabFromQuery)) {
      return tabFromQuery
    }
    return 'general'
  })

  useEffect(() => {
    if (tabFromQuery && VALID_TABS.includes(tabFromQuery)) {
      setActiveTab(tabFromQuery)
    }
  }, [tabFromQuery])

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tabId)
      window.history.replaceState({}, '', url.toString())
    }
  }
  const [settings, setSettings] = useState<AdminSettingsData>(DEFAULT_SETTINGS)
  const [originalSettings, setOriginalSettings] = useState<AdminSettingsData>(DEFAULT_SETTINGS)

  // Status & loaders
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPurging, setIsPurging] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Confirmation Modals
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false)
  const [cacheModalOpen, setCacheModalOpen] = useState(false)

  // Fetch settings from Backend API
  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.admin.getSettings()
      setSettings(data)
      setOriginalSettings(data)
    } catch (err: any) {
      console.warn('Could not load backend settings, using cached defaults', err)
      if (err?.statusCode === 403) {
        setToastMessage('Accès restreint. Privilèges administrateur requis pour consulter les réglages.')
      } else {
        setToastMessage(err.message || 'Impossible de synchroniser avec le backend. Affichage du cache local.')
      }
      window.setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Track if any modifications have been made
  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }, [settings, originalSettings])

  // Reset unsaved changes
  const handleReset = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)))
    setToastMessage('Modifications annulées. Paramètres restaurés.')
    window.setTimeout(() => setToastMessage(null), 3000)
  }

  // Save changes to backend with PostgreSQL persistence
  const handleSave = async () => {
    if (!isAdmin) {
      setToastMessage('Accès refusé. Privilèges administrateur requis pour enregistrer.')
      return
    }
    setIsSaving(true)
    try {
      const updated = await api.admin.updateSettings(settings)
      setSettings(updated)
      setOriginalSettings(updated)
      setToastMessage('Paramètres de la plateforme enregistrés et persistés dans PostgreSQL avec succès !')
      window.setTimeout(() => setToastMessage(null), 3500)
    } catch (err: any) {
      if (err?.statusCode === 403) {
        setToastMessage('Accès refusé. Vous ne possédez pas les permissions nécessaires.')
      } else {
        setToastMessage(err.message || 'Erreur lors de la sauvegarde des paramètres.')
      }
      window.setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setIsSaving(false)
    }
  }

  // Purge CDN and Redis Cache
  const handlePurgeCache = async () => {
    if (!isAdmin) {
      setToastMessage('Accès refusé. Privilèges administrateur requis.')
      return
    }
    setIsPurging(true)
    try {
      const res = await api.admin.purgeCache()
      setToastMessage(res.message || 'Cache applicatif et CDN purgés avec succès.')
      window.setTimeout(() => setToastMessage(null), 3500)
      setCacheModalOpen(false)
    } catch (err: any) {
      if (err?.statusCode === 403) {
        setToastMessage('Accès refusé pour la purge du cache.')
      } else {
        setToastMessage(err.message || 'Impossible de purger le cache.')
      }
      window.setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setIsPurging(false)
    }
  }

  // Export settings as JSON download
  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(settings, null, 2)
    )}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute(
      'download',
      `dzora-platform-settings-${new Date().toISOString().slice(0, 10)}.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()

    setToastMessage('Fichier de configuration exporté avec succès.')
    window.setTimeout(() => setToastMessage(null), 3000)
  }

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—'
    const d = new Date(isoString)
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#006B55] px-4 py-3 text-xs font-bold text-white shadow-xl shadow-[#006B55]/20 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 size={16} className="text-[#85E1C8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- Main Dashboard Content Area --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full pb-28">
        {/* Main Heading & Quick Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#60716F] mb-1">
              <Link href="/admin/dashboard" className="hover:text-[#006B55] transition">
                Tableau de bord
              </Link>
              <ChevronRight size={12} className="text-[#94A4A0]" />
              <span className="text-[#102A2A] font-semibold">Paramètres</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                Paramètres de la Plateforme
              </h1>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                  <ShieldCheck size={13} className="text-indigo-600" />
                  <span>Super Admin</span>
                </span>
              ) : isAdmin ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#006B55] bg-[#E7F2EF] border border-[#BBDDD4] px-2.5 py-1 rounded-lg">
                  <ShieldCheck size={13} className="text-[#006B55]" />
                  <span>Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  <AlertTriangle size={13} className="text-amber-600" />
                  <span>Lecture seule</span>
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#60716F] mt-0.5">
              Configuration globale de la marketplace Dzora, politiques commerciales, sécurité et logistique nationale.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3 py-1.5 rounded-xl border border-[#BBDDD4]">
              <Database size={13} className="text-[#006B55]" />
              <span className="hidden sm:inline">PostgreSQL</span>
              <span>Synchronisé</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#006B55] animate-pulse" />
            </span>

            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#102A2A] bg-white hover:bg-[#F4FAF7] border border-[#DCE8E3] rounded-xl transition cursor-pointer shadow-xs"
              title="Exporter la configuration en JSON"
            >
              <Download size={14} className="text-[#60716F]" />
              <span className="hidden sm:inline">Exporter</span>
            </button>

            <button
              type="button"
              onClick={fetchSettings}
              disabled={isLoading}
              className="p-2 text-[#4A5D58] hover:text-[#006B55] hover:bg-white rounded-xl border border-[#DCE8E3] transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Recharger la configuration depuis PostgreSQL"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#006B55]' : ''} />
            </button>
          </div>
        </div>

        {/* Read-only Alert if user is not admin */}
        {!isAdmin && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-extrabold text-sm text-amber-800">
                Mode Consultation (Lecture Seule)
              </div>
              <p className="text-amber-700 leading-relaxed">
                Votre compte ne dispose pas des privilèges administrateur nécessaires pour enregistrer des modifications en base de données. Seuls les administrateurs et super-administrateurs peuvent mettre à jour les réglages de la marketplace.
              </p>
            </div>
          </div>
        )}

        {/* Maintenance Banner Warning (if currently enabled) */}
        {settings.general.maintenanceMode && (
          <div className="rounded-2xl border border-red-300 bg-red-50/90 p-4 text-xs text-red-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-extrabold text-sm text-red-800">
                Mode Maintenance Activé
              </div>
              <p className="text-red-700 leading-relaxed">
                La boutique en direct est actuellement inaccessible aux visiteurs réguliers. Seuls les administrateurs connectés peuvent naviguer sur le site.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB NAVIGATION BAR (Sticky & Horizontal Scroll)           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-1.5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex items-center gap-1 overflow-x-auto scrollbar-none sticky top-20 z-20 backdrop-blur-md bg-white/95">
          {[
            { id: 'general', label: 'Général', icon: Building2 },
            { id: 'financial', label: 'Commissions & Paiements', icon: CreditCard },
            { id: 'logistics', label: 'Logistique & Livraison', icon: Truck },
            { id: 'security', label: 'Sécurité & Accès', icon: ShieldCheck },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'sellers', label: 'Politiques Vendeurs', icon: Store },
            { id: 'system', label: 'Système & Cache', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]/80 shadow-[0_1px_4px_rgba(0,107,85,0.06)]'
                    : 'text-[#60716F] hover:text-[#102A2A] hover:bg-[#F4FAF7]'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#006B55]' : 'text-[#71827D]'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: GÉNÉRAL & PLATEFORME                               */}
        {/* ========================================================= */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card A: Identité de la marketplace */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Building2 size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Identité de la Marketplace
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Informations publiques affichées sur les factures et communications officielles.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Nom de la Marketplace
                  </label>
                  <input
                    type="text"
                    value={settings.general.marketplaceName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, marketplaceName: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Slogan officiel
                  </label>
                  <input
                    type="text"
                    value={settings.general.tagline}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, tagline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Adresse e-mail de contact
                  </label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, contactEmail: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Téléphone du siège officiel (Algérie)
                  </label>
                  <input
                    type="text"
                    value={settings.general.supportPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, supportPhone: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Adresse du siège social
                  </label>
                  <input
                    type="text"
                    value={settings.general.headquartersAddress}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, headquartersAddress: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Card B: Paramètres Régionaux */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Globe size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Paramètres Régionaux & Fuseau
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Localisation monétaire et horaire de la marketplace Dzora.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Fuseau horaire
                  </label>
                  <input
                    type="text"
                    disabled
                    value={settings.general.timezone}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-[#DCE8E3] rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Devise par défaut
                  </label>
                  <input
                    type="text"
                    disabled
                    value={settings.general.defaultCurrency}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-[#DCE8E3] rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Langue par défaut
                  </label>
                  <select
                    value={settings.general.defaultLanguage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, defaultLanguage: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition cursor-pointer"
                  >
                    <option value="Français">Français (FR)</option>
                    <option value="العربية">العربية (AR)</option>
                    <option value="English">English (EN)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card C: Mode Maintenance d'Urgence */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5EEEB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <Flame size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#102A2A] font-display">
                      Mode Maintenance d’Urgence
                    </h2>
                    <p className="text-xs text-[#71827D]">
                      Suspend immédiatement la boutique publique pour des travaux techniques majeurs.
                    </p>
                  </div>
                </div>

                {/* Maintenance Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (!settings.general.maintenanceMode) {
                      setMaintenanceModalOpen(true)
                    } else {
                      setSettings({
                        ...settings,
                        general: { ...settings.general, maintenanceMode: false },
                      })
                    }
                  }}
                  className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    settings.general.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                  aria-label="Basculer le mode maintenance"
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                      settings.general.maintenanceMode ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                  Message public affiché aux acheteurs
                </label>
                <textarea
                  rows={2}
                  value={settings.general.maintenanceNotice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, maintenanceNotice: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COMMISSIONS & PAIEMENTS                            */}
        {/* ========================================================= */}
        {activeTab === 'financial' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card A: Taux de commission & Frais */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Commissions & Délais de Reversement Vendeurs
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Modèle économique et prélèvements sur les transactions de la marketplace.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Taux de commission standard (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={settings.financial.defaultCommissionRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          financial: {
                            ...settings.financial,
                            defaultCommissionRate: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-8 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      %
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#71827D] mt-1 block">
                    Prélevé sur chaque article vendu
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Frais de traitement par commande
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={settings.financial.fixedOrderFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          financial: {
                            ...settings.financial,
                            fixedOrderFee: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      DA
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#71827D] mt-1 block">
                    Frais fixes facturés par commande
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Délai de reversement vendeur
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={settings.financial.sellerPayoutDelayDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          financial: {
                            ...settings.financial,
                            sellerPayoutDelayDays: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-12 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      Jours
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#71827D] mt-1 block">
                    Après livraison confirmée sans litige
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Seuil minimum de virement CCP
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      value={settings.financial.minimumPayoutAmount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          financial: {
                            ...settings.financial,
                            minimumPayoutAmount: parseInt(e.target.value) || 1000,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      DA
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#71827D] mt-1 block">
                    Solde minimum requis pour virement
                  </span>
                </div>
              </div>
            </div>

            {/* Card B: Moyens de Paiement Autorisés */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Moyens de Paiement Activés pour les Acheteurs
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Options de paiement disponibles lors de la finalisation de commande sur Dzora.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Option 1: COD */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#102A2A] flex items-center gap-2">
                      <span>Paiement à la livraison (Cash on Delivery / Espèces)</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#E7F2EF] text-[#006B55]">
                        Essentiel en Algérie
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71827D]">
                      Règlement en espèces remis directement au livreur lors de la réception du colis.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.financial.enableCod}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financial: { ...settings.financial, enableCod: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                  />
                </div>

                {/* Option 2: CIB & EDAHABIA */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#102A2A] flex items-center gap-2">
                      <span>Cartes Bancaires CIB & EDAHABIA (SATIM)</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        Paiement Électronique
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71827D]">
                      Paiement en ligne sécurisé via le switch monétique national SATIM / Baridimob.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.financial.enableCibEdahabia}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financial: { ...settings.financial, enableCibEdahabia: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                  />
                </div>

                {/* Option 3: Virement / CCP */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#102A2A]">
                      Virement Bancaire & Versement CCP Direct
                    </div>
                    <p className="text-[11px] text-[#71827D]">
                      Validation manuelle après transmission du reçu de versement pour commandes volumineuses B2B.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.financial.enableBankTransfer}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financial: { ...settings.financial, enableBankTransfer: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LOGISTIQUE & LIVRAISON NATIONALE                   */}
        {/* ========================================================= */}
        {activeTab === 'logistics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card A: Paramètres d'expédition */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Truck size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Règles d’Expédition & Délais Nationaux
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Normes logistiques appliquées pour la livraison à travers les 58 wilayas d’Algérie.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Seuil de livraison gratuite (Franco de port)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={settings.logistics.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          logistics: {
                            ...settings.logistics,
                            freeShippingThreshold: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      DA
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#71827D] mt-1 block">
                    Livraison offerte au client au-delà de ce montant
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Délai max d’expédition vendeur
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="12"
                      step="12"
                      value={settings.logistics.maxDispatchDelayHours}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          logistics: {
                            ...settings.logistics,
                            maxDispatchDelayHours: parseInt(e.target.value) || 24,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-12 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      Heures
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#71827D] mt-1 block">
                    Délai pour confier le colis au transporteur (ex: 48h)
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Délai légal de retour acheteur
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={settings.logistics.returnWindowDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          logistics: {
                            ...settings.logistics,
                            returnWindowDays: parseInt(e.target.value) || 4,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-12 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      Jours
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#71827D] mt-1 block">
                    Délai de rétractation conforme au commerce algérien
                  </span>
                </div>
              </div>
            </div>

            {/* Card B: Transporteurs Partenaires */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Layers size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Transporteurs Partenaires Intégrés (API Tracking)
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Services logistiques connectés pour l’étiquetage automatique et le suivi en direct.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'yalidine',
                    name: 'Yalidine Express',
                    desc: 'Réseau national 58 wilayas · Stop Desk & Domicile',
                    active: settings.logistics.integratedCarriers.yalidine,
                  },
                  {
                    id: 'procolis',
                    name: 'Procolis Logistics',
                    desc: 'Livraison express régionale et nationale',
                    active: settings.logistics.integratedCarriers.procolis,
                  },
                  {
                    id: 'maystro',
                    name: 'Maystro Delivery',
                    desc: 'Spécialiste e-commerce urbain et expéditions rapides',
                    active: settings.logistics.integratedCarriers.maystro,
                  },
                  {
                    id: 'zrExpress',
                    name: 'ZR Express',
                    desc: 'Réseau étendu de distribution et ramassage quotidien',
                    active: settings.logistics.integratedCarriers.zrExpress,
                  },
                ].map((carrier) => (
                  <div
                    key={carrier.id}
                    className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-[#102A2A]">{carrier.name}</div>
                      <p className="text-[11px] text-[#71827D]">{carrier.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={carrier.active}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          logistics: {
                            ...settings.logistics,
                            integratedCarriers: {
                              ...settings.logistics.integratedCarriers,
                              [carrier.id]: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SÉCURITÉ & ACCÈS                                   */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card A: 2FA & Politiques de mot de passe */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Politiques d’Authentification Administrateur
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Exigences cryptographiques et protections d’accès au portail de gestion.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* 2FA Enforce */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#102A2A] flex items-center gap-2">
                      <span>Double authentification (2FA) obligatoire pour les administrateurs</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#E7F2EF] text-[#006B55]">
                        Recommandé SSI
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71827D]">
                      Exige un code TOTP ou code de secours valide lors de chaque connexion au centre d’administration.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.enforceAdmin2Fa}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, enforceAdmin2Fa: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                  />
                </div>

                {/* Expiration de session */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                      Durée d’expiration de session inactive
                    </label>
                    <select
                      value={settings.security.sessionTimeoutHours}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            sessionTimeoutHours: parseInt(e.target.value) || 8,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition cursor-pointer"
                    >
                      <option value="4">4 heures</option>
                      <option value="8">8 heures (Recommandé)</option>
                      <option value="12">12 heures</option>
                      <option value="24">24 heures</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                      Longueur minimale du mot de passe
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={settings.security.minPasswordLength}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            minPasswordLength: parseInt(e.target.value) || 12,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Anti-Bruteforce & IP Whitelist */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Lock size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Protection Anti-Force Brute & Réseau
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Mesures de mitigation contre les attaques d’énumération et restriction réseau.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#102A2A]">
                      Verrouillage temporaire après échecs répétés
                    </div>
                    <p className="text-[11px] text-[#71827D]">
                      Bloque les requêtes pendant 15 minutes après 5 mots de passe erronés consécutifs.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.bruteForceProtection}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, bruteForceProtection: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#60716F] uppercase text-[11px]">
                      Restriction par liste blanche d’adresses IP (IP Whitelist)
                    </label>
                    <span className="text-[11px] text-[#71827D]">
                      {settings.security.ipWhitelistEnabled ? 'Activée' : 'Désactivée'}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={settings.security.ipWhitelist.join(', ')}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          ipWhitelist: e.target.value.split(',').map((ip) => ip.trim()),
                        },
                      })
                    }
                    placeholder="Ex : 197.200.12.44, 105.101.48.0/24"
                    className="w-full p-2.5 font-mono bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: NOTIFICATIONS & PASSERELLES                        */}
        {/* ========================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card A: Passerelle SMS */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Passerelle SMS & Alertes Mobiles
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Canal SMS pour l’envoi des codes OTP et notifications critiques aux vendeurs et acheteurs.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Fournisseur Passerelle SMS
                  </label>
                  <input
                    type="text"
                    value={settings.notifications.smsProvider}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, smsProvider: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-[#102A2A]">Alerte SMS au Vendeur</div>
                      <p className="text-[11px] text-[#71827D]">
                        SMS immédiat au vendeur lors de la réception d’une nouvelle commande.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsOrderNotificationSeller}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            smsOrderNotificationSeller: e.target.checked,
                          },
                        })
                      }
                      className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-[#102A2A]">SMS de Suivi à l’Acheteur</div>
                      <p className="text-[11px] text-[#71827D]">
                        Envoi du numéro de suivi transporteur dès la prise en charge du colis.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsTrackingNotificationBuyer}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            smsTrackingNotificationBuyer: e.target.checked,
                          },
                        })
                      }
                      className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Email Transactionnel */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Service Email Transactionnel
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Expédition des confirmations de commande, factures PDF et alertes de modération.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                    Adresse d’expédition (Sender)
                  </label>
                  <input
                    type="email"
                    value={settings.notifications.emailSenderAddress}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          emailSenderAddress: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>

                <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#102A2A]">Alertes Litiges & Réclamations</div>
                    <p className="text-[11px] text-[#71827D]">
                      Alerte automatique transmise à l’équipe support en cas de signalement client.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailAdminDisputeAlerts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          emailAdminDisputeAlerts: e.target.checked,
                        },
                      })
                    }
                    className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: POLITIQUES VENDEURS & CATALOGUE                    */}
        {/* ========================================================= */}
        {activeTab === 'sellers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Store size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Modération & Règles d’Intégration des Vendeurs
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Gouvernance du catalogue produits et critères de conformité légale des marchands.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Rule 1: Product approval */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#102A2A]">
                      Validation préalable obligatoire des nouveaux produits
                    </div>
                    <p className="text-[11px] text-[#71827D]">
                      Les articles soumis par les vendeurs doivent être vérifiés par l’équipe de modération avant affichage public.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sellers.requireProductApproval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sellers: { ...settings.sellers, requireProductApproval: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                  />
                </div>

                {/* Rule 2: Legal docs */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#102A2A]">
                      Vérification stricte du Registre de Commerce (RC) / Carte Artisan
                    </div>
                    <p className="text-[11px] text-[#71827D]">
                      Obligatoire pour autoriser le marchand à activer son stock et recevoir des paiements.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sellers.requireLegalDocuments}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sellers: { ...settings.sellers, requireLegalDocuments: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 text-[#006B55] rounded accent-[#006B55] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                      Quota max d’articles pour nouveaux vendeurs
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={settings.sellers.maxProductsForNewSellers}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sellers: {
                            ...settings.sellers,
                            maxProductsForNewSellers: parseInt(e.target.value) || 50,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                    />
                    <span className="text-[10.5px] text-[#71827D] mt-1 block">
                      Nombre limite de références avant statut vérifié
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#60716F] uppercase text-[11px] mb-1.5">
                      Taux d’annulation max toléré avant avertissement (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.sellers.maxCancellationRatePercent}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            sellers: {
                              ...settings.sellers,
                              maxCancellationRatePercent: parseInt(e.target.value) || 8,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 pr-8 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        %
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#71827D] mt-1 block">
                      Déclenche un signalement automatique pour contrôle qualité
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SYSTÈME, CACHE & MAINTENANCE                       */}
        {/* ========================================================= */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card A: État du Système */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Server size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Infrastructure & Disponibilité des Services
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Santé des micro-services, version du noyau et journalisation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] space-y-1">
                  <span className="text-[#71827D] block text-[11px]">Base PostgreSQL</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#006B55] animate-pulse" />
                    <span className="font-bold text-[#102A2A]">Opérationnelle</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] space-y-1">
                  <span className="text-[#71827D] block text-[11px]">Cache & Files Redis</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#006B55] animate-pulse" />
                    <span className="font-bold text-[#102A2A]">Actif (In-Memory)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] space-y-1">
                  <span className="text-[#71827D] block text-[11px]">Version applicative</span>
                  <div className="font-mono font-bold text-[#102A2A]">
                    {settings.system.appVersion}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="text-[#71827D] block text-[11px] mb-1">
                    Fréquence des sauvegardes de base de données
                  </span>
                  <input
                    type="text"
                    disabled
                    value="Automatique Quotidienne (02h00 GMT+1)"
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-[#DCE8E3] rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <span className="text-[#71827D] block text-[11px] mb-1">
                    Dernière sauvegarde exécutée
                  </span>
                  <input
                    type="text"
                    disabled
                    value={formatDate(settings.system.lastBackupAt)}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-[#DCE8E3] rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Card B: Entretien & Purge Cache */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5EEEB]">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Database size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A2A] font-display">
                    Entretien Système & Cache CDN
                  </h2>
                  <p className="text-xs text-[#71827D]">
                    Action de vidage de cache pour forcer la mise à jour immédiate des contenus publics.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-[#102A2A]">
                    Purger le Cache Applicatif et le CDN
                  </div>
                  <p className="text-[11px] text-[#71827D]">
                    Invalide les requêtes mises en cache pour recharger instantanément les nouveaux produits et pages d’accueil.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCacheModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#006B55] bg-white hover:bg-[#E7F2EF] border border-[#BBDDD4] transition active:scale-95 shrink-0 cursor-pointer shadow-xs"
                >
                  Purger le cache
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* STICKY BOTTOM SAVE ACTION BAR                             */}
      {/* ========================================================= */}
      <div
        className={`fixed bottom-0 left-0 right-0 lg:pl-[240px] z-40 transition-transform duration-300 ${
          hasChanges ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <div className="bg-white/95 border-t border-[#DCE8E3] backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#102A2A]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-bold">Modifications non enregistrées détectées.</span>
            <span className="text-[#71827D] hidden md:inline">
              Pensez à sauvegarder vos réglages pour les appliquer à la plateforme.
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] border border-[#DCE8E3] transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={13} />
              <span>Annuler</span>
            </button>

            <button
              type="button"
              disabled={isSaving || !isAdmin}
              onClick={handleSave}
              title={!isAdmin ? 'Privilèges administrateur requis pour enregistrer' : 'Enregistrer dans la base de données PostgreSQL'}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#006B55] hover:bg-[#005544] transition active:scale-95 cursor-pointer disabled:opacity-60 shadow-xs shadow-[#006B55]/20"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Enregistrement en cours…</span>
                </>
              ) : !isAdmin ? (
                <>
                  <Lock size={14} />
                  <span>Sauvegarde verrouillée</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Enregistrer dans PostgreSQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CONFIRMATION DU MODE MAINTENANCE                   */}
      {/* ========================================================= */}
      {maintenanceModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-[#102A2A] font-display">
                Activer le Mode Maintenance ?
              </h3>
            </div>

            <p className="text-xs text-[#60716F] leading-relaxed">
              En activant ce mode, l’accès à la boutique publique et la passation de commandes seront temporairement bloqués pour tous les visiteurs. Seuls les administrateurs connectés pourront voir les pages.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMaintenanceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-gray-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: true },
                  })
                  setMaintenanceModalOpen(false)
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer"
              >
                Activer la maintenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PURGE DU CACHE CDN & REDIS                         */}
      {/* ========================================================= */}
      {cacheModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4">
            <div className="flex items-center gap-3 text-[#006B55]">
              <div className="w-10 h-10 rounded-xl bg-[#E7F2EF] flex items-center justify-center shrink-0">
                <Database size={20} />
              </div>
              <h3 className="text-base font-bold text-[#102A2A] font-display">
                Purger le Cache de la Marketplace ?
              </h3>
            </div>

            <p className="text-xs text-[#60716F] leading-relaxed">
              Cette opération invalide les pages statiques et les données mises en mémoire tampon dans Redis. Elle permet d’afficher immédiatement les changements récents sur la vitrine publique.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isPurging}
                onClick={() => setCacheModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handlePurgeCache}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#006B55] hover:bg-[#005544] transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isPurging ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Purge en cours…</span>
                  </>
                ) : (
                  <span>Confirmer la purge</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function AdminParametresPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-6 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 rounded-full border-2 border-[#006B55] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminParametresContent />
    </Suspense>
  )
}
