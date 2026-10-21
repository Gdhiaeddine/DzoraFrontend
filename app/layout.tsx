import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppShell } from '@/components/app-shell'
import { CartProvider } from '@/components/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import { FavoritesProvider } from '@/components/favorites-context'

export const metadata: Metadata = {
  title: 'Dzora — Tout ce dont vous avez besoin',
  description: 'Le marketplace qui rapproche l’Algérie. Découvrez des milliers de produits auprès de vendeurs locaux vérifiés.',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="antialiased min-h-screen flex flex-col bg-white text-[#102A2A]">
        <CartProvider>
          <AuthProvider>
            <FavoritesProvider>
              <AppShell>{children}</AppShell>
            </FavoritesProvider>
          </AuthProvider>
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
