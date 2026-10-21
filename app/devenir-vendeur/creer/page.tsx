'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Info,
  Laptop,
  Lightbulb,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Truck,
  X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { categories } from '@/lib/categories'
import { wilayasData } from '@/lib/wilayas'
import { communesByWilaya } from '@/lib/communes'
import { StoreCreationFlow, StoreCreationData } from '@/components/seller/store-creation-flow'

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const NAME_MAX = 60
const DESCRIPTION_MIN = 15
const DESCRIPTION_MAX = 600
const LOGO_MAX_BYTES = 2 * 1024 * 1024
const LOGO_ACCEPT = 'image/png,image/jpeg,image/webp'

export type SellerType = 'PHYSICAL_STORE' | 'ECOMMERCE'
export type LegalStatus = 'INDIVIDUAL' | 'AUTO_ENTREPRENEUR' | 'COMPANY'

const STEPS = [
  { number: 1, label: 'Modèle de vente' },
  { number: 2, label: 'Compte & Téléphone' },
  { number: 3, label: 'Vérification OTP' },
  { number: 4, label: 'Informations boutique' },
  { number: 5, label: 'Localisation & Logistique' },
  { number: 6, label: 'Cadre légal' },
  { number: 7, label: 'Aperçu & Lancement' },
] as const

const TIPS_BY_STEP: Record<number, string[]> = {
  1: [
    'Boutique physique : local ou magasin avec pignon sur rue, assurant la livraison de ses articles.',
    'E-commerce : vente 100% en ligne avec expédition de commandes partout en Algérie.',
    'Chaque commande bénéficie du suivi et de la livraison Dzora (domicile ou stop-desk).',
  ],
  2: [
    'Utilisez votre numéro de portable algérien principal (Ooredoo, Mobilis, Djezzy).',
    'Vous recevrez des alertes instantanées par SMS à chaque nouvelle commande.',
    'Vos informations personnelles restent strictement confidentielles.',
  ],
  3: [
    'Le code de confirmation est envoyé par SMS en quelques secondes.',
    'Vérifiez la saisie exacte des 6 chiffres reçus sur votre téléphone.',
    'En cas de retard réseau, utilisez l’option de renvoi après 60 secondes.',
  ],
  4: [
    'Choisissez un nom facile à retenir pour vos clients.',
    'Sélectionnez la catégorie la plus proche de vos produits phares.',
    'Ajoutez un logo ou une photo de façade nette au format carré.',
  ],
  5: [
    'Indiquez votre wilaya d’implantation ou d’expédition.',
    'Pour les magasins, précisez un repère visuel (près de la poste, lycée, etc.).',
    'Pour le e-commerce, choisissez les wilayas couvertes par votre transporteur.',
  ],
  6: [
    'Particulier / Artisan : commencez sans tracasserie administrative.',
    'Société : indiquez votre RC pour obtenir la certification Dzora.',
    'Vos pièces justificatives peuvent être envoyées plus tard depuis le tableau de bord.',
  ],
  7: [
    'Vérifiez attentivement les coordonnées et paramètres d’expédition.',
    'Votre boutique sera immédiatement accessible après validation.',
    'Vous pourrez ajouter vos premiers produits en quelques clics.',
  ],
}

/* -------------------------------------------------------------------------- */
/*                               Shared classes                               */
/* -------------------------------------------------------------------------- */

const focusRing =
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#008F72]/35 focus-visible:ring-offset-1'

const fieldBase =
  'block w-full min-h-[48px] rounded-xl border border-[#CFE0DA] bg-white px-4 text-[15px] text-[#102A2A] placeholder:text-[#71827D] ' +
  'motion-safe:transition-[border-color,box-shadow] motion-safe:duration-150 ' +
  'hover:border-[#9FC3B8] focus:outline-none focus:border-[#006B55] focus:ring-[3px] focus:ring-[#008F72]/20'

