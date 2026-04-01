'use client'

import { forwardRef, InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/design-system'

/* ─── BUTTON ─── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'

    const variants = {
      primary: 'bg-gradient-to-r from-gold to-gold-light text-obsidian shadow-[0_4px_14px_rgba(201,151,58,0.35)] hover:shadow-[0_6px_20px_rgba(201,151,58,0.45)] hover:-translate-y-0.5 focus:ring-[#635BFF]',
      outline: 'border border-sand-dark text-charcoal-muted bg-transparent hover:border-[#635BFF] hover:text-[#635BFF] hover:bg-[#635BFF]/5 focus:ring-[#635BFF]',
      ghost: 'text-charcoal hover:bg-sand focus:ring-sand-dark',
      danger: 'bg-danger text-white hover:bg-danger-dark shadow-sm focus:ring-danger',
    }

    const sizes = {
      sm: 'text-xs px-3 py-2 rounded-lg',
      md: 'text-sm px-4 py-2.5 rounded-xl',
      lg: 'text-sm px-6 py-3.5 rounded-xl w-full',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

/* ─── INPUT ─── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  required?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, required, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-charcoal tracking-wide">
            {label}
            {required && <span className="text-[#635BFF] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted [&>svg]:w-4 [&>svg]:h-4">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full border border-sand-dark rounded-xl bg-white text-obsidian placeholder:text-charcoal-muted',
              'text-sm px-3.5 py-2.5 transition-all duration-200 outline-none',
              'focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/15',
              'disabled:bg-sand disabled:cursor-not-allowed',
              error && 'border-danger focus:border-danger focus:ring-danger/10',
              !!icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-charcoal-muted">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

/* ─── SELECT ─── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, children, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-charcoal tracking-wide">
            {label}
            {required && <span className="text-[#635BFF] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full border border-sand-dark rounded-xl bg-white text-obsidian',
            'text-sm px-3.5 py-2.5 transition-all duration-200 outline-none',
            'focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/15',
            error && 'border-danger',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

/* ─── CARD ─── */
interface CardProps {
  children: ReactNode
  className?: string
  highlight?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className, highlight, padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div className={cn(
      'bg-white rounded-2xl border transition-all duration-200',
      highlight
        ? 'border-[#635BFF] shadow-[0_8px_40px_rgba(201,151,58,0.12)]'
        : 'border-sand-dark shadow-[0_4px_24px_rgba(15,15,14,0.06)]',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  )
}

/* ─── CARD HEADER ─── */
export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between pb-4 mb-4 border-b border-sand-dark', className)}>
      {children}
    </div>
  )
}

/* ─── BADGE ─── */
type BadgeVariant = 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    gold:    'bg-[#635BFF]/10 text-[#4C45E0] border border-[#635BFF]/25',
    success: 'bg-success-bg text-success-dark border border-success/20',
    warning: 'bg-warning-bg text-warning border border-warning/20',
    danger:  'bg-danger-bg text-danger-dark border border-danger/20',
    info:    'bg-blue-50 text-blue-700 border border-blue-200',
    muted:   'bg-sand text-charcoal-muted border border-sand-dark',
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

/* ─── STAT CARD ─── */
interface StatCardProps {
  label: string
  value: string | number
  icon?: string
  trend?: string
  trendUp?: boolean
  accent?: 'gold' | 'success' | 'warning' | 'info'
}

export function StatCard({ label, value, icon, trend, trendUp, accent = 'gold' }: StatCardProps) {
  const accents = {
    gold:    'from-gold to-gold-light',
    success: 'from-success to-success-light',
    warning: 'from-warning to-warning-light',
    info:    'from-blue-600 to-blue-400',
  }
  const iconBgs = {
    gold:    'bg-[#635BFF]/8',
    success: 'bg-success-bg',
    warning: 'bg-warning-bg',
    info:    'bg-blue-50',
  }
  return (
    <div className="bg-white rounded-2xl border border-sand-dark shadow-[0_4px_24px_rgba(15,15,14,0.06)] p-6 relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_48px_rgba(15,15,14,0.10)]">
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accents[accent]}`} />
      {icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${iconBgs[accent]}`}>
          {icon}
        </div>
      )}
      <div className="font-playfair text-3xl font-bold text-obsidian leading-none mb-1">
        {value}
      </div>
      <div className="text-xs text-charcoal-muted font-medium tracking-wide">{label}</div>
      {trend && (
        <div className={`absolute top-4 right-4 text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
          trendUp ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
        }`}>
          {trend}
        </div>
      )}
    </div>
  )
}

/* ─── SECTION LABEL ─── */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 bg-[#635BFF]/10 border border-[#635BFF]/25 rounded-full px-4 py-1">
      <span className="text-[10px] font-bold tracking-widest uppercase text-[#635BFF]">
        {children}
      </span>
    </div>
  )
}

/* ─── PAGE TITLE ─── */
export function PageTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div>
      <h1 className="font-playfair text-2xl font-bold text-obsidian">{children}</h1>
      {sub && <p className="text-sm text-charcoal-muted mt-1">{sub}</p>}
    </div>
  )
}

/* ─── DIVIDER ─── */
export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-sand-dark my-4" />
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="h-px bg-sand-dark flex-1" />
      <span className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted">{label}</span>
      <div className="h-px bg-sand-dark flex-1" />
    </div>
  )
}
