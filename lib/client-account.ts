/**
 * Client Account Data Manager
 * Handles client user-specific persistence for Orders, Delivery Addresses, and Payment Preferences
 */

export interface ClientOrder {
  orderId: string
  date: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  statusLabel: string
  clientName: string
  phone: string
  wilaya: string
  commune: string
  address: string
  deliveryType: string
  deliveryFee: number
  totalAmount: number
  paymentMethod: 'COD' | 'CIB' | 'BANK'
  paymentMethodLabel: string
  itemsCount?: number
}

export interface ClientAddress {
  id: string
  title: string
  fullName: string
  phone: string
  wilaya: string
  commune: string
  address: string
  isDefault: boolean
  updatedAt?: string
}

export type PaymentMethodType = 'COD' | 'CIB' | 'BANK'

export interface PaymentMethodInfo {
  type: PaymentMethodType
  title: string
  subtitle: string
  description: string
  badgeText: string
}

export const PAYMENT_METHODS: Record<PaymentMethodType, PaymentMethodInfo> = {
  COD: {
    type: 'COD',
    title: 'Cash (COD)',
    subtitle: 'Paiement à la livraison',
    description: 'Règlement en espèces en dinars algériens (DA) directement auprès du livreur à la réception.',
    badgeText: 'Paiement par défaut',
  },
  CIB: {
    type: 'CIB',
    title: 'CIB / Edahabia',
    subtitle: 'Paiement en ligne',
    description: 'Paiement électronique instantané par carte bancaire CIB ou carte Edahabia d’Algérie Poste.',
    badgeText: 'Paiement électronique',
  },
  BANK: {
    type: 'BANK',
    title: 'Virement bancaire',
    subtitle: 'Virement ou CCP',
    description: 'Règlement sécurisé par virement bancaire direct ou mandat CCP avant expédition de votre colis.',
    badgeText: 'Virement direct',
  },
}

function getSafeStorageKey(prefix: string, userId?: string | null): string {
  if (userId) return `${prefix}_${userId}`
  return `${prefix}_guest`
}

/**
 * Retrieves orders for the specific client user
 */
export function getClientOrders(userId?: string | null): ClientOrder[] {
  if (typeof window === 'undefined') return []

  const key = getSafeStorageKey('dzora_orders', userId)
  const stored = localStorage.getItem(key)
  let orders: ClientOrder[] = []

  if (stored) {
    try {
      orders = JSON.parse(stored)
    } catch {
      orders = []
    }
  }

  // Also check if there's a recent order from checkout (sessionStorage or localStorage) to auto-merge
  try {
    const sessionLastOrder = sessionStorage.getItem('dzora_last_order')
    if (sessionLastOrder) {
      const parsed = JSON.parse(sessionLastOrder)
      if (parsed && parsed.orderId && !orders.some((o) => o.orderId === parsed.orderId)) {
        const mappedOrder: ClientOrder = {
          orderId: parsed.orderId,
          date: parsed.date || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
          status: 'PENDING',
          statusLabel: 'En cours de préparation',
          clientName: parsed.clientName || 'Client',
          phone: parsed.phone || '',
          wilaya: parsed.wilaya || 'Alger',
          commune: parsed.commune || '',
          address: parsed.address || '',
          deliveryType: parsed.deliveryType || 'Livraison à domicile',
          deliveryFee: parsed.deliveryFee || 400,
          totalAmount: parsed.totalAmount || 0,
          paymentMethod: 'COD',
          paymentMethodLabel: 'Cash à la livraison (COD)',
          itemsCount: 1,
        }
        orders = [mappedOrder, ...orders]
        localStorage.setItem(key, JSON.stringify(orders))
      }
    }
  } catch {
    // Ignore storage parse error
  }

  return orders
}

/**
 * Saves a new order to the client's order history
 */
export function saveClientOrder(order: Partial<ClientOrder>, userId?: string | null): ClientOrder {
  const fullOrder: ClientOrder = {
    orderId: order.orderId || `DZ-${Math.floor(100000 + Math.random() * 900000)}`,
    date: order.date || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    status: order.status || 'PENDING',
    statusLabel: order.statusLabel || 'En cours de préparation',
    clientName: order.clientName || 'Client Dzora',
    phone: order.phone || '',
    wilaya: order.wilaya || 'Alger',
    commune: order.commune || '',
    address: order.address || '',
    deliveryType: order.deliveryType || 'Livraison à domicile',
    deliveryFee: order.deliveryFee || 400,
    totalAmount: order.totalAmount || 0,
    paymentMethod: order.paymentMethod || 'COD',
    paymentMethodLabel: order.paymentMethodLabel || 'Cash à la livraison (COD)',
    itemsCount: order.itemsCount || 1,
  }

  if (typeof window !== 'undefined') {
    const key = getSafeStorageKey('dzora_orders', userId)
    const existing = getClientOrders(userId)
    const updated = [fullOrder, ...existing.filter((o) => o.orderId !== fullOrder.orderId)]
    localStorage.setItem(key, JSON.stringify(updated))
  }

  return fullOrder
}

/**
/**
 * Retrieves all delivery addresses for the specific client user
 */
