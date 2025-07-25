"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  { id: 1, title: "Cart", description: "Review items" },
  { id: 2, title: "Address", description: "Shipping details" },
  { id: 3, title: "Payment", description: "Payment method" },
  { id: 4, title: "Confirm", description: "Review order" },
];

interface CheckoutStepperProps {
  currentStep: number;
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav
      aria-label="Progress"
      className="flex justify-center w-full mb-8 relative"
    >
      <ol className="flex items-center w-full max-w-3xl">
        {steps.map((step, stepIdx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <li
              key={step.id}
              className="relative flex-1 flex flex-col items-center"
            >
              {/* Progress line before the step */}
              {stepIdx > 0 && (
                <div
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-0.5 z-0",
                    stepIdx === 1
                      ? "w-[calc(50%+1.5rem)] -ml-[1.5rem]" // first step: extend left
                      : "w-1/2",
                    steps[stepIdx - 1].id < currentStep
                      ? "bg-green-600"
                      : "bg-gray-200"
                  )}
                />
              )}

              {/* Progress line after the step */}
              {stepIdx < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 h-0.5 z-0",
                    stepIdx === steps.length - 2
                      ? "w-[calc(50%+1.5rem)] -mr-[1.5rem]" // last step: extend right
                      : "w-1/2",
                    isCompleted
                      ? "bg-green-600"
                      : isActive
                      ? "bg-primary"
                      : "bg-gray-200"
                  )}
                />
              )}

              {/* Step circle */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200",
                  isCompleted
                    ? "border-green-600 bg-green-600 text-white"
                    : isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-gray-300 bg-white text-gray-500"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <span className="text-base font-bold">{step.id}</span>
                )}
              </div>

              {/* Step title & description */}
              <div className="mt-2 text-center w-24 mx-auto">
                <span
                  className={cn(
                    "text-sm font-semibold block",
                    isCompleted
                      ? "text-green-600"
                      : isActive
                      ? "text-primary"
                      : "text-gray-500"
                  )}
                >
                  {step.title}
                </span>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
