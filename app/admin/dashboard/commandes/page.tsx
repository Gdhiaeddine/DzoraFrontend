'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  XCircle,
  Eye,
  X,
  ChevronDown,
  Phone,
  MapPin,
  Store,
  CreditCard,
  Printer,
  ChevronRight,
  ShieldCheck,
  FileText,
  BadgeCheck,
  ArrowRight,
  Plus,
  ArrowUpRight,
  Send,
  Building,
} from 'lucide-react'
import { getClientOrders, ClientOrder } from '@/lib/client-account'
import { wilayasData } from '@/lib/wilayas'
import { AlgeriaFlag } from '@/components/algeria-flag'

// ================= TYPES =================
export type OrderStatus =
  | 'ALL'
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'DISPUTED'

export interface OrderItem {
  id: string
  name: string
  variant?: string
  price: number
  quantity: number
  image: string
}

export interface AdminOrder {
  orderId: string
  date: string
  createdAt: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'DISPUTED'
  statusLabel: string
  clientName: string
  phone: string
  secondPhone?: string
  email?: string
  wilaya: string
  commune: string
  address: string
  storeName: string
  storeSlug?: string
  deliveryType: 'Livraison à domicile' | 'Point relais (Stop Desk)'
  carrier: 'Yalidine Express' | 'Procolis' | 'ZR Express' | 'Maystro' | 'Coursier Express'
  trackingNumber: string
  deliveryFee: number
  itemsSubtotal: number
  totalAmount: number
  marketplaceFee: number
  netSellerAmount: number
  paymentMethod: 'COD' | 'CIB' | 'BANK'
  paymentMethodLabel: string
  items: OrderItem[]
  notes: string[]
}

