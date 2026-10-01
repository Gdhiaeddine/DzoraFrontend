'use client'

import React, { createContext, useContext, useState } from 'react'

interface CartContextType {
  cartCount: number
  addToCart: (count?: number) => void
  setCartCount: React.Dispatch<React.SetStateAction<number>>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(2)

  const addToCart = (count = 1) => {
    setCartCount((prev) => prev + count)
  }

  return (
    <CartContext.Provider value={{ cartCount, addToCart, setCartCount }}>
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