export function getClientAddresses(userId?: string | null): ClientAddress[] {
  if (typeof window === 'undefined') return []

  const listKey = getSafeStorageKey('dzora_addresses', userId)
  const storedList = localStorage.getItem(listKey)
  let addresses: ClientAddress[] = []

  if (storedList) {
    try {
      addresses = JSON.parse(storedList)
    } catch {
      addresses = []
    }
  }

  // If no address array exists, check legacy single address key
  if (addresses.length === 0) {
    const singleKey = getSafeStorageKey('dzora_address', userId)
    const singleStored = localStorage.getItem(singleKey)
    if (singleStored) {
      try {
        const parsed = JSON.parse(singleStored)
        if (parsed && parsed.wilaya) {
          addresses = [parsed]
          localStorage.setItem(listKey, JSON.stringify(addresses))
        }
      } catch {
        // Ignore
      }
    }
  }

  // Fallback to checking last order if still empty
  if (addresses.length === 0) {
    try {
      const sessionLastOrder = sessionStorage.getItem('dzora_last_order')
      if (sessionLastOrder) {
        const parsed = JSON.parse(sessionLastOrder)
        if (parsed && parsed.wilaya) {
          const addressFromOrder: ClientAddress = {
            id: 'addr_default',
            title: 'Adresse principale',
            fullName: parsed.clientName || '',
            phone: parsed.phone || '',
            wilaya: parsed.wilaya || '',
            commune: parsed.commune || '',
            address: parsed.address || '',
            isDefault: true,
            updatedAt: new Date().toISOString(),
          }
          addresses = [addressFromOrder]
          localStorage.setItem(listKey, JSON.stringify(addresses))
          localStorage.setItem(getSafeStorageKey('dzora_address', userId), JSON.stringify(addressFromOrder))
        }
      }
    } catch {
      // Ignore
    }
  }

  return addresses
}

/**
 * Saves all delivery addresses for the client user
 */
export function saveClientAddresses(addresses: ClientAddress[], userId?: string | null): void {
  if (typeof window === 'undefined') return
  const listKey = getSafeStorageKey('dzora_addresses', userId)
  localStorage.setItem(listKey, JSON.stringify(addresses))

  // Sync primary address key for backward compatibility
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0] || null
  const singleKey = getSafeStorageKey('dzora_address', userId)
  if (defaultAddr) {
    localStorage.setItem(singleKey, JSON.stringify(defaultAddr))
  } else {
    localStorage.removeItem(singleKey)
  }
}

/**
 * Retrieves the client's primary/default delivery address
 */
export function getClientPrimaryAddress(userId?: string | null): ClientAddress | null {
  const addresses = getClientAddresses(userId)
  if (addresses.length === 0) return null
  return addresses.find((a) => a.isDefault) || addresses[0] || null
}

/**
 * Saves or updates a specific delivery address
 */
export function saveOrUpdateClientAddress(
  address: Partial<ClientAddress>,
  userId?: string | null,
): ClientAddress {
  const addresses = getClientAddresses(userId)
  const isEditing = Boolean(address.id && addresses.some((a) => a.id === address.id))
  const addressId = address.id || `addr_${Date.now()}`
  const shouldBeDefault = address.isDefault ?? (addresses.length === 0)

  const updatedItem: ClientAddress = {
    id: addressId,
    title: address.title || (shouldBeDefault ? 'Adresse principale' : 'Autre adresse'),
    fullName: address.fullName || '',
    phone: address.phone || '',
    wilaya: address.wilaya || '',
    commune: address.commune || '',
    address: address.address || '',
    isDefault: shouldBeDefault,
    updatedAt: new Date().toISOString(),
  }

  let newAddresses: ClientAddress[]
  if (isEditing) {
    newAddresses = addresses.map((a) => {
      if (a.id === addressId) {
        return updatedItem
      }
      return shouldBeDefault ? { ...a, isDefault: false } : a
    })
  } else {
    const existing = shouldBeDefault
      ? addresses.map((a) => ({ ...a, isDefault: false }))
      : addresses
    newAddresses = [updatedItem, ...existing]
  }

  saveClientAddresses(newAddresses, userId)
  return updatedItem
}

/**
 * Saves or updates the client's primary delivery address (backward compatibility)
 */
export function saveClientPrimaryAddress(
  address: Partial<ClientAddress>,
  userId?: string | null,
): ClientAddress {
  return saveOrUpdateClientAddress({ ...address, isDefault: true }, userId)
}

/**
 * Deletes a delivery address by ID
 */
export function deleteClientAddress(addressId: string, userId?: string | null): ClientAddress[] {
  const addresses = getClientAddresses(userId)
  const target = addresses.find((a) => a.id === addressId)
  let updated = addresses.filter((a) => a.id !== addressId)

  // If deleted address was default, make the first remaining address default
  if (target?.isDefault && updated.length > 0) {
    updated[0].isDefault = true
  }

  saveClientAddresses(updated, userId)
  return updated
}

/**
 * Sets an address as the default delivery address
 */
export function setDefaultClientAddress(addressId: string, userId?: string | null): ClientAddress[] {
  const addresses = getClientAddresses(userId)
  const updated = addresses.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }))

  saveClientAddresses(updated, userId)
  return updated
}

/**
 * Retrieves the client's preferred payment method
 */
export function getClientPaymentMethod(userId?: string | null): PaymentMethodType {
  if (typeof window === 'undefined') return 'COD'

  const key = getSafeStorageKey('dzora_payment_pref', userId)
  const stored = localStorage.getItem(key) as PaymentMethodType | null
  if (stored && ['COD', 'CIB', 'BANK'].includes(stored)) {
    return stored
  }
  return 'COD'
}

/**
 * Saves the client's preferred payment method
 */
export function saveClientPaymentMethod(method: PaymentMethodType, userId?: string | null): void {
  if (typeof window === 'undefined') return
  const key = getSafeStorageKey('dzora_payment_pref', userId)
  localStorage.setItem(key, method)
}
