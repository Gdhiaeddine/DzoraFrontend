'use client'

import React, { useState, useEffect, useCallback, useId, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Store,
  FolderTree,
  ShoppingBag,
  CreditCard,
  Wallet,
  Receipt,
  Truck,
  Megaphone,
  Star,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  HelpCircle,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  X,
  Menu,
  ExternalLink,
  ChevronUp,
  ShieldAlert,
  Info,
  Layers,
  Boxes,
  Lock,
  Sparkles,
  UserCheck,
  UserX,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  KeyRound,
  History,
  Tag,
  Clock,
  Laptop,
  Smartphone,
  Globe,
  ArrowLeft,
  Building2,
  FileText,
  AlertCircle,
  Edit2,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import { api, AdminUserDetails, OtpPreviewResponse } from '@/lib/api'

/**
 * Compresses an image File via HTML Canvas to a lightweight WebP/JPEG data URL
 */
function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image'))
    reader.onload = (e) => {
      const src = e.target?.result as string
      if (!src) {
        reject(new Error('Source vide'))
        return
      }
      const img = document.createElement('img')
      img.onerror = () => reject(new Error('Erreur de chargement de l’image'))
      img.onload = () => {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(src)
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        try {
          const webpUrl = canvas.toDataURL('image/webp', quality)
          if (webpUrl && webpUrl.startsWith('data:image/webp')) {
            resolve(webpUrl)
            return
          }
        } catch {
          // fallback
        }
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 o'
  const k = 1024
  const sizes = ['o', 'Ko', 'Mo']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getDataUrlSize(dataUrl?: string | null): number {
  if (!dataUrl) return 0
  const base64 = dataUrl.split(',')[1] || dataUrl
  return Math.round((base64.length * 3) / 4)
}

function getRoleBadgeConfig(role: string) {
  const normalized = (role || '').toUpperCase().trim()
  switch (normalized) {
    case 'CUSTOMER':
      return {
        label: 'Client',
        bg: 'bg-[#F4FAF7]',
        text: 'text-[#4A5D58]',
        border: 'border-[#DCE8E3]',
      }
    case 'SELLER':
      return {
        label: 'Vendeur',
        bg: 'bg-[#FFF6E7]',
        text: 'text-[#D97706]',
        border: 'border-[#FDE68A]',
      }
    case 'SELLER_STAFF':
      return {
        label: 'Équipe Vendeur',
        bg: 'bg-[#FFF6E7]',
        text: 'text-[#D97706]',
        border: 'border-[#FDE68A]',
      }
    case 'ADMIN':
      return {
        label: 'Admin',
        bg: 'bg-[#E7F2EF]',
        text: 'text-[#006B55]',
        border: 'border-[#BBDDD4]',
      }
    case 'SUPER_ADMIN':
      return {
        label: 'Super Admin',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
      }
    case 'COURIER':
      return {
        label: 'Livreur',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      }
    case 'CALL_CENTER':
      return {
        label: 'Centre d’appels',
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
      }
    default:
      return {
        label: role,
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
      }
  }
}

function getDisplayRoles(user: AdminUserDetails): string[] {
  const isSeller = Boolean(user.sellerProfile || user.roles?.includes('SELLER') || user.roles?.includes('SELLER_STAFF'))
  const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN')

  const rolesToShow: string[] = []

  if (user.roles?.includes('SUPER_ADMIN')) {
    rolesToShow.push('SUPER_ADMIN')
  } else if (user.roles?.includes('ADMIN')) {
    rolesToShow.push('ADMIN')
  }

  if (isSeller) {
    rolesToShow.push('SELLER')
  }

  if (user.roles?.includes('COURIER')) {
    rolesToShow.push('COURIER')
  }

  if (user.roles?.includes('CALL_CENTER')) {
    rolesToShow.push('CALL_CENTER')
  }

  // Only show Client (CUSTOMER) if the user is neither a seller nor an administrator
  if (!isSeller && !isAdmin && user.roles?.includes('CUSTOMER')) {
    rolesToShow.push('CUSTOMER')
  }

  return rolesToShow.length > 0 ? rolesToShow : (isSeller ? ['SELLER'] : ['CUSTOMER'])
}

function renderRoleBadge(role: string) {
  const config = getRoleBadgeConfig(role)
  return (
    <span
      key={role}
      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  )
}

function renderLegalStatus(status?: string | null): string {
  switch (status) {
    case 'INDIVIDUAL':
      return 'Personne physique'
    case 'AUTO_ENTREPRENEUR':
      return 'Auto-entrepreneur'
    case 'COMPANY':
      return 'Société (SARL / EURL / SPA)'
    default:
      return status || 'Non renseigné'
  }
}

function getSellerStatusConfig(status?: string | null) {
  const normalized = (status || '').toUpperCase().trim().replace(/[\s-]+/g, '_')
  switch (normalized) {
    case 'APPROVED':
      return {
        label: 'Approuvé',
        bg: 'bg-[#E7F2EF]',
        text: 'text-[#006B55]',
        border: 'border-[#BBDDD4]',
        dot: 'bg-[#006B55]',
        pulse: false,
      }
    case 'UNDER_REVIEW':
    case 'REVIEW':
    case 'PENDING_REVIEW':
      return {
        label: 'En examen',
        bg: 'bg-[#FFF6E7]',
        text: 'text-[#D97706]',
        border: 'border-[#FDE68A]',
        dot: 'bg-[#D97706]',
        pulse: true,
      }
    case 'PENDING':
      return {
        label: 'En attente',
        bg: 'bg-[#EFF6FF]',
        text: 'text-[#2563EB]',
        border: 'border-[#BFDBFE]',
        dot: 'bg-[#2563EB]',
        pulse: false,
      }
    case 'SUSPENDED':
      return {
        label: 'Suspendu',
        bg: 'bg-[#F1F5F9]',
        text: 'text-[#475569]',
        border: 'border-[#CBD5E1]',
        dot: 'bg-[#475569]',
        pulse: false,
      }
    case 'REJECTED':
      return {
        label: 'Rejeté',
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        dot: 'bg-red-600',
        pulse: false,
      }
    default:
      return {
        label: status || 'Non renseigné',
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
        pulse: false,
      }
  }
}

function renderSellerStatusBadge(status?: string | null) {
  const config = getSellerStatusConfig(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
      <span>{config.label}</span>
    </span>
  )
}

function getSellerProgressConfig(status?: string | null, rawPercentage?: number | null) {
  const normalized = (status || '').toUpperCase().trim().replace(/[\s-]+/g, '_')
  switch (normalized) {
    case 'APPROVED':
      return {
        percentage: 100,
        color: 'bg-[#006B55]',
        textColor: 'text-[#006B55]',
        label: '100%',
        sublabel: 'Dossier validé et approuvé',
      }
    case 'UNDER_REVIEW':
    case 'REVIEW':
    case 'PENDING_REVIEW':
      return {
        percentage: 75,
        color: 'bg-[#D97706]',
        textColor: 'text-[#D97706]',
        label: '75%',
        sublabel: 'En cours d’examen administratif',
      }
    case 'PENDING':
      return {
        percentage: 40,
        color: 'bg-[#2563EB]',
        textColor: 'text-[#2563EB]',
        label: '40%',
        sublabel: 'En attente de traitement',
      }
    case 'REJECTED':
      return {
        percentage: 100,
        color: 'bg-red-600',
        textColor: 'text-red-600',
        label: 'Rejeté',
        sublabel: 'Dossier refusé',
      }
    case 'SUSPENDED':
      return {
        percentage: 100,
        color: 'bg-slate-500',
        textColor: 'text-slate-600',
        label: 'Suspendu',
        sublabel: 'Boutique suspendue',
      }
    default:
      return {
        percentage: rawPercentage || 40,
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        label: `${rawPercentage || 40}%`,
        sublabel: 'En cours',
      }
  }
}

function renderVerificationStatusBadge(status?: string | null) {
  if (!status) return null
  const normalized = status.toUpperCase().trim().replace(/[\s-]+/g, '_')
  switch (normalized) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
          <CheckCircle2 size={11} className="text-[#006B55]" />
          <span>Dossier vérifié</span>
        </span>
      )
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
          <span>Dossier en examen</span>
        </span>
      )
    case 'DOCUMENTS_SUBMITTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          <FileText size={11} className="text-[#2563EB]" />
          <span>Documents soumis</span>
        </span>
      )
    case 'PHONE_VERIFIED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F4FAF7] text-[#006B55] border border-[#DCE8E3]">
          <Phone size={11} className="text-[#006B55]" />
          <span>Tél. vérifié</span>
        </span>
      )
    case 'REGISTERED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
          <span>Inscrit</span>
        </span>
      )
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-600 border border-red-200">
          <AlertCircle size={11} className="text-red-600" />
          <span>Dossier refusé</span>
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
          <span>{status}</span>
        </span>
      )
  }
}

