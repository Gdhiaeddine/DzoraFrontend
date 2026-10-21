'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, User, LoginResult, getAccessToken } from './api'
import { useCart } from '@/components/cart-context'

interface Pending2Fa {
  tempToken: string;
  email?: string;
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  pending2Fa: Pending2Fa | null
  sendOtp: (phone: string, options?: { checkNewUser?: boolean; checkExistence?: boolean; purpose?: string }) => Promise<{ success: boolean; exists?: boolean; cooldownSeconds: number; message: string; otpCodeForDev?: string }>
  verifyOtp: (phone: string, code: string) => Promise<{ user: User; isNewUser?: boolean; profileComplete?: boolean }>
  completeProfile: (data: { firstName: string; lastName: string; dateOfBirth?: string }) => Promise<User>
  loginWithPassword: (email: string, password: string) => Promise<LoginResult>
  registerWithPassword: (data: { email: string; password: string; fullName?: string; phone?: string }) => Promise<User>
  complete2Fa: (code: string) => Promise<User>
  cancel2Fa: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>,
  /** Exposed for external callers (e.g., OAuth callback) */
  handleAuthSuccess: (authUser: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pending2Fa, setPending2Fa] = useState<Pending2Fa | null>(null)
  const { login: syncCartUser, logout: clearCartUser } = useCart()

  // On initial mount, restore session reliably without kicking user out on refresh
  useEffect(() => {
    let isMounted = true

    async function checkExistingSession() {
      // 1. Immediately hydrate cached user from sessionStorage or localStorage if available
      const storedToken = getAccessToken()
      const storedUserRaw =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('dzora_user') || localStorage.getItem('dzora_user')
          : null
      let cachedUser: User | null = null
      if (storedUserRaw) {
        try {
          cachedUser = JSON.parse(storedUserRaw)
          if (cachedUser && isMounted) {
            setUser(cachedUser)
          }
        } catch {
          // ignore corrupted JSON
        }
      }

      // 2. Tier 1: If an access token exists, verify it with getMe()
      if (storedToken) {
        try {
          const freshUser = await api.auth.getMe()
          if (freshUser && isMounted) {
            handleAuthSuccess(freshUser)
            setIsLoading(false)
            return
          }
        } catch (err: any) {
          // If network error (not 401 unauthenticated), preserve cached session
          if (err?.statusCode && err.statusCode !== 401 && cachedUser && isMounted) {
            setIsLoading(false)
            return
          }
          // If 401, token expired: fall through to Tier 2 refresh
        }
      }

      // 3. Tier 2: Silent refresh token rotation via HttpOnly cookie
      try {
        const refreshRes = await api.auth.refreshToken()
        if (refreshRes?.accessToken && isMounted) {
          let freshUser: User | null = null
          try {
            freshUser = await api.auth.getMe()
          } catch {
            freshUser = cachedUser
          }
          if (freshUser && isMounted) {
            handleAuthSuccess(freshUser)
            setIsLoading(false)
            return
          }
        }
      } catch {
        // Refresh token failed or missing
      }

      // 4. Tier 3: If both direct token check and refresh failed, clean up session
      if (isMounted) {
        setUser(null)
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('dzora_user')
          sessionStorage.removeItem('dzora_at')
          localStorage.removeItem('dzora_user')
          localStorage.removeItem('dzora_at')
        }
        setIsLoading(false)
      }
    }

    checkExistingSession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser)
    setPending2Fa(null)

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dzora_user', JSON.stringify(authUser))
      localStorage.setItem('dzora_user', JSON.stringify(authUser))
    }

    // Sync user into cart context and automatically trigger guest-to-user cart merge!
    syncCartUser({
      id: authUser.id,
      fullName: authUser.fullName || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'Client Dzora',
      phone: authUser.phone || '',
      email: authUser.email || undefined,
      roles: authUser.roles,
    })
  }

  const sendOtp = async (phone: string, options?: { checkNewUser?: boolean; checkExistence?: boolean; purpose?: string }) => {
    return api.auth.sendOtp(phone, options)
  }

  const verifyOtp = async (phone: string, code: string): Promise<{ user: User; isNewUser?: boolean; profileComplete?: boolean }> => {
    const res = await api.auth.verifyOtp(phone, code)
    handleAuthSuccess(res.user)
    return {
      user: res.user,
      isNewUser: res.isNewUser,
      profileComplete: res.profileComplete,
    }
  }

  const completeProfile = async (data: { firstName: string; lastName: string; dateOfBirth?: string }): Promise<User> => {
    const updatedUser = await api.auth.completeProfile(data)
    handleAuthSuccess(updatedUser)
    return updatedUser
  }

  const loginWithPassword = async (email: string, password: string): Promise<LoginResult> => {
    const result = await api.auth.loginWithPassword(email, password)

    if (result.requires2Fa && result.tempToken) {
      setPending2Fa({
        tempToken: result.tempToken,
        email,
      })
      return result
    }

    if (result.user) {
      handleAuthSuccess(result.user)
    }

    return result
  }

  const registerWithPassword = async (data: { email: string; password: string; fullName?: string; phone?: string }): Promise<User> => {
    const res = await api.auth.registerWithPassword(data)
    handleAuthSuccess(res.user)
    return res.user
  }

  const complete2Fa = async (code: string): Promise<User> => {
    if (!pending2Fa?.tempToken) {
      throw new Error('Aucune vérification 2FA en attente.')
    }

    const res = await api.auth.loginWith2Fa(pending2Fa.tempToken, code)
    handleAuthSuccess(res.user)
    return res.user
  }

  const cancel2Fa = () => {
    setPending2Fa(null)
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } finally {
      setUser(null)
      setPending2Fa(null)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('dzora_user')
        sessionStorage.removeItem('dzora_at')
        localStorage.removeItem('dzora_user')
        localStorage.removeItem('dzora_at')
      }
      clearCartUser()
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await api.auth.getMe()
      if (currentUser) {
        handleAuthSuccess(currentUser)
        return
      }
    } catch {
      try {
        const res = await api.auth.refreshToken()
        if (res?.accessToken) {
          const currentUser = await api.auth.getMe()
          if (currentUser) {
            handleAuthSuccess(currentUser)
          }
        }
      } catch {
        // Keep existing user state if refresh fails temporarily
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        pending2Fa,
        sendOtp,
        verifyOtp,
        completeProfile,
        loginWithPassword,
        registerWithPassword,
        complete2Fa,
        cancel2Fa,
        handleAuthSuccess,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