function fieldState(hasError: boolean) {
  return hasError
    ? '!border-[#C53030] !bg-[#FFFAFA] focus:!border-[#C53030] focus:!ring-[#C53030]/20'
    : 'border-[#CFE0DA]'
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

function wilayaLabel(name: string) {
  const parts = name.split(' - ')
  return parts.length > 1 ? parts.slice(1).join(' - ') : name
}

function cleanSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizePhone(input: string): string {
  let val = input.replace(/\D/g, '')
  if (val.startsWith('213')) val = val.substring(3)
  if (val.startsWith('0')) val = val.substring(1)
  return val
}

/* -------------------------------------------------------------------------- */
/*                               Sub-components                               */
/* -------------------------------------------------------------------------- */

function StepStatus({ number, currentStep }: { number: number; currentStep: number }) {
  if (number < currentStep) return <>Terminée</>
  if (number === currentStep) return <>En cours</>
  return <>À venir</>
}

function VerticalStepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="relative m-0 list-none space-y-0 p-0">
      {STEPS.map((step, index) => {
        const isCurrent = step.number === currentStep
        const isDone = step.number < currentStep
        const isLast = index === STEPS.length - 1
        return (
          <li
            key={step.number}
            aria-current={isCurrent ? 'step' : undefined}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[17px] top-9 bottom-1 w-[2px] rounded-full ${
                  isDone ? 'bg-[#006B55]' : 'bg-[#DCE8E3]'
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                isCurrent
                  ? 'bg-[#006B55] text-white shadow-[0_0_0_4px_rgba(0,107,85,0.14)]'
                  : isDone
                    ? 'bg-[#006B55] text-white'
                    : 'border-2 border-dashed border-[#B9CCC5] bg-white text-[#71827D]'
              }`}
            >
              {isDone ? <Check size={16} strokeWidth={3} /> : step.number}
            </span>
            <span className="pt-1">
              <span className="sr-only">Étape {step.number} : </span>
              <span
                className={`block text-xs leading-5 ${
                  isCurrent ? 'font-extrabold text-[#102A2A]' : 'font-semibold text-[#60716F]'
                }`}
              >
                {step.label}
              </span>
              <span
                className={`mt-0.5 inline-flex items-center gap-1 text-[11px] ${
                  isCurrent ? 'font-bold text-[#006B55]' : 'font-medium text-[#71827D]'
                }`}
              >
                {isCurrent && <span aria-hidden="true" className="size-1.5 rounded-full bg-[#006B55]" />}
                <StepStatus number={step.number} currentStep={currentStep} />
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function CompactStepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="m-0 grid list-none grid-cols-7 gap-1.5 p-0">
      {STEPS.map((step) => {
        const isCurrent = step.number === currentStep
        const isDone = step.number < currentStep
        return (
          <li
            key={step.number}
            aria-current={isCurrent ? 'step' : undefined}
            className="flex min-w-0 flex-col gap-1.5 items-center text-center"
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-full rounded-full ${isCurrent || isDone ? 'bg-[#006B55]' : 'bg-[#DCE8E3]'}`}
            />
            <span
              aria-hidden="true"
              className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${
                isCurrent || isDone
                  ? 'bg-[#006B55] text-white'
                  : 'border border-dashed border-[#B9CCC5] bg-white text-[#71827D]'
              }`}
            >
              {isDone ? <Check size={11} strokeWidth={3} /> : step.number}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function SidebarMotif() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 240 150"
      className="pointer-events-none h-auto w-full select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dz-star" width="40" height="40" patternUnits="userSpaceOnUse">
          <g stroke="#006B55" strokeOpacity="0.14" strokeWidth="1">
            <rect x="10" y="10" width="20" height="20" />
            <rect x="10" y="10" width="20" height="20" transform="rotate(45 20 20)" />
            <circle cx="20" cy="20" r="4" />
          </g>
        </pattern>
        <linearGradient id="dz-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" fill="url(#dz-star)" />
      <rect width="240" height="150" fill="url(#dz-fade)" />
      <path
        d="M0 150 V128 H14 V118 H26 V124 H38 V110 H50 V122 H62 V114 H74 V126 H86 V116 H96 V128
           L104 128 L112 70 L116 58 L120 70 L128 128 L132 128 L118 52 L120 44 L122 52 L108 128
           H140 V112 H152 V120 H164 V106 H178 V118 H190 V112 H202 V124 H216 V116 H228 V126 H240 V150 Z"
        fill="#006B55"
        fillOpacity="0.12"
      />
      <path d="M112 128 L120 46 L128 128" stroke="#006B55" strokeOpacity="0.28" strokeWidth="1.25" />
      <path d="M0 136 C40 130 80 140 120 134 C160 128 200 140 240 134" stroke="#008F72" strokeOpacity="0.25" strokeWidth="1.25" />
    </svg>
  )
}

function AlgeriaFlag({ className = 'h-3.5 w-5 rounded-[2px]' }: { className?: string }) {
  const maskId = useId()
  const cleanId = `dz-flag-mask-${maskId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg
      viewBox="0 0 900 600"
      className={`inline-block shrink-0 overflow-hidden ${className}`}
      aria-label="Drapeau algérien"
    >
      <defs>
        <mask id={cleanId}>
          <rect width="900" height="600" fill="white" />
          <circle cx="486" cy="300" r="120" fill="black" />
        </mask>
      </defs>
      {/* Vert (moitié gauche) */}
      <rect width="450" height="600" fill="#006233" />
      {/* Blanc (moitié droite) */}
      <rect x="450" width="450" height="600" fill="#ffffff" />
      {/* Croissant rouge */}
      <circle cx="450" cy="300" r="150" fill="#D21034" mask={`url(#${cleanId})`} />
      {/* Étoile rouge à 5 branches orientée vers le croissant */}
      <polygon
        points="435,300 476,286 477,243 502,278 545,264 519,299 545,334 502,320 477,355 476,312"
        fill="#D21034"
      />
    </svg>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13px] font-semibold text-[#B42318]">
      <AlertCircle size={15} aria-hidden="true" className="mt-px shrink-0" />
      <span>{message}</span>
    </p>
  )
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-[#B42318]">
      *
    </span>
  )
}

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#60716F]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function CreerBoutiquePage() {
  const router = useRouter()
  const { user, isAuthenticated, sendOtp, verifyOtp, registerWithPassword } = useAuth()
  const uid = useId()

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [notice, setNotice] = useState<string>('')
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Registration Form State
  const [sellerType, setSellerType] = useState<SellerType>('PHYSICAL_STORE')
  const [fullName, setFullName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [otpCode, setOtpCode] = useState<string>('')
  const [storeName, setStoreName] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [wilaya, setWilaya] = useState<string>('')
  const [commune, setCommune] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [coveredWilayas, setCoveredWilayas] = useState<string[]>([])
  const [deliveryHome, setDeliveryHome] = useState<boolean>(true)
  const [deliveryDesk, setDeliveryDesk] = useState<boolean>(true)
  const [description, setDescription] = useState<string>('')
  const [legalStatus, setLegalStatus] = useState<LegalStatus>('INDIVIDUAL')
  const [businessName, setBusinessName] = useState<string>('')
  const [rcNumber, setRcNumber] = useState<string>('')
  const [nifNumber, setNifNumber] = useState<string>('')
  const [nisNumber, setNisNumber] = useState<string>('')
  const [aiNumber, setAiNumber] = useState<string>('')
  const [autoEntrepreneurNumber, setAutoEntrepreneurNumber] = useState<string>('')
  const [ripCcp, setRipCcp] = useState<string>('')
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true)

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // OTP Timer State
  const [cooldown, setCooldown] = useState(0)
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null)

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Post-submission store creation and verification flow states
  const [isPostSubmission, setIsPostSubmission] = useState(false)
  const [skipCreationAnimation, setSkipCreationAnimation] = useState(false)
  const [submittedStoreData, setSubmittedStoreData] = useState<StoreCreationData | null>(null)
  const [sellerProfileStatus, setSellerProfileStatus] = useState<
    'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null
  >(null)
  const [isCheckingInitialStatus, setIsCheckingInitialStatus] = useState(true)

  // Verify if existing seller application exists
  useEffect(() => {
    let isMounted = true

    api.seller
      .getStatus()
      .then((res) => {
        if (!isMounted) return
        setIsCheckingInitialStatus(false)
        if (res && res.hasProfile && res.status) {
          setSellerProfileStatus(res.status)

          if (res.status === 'APPROVED') {
            router.replace('/vendeur/dashboard')
            return
          }

          if (res.status === 'PENDING' || res.status === 'UNDER_REVIEW') {
            setSubmittedStoreData({
              storeName: res.storeName || 'Ma boutique',
              slug: res.slug || '',
              sellerType: (res.type as SellerType) || 'PHYSICAL_STORE',
            })
            setSkipCreationAnimation(true)
            setIsPostSubmission(true)
          }
        }
      })
      .catch(() => {
        if (isMounted) setIsCheckingInitialStatus(false)
      })

    return () => {
      isMounted = false
    }
  }, [router])

  // Synchronize authenticated user data
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim())
      if (!phone && user.phone) setPhone(user.phone)
      if (!email && user.email) setEmail(user.email)
    }
  }, [user, fullName, phone, email])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Local Logo preview
  useEffect(() => {
    if (!logoFile) {
      setLogoUrl(null)
      return
    }
    const url = URL.createObjectURL(logoFile)
    setLogoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [logoFile])

  // Selected wilaya code helper
  const selectedWilayaCode = useMemo(() => {
    const found = wilayasData.find((w) => w.name === wilaya)
    return found ? found.code : '16'
  }, [wilaya])

  // Available communes for current wilaya
  const availableCommunes = useMemo(() => {
    return communesByWilaya[selectedWilayaCode] || []
  }, [selectedWilayaCode])

  const selectLogo = (file: File | undefined | null) => {
    if (!file) return
    if (!LOGO_ACCEPT.split(',').includes(file.type)) {
      setErrors((prev) => ({ ...prev, logo: 'Format non pris en charge. Choisissez une image PNG, JPG ou WebP.' }))
      return
    }
    if (file.size > LOGO_MAX_BYTES) {
      setErrors((prev) => ({ ...prev, logo: 'Le fichier dépasse 2 Mo. Choisissez une image plus légère.' }))
      return
    }
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.logo
      return copy
    })
    setLogoFile(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.logo
      return copy
    })
  }

  /* -------------------------------------------------------------------------- */
  /*                             Validation par étape                           */
  /* -------------------------------------------------------------------------- */

  const validateStep = (stepNum: number): boolean => {
    const errs: Record<string, string> = {}
    setGeneralError(null)

    if (stepNum === 2) {
      if (!isAuthenticated) {
        if (!fullName.trim()) errs.fullName = 'Indiquez votre nom et prénom.'
        const phoneDigits = normalizePhone(phone)
        if (!phoneDigits || phoneDigits.length !== 9 || !['5', '6', '7'].includes(phoneDigits[0])) {
          errs.phone = 'Indiquez un numéro algérien valide (ex. 0550123456, 0661..., 0770...).'
        }
        if (!password) {
          errs.password = 'Veuillez définir un mot de passe pour votre compte.'
        } else if (password.length < 8) {
          errs.password = 'Le mot de passe doit comporter au moins 8 caractères.'
        } else if (!/(?=.*\d|.*\W+)(?=.*[A-Z])(?=.*[a-z])/.test(password)) {
          errs.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre ou symbole.'
        }
      } else {
        const phoneDigits = normalizePhone(phone || user?.phone || '')
        if (!phoneDigits || phoneDigits.length !== 9) {
          errs.phone = 'Veuillez renseigner un numéro de téléphone mobile pour recevoir les notifications.'
        }
      }
    }

    if (stepNum === 3) {
      if (otpCode.trim().length < 6) {
        errs.otpCode = 'Veuillez saisir le code complet à 6 chiffres.'
      }
    }

    if (stepNum === 4) {
      if (!storeName.trim() || storeName.trim().length < 2) {
        errs.storeName = 'Indiquez le nom de votre boutique (au moins 2 caractères).'
      }
      if (!category) {
        errs.category = 'Sélectionnez une catégorie principale.'
      }
      if (!description.trim() || description.trim().length < DESCRIPTION_MIN) {
        errs.description = `Ajoutez quelques détails (${DESCRIPTION_MIN} caractères minimum).`
      }
    }

    if (stepNum === 5) {
      if (!wilaya) errs.wilaya = 'Choisissez votre wilaya.'
      if (sellerType === 'PHYSICAL_STORE') {
        if (!commune) errs.commune = 'Sélectionnez la commune de votre magasin.'
        if (!address.trim() || address.trim().length < 5) {
          errs.address = 'Indiquez l’adresse exacte ou un repère visuel connu pour le magasin.'
        }
      } else {
        if (coveredWilayas.length === 0) {
          errs.coveredWilayas = 'Cochez au moins une wilaya livrable.'
        }
      }
    }

    if (stepNum === 6) {
      if (legalStatus === 'COMPANY' && !rcNumber.trim()) {
        errs.rcNumber = 'Le numéro de Registre de Commerce (RC) est requis pour les sociétés.'
      }
    }

    if (stepNum === 7) {
      if (!acceptTerms) {
        errs.acceptTerms = 'Veuillez accepter les conditions vendeur pour lancer votre boutique.'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* -------------------------------------------------------------------------- */
  /*                            Navigation & Actions                            */
  /* -------------------------------------------------------------------------- */

  const handleNext = async () => {
    if (!validateStep(currentStep)) return

    // Étape 2 : Déclenchement de l'OTP SMS
    if (currentStep === 2) {
      const phoneDigits = normalizePhone(phone)
      const fullPhone = `+213${phoneDigits}`

      if (isAuthenticated && user?.phoneVerified && user?.phone === fullPhone) {
        setCurrentStep(4)
        return
      }

      setIsSubmitting(true)
      try {
        const res = await sendOtp(fullPhone, { checkNewUser: !isAuthenticated, purpose: 'seller_register' })
        setCooldown(res.cooldownSeconds || 60)
        if (res.otpCodeForDev) setDevOtpCode(res.otpCodeForDev)
        setCurrentStep(3)
      } catch (err: any) {
        const errMsg = err.message || 'Impossible d’envoyer le code SMS pour le moment.'
        if (
          err.statusCode === 409 ||
          errMsg.toLowerCase().includes('existe déjà') ||
          errMsg.toLowerCase().includes('déjà associé')
        ) {
          setErrors((prev) => ({
            ...prev,
            phone: 'Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter ou utiliser un autre numéro.',
          }))
        } else {
          setGeneralError(errMsg)
        }
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Étape 3 : Vérification OTP
    if (currentStep === 3) {
      setIsSubmitting(true)
      try {
        const phoneDigits = normalizePhone(phone)
        const fullPhone = `+213${phoneDigits}`

        if (!isAuthenticated) {
          try {
            await verifyOtp(fullPhone, otpCode.trim())
          } catch {
            await registerWithPassword({
              email: email.trim() || `${phoneDigits}@dzora.dz`,
              password,
              fullName: fullName.trim(),
              phone: fullPhone,
            })
          }
        } else {
          try {
            await api.auth.linkPhone(fullPhone, otpCode.trim())
          } catch (linkErr: any) {
            // If the user's session expired or token is invalid (401), authenticate via verifyOtp
            if (linkErr?.statusCode === 401 || linkErr?.message?.includes('Jeton')) {
              await verifyOtp(fullPhone, otpCode.trim())
            } else {
              throw linkErr
            }
          }
        }

        setCurrentStep(4)
      } catch (err: any) {
        setErrors((p) => ({ ...p, otpCode: err.message || 'Code de vérification incorrect ou expiré.' }))
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (currentStep < 7) {
      setCurrentStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setErrors({})
    setGeneralError(null)
    if (currentStep === 4 && isAuthenticated && user?.phoneVerified) {
      setCurrentStep(2)
    } else if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Strictly ensure submission only runs on Step 7
    if (currentStep !== 7) {
      return
    }

    if (!validateStep(7)) return

    setIsSubmitting(true)
    setGeneralError(null)

    try {
      const wilayaClean = wilayaLabel(wilaya)
      const finalSlug = slug.trim() || cleanSlug(storeName)

      await api.seller.apply({
        type: sellerType,
        storeName: storeName.trim(),
        slug: finalSlug,
        description: description.trim(),
        category,
        wilaya: wilayaClean,
        commune: commune || undefined,
        address: address.trim() || undefined,
        coveredWilayas: coveredWilayas,
        deliveryHome,
        deliveryDesk,
        legalStatus,
        businessName: businessName.trim() || undefined,
        businessRegistration: rcNumber.trim() || undefined,
        nifNumber: nifNumber.trim() || undefined,
        nisNumber: nisNumber.trim() || undefined,
        aiNumber: aiNumber.trim() || undefined,
        ripCcp: ripCcp.trim() || undefined,
      })

      setSubmittedStoreData({
        storeName: storeName.trim(),
        slug: finalSlug,
        category,
        sellerType,
        legalStatus,
        wilaya: wilayaClean,
        commune: commune || undefined,
        coveredWilayasCount: coveredWilayas.length,
        deliveryHome,
        deliveryDesk,
      })
      setSellerProfileStatus('PENDING')
      setSkipCreationAnimation(false)
      setIsPostSubmission(true)
    } catch (err: any) {
      setGeneralError(err.message || 'Une erreur est survenue lors de la création de votre boutique.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(([name]) => name === category)
  const trimmedName = storeName.trim()
  const descriptionLength = description.trim().length

  // Loading state while verifying existing seller status
  if (isCheckingInitialStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4FAF7]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="animate-spin text-[#006B55]" />
          <span className="text-sm font-semibold text-[#60716F]">
            Chargement de votre espace vendeur...
          </span>
        </div>
      </div>
    )
  }

  // Post-submission store creation and verification view
  if (isPostSubmission && submittedStoreData) {
    return (
      <div className="min-h-screen bg-[#F4FAF7] text-[#102A2A]">
        {/* Header bar (styled identical to Vendeur Dashboard topbar) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#DCE8E3] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/assets/dzoraLogo.webp"
                alt="Dzora"
                width={110}
                height={36}
                priority
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="rounded-lg bg-[#E7F2EF] px-2 py-0.5 text-[9px] font-extrabold tracking-[0.14em] text-[#006B55]">
                PRO
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[#CFE0DA]">|</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-[#60716F]">
              Espace Vendeur Dzora
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FBF9] px-3 py-1.5">
              <div className="grid size-7 place-items-center rounded-lg bg-[#006B55] text-[11px] font-black text-white shadow-xs">
                {(submittedStoreData.storeName.slice(0, 2) || 'DZ').toUpperCase()}
              </div>
              <div className="text-left">
                <p className="max-w-[140px] truncate text-xs font-extrabold text-[#102A2A]">
                  {submittedStoreData.storeName}
                </p>
                <p className="text-[10px] font-medium text-[#60716F]">
                  Dossier en examen
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Animated creation & verification stopping flow */}
        <main className="py-6 sm:py-10">
          <StoreCreationFlow
            storeData={submittedStoreData}
            initialStatus={sellerProfileStatus}
            skipCreationAnimation={skipCreationAnimation}
            onApproved={() => router.push('/vendeur/dashboard')}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4FAF7] text-[#102A2A] lg:grid lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
      {/* ------------------------------------------------------------------ */}
      {/*                         Desktop sidebar                            */}
      {/* ------------------------------------------------------------------ */}
      <aside
        aria-label="Progression de la création de boutique"
        className="hidden border-r border-[#DCE8E3] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col"
      >
        <div className="px-7 pt-7 xl:px-8">
          <Image
            src="/assets/dzoraLogo.webp"
            alt="Dzora"
            width={320}
            height={144}
            priority
            className="h-14 w-auto object-contain"
          />
          <p className="mt-5 text-[11px] font-extrabold tracking-[0.16em] text-[#006B55]">ESPACE VENDEUR</p>
        </div>

        <nav aria-label="Étapes" className="mt-7 px-7 xl:px-8">
          <VerticalStepper currentStep={currentStep} />
        </nav>

        <div className="mt-7 flex items-center gap-2 px-7 text-xs leading-5 text-[#60716F] xl:px-8">
          {sellerType === 'PHYSICAL_STORE' ? (
            <Store size={15} className="shrink-0 text-[#006B55]" aria-hidden="true" />
          ) : (
            <Laptop size={15} className="shrink-0 text-[#006B55]" aria-hidden="true" />
          )}
          <span>
            <strong className="font-bold text-[#102A2A]">
              {sellerType === 'PHYSICAL_STORE' ? 'Boutique physique' : 'Vendeur e-commerce'}
            </strong>{' '}
            · Inscription rapide et progressive.
          </span>
        </div>

        <div className="mt-auto">
          <SidebarMotif />
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/*                            Workspace                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-w-0 flex-col">
        {/* Dedicated top row */}
        <header className="border-b border-[#DCE8E3] bg-white/90 backdrop-blur-sm lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
          <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10 lg:pt-6 lg:pb-0">
            <div className="flex items-center gap-3 lg:hidden">
              <Image
                src="/assets/dzoraLogo.webp"
                alt="Dzora"
                width={320}
                height={144}
                priority
                className="h-10 w-auto object-contain"
              />
              <span className="hidden text-[10px] font-extrabold tracking-[0.16em] text-[#006B55] min-[400px]:inline">
                ESPACE VENDEUR
              </span>
            </div>
            <Link
              href="/devenir-vendeur"
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm font-bold text-[#006B55] hover:text-[#004C3D] hover:underline underline-offset-4 ${focusRing}`}
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Retour à Dzora
            </Link>
          </div>
        </header>

        <main id="contenu" className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">
          {/* Compact progress (tablet / mobile) */}
          <nav
            aria-label="Progression de la création de boutique"
            className="mb-7 rounded-2xl border border-[#DCE8E3] bg-white p-4 lg:hidden"
          >
            <CompactStepper currentStep={currentStep} />
          </nav>

          {/* Intro */}
          <div className="max-w-[640px]">
            <p className="text-xs font-extrabold tracking-[0.14em] text-[#006B55]">
              ÉTAPE {currentStep} SUR {STEPS.length}
            </p>
            <h1 className="mt-2 font-display text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-[#102A2A] sm:text-[36px] lg:text-[40px]">
              {currentStep === 1 && 'Choisissez votre modèle de vente'}
              {currentStep === 2 && 'Vos coordonnées de gérant'}
              {currentStep === 3 && 'Vérification par code SMS'}
              {currentStep === 4 && 'Présentez votre boutique'}
              {currentStep === 5 && (sellerType === 'PHYSICAL_STORE' ? 'Localisation de votre magasin' : 'Logistique & Expédition')}
              {currentStep === 6 && 'Statut & Cadre légal'}
              {currentStep === 7 && 'Récapitulatif & Finalisation'}
            </h1>
            <p className="mt-2 text-base leading-7 text-[#60716F]">
              {currentStep === 1 && 'Adaptez le flux de vente selon votre magasin physique ou votre activité en ligne.'}
              {currentStep === 2 && 'Votre numéro mobile servira d’identifiant et de contact pour les commandes.'}
              {currentStep === 3 && `Nous avons envoyé un code de vérification au +213 ${normalizePhone(phone)}.`}
              {currentStep === 4 && 'Donnez envie aux clients de découvrir vos produits et vos rayons.'}
              {currentStep === 5 && (sellerType === 'PHYSICAL_STORE' ? 'Facilitez le repérage de votre point de vente pour les clients locaux.' : 'Configurez les 58 Wilayas desservies pour vos livraisons.')}
              {currentStep === 6 && 'Renseignez votre statut professionnel (documents à compléter ultérieurement).'}
              {currentStep === 7 && 'Vérifiez vos paramètres avant l’activation de votre compte vendeur Dzora.'}
            </p>
          </div>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
            {/* -------------------------- Form card -------------------------- */}
            <section
              aria-labelledby={`${uid}-form-title`}
              className="min-w-0 rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_2px_rgba(16,42,42,0.04)] sm:p-7 lg:p-8"
            >
              <h2 id={`${uid}-form-title`} className="font-display text-lg font-extrabold text-[#102A2A] sm:text-xl">
                {STEPS[currentStep - 1].label}
              </h2>
              <p className="mt-1 text-[13px] text-[#60716F]">
                Les champs marqués <span aria-hidden="true" className="text-[#B42318]">*</span>
                <span className="sr-only">d’un astérisque</span> sont obligatoires.
              </p>

              {generalError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#F2C0B7] bg-[#FFF5F4] p-4 text-sm text-[#B42318]">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  if (currentStep === 7) {
                    handleFinalSubmit(e)
                  }
                }}
                className="mt-6 space-y-6"
              >
                {/* ---------------------------------------------------------- */}
                {/* ÉTAPE 1 : MODÈLE DE VENTE                                  */}
                {/* ---------------------------------------------------------- */}
                {currentStep === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setSellerType('PHYSICAL_STORE')}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition ${
                        sellerType === 'PHYSICAL_STORE'
                          ? 'border-[#006B55] bg-[#F1F9F6] shadow-sm'
                          : 'border-[#CFE0DA] bg-white hover:border-[#9FC3B8]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`grid size-12 place-items-center rounded-xl transition ${
                              sellerType === 'PHYSICAL_STORE'
                                ? 'bg-[#006B55] text-white shadow-sm'
                                : 'bg-[#EDF6F3] text-[#006B55]'
                            }`}
                          >
                            <Store size={24} aria-hidden="true" />
                          </div>
                          <span
                            className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                              sellerType === 'PHYSICAL_STORE'
                                ? 'bg-[#006B55] text-white'
                                : 'border border-[#CFE0DA] text-transparent'
                            }`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </span>
                        </div>
                        <h3 className="mt-4 font-display text-base font-extrabold text-[#102A2A]">
                          Boutique physique
                        </h3>
                        <p className="mt-1.5 text-xs leading-5 text-[#60716F]">
                          Vous disposez d’un magasin, showroom ou local recevant du public et assurez la livraison.
                        </p>
                        <ul className="mt-4 space-y-1.5 border-t border-[#DCE8E3] pt-3 text-xs text-[#2F4B46]">
                          <li className="flex items-center gap-1.5">
                            <Check size={13} className="text-[#006B55]" />
                            <span>Visibilité locale & repérage géographique du magasin</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={13} className="text-[#006B55]" />
                            <span>Livraison des commandes à domicile et en point relais</span>
                          </li>
                        </ul>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSellerType('ECOMMERCE')}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition ${
                        sellerType === 'ECOMMERCE'
                          ? 'border-[#006B55] bg-[#F1F9F6] shadow-sm'
                          : 'border-[#CFE0DA] bg-white hover:border-[#9FC3B8]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`grid size-12 place-items-center rounded-xl transition ${
                              sellerType === 'ECOMMERCE'
                                ? 'bg-[#006B55] text-white shadow-sm'
                                : 'bg-[#EDF6F3] text-[#006B55]'
                            }`}
                          >
                            <Laptop size={24} aria-hidden="true" />
                          </div>
                          <span
                            className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                              sellerType === 'ECOMMERCE'
                                ? 'bg-[#006B55] text-white'
                                : 'border border-[#CFE0DA] text-transparent'
                            }`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </span>
                        </div>
                        <h3 className="mt-4 font-display text-base font-extrabold text-[#102A2A]">
                          Vendeur E-commerce
                        </h3>
                        <p className="mt-1.5 text-xs leading-5 text-[#60716F]">
                          Vous expédiez vos produits depuis un atelier, domicile ou entrepôt vers les 58 Wilayas.
                        </p>
                        <ul className="mt-4 space-y-1.5 border-t border-[#DCE8E3] pt-3 text-xs text-[#2F4B46]">
                          <li className="flex items-center gap-1.5">
                            <Check size={13} className="text-[#006B55]" />
                            <span>Vitrine dédiée dzora.dz/shop/votre-nom</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={13} className="text-[#006B55]" />
                            <span>Expédition domicile & Stop Desk</span>
                          </li>
                        </ul>
                      </div>
                    </button>
                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* ÉTAPE 2 : COMPTE & TÉLÉPHONE                               */}
                {/* ---------------------------------------------------------- */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    {isAuthenticated && (
                      <div className="flex items-center gap-3 rounded-xl border border-[#CCE2DB] bg-[#EDF7F4] p-3.5 text-xs text-[#204E44]">
                        <ShieldCheck size={18} className="text-[#006B55] shrink-0" />
                        <span>
                          Connecté en tant que <strong>{user?.fullName || user?.phone || user?.email}</strong>. Vos accès
                          seront automatiquement rattachés.
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                        Nom complet du gérant
                        <RequiredMark />
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex. Mohamed Benali"
                        className={`${fieldBase} ${fieldState(!!errors.fullName)}`}
                      />
                      <FieldError id="err-fullName" message={errors.fullName} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                        Numéro de téléphone mobile algérien (+213)
                        <RequiredMark />
                      </label>
                      <div className="relative flex rounded-xl border border-[#CFE0DA] bg-white focus-within:border-[#006B55] focus-within:ring-[3px] focus-within:ring-[#008F72]/20">
                        <span className="inline-flex items-center gap-2 border-r border-[#CFE0DA] bg-[#F7FBF9] px-3.5 text-xs font-bold text-[#006B55]">
                          <AlgeriaFlag className="h-3.5 w-5 rounded-[2px] shadow-sm border border-black/10" />
                          <span>+213</span>
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="05 50 12 34 56 (Ooredoo, Mobilis, Djezzy)"
                          className="w-full rounded-r-xl px-4 py-3 text-sm outline-none"
                        />
                      </div>
                      <FieldError id="err-phone" message={errors.phone} />
                    </div>

                    {!isAuthenticated && (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                            Adresse email <span className="font-medium text-[#60716F]">(optionnelle)</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contact@maboutique.dz"
                            className={`${fieldBase} ${fieldState(false)}`}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                            Mot de passe du compte
                            <RequiredMark />
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="8 caractères min. (1 majuscule, 1 minuscule, 1 chiffre ou symbole)"
                            className={`${fieldBase} ${fieldState(!!errors.password)}`}
                          />
                          <p className="mt-1.5 text-xs text-[#60716F]">
                            Au moins 8 caractères comprenant 1 majuscule, 1 minuscule et 1 chiffre ou caractère spécial.
                          </p>
                          <FieldError id="err-password" message={errors.password} />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* ÉTAPE 3 : VÉRIFICATION OTP SMS                             */}
                {/* ---------------------------------------------------------- */}
                {currentStep === 3 && (
                  <div className="rounded-2xl border border-[#CFE0DA] bg-[#F7FBF9] p-6 text-center space-y-4">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#006B55] text-white">
                      <Phone size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#102A2A]">Entrez le code SMS reçu</p>
                      <p className="text-xs text-[#60716F] mt-1">
                        Code à 6 chiffres envoyé au +213 {normalizePhone(phone)}
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • • • •"
                        className="w-48 text-center text-3xl font-extrabold tracking-[0.3em] rounded-xl border border-[#CFE0DA] bg-white py-3 shadow-inner outline-none focus:border-[#006B55] focus:ring-[3px] focus:ring-[#008F72]/20"
                      />
                    </div>

                    {devOtpCode && (
                      <div className="inline-block rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-800">
                        Code test simulateur : <strong className="font-mono">{devOtpCode}</strong>
                      </div>
                    )}

                    <FieldError id="err-otp" message={errors.otpCode} />

                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={cooldown > 0 || isSubmitting}
                        onClick={async () => {
                          try {
                            const res = await sendOtp(`+213${normalizePhone(phone)}`)
                            setCooldown(res.cooldownSeconds || 60)
                            if (res.otpCodeForDev) setDevOtpCode(res.otpCodeForDev)
                          } catch (err: any) {
                            setGeneralError(err.message)
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                          cooldown > 0 ? 'text-[#889B95] cursor-not-allowed' : 'text-[#006B55] hover:underline'
                        }`}
                      >
                        <RefreshCw size={13} className={cooldown > 0 ? 'animate-spin' : ''} />
                        {cooldown > 0 ? `Renvoyer le code dans ${cooldown}s` : 'Renvoyer le code par SMS'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* ÉTAPE 4 : INFORMATIONS BOUTIQUE                            */}
                {/* ---------------------------------------------------------- */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Nom */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                        Nom de la boutique
                        <RequiredMark />
                      </label>
                      <input
                        type="text"
                        maxLength={NAME_MAX}
                        placeholder="Ex. Techno Blida"
                        value={storeName}
                        onChange={(e) => {
                          const val = e.target.value
                          setStoreName(val)
                          if (!slug || slug === cleanSlug(storeName)) {
                            setSlug(cleanSlug(val))
                          }
                        }}
                        className={`${fieldBase} ${fieldState(!!errors.storeName)}`}
                      />
                      <FieldError id="err-name" message={errors.storeName} />
                    </div>

                    {/* URL personnalisée pour e-commerce */}
                    {sellerType === 'ECOMMERCE' && (
                      <div>
                        <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                          Identifiant &amp; URL réservée pour votre boutique Dzora
                        </label>
                        <div className="flex items-center rounded-xl border border-[#CFE0DA] bg-[#F7FBF9] px-3.5 py-2.5 text-xs">
                          <span className="font-semibold text-[#6A817B]">dzora.dz/vendeur/</span>
                          <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(cleanSlug(e.target.value))}
                            placeholder="ma-boutique"
                            className="w-full bg-transparent font-bold text-[#006B55] outline-none"
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-[#60716F]">
                          Ce lien sera activé et consultable publiquement uniquement après la validation de votre dossier par nos services.
                        </p>
                      </div>
                    )}

                    {/* Catégorie */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                        Catégorie principale
                        <RequiredMark />
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`${fieldBase} ${fieldState(!!errors.category)} appearance-none pr-11 ${
                            category ? '' : 'text-[#71827D]'
                          }`}
                        >
                          <option value="" disabled>
                            Sélectionnez une catégorie
                          </option>
                          {categories.map(([name, icon]) => (
                            <option key={name} value={name} className="text-[#102A2A]">
                              {icon} {name}
                            </option>
                          ))}
                        </select>
                        <SelectChevron />
                      </div>
                      <FieldError id="err-category" message={errors.category} />
                    </div>

                    {/* Description */}
                    <div>
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <label className="block text-sm font-bold text-[#102A2A]">
                          Description de la boutique
                          <RequiredMark />
                        </label>
                        <span
                          className={`shrink-0 text-xs tabular-nums ${
                            descriptionLength > DESCRIPTION_MAX ? 'font-bold text-[#B42318]' : 'text-[#60716F]'
                          }`}
                        >
                          {descriptionLength}/{DESCRIPTION_MAX}
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Décrivez votre boutique et les produits que vous proposez…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`${fieldBase} ${fieldState(!!errors.description)} min-h-[110px] resize-y py-3 leading-6`}
                      />
                      <FieldError id="err-description" message={errors.description} />
                    </div>

                    {/* Logo */}
                    <div>
                      <span className="mb-2 block text-sm font-bold text-[#102A2A]">
                        Logo ou photo de façade <span className="font-medium text-[#60716F]">(facultatif)</span>
                      </span>

                      {logoFile && logoUrl ? (
                        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#CFE0DA] bg-[#F7FBF9] p-4">
                          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#DCE8E3] bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoUrl} alt="Logo" className="size-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-[#102A2A]">{logoFile.name}</p>
                            <p className="text-xs text-[#60716F]">{formatBytes(logoFile.size)} · format carré</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeLogo}
                            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-[#60716F] hover:bg-[#FFF1F0] hover:text-[#B42318] ${focusRing}`}
                          >
                            <X size={16} />
                            Retirer
                          </button>
                        </div>
                      ) : (
                        <label
                          onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                            selectLogo(e.dataTransfer.files?.[0])
                          }}
                          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-7 text-center motion-safe:transition-colors ${
                            isDragging ? 'border-[#006B55] bg-[#E7F2EF]' : 'border-[#BFD6CE] bg-[#F7FBF9] hover:bg-[#EEF7F3]'
                          }`}
                        >
                          <span className="grid size-10 place-items-center rounded-full bg-white text-[#006B55] shadow-sm">
                            <ImagePlus size={20} />
                          </span>
                          <span className="text-sm font-semibold text-[#102A2A]">
                            Glissez un logo ou <span className="text-[#006B55] underline">parcourez vos fichiers</span>
                          </span>
                          <span className="text-xs text-[#60716F]">PNG, JPG ou WebP · 2 Mo maximum</span>
                          <input
                            type="file"
                            accept={LOGO_ACCEPT}
                            onChange={(e) => selectLogo(e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                      <FieldError id="err-logo" message={errors.logo} />
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* ÉTAPE 5 : LOCALISATION & LOGISTIQUE                        */}
                {/* ---------------------------------------------------------- */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    {/* Wilaya & Commune */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                          {sellerType === 'PHYSICAL_STORE' ? 'Wilaya du magasin' : 'Wilaya de départ (entrepôt)'}
                          <RequiredMark />
                        </label>
                        <div className="relative">
                          <select
                            value={wilaya}
                            onChange={(e) => {
                              const newWilaya = e.target.value
                              setWilaya(newWilaya)
                              setCommune('')
                              // Si aucune wilaya de livraison n'a été choisie encore, initialiser avec celle-ci
                              if (coveredWilayas.length === 0) {
                                const found = wilayasData.find((w) => w.name === newWilaya)
                                if (found) setCoveredWilayas([found.code])
                              }
                            }}
                            className={`${fieldBase} ${fieldState(!!errors.wilaya)} appearance-none pr-11 ${
                              wilaya ? '' : 'text-[#71827D]'
                            }`}
                          >
                            <option value="" disabled>
                              Choisir votre wilaya
                            </option>
                            {wilayasData.map((w) => (
                              <option key={w.code} value={w.name} className="text-[#102A2A]">
                                {w.name}
                              </option>
                            ))}
                          </select>
                          <SelectChevron />
                        </div>
                        <FieldError id="err-wilaya" message={errors.wilaya} />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                          Commune
                          {sellerType === 'PHYSICAL_STORE' && <RequiredMark />}
                        </label>
                        {availableCommunes.length > 0 ? (
                          <div className="relative">
                            <select
                              value={commune}
                              onChange={(e) => setCommune(e.target.value)}
                              className={`${fieldBase} ${fieldState(!!errors.commune)} appearance-none pr-11`}
                            >
                              <option value="">Sélectionnez une commune</option>
                              {availableCommunes.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <SelectChevron />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={commune}
                            onChange={(e) => setCommune(e.target.value)}
                            placeholder="Nom de la commune"
                            className={`${fieldBase} ${fieldState(!!errors.commune)}`}
                          />
                        )}
                        <FieldError id="err-commune" message={errors.commune} />
                      </div>
                    </div>

                    {/* Magasin physique : Adresse exacte */}
                    {sellerType === 'PHYSICAL_STORE' && (
                      <div>
                        <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                          Adresse exacte ou repère visuel du magasin
                          <RequiredMark />
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Ex. 14 Rue Didouche Mourad, en face de la poste"
                          className={`${fieldBase} ${fieldState(!!errors.address)}`}
                        />
                        <FieldError id="err-address" message={errors.address} />
                      </div>
                    )}

                    {/* Modes et wilayas de livraison pour TOUS (Boutique physique et E-commerce) */}
                    <div className="space-y-4 pt-2">
                      <div className="rounded-xl border border-[#DCE8E3] bg-[#F7FBF9] p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#006B55]">
                          Modes d&apos;expédition & livraison proposés
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="flex items-center gap-2 rounded-lg border border-[#CFE0DA] bg-white p-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={deliveryHome}
                              onChange={(e) => setDeliveryHome(e.target.checked)}
                              className="size-4 accent-[#006B55]"
                            />
                            <span className="text-xs font-bold text-[#102A2A]">Livraison à domicile</span>
                          </label>
                          <label className="flex items-center gap-2 rounded-lg border border-[#CFE0DA] bg-white p-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={deliveryDesk}
                              onChange={(e) => setDeliveryDesk(e.target.checked)}
                              className="size-4 accent-[#006B55]"
                            />
                            <span className="text-xs font-bold text-[#102A2A]">Point relais / Stop-desk</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-bold text-[#102A2A]">
                            Wilayas desservies pour la livraison ({coveredWilayas.length}/58)
                          </label>
                          <div className="flex gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => setCoveredWilayas(wilayasData.map((w) => w.code))}
                              className="font-bold text-[#006B55] hover:underline"
                            >
                              Toutes (58 Wilayas)
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => setCoveredWilayas([selectedWilayaCode])}
                              className="font-bold text-[#60716F] hover:underline"
                            >
                              Ma wilaya uniquement
                            </button>
                          </div>
                        </div>
                        <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-[#CFE0DA] bg-white p-3 text-xs sm:grid-cols-3">
                          {wilayasData.map((w) => {
                            const isChecked = coveredWilayas.includes(w.code)
                            return (
                              <label
                                key={w.code}
                                className={`flex items-center gap-2 rounded p-1.5 cursor-pointer ${
                                  isChecked ? 'bg-[#EDF6F3] font-semibold text-[#102A2A]' : 'text-[#71827D]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setCoveredWilayas((prev) =>
                                      e.target.checked ? [...prev, w.code] : prev.filter((c) => c !== w.code),
                                    )
                                  }}
                                  className="size-3.5 accent-[#006B55]"
                                />
                                <span className="truncate">{w.name}</span>
                              </label>
                            )
                          })}
                        </div>
                        <FieldError id="err-coveredWilayas" message={errors.coveredWilayas} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* ÉTAPE 6 : CADRE LÉGAL                                      */}
                {/* ---------------------------------------------------------- */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { id: 'INDIVIDUAL', title: 'Particulier / Artisan', desc: 'Début d’activité, vente sans RC' },
                        { id: 'AUTO_ENTREPRENEUR', title: 'Auto-entrepreneur', desc: 'Carte nationale d’auto-entrepreneur' },
                        { id: 'COMPANY', title: 'Entreprise / Société', desc: 'SARL, EURL, personne physique avec RC' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLegalStatus(item.id as LegalStatus)}
                          className={`rounded-xl border-2 p-4 text-left transition ${
                            legalStatus === item.id
                              ? 'border-[#006B55] bg-[#F1F9F6]'
                              : 'border-[#CFE0DA] bg-white hover:border-[#9FC3B8]'
                          }`}
                        >
                          <p className="text-sm font-extrabold text-[#102A2A]">{item.title}</p>
                          <p className="mt-1 text-xs text-[#60716F]">{item.desc}</p>
                        </button>
                      ))}
                    </div>

                    {legalStatus === 'COMPANY' && (
                      <div className="space-y-4 rounded-xl border border-[#DCE8E3] bg-[#F7FBF9] p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#48635C]">
                              Raison sociale officielle
                            </label>
                            <input
                              type="text"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              placeholder="Ex. SARL Techno Blida"
                              className={fieldBase}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#48635C]">
                              N° Registre de Commerce (RC)
                              <RequiredMark />
                            </label>
                            <input
                              type="text"
                              value={rcNumber}
                              onChange={(e) => setRcNumber(e.target.value)}
                              placeholder="Ex. 09/00-1234567B21"
                              className={`${fieldBase} ${fieldState(!!errors.rcNumber)}`}
                            />
                            <FieldError id="err-rc" message={errors.rcNumber} />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#48635C]">
                              NIF
                            </label>
                            <input
                              type="text"
                              value={nifNumber}
                              onChange={(e) => setNifNumber(e.target.value)}
                              placeholder="Numéro fiscal"
                              className={fieldBase}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#48635C]">
                              NIS
                            </label>
                            <input
                              type="text"
                              value={nisNumber}
                              onChange={(e) => setNisNumber(e.target.value)}
                              placeholder="Statistique"
                              className={fieldBase}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#48635C]">
                              Article d&apos;imposition
                            </label>
                            <input
                              type="text"
                              value={aiNumber}
                              onChange={(e) => setAiNumber(e.target.value)}
                              placeholder="Imposition"
                              className={fieldBase}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {legalStatus === 'AUTO_ENTREPRENEUR' && (
                      <div className="rounded-xl border border-[#DCE8E3] bg-[#F7FBF9] p-5">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#48635C]">
                          N° de Carte d&apos;auto-entrepreneur
                        </label>
                        <input
                          type="text"
                          value={autoEntrepreneurNumber}
                          onChange={(e) => setAutoEntrepreneurNumber(e.target.value)}
                          placeholder="Ex. AE-2024-XXXXX"
                          className={fieldBase}
                        />
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#102A2A]">
                        Compte de reversement CCP ou RIP BaridiMob <span className="font-medium text-[#60716F]">(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={ripCcp}
                        onChange={(e) => setRipCcp(e.target.value)}
                        placeholder="0079999900XXXXXXXXXX (ou numéro CCP)"
                        className={fieldBase}
                      />
                      <p className="mt-1 text-xs text-[#60716F]">
                        Sert aux virements des revenus de vos commandes livrées.
                      </p>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* ÉTAPE 7 : RÉCAPITULATIF & VALIDATION                        */}
                {/* ---------------------------------------------------------- */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-[#DCE8E3] bg-[#F7FBF9] p-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#DCE8E3] bg-white text-[#006B55]">
                          {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="" className="size-full object-contain" />
                          ) : sellerType === 'PHYSICAL_STORE' ? (
                            <Store size={28} aria-hidden="true" />
                          ) : (
                            <Laptop size={28} aria-hidden="true" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-extrabold text-[#102A2A]">{storeName}</h3>
                            <span className="rounded-full bg-[#E7F2EF] px-2.5 py-0.5 text-xs font-bold text-[#006B55]">
                              {sellerType === 'PHYSICAL_STORE' ? 'Boutique physique' : 'E-commerce'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#60716F]">
                            {category} · {wilayaLabel(wilaya)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 border-t border-[#DCE8E3] pt-4 text-xs sm:grid-cols-2">
                        <div>
                          <strong className="text-[#60716F] block">Gérant :</strong>
                          <span className="font-semibold text-[#102A2A]">{fullName} (+213 {normalizePhone(phone)})</span>
                        </div>
                        <div>
                          <strong className="text-[#60716F] block">Statut légal :</strong>
                          <span className="font-semibold text-[#102A2A]">
                            {legalStatus === 'COMPANY'
                              ? `Entreprise (${rcNumber || 'RC'})`
                              : legalStatus === 'AUTO_ENTREPRENEUR'
                                ? 'Auto-entrepreneur'
                                : 'Particulier / Artisan'}
                          </span>
                        </div>
                        <div>
                          <strong className="text-[#60716F] block">Disponibilité :</strong>
                          <span className="font-semibold text-[#102A2A]">
                            {sellerType === 'PHYSICAL_STORE'
                              ? `Magasin à ${commune || 'commune'} · ${coveredWilayas.length} Wilayas livrées`
                              : `${coveredWilayas.length} Wilayas livrables`}
                          </span>
                        </div>
                        <div>
                          <strong className="text-[#60716F] block">Reversement bancaire / CCP :</strong>
                          <span className="font-semibold text-[#102A2A]">
                            {ripCcp ? ripCcp : 'À configurer sur votre tableau de bord'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#DCE8E3] bg-white p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-1 size-4 rounded accent-[#006B55]"
                        />
                        <span className="text-xs leading-5 text-[#2F4B46]">
                          J&apos;accepte les conditions de vente de la marketplace Dzora, la politique d&apos;authenticité des produits
                          et le barème de commissions.
                        </span>
                      </label>
                      <FieldError id="err-acceptTerms" message={errors.acceptTerms} />
                    </div>
                  </div>
                )}

                {/* Notice d'information */}
                <div aria-live="polite" role="status">
                  {notice && (
                    <p className="flex items-start gap-2.5 rounded-xl border border-[#CFE0DA] bg-[#F1F9F6] p-4 text-sm leading-6 text-[#2F4B46]">
                      <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[#006B55]" />
                      <span>{notice}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-[#EDF3F0] pt-6">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#CFE0DA] bg-white px-6 text-sm font-bold text-[#2F4B46] hover:border-[#9FC3B8] hover:bg-[#F7FBF9] ${focusRing}`}
                      >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Retour
                      </button>
                    ) : (
                      <Link
                        href="/devenir-vendeur"
                        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#CFE0DA] bg-white px-6 text-sm font-bold text-[#2F4B46] hover:border-[#9FC3B8] hover:bg-[#F7FBF9] ${focusRing}`}
                      >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Annuler
                      </Link>
                    )}

                    {currentStep < 7 ? (
                      <button
                        key="btn-step-continue"
                        type="button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#006B55] px-7 text-sm font-bold text-white shadow-[0_6px_16px_rgba(0,107,85,0.22)] hover:bg-[#005A47] motion-safe:transition-colors motion-safe:active:scale-[0.99] disabled:opacity-50 ${focusRing}`}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            Continuer
                            <ArrowRight size={17} aria-hidden="true" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        key="btn-step-launch"
                        type="button"
                        onClick={() => handleFinalSubmit()}
                        disabled={isSubmitting}
                        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#006B55] px-8 text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(0,107,85,0.22)] hover:bg-[#005A47] motion-safe:transition-colors motion-safe:active:scale-[0.99] disabled:opacity-50 ${focusRing}`}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Création de la boutique...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Lancer ma boutique Dzora
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="mt-4 text-[13px] text-[#60716F] sm:text-right">
                    Votre progression est enregistrée à chaque étape.
                  </p>
                </div>
              </form>
            </section>

            {/* ------------------------ Preview & tips ----------------------- */}
            <div className="min-w-0 space-y-6 lg:sticky lg:top-8">
              <section
                aria-labelledby={`${uid}-preview-title`}
                className="overflow-hidden rounded-2xl border border-[#CFE0DA] bg-white"
              >
                <h2
                  id={`${uid}-preview-title`}
                  className="border-b border-[#E3EEEA] bg-[#F1F9F6] px-5 py-3.5 text-sm font-extrabold text-[#102A2A]"
                >
                  Aperçu de votre boutique
                </h2>
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#DCE8E3] bg-[#E7F2EF] text-[#006B55]">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="" className="size-full bg-white object-contain" />
                      ) : sellerType === 'PHYSICAL_STORE' ? (
                        <Store size={28} aria-hidden="true" />
                      ) : (
                        <Laptop size={28} aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate font-display text-lg font-extrabold ${
                          trimmedName ? 'text-[#102A2A]' : 'text-[#8A9A96]'
                        }`}
                      >
                        {trimmedName || 'Votre boutique'}
                      </p>
                      <p className="text-xs font-semibold text-[#60716F]">
                        {sellerType === 'PHYSICAL_STORE' ? 'Boutique physique' : 'E-commerce'} · Dzora
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-3 rounded-xl bg-[#F7FBF9] px-3.5 py-2.5">
                      <dt className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#60716F]">
                        <Tag size={15} aria-hidden="true" className="text-[#006B55]" />
                        <span className="sr-only">Catégorie :</span>
                      </dt>
                      <dd
                        className={`min-w-0 truncate text-sm font-bold ${
                          selectedCategory ? 'text-[#102A2A]' : 'text-[#8A9A96]'
                        }`}
                      >
                        {selectedCategory ? (
                          <>
                            <span aria-hidden="true" className="mr-1.5">
                              {selectedCategory[1]}
                            </span>
                            {selectedCategory[0]}
                          </>
                        ) : (
                          'Catégorie'
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-[#F7FBF9] px-3.5 py-2.5">
                      <dt className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#60716F]">
                        <MapPin size={15} aria-hidden="true" className="text-[#006B55]" />
                        <span className="sr-only">Wilaya :</span>
                      </dt>
                      <dd
                        className={`min-w-0 truncate text-sm font-bold ${
                          wilaya ? 'text-[#102A2A]' : 'text-[#8A9A96]'
                        }`}
                      >
                        {wilaya ? wilayaLabel(wilaya) : 'Wilaya'}
                      </dd>
                    </div>
                    {sellerType === 'PHYSICAL_STORE' && commune && (
                      <div className="flex items-center gap-3 rounded-xl bg-[#F7FBF9] px-3.5 py-2.5">
                        <dt className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#60716F]">
                          <Store size={15} aria-hidden="true" className="text-[#006B55]" />
                          <span className="sr-only">Commune :</span>
                        </dt>
                        <dd className="min-w-0 truncate text-sm font-bold text-[#102A2A]">{commune}</dd>
                      </div>
                    )}
                    <div className="flex items-center gap-3 rounded-xl bg-[#F7FBF9] px-3.5 py-2.5">
                      <dt className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#60716F]">
                        <Truck size={15} aria-hidden="true" className="text-[#006B55]" />
                        <span className="sr-only">Livraison :</span>
                      </dt>
                      <dd
                        className={`min-w-0 truncate text-sm font-bold ${
                          coveredWilayas.length > 0 ? 'text-[#102A2A]' : 'text-[#8A9A96]'
                        }`}
                      >
                        {coveredWilayas.length > 0
                          ? `${coveredWilayas.length} Wilaya${coveredWilayas.length > 1 ? 's' : ''} livrée${coveredWilayas.length > 1 ? 's' : ''}`
                          : 'Livraison'}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-xs leading-5 text-[#60716F]">
                    Cet aperçu se met à jour en direct lors de vos saisies.
                  </p>
                </div>
              </section>

              <section
                aria-labelledby={`${uid}-tips-title`}
                className="rounded-2xl border border-[#DCE8E3] bg-[#F1F9F6] p-5"
              >
                <h2 id={`${uid}-tips-title`} className="flex items-center gap-2 text-sm font-extrabold text-[#102A2A]">
                  <Lightbulb size={17} aria-hidden="true" className="text-[#C56816]" />
                  Conseils pour cette étape
                </h2>
                <ul className="mt-3.5 space-y-3">
                  {(TIPS_BY_STEP[currentStep] || TIPS_BY_STEP[1]).map((tip) => (
                    <li key={tip} className="flex gap-2.5 text-sm leading-5 text-[#2F4B46]">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full bg-[#006B55] text-white"
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