function formatPhoneDisplay(raw?: string | null): string {
  if (!raw) return 'Non renseigné'
  const digits = raw.replace(/\D/g, '')
  if (!digits) return raw
  if (digits.startsWith('213')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`
  }
  if (digits.startsWith('0')) {
    const withoutZero = digits.slice(1)
    return `+213 ${withoutZero.slice(0, 2)} ${withoutZero.slice(2, 4)} ${withoutZero.slice(4, 6)} ${withoutZero.slice(6)}`
  }
  return raw
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Sample realistic order activity for presentation
const SAMPLE_USER_ORDERS = [
  {
    id: 'DZ-2026-9842',
    date: '10 oct. 2026, 14:22',
    total: '18 400 DA',
    status: 'Livrée',
    statusColor: 'bg-[#E7F2EF] text-[#006B55] border-[#BBDDD4]',
    payment: 'Paiement à la livraison',
    itemsCount: 3,
    couponCode: 'DZORA10',
    discount: '1 840 DA',
  },
  {
    id: 'DZ-2026-9120',
    date: '28 sept. 2026, 19:05',
    total: '7 900 DA',
    status: 'Livrée',
    statusColor: 'bg-[#E7F2EF] text-[#006B55] border-[#BBDDD4]',
    payment: 'Paiement à la livraison',
    itemsCount: 1,
    couponCode: null,
    discount: null,
  },
]

function AdminUserDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = params?.id as string

  // Sidebar navigation
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({
    sellers: true,
    catalog: true,
    finance: true,
    support: true,
    admin: true,
  })

  // User details state
  const [user, setUser] = useState<AdminUserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Active Tab: 'overview' | 'vendeur' | 'security' | 'orders' | 'audit'
  const [activeTab, setActiveTab] = useState<'overview' | 'vendeur' | 'security' | 'orders' | 'audit'>('overview')

  // Auto-activate tab from query param (?tab=vendeur)
  const tabParam = searchParams.get('tab')
  useEffect(() => {
    if (tabParam === 'vendeur') {
      setActiveTab('vendeur')
    }
  }, [tabParam])

  // Fallback to overview if not a seller
  useEffect(() => {
    if (user && activeTab === 'vendeur' && !user.sellerProfile && !user.roles.includes('SELLER')) {
      setActiveTab('overview')
    }
  }, [user, activeTab])

  // Seller Action Modal state
  const [pendingSellerAction, setPendingSellerAction] = useState<{
    type: 'REVIEW' | 'APPROVE' | 'REJECT' | 'SUSPEND'
  } | null>(null)
  const [sellerActionReason, setSellerActionReason] = useState('')
  const [isSellerActionSubmitting, setIsSellerActionSubmitting] = useState(false)

  // Live OTP troubleshooting states
  const [otpData, setOtpData] = useState<OtpPreviewResponse | null>(null)
  const [isOtpLoading, setIsOtpLoading] = useState(false)
  const [otpVisible, setOtpVisible] = useState(false)
  const [copiedOtp, setCopiedOtp] = useState(false)

  // Admin password change modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null)

  // Session revocation modal
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [isRevokingSessions, setIsRevokingSessions] = useState(false)

  // Status update modal
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'BANNED'>('ACTIVE')
  const [statusReason, setStatusReason] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Edit user profile modal (name, email)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Avatar Modal
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarInputUrl, setAvatarInputUrl] = useState('')
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false)

  // Seller Branding Modal (Banner & Logo)
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false)
  const [brandingTab, setBrandingTab] = useState<'banner' | 'logo'>('banner')
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerInputUrl, setBannerInputUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoInputUrl, setLogoInputUrl] = useState('')
  const [isSavingBranding, setIsSavingBranding] = useState(false)
  const [isCompressingBanner, setIsCompressingBanner] = useState(false)
  const [isCompressingLogo, setIsCompressingLogo] = useState(false)

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Load user data
  const loadUserDetails = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const data = await api.admin.getUserById(userId)
      setUser(data)
    } catch (err: any) {
      console.error('Failed to load user details:', err)
      setToastMessage(err.message || 'Impossible de charger cet utilisateur.')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadUserDetails()
  }, [loadUserDetails])

  // Fetch Live OTP
  const handleFetchOtp = async () => {
    if (!userId) return
    setIsOtpLoading(true)
    try {
      const res = await api.admin.getLastOtp(userId)
      setOtpData(res)
      if (res.active) {
        setOtpVisible(true)
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Erreur lors de la récupération de l’OTP.')
      window.setTimeout(() => setToastMessage(null), 3000)
    } finally {
      setIsOtpLoading(false)
    }
  }

  // Copy OTP code
  const handleCopyOtp = (code?: string) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopiedOtp(true)
    window.setTimeout(() => setCopiedOtp(false), 2000)
  }

  // Submit Password Change
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setToastMessage('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setIsChangingPassword(true)
    try {
      const res = await api.admin.adminChangePassword(userId, newPassword)
      setPasswordSuccessMsg(res.message)
      setToastMessage('Mot de passe mis à jour avec succès.')
      window.setTimeout(() => {
        setPasswordModalOpen(false)
        setPasswordSuccessMsg(null)
        setNewPassword('')
        setToastMessage(null)
      }, 1500)
      loadUserDetails()
    } catch (err: any) {
      setToastMessage(err.message || 'Échec de la modification du mot de passe.')
      window.setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Generate random password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
    let generated = ''
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(generated)
  }

  // Revoke all sessions
  const handleRevokeSessions = async () => {
    setIsRevokingSessions(true)
    try {
      const res = await api.admin.revokeUserSessions(userId)
      setToastMessage(res.message)
      setSessionModalOpen(false)
      loadUserDetails()
    } catch (err: any) {
      setToastMessage(err.message || 'Échec de la révocation des sessions.')
    } finally {
      setIsRevokingSessions(false)
      window.setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // Update Status
  const handleUpdateStatus = async () => {
    setIsUpdatingStatus(true)
    try {
      await api.admin.updateUserStatus(userId, targetStatus, statusReason)
      setToastMessage(`Statut utilisateur modifié vers ${targetStatus}`)
      setStatusModalOpen(false)
      loadUserDetails()
    } catch (err: any) {
      setToastMessage(err.message || 'Échec de la mise à jour du statut.')
    } finally {
      setIsUpdatingStatus(false)
      window.setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // Update User Profile (first/last name, email)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setIsEditingProfile(true)
    try {
      await api.admin.updateUserProfile(userId, {
        firstName: editFirstName.trim() || undefined,
        lastName: editLastName.trim() || undefined,
        email: editEmail.trim() || undefined,
      })
      setToastMessage('Profil utilisateur mis à jour avec succès')
      setIsEditProfileOpen(false)
      await loadUserDetails()
    } catch (err: any) {
      setToastMessage(err.message || 'Impossible de mettre à jour le profil.')
    } finally {
      setIsEditingProfile(false)
      window.setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // Open Avatar Modal
  const handleOpenAvatarModal = () => {
    setAvatarPreview(user?.avatarUrl || null)
    setAvatarInputUrl(user?.avatarUrl && !user.avatarUrl.startsWith('data:') ? user.avatarUrl : '')
    setIsAvatarModalOpen(true)
  }

  // Handle Avatar file upload with Canvas compression (max 400x400, quality 0.85)
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsCompressingAvatar(true)
    try {
      const compressed = await compressImage(file, 400, 400, 0.85)
      setAvatarPreview(compressed)
      setAvatarInputUrl('')
    } catch (err: any) {
      setToastMessage('Erreur lors de la compression de la photo.')
    } finally {
      setIsCompressingAvatar(false)
    }
  }

  // Save Avatar
  const handleSaveAvatar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!userId) return
    setIsSavingAvatar(true)
    try {
      const finalUrl = avatarInputUrl.trim() || avatarPreview || null
      await api.admin.updateUserProfile(userId, { avatarUrl: finalUrl })
      setToastMessage(finalUrl ? 'Photo de profil mise à jour avec succès.' : 'Photo de profil supprimée.')
      setIsAvatarModalOpen(false)
      await loadUserDetails()
    } catch (err: any) {
      setToastMessage(err.message || 'Impossible de mettre à jour la photo.')
    } finally {
      setIsSavingAvatar(false)
      window.setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // Open Seller Branding Modal
  const handleOpenBrandingModal = (initialTab: 'banner' | 'logo' = 'banner') => {
    setBrandingTab(initialTab)
    setBannerPreview(user?.sellerProfile?.bannerUrl || null)
    setBannerInputUrl(
      user?.sellerProfile?.bannerUrl && !user.sellerProfile.bannerUrl.startsWith('data:')
        ? user.sellerProfile.bannerUrl
        : '',
    )
    setLogoPreview(user?.sellerProfile?.logoUrl || null)
    setLogoInputUrl(
      user?.sellerProfile?.logoUrl && !user.sellerProfile.logoUrl.startsWith('data:')
        ? user.sellerProfile.logoUrl
        : '',
    )
    setIsBrandingModalOpen(true)
  }

  // Handle Banner file upload with Canvas compression (max 1600x600, quality 0.82)
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsCompressingBanner(true)
    try {
      const compressed = await compressImage(file, 1600, 600, 0.82)
      setBannerPreview(compressed)
      setBannerInputUrl('')
    } catch (err: any) {
      setToastMessage('Erreur lors de la compression de la bannière.')
    } finally {
      setIsCompressingBanner(false)
    }
  }

  // Handle Logo file upload with Canvas compression (max 400x400, quality 0.85)
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsCompressingLogo(true)
    try {
      const compressed = await compressImage(file, 400, 400, 0.85)
      setLogoPreview(compressed)
      setLogoInputUrl('')
    } catch (err: any) {
      setToastMessage('Erreur lors de la compression du logo.')
    } finally {
      setIsCompressingLogo(false)
    }
  }

  // Save Seller Branding
  const handleSaveBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user?.sellerProfile?.id) return
    setIsSavingBranding(true)
    try {
      const finalBannerUrl = bannerInputUrl.trim() || bannerPreview || null
      const finalLogoUrl = logoInputUrl.trim() || logoPreview || null

      await api.admin.updateSellerBranding(user.sellerProfile.id, {
        bannerUrl: finalBannerUrl,
        logoUrl: finalLogoUrl,
      })

      setToastMessage('Vitrine vendeur mise à jour avec succès.')
      setIsBrandingModalOpen(false)
      await loadUserDetails()
    } catch (err: any) {
      setToastMessage(err.message || 'Impossible de mettre à jour la vitrine.')
    } finally {
      setIsSavingBranding(false)
      window.setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // Confirm Seller Action
  const handleConfirmSellerAction = async () => {
    if (!pendingSellerAction || !user?.sellerProfile?.id) return
    setIsSellerActionSubmitting(true)
    const { type } = pendingSellerAction
    const sellerId = user.sellerProfile.id

    try {
      if (type === 'REVIEW') {
        await api.admin.moveSellerToReview(sellerId)
        setToastMessage(`La boutique « ${user.sellerProfile.storeName} » est passée en cours d’examen.`)
      } else if (type === 'APPROVE') {
        await api.admin.approveSeller(sellerId)
        setToastMessage(`La boutique « ${user.sellerProfile.storeName} » a été approuvée avec succès.`)
      } else if (type === 'REJECT') {
        await api.admin.rejectSeller(sellerId, sellerActionReason.trim() || undefined)
        setToastMessage(`La candidature de « ${user.sellerProfile.storeName} » a été rejetée.`)
      } else if (type === 'SUSPEND') {
        await api.admin.suspendSeller(sellerId)
        setToastMessage(`La boutique « ${user.sellerProfile.storeName} » a été suspendue.`)
      }

      setPendingSellerAction(null)
      setSellerActionReason('')
      await loadUserDetails()
    } catch (err: any) {
      setToastMessage(err.message || 'Impossible d’exécuter l’action sur ce vendeur.')
    } finally {
      setIsSellerActionSubmitting(false)
      window.setTimeout(() => setToastMessage(null), 3500)
    }
  }

  const isSeller = Boolean(user?.sellerProfile || user?.roles.includes('SELLER'))
  const hasRealName = Boolean(user?.firstName?.trim() || user?.lastName?.trim())
  const userDisplayName = hasRealName
    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    : isSeller
    ? 'Vendeur (Nom non renseigné)'
    : 'Utilisateur sans nom'

  const avatarInitial = (
    user?.firstName?.[0] ||
    user?.lastName?.[0] ||
    (isSeller ? user?.sellerProfile?.storeName?.[0] || 'V' : 'U')
  ).toUpperCase()

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#006B55] px-4 py-3 text-xs font-bold text-white shadow-xl shadow-[#006B55]/20 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 size={16} className="text-[#85E1C8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="mx-auto w-8 h-8 rounded-full border-2 border-[#006B55] border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-[#60716F]">
                Chargement complet de la fiche utilisateur…
              </p>
            </div>
          ) : !user ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#DCE8E3]">
              <AlertTriangle className="h-10 w-10 text-[#D97706] mx-auto mb-3" />
              <h2 className="text-base font-bold text-[#102A2A]">Utilisateur introuvable</h2>
              <p className="text-xs text-[#71827D] mt-1">L’identifiant demandé n’existe pas en base de données.</p>
              <Link
                href="/admin/dashboard/utilisateurs"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] text-white text-xs font-bold"
              >
                Retour aux utilisateurs
              </Link>
            </div>
          ) : (
            <>
              {/* Header Profile Hero Card */}
              <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative group w-16 h-16 rounded-2xl bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4] flex items-center justify-center text-2xl font-black shadow-xs shrink-0 overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={userDisplayName}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      avatarInitial
                    )}
                    <button
                      type="button"
                      onClick={handleOpenAvatarModal}
                      className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                      title="Modifier la photo de profil"
                    >
                      <Camera size={16} />
                      <span className="text-[9px] font-bold mt-0.5">Modifier</span>
                    </button>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-black text-[#102A2A] font-display tracking-tight flex items-center gap-2">
                        <span className={hasRealName ? '' : 'text-[#60716F]'}>
                          {userDisplayName}
                        </span>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditFirstName(user.firstName || '')
                              setEditLastName(user.lastName || '')
                              setEditEmail(user.email || '')
                              setIsEditProfileOpen(true)
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006B55] hover:bg-[#CCE8E0] bg-[#E7F2EF] px-2 py-0.5 rounded-lg border border-[#BBDDD4] transition cursor-pointer"
                            title="Modifier les informations du profil"
                          >
                            <Edit2 size={11} />
                            <span>{hasRealName ? 'Modifier' : 'Renseigner le nom'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenAvatarModal}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006B55] hover:bg-[#CCE8E0] bg-[#E7F2EF] px-2 py-0.5 rounded-lg border border-[#BBDDD4] transition cursor-pointer"
                            title="Modifier la photo de profil"
                          >
                            <Camera size={11} />
                            <span>Photo</span>
                          </button>
                        </div>
                      </h1>
                      {/* Status Pill */}
                      {user.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                          <span className="size-1.5 rounded-full bg-[#006B55]" />
                          Actif
                        </span>
                      )}
                      {user.status === 'SUSPENDED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                          <span className="size-1.5 rounded-full bg-[#D97706]" />
                          Suspendu
                        </span>
                      )}
                      {user.status === 'BANNED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-600 border border-red-200">
                          <span className="size-1.5 rounded-full bg-red-600" />
                          Banni
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-[#60716F]">
                      <span className="font-mono text-[#102A2A] font-bold">
                        {formatPhoneDisplay(user.phone)}
                      </span>
                      {user.email && <span>{user.email}</span>}
                      <span className="text-[#9CAFA9]">· ID : {user.id}</span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {getDisplayRoles(user).map((r) => renderRoleBadge(r))}

                      {user.sellerProfile && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                          <Store size={12} />
                          <span>Boutique : <strong>{user.sellerProfile.storeName}</strong></span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatus(user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                      setStatusModalOpen(true)
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                      user.status === 'ACTIVE'
                        ? 'border-[#FDE68A] bg-[#FFF6E7] text-[#D97706] hover:bg-[#FDE68A]/40'
                        : 'border-[#BBDDD4] bg-[#E7F2EF] text-[#006B55] hover:bg-[#CCE8E0]'
                    }`}
                  >
                    {user.status === 'ACTIVE' ? 'Suspendre le compte' : 'Réactiver le compte'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE8E3] hover:bg-[#F4FAF7] text-xs font-bold text-[#102A2A] transition flex items-center gap-1.5"
                  >
                    <KeyRound size={13} className="text-[#006B55]" />
                    <span>Modifier mot de passe</span>
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="border-b border-[#DCE8E3] flex items-center gap-2 overflow-x-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 px-3 transition border-b-2 flex items-center gap-2 ${
                    activeTab === 'overview'
                      ? 'border-[#006B55] text-[#006B55]'
                      : 'border-transparent text-[#60716F] hover:text-[#102A2A]'
                  }`}
                >
                  <Users size={15} />
                  <span>Vue Générale & Profil</span>
                </button>

                {isSeller && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('vendeur')}
                    className={`pb-3 px-3 transition border-b-2 flex items-center gap-2 ${
                      activeTab === 'vendeur'
                        ? 'border-[#006B55] text-[#006B55]'
                        : 'border-transparent text-[#60716F] hover:text-[#102A2A]'
                    }`}
                  >
                    <Store size={15} />
                    <span>Vitrine & Vendeur</span>
                    {user.sellerProfile?.status && (() => {
                      const cfg = getSellerStatusConfig(user.sellerProfile.status)
                      return (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      )
                    })()}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`pb-3 px-3 transition border-b-2 flex items-center gap-2 ${
                    activeTab === 'security'
                      ? 'border-[#006B55] text-[#006B55]'
                      : 'border-transparent text-[#60716F] hover:text-[#102A2A]'
                  }`}
                >
                  <ShieldCheck size={15} />
                  <span>Sécurité & Dépannage OTP</span>
                  {user.twoFactorEnabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006B55]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`pb-3 px-3 transition border-b-2 flex items-center gap-2 ${
                    activeTab === 'orders'
                      ? 'border-[#006B55] text-[#006B55]'
                      : 'border-transparent text-[#60716F] hover:text-[#102A2A]'
                  }`}
                >
                  <ShoppingBag size={15} />
                  <span>Historique Commandes & Coupons</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className={`pb-3 px-3 transition border-b-2 flex items-center gap-2 ${
                    activeTab === 'audit'
                      ? 'border-[#006B55] text-[#006B55]'
                      : 'border-transparent text-[#60716F] hover:text-[#102A2A]'
                  }`}
                >
                  <History size={15} />
                  <span>Journal d&apos;Audit & Connexions ({user.auditLogs?.length || 0})</span>
                </button>
              </div>

              {/* ========================================================= */}
              {/* TAB 1: OVERVIEW                                           */}
              {/* ========================================================= */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Account details */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                      <h2 className="text-sm font-extrabold text-[#102A2A] font-display">
                        Informations Personnelles
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1">Prénom</span>
                          <span className="font-bold text-[#102A2A] text-sm">
                            {user.firstName || 'Non renseigné'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1">Nom de famille</span>
                          <span className="font-bold text-[#102A2A] text-sm">
                            {user.lastName || 'Non renseigné'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1">Téléphone Principal</span>
                          <span className="font-bold text-[#102A2A] text-sm font-mono">
                            {formatPhoneDisplay(user.phone)}
                          </span>
                          <span className="mt-1 block text-[10px] text-[#006B55] font-bold">
                            {user.phoneVerified ? '✓ Numéro vérifié par SMS' : 'En attente de vérification'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1">Adresse E-mail</span>
                          <span className="font-bold text-[#102A2A] text-sm truncate block">
                            {user.email || 'Non renseigné'}
                          </span>
                          <span className="mt-1 block text-[10px] text-[#006B55] font-bold">
                            {user.emailVerified ? '✓ E-mail vérifié' : 'Non vérifié'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Seller Store Info if present */}
                    {user.sellerProfile && (
                      <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                            <Store size={16} className="text-[#006B55]" />
                            <span>Vitrine Vendeur Associée</span>
                          </h2>
                          <span className="text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-2.5 py-0.5 rounded-full border border-[#BBDDD4]">
                            {user.sellerProfile.type || 'Boutique'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-3.5 rounded-xl bg-[#EDF7F4] border border-[#BBDDD4]">
                            <span className="text-[#4A5D58] block mb-1">Nom de la Boutique</span>
                            <span className="font-extrabold text-[#006B55] text-sm">
                              {user.sellerProfile.storeName}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                            <span className="text-[#71827D] block mb-1">Statut d&apos;approbation</span>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              {renderSellerStatusBadge(user.sellerProfile.status)}
                              {renderVerificationStatusBadge(user.sellerProfile.verificationStatus)}
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                            <span className="text-[#71827D] block mb-1">Wilaya / Commune</span>
                            <span className="font-bold text-[#102A2A]">
                              {user.sellerProfile.wilaya || '—'} · {user.sellerProfile.commune || '—'}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                            <span className="text-[#71827D] block mb-1">Registre de Commerce (RC)</span>
                            <span className="font-mono text-[#102A2A]">
                              {user.sellerProfile.businessRegistration || 'Non soumis'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#F0F5F2] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setActiveTab('vendeur')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] hover:underline cursor-pointer"
                          >
                            <span>Gérer et inspecter la boutique complète</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Key metrics */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                      <h2 className="text-sm font-extrabold text-[#102A2A] font-display">
                        Dates Clés du Compte
                      </h2>

                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0F5F2]">
                          <span className="text-[#60716F]">Date d&apos;inscription</span>
                          <span className="font-bold text-[#102A2A]">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0F5F2]">
                          <span className="text-[#60716F]">Dernière modification</span>
                          <span className="font-bold text-[#102A2A]">
                            {formatDate(user.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#60716F]">Sessions en mémoire</span>
                          <span className="font-bold text-[#006B55]">
                            {user.sessions?.length || 0} active(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-3">
                      <h2 className="text-sm font-extrabold text-[#102A2A] font-display">
                        Actions Rapides
                      </h2>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setSessionModalOpen(true)}
                          className="w-full text-left p-3 rounded-xl border border-[#DCE8E3] hover:bg-[#F4FAF7] text-xs font-bold text-[#102A2A] transition"
                        >
                          Déconnecter toutes les sessions
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('security')
                            handleFetchOtp()
                          }}
                          className="w-full text-left p-3 rounded-xl border border-[#BBDDD4] bg-[#EDF7F4] text-xs font-bold text-[#006B55] transition flex items-center justify-between"
                        >
                          <span>Vérifier le dernier OTP reçu</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB: VENDEUR & BOUTIQUE                                  */}
              {/* ========================================================= */}
              {activeTab === 'vendeur' && user.sellerProfile && (
                <div className="space-y-6">
                  {/* Store Header & Banner Card */}
                  <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
                    {user.sellerProfile.bannerUrl ? (
                      <div className="relative w-full h-44 sm:h-56 bg-[#F4F8F6] border-b border-[#E5EEEB] group">
                        <Image
                          src={user.sellerProfile.bannerUrl}
                          alt={user.sellerProfile.storeName || 'Bannière'}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenBrandingModal('banner')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            <Camera size={13} />
                            <span>Changer la bannière</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-36 sm:h-44 bg-gradient-to-r from-[#E7F2EF] via-[#D8EFE8] to-[#EBF6F3] border-b border-[#DCE8E3] flex flex-col items-center justify-center p-4 text-center">
                        <div className="flex items-center gap-2 text-[#006B55] font-extrabold text-sm mb-1">
                          <ImageIcon size={18} />
                          <span>Aucune bannière de vitrine configurée</span>
                        </div>
                        <p className="text-xs text-[#60716F] max-w-md mb-3">
                          Personnalisez l&apos;arrière-plan de la boutique du vendeur pour donner une identité visuelle forte à sa vitrine.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenBrandingModal('banner')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          <Camera size={13} />
                          <span>Ajouter une bannière</span>
                        </button>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative group w-16 h-16 rounded-2xl overflow-hidden border border-[#DCE8E3] shrink-0 bg-[#F4F8F6] shadow-xs flex items-center justify-center">
                            {user.sellerProfile.logoUrl ? (
                              <Image
                                src={user.sellerProfile.logoUrl}
                                alt={user.sellerProfile.storeName || 'Logo'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#E7F2EF] text-[#006B55] font-black text-2xl flex items-center justify-center border border-[#BBDDD4]">
                                {(user.sellerProfile.storeName || 'B').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenBrandingModal('logo')}
                              className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                              title="Modifier le logo"
                            >
                              <Camera size={15} />
                              <span className="text-[9px] font-bold">Logo</span>
                            </button>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h2 className="text-xl font-black text-[#102A2A] font-display">
                                {user.sellerProfile.storeName}
                              </h2>
                              {renderSellerStatusBadge(user.sellerProfile.status)}
                              {renderVerificationStatusBadge(user.sellerProfile.verificationStatus)}
                              {user.sellerProfile.type === 'PHYSICAL_STORE' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  <Building2 size={11} />
                                  Magasin physique
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                                  <ShoppingBag size={11} />
                                  E-commerce
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#71827D] mt-1">
                              <span>Catégorie : <strong className="text-[#102A2A]">{user.sellerProfile.category || 'Générale'}</strong></span>
                              <span>·</span>
                              <span>ID Profil : <span className="font-mono text-[#102A2A]">{user.sellerProfile.id}</span></span>
                              {user.sellerProfile.slug && (
                                <>
                                  <span>·</span>
                                  <Link
                                    href={`/vendeur/${user.sellerProfile.slug}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-[#006B55] font-bold hover:underline"
                                  >
                                    <span>Voir la vitrine en ligne</span>
                                    <ExternalLink size={12} />
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenBrandingModal('banner')}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#006B55] bg-[#E7F2EF] hover:bg-[#CCE8E0] border border-[#BBDDD4] transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Camera size={13} />
                            <span>Bannière & Logo</span>
                          </button>
                          {user.sellerProfile.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => setPendingSellerAction({ type: 'REVIEW' })}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#D97706] bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                            >
                              Passer en examen
                            </button>
                          )}

                          {(user.sellerProfile.status === 'PENDING' || user.sellerProfile.status === 'UNDER_REVIEW') && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPendingSellerAction({ type: 'REJECT' })}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                              >
                                Rejeter la boutique
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingSellerAction({ type: 'APPROVE' })}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#006B55] hover:bg-[#005544] transition cursor-pointer"
                              >
                                Approuver la boutique
                              </button>
                            </>
                          )}

                          {user.sellerProfile.status === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => setPendingSellerAction({ type: 'SUSPEND' })}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-red-50 hover:text-red-700 border border-gray-200 transition cursor-pointer"
                            >
                              Suspendre la boutique
                            </button>
                          )}

                          {user.sellerProfile.status === 'SUSPENDED' && (
                            <button
                              type="button"
                              onClick={() => setPendingSellerAction({ type: 'APPROVE' })}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#006B55] hover:bg-[#005544] transition cursor-pointer"
                            >
                              Réactiver la boutique
                            </button>
                          )}

                          {user.sellerProfile.status === 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => setPendingSellerAction({ type: 'REVIEW' })}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#D97706] bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                            >
                              Réexaminer la candidature
                            </button>
                          )}
                        </div>
                      </div>

                      {user.sellerProfile.description && (
                        <p className="text-xs text-[#60716F] mt-4 pt-4 border-t border-[#F0F5F2] leading-relaxed">
                          {user.sellerProfile.description}
                        </p>
                      )}

                      {/* Profile completion */}
                      {(() => {
                        const progress = getSellerProgressConfig(
                          user.sellerProfile.status,
                          user.sellerProfile.completionPercentage,
                        )
                        return (
                          <div className="mt-4 pt-3 border-t border-[#F0F5F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[#71827D] font-medium">Complétion du dossier vendeur :</span>
                              <span className={`font-extrabold ${progress.textColor}`}>
                                {progress.sublabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-1 max-w-xs">
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${progress.color}`}
                                  style={{ width: `${progress.percentage}%` }}
                                />
                              </div>
                              <span className={`font-bold font-mono text-[11px] ${progress.textColor}`}>
                                {progress.label}
                              </span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Alerte informative si la boutique ou le dossier est en cours d'examen */}
                  {(user.sellerProfile.status === 'UNDER_REVIEW' || user.sellerProfile.verificationStatus === 'UNDER_REVIEW') && (
                    <div className="p-4 rounded-2xl bg-[#FFF6E7] border border-[#FDE68A] flex items-start gap-3.5 shadow-[0_2px_10px_rgba(217,119,6,0.06)]">
                      <div className="size-9 rounded-xl bg-[#FDE68A] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                        <Clock size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#92400E] text-sm font-display">
                          Dossier vendeur en cours d&apos;examen administratif
                        </h4>
                        <p className="text-[#B45309] text-xs mt-1 leading-relaxed">
                          Ce profil a soumis ses informations professionnelles et ses justificatifs légaux. Examinez les documents ci-dessous puis utilisez les boutons d&apos;action en haut pour approuver l&apos;ouverture ou notifier un motif de rejet.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Two Column Grid: Cadre Légal & Localisation */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cadre Légal & Fiscal */}
                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                      <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                        <FileText size={16} className="text-[#006B55]" />
                        <span>Cadre Légal & Fiscalité</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">Forme juridique</span>
                          <span className="font-bold text-[#102A2A]">
                            {renderLegalStatus(user.sellerProfile.legalStatus)}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">Raison sociale</span>
                          <span className="font-medium text-[#102A2A]">
                            {user.sellerProfile.businessName || '—'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">N° Registre de Commerce (RC)</span>
                          <span className="font-mono font-bold text-[#102A2A]">
                            {user.sellerProfile.businessRegistration || 'Non renseigné'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">N° NIF</span>
                          <span className="font-mono text-[#102A2A]">
                            {user.sellerProfile.nifNumber || '—'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">N° NIS</span>
                          <span className="font-mono text-[#102A2A]">
                            {user.sellerProfile.nisNumber || '—'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">Article d’imposition (AI)</span>
                          <span className="font-mono text-[#102A2A]">
                            {user.sellerProfile.aiNumber || '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Localisation & Expédition */}
                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                      <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                        <Truck size={16} className="text-[#006B55]" />
                        <span>Localisation & Expédition</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">Wilaya & Commune</span>
                          <span className="font-bold text-[#102A2A]">
                            {user.sellerProfile.wilaya || '—'} {user.sellerProfile.commune ? `(${user.sellerProfile.commune})` : ''}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">Adresse physique</span>
                          <span className="font-medium text-[#102A2A]">
                            {user.sellerProfile.address || '—'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">Modes d’expédition</span>
                          <div className="flex gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                              user.sellerProfile.deliveryHome ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              Domicile : {user.sellerProfile.deliveryHome ? 'Oui' : 'Non'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                              user.sellerProfile.deliveryDesk ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              Point relais : {user.sellerProfile.deliveryDesk ? 'Oui' : 'Non'}
                            </span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                          <span className="text-[#71827D] block mb-1 text-[11px]">Couverture géographique</span>
                          <span className="font-bold text-[#102A2A]">
                            {user.sellerProfile.coveredWilayas && user.sellerProfile.coveredWilayas.length > 0
                              ? `${user.sellerProfile.coveredWilayas.length} wilayas couvertes`
                              : 'Toute l’Algérie (58 wilayas)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reversement & Documents */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Coordonnées de Paiement / Reversement */}
                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                      <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                        <CreditCard size={16} className="text-[#006B55]" />
                        <span>Coordonnées de Reversement (CCP / Bancaire)</span>
                      </h3>
                      <div className="p-4 rounded-xl bg-[#EDF7F4] border border-[#BBDDD4] flex items-center justify-between">
                        <div>
                          <span className="text-[#4A5D58] text-[11px] block mb-1 font-semibold">RIP CCP / RIB Bancaire</span>
                          <span className="font-mono font-bold text-sm text-[#006B55]">
                            {user.sellerProfile.ripCcp || 'Non renseigné'}
                          </span>
                        </div>
                        {user.sellerProfile.ripCcp && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(user.sellerProfile?.ripCcp || '')
                              setToastMessage('RIP CCP copié dans le presse-papier')
                              window.setTimeout(() => setToastMessage(null), 2500)
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#BBDDD4] text-xs font-bold text-[#006B55] hover:bg-[#D5EBE4] transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Copy size={13} />
                            <span>Copier</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Documents Légaux & Justificatifs */}
                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                          <FileText size={16} className="text-[#006B55]" />
                          <span>Documents & Justificatifs Soumis</span>
                        </h3>
                        {renderVerificationStatusBadge(user.sellerProfile.verificationStatus)}
                      </div>
                      {user.sellerProfile.documents && Object.keys(user.sellerProfile.documents).length > 0 ? (
                        <div className="space-y-2 text-xs">
                          {Object.entries(user.sellerProfile.documents).map(([key, value]) => (
                            <div
                              key={key}
                              className="p-3 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB] flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 size={15} className="text-[#006B55]" />
                                <span className="font-bold text-[#102A2A] capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                              </div>
                              {typeof value === 'string' && (value.startsWith('http') || value.startsWith('/')) ? (
                                <a
                                  href={value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#DCE8E3] text-[11px] font-bold text-[#006B55] hover:bg-[#F4FAF7]"
                                >
                                  <span>Consulter</span>
                                  <ExternalLink size={11} />
                                </a>
                              ) : (
                                <span className="text-[11px] font-mono text-[#71827D]">
                                  {typeof value === 'string' ? value : 'Document valide'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB] text-center text-xs text-[#71827D]">
                          Aucun fichier numérique téléversé pour le moment.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: SECURITY & OTP TROUBLESHOOTING                     */}
              {/* ========================================================= */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Live OTP Box */}
                  <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F5F2] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="grid size-8 place-items-center rounded-xl bg-[#006B55]/10 text-[#006B55]">
                            <KeyRound size={16} />
                          </div>
                          <h2 className="text-base font-extrabold text-[#102A2A] font-display">
                            Dépannage Code OTP (SMS / Téléphone)
                          </h2>
                        </div>
                        <p className="text-xs text-[#71827D] mt-1">
                          Consultez le dernier code SMS généré en mémoire Redis pour ce numéro si l&apos;utilisateur rencontre un problème opérateur.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleFetchOtp}
                        disabled={isOtpLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005544] transition disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={isOtpLoading ? 'animate-spin' : ''} />
                        <span>Vérifier l&apos;OTP actif</span>
                      </button>
                    </div>

                    {otpData ? (
                      otpData.active && otpData.code ? (
                        <div className="bg-[#EDF7F4] border border-[#BBDDD4] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-[#006B55] uppercase tracking-wider block mb-1">
                              Code OTP Actif en mémoire
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-3xl font-mono font-black text-[#006B55] tracking-widest">
                                {otpVisible ? otpData.code : '••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setOtpVisible(!otpVisible)}
                                className="p-1.5 rounded-lg text-[#006B55] hover:bg-[#D4ECE4] transition"
                                title={otpVisible ? 'Masquer' : 'Afficher'}
                              >
                                {otpVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyOtp(otpData.code)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005241] transition"
                              >
                                {copiedOtp ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedOtp ? 'Copié !' : 'Copier'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="text-right text-xs space-y-1 sm:border-l sm:border-[#BBDDD4] sm:pl-6">
                            <div className="text-[#4A5D58]">
                              Temps restant :{' '}
                              <strong className="text-[#006B55] font-mono text-sm">
                                {otpData.ttlSeconds}s
                              </strong>
                            </div>
                            <div className="text-[#71827D]">
                              Tentatives effectuées : {otpData.attempts || 0} / 5
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#F7FAF9] border border-[#E5EEEB] rounded-2xl p-5 text-center text-xs text-[#71827D]">
                          Aucun code OTP n&apos;est actuellement en cours de validité pour ce numéro ({formatPhoneDisplay(user.phone)}).
                        </div>
                      )
                    ) : (
                      <div className="bg-[#F7FAF9] border border-[#E5EEEB] rounded-2xl p-5 text-center text-xs text-[#71827D]">
                        Cliquez sur <strong>« Vérifier l&apos;OTP actif »</strong> pour interroger le cache Redis de manière sécurisée.
                      </div>
                    )}
                  </div>

                  {/* Password & 2FA Settings Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                      <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                        <Lock size={15} className="text-[#006B55]" />
                        <span>Mot de passe Administrateur</span>
                      </h3>
                      <p className="text-xs text-[#71827D]">
                        Vous pouvez définir un nouveau mot de passe directement sans passer par l&apos;email de réinitialisation.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPasswordModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005544] transition"
                      >
                        Changer le mot de passe du compte
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] space-y-4">
                      <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                        <ShieldCheck size={15} className="text-[#006B55]" />
                        <span>Double Facteur (2FA TOTP)</span>
                      </h3>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#60716F]">Statut 2FA :</span>
                          <span className="font-bold text-[#006B55]">
                            {user.twoFactorEnabled ? 'Activé' : 'Désactivé'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#60716F]">Codes de secours enregistrés :</span>
                          <span className="font-bold text-[#102A2A]">
                            {user.recoveryCodesCount || 0} code(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: ORDERS & COUPONS                                   */}
              {/* ========================================================= */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
                    <div className="p-5 border-b border-[#E5EEEB] flex items-center justify-between">
                      <h2 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                        <ShoppingBag size={16} className="text-[#006B55]" />
                        <span>Commandes Passées par l&apos;Utilisateur</span>
                      </h2>
                      <span className="text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-2.5 py-0.5 rounded-full border border-[#BBDDD4]">
                        {SAMPLE_USER_ORDERS.length} commande(s)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E5EEEB] bg-[#F7FAF9] text-[11px] font-bold text-[#71827D] uppercase">
                            <th className="py-3 px-4">Référence</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Montant</th>
                            <th className="py-3 px-4">Statut</th>
                            <th className="py-3 px-4">Mode de Paiement</th>
                            <th className="py-3 px-4">Code Promo / Coupon</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5EEEB]">
                          {SAMPLE_USER_ORDERS.map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#F9FCFA] transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-[#006B55]">
                                {ord.id}
                              </td>
                              <td className="py-3.5 px-4 text-[#60716F]">
                                {ord.date}
                              </td>
                              <td className="py-3.5 px-4 font-extrabold font-mono text-[#102A2A]">
                                {ord.total}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ord.statusColor}`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-[#60716F]">
                                {ord.payment}
                              </td>
                              <td className="py-3.5 px-4">
                                {ord.couponCode ? (
                                  <div className="flex items-center gap-1.5 font-mono text-[#D97706] font-bold">
                                    <Tag size={12} />
                                    <span>{ord.couponCode} (−{ord.discount})</span>
                                  </div>
                                ) : (
                                  <span className="text-[#9CAFA9]">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: AUDIT LOGS & SESSIONS                              */}
              {/* ========================================================= */}
              {activeTab === 'audit' && (
                <div className="space-y-6">
                  {/* Sessions Card */}
                  <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
                    <div className="p-5 border-b border-[#E5EEEB] flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                        <Laptop size={16} className="text-[#006B55]" />
                        <span>Sessions Actives en Cours ({user.sessions?.length || 0})</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSessionModalOpen(true)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Révoquer toutes les sessions
                      </button>
                    </div>

                    <div className="divide-y divide-[#E5EEEB] text-xs">
                      {user.sessions && user.sessions.length > 0 ? (
                        user.sessions.map((s) => (
                          <div key={s.id} className="p-4 flex items-center justify-between hover:bg-[#F9FCFA]">
                            <div>
                              <div className="font-bold text-[#102A2A]">
                                {s.deviceName || 'Navigateur Web'}
                              </div>
                              <div className="text-[11px] text-[#71827D] mt-0.5 truncate max-w-md font-mono">
                                IP : {s.ipAddress || '127.0.0.1'} · {s.userAgent || 'Client standard'}
                              </div>
                            </div>
                            <div className="text-right text-[11px] text-[#60716F]">
                              Dernière activité : {formatDate(s.lastUsedAt)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-[#71827D]">
                          Aucune session active enregistrée.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
                    <div className="p-5 border-b border-[#E5EEEB]">
                      <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                        <History size={16} className="text-[#006B55]" />
                        <span>Historique des Actions et de Connexion</span>
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E5EEEB] bg-[#F7FAF9] text-[11px] font-bold text-[#71827D] uppercase">
                            <th className="py-3 px-4">Événement</th>
                            <th className="py-3 px-4">Adresse IP</th>
                            <th className="py-3 px-4">Détails / Métadonnées</th>
                            <th className="py-3 px-4 text-right">Date & Heure</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5EEEB]">
                          {user.auditLogs && user.auditLogs.length > 0 ? (
                            user.auditLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-[#F9FCFA]">
                                <td className="py-3.5 px-4 font-mono font-bold text-[#006B55]">
                                  {log.action}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[#60716F]">
                                  {log.ipAddress || '127.0.0.1'}
                                </td>
                                <td className="py-3.5 px-4 text-[11px] text-[#71827D]">
                                  {log.metadata ? JSON.stringify(log.metadata) : '—'}
                                </td>
                                <td className="py-3.5 px-4 text-right text-[#60716F] font-mono text-[11px]">
                                  {formatDate(log.createdAt)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-[#71827D]">
                                Aucun journal d&apos;audit spécifique pour cet utilisateur.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

      {/* ========================================================= */}
      {/* 3. MODALS (PASSWORD, STATUS, SESSIONS)                    */}
      {/* ========================================================= */}

      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5EEEB] pb-3">
              <h3 className="text-base font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                <KeyRound size={17} className="text-[#006B55]" />
                <span>Modifier le Mot de Passe</span>
              </h3>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="text-[#94A4A0] hover:text-[#102A2A] p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitPassword} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#102A2A] block mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 caractères"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-mono text-xs focus:bg-white focus:border-[#008F72] outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-3 py-2 rounded-xl border border-[#DCE8E3] bg-white text-[#006B55] font-bold hover:bg-[#EDF7F4] transition shrink-0"
                  >
                    Générer
                  </button>
                </div>
                <p className="text-[11px] text-[#71827D] mt-1.5">
                  La modification révoquera automatiquement toutes les sessions existantes de l&apos;utilisateur.
                </p>
              </div>

              {passwordSuccessMsg && (
                <div className="p-3 rounded-xl bg-[#E7F2EF] text-[#006B55] font-bold text-xs">
                  {passwordSuccessMsg}
                </div>
              )}

              <div className="pt-2 border-t border-[#E5EEEB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-[#60716F] font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold hover:bg-[#005544] disabled:opacity-50"
                >
                  {isChangingPassword ? 'Enregistrement…' : 'Valider le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Sessions Modal */}
      {sessionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <ShieldAlert size={18} />
              <span className="text-sm font-extrabold text-[#102A2A] font-display">
                Déconnecter l&apos;utilisateur ?
              </span>
            </div>
            <p className="text-[#60716F]">
              Cette action supprimera toutes les sessions actives de l&apos;utilisateur. Il sera immédiatement déconnecté de tous ses appareils et navigateurs.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSessionModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-[#DCE8E3] text-[#60716F] font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleRevokeSessions}
                disabled={isRevokingSessions}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {isRevokingSessions ? 'Révocation…' : 'Confirmer la déconnexion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-[#102A2A] font-display">
              Changer le statut du compte
            </h3>
            <div>
              <label className="font-bold text-[#102A2A] block mb-1">Nouveau statut</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-bold"
              >
                <option value="ACTIVE">Actif</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="BANNED">Banni</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#102A2A] block mb-1">Motif administratif</label>
              <input
                type="text"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Raison de la modification…"
                className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-[#DCE8E3] text-[#60716F] font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold hover:bg-[#005544] disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Traitement…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && user && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#F0F5F2] pb-3">
              <h3 className="text-sm font-extrabold text-[#102A2A] font-display">
                {isSeller ? 'Renseigner / Modifier le Vendeur' : 'Modifier le profil utilisateur'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div>
                <label className="font-bold text-[#102A2A] block mb-1">Prénom du vendeur</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="Ex : Mohamed"
                  className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                />
              </div>

              <div>
                <label className="font-bold text-[#102A2A] block mb-1">Nom du vendeur</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="Ex : Benali"
                  className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                />
              </div>

              <div>
                <label className="font-bold text-[#102A2A] block mb-1">Adresse email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Ex : contact@domaine.dz"
                  className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#DCE8E3] text-[#60716F] font-bold hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isEditingProfile}
                  className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold hover:bg-[#005544] transition disabled:opacity-50"
                >
                  {isEditingProfile ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Action Confirmation Modal */}
      {pendingSellerAction && user?.sellerProfile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4">
            <div className="flex items-center gap-3">
              {pendingSellerAction.type === 'APPROVE' ? (
                <div className="w-10 h-10 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              ) : pendingSellerAction.type === 'REVIEW' ? (
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-[#102A2A] font-display">
                  {pendingSellerAction.type === 'APPROVE'
                    ? 'Approuver la boutique'
                    : pendingSellerAction.type === 'REVIEW'
                    ? 'Mettre en examen'
                    : pendingSellerAction.type === 'REJECT'
                    ? 'Rejeter la candidature'
                    : 'Suspendre la boutique'}
                </h3>
                <p className="text-xs text-[#71827D]">
                  Boutique : « {user.sellerProfile.storeName} »
                </p>
              </div>
            </div>

            <p className="text-xs text-[#60716F] leading-relaxed">
              {pendingSellerAction.type === 'APPROVE'
                ? 'Cette action valide le profil vendeur et lui permet de publier des produits et gérer sa boutique sur Dzora Marketplace.'
                : pendingSellerAction.type === 'REVIEW'
                ? 'La candidature passera au statut « En cours d’examen » pour analyse des documents légaux.'
                : pendingSellerAction.type === 'REJECT'
                ? 'La candidature sera refusée. Vous pouvez indiquer le motif du rejet ci-dessous.'
                : 'La boutique sera suspendue et ses produits retirés temporairement de la vitrine publique.'}
            </p>

            {(pendingSellerAction.type === 'REJECT' || pendingSellerAction.type === 'SUSPEND') && (
              <div>
                <label
                  htmlFor="seller-action-reason"
                  className="block text-[11px] font-bold text-[#60716F] uppercase mb-1.5"
                >
                  Motif {pendingSellerAction.type === 'REJECT' ? 'du rejet' : 'de la suspension'} (optionnel)
                </label>
                <textarea
                  id="seller-action-reason"
                  rows={3}
                  value={sellerActionReason}
                  onChange={(e) => setSellerActionReason(e.target.value)}
                  placeholder="Ex : Registre de commerce illisible, numéro NIF non conforme…"
                  className="w-full p-2.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] placeholder:text-[#94A4A0] focus:bg-white focus:border-[#008F72] outline-none transition"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSellerActionSubmitting}
                onClick={() => {
                  setPendingSellerAction(null)
                  setSellerActionReason('')
                }}
                className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSellerActionSubmitting}
                onClick={handleConfirmSellerAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                  pendingSellerAction.type === 'APPROVE'
                    ? 'bg-[#006B55] hover:bg-[#005544]'
                    : pendingSellerAction.type === 'REVIEW'
                    ? 'bg-[#D97706] hover:bg-[#B45309]'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSellerActionSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Traitement en cours…</span>
                  </>
                ) : (
                  <span>Confirmer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Avatar Modal */}
      {isAvatarModalOpen && user && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#F0F5F2] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                  <Camera size={16} className="text-[#006B55]" />
                  <span>Photo de profil utilisateur</span>
                </h3>
                <p className="text-[11px] text-[#71827D] mt-0.5">
                  Compte {isSeller ? 'Vendeur' : 'Client'} : <strong className="text-[#102A2A]">{userDisplayName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Live Preview Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB] gap-2.5">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#DCE8E3] bg-[#E7F2EF] text-[#006B55] flex items-center justify-center text-3xl font-black shadow-xs shrink-0">
                {avatarInputUrl.trim() || avatarPreview ? (
                  <img
                    src={avatarInputUrl.trim() || (avatarPreview as string)}
                    alt="Aperçu avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}
                {isCompressingAvatar && (
                  <div className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center gap-1">
                    <RefreshCw size={16} className="animate-spin" />
                    <span className="text-[9px] font-bold">Optimisation…</span>
                  </div>
                )}
              </div>

              {avatarPreview && avatarPreview.startsWith('data:') && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                  <CheckCircle2 size={12} />
                  <span>Compressé : {formatBytes(getDataUrlSize(avatarPreview))} (400×400)</span>
                </div>
              )}
            </div>

            {/* Upload File Input with Compression */}
            <div>
              <label className="font-bold text-[#102A2A] block mb-1">
                Téléverser une image locale (compression automatique)
              </label>
              <label className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-dashed border-[#BBDDD4] bg-[#F7FAF9] hover:bg-[#EDF7F4] text-[#006B55] font-bold cursor-pointer transition">
                <Upload size={14} />
                <span>Sélectionner un fichier (JPG, PNG, WebP)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct URL Input */}
            <div>
              <label className="font-bold text-[#102A2A] block mb-1">
                Ou coller une URL d&apos;image web
              </label>
              <input
                type="url"
                value={avatarInputUrl}
                onChange={(e) => {
                  setAvatarInputUrl(e.target.value)
                  if (e.target.value) setAvatarPreview(null)
                }}
                placeholder="https://exemple.com/photo.jpg"
                className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
              />
            </div>

            {/* Reset / Remove Photo */}
            {(avatarPreview || avatarInputUrl || user.avatarUrl) && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview(null)
                    setAvatarInputUrl('')
                  }}
                  className="text-red-600 hover:text-red-700 font-bold inline-flex items-center gap-1 text-[11px] transition"
                >
                  <Trash2 size={12} />
                  <span>Réinitialiser / Supprimer la photo (afficher les initiales)</span>
                </button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#E5EEEB] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-[#DCE8E3] text-[#60716F] font-bold hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleSaveAvatar()}
                disabled={isSavingAvatar || isCompressingAvatar}
                className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold hover:bg-[#005544] transition disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isSavingAvatar ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Enregistrement…</span>
                  </>
                ) : (
                  <span>Enregistrer la photo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Branding Modal (Banner & Logo) */}
      {isBrandingModalOpen && user?.sellerProfile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#F0F5F2] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#102A2A] font-display flex items-center gap-2">
                  <Camera size={16} className="text-[#006B55]" />
                  <span>Personnaliser la vitrine vendeur</span>
                </h3>
                <p className="text-[11px] text-[#71827D] mt-0.5">
                  Boutique : <strong className="text-[#102A2A]">{user.sellerProfile.storeName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandingModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab switch */}
            <div className="flex items-center gap-2 p-1 bg-[#F4F9F7] rounded-xl border border-[#DCE8E3]">
              <button
                type="button"
                onClick={() => setBrandingTab('banner')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  brandingTab === 'banner'
                    ? 'bg-white text-[#006B55] shadow-xs'
                    : 'text-[#60716F] hover:text-[#102A2A]'
                }`}
              >
                <ImageIcon size={14} />
                <span>Bannière de fond</span>
              </button>
              <button
                type="button"
                onClick={() => setBrandingTab('logo')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  brandingTab === 'logo'
                    ? 'bg-white text-[#006B55] shadow-xs'
                    : 'text-[#60716F] hover:text-[#102A2A]'
                }`}
              >
                <Store size={14} />
                <span>Logo de la boutique</span>
              </button>
            </div>

            {/* Banner Section */}
            {brandingTab === 'banner' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div>
                  <span className="font-bold text-[#102A2A] block mb-1.5">
                    Aperçu de la bannière (recommandé 1600 × 600 px)
                  </span>
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#DCE8E3] bg-[#F7FAF9] flex items-center justify-center">
                    {bannerInputUrl.trim() || bannerPreview ? (
                      <img
                        src={bannerInputUrl.trim() || (bannerPreview as string)}
                        alt="Aperçu bannière"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#E7F2EF] via-[#D8EFE8] to-[#EBF6F3] flex flex-col items-center justify-center text-[#006B55]">
                        <ImageIcon size={24} className="mb-1 opacity-70" />
                        <span className="text-[11px] font-bold">Aucune bannière définie</span>
                      </div>
                    )}
                    {isCompressingBanner && (
                      <div className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center gap-1">
                        <RefreshCw size={16} className="animate-spin" />
                        <span className="text-[10px] font-bold">Optimisation et compression…</span>
                      </div>
                    )}
                  </div>
                  {bannerPreview && bannerPreview.startsWith('data:') && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                      <CheckCircle2 size={12} />
                      <span>Compressé : {formatBytes(getDataUrlSize(bannerPreview))} (1600×600 max)</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-[#102A2A] block mb-1">
                    Importer une bannière locale (compression automatique)
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-dashed border-[#BBDDD4] bg-[#F7FAF9] hover:bg-[#EDF7F4] text-[#006B55] font-bold cursor-pointer transition">
                    <Upload size={14} />
                    <span>Choisir une bannière (JPG, PNG, WebP)</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleBannerFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="font-bold text-[#102A2A] block mb-1">
                    Ou renseigner une URL directe de bannière
                  </label>
                  <input
                    type="url"
                    value={bannerInputUrl}
                    onChange={(e) => {
                      setBannerInputUrl(e.target.value)
                      if (e.target.value) setBannerPreview(null)
                    }}
                    placeholder="https://exemple.com/banniere.jpg"
                    className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>

                {(bannerPreview || bannerInputUrl || user.sellerProfile.bannerUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBannerPreview(null)
                      setBannerInputUrl('')
                    }}
                    className="text-red-600 hover:text-red-700 font-bold inline-flex items-center gap-1 text-[11px] transition"
                  >
                    <Trash2 size={12} />
                    <span>Supprimer la bannière</span>
                  </button>
                )}
              </div>
            )}

            {/* Logo Section */}
            {brandingTab === 'logo' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div>
                  <span className="font-bold text-[#102A2A] block mb-1.5">
                    Aperçu du logo (carré recommandé 400 × 400 px)
                  </span>
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB] gap-2">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#DCE8E3] bg-[#E7F2EF] text-[#006B55] flex items-center justify-center text-3xl font-black shadow-xs shrink-0">
                      {logoInputUrl.trim() || logoPreview ? (
                        <img
                          src={logoInputUrl.trim() || (logoPreview as string)}
                          alt="Aperçu logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (user.sellerProfile.storeName || 'B').charAt(0).toUpperCase()
                      )}
                      {isCompressingLogo && (
                        <div className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center gap-1">
                          <RefreshCw size={16} className="animate-spin" />
                          <span className="text-[9px] font-bold">Optimisation…</span>
                        </div>
                      )}
                    </div>
                    {logoPreview && logoPreview.startsWith('data:') && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                        <CheckCircle2 size={12} />
                        <span>Compressé : {formatBytes(getDataUrlSize(logoPreview))} (400×400)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#102A2A] block mb-1">
                    Importer un logo local (compression automatique)
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-dashed border-[#BBDDD4] bg-[#F7FAF9] hover:bg-[#EDF7F4] text-[#006B55] font-bold cursor-pointer transition">
                    <Upload size={14} />
                    <span>Choisir un logo (JPG, PNG, WebP)</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="font-bold text-[#102A2A] block mb-1">
                    Ou renseigner une URL directe de logo
                  </label>
                  <input
                    type="url"
                    value={logoInputUrl}
                    onChange={(e) => {
                      setLogoInputUrl(e.target.value)
                      if (e.target.value) setLogoPreview(null)
                    }}
                    placeholder="https://exemple.com/logo.jpg"
                    className="w-full p-2.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] font-medium text-[#102A2A] focus:bg-white focus:border-[#008F72] outline-none transition"
                  />
                </div>

                {(logoPreview || logoInputUrl || user.sellerProfile.logoUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null)
                      setLogoInputUrl('')
                    }}
                    className="text-red-600 hover:text-red-700 font-bold inline-flex items-center gap-1 text-[11px] transition"
                  >
                    <Trash2 size={12} />
                    <span>Supprimer le logo</span>
                  </button>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#E5EEEB] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBrandingModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-[#DCE8E3] text-[#60716F] font-bold hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleSaveBranding()}
                disabled={isSavingBranding || isCompressingBanner || isCompressingLogo}
                className="px-4 py-2 rounded-xl bg-[#006B55] text-white font-bold hover:bg-[#005544] transition disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isSavingBranding ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Enregistrement…</span>
                  </>
                ) : (
                  <span>Enregistrer la vitrine</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function AdminUserDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center space-y-3">
          <div className="mx-auto w-8 h-8 rounded-full border-2 border-[#006B55] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[#60716F]">
            Chargement complet de la fiche utilisateur…
          </p>
        </div>
      }
    >
      <AdminUserDetailsContent />
    </Suspense>
  )
}
