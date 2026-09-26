import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/nav/BottomNav'

export const metadata: Metadata = {
  title: 'Личный дашборд',
  description: 'Финансы, задачи и тренировки — личный трекер',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Дашборд',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full bg-neutral-950 text-neutral-100 antialiased">
        <BottomNav />
        <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 md:max-w-5xl md:pb-10 md:pt-6">
          {children}
        </main>
      </body>
    </html>
  )
}
