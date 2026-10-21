'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'

// ================= KPI DATA =================
const KPI_METRICS = [
  {
    id: 'users',
    label: 'Utilisateurs',
    value: '12 540',
    trend: '+12,4 % ce mois-ci',
    trendPositive: true,
    icon: Users,
  },
  {
    id: 'sellers',
    label: 'Vendeurs',
    value: '1 240',
    subtext: '1 108 actifs · 87 en attente · 45 suspendus',
    icon: Store,
  },
  {
    id: 'orders',
    label: 'Commandes',
    value: '342 aujourd’hui',
    subtext: '8 421 ce mois-ci',
    icon: ShoppingBag,
  },
  {
    id: 'gmv',
    label: 'GMV',
    value: '45 240 000 DA',
    trend: '+18,2 %',
    trendPositive: true,
    icon: CreditCard,
  },
]

// Sample Chart points for GMV (30 days curve)
const GMV_CHART_POINTS = [
  { day: '08 Sep', value: 28 },
  { day: '12 Sep', value: 31 },
  { day: '16 Sep', value: 29 },
  { day: '20 Sep', value: 36 },
  { day: '24 Sep', value: 34 },
  { day: '28 Sep', value: 41 },
  { day: '02 Oct', value: 39 },
  { day: '06 Oct', value: 45.24 },
]

