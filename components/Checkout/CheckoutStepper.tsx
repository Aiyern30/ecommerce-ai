"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Cart",
    description: "Review items",
  },
  {
    id: 2,
    title: "Address",
    description: "Shipping details",
  },
  {
    id: 3,
    title: "Payment",
    description: "Payment method",
  },
  {
    id: 4,
    title: "Confirm",
    description: "Review order",
  },
];

interface CheckoutStepperProps {
  currentStep: number;
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
              "relative"
            )}
          >
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              {stepIdx !== steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-full",
                    step.id < currentStep ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
            </div>
            <div
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full border-2",
                step.id === currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : step.id < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-white text-gray-500"
              )}
            >
              {step.id < currentStep ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <span
                className={cn(
                  "text-sm font-medium",
                  step.id === currentStep || step.id < currentStep
                    ? "text-primary"
                    : "text-gray-500"
                )}
              >
                {step.title}
              </span>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
