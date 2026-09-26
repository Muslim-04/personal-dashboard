import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 active:bg-emerald-600',
  secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700',
  ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}
