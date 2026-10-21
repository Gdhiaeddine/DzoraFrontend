'use client'

import React, { useState, useEffect, useCallback, useId } from 'react'
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
  Filter,
} from 'lucide-react'
import { api, AdminUserItem, AdminUserDetails } from '@/lib/api'

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
  })
}

export default function AdminUtilisateursPage() {
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({
    sellers: true,
    catalog: true,
    finance: true,
    support: true,
    admin: true,
  })

  // Data states
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCustomers: 0,
    sellersCount: 0,
    twoFaCount: 0,
  })

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filters state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  // Selected User Modal (Inspection)
  const [inspectUser, setInspectUser] = useState<AdminUserDetails | null>(null)
  const [isInspectLoading, setIsInspectLoading] = useState(false)

  // Action Confirmation Modal (Status toggle)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    user: AdminUserItem
    targetStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  } | null>(null)
  const [isActionSubmitting, setIsActionSubmitting] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Fetch real users from backend API
  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const res = await api.admin.getUsers({
        page,
        limit: 15,
        search: debouncedSearch.trim() || undefined,
        role: selectedRole !== 'ALL' ? selectedRole : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      })

      setUsers(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
      setStats(res.stats)
    } catch (err: any) {
      console.warn('Failed to fetch admin users:', err)
      if (err?.statusCode === 403) {
        setToastMessage('Accès restreint. Privilèges administrateur requis.')
      } else {
        setToastMessage(err.message || 'Erreur lors du chargement des utilisateurs réels.')
      }
      window.setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, debouncedSearch, selectedRole, selectedStatus])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Open User Details
  const handleInspectUser = async (user: AdminUserItem) => {
    setIsInspectLoading(true)
    setInspectUser(user)
    try {
      const fullDetails = await api.admin.getUserById(user.id)
      setInspectUser(fullDetails)
    } catch (err) {
      console.warn('Could not load extra user details, fallback to summary', err)
    } finally {
      setIsInspectLoading(false)
    }
  }

  // Execute User Status Change
  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return
    setIsActionSubmitting(true)

    try {
      await api.admin.updateUserStatus(
        pendingStatusChange.user.id,
        pendingStatusChange.targetStatus,
        `Modification administrative : ${pendingStatusChange.targetStatus}`
      )

      setToastMessage(
        `Le statut de « ${pendingStatusChange.user.fullName} » a été mis à jour avec succès.`
      )
      window.setTimeout(() => setToastMessage(null), 3000)
      setPendingStatusChange(null)
      fetchUsers(true)
    } catch (err: any) {
      setToastMessage(err.message || 'Impossible de mettre à jour le statut.')
      window.setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setIsActionSubmitting(false)
    }
  }

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


      {/* --- Main Dashboard Content Area (Full Width) --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
          {/* Main Heading & Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#60716F] mb-1">
                <Link href="/admin/dashboard" className="hover:text-[#006B55] transition">
                  Tableau de bord
                </Link>
                <ChevronRight size={12} className="text-[#94A4A0]" />
                <span className="text-[#102A2A] font-semibold">Utilisateurs</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                Gestion des Utilisateurs
              </h1>
              <p className="text-xs font-medium text-[#60716F] mt-0.5">
                Données réelles des comptes enregistrés sur Dzora Marketplace
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4]">
                <Users size={14} />
                <span>{stats.totalUsers} comptes au total</span>
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ROW 1: REAL KPIS CARDS (Full Width 4 Cols)                */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Utilisateurs */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#60716F]">Total Utilisateurs</span>
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                  {stats.totalUsers}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                  <span>Comptes enregistrés en base</span>
                </div>
              </div>
            </div>

            {/* Card 2: Clients Actifs */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#60716F]">Clients Actifs</span>
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                  {stats.activeCustomers}
                </div>
                <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                  Clients éligibles aux commandes
                </p>
              </div>
            </div>

            {/* Card 3: Vendeurs Dzora */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#60716F]">Vendeurs Dzora</span>
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <Store className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                  {stats.sellersCount}
                </div>
                <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                  Boutiques et équipes vendeurs
                </p>
              </div>
            </div>

            {/* Card 4: Sécurité 2FA */}
            <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#60716F]">Comptes 2FA Actifs</span>
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                  {stats.twoFaCount}
                </div>
                <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                  Sécurisés par double facteur
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ROW 2: FILTERS & CONTROLS TOOLBAR                         */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-4 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Role filter (Excluding Courier) */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-[#60716F]">Rôle :</span>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value)
                    setPage(1)
                  }}
                  className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value="CUSTOMER">Client</option>
                  <option value="SELLER">Vendeur</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-[#60716F]">Statut :</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    setPage(1)
                  }}
                  className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="SUSPENDED">Suspendu</option>
                  <option value="BANNED">Banni</option>
                </select>
              </div>

              {/* Clear filters if active */}
              {(selectedRole !== 'ALL' || selectedStatus !== 'ALL' || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('ALL')
                    setSelectedStatus('ALL')
                    setSearch('')
                    setPage(1)
                  }}
                  className="text-xs font-bold text-[#006B55] hover:underline px-2 py-1"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-[#60716F] text-right">
              Affichage de {users.length} sur {total} utilisateur{total > 1 ? 's' : ''}
            </div>
          </div>

          {/* ========================================================= */}
          {/* ROW 3: USERS TABLE (Full Width)                           */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <div className="mx-auto w-8 h-8 rounded-full border-2 border-[#006B55] border-t-transparent animate-spin" />
                <p className="text-xs font-semibold text-[#60716F]">
                  Chargement des utilisateurs réels en base…
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#E7F2EF] text-[#006B55] grid place-items-center">
                  <Users size={24} />
                </div>
                <h3 className="text-base font-bold text-[#102A2A]">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-xs text-[#71827D] max-w-sm mx-auto">
                  Aucun compte ne correspond à vos critères de recherche actuels.
                </p>
                {(search || selectedRole !== 'ALL' || selectedStatus !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setSelectedRole('ALL')
                      setSelectedStatus('ALL')
                      setPage(1)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005544] transition"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5EEEB] bg-[#F7FAF9] text-[11px] font-bold text-[#71827D] uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Utilisateur</th>
                      <th className="py-3 px-4 font-bold">Contact</th>
                      <th className="py-3 px-4 font-bold">Rôles</th>
                      <th className="py-3 px-4 font-bold">Sécurité</th>
                      <th className="py-3 px-4 font-bold">Statut</th>
                      <th className="py-3 px-4 font-bold">Inscrit le</th>
                      <th className="py-3 px-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EEEB]">
                    {users.map((u) => {
                      const isCustomer = u.roles.includes('CUSTOMER')
                      const isSeller = u.roles.includes('SELLER') || u.roles.includes('SELLER_STAFF')
                      const isAdmin = u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN')

                      return (
                        <tr key={u.id} className="hover:bg-[#F9FCFA] transition">
                          {/* User Avatar + Full Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4] flex items-center justify-center font-extrabold text-xs shrink-0">
                                {u.avatarUrl ? (
                                  <img
                                    src={u.avatarUrl}
                                    alt={u.fullName}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  (u.firstName?.[0] || u.phone?.[0] || 'U').toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#102A2A] truncate">
                                  {u.fullName}
                                </div>
                                <div className="text-[10px] text-[#71827D] font-mono truncate">
                                  ID: {u.id.slice(0, 12)}…
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact (Phone + Email) */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              {u.phone ? (
                                <div className="flex items-center gap-1.5 font-bold text-[#102A2A] font-mono">
                                  <Phone size={12} className="text-[#006B55]" />
                                  <span>{formatPhoneDisplay(u.phone)}</span>
                                </div>
                              ) : (
                                <span className="text-[#9CAFA9] italic">Pas de numéro</span>
                              )}
                              {u.email && (
                                <div className="flex items-center gap-1.5 text-[11px] text-[#60716F]">
                                  <Mail size={11} className="text-[#71827D]" />
                                  <span className="truncate max-w-[180px]">{u.email}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Roles */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-1">
                              {isAdmin && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                                  Admin
                                </span>
                              )}
                              {isSeller && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                                  Vendeur
                                </span>
                              )}
                              {isCustomer && !isAdmin && !isSeller && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4FAF7] text-[#4A5D58] border border-[#DCE8E3]">
                                  Client
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Security / 2FA */}
                          <td className="py-3.5 px-4">
                            {u.twoFactorEnabled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                                <ShieldCheck size={11} />
                                <span>2FA Actif</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7FAF9] text-[#71827D] border border-[#E5EEEB]">
                                Standard
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {u.status === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                                <span className="size-1.5 rounded-full bg-[#006B55]" />
                                <span>Actif</span>
                              </span>
                            )}
                            {u.status === 'SUSPENDED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                                <span className="size-1.5 rounded-full bg-[#D97706]" />
                                <span>Suspendu</span>
                              </span>
                            )}
                            {u.status === 'BANNED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-600 border border-red-200">
                                <span className="size-1.5 rounded-full bg-red-600" />
                                <span>Banni</span>
                              </span>
                            )}
                          </td>

                          {/* Created date */}
                          <td className="py-3.5 px-4 text-[#60716F] font-mono text-[11px]">
                            {formatDate(u.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect details link */}
                              <Link
                                href={`/admin/dashboard/utilisateurs/${u.id}`}
                                className="p-1.5 rounded-lg text-[#60716F] hover:text-[#006B55] hover:bg-[#E7F2EF] transition"
                                title="Voir la fiche détaillée"
                              >
                                <Eye size={15} />
                              </Link>

                              {/* Status Toggle Button */}
                              {u.status === 'ACTIVE' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingStatusChange({
                                      user: u,
                                      targetStatus: 'SUSPENDED',
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg text-[11px] font-bold text-[#D97706] hover:bg-[#FFF6E7] transition"
                                  title="Suspendre le compte"
                                >
                                  Suspendre
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingStatusChange({
                                      user: u,
                                      targetStatus: 'ACTIVE',
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg text-[11px] font-bold text-[#006B55] hover:bg-[#E7F2EF] transition"
                                  title="Réactiver le compte"
                                >
                                  Réactiver
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#E5EEEB] flex items-center justify-between text-xs">
                <span className="text-[#60716F] font-medium">
                  Page <strong className="text-[#102A2A]">{page}</strong> sur{' '}
                  <strong className="text-[#102A2A]">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg border border-[#DCE8E3] bg-white font-bold text-[#102A2A] hover:bg-[#F4FAF7] disabled:opacity-40 transition"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg border border-[#DCE8E3] bg-white font-bold text-[#102A2A] hover:bg-[#F4FAF7] disabled:opacity-40 transition"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

      {/* ========================================================= */}
      {/* 3. USER DETAILS INSPECTION MODAL                          */}
      {/* ========================================================= */}
      {inspectUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-5">
            <div className="flex items-start justify-between border-b border-[#E5EEEB] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4] flex items-center justify-center font-extrabold text-sm shrink-0">
                  {inspectUser.avatarUrl ? (
                    <img
                      src={inspectUser.avatarUrl}
                      alt={inspectUser.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    (inspectUser.firstName?.[0] || inspectUser.phone?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                    {inspectUser.fullName}
                  </h3>
                  <p className="text-[11px] text-[#60716F] font-mono">
                    ID: {inspectUser.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="text-[#94A4A0] hover:text-[#102A2A] p-1.5 rounded-lg hover:bg-[#F4FAF7]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F7FAF9] p-3 rounded-xl border border-[#E5EEEB]">
                <span className="text-[#71827D] block mb-1">Téléphone</span>
                <span className="font-bold text-[#102A2A] font-mono">
                  {formatPhoneDisplay(inspectUser.phone)}
                </span>
              </div>
              <div className="bg-[#F7FAF9] p-3 rounded-xl border border-[#E5EEEB]">
                <span className="text-[#71827D] block mb-1">E-mail</span>
                <span className="font-bold text-[#102A2A] truncate block">
                  {inspectUser.email || 'Non renseigné'}
                </span>
              </div>
              <div className="bg-[#F7FAF9] p-3 rounded-xl border border-[#E5EEEB]">
                <span className="text-[#71827D] block mb-1">Statut du compte</span>
                <span className="font-bold text-[#006B55]">
                  {inspectUser.status}
                </span>
              </div>
              <div className="bg-[#F7FAF9] p-3 rounded-xl border border-[#E5EEEB]">
                <span className="text-[#71827D] block mb-1">Sécurité 2FA</span>
                <span className="font-bold text-[#102A2A]">
                  {inspectUser.twoFactorEnabled ? 'Activée' : 'Désactivée'}
                </span>
              </div>
            </div>

            {/* Seller profile info if seller */}
            {inspectUser.sellerProfile && (
              <div className="bg-[#EDF7F4] p-3.5 rounded-xl border border-[#BBDDD4] text-xs">
                <div className="font-bold text-[#006B55] mb-1">Boutique Vendeur</div>
                <div className="text-[#102A2A]">
                  Nom : <strong>{inspectUser.sellerProfile.storeName}</strong>
                </div>
                <div className="text-[#60716F] text-[11px]">
                  Statut vitrine : {inspectUser.sellerProfile.status}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#E5EEEB] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="px-4 py-2 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005544] transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CONFIRMATION MODAL FOR STATUS CHANGE                   */}
      {/* ========================================================= */}
      {pendingStatusChange && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#DCE8E3] space-y-4">
            <div className="flex items-center gap-2.5 text-[#006B55]">
              <ShieldAlert className="h-5 w-5 text-[#D97706]" />
              <h3 className="text-sm font-extrabold text-[#102A2A] font-display">
                Confirmation d’action
              </h3>
            </div>
            <p className="text-xs text-[#4A5D58] leading-relaxed">
              Êtes-vous sûr de vouloir passer le compte de{' '}
              <strong className="text-[#102A2A]">
                {pendingStatusChange.user.fullName}
              </strong>{' '}
              au statut{' '}
              <strong className="text-[#006B55]">
                {pendingStatusChange.targetStatus}
              </strong>{' '}
              ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                disabled={isActionSubmitting}
                className="px-3.5 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isActionSubmitting}
                className="px-4 py-2 rounded-xl bg-[#006B55] text-white text-xs font-bold hover:bg-[#005544] transition disabled:opacity-50"
              >
                {isActionSubmitting ? 'Traitement…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