// ================= DEMO DATA WITH REALISTIC ALGERIAN MARKETPLACE ORDERS =================
const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    orderId: 'DZ-849204',
    date: '14 oct. 2026, 21:30',
    createdAt: '2026-10-14T20:30:00Z',
    status: 'PENDING',
    statusLabel: 'En attente de validation',
    clientName: 'Mohamed Benali',
    phone: '0550 12 34 56',
    secondPhone: '0770 98 76 54',
    email: 'mohamed.benali@dzora.dz',
    wilaya: '09 - Blida',
    commune: 'Blida Centre',
    address: 'Rue de la Liberté, Bâtiment C, N° 14',
    storeName: 'Techno Blida',
    storeSlug: 'techno-blida',
    deliveryType: 'Livraison à domicile',
    carrier: 'Yalidine Express',
    trackingNumber: 'YAL-849204-BLD',
    deliveryFee: 350,
    itemsSubtotal: 38980,
    totalAmount: 39330,
    marketplaceFee: 2728,
    netSellerAmount: 36252,
    paymentMethod: 'COD',
    paymentMethodLabel: 'Cash à la livraison (COD)',
    items: [
      {
        id: 'samsung-a15',
        name: 'Samsung Galaxy A15 128 Go',
        variant: 'Bleu nuit · 4 Go RAM',
        price: 34990,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80',
      },
      {
        id: 'tws-earbuds',
        name: 'Écouteurs Bluetooth TWS Sans fil',
        variant: 'Boîtier de charge blanc',
        price: 3990,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=300&q=80',
      },
    ],
    notes: ['Client régulier de Blida. Confirmer par téléphone avant 12h.'],
  },
  {
    orderId: 'DZ-792105',
    date: '14 oct. 2026, 18:15',
    createdAt: '2026-10-14T17:15:00Z',
    status: 'CONFIRMED',
    statusLabel: 'En préparation boutique',
    clientName: 'Amina Mansouri',
    phone: '0661 45 89 20',
    email: 'amina.m@gmail.com',
    wilaya: '16 - Alger',
    commune: 'Hydra',
    address: 'Résidence les Pins, Bât. 4, Étage 2',
    storeName: 'Dzora Mode & Style',
    deliveryType: 'Livraison à domicile',
    carrier: 'Procolis',
    trackingNumber: 'PRO-792105-ALG',
    deliveryFee: 400,
    itemsSubtotal: 18500,
    totalAmount: 18900,
    marketplaceFee: 1295,
    netSellerAmount: 17205,
    paymentMethod: 'CIB',
    paymentMethodLabel: 'Carte CIB / Edahabia',
    items: [
      {
        id: 'robe-karakou',
        name: 'Karakou Moderne Brodé Fait Main',
        variant: 'Velours Royal Noir · Taille 40',
        price: 18500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=300&q=80',
      },
    ],
    notes: ['Paiement CIB validé en ligne avec succès via SATIM.'],
  },
  {
    orderId: 'DZ-754890',
    date: '13 oct. 2026, 14:40',
    createdAt: '2026-10-13T13:40:00Z',
    status: 'SHIPPED',
    statusLabel: 'En cours d’acheminement',
    clientName: 'Karim Belkacem',
    phone: '0555 78 12 34',
    secondPhone: '0550 44 22 11',
    wilaya: '31 - Oran',
    commune: 'Es-Senia',
    address: 'Cité 500 logements, En face université',
    storeName: 'El Bahia Tech',
    deliveryType: 'Point relais (Stop Desk)',
    carrier: 'Yalidine Express',
    trackingNumber: 'YAL-754890-ORN',
    deliveryFee: 300,
    itemsSubtotal: 65000,
    totalAmount: 65300,
    marketplaceFee: 4550,
    netSellerAmount: 60450,
    paymentMethod: 'COD',
    paymentMethodLabel: 'Cash à la livraison (COD)',
    items: [
      {
        id: 'laptop-hp',
        name: 'PC Portable HP ProBook 450 G9',
        variant: 'Core i5 12th · 16 Go · 512 Go SSD',
        price: 65000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80',
      },
    ],
    notes: ['Déposé au hub Yalidine Oran Es-Senia ce matin à 09:30.'],
  },
  {
    orderId: 'DZ-691230',
    date: '12 oct. 2026, 11:20',
    createdAt: '2026-10-12T10:20:00Z',
    status: 'DELIVERED',
    statusLabel: 'Livrée avec succès',
    clientName: 'Fatima Zohra Chikh',
    phone: '0770 12 90 88',
    wilaya: '25 - Constantine',
    commune: 'Sidi Mabrouk',
    address: 'Avenue de la Soummam, N° 28',
    storeName: 'Cirta Électronique',
    deliveryType: 'Livraison à domicile',
    carrier: 'ZR Express',
    trackingNumber: 'ZR-691230-CST',
    deliveryFee: 450,
    itemsSubtotal: 12800,
    totalAmount: 13250,
    marketplaceFee: 896,
    netSellerAmount: 11904,
    paymentMethod: 'COD',
    paymentMethodLabel: 'Cash à la livraison (COD)',
    items: [
      {
        id: 'airfryer-philips',
        name: 'Friteuse Sans Huile Airfryer XL 4.1L',
        variant: 'Noir Laqué · 1400W',
        price: 12800,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=300&q=80',
      },
    ],
    notes: ['Livraison réussie le 14/10 à 10:15. Montant COD 13 250 DA encaissé par le coursier.'],
  },
  {
    orderId: 'DZ-630981',
    date: '11 oct. 2026, 16:55',
    createdAt: '2026-10-11T15:55:00Z',
    status: 'DELIVERED',
    statusLabel: 'Livrée avec succès',
    clientName: 'Youcef Khelifa',
    phone: '0670 33 44 55',
    wilaya: '19 - Sétif',
    commune: 'El Eulma',
    address: 'Boulevard Commercial Dubai, Magasin 42',
    storeName: 'Fashion Sétif',
    deliveryType: 'Livraison à domicile',
    carrier: 'Maystro',
    trackingNumber: 'MAY-630981-STF',
    deliveryFee: 450,
    itemsSubtotal: 9400,
    totalAmount: 9850,
    marketplaceFee: 658,
    netSellerAmount: 8742,
    paymentMethod: 'CIB',
    paymentMethodLabel: 'Carte CIB / Edahabia',
    items: [
      {
        id: 'basket-running',
        name: 'Chaussures Running Confort Aéré',
        variant: 'Gris / Orange · Pointure 43',
        price: 9400,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
      },
    ],
    notes: ['Paiement électronique en ligne. Livraison confirmée par SMS client.'],
  },
  {
    orderId: 'DZ-582109',
    date: '10 oct. 2026, 09:10',
    createdAt: '2026-10-10T08:10:00Z',
    status: 'CANCELLED',
    statusLabel: 'Annulée par le client',
    clientName: 'Nadia Hamidi',
    phone: '0560 99 88 77',
    wilaya: '23 - Annaba',
    commune: 'Plaine Ouest',
    address: 'Bâtiment 12, Escalier B',
    storeName: 'Bône Multimédia',
    deliveryType: 'Livraison à domicile',
    carrier: 'Yalidine Express',
    trackingNumber: 'YAL-582109-ANB',
    deliveryFee: 500,
    itemsSubtotal: 7800,
    totalAmount: 8300,
    marketplaceFee: 0,
    netSellerAmount: 0,
    paymentMethod: 'COD',
    paymentMethodLabel: 'Cash à la livraison (COD)',
    items: [
      {
        id: 'mouse-wireless',
        name: 'Souris Ergonomique Sans Fil Silencieuse',
        variant: 'Noir mat · Bluetooth & 2.4G',
        price: 7800,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80',
      },
    ],
    notes: ['Annulation demandée avant expédition : doublon de commande par le client.'],
  },
  {
    orderId: 'DZ-519842',
    date: '09 oct. 2026, 17:35',
    createdAt: '2026-10-09T16:35:00Z',
    status: 'DISPUTED',
    statusLabel: 'Litige / Retour en cours',
    clientName: 'Walid Boualem',
    phone: '0550 31 62 73',
    wilaya: '30 - Ouargla',
    commune: 'Hassi Messaoud',
    address: 'Base de vie SONATRACH, Bloc 14',
    storeName: 'Sahara Mobile',
    deliveryType: 'Point relais (Stop Desk)',
    carrier: 'Yalidine Express',
    trackingNumber: 'YAL-519842-ORG',
    deliveryFee: 450,
    itemsSubtotal: 24500,
    totalAmount: 24950,
    marketplaceFee: 1715,
    netSellerAmount: 22785,
    paymentMethod: 'COD',
    paymentMethodLabel: 'Cash à la livraison (COD)',
    items: [
      {
        id: 'montre-xiaomi',
        name: 'Smartwatch AMOLED GPS Tracker Étanche',
        variant: 'Bracelet Titane Noir',
        price: 24500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
      },
    ],
    notes: ['Client signale que la boîte était légèrement endommagée lors du retrait. En attente de médiation Dzora.'],
  },
]

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ADMIN_ORDERS)
  const [selectedStatusTab, setSelectedStatusTab] = useState<OrderStatus>('ALL')

  // Search and Filtering States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWilaya, setSelectedWilaya] = useState('ALL')
  const [selectedPayment, setSelectedPayment] = useState<'ALL' | 'COD' | 'CIB'>('ALL')
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'ALL' | 'home' | 'desk'>('ALL')

  // Modals
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<AdminOrder | null>(null)
  const [shippingLabelOrder, setShippingLabelOrder] = useState<AdminOrder | null>(null)

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Internal note field in modal
  const [newNoteText, setNewNoteText] = useState('')

  // Sync client orders from localStorage / sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const clientOrders = getClientOrders()
      if (clientOrders && clientOrders.length > 0) {
        // Merge customer orders seamlessly into the admin orders table
        const formattedClientOrders: AdminOrder[] = clientOrders.map((co) => ({
          orderId: co.orderId,
          date: co.date,
          createdAt: new Date().toISOString(),
          status: co.status,
          statusLabel: co.statusLabel,
          clientName: co.clientName,
          phone: co.phone,
          wilaya: co.wilaya,
          commune: co.commune,
          address: co.address,
          storeName: 'Techno Blida',
          storeSlug: 'techno-blida',
          deliveryType: co.deliveryType?.includes('relais') || co.deliveryType?.includes('Desk')
            ? 'Point relais (Stop Desk)'
            : 'Livraison à domicile',
          carrier: 'Yalidine Express',
          trackingNumber: `YAL-${co.orderId.replace(/\D/g, '') || '89201'}`,
          deliveryFee: co.deliveryFee || 400,
          itemsSubtotal: (co.totalAmount || 38980) - (co.deliveryFee || 400),
          totalAmount: co.totalAmount || 39330,
          marketplaceFee: Math.round(((co.totalAmount || 39330) * 0.07)),
          netSellerAmount: Math.round(((co.totalAmount || 39330) * 0.93)),
          paymentMethod: co.paymentMethod || 'COD',
          paymentMethodLabel: co.paymentMethodLabel || 'Cash à la livraison (COD)',
          items: [
            {
              id: 'sample-p1',
              name: 'Samsung Galaxy A15 128 Go',
              variant: 'Bleu nuit · 4 Go RAM',
              price: 34990,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80',
            },
          ],
          notes: ['Commande passée depuis le tunnel de checkout client.'],
        }))

        // Prevent duplicates
        setOrders((prev) => {
          const prevIds = new Set(prev.map((o) => o.orderId))
          const newUnique = formattedClientOrders.filter((o) => !prevIds.has(o.orderId))
          return [...newUnique, ...prev]
        })
      }
    } catch {
      // Ignore
    }
  }, [])

  // Filtered orders computation
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (selectedStatusTab !== 'ALL' && order.status !== selectedStatusTab) {
        return false
      }

      // Wilaya filter
      if (selectedWilaya !== 'ALL' && !order.wilaya.includes(selectedWilaya)) {
        return false
      }

      // Payment method filter
      if (selectedPayment !== 'ALL' && order.paymentMethod !== selectedPayment) {
        return false
      }

      // Delivery type filter
      if (selectedDeliveryType === 'home' && order.deliveryType !== 'Livraison à domicile') {
        return false
      }
      if (selectedDeliveryType === 'desk' && order.deliveryType !== 'Point relais (Stop Desk)') {
        return false
      }

      // Search query (Order ID, client name, phone, store)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesId = order.orderId.toLowerCase().includes(q)
        const matchesName = order.clientName.toLowerCase().includes(q)
        const matchesPhone = order.phone.toLowerCase().includes(q)
        const matchesStore = order.storeName.toLowerCase().includes(q)
        const matchesCommune = order.commune.toLowerCase().includes(q)
        if (!matchesId && !matchesName && !matchesPhone && !matchesStore && !matchesCommune) {
          return false
        }
      }

      return true
    })
  }, [orders, selectedStatusTab, selectedWilaya, selectedPayment, selectedDeliveryType, searchQuery])

  // KPIs Calculations
  const stats = useMemo(() => {
    const totalOrders = orders.length
    const gmv = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + o.totalAmount, 0)
    const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length
    const shippedOrders = orders.filter((o) => o.status === 'SHIPPED').length
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length
    const codTotalToCollect = orders
      .filter((o) => o.paymentMethod === 'COD' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + o.totalAmount, 0)
    const deliverySuccessRate =
      totalOrders > 0
        ? Math.round((deliveredOrders / (totalOrders - orders.filter((o) => o.status === 'PENDING').length || 1)) * 100)
        : 100

    return {
      totalOrders,
      gmv,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      codTotalToCollect,
      deliverySuccessRate,
    }
  }, [orders])

  // Status counts for tab badges
  const statusCounts = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING: orders.filter((o) => o.status === 'PENDING').length,
      CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
      SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
      DISPUTED: orders.filter((o) => o.status === 'DISPUTED').length,
    }
  }, [orders])

  // Status Transition Handler
  const handleUpdateOrderStatus = (orderId: string, newStatus: AdminOrder['status']) => {
    const statusLabels: Record<AdminOrder['status'], string> = {
      PENDING: 'En attente de validation',
      CONFIRMED: 'Confirmée par le vendeur',
      SHIPPED: 'Expédiée avec transporteur',
      DELIVERED: 'Livrée avec succès',
      CANCELLED: 'Annulée',
      DISPUTED: 'Litige / Retour en cours',
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          const updated = {
            ...o,
            status: newStatus,
            statusLabel: statusLabels[newStatus],
            notes: [
              `Statut mis à jour en "${statusLabels[newStatus]}" par l'administrateur (${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`,
              ...o.notes,
            ],
          }
          if (selectedOrderDetails?.orderId === orderId) {
            setSelectedOrderDetails(updated)
          }
          return updated
        }
        return o
      })
    )

    setToastMessage(`Statut de la commande ${orderId} mis à jour : ${statusLabels[newStatus]}`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Add internal administrative note
  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedOrderDetails) return
    const noteEntry = `${newNoteText.trim()} (Admin Dzora · ${new Date().toLocaleDateString('fr-FR')})`

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === selectedOrderDetails.orderId) {
          const updated = { ...o, notes: [noteEntry, ...o.notes] }
          setSelectedOrderDetails(updated)
          return updated
        }
        return o
      })
    )
    setNewNoteText('')
    setToastMessage('Note administrative enregistrée.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'N° Commande',
      'Date',
      'Statut',
      'Client',
      'Téléphone',
      'Wilaya',
      'Commune',
      'Adresse',
      'Boutique',
      'Mode Livraison',
      'Transporteur',
      'N° Suivi',
      'Mode Paiement',
      'Sous-total (DA)',
      'Frais Port (DA)',
      'Total (DA)',
    ]

    const rows = filteredOrders.map((o) => [
      o.orderId,
      `"${o.date}"`,
      `"${o.statusLabel}"`,
      `"${o.clientName}"`,
      `"${o.phone}"`,
      `"${o.wilaya}"`,
      `"${o.commune}"`,
      `"${o.address.replace(/"/g, '""')}"`,
      `"${o.storeName}"`,
      `"${o.deliveryType}"`,
      `"${o.carrier}"`,
      `"${o.trackingNumber}"`,
      `"${o.paymentMethodLabel}"`,
      o.itemsSubtotal,
      o.deliveryFee,
      o.totalAmount,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `dzora-commandes-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setToastMessage(`${filteredOrders.length} commandes exportées au format CSV.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const formatPrice = (val: number) => {
    return val.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DA'
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
              <span className="text-[#102A2A] font-semibold">Commandes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
              Gestion des Commandes
            </h1>
            <p className="text-xs font-medium text-[#60716F] mt-0.5">
              Suivi des flux de vente, expéditions 58 wilayas, encaissements COD et règlements CIB en temps réel
            </p>
          </div>

          {/* Quick stats pills & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4]">
              <ShoppingBag size={14} />
              <span>
                {orders.length} commande{orders.length > 1 ? 's' : ''} au total
              </span>
            </span>

            <button
              type="button"
              onClick={() => {
                setToastMessage('Données des commandes actualisées.')
                setTimeout(() => setToastMessage(null), 2500)
              }}
              className="p-2 text-[#4A5D58] hover:text-[#006B55] hover:bg-white rounded-xl border border-[#DCE8E3] transition active:scale-95 cursor-pointer"
              title="Rafraîchir les commandes"
              aria-label="Rafraîchir les données"
            >
              <RefreshCw size={15} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 1: REAL KPIS CARDS (Full Width 4 Cols)                */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Commandes */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Total Commandes</span>
              <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {stats.totalOrders}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#006B55]">
                <span>Flux de commandes enregistrées</span>
              </div>
            </div>
          </div>

          {/* Card 2: Volume d'Affaires GMV */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Volume d’Affaires (GMV)</span>
              <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {formatPrice(stats.gmv)}
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                Hors commandes annulées
              </p>
            </div>
          </div>

          {/* Card 3: En Attente & Urgence */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">À Traiter en Urgence</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF6E7] text-[#D97706] flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#D97706] font-display tracking-[-0.035em]">
                {stats.pendingOrders}
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#71827D]">
                En attente de validation vendeur
              </p>
            </div>
          </div>

          {/* Card 4: Expéditions & Encaissable COD */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] hover:border-[#BBDDD4] transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#60716F]">Fonds COD & Transit</span>
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2A] font-display tracking-[-0.035em]">
                {stats.shippedOrders} <span className="text-sm font-semibold text-[#60716F]">en cours</span>
              </div>
              <p className="mt-1 text-[11px] font-semibold text-[#006B55]">
                {formatPrice(stats.codTotalToCollect)} COD à percevoir
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: ORDER STATUS LIFECYCLE TABS                        */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-2 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)]">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {[
              { id: 'ALL' as OrderStatus, label: 'Toutes les commandes', count: statusCounts.ALL },
              { id: 'PENDING' as OrderStatus, label: 'En attente', count: statusCounts.PENDING, dotColor: 'bg-amber-500' },
              { id: 'CONFIRMED' as OrderStatus, label: 'Confirmées', count: statusCounts.CONFIRMED, dotColor: 'bg-blue-500' },
              { id: 'SHIPPED' as OrderStatus, label: 'Expédiées', count: statusCounts.SHIPPED, dotColor: 'bg-indigo-500' },
              { id: 'DELIVERED' as OrderStatus, label: 'Livrées', count: statusCounts.DELIVERED, dotColor: 'bg-emerald-500' },
              { id: 'CANCELLED' as OrderStatus, label: 'Annulées', count: statusCounts.CANCELLED, dotColor: 'bg-red-500' },
              { id: 'DISPUTED' as OrderStatus, label: 'Litiges', count: statusCounts.DISPUTED, dotColor: 'bg-purple-500' },
            ].map((tab) => {
              const isActive = selectedStatusTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatusTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]'
                      : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
                  }`}
                >
                  {tab.dotColor && <span className={`w-2 h-2 rounded-full ${tab.dotColor}`} />}
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                      isActive ? 'bg-[#006B55] text-white' : 'bg-[#E5EEEB] text-[#4A5D58]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 3: SEARCH & MULTI-FILTERS TOOLBAR                     */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-4 border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A4A0] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par N° DZ, client, tél, boutique…"
                className="w-full pl-9 pr-3 py-1.5 bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl text-xs font-medium text-[#102A2A] placeholder:text-[#71827D] focus:bg-white focus:border-[#008F72] focus:ring-2 focus:ring-[#008F72]/15 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Effacer la recherche"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Wilaya Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Wilaya :</span>
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer max-w-[150px]"
              >
                <option value="ALL">Toutes (58)</option>
                {wilayasData.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Paiement :</span>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value as any)}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
              >
                <option value="ALL">Tous modes</option>
                <option value="COD">Cash (COD)</option>
                <option value="CIB">Carte CIB / Edahabia</option>
              </select>
            </div>

            {/* Delivery Mode Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#60716F]">Livraison :</span>
              <select
                value={selectedDeliveryType}
                onChange={(e) => setSelectedDeliveryType(e.target.value as any)}
                className="bg-[#F7FAF9] border border-[#DCE8E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102A2A] focus:outline-none focus:border-[#008F72] cursor-pointer"
              >
                <option value="ALL">Tous modes</option>
                <option value="home">À domicile</option>
                <option value="desk">Point relais</option>
              </select>
            </div>

            {/* Active Filters Clear */}
            {(searchQuery || selectedWilaya !== 'ALL' || selectedPayment !== 'ALL' || selectedDeliveryType !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedWilaya('ALL')
                  setSelectedPayment('ALL')
                  setSelectedDeliveryType('ALL')
                }}
                className="text-xs font-bold text-[#006B55] hover:underline px-2 py-1 cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-[#60716F] text-right shrink-0">
            Affichage de {filteredOrders.length} sur {orders.length} commande{orders.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 4: ORDERS TABLE (Full Width)                          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#DCE8E3] shadow-[0_2px_10px_rgba(16,42,42,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EEEB] bg-[#F7FAF9] text-[11px] font-bold text-[#71827D] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">N° Commande &amp; Date</th>
                  <th className="py-3 px-4 font-bold">Client &amp; Contact</th>
                  <th className="py-3 px-4 font-bold">Boutique Vendeur</th>
                  <th className="py-3 px-4 font-bold">Articles</th>
                  <th className="py-3 px-4 font-bold">Destination &amp; Transport</th>
                  <th className="py-3 px-4 font-bold">Paiement &amp; Montant</th>
                  <th className="py-3 px-4 font-bold">Statut</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EEEB]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.orderId}
                      className="hover:bg-[#F9FCFA] transition group cursor-default"
                    >
                      {/* 1. N° Commande & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-black text-sm text-[#006B55]">
                          #{order.orderId}
                        </div>
                        <div className="text-[11px] text-[#71827D] mt-0.5">{order.date}</div>
                      </td>

                      {/* 2. Client & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#102A2A]">{order.clientName}</div>
                        <a
                          href={`tel:${order.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#006B55] hover:underline mt-0.5"
                        >
                          <Phone size={10} />
                          <span>{order.phone}</span>
                        </a>
                      </td>

                      {/* 3. Boutique Vendeur */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-[#102A2A]">
                          <Store size={13} className="text-[#006B55]" />
                          <span>{order.storeName}</span>
                        </div>
                        <span className="text-[10px] text-[#71827D] block mt-0.5">Vendeur vérifié</span>
                      </td>

                      {/* 4. Articles */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg border border-[#DCE8E3] overflow-hidden bg-slate-50 shrink-0">
                            <img
                              src={order.items[0]?.image || 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=100&q=80'}
                              alt="Article"
                              className="size-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[#102A2A] line-clamp-1 max-w-[140px]">
                              {order.items[0]?.name || 'Article'}
                            </span>
                            <span className="text-[10.5px] text-[#60716F]">
                              {order.items.length > 1 ? `+${order.items.length - 1} autre(s) article(s)` : `${order.items[0]?.quantity || 1} unité`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Destination & Transport */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#102A2A]">
                          {order.wilaya.split('-')[1]?.trim() || order.wilaya}
                        </div>
                        <div className="text-[10.5px] text-[#60716F] flex items-center gap-1 mt-0.5">
                          <Truck size={11} className="text-[#006B55]" />
                          <span>{order.carrier}</span>
                          <span className="text-[#889994]">·</span>
                          <span>{order.deliveryType === 'Livraison à domicile' ? 'Domicile' : 'Stop Desk'}</span>
                        </div>
                      </td>

                      {/* 6. Paiement & Montant */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-sm text-[#102A2A]">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <div className="mt-0.5">
                          {order.paymentMethod === 'CIB' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                              <CreditCard size={10} />
                              CIB / Edahabia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FAF6E8] text-[#B45309] border border-[#FDE68A]">
                              Cash (COD)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. Statut */}
                      <td className="py-3.5 px-4">
                        {order.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                            En attente
                          </span>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="size-1.5 rounded-full bg-blue-500" />
                            Confirmée
                          </span>
                        )}
                        {order.status === 'SHIPPED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Expédiée
                          </span>
                        )}
                        {order.status === 'DELIVERED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E7F2EF] text-[#006B55] border border-[#BBDDD4]">
                            <span className="size-1.5 rounded-full bg-[#006B55]" />
                            Livrée
                          </span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="size-1.5 rounded-full bg-red-500" />
                            Annulée
                          </span>
                        )}
                        {order.status === 'DISPUTED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <span className="size-1.5 rounded-full bg-purple-500" />
                            Litige
                          </span>
                        )}
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1.5 rounded-lg border border-[#DCE8E3] hover:border-[#006B55] hover:bg-[#E7F2EF] text-[#006B55] transition"
                            title="Voir les détails complets de la commande"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setShippingLabelOrder(order)}
                            className="p-1.5 rounded-lg border border-[#DCE8E3] hover:border-[#006B55] hover:bg-[#E7F2EF] text-[#4A5D58] hover:text-[#006B55] transition"
                            title="Imprimer le bordereau de transporteur"
                          >
                            <Printer size={14} />
                          </button>

                          {/* Quick Status Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value as any)}
                            className="h-7 px-2 text-[10.5px] font-bold rounded-lg border border-[#DCE8E3] bg-[#F7FAF9] focus:bg-white text-[#102A2A] outline-none cursor-pointer"
                          >
                            <option value="PENDING">En attente</option>
                            <option value="CONFIRMED">Confirmer</option>
                            <option value="SHIPPED">Expédier</option>
                            <option value="DELIVERED">Livrée</option>
                            <option value="CANCELLED">Annuler</option>
                            <option value="DISPUTED">Litige</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#60716F]">
                    <ShoppingBag size={32} className="mx-auto text-[#CADBD5] mb-2" />
                    <p className="font-bold text-sm text-[#102A2A]">Aucune commande ne correspond à ces critères</p>
                    <p className="text-xs text-[#71827D] mt-0.5">Essayez de modifier vos filtres ou la recherche.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>

      {/* ========================================================= */}
      {/* 6. ALIEXPRESS ORDER DETAIL MODAL / DRAWER                  */}
      {/* ========================================================= */}
      {selectedOrderDetails && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-[#DCE8E3] animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8F0ED]">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-[#E7F2EF] text-[#006B55] flex items-center justify-center shrink-0 border border-[#BBDDD4]">
                  <ShoppingBag size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-[#102A2A]">
                      Détails de la commande #{selectedOrderDetails.orderId}
                    </h3>
                    <span className="text-xs text-[#71827D]">· {selectedOrderDetails.date}</span>
                  </div>
                  <p className="text-xs text-[#60716F]">
                    Boutique vendeuse : <strong className="text-[#006B55]">{selectedOrderDetails.storeName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 text-[#60716F] hover:text-[#102A2A] rounded-xl hover:bg-[#F4FAF7] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper / Timeline (AliExpress Tracking Stepper) */}
            <div className="p-4 rounded-2xl bg-[#FAFDFB] border border-[#E5EEEB]">
              <div className="flex items-center justify-between text-xs font-bold text-[#102A2A] mb-3">
                <span>Suivi de commande &amp; Expédition</span>
                <span className="text-[11px] font-mono text-[#006B55] bg-white px-2.5 py-0.5 rounded-full border border-[#BBDDD4]">
                  {selectedOrderDetails.carrier} · {selectedOrderDetails.trackingNumber}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* Step 1: Créée */}
                <div className="space-y-1">
                  <div className="size-7 rounded-full bg-[#006B55] text-white mx-auto flex items-center justify-center font-bold text-[11px] shadow-xs">
                    ✓
                  </div>
                  <div className="font-bold text-[#102A2A] text-[11px]">Passée</div>
                  <div className="text-[10px] text-[#71827D]">Commande reçue</div>
                </div>

                {/* Step 2: Confirmée */}
                <div className="space-y-1">
                  <div
                    className={`size-7 rounded-full mx-auto flex items-center justify-center font-bold text-[11px] ${
                      selectedOrderDetails.status !== 'PENDING'
                        ? 'bg-[#006B55] text-white shadow-xs'
                        : 'bg-[#E5EEEB] text-[#71827D]'
                    }`}
                  >
                    {selectedOrderDetails.status !== 'PENDING' ? '✓' : '2'}
                  </div>
                  <div className="font-bold text-[#102A2A] text-[11px]">Préparée</div>
                  <div className="text-[10px] text-[#71827D]">Par le vendeur</div>
                </div>

                {/* Step 3: Expédiée */}
                <div className="space-y-1">
                  <div
                    className={`size-7 rounded-full mx-auto flex items-center justify-center font-bold text-[11px] ${
                      selectedOrderDetails.status === 'SHIPPED' || selectedOrderDetails.status === 'DELIVERED'
                        ? 'bg-[#006B55] text-white shadow-xs'
                        : 'bg-[#E5EEEB] text-[#71827D]'
                    }`}
                  >
                    {selectedOrderDetails.status === 'DELIVERED' ? '✓' : '3'}
                  </div>
                  <div className="font-bold text-[#102A2A] text-[11px]">En transit</div>
                  <div className="text-[10px] text-[#71827D]">Chez le livreur</div>
                </div>

                {/* Step 4: Livrée */}
                <div className="space-y-1">
                  <div
                    className={`size-7 rounded-full mx-auto flex items-center justify-center font-bold text-[11px] ${
                      selectedOrderDetails.status === 'DELIVERED'
                        ? 'bg-[#006B55] text-white shadow-xs'
                        : 'bg-[#E5EEEB] text-[#71827D]'
                    }`}
                  >
                    {selectedOrderDetails.status === 'DELIVERED' ? '✓' : '4'}
                  </div>
                  <div className="font-bold text-[#102A2A] text-[11px]">Livrée</div>
                  <div className="text-[10px] text-[#71827D]">Remise au client</div>
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: Client Address & Carrier Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Box A: Destinataire */}
              <div className="p-4 rounded-2xl border border-[#E5EEEB] bg-[#F7FAF9] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#102A2A] pb-2 border-b border-[#E8F0ED]">
                  <MapPin size={14} className="text-[#006B55]" />
                  <span>Adresse de livraison du client</span>
                </div>
                <div>
                  <div className="font-extrabold text-[#102A2A] text-sm">{selectedOrderDetails.clientName}</div>
                  <div className="font-mono text-[#006B55] mt-0.5">{selectedOrderDetails.phone}</div>
                  {selectedOrderDetails.secondPhone && (
                    <div className="font-mono text-[#71827D] text-[11px]">Tél sec : {selectedOrderDetails.secondPhone}</div>
                  )}
                </div>
                <div className="text-[#4A5D58] pt-1">
                  <strong>{selectedOrderDetails.wilaya}</strong>, {selectedOrderDetails.commune}
                  <p className="text-[11px] text-[#60716F] mt-0.5">{selectedOrderDetails.address}</p>
                </div>
              </div>

              {/* Box B: Logistique & Règlement */}
              <div className="p-4 rounded-2xl border border-[#E5EEEB] bg-[#F7FAF9] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#102A2A] pb-2 border-b border-[#E8F0ED]">
                  <Truck size={14} className="text-[#006B55]" />
                  <span>Expédition &amp; Règlement</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#60716F]">Mode de livraison</span>
                  <span className="font-bold text-[#102A2A]">{selectedOrderDetails.deliveryType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#60716F]">Transporteur partenaire</span>
                  <span className="font-bold text-[#006B55]">{selectedOrderDetails.carrier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#60716F]">Mode de règlement</span>
                  <span className="font-bold text-[#102A2A]">{selectedOrderDetails.paymentMethodLabel}</span>
                </div>
                <div className="pt-2 border-t border-[#E8F0ED] flex justify-between items-center">
                  <span className="text-[#60716F]">Statut actuel</span>
                  <select
                    value={selectedOrderDetails.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails.orderId, e.target.value as any)}
                    className="h-7 px-2 text-xs font-bold rounded-lg border border-[#DCE8E3] bg-white text-[#102A2A] outline-none cursor-pointer"
                  >
                    <option value="PENDING">En attente</option>
                    <option value="CONFIRMED">Confirmée</option>
                    <option value="SHIPPED">Expédiée</option>
                    <option value="DELIVERED">Livrée</option>
                    <option value="CANCELLED">Annulée</option>
                    <option value="DISPUTED">Litige</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Articles Details Table */}
            <div>
              <h4 className="font-display font-extrabold text-xs text-[#102A2A] mb-2.5">
                Articles commandés ({selectedOrderDetails.items.length})
              </h4>
              <div className="border border-[#E5EEEB] rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#FAFDFB] border-b border-[#E5EEEB] text-[#60716F] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Produit</th>
                      <th className="py-2.5 px-3 text-right">Prix unit.</th>
                      <th className="py-2.5 px-3 text-center">Qté</th>
                      <th className="py-2.5 px-3 text-right">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F5F2]">
                    {selectedOrderDetails.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 flex items-center gap-2.5">
                          <img
                            src={it.image}
                            alt={it.name}
                            className="size-9 rounded-lg object-cover border border-[#DCE8E3] shrink-0"
                          />
                          <div>
                            <span className="font-bold text-[#102A2A] block">{it.name}</span>
                            {it.variant && <span className="text-[10.5px] text-[#60716F]">{it.variant}</span>}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#102A2A]">
                          {formatPrice(it.price)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#102A2A]">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#102A2A]">
                          {formatPrice(it.price * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown (AliExpress Seller/Platform Share) */}
            <div className="p-4 rounded-2xl bg-[#F7FAF9] border border-[#E5EEEB] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#60716F]">
                <span>Sous-total articles</span>
                <span className="font-mono text-[#102A2A]">{formatPrice(selectedOrderDetails.itemsSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[#60716F]">
                <span>Frais de livraison ({selectedOrderDetails.wilaya})</span>
                <span className="font-mono text-[#102A2A]">{formatPrice(selectedOrderDetails.deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-center text-[#006B55] font-semibold">
                <span>Commission marketplace Dzora (7 %)</span>
                <span className="font-mono">− {formatPrice(selectedOrderDetails.marketplaceFee)}</span>
              </div>
              <div className="flex justify-between items-center text-[#4A5D58] font-semibold">
                <span>Reversement net boutique vendeur</span>
                <span className="font-mono font-bold">{formatPrice(selectedOrderDetails.netSellerAmount)}</span>
              </div>
              <div className="pt-2 border-t border-[#E5EEEB] flex justify-between items-baseline text-sm font-extrabold text-[#102A2A]">
                <span>Montant total perçu client</span>
                <span className="font-display text-lg text-[#006B55] font-black">
                  {formatPrice(selectedOrderDetails.totalAmount)}
                </span>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2 pt-1">
              <h4 className="font-display font-extrabold text-xs text-[#102A2A]">
                Notes administratives internes
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedOrderDetails.notes.map((n, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-[#FAFDFB] border border-[#E5EEEB] text-[11px] text-[#4A5D58]">
                    {n}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Ajouter une instruction ou remarque de suivi..."
                  className="flex-1 h-9 px-3 text-xs rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] outline-none focus:border-[#008F72] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="px-3.5 h-9 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E8F0ED]">
              <button
                type="button"
                onClick={() => {
                  setShippingLabelOrder(selectedOrderDetails)
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE8E3] hover:border-[#006B55] bg-white text-xs font-bold text-[#102A2A] transition shadow-2xs"
              >
                <Printer size={14} className="text-[#006B55]" />
                <span>Imprimer bordereau transporteur</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2 rounded-xl bg-[#102A2A] hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. SHIPPING LABEL PRINTABLE MODAL (AliExpress / Yalidine)  */}
      {/* ========================================================= */}
      {shippingLabelOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#DCE8E3] space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F0ED]">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-[#006B55]" />
                <h3 className="font-display font-bold text-sm text-[#102A2A]">
                  Bordereau d’Expédition Transporteur
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShippingLabelOrder(null)}
                className="p-1 rounded-lg text-[#60716F] hover:bg-[#F4FAF7]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Voucher Paper Card */}
            <div id="printable-voucher" className="p-5 border-2 border-dashed border-[#102A2A] rounded-2xl bg-white space-y-4 text-xs font-sans">
              {/* Slip Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#102A2A]">
                <div>
                  <div className="font-display font-black text-base tracking-wider text-[#102A2A]">DZORA MARKETPLACE</div>
                  <div className="text-[10px] text-[#60716F]">Bordereau officiel de livraison</div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#102A2A] text-white font-extrabold text-[11px]">
                    {shippingLabelOrder.carrier}
                  </span>
                  <div className="font-mono text-[10px] font-bold mt-1">Colis #{shippingLabelOrder.trackingNumber}</div>
                </div>
              </div>

              {/* Barcode Simulated Box */}
              <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-mono tracking-[0.4em] font-black text-sm text-[#102A2A]">
                  ||||| | |||| || |||||| | ||||| |||
                </div>
                <div className="font-mono text-[10px] text-[#60716F] mt-0.5">{shippingLabelOrder.trackingNumber}</div>
              </div>

              {/* Sender & Recipient Box */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-dashed border-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9.5px] font-extrabold text-[#71827D] uppercase block">Expéditeur</span>
                  <div className="font-bold text-[#102A2A] mt-0.5">{shippingLabelOrder.storeName}</div>
                  <div className="text-[10.5px] text-[#60716F]">Marchand agréé Dzora</div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[9.5px] font-extrabold text-[#006B55] uppercase block">Destinataire</span>
                  <div className="font-extrabold text-[#102A2A] mt-0.5">{shippingLabelOrder.clientName}</div>
                  <div className="font-mono font-bold text-[#006B55]">{shippingLabelOrder.phone}</div>
                </div>
              </div>

              {/* Delivery Destination */}
              <div>
                <span className="text-[10px] font-extrabold text-[#71827D] uppercase block">Adresse de Destination</span>
                <div className="font-bold text-sm text-[#102A2A] mt-0.5">
                  {shippingLabelOrder.commune}, <span className="text-[#006B55]">{shippingLabelOrder.wilaya}</span>
                </div>
                <div className="text-[11px] text-[#4A5D58] mt-0.5">{shippingLabelOrder.address}</div>
                <div className="text-[10.5px] font-bold text-[#102A2A] mt-1">
                  Type : {shippingLabelOrder.deliveryType}
                </div>
              </div>

              {/* Cash on Delivery Box */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase block">Montant à Encaisser (COD)</span>
                  <span className="text-[11px] text-amber-700 font-semibold">
                    {shippingLabelOrder.paymentMethod === 'COD' ? 'En espèces auprès du client' : 'Payé d’avance par carte CIB (0 DA)'}
                  </span>
                </div>
                <div className="font-display font-black text-xl text-amber-900">
                  {shippingLabelOrder.paymentMethod === 'COD' ? formatPrice(shippingLabelOrder.totalAmount) : '0 DA (PAYÉ)'}
                </div>
              </div>

              <div className="text-[10px] text-[#71827D] text-center border-t border-slate-200 pt-2">
                Dzora Algérie · Plateforme certifiée e-commerce · Support réclamations : support@dzora.dz
              </div>
            </div>

            {/* Print Action CTAs */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E8F0ED]">
              <button
                type="button"
                onClick={() => setShippingLabelOrder(null)}
                className="px-4 py-2 rounded-xl border border-[#DCE8E3] text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#006B55] hover:bg-[#005544] text-white text-xs font-bold transition shadow-xs flex items-center gap-2"
              >
                <Printer size={14} />
                <span>Imprimer le bordereau</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
