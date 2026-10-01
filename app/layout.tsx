import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AnnouncementBar } from '@/components/announcement-bar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileNav } from '@/components/mobile-nav'
import { CartProvider } from '@/components/cart-context'

export const metadata: Metadata = {
  title: 'Dzora — Tout ce dont vous avez besoin',
  description: 'Le marketplace qui rapproche l’Algérie. Découvrez des milliers de produits auprès de vendeurs locaux vérifiés.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
    <html lang="fr">
      <body className="antialiased min-h-screen flex flex-col bg-white text-[#102A2A]">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <MobileNav />
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
