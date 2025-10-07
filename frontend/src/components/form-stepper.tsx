import * as React from "react"
import { cn } from "@/lib/utils"

type Step = {
  id: string
  name: string
  description?: string
  status: "complete" | "current" | "upcoming"
}

interface FormStepperProps {
  steps: Step[]
  currentStep: number
  className?: string
  orientation?: "horizontal" | "vertical"
}

export function FormStepper({
  steps,
  currentStep,
  className,
  orientation = "horizontal",
}: FormStepperProps) {
  const processedSteps = steps.map((step, index) => ({
    ...step,
    status:
      index < currentStep
        ? "complete"
        : index === currentStep
        ? "current"
        : "upcoming",
  }))

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-8", className)}>
        {processedSteps.map((step, stepIdx) => (
          <div key={step.id} className="relative flex items-start group">
            <div className="flex items-center h-5">
              {step.status === "complete" ? (
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary">
                  <CheckIcon className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : step.status === "current" ? (
                <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-primary bg-background">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-muted-foreground/25 bg-background">
                  <div className="h-2.5 w-2.5 rounded-full bg-transparent" />
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3
                className={cn(
                  "text-sm font-medium",
                  step.status === "current"
                    ? "text-foreground"
                    : step.status === "complete"
                    ? "text-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {step.name}
              </h3>
              {step.description && (
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
            {stepIdx < processedSteps.length - 1 && (
              <div className="absolute left-4 top-8 -bottom-8 ml-0.5 w-0.5 bg-muted" />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {processedSteps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              stepIdx !== processedSteps.length - 1 ? "flex-1" : "",
              "relative"
            )}
          >
            {step.status === "complete" ? (
              <>
                <div className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <CheckIcon className="h-5 w-5 text-primary-foreground" />
                </div>
              </>
            ) : step.status === "current" ? (
              <>
                <div className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-muted" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-muted" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/25 bg-background">
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                </div>
              </>
            )}
            <div className="mt-2 text-center">
              <span
                className={cn(
                  "text-xs font-medium",
                  step.status === "current"
                    ? "text-foreground"
                    : step.status === "complete"
                    ? "text-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