export default function AdminDashboardPage() {
  // Mobile sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Collapsible sidebar navigation groups
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({
    sellers: false,
    catalog: true,
    finance: true,
    support: true,
    admin: true,
  })

  // Period filter state
  const [selectedPeriod, setSelectedPeriod] = useState('30 derniers jours')

  // Expanded order detail state
  const [expandedOrder, setExpandedOrder] = useState<string | null>('#DZ-10482')

  // Action confirmation modal
  const [modalAction, setModalAction] = useState<{
    type: 'approve' | 'reject' | 'request_info' | 'export'
    target?: string
  } | null>(null)

  // Help modal state
  const [helpOpen, setHelpOpen] = useState(false)

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      {/* --- Main Dashboard Content Area --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
          {/* Main Heading & Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                Bonjour, Ahmed 👋
              </h1>
              <p className="text-xs font-medium text-[#60716F] mt-1">
                Vue globale de votre marketplace
              </p>
            </div>

            {/* Right Date Selector & Export Button */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {/* Date Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none bg-white border border-[#DCE8E3] text-xs font-bold text-[#102A2A] py-2 pl-3.5 pr-8.5 rounded-xl shadow-[0_1px_4px_rgba(16,42,42,0.03)] hover:border-[#008F72] focus:outline-none focus:ring-2 focus:ring-[#006B55]/20 cursor-pointer transition"
                >
                  <option value="7 derniers jours">7 derniers jours</option>
                  <option value="30 derniers jours">30 derniers jours</option>
                  <option value="90 derniers jours">90 derniers jours</option>
                  <option value="Cette année">Cette année (2026)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71827D] pointer-events-none" />
              </div>

              {/* Export Report Button */}
              <button
                type="button"
                onClick={() => setModalAction({ type: 'export' })}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F4FAF7] border border-[#DCE8E3] rounded-xl text-xs font-bold text-[#102A2A] shadow-[0_1px_4px_rgba(16,42,42,0.03)] transition active:scale-[0.98] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#006B55]" />
                <span>Exporter le rapport</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ROW 1: FOUR COMPACT KPI CARDS                             */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI_METRICS.map((kpi) => {
              const IconComp = kpi.icon
              return (
                <div
                  key={kpi.id}
                  className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] hover:shadow-[0_4px_16px_rgba(0,107,85,0.06)] transition duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#60716F]">
                      {kpi.label}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                      <IconComp className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                      {kpi.value}
                    </div>
                    {kpi.trend ? (
                      <div className="mt-1.5 flex items-center gap-1 text-[11.5px] font-extrabold text-[#006B55]">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        <span>{kpi.trend}</span>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[11px] font-medium text-[#71827D] leading-tight">
                        {kpi.subtext}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ========================================================= */}
          {/* ROW 2: MIDDLE ROW (ÉVOLUTION DU GMV & REVENUS DZORA)       */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Évolution du GMV (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xs font-bold text-[#71827D] uppercase tracking-wider">
                    Évolution du GMV
                  </h2>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display mt-0.5 tracking-[-0.035em]">
                    45 240 000 DA
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3 py-1.5 rounded-xl border border-[#BBDDD4]">
                  <Calendar className="h-3.5 w-3.5 text-[#006B55]" />
                  <span>30 derniers jours</span>
                </div>
              </div>

              {/* Responsive Emerald SVG Area Chart */}
              <div className="relative w-full h-52 sm:h-56 mt-2">
                <svg
                  viewBox="0 0 600 200"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  aria-label="Graphique d'évolution du GMV"
                >
                  <defs>
                    <linearGradient id="dzoraGmvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5CE1B6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#006B55" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide Lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#E5EEEB" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#E5EEEB" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="#E5EEEB" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="190" x2="600" y2="190" stroke="#DCE8E3" strokeWidth="1" />

                  {/* Gradient Area Fill */}
                  <path
                    d="M 0 160 Q 80 140, 160 150 T 320 110 T 480 80 T 600 40 L 600 190 L 0 190 Z"
                    fill="url(#dzoraGmvGrad)"
                  />

                  {/* Main Line Stroke */}
                  <path
                    d="M 0 160 Q 80 140, 160 150 T 320 110 T 480 80 T 600 40"
                    fill="none"
                    stroke="#006B55"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Latest point highlight */}
                  <circle cx="600" cy="40" r="5.5" fill="#006B55" stroke="white" strokeWidth="3" />
                </svg>

                {/* X-axis Date Labels */}
                <div className="flex justify-between text-[11px] text-[#71827D] mt-2 font-medium">
                  {GMV_CHART_POINTS.map((pt, idx) => (
                    <span key={idx}>{pt.day}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5EEEB] flex items-center justify-between text-[11px] text-[#71827D]">
                <span>* Données de prévisualisation analytique agrégées.</span>
                <span className="text-[#006B55] font-extrabold">+18,2 % vs période précédente</span>
              </div>
            </div>

            {/* Card 2: Revenus Dzora (1/3 width) */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#71827D] uppercase tracking-wider">
                  Revenus Dzora
                </h2>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display mt-0.5 tracking-[-0.035em]">
                  2 379 600 DA
                </div>
                <p className="text-[11px] font-medium text-[#71827D] mt-0.5">
                  Revenu net de la plateforme ce mois-ci
                </p>

                {/* Proportional Segmented Bar */}
                <div className="h-3 w-full bg-[#E5EEEB] rounded-full overflow-hidden flex my-5">
                  <div style={{ width: '76%' }} className="bg-[#006B55] h-full" title="Commissions (76%)" />
                  <div style={{ width: '18%' }} className="bg-[#2BB688] h-full" title="Abonnements (18%)" />
                  <div style={{ width: '6%' }} className="bg-[#F28C28] h-full" title="Publicités (6%)" />
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#006B55]" />
                      <span className="font-bold text-[#102A2A]">Commissions</span>
                    </div>
                    <span className="font-bold text-[#006B55] font-mono">1 809 600 DA</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2BB688]" />
                      <span className="font-bold text-[#102A2A]">Abonnements</span>
                    </div>
                    <span className="font-bold text-[#102A2A] font-mono">420 000 DA</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7FAF9] border border-[#E5EEEB]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F28C28]" />
                      <span className="font-bold text-[#102A2A]">Publicités</span>
                    </div>
                    <span className="font-bold text-[#102A2A] font-mono">150 000 DA</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5EEEB] text-[11px] text-[#71827D] flex items-center justify-between">
                <span>Part nette du GMV</span>
                <span className="font-bold text-[#102A2A]">~ 5,26 %</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ROW 3: BOTTOM ROW (THREE ACTIONABLE CARDS)                */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Commandes récentes */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-sm font-extrabold text-[#102A2A] font-display">
                    Commandes récentes
                  </h2>
                  <span className="text-[10px] font-bold text-[#006B55] bg-[#E7F2EF] px-2.5 py-0.5 rounded-full border border-[#BBDDD4]">
                    Aujourd’hui
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5EEEB] text-[11px] font-bold text-[#71827D] uppercase">
                        <th className="pb-2.5 font-bold">Commande</th>
                        <th className="pb-2.5 font-bold">Montant</th>
                        <th className="pb-2.5 font-bold">Statut</th>
                        <th className="pb-2.5 text-right font-bold">Détails</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EEEB]">
                      {/* Row 1: #DZ-10482 (Expandable) */}
                      <tr className="group hover:bg-[#F7FAF9] transition">
                        <td className="py-3 font-bold text-[#102A2A]">#DZ-10482</td>
                        <td className="py-3 font-bold text-[#102A2A] font-mono">12 500 DA</td>
                        <td className="py-3">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                            À traiter
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrder(
                                expandedOrder === '#DZ-10482' ? null : '#DZ-10482'
                              )
                            }
                            className="p-1 text-[#71827D] hover:text-[#006B55] transition"
                            aria-label="Afficher la décomposition"
                          >
                            {expandedOrder === '#DZ-10482' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Breakdown Row */}
                      {expandedOrder === '#DZ-10482' && (
                        <tr>
                          <td colSpan={4} className="pb-3 pt-1 px-1">
                            <div className="bg-[#EDF7F4] border border-[#BBDDD4] rounded-xl p-3 text-[11px] space-y-1.5 text-[#006B55]">
                              <div className="flex justify-between">
                                <span className="text-[#4A5D58] font-medium">Commission Dzora</span>
                                <span className="font-bold font-mono">500 DA</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#4A5D58] font-medium">Montant vendeur</span>
                                <span className="font-bold font-mono">12 000 DA</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Row 2: #DZ-10481 */}
                      <tr className="hover:bg-[#F7FAF9] transition">
                        <td className="py-3 font-bold text-[#102A2A]">#DZ-10481</td>
                        <td className="py-3 font-bold text-[#102A2A] font-mono">7 990 DA</td>
                        <td className="py-3">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                            Paiement confirmé
                          </span>
                        </td>
                        <td className="py-3 text-right text-[#9CAFA9]">—</td>
                      </tr>

                      {/* Row 3: #DZ-10480 */}
                      <tr className="hover:bg-[#F7FAF9] transition">
                        <td className="py-3 font-bold text-[#102A2A]">#DZ-10480</td>
                        <td className="py-3 font-bold text-[#102A2A] font-mono">4 990 DA</td>
                        <td className="py-3">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#EDF7F4] text-[#008F72] border border-[#CCE2DB]">
                            Expédiée
                          </span>
                        </td>
                        <td className="py-3 text-right text-[#9CAFA9]">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5EEEB] text-right">
                <Link
                  href="/admin/dashboard/commandes"
                  className="text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline cursor-pointer transition inline-block"
                >
                  Toutes les commandes →
                </Link>
              </div>
            </div>

            {/* Card 2: Vendeurs récents */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-sm font-extrabold text-[#102A2A] font-display">
                    Vendeurs récents
                  </h2>
                  <span className="text-[10px] font-bold text-[#71827D] bg-[#F7FAF9] px-2.5 py-0.5 rounded-full border border-[#DCE8E3]">
                    Activité
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Vendor 1 */}
                  <div className="p-3 rounded-xl border border-[#DCE8E3] hover:border-[#BBDDD4] bg-[#F7FAF9] flex items-center justify-between transition">
                    <div>
                      <div className="font-bold text-[#102A2A]">ABC Store</div>
                      <div className="text-[11px] text-[#60716F] mt-0.5">
                        Physique · <span className="font-bold text-[#006B55]">PRO</span> · 124 commandes
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                      Vérifié
                    </span>
                  </div>

                  {/* Vendor 2 */}
                  <div className="p-3 rounded-xl border border-[#DCE8E3] hover:border-[#BBDDD4] bg-[#F7FAF9] flex items-center justify-between transition">
                    <div>
                      <div className="font-bold text-[#102A2A]">Tech DZ</div>
                      <div className="text-[11px] text-[#60716F] mt-0.5">
                        E-commerce · Basic · 42 commandes
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                      Vérifié
                    </span>
                  </div>

                  {/* Vendor 3 */}
                  <div className="p-3 rounded-xl border border-[#DCE8E3] hover:border-[#BBDDD4] bg-[#F7FAF9] flex items-center justify-between transition">
                    <div>
                      <div className="font-bold text-[#102A2A]">Fashion Sétif</div>
                      <div className="text-[11px] text-[#60716F] mt-0.5">
                        Physique · FREE · 8 commandes
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FFF6E7] text-[#D97706] border border-[#FDE68A]">
                      À vérifier
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5EEEB] text-right">
                <button
                  type="button"
                  className="text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline cursor-pointer transition"
                >
                  Gérer les vendeurs →
                </button>
              </div>
            </div>

            {/* Card 3: Actions en attente */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#102A2A] font-display mb-3.5">
                  Actions en attente
                </h2>

                {/* 3 Prominent Action Chips */}
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF6E7] border border-[#FDE68A] text-xs font-bold text-[#B45309]">
                    <span>18 Vérifications vendeurs</span>
                    <span className="text-[10px] bg-[#FDE68A] px-2 py-0.5 rounded-full font-extrabold">18</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7FAF9] border border-[#DCE8E3] text-xs font-semibold text-[#4A5D58]">
                    <span>7 Demandes de remboursement</span>
                    <span className="text-[10px] bg-[#E5EEEB] px-2 py-0.5 rounded-full font-extrabold">7</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7FAF9] border border-[#DCE8E3] text-xs font-semibold text-[#4A5D58]">
                    <span>3 Litiges de paiement</span>
                    <span className="text-[10px] bg-[#E5EEEB] px-2 py-0.5 rounded-full font-extrabold">3</span>
                  </div>
                </div>

                {/* Compact Review Item for ABC Store */}
                <div className="p-3.5 rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#102A2A] font-display">Dossier : ABC Store</span>
                    <span className="text-[10px] font-bold text-[#006B55] bg-[#E7F2EF] px-2 py-0.5 rounded-full border border-[#BBDDD4]">
                      Risque · 12 / 100
                    </span>
                  </div>

                  {/* Checklist pills */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#4A5D58]">
                    <div className="flex items-center gap-1.5 text-[#006B55] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Téléphone vérifié</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#006B55] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>E-mail vérifié</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#006B55] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>RC · OCR rapproché</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#006B55] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>NIF vérifié</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#006B55] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Identité vérifiée</span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalAction({ type: 'approve', target: 'ABC Store' })}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-[11px] font-bold transition text-center shadow-xs cursor-pointer"
                    >
                      Approuver
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalAction({ type: 'request_info', target: 'ABC Store' })}
                      className="py-2 px-2.5 rounded-xl bg-white border border-[#DCE8E3] hover:bg-[#F4FAF7] text-[#102A2A] text-[11px] font-bold transition cursor-pointer"
                    >
                      Demander des infos
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalAction({ type: 'reject', target: 'ABC Store' })}
                      className="py-2 px-2.5 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition cursor-pointer"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5EEEB] text-right">
                <button
                  type="button"
                  className="text-xs font-bold text-[#006B55] hover:text-[#005544] hover:underline cursor-pointer transition"
                >
                  Tout traiter →
                </button>
              </div>
            </div>
          </div>

          {/* Discreet Preview Mode Notice */}
          <div className="p-3.5 rounded-xl bg-white border border-[#DCE8E3] text-[11px] text-[#71827D] flex items-center justify-between shadow-[0_1px_4px_rgba(16,42,42,0.02)]">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[#006B55] shrink-0" />
              <span>
                <strong className="text-[#102A2A]">Mode Prévisualisation Dzora Control Center :</strong> Les indicateurs et données affichés correspondent à la maquette de référence et respectent la charte graphique officielle Dzora.
              </span>
            </span>
            <span className="font-mono text-[#9CAFA9] text-[10px]">v1.2.0-admin</span>
          </div>
        </main>

      {/* ========================================================= */}
      {/* 3. CONFIRMATION MODAL FOR SENSITIVE CONTROLS              */}
      {/* ========================================================= */}
      {modalAction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#DCE8E3]">
            <div className="flex items-center gap-2.5 text-[#006B55] mb-3">
              <ShieldAlert className="h-5 w-5 text-[#006B55]" />
              <h3 className="text-sm font-extrabold text-[#102A2A] font-display">
                Confirmation d’action sensible
              </h3>
            </div>
            <p className="text-xs text-[#4A5D58] leading-relaxed">
              {modalAction.type === 'approve' && (
                <>
                  Êtes-vous sûr de vouloir approuver le dossier vendeur pour{' '}
                  <strong className="text-[#102A2A]">{modalAction.target}</strong> ? Cette action sera consignée dans le journal d’audit.
                </>
              )}
              {modalAction.type === 'reject' && (
                <>
                  Êtes-vous sûr de vouloir rejeter le dossier vendeur pour{' '}
                  <strong className="text-[#102A2A]">{modalAction.target}</strong> ? Un motif de rejet devra être notifié.
                </>
              )}
              {modalAction.type === 'request_info' && (
                <>
                  Une demande d’informations complémentaires sera transmise à{' '}
                  <strong className="text-[#102A2A]">{modalAction.target}</strong>.
                </>
              )}
              {modalAction.type === 'export' && (
                <>
                  Le rapport d’activité global (GMV, commandes, commissions) pour la période sélectionnée est prêt à être compilé par le serveur.
                </>
              )}
            </p>
            <div className="mt-3.5 p-2.5 bg-[#F7FAF9] rounded-xl text-[11px] text-[#60716F] border border-[#DCE8E3]">
              <em>Note de sécurité :</em> Action réservée au rôle <strong className="text-[#006B55]">Super Admin</strong>.
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-3.5 py-2 border border-[#DCE8E3] text-[#4A5D58] text-xs font-bold rounded-xl hover:bg-[#F4FAF7] transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-4 py-2 bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. HELP & DOCUMENTATION MODAL                             */}
      {/* ========================================================= */}
      {helpOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE8E3]">
            <div className="flex items-center gap-2.5 text-[#006B55] mb-3">
              <HelpCircle className="h-5 w-5" />
              <h3 className="text-base font-extrabold text-[#102A2A] font-display">
                Centre d’aide & Documentation Admin
              </h3>
            </div>
            <p className="text-xs text-[#4A5D58] leading-relaxed mb-4">
              Bienvenue sur le portail d’administration centralisée Dzora. Toutes les actions sensibles (approbations, remboursements, clôture de comptes) sont protégées par l’authentification à deux facteurs et enregistrées dans les journaux d’audit.
            </p>
            <div className="space-y-2.5 text-xs text-[#102A2A] bg-[#F7FAF9] p-3.5 rounded-xl border border-[#DCE8E3]">
              <p>
                <strong>Supervision SOC :</strong> <span className="text-[#006B55] font-mono">soc@dzora.dz</span>
              </p>
              <p>
                <strong>Support Technique Vendeurs :</strong> <span className="text-[#006B55] font-mono">seller-support@dzora.dz</span>
              </p>
              <p>
                <strong>Documentation API :</strong> <span className="font-mono text-[#60716F]">/api/v1/docs</span>
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="px-4 py-2 bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
