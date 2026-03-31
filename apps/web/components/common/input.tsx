import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  id,
  label,
  error,
  helperText,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? React.useId()
  const descriptionId = error
    ? `${inputId}-error`
    : helperText
      ? `${inputId}-helper`
      : undefined

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={`rounded-lg border bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-60 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />

      {error ? (
        <span id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${inputId}-helper`} className="text-sm text-gray-500">
          {helperText}
        </span>
      ) : null}
    </div>
  )
}