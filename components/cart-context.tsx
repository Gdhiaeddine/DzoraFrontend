'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  variant?: string
  description?: string
  currentPrice: number
  previousPrice?: number
  discount?: string
  quantity: number
  image: string
  link?: string
}

export interface UserProfile {
  id?: string
  firstName?: string
  lastName?: string
  fullName: string
  phone: string
  email?: string
  roles?: string[]
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  addToCart: (itemOrCount?: CartItem | number) => void
  setCartCount: React.Dispatch<React.SetStateAction<number>>
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  user: UserProfile | null
  login: (user: UserProfile) => void
  logout: () => void
  mergeGuestCart: () => number
  justMergedCart: boolean
  dismissMergeNotice: () => void
}

const GUEST_CART_KEY = 'dzora_guest_cart'
const USER_CART_KEY = 'dzora_user_cart'

const INITIAL_DEMO_ITEMS: CartItem[] = [
  {
    id: 'samsung-a15',
    name: 'Samsung Galaxy A15 128 Go',
    variant: 'Bleu nuit · 4 Go RAM',
    currentPrice: 34990,
    previousPrice: 42990,
    discount: '−19 %',
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=85',
    link: '/produit/galaxy-a15',
  },
  {
    id: 'tws-earbuds',
    name: 'Écouteurs Bluetooth TWS',
    description: 'Sans fil · Boîtier de recharge',
    currentPrice: 3990,
    previousPrice: 5200,
    discount: '−23 %',
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=400&q=85',
    link: '/produit/galaxy-a15',
  },
]

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [justMergedCart, setJustMergedCart] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Calculate total count across items
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  // Load cart from localStorage or backend
  useEffect(() => {
    try {
      const storageKey = user ? USER_CART_KEY : GUEST_CART_KEY
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('dzora_cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e)
    } finally {
      setIsInitialized(true)
    }
  }, [user])

  // Save changes to localStorage
  useEffect(() => {
    if (!isInitialized) return
    try {
      const storageKey = user ? USER_CART_KEY : GUEST_CART_KEY
      localStorage.setItem(storageKey, JSON.stringify(cartItems))
      localStorage.setItem('dzora_cart', JSON.stringify(cartItems))
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e)
    }
  }, [cartItems, user, isInitialized])

  /**
   * Seamlessly merges guest cart into user cart when user logs in
   */
  const mergeGuestCart = (): number => {
    try {
      const guestData = localStorage.getItem(GUEST_CART_KEY)
      if (!guestData) return 0

      const guestItems: CartItem[] = JSON.parse(guestData)
      if (!Array.isArray(guestItems) || guestItems.length === 0) return 0

      setCartItems((prevItems) => {
        const merged = [...prevItems]
        for (const guestItem of guestItems) {
          const existingIdx = merged.findIndex(
            (i) => i.id === guestItem.id || (i.name === guestItem.name && i.variant === guestItem.variant)
          )
          if (existingIdx !== -1) {
            merged[existingIdx] = {
              ...merged[existingIdx],
              quantity: merged[existingIdx].quantity + (guestItem.quantity || 1),
            }
          } else {
            merged.push(guestItem)
          }
        }
        return merged
      })

      // Clean up guest cart once merged into user session
      localStorage.removeItem(GUEST_CART_KEY)
      setJustMergedCart(true)
      return guestItems.length
    } catch {
      return 0
    }
  }

  const addToCart = (itemOrCount?: CartItem | number) => {
    if (typeof itemOrCount === 'object' && itemOrCount !== null) {
      setCartItems((prev) => {
        const itemQuantity = Math.max(1, itemOrCount.quantity || 1)
        const idx = prev.findIndex(
          (i) => i.id === itemOrCount.id || (i.name === itemOrCount.name && i.variant === itemOrCount.variant)
        )
        if (idx !== -1) {
          const updated = [...prev]
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + itemQuantity,
          }
          return updated
        }
        return [...prev, { ...itemOrCount, quantity: itemQuantity }]
      })
    } else {
      // Generic count increment for demo buttons / compatibility
      const count = typeof itemOrCount === 'number' ? Math.max(1, itemOrCount) : 1
      setCartItems((prev) => {
        if (prev.length > 0) {
          const copy = [...prev]
          copy[0] = { ...copy[0], quantity: copy[0].quantity + count }
          return copy
        }
        // If cart is empty, add the default featured product
        return [{ ...INITIAL_DEMO_ITEMS[0], quantity: count }]
      })
    }
  }

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    )
  }

  const setCartCount: React.Dispatch<React.SetStateAction<number>> = () => {
    // compatibility stub
  }

  const login = (newUser: UserProfile) => {
    setUser(newUser)
    // Perform guest-to-user cart merge automatically upon login!
    mergeGuestCart()
  }

  const logout = () => {
    setUser(null)
  }

  const dismissMergeNotice = () => {
    setJustMergedCart(false)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        setCartCount,
        removeItem,
        updateQuantity,
        user,
        login,
        logout,
        mergeGuestCart,
        justMergedCart,
        dismissMergeNotice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
