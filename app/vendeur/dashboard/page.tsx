'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ArrowUpDown,
  ShoppingCart,
  Store,
  Truck,
  CreditCard,
  Megaphone,
  BarChart3,
  Users,
  MessageSquare,
  Bell,
  Star,
  Sparkles,
  Settings,
  Search,
  HelpCircle,
  ChevronDown,
  TrendingUp,
  Plus,
  ArrowRight,
  Check,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertCircle,
  Eye,
  LogOut,
  Lock,
  FileText,
  MapPin,
  Phone,
  Printer,
  BadgeCheck,
  Filter,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  Tag,
  PackageOpen,
  Inbox,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { DZORA_PRODUCTS, type CatalogProduct } from '@/lib/products-data'
import { getClientOrders, type ClientOrder } from '@/lib/client-account'

/* -------------------------------------------------------------------------- */
/*                                Types & Models                              */
/* -------------------------------------------------------------------------- */

export interface SellerOrderItem {
  id: string
  orderId: string
  client: string
  phone: string
  wilaya: string
  commune: string
  address?: string
  total: string
  totalRaw: number
  status: 'to_confirm' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  statusLabel: string
  date: string
  createdAt: string
  paymentMethod: 'COD' | 'CIB' | 'BANK'
  paymentMethodLabel: string
  items: {
    name: string
    price: number
    quantity: number
    image?: string
  }[]
}

export interface SellerBestProduct {
  id: string
  name: string
  price: string
  priceRaw: number
  salesCount: number
  progressPercent: number
  imageUrl: string
  category: string
  slug: string
  rating: number
  reviews: number
}

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

