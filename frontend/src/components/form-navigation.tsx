import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"

interface FormNavigationProps {
  onPrevious?: () => void
  onNext?: () => void
  isSubmitting?: boolean
  isFirstStep?: boolean
  isLastStep?: boolean
  nextButtonText?: string
  previousButtonText?: string
  submitButtonText?: string
  className?: string
  showSubmitButton?: boolean
  showNextButton?: boolean
  showPreviousButton?: boolean
  isNextDisabled?: boolean
  isSubmitDisabled?: boolean
}

export function FormNavigation({
  onPrevious,
  onNext,
  isSubmitting = false,
  isFirstStep = false,
  isLastStep = false,
  nextButtonText = "Next",
  previousButtonText = "Back",
  submitButtonText = "Submit",
  className,
  showSubmitButton = true,
  showNextButton = true,
  showPreviousButton = true,
  isNextDisabled = false,
  isSubmitDisabled = false,
}: FormNavigationProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pt-4 border-t border-border mt-6",
        className
      )}
    >
      <div>
        {showPreviousButton && !isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {previousButtonText}
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        {showNextButton && !isLastStep && (
          <Button
            type="button"
            onClick={onNext}
            disabled={isSubmitting || isNextDisabled}
          >
            {nextButtonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {showSubmitButton && isLastStep && (
          <Button type="submit" disabled={isSubmitting || isSubmitDisabled}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}
