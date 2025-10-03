import * as React from "react"
import { cn } from "@/lib/utils"

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  contentClassName?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  contentClassName,
  ...props
}: React.PropsWithChildren<FormSectionProps>) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className={cn("text-lg font-medium leading-6", titleClassName)}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn("space-y-4", contentClassName)}>{children}</div>
    </div>
  )
}