function SellerDashboardContent() {
  const { user, logout } = useAuth()

  // Loading state for real data fetch
  const [isLoading, setIsLoading] = useState(true)

  // Seller status & profile from API
  const [sellerStatus, setSellerStatus] = useState<{
    hasProfile: boolean
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null
    type?: 'PHYSICAL_STORE' | 'ECOMMERCE' | null
    isApproved: boolean
    storeName: string | null
    slug: string | null
    approvedAt?: string | null
    verificationStatus?: string | null
  } | null>(null)

  const [sellerProfile, setSellerProfile] = useState<any | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab')

  // Navigation states
  const [activeItem, setActiveItem] = useState<'overview' | 'commandes' | 'cat-produits' | string>(
    initialTab && initialTab !== 'abonnement' ? initialTab : 'overview'
  )

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'abonnement') {
      router.replace('/vendeur/abonnement')
    } else if (tab) {
      setActiveItem(tab)
    }
  }, [searchParams, router])
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<string>('30 derniers jours')

  // Real Orders State (Starts Empty, Populated Strictly from Real Data)
  const [ordersList, setOrdersList] = useState<SellerOrderItem[]>([])
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState<'ALL' | string>('ALL')

  // Modal States
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<SellerOrderItem | null>(null)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)

  // New product form
  const [newProductName, setNewProductName] = useState('')
  const [newProductCategory, setNewProductCategory] = useState('Électronique')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductStock, setNewProductStock] = useState('25')
  const [newProductImage, setNewProductImage] = useState(
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80'
  )

  // Real Products state (Starts Empty, Populated Strictly from Real Data)
  const [storeProducts, setStoreProducts] = useState<CatalogProduct[]>([])

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

  // Fetch real seller profile and status from backend
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const fetchBackendData = async () => {
      try {
        const [statusRes, profileRes] = await Promise.allSettled([
          api.seller.getStatus(),
          api.seller.getProfile(),
        ])

        if (!isMounted) return

        if (statusRes.status === 'fulfilled' && statusRes.value) {
          setSellerStatus(statusRes.value)
        }
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setSellerProfile(profileRes.value)
        }
      } catch {
        // Fallback or unauthenticated
      } finally {
        // Slight delay to ensure smooth skeleton transition
        setTimeout(() => {
          if (isMounted) setIsLoading(false)
        }, 350)
      }
    }

    fetchBackendData()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  // Resolve Store Identity from real data
  const storeDisplayName =
    sellerStatus?.storeName ||
    sellerProfile?.storeName ||
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
    'Ma Boutique Dzora'

  const storeSlug =
    sellerStatus?.slug ||
    sellerProfile?.slug ||
    'techno-blida'

  const userPhone = user?.phone || sellerProfile?.user?.phone || ''
  const userInitials = (storeDisplayName.slice(0, 2) || 'DZ').toUpperCase()

  const sellerTypeBadge =
    sellerStatus?.type === 'PHYSICAL_STORE' || sellerProfile?.type === 'PHYSICAL_STORE'
      ? 'Magasin Physique'
      : 'Boutique E-commerce'

  const isPendingReview =
    sellerStatus?.status === 'PENDING' || sellerStatus?.status === 'UNDER_REVIEW'

  // Load Real Products for this seller from Catalog + Local Vendor Storage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storeNameNorm = storeDisplayName.toLowerCase().trim()
    const slugNorm = storeSlug.toLowerCase().trim()

    // 1. Check vendor-created products in localStorage
    const savedProductsKey = `dzora_seller_products_${storeSlug}`
    let customProducts: CatalogProduct[] = []
    try {
      const stored = localStorage.getItem(savedProductsKey)
      if (stored) {
        customProducts = JSON.parse(stored)
      }
    } catch {
      customProducts = []
    }

    // 2. Filter official platform catalog products matching this vendor
    const catalogMatches = DZORA_PRODUCTS.filter((p) => {
      const pStore = p.store.toLowerCase().trim()
      const pSlug = pStore.replace(/[^a-z0-9]+/g, '-')
      return (
        pStore === storeNameNorm ||
        pSlug === slugNorm ||
        (slugNorm && pSlug.includes(slugNorm)) ||
        (storeNameNorm && pStore.includes(storeNameNorm))
      )
    })

    // Combine custom and catalog products (no duplicates)
    const combined = [...customProducts]
    for (const catProd of catalogMatches) {
      if (!combined.some((p) => p.id === catProd.id)) {
        combined.push(catProd)
      }
    }

    setStoreProducts(combined)
  }, [storeDisplayName, storeSlug])

  // Load Real Orders from Client Checkout & Local Orders Store
  useEffect(() => {
    if (typeof window === 'undefined') return

    const realOrdersKey = `dzora_seller_orders_${storeSlug}`
    let storedOrders: SellerOrderItem[] = []

    try {
      const stored = localStorage.getItem(realOrdersKey)
      if (stored) {
        storedOrders = JSON.parse(stored)
      }
    } catch {
      storedOrders = []
    }

    // Also get orders created by clients from checkout
    try {
      const clientOrders = getClientOrders()
      if (clientOrders && clientOrders.length > 0) {
        const formattedClientOrders: SellerOrderItem[] = clientOrders.map((co, idx) => ({
          id: `client-ord-${idx}-${co.orderId}`,
          orderId: co.orderId.startsWith('#') ? co.orderId : `#${co.orderId}`,
          client: co.clientName || 'Client Dzora',
          phone: co.phone || '',
          wilaya: co.wilaya || 'Alger',
          commune: co.commune || '',
          address: co.address || '',
          total: `${co.totalAmount.toLocaleString('fr-DZ')} DA`,
          totalRaw: co.totalAmount,
          status:
            co.status === 'CONFIRMED'
              ? 'preparing'
              : co.status === 'SHIPPED'
              ? 'shipped'
              : co.status === 'DELIVERED'
              ? 'delivered'
              : 'to_confirm',
          statusLabel: co.statusLabel || 'À confirmer',
          date: co.date || 'Aujourd’hui',
          createdAt: new Date().toISOString(),
          paymentMethod: co.paymentMethod || 'COD',
          paymentMethodLabel: co.paymentMethodLabel || 'Cash à la livraison',
          items: [
            {
              name: 'Commande client Dzora Express',
              price: co.totalAmount,
              quantity: co.itemsCount || 1,
              image:
                'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80',
            },
          ],
        }))

        // Merge with stored vendor orders without duplicating IDs
        const existingIds = new Set(storedOrders.map((o) => o.orderId))
        const fresh = formattedClientOrders.filter((o) => !existingIds.has(o.orderId))
        storedOrders = [...storedOrders, ...fresh]
      }
    } catch {
      // Storage parse fallback
    }

    setOrdersList(storedOrders)
  }, [storeSlug])

  // Persist order status change to localStorage
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: 'to_confirm' | 'preparing' | 'shipped' | 'delivered'
  ) => {
    const statusLabels: Record<string, string> = {
      to_confirm: 'À confirmer',
      preparing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
    }

    const updated = ordersList.map((o) =>
      o.orderId === orderId
        ? { ...o, status: newStatus, statusLabel: statusLabels[newStatus] }
        : o
    )

    setOrdersList(updated)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`dzora_seller_orders_${storeSlug}`, JSON.stringify(updated))
      } catch {
        // Storage error fallback
      }
    }

    if (selectedOrderDetails && selectedOrderDetails.orderId === orderId) {
      setSelectedOrderDetails((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              statusLabel: statusLabels[newStatus],
            }
          : null
      )
    }

    showToast(`Commande ${orderId} mise à jour : « ${statusLabels[newStatus]} »`)
  }

  // Handle Add Product Submit & Persist to Real Local Storage
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductName.trim() || !newProductPrice) return

    const priceNum = parseFloat(newProductPrice.replace(/[^0-9.]/g, '')) || 5000

    const newProd: CatalogProduct = {
      id: `prod-${Date.now()}`,
      name: newProductName.trim(),
      category: newProductCategory as any,
      price: priceNum,
      brand: storeDisplayName,
      store: storeDisplayName,
      storeLocation: sellerProfile?.wilaya || 'Algérie',
      verifiedSeller: true,
      rating: 5.0,
      reviews: 0,
      inStock: true,
      fastDelivery: true,
      cashOnDelivery: true,
      image: newProductImage,
      slug: newProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isBestSeller: false,
    }

    const updated = [newProd, ...storeProducts]
    setStoreProducts(updated)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`dzora_seller_products_${storeSlug}`, JSON.stringify(updated))
      } catch {
        // Storage error fallback
      }
    }

    setIsAddProductOpen(false)
    setNewProductName('')
    setNewProductPrice('')
    showToast(`Produit « ${newProd.name} » ajouté au catalogue avec succès !`)
  }

  // Real KPI calculations based strictly on real data
  const totalRevenue = useMemo(() => {
    return ordersList.reduce((acc, curr) => acc + curr.totalRaw, 0)
  }, [ordersList])

  const pendingOrdersCount = useMemo(() => {
    return ordersList.filter((o) => o.status === 'to_confirm').length
  }, [ordersList])

  const averageOrderValue = useMemo(() => {
    if (ordersList.length === 0) return 0
    return Math.round(totalRevenue / ordersList.length)
  }, [totalRevenue, ordersList.length])

  // Real Top Selling Products from real vendor catalog
  const bestProducts: SellerBestProduct[] = useMemo(() => {
    return storeProducts.map((p) => {
      const salesCount = p.reviews || 0
      const maxSales = Math.max(1, ...storeProducts.map((sp) => sp.reviews || 0))
      const progressPercent = Math.min(100, Math.round((salesCount / maxSales) * 100))

      return {
        id: p.id,
        name: p.name,
        price: `${p.price.toLocaleString('fr-DZ')} DA`,
        priceRaw: p.price,
        salesCount,
        progressPercent,
        imageUrl: p.image,
        category: p.category,
        slug: p.slug,
        rating: p.rating || 5.0,
        reviews: p.reviews || 0,
      }
    })
  }, [storeProducts])

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.client.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.wilaya.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.phone.includes(orderSearchQuery)

      const matchesStatus =
        selectedOrderStatusFilter === 'ALL' || order.status === selectedOrderStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [ordersList, orderSearchQuery, selectedOrderStatusFilter])

  // Real Dynamic Chart calculation from actual orders
  const chartWidth = 1000
  const chartHeight = 240
  const paddingX = 50
  const paddingY = 35

  const realChartPoints = useMemo(() => {
    if (ordersList.length === 0) {
      return [
        { day: '01', value: 0 },
        { day: '05', value: 0 },
        { day: '10', value: 0 },
        { day: '15', value: 0 },
        { day: '20', value: 0 },
        { day: '25', value: 0 },
        { day: '30', value: 0 },
      ]
    }

    // Group real orders by date or map chronologically
    return ordersList.map((ord, idx) => ({
      day: ord.date.slice(0, 6) || `Cmd ${idx + 1}`,
      value: ord.totalRaw,
    }))
  }, [ordersList])

  const maxValue = Math.max(10000, ...realChartPoints.map((d) => d.value)) * 1.2
  const minValue = 0

  const points = realChartPoints.map((pt, i) => {
    const x =
      realChartPoints.length === 1
        ? chartWidth / 2
        : paddingX + (i / (realChartPoints.length - 1)) * (chartWidth - paddingX * 2)
    const y =
      chartHeight -
      paddingY -
      ((pt.value - minValue) / (maxValue - minValue)) * (chartHeight - paddingY * 2)
    return { x, y, day: pt.day, value: pt.value }
  })

  // Smooth SVG Bezier Path
  const linePath = points.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`
    const prev = arr[idx - 1]
    const cx = (prev.x + curr.x) / 2
    return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`
  }, '')

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : ''

  const averageDailySales = useMemo(() => {
    if (ordersList.length === 0) return 0
    return Math.round(totalRevenue / Math.max(1, realChartPoints.length))
  }, [totalRevenue, ordersList.length, realChartPoints.length])

  return (
    <div className="flex min-h-screen bg-[#F4FAF7] text-[#102A2A] antialiased">
      {/* ------------------------------------------------------------------ */}
      {/* 1. Left Fixed Sidebar (Desktop 260px)                              */}
      {/* ------------------------------------------------------------------ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-[#DCE8E3] bg-white transition-transform duration-200 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-[#DCE8E3] px-5">
          <Link href="/" className="flex items-center gap-2.5 group">
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
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-[#60716F] hover:bg-[#F4FAF7] lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Store Preview Header in Sidebar */}
        <div className="border-b border-[#DCE8E3] bg-[#F7FBF9] p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#006B55] text-xs font-black text-white shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xs font-extrabold text-[#102A2A]">
                {storeDisplayName}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-[#008F72]" />
                <span className="truncate text-[10px] font-semibold text-[#60716F]">
                  {sellerTypeBadge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav
          aria-label="Navigation Espace Vendeur"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-3.5 text-xs font-semibold"
        >
          {/* Vue d'ensemble */}
          <button
            type="button"
            onClick={() => setActiveItem('overview')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition text-left ${
              activeItem === 'overview'
                ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
            }`}
          >
            <LayoutDashboard
              size={17}
              className={activeItem === 'overview' ? 'text-[#006B55]' : 'text-[#71827D]'}
            />
            <span>Vue d’ensemble</span>
          </button>

          {/* Catalogue (Accordion) */}
          <div>
            <button
              type="button"
              onClick={() => setIsCatalogueOpen(!isCatalogueOpen)}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]"
            >
              <div className="flex items-center gap-3">
                <Package size={17} className="text-[#71827D]" />
                <span>Catalogue</span>
              </div>
              <ChevronDown
                size={14}
                className={`text-[#71827D] transition-transform duration-200 ${
                  isCatalogueOpen ? 'rotate-180 text-[#006B55]' : ''
                }`}
              />
            </button>

            {isCatalogueOpen && (
              <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-[#DCE8E3] pl-3">
                {[
                  { id: 'cat-produits', label: 'Produits', icon: Boxes, count: storeProducts.length },
                  { id: 'cat-categories', label: 'Catégories', icon: Layers },
                  { id: 'cat-inventaire', label: 'Inventaire & Stocks', icon: Clock },
                  { id: 'cat-import-export', label: 'Import / Export', icon: ArrowUpDown },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setActiveItem(sub.id)
                      showToast(`Section « ${sub.label} » sélectionnée`)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11.5px] transition ${
                      activeItem === sub.id
                        ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                        : 'text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <sub.icon
                        size={13}
                        className={activeItem === sub.id ? 'text-[#006B55]' : 'text-[#889B95]'}
                      />
                      <span>{sub.label}</span>
                    </div>
                    {sub.count !== undefined && (
                      <span className="text-[10px] font-bold text-[#006B55] bg-[#E7F2EF] px-1.5 py-0.5 rounded">
                        {sub.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Items with Real Badges */}
          {[
            { id: 'commandes', label: 'Commandes', icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
            { id: 'boutique', label: 'Ma boutique', icon: Store },
            { id: 'livraison', label: 'Expédition & Wilayas', icon: Truck },
            { id: 'finance', label: 'Finance & Reversement', icon: CreditCard },
            { id: 'marketing', label: 'Promotions', icon: Megaphone },
            { id: 'analytique', label: 'Analytique', icon: BarChart3 },
            { id: 'avis', label: 'Avis clients', icon: Star },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveItem(item.id)
                showToast(`Section « ${item.label} » affichée`)
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition text-left ${
                activeItem === item.id
                  ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                  : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={17}
                  className={activeItem === item.id ? 'text-[#006B55]' : 'text-[#71827D]'}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="grid size-5 place-items-center rounded-full bg-[#006B55] text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Abonnement PRO (Independent Page with direct Link) */}
          <Link
            href="/vendeur/abonnement"
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition text-left text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={17} className="text-[#006B55]" />
              <span>Abonnement PRO</span>
            </div>
            <span className="rounded-md bg-[#E7F2EF] px-1.5 py-0.5 text-[10px] font-extrabold text-[#006B55]">
              PRO
            </span>
          </Link>

          {/* Paramètres */}
          <button
            type="button"
            onClick={() => {
              setActiveItem('parametres')
              showToast('Section « Paramètres » affichée')
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition text-left ${
              activeItem === 'parametres'
                ? 'bg-[#E7F2EF] font-bold text-[#006B55]'
                : 'text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#102A2A]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings
                size={17}
                className={activeItem === 'parametres' ? 'text-[#006B55]' : 'text-[#71827D]'}
              />
              <span>Paramètres</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer Link */}
        <div className="border-t border-[#DCE8E3] p-3.5 space-y-2">
          <Link
            href={storeSlug ? `/vendeur/${storeSlug}` : '/vendeur/techno-blida'}
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-[#CCE2DB] bg-[#EDF7F4] px-3 py-2.5 text-xs font-bold text-[#006B55] transition hover:bg-[#E0F0EB]"
          >
            <span className="flex items-center gap-2">
              <Store size={14} />
              Voir ma vitrine
            </span>
            <ExternalLink size={12} className="text-[#008F72]" />
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E5EEEB] bg-white px-3 py-2 text-xs font-semibold text-[#60716F] transition hover:bg-[#F4FAF7] hover:text-[#102A2A]"
          >
            <span>Retour au marketplace</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. Main Workspace Layout (FULL WIDTH)                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px] w-full">
        {/* Top Bar (Full Width) */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#DCE8E3] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 2xl:px-10 w-full">
          <div className="flex flex-1 items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="grid size-9 place-items-center rounded-xl border border-[#DCE8E3] text-[#006B55] hover:bg-[#F4FAF7] lg:hidden"
              aria-label="Ouvrir le menu latéral"
            >
              <Menu size={18} />
            </button>

            {/* Wide Search Bar */}
            <div className="relative w-full max-w-lg">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A4A0]"
              />
              <input
                type="search"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Rechercher une commande, un produit, un client, une wilaya…"
                className="h-10 w-full rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] pl-10 pr-4 text-xs font-medium text-[#102A2A] placeholder:text-[#71827D] outline-none transition focus:border-[#008F72] focus:bg-white focus:ring-2 focus:ring-[#008F72]/15"
              />
            </div>
          </div>

          {/* Right Topbar actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Link to Store */}
            <Link
              href={storeSlug ? `/vendeur/${storeSlug}` : '/vendeur/techno-blida'}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8E3] px-3 py-1.5 text-xs font-bold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55] transition"
            >
              <Store size={14} className="text-[#006B55]" />
              <span>Vitrine en ligne</span>
            </Link>

            {/* Help */}
            <button
              type="button"
              onClick={() => showToast('Centre d’assistance Dzora Vendeur : Support disponible 7j/7')}
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#006B55]"
            >
              <HelpCircle size={16} className="text-[#006B55]" />
              <span className="hidden sm:inline">Aide</span>
            </button>

            {/* Notification bell */}
            <button
              type="button"
              onClick={() =>
                showToast(
                  pendingOrdersCount > 0
                    ? `Vous avez ${pendingOrdersCount} commande(s) en attente de confirmation.`
                    : 'Aucune notification urgente.'
                )
              }
              className="relative grid size-9 place-items-center rounded-xl text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#006B55]"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {pendingOrdersCount > 0 && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-[#F28C28] ring-2 ring-white" />
              )}
            </button>

            <div className="h-5 w-px bg-[#DCE8E3]" />

            {/* Seller Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl p-1.5 text-left transition hover:bg-[#F4FAF7]"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#006B55] text-xs font-bold text-white shadow-xs">
                  {userInitials[0]}
                </div>
                <div className="hidden text-left min-[480px]:block">
                  <p className="max-w-[150px] truncate text-xs font-bold text-[#102A2A]">
                    {storeDisplayName}
                  </p>
                  <p className="text-[10px] font-medium text-[#60716F]">
                    {sellerStatus?.isApproved ? 'Vendeur vérifié' : 'Compte Pro actif'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-[#94A4A0]" />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-[#DCE8E3] bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="border-b border-[#E8F0ED] p-2.5 bg-[#F7FAF9] rounded-xl mb-1">
                    <p className="truncate text-xs font-bold text-[#102A2A]">{storeDisplayName}</p>
                    <p className="truncate text-[11px] font-mono text-[#60716F]">
                      {userPhone || user?.email || 'Vendeur Dzora'}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block size-1.5 rounded-full bg-[#008F72]" />
                      <span className="text-[10px] font-bold text-[#006B55]">
                        {sellerTypeBadge}
                      </span>
                    </div>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <Link
                      href={storeSlug ? `/vendeur/${storeSlug}` : '/vendeur/techno-blida'}
                      target="_blank"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55]"
                    >
                      <Store size={14} className="text-[#006B55]" />
                      Voir ma vitrine publique
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false)
                        setActiveItem('parametres')
                        showToast('Paramètres de la boutique')
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#4A5D58] hover:bg-[#F4FAF7] hover:text-[#006B55]"
                    >
                      <Settings size={14} className="text-[#006B55]" />
                      Paramètres du compte
                    </button>
                  </div>
                  <div className="border-t border-[#E8F0ED] pt-1 mt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsProfileMenuOpen(false)
                        await logout()
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* Main Content Area (FULL WIDTH)                                     */}
        {/* ------------------------------------------------------------------ */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full">
          {/* LOADER SKELETON (Displayed when isLoading is true) */}
          {isLoading ? (
            <div className="w-full space-y-6 animate-pulse">
              {/* Header Skeleton */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                <div className="space-y-2">
                  <div className="h-8 w-64 rounded-xl bg-[#DCE8E3]" />
                  <div className="h-4 w-96 max-w-full rounded-lg bg-[#EAEFEF]" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-44 rounded-xl bg-[#E7F2EF] border border-[#BBDDD4]/40" />
                  <div className="h-9 w-36 rounded-xl bg-[#006B55]/20" />
                </div>
              </div>

              {/* KPI Cards Skeleton (4 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#DCE8E3] bg-white p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-28 rounded bg-[#EAEFEF]" />
                      <div className="size-9 rounded-xl bg-[#E7F2EF]" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 w-36 rounded-lg bg-[#DCE8E3]" />
                      <div className="h-3 w-44 rounded bg-[#EAEFEF]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Middle Row Skeleton (Chart + Subscription) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                {/* Chart Card Skeleton */}
                <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 sm:p-6 lg:col-span-8 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E8F0ED] pb-4">
                    <div className="space-y-2">
                      <div className="h-5 w-48 rounded bg-[#DCE8E3]" />
                      <div className="h-3 w-72 rounded bg-[#EAEFEF]" />
                    </div>
                    <div className="h-8 w-36 rounded-xl bg-[#EAEFEF]" />
                  </div>
                  <div className="h-60 w-full rounded-xl bg-[#F7FBF9] flex items-end p-6 gap-6">
                    {[35, 55, 45, 75, 60, 90, 70, 85, 95, 80].map((h, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-[#DCE8E3] rounded-t-lg transition-all"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[#E8F0ED]">
                    <div className="h-3 w-48 rounded bg-[#EAEFEF]" />
                    <div className="h-3 w-28 rounded bg-[#EAEFEF]" />
                  </div>
                </div>

                {/* Subscription Card Skeleton */}
                <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 sm:p-6 lg:col-span-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-36 rounded bg-[#DCE8E3]" />
                    <div className="h-5 w-16 rounded-full bg-[#E7F2EF]" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-7 w-28 rounded-lg bg-[#DCE8E3]" />
                    <div className="h-3 w-44 rounded bg-[#EAEFEF]" />
                  </div>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-3 w-20 rounded bg-[#EAEFEF]" />
                        <div className="h-3 w-12 rounded bg-[#EAEFEF]" />
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#E5EEEB]" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-3 w-20 rounded bg-[#EAEFEF]" />
                        <div className="h-3 w-12 rounded bg-[#EAEFEF]" />
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#E5EEEB]" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#E8F0ED] space-y-2">
                    <div className="h-4 w-32 rounded bg-[#EAEFEF]" />
                    <div className="h-3 w-full rounded bg-[#EAEFEF]" />
                  </div>
                </div>
              </div>

              {/* Bottom Row Skeleton (Orders + Products) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
                {/* Orders Skeleton */}
                <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 sm:p-6 xl:col-span-7 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E8F0ED] pb-4">
                    <div className="space-y-2">
                      <div className="h-5 w-40 rounded bg-[#DCE8E3]" />
                      <div className="h-3 w-56 rounded bg-[#EAEFEF]" />
                    </div>
                    <div className="h-7 w-28 rounded-xl bg-[#EAEFEF]" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2.5 border-b border-[#F0F5F3]"
                      >
                        <div className="space-y-1">
                          <div className="h-3.5 w-24 rounded bg-[#DCE8E3]" />
                          <div className="h-2.5 w-16 rounded bg-[#EAEFEF]" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-3.5 w-28 rounded bg-[#DCE8E3]" />
                          <div className="h-2.5 w-20 rounded bg-[#EAEFEF]" />
                        </div>
                        <div className="h-3.5 w-20 rounded bg-[#DCE8E3]" />
                        <div className="h-6 w-20 rounded-full bg-[#E7F2EF]" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products Skeleton */}
                <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 sm:p-6 xl:col-span-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E8F0ED] pb-4">
                    <div className="space-y-2">
                      <div className="h-5 w-44 rounded bg-[#DCE8E3]" />
                      <div className="h-3 w-48 rounded bg-[#EAEFEF]" />
                    </div>
                    <div className="h-7 w-16 rounded-xl bg-[#EAEFEF]" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <div className="size-12 rounded-xl bg-[#DCE8E3] shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 w-3/4 rounded bg-[#DCE8E3]" />
                          <div className="h-2 w-1/3 rounded bg-[#EAEFEF]" />
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="h-3.5 w-16 rounded bg-[#DCE8E3]" />
                          <div className="h-2 w-10 rounded bg-[#EAEFEF]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* REAL DATA VIEW (100% Full Width, Live Dynamic Data) */
            <div className="w-full space-y-6">
              {/* Status Notice if Pending */}
              {isPendingReview && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-xs">
                  <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-950">
                      Votre dossier vendeur est en cours d’examen par l’équipe Dzora
                    </p>
                    <p className="mt-0.5 text-amber-800">
                      Vous avez accès à toutes les fonctionnalités de gestion. Votre vitrine publique sera indexée pour les acheteurs dès approbation administrative.
                    </p>
                  </div>
                </div>
              )}

              {/* Header: Greeting & Primary Actions */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-extrabold tracking-[-0.035em] text-[#102A2A] sm:text-3xl">
                      Bonjour, {storeDisplayName} 👋
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#E7F2EF] px-2.5 py-0.5 text-xs font-extrabold text-[#006B55]">
                      <BadgeCheck size={14} />
                      Boutique officielle
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#60716F]">
                    Tableau de bord de performance en temps réel et suivi des commandes Dzora.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveItem('commandes')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] bg-[#E7F2EF] px-3.5 py-2 rounded-xl border border-[#BBDDD4] hover:bg-[#d5eae4] transition shadow-xs cursor-pointer"
                  >
                    <ShoppingCart size={14} />
                    <span>Gérer les commandes ({ordersList.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006B55] text-xs font-bold text-white hover:bg-[#005544] transition shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Ajouter un produit</span>
                  </button>
                </div>
              </div>

              {/* -------------------------------------------------------------- */}
              {/* KPI Cards (4 Full Width Adaptive Columns - Strictly Real Data) */}
              {/* -------------------------------------------------------------- */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5 w-full">
                {/* 1. Chiffre d'affaires */}
                <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)] sm:p-6 transition hover:border-[#008F72]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#60716F]">
                      Chiffre d’affaires
                    </span>
                    <div className="grid size-9 place-items-center rounded-xl bg-[#E7F2EF] text-[#006B55]">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-display text-2xl font-extrabold tracking-tight text-[#102A2A] sm:text-3xl">
                      {totalRevenue.toLocaleString('fr-DZ')} DA
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#008F72]">
                      <TrendingUp size={13} />
                      <span>Total généré sur les commandes réelles</span>
                    </div>
                  </div>
                </div>

                {/* 2. Commandes */}
                <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)] sm:p-6 transition hover:border-[#008F72]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#60716F]">
                      Commandes reçues
                    </span>
                    <div className="grid size-9 place-items-center rounded-xl bg-[#E7F2EF] text-[#006B55]">
                      <ShoppingCart size={18} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-display text-2xl font-extrabold tracking-tight text-[#102A2A] sm:text-3xl">
                      {ordersList.length}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#71827D]">
                      {pendingOrdersCount > 0 ? (
                        <span className="font-bold text-[#F28C28]">
                          {pendingOrdersCount} commande{pendingOrdersCount > 1 ? 's' : ''} à confirmer
                        </span>
                      ) : ordersList.length > 0 ? (
                        <span>Toutes les commandes sont traitées</span>
                      ) : (
                        <span>Aucune commande enregistrée</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 3. Produits & Quota */}
                <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)] sm:p-6 transition hover:border-[#008F72]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#60716F]">
                      Produits actifs
                    </span>
                    <div className="grid size-9 place-items-center rounded-xl bg-[#E7F2EF] text-[#006B55]">
                      <Package size={18} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-display text-2xl font-extrabold tracking-tight text-[#102A2A] sm:text-3xl">
                      {storeProducts.length}{' '}
                      <span className="text-base font-bold text-[#889B95]">/ 500</span>
                    </p>
                    <div className="mt-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5EEEB]">
                        <div
                          className="h-full rounded-full bg-[#006B55] transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(storeProducts.length > 0 ? 5 : 0, (storeProducts.length / 500) * 100))}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] font-medium text-[#71827D]">
                        Quota forfait PRO utilisé à {Math.round((storeProducts.length / 500) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Panier Moyen & Satisfaction */}
                <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)] sm:p-6 transition hover:border-[#008F72]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#60716F]">
                      Panier moyen & Note
                    </span>
                    <div className="grid size-9 place-items-center rounded-xl bg-[#E7F2EF] text-[#006B55]">
                      <Star size={18} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-display text-2xl font-extrabold tracking-tight text-[#102A2A] sm:text-3xl">
                      {averageOrderValue.toLocaleString('fr-DZ')} DA
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#102A2A]">
                      <div className="flex items-center text-amber-500">
                        <Star size={13} fill="currentColor" />
                      </div>
                      <span>5.0 / 5</span>
                      <span className="text-[11px] font-normal text-[#71827D]">
                        (Boutique vérifiée)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------------- */}
              {/* Middle Row: Aperçu des ventes (Chart) + Votre abonnement       */}
              {/* -------------------------------------------------------------- */}
              <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 w-full">
                {/* Left Card: Aperçu des ventes (Chart) */}
                <div className="flex flex-col justify-between rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)] sm:p-6 lg:col-span-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F0ED] pb-4">
                    <div>
                      <h2 className="font-display text-base font-extrabold text-[#102A2A]">
                        Aperçu des ventes en direct
                      </h2>
                      <p className="text-xs font-medium text-[#60716F]">
                        Courbe d’évolution des commandes réelles pour {storeDisplayName}
                      </p>
                    </div>

                    {/* Selector */}
                    <div className="relative">
                      <select
                        value={timeRange}
                        onChange={(e) => {
                          setTimeRange(e.target.value)
                          showToast(`Période sélectionnée : ${e.target.value}`)
                        }}
                        className="cursor-pointer appearance-none rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] py-1.5 pl-3 pr-8 text-xs font-bold text-[#102A2A] outline-none transition hover:border-[#008F72] focus:border-[#006B55]"
                      >
                        <option value="7 derniers jours">7 derniers jours</option>
                        <option value="30 derniers jours">30 derniers jours</option>
                        <option value="90 derniers jours">90 derniers jours</option>
                        <option value="Année 2026">Année 2026</option>
                      </select>
                      <ChevronDown
                        size={13}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71827D]"
                      />
                    </div>
                  </div>

                  {/* Inline Responsive SVG Chart or Empty State */}
                  {ordersList.length === 0 ? (
                    <div className="py-16 text-center text-xs space-y-2">
                      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#E7F2EF] text-[#006B55]">
                        <BarChart3 size={24} />
                      </div>
                      <p className="font-bold text-[#102A2A] text-sm mt-3">
                        Aucune vente enregistrée sur cette période
                      </p>
                      <p className="text-[#60716F] max-w-sm mx-auto">
                        Les graphiques de revenus et le volume des commandes apparaîtront ici dès vos premières transactions.
                      </p>
                    </div>
                  ) : (
                    <div className="relative mt-4 w-full overflow-hidden pt-2">
                      <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="h-60 sm:h-64 w-full overflow-visible"
                        aria-label={`Graphique des ventes pour la période ${timeRange}`}
                      >
                        <defs>
                          <linearGradient id="dzora-real-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#006B55" stopOpacity="0.28" />
                            <stop offset="65%" stopColor="#006B55" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#006B55" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Subtle grid lines */}
                        {[0, 10000, 25000, 50000].map((val) => {
                          if (val > maxValue) return null
                          const y =
                            chartHeight -
                            paddingY -
                            ((val - minValue) / (maxValue - minValue)) * (chartHeight - paddingY * 2)
                          return (
                            <g key={val}>
                              <line
                                x1={paddingX}
                                y1={y}
                                x2={chartWidth - paddingX}
                                y2={y}
                                stroke="#E8F0ED"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                              />
                              <text
                                x={paddingX - 10}
                                y={y + 3}
                                textAnchor="end"
                                fontSize="9"
                                fill="#889B95"
                                className="font-mono font-medium"
                              >
                                {val === 0 ? '0' : `${Math.round(val / 1000)}k`}
                              </text>
                            </g>
                          )
                        })}

                        {/* Shaded Area */}
                        {areaPath && <path d={areaPath} fill="url(#dzora-real-gradient)" />}

                        {/* Emerald line */}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#006B55"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Interactive points & date labels */}
                        {points.map((pt, index) => {
                          return (
                            <g key={`${pt.day}-${index}`} className="group cursor-pointer">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="4.5"
                                fill="#ffffff"
                                stroke="#006B55"
                                strokeWidth="2.5"
                                className="transition-transform group-hover:scale-150"
                              />

                              {/* Hover tooltip */}
                              <title>{`${pt.day} : ${pt.value.toLocaleString('fr-DZ')} DA`}</title>

                              <text
                                x={pt.x}
                                y={chartHeight - 8}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#60716F"
                                className="font-medium"
                              >
                                {pt.day}
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-between border-t border-[#E8F0ED] pt-3 text-xs text-[#60716F]">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#006B55]" />
                      Chiffre moyen par commande :{' '}
                      <strong className="text-[#102A2A]">
                        {averageDailySales.toLocaleString('fr-DZ')} DA
                      </strong>
                    </span>
                    <span className="font-semibold text-[#006B55]">
                      Données réelles
                    </span>
                  </div>
                </div>

                {/* Right Card: Votre abonnement */}
                <div className="flex flex-col justify-between rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)] sm:p-6 lg:col-span-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-base font-extrabold text-[#102A2A]">
                        Votre abonnement
                      </h2>
                      <span className="rounded-full border border-[#CCE2DB] bg-[#E7F2EF] px-2.5 py-0.5 text-xs font-extrabold tracking-wider text-[#006B55]">
                        PRO ACTIF
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="font-display text-2xl font-extrabold tracking-tight text-[#102A2A]">
                        3 500 DA <span className="text-sm font-semibold text-[#60716F]">/ mois</span>
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#60716F]">
                        <Clock size={13} className="text-[#006B55]" />
                        Prochain renouvellement · 04 novembre 2026
                      </p>
                    </div>

                    {/* Usage bars linked to real data */}
                    <div className="mt-6 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-[#102A2A]">
                          <span>Produits référencés</span>
                          <span className="text-[#006B55]">{storeProducts.length} / 500</span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E5EEEB]">
                          <div
                            className="h-full rounded-full bg-[#006B55]"
                            style={{
                              width: `${Math.min(100, Math.max(storeProducts.length > 0 ? 4 : 0, (storeProducts.length / 500) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-[#102A2A]">
                          <span>Commandes traitées ce mois</span>
                          <span className="text-[#006B55]">{ordersList.length} / 500</span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E5EEEB]">
                          <div
                            className="h-full rounded-full bg-[#006B55]"
                            style={{
                              width: `${Math.min(100, Math.max(ordersList.length > 0 ? 3 : 0, (ordersList.length / 500) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#E8F0ED] pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <Link
                        href="/vendeur/abonnement"
                        className="font-bold text-[#006B55] hover:text-[#008F72] hover:underline cursor-pointer"
                      >
                        Changer de plan
                      </Link>
                      <Link
                        href="/vendeur/abonnement#factures"
                        className="font-semibold text-[#60716F] hover:text-[#102A2A] hover:underline cursor-pointer"
                      >
                        Factures & Quittances
                      </Link>
                    </div>

                    <p className="mt-3 text-[11px] leading-4 text-[#889B95]">
                      Inclus : Vitrine personnalisée, commissions réduites à 7%, intégration Yalidine & support prioritaire.
                    </p>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------------- */}
              {/* Lower Row: Commandes récentes + Produits les plus vendus       */}
              {/* -------------------------------------------------------------- */}
              <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 w-full">
                {/* Left Card: Commandes récentes (Full Width Table) */}
                <div className="flex flex-col justify-between rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)] sm:p-6 xl:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F0ED] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-base font-extrabold text-[#102A2A]">
                            Commandes récentes
                          </h2>
                          <span className="rounded-md bg-[#E7F2EF] px-2 py-0.5 text-[11px] font-bold text-[#006B55]">
                            {ordersList.length} au total
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#60716F]">
                          Suivi des dernières expéditions et achats clients sur la boutique
                        </p>
                      </div>

                      {/* Status filter pill */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={selectedOrderStatusFilter}
                          onChange={(e) => setSelectedOrderStatusFilter(e.target.value)}
                          className="rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] py-1 px-2.5 text-xs font-semibold text-[#102A2A] outline-none"
                        >
                          <option value="ALL">Tous les statuts</option>
                          <option value="to_confirm">À confirmer</option>
                          <option value="preparing">En préparation</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option>
                        </select>
                      </div>
                    </div>

                    {/* Responsive Real Table or Empty State */}
                    {ordersList.length === 0 ? (
                      <div className="py-12 text-center text-xs space-y-2">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#E7F2EF] text-[#006B55]">
                          <Inbox size={22} />
                        </div>
                        <p className="font-bold text-[#102A2A] text-sm mt-3">
                          Aucune commande reçue pour le moment
                        </p>
                        <p className="text-[#60716F] max-w-sm mx-auto">
                          Dès qu’un client commande sur votre vitrine, elle apparaîtra ici avec son statut et son adresse de livraison.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#E8F0ED] text-[11px] font-bold uppercase tracking-wider text-[#71827D]">
                              <th className="py-3 pr-3">Commande</th>
                              <th className="py-3 px-3">Client</th>
                              <th className="py-3 px-3">Wilaya</th>
                              <th className="py-3 px-3">Montant</th>
                              <th className="py-3 pl-3 text-right">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8F0ED]">
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-xs text-[#71827D]">
                                  Aucune commande ne correspond aux filtres.
                                </td>
                              </tr>
                            ) : (
                              filteredOrders.map((order) => (
                                <tr
                                  key={order.id}
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="group transition hover:bg-[#F7FAF9] cursor-pointer"
                                >
                                  <td className="py-3.5 pr-3 font-mono font-bold text-[#006B55]">
                                    <div>{order.orderId}</div>
                                    <span className="text-[10px] font-sans font-normal text-[#71827D]">
                                      {order.date}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3 font-semibold text-[#102A2A]">
                                    <div>{order.client}</div>
                                    <span className="text-[10px] font-normal text-[#71827D]">
                                      {order.phone}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3 text-[#4A5D58] font-medium">
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin size={11} className="text-[#008F72]" />
                                      {order.wilaya}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3 font-bold text-[#102A2A]">
                                    <div>{order.total}</div>
                                    <span className="text-[10px] font-normal text-[#71827D]">
                                      {order.paymentMethod === 'CIB' ? 'Payé CIB' : 'Paiement COD'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 pl-3 text-right">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                        order.status === 'to_confirm'
                                          ? 'border border-[#FEDF89] bg-[#FFF4E5] text-[#B54708]'
                                          : order.status === 'preparing'
                                          ? 'border border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]'
                                          : order.status === 'shipped'
                                          ? 'border border-[#E9D7FE] bg-[#F9F5FF] text-[#6941C6]'
                                          : 'border border-[#CCE2DB] bg-[#EDF7F4] text-[#006B55]'
                                      }`}
                                    >
                                      {order.statusLabel}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#E8F0ED] pt-3 text-xs">
                    <span className="text-[#71827D]">
                      Cliquez sur une commande pour afficher les détails ou changer son statut.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveItem('commandes')
                        showToast('Gestion des commandes ouverte')
                      }}
                      className="inline-flex items-center gap-1.5 font-bold text-[#006B55] hover:text-[#008F72] hover:underline"
                    >
                      Voir toutes les commandes
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Right Card: Produits les plus vendus / Catalogue actif */}
                <div className="flex flex-col justify-between rounded-2xl border border-[#DCE8E3] bg-white p-5 shadow-[0_1px_3px_rgba(16,42,42,0.04)] sm:p-6 xl:col-span-5">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#E8F0ED] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-base font-extrabold text-[#102A2A]">
                            Catalogue & Ventes
                          </h2>
                          <span className="rounded-md bg-[#E7F2EF] px-2 py-0.5 text-[11px] font-bold text-[#006B55]">
                            {storeProducts.length} référence{storeProducts.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#60716F]">
                          Articles en ligne sur votre boutique officielle
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddProductOpen(true)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#DCE8E3] bg-[#F7FAF9] px-2.5 py-1 text-xs font-bold text-[#006B55] hover:bg-[#E7F2EF] transition"
                      >
                        <Plus size={13} />
                        Ajouter
                      </button>
                    </div>

                    {/* List of Real Products or Empty State */}
                    {storeProducts.length === 0 ? (
                      <div className="py-12 text-center text-xs space-y-2">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#E7F2EF] text-[#006B55]">
                          <PackageOpen size={22} />
                        </div>
                        <p className="font-bold text-[#102A2A] text-sm mt-3">
                          Votre catalogue est encore vide
                        </p>
                        <p className="text-[#60716F] max-w-xs mx-auto">
                          Ajoutez vos premiers articles pour commencer à vendre et recevoir des commandes sur Dzora.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsAddProductOpen(true)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#006B55] px-4 py-2 font-bold text-white hover:bg-[#008F72] transition"
                        >
                          <Plus size={14} />
                          Ajouter mon premier produit
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3.5">
                        {bestProducts.slice(0, 5).map((prod) => (
                          <div
                            key={prod.id}
                            className="flex items-center gap-3.5 rounded-xl p-2 transition hover:bg-[#F7FAF9] border border-transparent hover:border-[#E8F0ED]"
                          >
                            {/* Thumbnail */}
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-[#DCE8E3] bg-white">
                              <Image
                                src={prod.imageUrl}
                                alt={prod.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>

                            {/* Title & Progress */}
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/produit/${prod.slug}`}
                                className="truncate text-xs font-bold text-[#102A2A] hover:text-[#006B55] block transition"
                              >
                                {prod.name}
                              </Link>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#E5EEEB]">
                                  <div
                                    className="h-full rounded-full bg-[#006B55]"
                                    style={{ width: `${prod.progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-[#71827D]">
                                  {prod.salesCount} vente{prod.salesCount > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="font-display text-xs font-extrabold text-[#102A2A]">
                                {prod.price}
                              </p>
                              <span className="text-[10px] text-[#71827D]">{prod.category}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-[#E8F0ED] pt-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveItem('cat-produits')
                        showToast('Catalogue des produits affiché')
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B55] hover:text-[#008F72] hover:underline"
                    >
                      Voir tout le catalogue ({storeProducts.length})
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Order Details Slide-Over Modal                                  */}
      {/* ------------------------------------------------------------------ */}
      {selectedOrderDetails && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-xl rounded-3xl border border-[#DCE8E3] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E8F0ED] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-[#006B55]">
                    {selectedOrderDetails.orderId}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      selectedOrderDetails.status === 'to_confirm'
                        ? 'border border-[#FEDF89] bg-[#FFF4E5] text-[#B54708]'
                        : selectedOrderDetails.status === 'preparing'
                        ? 'border border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]'
                        : selectedOrderDetails.status === 'shipped'
                        ? 'border border-[#E9D7FE] bg-[#F9F5FF] text-[#6941C6]'
                        : 'border border-[#CCE2DB] bg-[#EDF7F4] text-[#006B55]'
                    }`}
                  >
                    {selectedOrderDetails.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-[#60716F] mt-0.5">
                  Reçue le {selectedOrderDetails.date}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="rounded-xl p-1.5 text-[#60716F] hover:bg-[#F4FAF7] hover:text-[#102A2A]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {/* Client Info Card */}
              <div className="rounded-2xl border border-[#DCE8E3] bg-[#F7FBF9] p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#102A2A] text-sm">
                    {selectedOrderDetails.client}
                  </span>
                  {selectedOrderDetails.phone && (
                    <a
                      href={`tel:${selectedOrderDetails.phone}`}
                      className="inline-flex items-center gap-1 font-bold text-[#006B55] hover:underline"
                    >
                      <Phone size={12} />
                      {selectedOrderDetails.phone}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[#4A5D58]">
                  <MapPin size={14} className="text-[#008F72] shrink-0" />
                  <span>
                    {selectedOrderDetails.wilaya} {selectedOrderDetails.commune ? `· ${selectedOrderDetails.commune}` : ''}
                  </span>
                </div>

                {selectedOrderDetails.address && (
                  <p className="text-[11px] text-[#60716F] pl-5">
                    {selectedOrderDetails.address}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div>
                <p className="text-xs font-bold text-[#71827D] uppercase tracking-wider mb-2">
                  Articles commandés ({selectedOrderDetails.items.length})
                </p>
                <div className="space-y-2">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-[#E8F0ED] p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {it.image ? (
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-[#DCE8E3]">
                            <Image
                              src={it.image}
                              alt={it.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="grid size-10 place-items-center rounded-lg bg-[#E7F2EF] text-[#006B55]">
                            <Package size={16} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#102A2A]">{it.name}</p>
                          <p className="text-[11px] text-[#71827D]">
                            Quantité : <strong>{it.quantity}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-display font-extrabold text-[#102A2A]">
                        {(it.price * it.quantity).toLocaleString('fr-DZ')} DA
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Total summary */}
              <div className="rounded-2xl border border-[#DCE8E3] bg-white p-4 text-xs space-y-2">
                <div className="flex justify-between text-[#60716F]">
                  <span>Mode de règlement :</span>
                  <span className="font-bold text-[#102A2A]">
                    {selectedOrderDetails.paymentMethodLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-[#E8F0ED] pt-2">
                  <span className="text-sm font-bold text-[#102A2A]">Total à percevoir</span>
                  <span className="font-display text-lg font-extrabold text-[#006B55]">
                    {selectedOrderDetails.total}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8F0ED] pt-4">
              <button
                type="button"
                onClick={() => showToast('Bordereau Yalidine envoyé à l’impression')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE8E3] px-3 py-2 text-xs font-bold text-[#4A5D58] hover:bg-[#F4FAF7]"
              >
                <Printer size={14} />
                Bordereau
              </button>

              <div className="flex items-center gap-2">
                {selectedOrderDetails.status === 'to_confirm' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateOrderStatus(selectedOrderDetails.orderId, 'preparing')
                    }
                    className="rounded-xl bg-[#006B55] px-4 py-2 text-xs font-bold text-white hover:bg-[#008F72] transition"
                  >
                    Valider la commande
                  </button>
                )}

                {selectedOrderDetails.status === 'preparing' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateOrderStatus(selectedOrderDetails.orderId, 'shipped')
                    }
                    className="rounded-xl bg-[#6941C6] px-4 py-2 text-xs font-bold text-white hover:bg-[#7E56D9] transition"
                  >
                    Marquer comme expédiée
                  </button>
                )}

                {selectedOrderDetails.status === 'shipped' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateOrderStatus(selectedOrderDetails.orderId, 'delivered')
                    }
                    className="rounded-xl bg-[#006B55] px-4 py-2 text-xs font-bold text-white hover:bg-[#008F72] transition"
                  >
                    Confirmer la livraison
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="rounded-xl border border-[#DCE8E3] px-3.5 py-2 text-xs font-bold text-[#60716F] hover:bg-[#F4FAF7]"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. Add Product Modal                                               */}
      {/* ------------------------------------------------------------------ */}
      {isAddProductOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-[#DCE8E3] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8F0ED] pb-4">
              <div>
                <h3 className="font-display text-lg font-extrabold text-[#102A2A]">
                  Ajouter un nouveau produit
                </h3>
                <p className="text-xs text-[#60716F]">
                  Mettez en ligne une référence sur votre boutique {storeDisplayName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="rounded-xl p-1.5 text-[#60716F] hover:bg-[#F4FAF7]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#102A2A] mb-1">Nom du produit *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Smartphone 5G 256 Go…"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] px-3 font-medium outline-none transition focus:border-[#008F72] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">Catégorie *</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] px-3 font-medium outline-none transition focus:border-[#008F72] focus:bg-white"
                  >
                    <option value="Électronique">Électronique</option>
                    <option value="High-Tech">High-Tech</option>
                    <option value="Mode">Mode</option>
                    <option value="Maison & Cuisine">Maison & Cuisine</option>
                    <option value="Beauté & Santé">Beauté & Santé</option>
                    <option value="Auto & Moto">Auto & Moto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Prix de vente (DA) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ex : 14500"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] px-3 font-medium outline-none transition focus:border-[#008F72] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">
                    Stock disponible (unités)
                  </label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] px-3 font-medium outline-none transition focus:border-[#008F72] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102A2A] mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#DCE8E3] bg-[#F7FAF9] px-3 font-medium outline-none transition focus:border-[#008F72] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E8F0ED] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="rounded-xl border border-[#DCE8E3] px-4 py-2.5 font-bold text-[#60716F] hover:bg-[#F4FAF7]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#006B55] px-5 py-2.5 font-bold text-white hover:bg-[#008F72] transition"
                >
                  Publier l’article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. Accessible Toast Notification                                   */}
      {/* ------------------------------------------------------------------ */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-[#CCE2DB] bg-white px-4 py-3 text-xs font-bold text-[#102A2A] shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="grid size-5 place-items-center rounded-full bg-[#006B55] text-white">
            <Check size={12} strokeWidth={3} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default function SellerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4FAF7] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
          <p className="text-sm font-bold text-[#102A2A]">Chargement de votre tableau de bord…</p>
        </div>
      }
    >
      <SellerDashboardContent />
    </Suspense>
  )
}
