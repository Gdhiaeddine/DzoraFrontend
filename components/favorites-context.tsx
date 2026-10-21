'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'

export interface FavoriteItem {
  id: string
  name: string
  price?: number | string
  currentPrice?: number
  previousPrice?: number
  discount?: string
  image: string
  category?: string
  rating?: number
  reviews?: string | number
  link?: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  favoritesCount: number
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: FavoriteItem) => boolean
  removeFavorite: (productId: string) => void
  promptLogin: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Trigger login modal via global selector
  const promptLogin = useCallback(() => {
    if (typeof document !== 'undefined') {
      const loginTrigger = document.querySelector('[data-open-login="true"]') as HTMLElement | null
      if (loginTrigger) {
        loginTrigger.click()
      } else {
        window.dispatchEvent(new CustomEvent('dzora:open-login'))
      }
    }
  }, [])

  // Load favorites for the currently logged-in user
  useEffect(() => {
    if (!user?.id) {
      setFavorites([])
      setIsLoaded(true)
      return
    }

    try {
      const storageKey = `dzora_favorites_${user.id}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      } else {
        setFavorites([])
      }
    } catch (e) {
      console.warn('Failed to load favorites for user', e)
      setFavorites([])
    } finally {
      setIsLoaded(true)
    }
  }, [user?.id])

  // Save favorites to user-scoped storage whenever they change
  useEffect(() => {
    if (!isLoaded || !user?.id) return
    try {
      const storageKey = `dzora_favorites_${user.id}`
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch (e) {
      console.warn('Failed to save favorites for user', e)
    }
  }, [favorites, user?.id, isLoaded])

  const isFavorite = useCallback(
    (productId: string) => {
      if (!user?.id) return false
      return favorites.some((item) => String(item.id) === String(productId))
    },
    [favorites, user?.id]
  )

  const toggleFavorite = useCallback(
    (product: FavoriteItem): boolean => {
      // Only authenticated users can save favorites in their account
      if (!user?.id) {
        promptLogin()
        return false
      }

      let nextLiked = false
      setFavorites((prev) => {
        const exists = prev.some((item) => String(item.id) === String(product.id))
        if (exists) {
          nextLiked = false
          return prev.filter((item) => String(item.id) !== String(product.id))
        } else {
          nextLiked = true
          return [...prev, product]
        }
      })

      return nextLiked
    },
    [user?.id, promptLogin]
  )

  const removeFavorite = useCallback(
    (productId: string) => {
      if (!user?.id) return
      setFavorites((prev) => prev.filter((item) => String(item.id) !== String(productId)))
    },
    [user?.id]
  )

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesCount: favorites.length,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        promptLogin,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
