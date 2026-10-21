'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  Store,
  Truck,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  BadgeCheck,
  Lock,
} from 'lucide-react'
import { api } from '@/lib/api'

export interface StoreCreationData {
  storeName: string
  slug: string
  category?: string
  sellerType?: 'PHYSICAL_STORE' | 'ECOMMERCE'
  legalStatus?: 'INDIVIDUAL' | 'AUTO_ENTREPRENEUR' | 'COMPANY'
  wilaya?: string
  commune?: string
  coveredWilayasCount?: number
  deliveryHome?: boolean
  deliveryDesk?: boolean
}

export interface StoreCreationFlowProps {
  storeData: StoreCreationData
  initialStatus?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null
  skipCreationAnimation?: boolean
  onApproved?: () => void
}

interface StepItem {
  id: number
  title: string
  subtitle: string
  icon: React.ElementType
}

const CREATION_STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Profil & Identité commerciale',
    subtitle: 'Enregistrement du nom, catégorie et identifiant de boutique',
    icon: Store,
  },
  {
    id: 2,
    title: 'Paramètres logistiques & expédition',
    subtitle: 'Configuration des wilayas desservies et options de livraison',
    icon: Truck,
  },
  {
    id: 3,
    title: 'Conformité légale & coordonnées',
    subtitle: 'Validation du statut professionnel et coordonnées de contact',
    icon: ShieldCheck,
  },
  {
    id: 4,
    title: 'Initialisation de l’espace vendeur',
    subtitle: 'Préparation du catalogue et des accès au tableau de bord',
    icon: Sparkles,
  },
]

