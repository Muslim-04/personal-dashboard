'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, ListChecks, Dumbbell } from 'lucide-react'

const TABS = [
  { href: '/finance', label: 'Финансы', icon: Wallet },
  { href: '/tasks', label: 'Задачи', icon: ListChecks },
  { href: '/workouts', label: 'Тренировки', icon: Dumbbell },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur md:static md:border-b md:border-t-0 md:bg-neutral-950"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-3xl md:max-w-5xl md:px-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors md:flex-row md:flex-none md:justify-center md:gap-2 md:px-5 md:py-4 md:text-sm ${
                active ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
