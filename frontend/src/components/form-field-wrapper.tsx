import * as React from "react"
import { cn } from "@/lib/utils"

interface FormFieldWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
  htmlFor?: string
}

export function FormFieldWrapper({
  label,
  description,
  error,
  required = false,
  className,
  children,
  htmlFor,
  ...props
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