export function StoreCreationFlow({
  storeData,
  initialStatus = 'PENDING',
  skipCreationAnimation = false,
  onApproved,
}: StoreCreationFlowProps) {
  const router = useRouter()

  // Creation sequence: 0 to 4 are animation stages, 5 is the final stop ("En cours de vérification")
  const [activeCreationStep, setActiveCreationStep] = useState<number>(
    skipCreationAnimation ? 5 : 0
  )
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    skipCreationAnimation ? [1, 2, 3, 4] : []
  )

  // Real seller status from backend
  const [currentStatus, setCurrentStatus] = useState<
    'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null
  >(initialStatus)

  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date>(new Date())
  const [pollError, setPollError] = useState<string | null>(null)

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /* -------------------------------------------------------------------------- */
  /*            Animated creation progression (professional & steady)           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (skipCreationAnimation) {
      setActiveCreationStep(5)
      setCompletedSteps([1, 2, 3, 4])
      return
    }

    let isCancelled = false

    const runSequence = async () => {
      // Step 1
      setActiveCreationStep(1)
      await new Promise((r) => setTimeout(r, 650))
      if (isCancelled) return
      setCompletedSteps((prev) => [...prev, 1])

      // Step 2
      setActiveCreationStep(2)
      await new Promise((r) => setTimeout(r, 700))
      if (isCancelled) return
      setCompletedSteps((prev) => [...prev, 2])

      // Step 3
      setActiveCreationStep(3)
      await new Promise((r) => setTimeout(r, 700))
      if (isCancelled) return
      setCompletedSteps((prev) => [...prev, 3])

      // Step 4
      setActiveCreationStep(4)
      await new Promise((r) => setTimeout(r, 750))
      if (isCancelled) return
      setCompletedSteps((prev) => [...prev, 4])

      // Settle smoothly on step 5 (Verification state)
      await new Promise((r) => setTimeout(r, 400))
      if (isCancelled) return
      setActiveCreationStep(5)
    }

    runSequence()

    return () => {
      isCancelled = true
    }
  }, [skipCreationAnimation])

  /* -------------------------------------------------------------------------- */
  /*            Background Polling & Manual refresh for Admin approval          */
  /* -------------------------------------------------------------------------- */
  const checkStatusNow = useCallback(async () => {
    setIsCheckingStatus(true)
    setPollError(null)

    try {
      const res = await api.seller.getStatus()
      setLastCheckedAt(new Date())

      if (res && res.status) {
        setCurrentStatus(res.status)
        if (res.status === 'APPROVED' && onApproved) {
          setTimeout(() => {
            onApproved()
          }, 3500)
        }
      }
    } catch {
      setPollError('Actualisation momentanément indisponible.')
    } finally {
      setIsCheckingStatus(false)
    }
  }, [onApproved])

  useEffect(() => {
    if (activeCreationStep < 5 || currentStatus === 'APPROVED') {
      return
    }

    pollIntervalRef.current = setInterval(() => {
      checkStatusNow()
    }, 12000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [activeCreationStep, currentStatus, checkStatusNow])

  const isApproved = currentStatus === 'APPROVED'
  const isRejected = currentStatus === 'REJECTED'
  const progressPercent = Math.min(100, completedSteps.length * 25)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* PHASE 1: Active Creation Stepper (Simple & Professional)           */}
      {/* ------------------------------------------------------------------ */}
      {activeCreationStep < 5 && (
        <motion.div
          key="creation-progress"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[#DCE8E3] bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(16,42,42,0.04)]"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#DCE8E3]">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#E7F2EF] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[#006B55] uppercase">
                  Configuration en cours
                </span>
                <span className="text-xs font-semibold text-[#60716F]">
                  Étape {activeCreationStep} sur 4
                </span>
              </div>
              <h2 className="mt-2 font-display text-xl sm:text-2xl font-extrabold tracking-[-0.03em] text-[#102A2A]">
                Création de votre boutique « {storeData.storeName} »
              </h2>
              <p className="mt-1 text-xs text-[#60716F]">
                Veuillez patienter quelques instants pendant la mise en place de vos accès vendeurs.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#006B55] sm:self-center">
              <RefreshCw size={15} className="animate-spin text-[#006B55]" />
              <span>{progressPercent}% complété</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#EBF3F0]">
              <motion.div
                className="h-full bg-[#006B55]"
                initial={{ width: '5%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Steps checklist */}
          <div className="mt-6 space-y-2.5">
            {CREATION_STEPS.map((step) => {
              const Icon = step.icon
              const isDone = completedSteps.includes(step.id)
              const isCurrent = activeCreationStep === step.id

              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors ${
                    isCurrent
                      ? 'border-[#008F72] bg-[#F7FBF9]'
                      : isDone
                      ? 'border-[#E2EDE8] bg-white'
                      : 'border-[#EEF4F1] bg-[#FAFDFB] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`grid size-9 shrink-0 place-items-center rounded-xl font-bold transition-colors ${
                        isDone
                          ? 'bg-[#006B55] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#E7F2EF] text-[#006B55]'
                          : 'bg-[#F0F5F3] text-[#71827D]'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} />
                      ) : isCurrent ? (
                        <RefreshCw size={16} className="animate-spin text-[#006B55]" />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-[#006B55]' : 'text-[#102A2A]'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[11px] text-[#71827D] truncate">{step.subtitle}</p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-3">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E7F2EF] px-2 py-0.5 text-[10px] font-bold text-[#006B55]">
                        <CheckCircle2 size={12} />
                        Validé
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        En cours
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[#94A4A0]">En attente</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PHASE 2: Settled View ("En cours de vérification" or Approved)     */}
      {/* ------------------------------------------------------------------ */}
      {activeCreationStep >= 5 && (
        <AnimatePresence mode="wait">
          {isApproved ? (
            /* ------------------ APPROVED SUCCESS STATE ------------------ */
            <motion.div
              key="approved-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-emerald-300 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(16,42,42,0.04)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE8E3]">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#006B55] text-white shadow-xs">
                    <BadgeCheck size={26} />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-[#E7F2EF] px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-[#006B55] uppercase">
                      Boutique Approuvée
                    </span>
                    <h2 className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-[#102A2A]">
                      Votre boutique est maintenant active !
                    </h2>
                  </div>
                </div>

                <Link
                  href="/vendeur/dashboard"
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#006B55] px-5 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(0,107,85,0.2)] hover:bg-[#008F72] transition"
                >
                  <span>Accéder au tableau de bord</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="mt-6 text-xs text-[#4A5D58] leading-relaxed">
                L’administration Dzora a validé votre profil vendeur. Vous pouvez dès à présent ajouter vos premiers produits et gérer vos commandes.
              </div>
            </motion.div>
          ) : isRejected ? (
            /* ------------------ REJECTED STATE ------------------ */
            <motion.div
              key="rejected-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(16,42,42,0.04)]"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-red-950">Dossier non validé</h3>
                  <p className="mt-1 text-xs text-red-800">
                    Des informations complémentaires ou corrections sont nécessaires sur votre dossier de boutique.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/devenir-vendeur/creer"
                      className="inline-flex min-h-[38px] items-center gap-2 rounded-xl bg-[#006B55] px-4 py-2 text-xs font-bold text-white hover:bg-[#008F72]"
                    >
                      Modifier mes informations
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ------------------ MAIN PENDING VERIFICATION STATE ------------------ */
            <motion.div
              key="pending-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Notice Banner (Matching Dashboard style exactly) */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-xs">
                <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-amber-950">
                    Votre dossier vendeur est en cours d’examen par l’équipe Dzora
                  </p>
                  <p className="mt-0.5 text-amber-800">
                    Votre boutique a été créée. Les équipes de conformité procèdent à la validation de vos informations. Votre vitrine publique et la publication des produits seront activées dès validation définitive.
                  </p>
                </div>
              </div>

              {/* Header Card: Greeting & Status Actions */}
              <div className="rounded-2xl border border-[#DCE8E3] bg-white p-6 shadow-[0_1px_3px_rgba(16,42,42,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#DCE8E3]">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#006B55] text-white shadow-xs">
                      <Store size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-[-0.035em] text-[#102A2A]">
                          {storeData.storeName}
                        </h1>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          <Clock size={11} className="text-amber-600" />
                          En cours de vérification
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#60716F]">
                        {storeData.sellerType === 'PHYSICAL_STORE'
                          ? 'Boutique physique locale'
                          : 'Boutique e-commerce en ligne'}{' '}
                        · {storeData.wilaya || 'Algérie'}
                      </p>
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      type="button"
                      onClick={checkStatusNow}
                      disabled={isCheckingStatus}
                      className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-3.5 py-2 text-xs font-bold text-[#102A2A] shadow-xs transition hover:border-[#008F72] hover:bg-[#F7FAF9] disabled:opacity-60"
                      title="Vérifier le statut d'approbation"
                    >
                      <RefreshCw
                        size={13}
                        className={isCheckingStatus ? 'animate-spin text-[#006B55]' : 'text-[#60716F]'}
                      />
                      <span>{isCheckingStatus ? 'Actualisation...' : 'Actualiser le statut'}</span>
                    </button>
                  </div>
                </div>

                {/* 3 KPI-Style Information Cards (Matching Dashboard Grid) */}
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Card 1: Reference Dossier / Lien de vitrine verrouillé */}
                  <div className="rounded-xl border border-[#DCE8E3] bg-[#F7FBF9] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#60716F]">
                        Lien de la vitrine
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/90 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-900 border border-amber-200">
                        <Lock size={9} />
                        Verrouillé
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-[#60716F] font-mono flex items-center gap-1 truncate">
                      <span className="text-[#8A9A96]">dzora.dz/vendeur/</span>
                      <span className="text-[#102A2A]">{storeData.slug || 'boutique'}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800 font-medium">
                      Activé dès validation administrative
                    </p>
                  </div>

                  {/* Card 2: Logistique */}
                  <div className="rounded-xl border border-[#DCE8E3] bg-[#F7FBF9] p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#60716F]">
                      Expédition & Couverture
                    </span>
                    <p className="mt-2 text-sm font-extrabold text-[#102A2A]">
                      {storeData.coveredWilayasCount ? `${storeData.coveredWilayasCount} Wilayas couvertes` : '58 Wilayas'}
                    </p>
                    <p className="mt-1 text-[11px] text-[#71827D]">
                      Domicile & Stop-desk
                    </p>
                  </div>

                  {/* Card 3: Délai estimé */}
                  <div className="rounded-xl border border-[#DCE8E3] bg-[#F7FBF9] p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#60716F]">
                      Délai de traitement
                    </span>
                    <p className="mt-2 text-sm font-extrabold text-[#006B55]">
                      24h à 48h ouvrées
                    </p>
                    <p className="mt-1 text-[11px] text-[#71827D]">
                      Alerte automatique par SMS
                    </p>
                  </div>
                </div>

                {/* 3-Step Milestone Timeline */}
                <div className="mt-6 pt-5 border-t border-[#DCE8E3]">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#60716F] block mb-3">
                    Progression de l’activation
                  </span>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* Step 1: Terminé */}
                    <div className="flex items-center gap-3 rounded-xl border border-[#DCE8E3] bg-white p-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#E7F2EF] text-[#006B55]">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#102A2A]">1. Dossier déposé</p>
                        <p className="text-[10px] text-[#006B55] font-semibold">Formulaire complété</p>
                      </div>
                    </div>

                    {/* Step 2: En cours */}
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-800">
                        <Clock size={16} className="text-amber-700 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-950">2. Examen de conformité</p>
                        <p className="text-[10px] text-amber-800 font-semibold">Vérification en cours</p>
                      </div>
                    </div>

                    {/* Step 3: À venir */}
                    <div className="flex items-center gap-3 rounded-xl border border-[#DCE8E3] bg-[#F7FBF9] p-3 opacity-60">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#E8F0ED] text-[#71827D]">
                        <Store size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#60716F]">3. Boutique en ligne</p>
                        <p className="text-[10px] text-[#71827D]">Ventes & commandes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Bar Footer */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#DCE8E3] text-[11px] text-[#60716F]">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#008F72] animate-pulse" />
                    <span>Système d’écoute automatique actif (vérification toutes les 12s)</span>
                  </div>
                  <div>
                    Dernière vérification :{' '}
                    <strong className="text-[#102A2A]">
                      {lastCheckedAt.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Informative Guidance Card (matching dashboard card style) */}
              <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#E7F2EF] text-[#006B55]">
                    <HelpCircle size={17} />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-[#102A2A]">Que faire pendant l’examen de votre compte ?</h3>
                    <p className="text-[#60716F] leading-relaxed">
                      Dès validation par l’administrateur, cette page se mettra à jour automatiquement. En attendant, vous pouvez préparer vos photos de produits, vos tarifs et vos stocks.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE8E3] pt-4 text-xs">
                  <div className="flex items-center gap-4 text-[#60716F]">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-[#006B55]" />
                      <span>vendeurs@dzora.dz</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-[#006B55]" />
                      <span>Support Vendeur Algérie</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8E3] bg-white px-3.5 py-2 text-xs font-bold text-[#102A2A] shadow-xs hover:bg-[#F7FAF9] transition"
                    >
                      <Store size={14} />
                      <span>Accueil Dzora</span>
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#006B55] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#008F72] transition"
                    >
                      <span>Catalogue</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
