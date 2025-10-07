import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormErrorSummaryProps {
  errors: Record<string, { message?: string }> | null | undefined
  className?: string
  title?: string
  description?: string
}

export function FormErrorSummary({
  errors,
  className,
  title = "There were some errors with your submission",
  description = "Please fix the following issues and try again.",
}: FormErrorSummaryProps) {
  if (!errors) return null

  const errorMessages = Object.entries(errors)
    .filter(([_, value]) => value?.message)
    .map(([key, value]) => ({
      key,
      message: value.message,
    }))

  if (errorMessages.length === 0) return null

  return (
    <Alert variant="destructive" className={cn("mb-6", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{description}</p>
        <ul className="list-disc pl-5 space-y-1">
          {errorMessages.map((error) => (
            <li key={error.key}>
              <span className="font-medium">{error.key}:</span> {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
