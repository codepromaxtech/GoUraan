import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormSuccessMessageProps {
  message?: string | null
  className?: string
  title?: string
}

export function FormSuccessMessage({
  message,
  className,
  title = "Success!",
}: FormSuccessMessageProps) {
  if (!message) return null

  return (
    <Alert className={cn("mb-6 bg-green-50 border-green-200", className)}>
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">{title}</AlertTitle>
      <AlertDescription className="text-green-700">
        {message}
      </AlertDescription>
    </Alert>
  )
}
