/**
 * Shared UI Components
 * Following Carbon Design System guidelines
 */

import React, { ReactNode } from 'react';

// ============================================
// CARD COMPONENT
// ============================================

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'warning' | 'success' | 'info';
  headerAction?: ReactNode;
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  variant = 'default',
  headerAction,
}: CardProps) {
  const variantStyles = {
    default: {
      container: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      headerBorder: 'border-gray-200 dark:border-gray-700',
      title: 'text-gray-900 dark:text-white',
    },
    warning: {
      container: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700',
      headerBorder: 'border-red-200 dark:border-red-700',
      title: 'text-red-900 dark:text-red-100',
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700',
      headerBorder: 'border-green-200 dark:border-green-700',
      title: 'text-green-900 dark:text-green-100',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
      headerBorder: 'border-blue-200 dark:border-blue-700',
      title: 'text-blue-900 dark:text-blue-100',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`border rounded-lg ${styles.container} ${className}`}>
      {(title || headerAction) && (
        <div className={`px-6 py-4 border-b ${styles.headerBorder} flex items-center justify-between`}>
          <div>
            {title && <h3 className={`text-lg font-medium ${styles.title}`}>{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

// ============================================
// ALERT COMPONENT
// ============================================

interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({ type, title, children, className = '' }: AlertProps) {
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-600',
      icon: 'text-blue-500 dark:!text-blue-300',
      title: 'text-blue-800 dark:!text-blue-100',
      text: 'text-blue-700 dark:!text-blue-200',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-600',
      icon: 'text-amber-500 dark:!text-amber-300',
      title: 'text-amber-800 dark:!text-amber-100',
      text: 'text-amber-700 dark:!text-amber-200',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-600',
      icon: 'text-red-500 dark:!text-red-300',
      title: 'text-red-800 dark:!text-red-100',
      text: 'text-red-700 dark:!text-red-200',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-600',
      icon: 'text-green-500 dark:!text-green-300',
      title: 'text-green-800 dark:!text-green-100',
      text: 'text-green-700 dark:!text-green-200',
    },
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`border rounded-lg p-4 ${styles[type].bg} ${className}`}>
      <div className="flex gap-3">
        <div className={styles[type].icon}>{icons[type]}</div>
        <div>
          <h4 className={`font-medium ${styles[type].title}`}>{title}</h4>
          {children && <div className={`mt-1 text-sm ${styles[type].text}`}>{children}</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  sublabel,
  variant = 'default',
  className = '',
}: StatCardProps) {
  const valueColors = {
    default: 'text-gray-900 dark:text-white',
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${valueColors[variant]}`}>
        {typeof value === 'number' ? value.toLocaleString('nl-NL') : value}
        {unit && <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">{unit}</span>}
      </div>
      {sublabel && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}

// ============================================
// TABLE COMPONENT
// ============================================

interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  highlightRow?: (row: T) => boolean;
  onRowClick?: (row: T) => void;
  className?: string;
  compact?: boolean;
}

export function Table<T>({ 
  columns, 
  data, 
  keyField, 
  highlightRow,
  onRowClick,
  className = '',
  compact = false,
}: TableProps<T>) {
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={`
                  ${cellPadding} text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400
                  ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                  ${col.className || ''}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const isHighlighted = highlightRow?.(row);
            return (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-gray-100 dark:border-gray-700 last:border-0
                  ${isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20' : rowIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                  transition-colors duration-150
                `}
              >
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className={`
                      ${cellPadding} text-sm text-gray-900 dark:text-gray-100
                      ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                      ${col.className || ''}
                    `}
                  >
                    {col.render
                      ? col.render(row, rowIndex)
                      : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// TOGGLE/TAB COMPONENT
// ============================================

interface ToggleOption {
  id: string;
  label: string;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function ToggleGroup({ 
  options, 
  value, 
  onChange, 
  size = 'md',
  className = '',
}: ToggleGroupProps) {
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
  };

  return (
    <div className={`inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${className}`}>
      {options.map(option => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`
            ${sizeStyles[size]} rounded-md font-medium transition-all duration-200
            ${value === option.id
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// FORM COMPONENTS
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  unit?: string;
}

export function Input({
  label,
  helper,
  error,
  unit,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={`
            w-full h-12 px-4 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}
            ${unit ? 'pr-16' : ''}
          `}
        />
        {unit && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
            {unit}
          </div>
        )}
      </div>
      {helper && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helper}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  helper,
  error,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`
          w-full h-12 px-4 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}
        `}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {helper && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helper}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500',
    secondary: 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 focus:ring-emerald-500',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      {...props}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-md font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ============================================
// BADGE COMPONENT
// ============================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium
      ${variantStyles[variant]}
      ${sizeStyles[size]}
    `}>
      {children}
    </span>
  );
}
