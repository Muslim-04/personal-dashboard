import { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 md:p-5 ${className}`}>
      {children}
    </div>
  )
}
