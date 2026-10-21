/**
 * Dzora Marketplace API Client
 * Supports automatic JWT token attachment, refresh token cookie rotation, and error handling.
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface User {
  id: string;
  phone?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string;
  roles: string[];
  phoneVerified: boolean;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
  avatarUrl?: string | null;
  createdAt?: string | Date;
}

export interface AdminUserItem {
  id: string;
  phone?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  sellerProfile?: {
    id: string;
    storeName: string | null;
    slug: string | null;
    status: string;
    type: string | null;
  } | null;
}

export interface AdminAuditLogItem {
  id: string;
  action: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface OtpPreviewResponse {
  active: boolean;
  code?: string;
  ttlSeconds?: number;
  attempts?: number;
  createdAt?: number;
  message?: string;
}

export interface AdminUserDetails extends AdminUserItem {
  recoveryCodesCount?: number;
  auditLogs?: AdminAuditLogItem[];
  sellerProfile?: {
    id: string;
    userId?: string;
    storeName: string | null;
    slug: string | null;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    type: string | null;
    status: SellerStatusType | string;
    category?: string | null;
    wilaya?: string | null;
    commune?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    coveredWilayas?: string[];
    deliveryHome?: boolean;
    deliveryDesk?: boolean;
    legalStatus?: string | null;
    businessName?: string | null;
    businessRegistration?: string | null;
    nifNumber?: string | null;
    nisNumber?: string | null;
    aiNumber?: string | null;
    ripCcp?: string | null;
    documents?: Record<string, any> | null;
    verificationStatus?: string | null;
    completionPercentage?: number;
    approvedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  sessions?: {
    id: string;
    deviceName?: string | null;
    userAgent?: string | null;
    ipAddress?: string | null;
    lastUsedAt: string;
    createdAt: string;
  }[];
}

export type SellerStatusType =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface SellerSubscriptionDetails {
  subscription: {
    id: string;
    planId: string;
    status: string;
    startDate: string;
    renewalDate: string;
    paymentMethod: string;
    autoRenew: boolean;
    ordersCountThisMonth: number;
  };
  plan: {
    id: string;
    name: string;
    badgeText: string;
    priceDa: number;
    billingPeriod: string;
    commissionRate: number;
    maxProducts: number;
    maxMonthlyOrders: number;
    maxStaffAccounts: number;
    customizationLevel: string;
    advancedStats: boolean;
    csvImportExport: boolean;
    couponsLevel: string;
    apiAccess: boolean;
    supportType: string;
    logisticsSync: boolean;
    customDomain: boolean;
    multiPixels: boolean;
    popular?: boolean;
  };
  quotas: {
    productsUsed: number;
    productsMax: number;
    ordersUsed: number;
    ordersMax: number;
    staffAccountsMax: number;
    commissionRate: number;
    remainingDays: number;
  };
  features: {
    logisticsSync: boolean;
    customDomain: boolean;
    multiPixels: boolean;
    apiAccess: boolean;
    advancedStats: boolean;
    supportType: string;
    customizationLevel: string;
    csvImportExport: boolean;
    couponsLevel: string;
  };
}

export type SellerTypeEnum = 'PHYSICAL_STORE' | 'ECOMMERCE';

export type LegalStatusType = 'INDIVIDUAL' | 'AUTO_ENTREPRENEUR' | 'COMPANY';

export type VerificationStatusType =
  | 'REGISTERED'
  | 'PHONE_VERIFIED'
  | 'DOCUMENTS_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED';

export interface AdminSellerItem {
  id: string;
  userId: string;
  type: SellerTypeEnum;
  storeName: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  category?: string | null;
  wilaya?: string | null;
  commune?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  coveredWilayas: string[];
  deliveryHome: boolean;
  deliveryDesk: boolean;
  legalStatus: LegalStatusType;
  businessName?: string | null;
  businessRegistration?: string | null;
  nifNumber?: string | null;
  nisNumber?: string | null;
  aiNumber?: string | null;
  ripCcp?: string | null;
  documents?: Record<string, any> | null;
  status: SellerStatusType;
  verificationStatus: VerificationStatusType;
  completionPercentage: number;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  };
}

export interface AdminSellerStats {
  totalSellers: number;
  approvedSellers: number;
  pendingReview: number;
  physicalStores: number;
  ecommerceStores: number;
}

export interface AdminSettingsData {
  general: {
    marketplaceName: string;
    tagline: string;
    contactEmail: string;
    supportPhone: string;
    headquartersAddress: string;
    timezone: string;
    defaultCurrency: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
    maintenanceNotice: string;
  };
  financial: {
    defaultCommissionRate: number;
    fixedOrderFee: number;
    sellerPayoutDelayDays: number;
    minimumPayoutAmount: number;
    enableCod: boolean;
    enableCibEdahabia: boolean;
    enableBankTransfer: boolean;
  };
  logistics: {
    freeShippingThreshold: number;
    maxDispatchDelayHours: number;
    returnWindowDays: number;
    integratedCarriers: {
      yalidine: boolean;
      procolis: boolean;
      maystro: boolean;
      zrExpress: boolean;
    };
    nationalCoverageWilayas: number;
  };
  security: {
    enforceAdmin2Fa: boolean;
    sessionTimeoutHours: number;
    minPasswordLength: number;
    requireStrongPassword: boolean;
    bruteForceProtection: boolean;
    maxFailedAttempts: number;
    ipWhitelistEnabled: boolean;
    ipWhitelist: string[];
  };
  notifications: {
    smsProvider: string;
    smsSenderName: string;
    smsOrderNotificationSeller: boolean;
    smsTrackingNotificationBuyer: boolean;
    emailTransactionalEnabled: boolean;
    emailSenderAddress: string;
    emailAdminDisputeAlerts: boolean;
  };
  sellers: {
    requireProductApproval: boolean;
    requireLegalDocuments: boolean;
    maxProductsForNewSellers: number;
    maxCancellationRatePercent: number;
  };
  system: {
    databaseBackupFrequency: 'DAILY' | 'WEEKLY';
    lastBackupAt: string;
    auditLogRetentionDays: number;
    appVersion: string;
    environment: string;
    servicesStatus: {
      database: 'UP' | 'DOWN';
      redis: 'UP' | 'DOWN';
      api: 'UP' | 'DOWN';
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface LoginResult {
  requires2Fa: boolean;
  tempToken?: string;
  accessToken?: string;
  tokens?: AuthTokens;
  user?: User;
}

export interface UserSessionItem {
  id: string;
  deviceName?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  lastUsedAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export interface TwoFactorSetupResult {
  secret: string;
  otpAuthUrl: string;
  qrCodeDataUrl: string;
}

export interface PublicStoreDetails {
  id: string;
  type: 'PHYSICAL_STORE' | 'ECOMMERCE';
  storeName: string;
  slug: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  category: string | null;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  coveredWilayas: string[];
  deliveryHome: boolean;
  deliveryDesk: boolean;
  createdAt: string;
  approvedAt: string | null;
}

// In-memory token storage (clean & safe against XSS)
let inMemoryAccessToken: string | null = null;
let refreshTokenPromise: Promise<{ accessToken: string; expiresAt?: string } | null> | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('dzora_at', token);
      localStorage.setItem('dzora_at', token);
    } else {
      sessionStorage.removeItem('dzora_at');
      localStorage.removeItem('dzora_at');
    }
  }
}

export function getAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== 'undefined') {
    inMemoryAccessToken =
      sessionStorage.getItem('dzora_at') || localStorage.getItem('dzora_at');
    return inMemoryAccessToken;
  }
  return null;
}

const API_BASE = '';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Include credentials for signed Fastify HttpOnly cookies
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);

    // If 401 and not already retrying, attempt refresh token rotation
    if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const refreshed = await api.auth.refreshToken();
      if (refreshed && refreshed.accessToken) {
        setAccessToken(refreshed.accessToken);
        return request<T>(endpoint, options, true);
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        (data && (data.message || data.error)) ||
        `Erreur HTTP: ${response.status} ${response.statusText}`;
      const error = new Error(
        Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
      );
      (error as any).statusCode = response.status;
      (error as any).data = data;
      throw error;
    }

    return data as T;
  } catch (err: any) {
    throw err;
  }
}

export const api = {
  auth: {
    // Phone OTP Flow
    sendOtp: async (phone: string, options?: { checkNewUser?: boolean; checkExistence?: boolean; purpose?: string }) => {
      return request<{ success: boolean; exists?: boolean; cooldownSeconds: number; message: string; otpCodeForDev?: string }>(
        '/api/v1/auth/send-otp',
        {
          method: 'POST',
          body: JSON.stringify({ phone, ...options }),
        },
      );
    },

    verifyOtp: async (phone: string, code: string) => {
      const result = await request<{ accessToken?: string; tokens?: AuthTokens; user: User; isNewUser?: boolean; profileComplete?: boolean }>(
        '/api/v1/auth/verify-otp',
        {
          method: 'POST',
          body: JSON.stringify({ phone, code }),
        },
      );
      const token = result.accessToken || result.tokens?.accessToken;
      if (token) {
        setAccessToken(token);
      }
      return result;
    },

    completeProfile: async (data: { firstName: string; lastName: string; dateOfBirth?: string }) => {
      const result = await request<{ user: User }>('/api/v1/auth/profile/complete', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result.user;
    },

    linkPhone: async (phone: string, code: string) => {
      return request<{ success: boolean; message: string; phone: string; phoneVerified: boolean }>(
        '/api/v1/auth/phone/link',
        {
          method: 'POST',
          body: JSON.stringify({ phone, code }),
        },
      );
    },

    // Password & Seller Login Flow
    loginWithPassword: async (email: string, password: string): Promise<LoginResult> => {
      const result = await request<LoginResult>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const token = result.accessToken || result.tokens?.accessToken;
      if (token) {
        setAccessToken(token);
      }
      return result;
    },

    registerWithPassword: async (data: { email: string; password: string; fullName?: string; phone?: string }) => {
      const parts = (data.fullName || '').trim().split(' ');
      const firstName = parts[0] || undefined;
      const lastName = parts.slice(1).join(' ') || undefined;

      const result = await request<{ accessToken?: string; tokens?: AuthTokens; user: User }>(
        '/api/v1/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            firstName,
            lastName,
            phone: data.phone,
          }),
        },
      );
      const token = result.accessToken || result.tokens?.accessToken;
      if (token) {
        setAccessToken(token);
      }
      return result;
    },

    // 2FA Flow
    loginWith2Fa: async (tempToken: string, code: string) => {
      const result = await request<{ accessToken?: string; tokens?: AuthTokens; user: User }>(
        '/api/v1/auth/2fa/login',
        {
          method: 'POST',
          body: JSON.stringify({ tempToken, code }),
        },
      );
      const token = result.accessToken || result.tokens?.accessToken;
      if (token) {
        setAccessToken(token);
      }
      return result;
    },

    // Dedicated Admin Login Flow (Secured & Hardened)
    loginAdminWithPassword: async (
      email: string,
      password: string,
      gatekeeperSecret?: string,
    ): Promise<LoginResult> => {
      const headers: Record<string, string> = {};
      if (gatekeeperSecret) {
        headers['x-admin-gatekeeper-secret'] = gatekeeperSecret;
      }

      try {
        const result = await request<LoginResult>('/api/v1/admin/auth/login', {
          method: 'POST',
          headers,
          body: JSON.stringify({ email, password }),
        });
        const token = result.accessToken || result.tokens?.accessToken;
        if (token) {
          setAccessToken(token);
        }
        return result;
      } catch (err: any) {
        if (err?.statusCode === 404) {
          return api.auth.loginWithPassword(email, password);
        }
        throw err;
      }
    },

    loginAdminWith2Fa: async (
      tempToken: string,
      code: string,
      gatekeeperSecret?: string,
    ) => {
      const headers: Record<string, string> = {};
      if (gatekeeperSecret) {
        headers['x-admin-gatekeeper-secret'] = gatekeeperSecret;
      }

      try {
        const result = await request<{
          accessToken?: string;
          tokens?: AuthTokens;
          user: User;
        }>('/api/v1/admin/auth/2fa/login', {
          method: 'POST',
          headers,
          body: JSON.stringify({ tempToken, code }),
        });
        const token = result.accessToken || result.tokens?.accessToken;
        if (token) {
          setAccessToken(token);
        }
        return result;
      } catch (err: any) {
        if (err?.statusCode === 404) {
          return api.auth.loginWith2Fa(tempToken, code);
        }
        throw err;
      }
    },

    setup2Fa: async () => {
      return request<TwoFactorSetupResult>('/api/v1/auth/2fa/setup', {
        method: 'POST',
      });
    },

    enable2Fa: async (code: string) => {
      return request<{ success: boolean; message: string; recoveryCodes: string[] }>(
        '/api/v1/auth/2fa/enable',
        {
          method: 'POST',
          body: JSON.stringify({ code }),
        },
      );
    },

    disable2Fa: async (code: string, password?: string) => {
      return request<{ success: boolean; message: string }>(
        '/api/v1/auth/2fa/disable',
        {
          method: 'POST',
          body: JSON.stringify({ code, password }),
        },
      );
    },

    regenerateRecoveryCodes: async (code: string) => {
      return request<{ success: boolean; message: string; recoveryCodes: string[] }>(
        '/api/v1/auth/2fa/recovery-codes',
        {
          method: 'POST',
          body: JSON.stringify({ code }),
        },
      );
    },

    verifyStepUp: async (code: string) => {
      return request<{ success: boolean; message: string; expiresInSeconds: number }>(
        '/api/v1/auth/2fa/verify-step-up',
        {
          method: 'POST',
          body: JSON.stringify({ code }),
        },
      );
    },

    // Token Session Refresh & Logout
    refreshToken: async () => {
      if (refreshTokenPromise) {
        return refreshTokenPromise;
      }

      refreshTokenPromise = (async () => {
        try {
          const result = await request<{ accessToken: string; expiresAt?: string }>(
            '/api/v1/auth/refresh',
            { method: 'POST' },
            true,
          );
          if (result?.accessToken) {
            setAccessToken(result.accessToken);
          }
          return result;
        } catch {
          // Do not destroy existing valid access token on failed refresh attempt
          return null;
        } finally {
          refreshTokenPromise = null;
        }
      })();

      return refreshTokenPromise;
    },

    logout: async () => {
      try {
        await request('/api/v1/auth/logout', { method: 'POST' });
      } finally {
        setAccessToken(null);
      }
    },

    // Google OAuth Link
    getGoogleAuthUrl: () => {
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/google`;
    },

    getMe: async () => {
      const res = await request<{ user: User }>('/api/v1/auth/me');
      return res.user;
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      return request<{ message: string }>('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    getSessions: async () => {
      return request<{ sessions: UserSessionItem[] }>('/api/v1/auth/sessions');
    },

    revokeSession: async (sessionId: string) => {
      return request<{ message: string }>(`/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
    },
  },

  seller: {
    getStatus: async () => {
      return request<{
        hasProfile: boolean;
        status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null;
        verificationStatus?: string | null;
        completionPercentage?: number;
        type?: 'PHYSICAL_STORE' | 'ECOMMERCE' | null;
        isApproved: boolean;
        storeName: string | null;
        slug: string | null;
        approvedAt: string | null;
      }>('/api/v1/seller/status');
    },

    getProfile: async () => {
      return request<any>('/api/v1/seller/profile');
    },

    getPublicStore: async (slug: string) => {
      return request<PublicStoreDetails>(`/api/v1/seller/store/${encodeURIComponent(slug)}`);
    },

    listApproved: async () => {
      return request<PublicStoreDetails[]>('/api/v1/seller/approved');
    },

    apply: async (data: {
      type: 'PHYSICAL_STORE' | 'ECOMMERCE';
      storeName: string;
      slug?: string;
      description?: string;
      logoUrl?: string;
      bannerUrl?: string;
      category?: string;
      wilaya?: string;
      commune?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      coveredWilayas?: string[];
      deliveryHome?: boolean;
      deliveryDesk?: boolean;
      legalStatus?: 'INDIVIDUAL' | 'AUTO_ENTREPRENEUR' | 'COMPANY';
      businessName?: string;
      businessRegistration?: string;
      nifNumber?: string;
      nisNumber?: string;
      aiNumber?: string;
      ripCcp?: string;
      documents?: Record<string, any>;
    }) => {
      return request<any>('/api/v1/seller/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateProfile: async (data: any) => {
      return request<any>('/api/v1/seller/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // ================= SELLER SUBSCRIPTION =================
    getSubscription: async () => {
      return request<SellerSubscriptionDetails>('/api/v1/seller/subscription');
    },

    getInvoices: async (params?: { page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{
        data: any[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/api/v1/seller/subscription/invoices${queryStr}`);
    },

    changePlan: async (data: {
      planId: string;
      billingCycle?: 'monthly' | 'yearly';
      paymentMethod?: string;
    }) => {
      return request<SellerSubscriptionDetails>('/api/v1/seller/subscription/change-plan', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  admin: {
    getUsers: async (params: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
    } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.search) searchParams.set('search', params.search);
      if (params.role) searchParams.set('role', params.role);
      if (params.status) searchParams.set('status', params.status);

      const qs = searchParams.toString();
      return request<{
        data: AdminUserItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        stats: {
          totalUsers: number;
          activeCustomers: number;
          sellersCount: number;
          twoFaCount: number;
        };
      }>(`/api/v1/admin/users${qs ? `?${qs}` : ''}`);
    },

    getUserById: async (id: string) => {
      return request<AdminUserDetails>(`/api/v1/admin/users/${id}`);
    },

    getLastOtp: async (id: string) => {
      return request<OtpPreviewResponse>(`/api/v1/admin/users/${id}/last-otp`);
    },

    adminChangePassword: async (id: string, newPassword: string) => {
      return request<{ success: boolean; message: string }>(
        `/api/v1/admin/users/${id}/change-password`,
        {
          method: 'POST',
          body: JSON.stringify({ newPassword }),
        },
      );
    },

    revokeUserSessions: async (id: string) => {
      return request<{ success: boolean; revokedCount: number; message: string }>(
        `/api/v1/admin/users/${id}/sessions`,
        {
          method: 'DELETE',
        },
      );
    },

    updateUserStatus: async (
      id: string,
      status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
      reason?: string,
    ) => {
      return request<{ success: boolean; user: AdminUserItem }>(
        `/api/v1/admin/users/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, reason }),
        },
      );
    },

    updateUserProfile: async (
      id: string,
      data: { firstName?: string; lastName?: string; email?: string; avatarUrl?: string | null },
    ) => {
      return request<AdminUserDetails>(
        `/api/v1/admin/users/${id}/profile`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        },
      );
    },

    // ================= SELLER ADMINISTRATION =================
    getSellers: async (params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      type?: string;
      wilaya?: string;
    } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.search) searchParams.set('search', params.search);
      if (params.status && params.status !== 'ALL') searchParams.set('status', params.status);
      if (params.type && params.type !== 'ALL') searchParams.set('type', params.type);
      if (params.wilaya && params.wilaya !== 'ALL') searchParams.set('wilaya', params.wilaya);

      const qs = searchParams.toString();
      return request<{
        data: AdminSellerItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        stats: AdminSellerStats;
      }>(`/api/v1/admin/sellers${qs ? `?${qs}` : ''}`);
    },

    getSellerById: async (id: string) => {
      return request<AdminSellerItem>(`/api/v1/admin/sellers/${id}`);
    },

    moveSellerToReview: async (id: string) => {
      return request<AdminSellerItem>(`/api/v1/admin/sellers/${id}/review`, {
        method: 'POST',
      });
    },

    approveSeller: async (id: string) => {
      return request<AdminSellerItem>(`/api/v1/admin/sellers/${id}/approve`, {
        method: 'POST',
      });
    },

    rejectSeller: async (id: string, reason?: string) => {
      return request<AdminSellerItem>(`/api/v1/admin/sellers/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },

    suspendSeller: async (id: string) => {
      return request<AdminSellerItem>(`/api/v1/admin/sellers/${id}/suspend`, {
        method: 'POST',
      });
    },

    updateSellerBranding: async (
      id: string,
      data: { logoUrl?: string | null; bannerUrl?: string | null },
    ) => {
      return request<any>(`/api/v1/admin/sellers/${id}/branding`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    // ================= PLATFORM SETTINGS =================
    getSettings: async () => {
      return request<AdminSettingsData>('/api/v1/admin/settings');
    },

    updateSettings: async (data: Partial<AdminSettingsData>) => {
      return request<AdminSettingsData>('/api/v1/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    purgeCache: async () => {
      return request<{ success: boolean; message: string; timestamp: string }>(
        '/api/v1/admin/settings/cache/purge',
        {
          method: 'POST',
        },
      );
    },

    // ================= SUBSCRIPTIONS =================
    getSubscriptionStats: async () => {
      return request<{
        mrr: number;
        paidSellersCount: number;
        trialSellersCount: number;
        totalSubscriptions: number;
        averageCommission: number;
        breakdown: Record<string, number>;
      }>('/api/v1/admin/subscriptions/stats');
    },

    getSubscriptionPlans: async () => {
      return request<any[]>('/api/v1/admin/subscriptions/plans');
    },

    updateSubscriptionPlan: async (id: string, data: any) => {
      return request<any>(`/api/v1/admin/subscriptions/plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    listSubscriptions: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      tier?: string;
      status?: string;
      wilaya?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.tier && params.tier !== 'ALL') q.set('tier', params.tier);
      if (params?.status && params.status !== 'ALL') q.set('status', params.status);
      if (params?.wilaya && params.wilaya !== 'ALL') q.set('wilaya', params.wilaya);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{
        data: any[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/api/v1/admin/subscriptions${queryStr}`);
    },

    listSubscriptionInvoices: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.status && params.status !== 'ALL') q.set('status', params.status);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{
        data: any[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/api/v1/admin/subscriptions/invoices${queryStr}`);
    },

    updateSellerSubscription: async (
      id: string,
      data: { tier?: string; extendTrialDays?: number; status?: string },
    ) => {
      return request<any>(`/api/v1/admin/subscriptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  },
};
