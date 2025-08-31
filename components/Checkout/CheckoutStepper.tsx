"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDeviceType } from "@/utils/useDeviceTypes";

interface Step {
  id: number;
  title: string;
  description: string;
  path: string;
  shortTitle?: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Cart",
    description: "Review items",
    path: "/cart",
    shortTitle: "Cart",
  },
  {
    id: 2,
    title: "Address",
    description: "Shipping details",
    path: "/checkout/address",
    shortTitle: "Address",
  },
  {
    id: 3,
    title: "Payment",
    description: "Payment method",
    path: "/checkout/payment",
    shortTitle: "Payment",
  },
  {
    id: 4,
    title: "Confirm",
    description: "Review order",
    path: "",
    shortTitle: "Confirm",
  },
];

interface CheckoutStepperProps {
  currentStep: number;
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const router = useRouter();
  const { isMobile } = useDeviceType();

  const handleStepClick = (step: Step) => {
    if (step.id <= currentStep && step.path) {
      router.push(step.path);
    }
  };

  return (
    <nav
      aria-label="Progress"
      className={cn(
        "flex justify-center w-full mb-8 relative",
        isMobile ? "px-2" : ""
      )}
    >
      <ol
        className={cn(
          "flex items-center w-full",
          isMobile ? "max-w-full" : "max-w-3xl"
        )}
      >
        {steps.map((step, stepIdx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id <= currentStep && step.path;

          return (
            <li
              key={step.id}
              className={cn(
                "relative flex flex-col items-center",
                isMobile ? "flex-1 min-w-0" : "flex-1"
              )}
            >
              {!isMobile && stepIdx > 0 && (
                <div
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-0.5 z-0",
                    stepIdx === 1
                      ? "w-[calc(50%+1.5rem)] -ml-[1.5rem]"
                      : "w-1/2",
                    steps[stepIdx - 1].id < currentStep
                      ? "bg-green-600"
                      : "bg-gray-200"
                  )}
                />
              )}

              {!isMobile && stepIdx < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 h-0.5 z-0",
                    stepIdx === steps.length - 2
                      ? "w-[calc(50%+1.5rem)] -mr-[1.5rem]"
                      : "w-1/2",
                    isCompleted
                      ? "bg-green-600"
                      : isActive
                      ? "bg-primary"
                      : "bg-gray-200"
                  )}
                />
              )}

              {isMobile && stepIdx < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-1/2 h-0.5 z-0",
                    isCompleted
                      ? "bg-green-600"
                      : isActive
                      ? "bg-primary"
                      : "bg-gray-200"
                  )}
                  style={{
                    left: "calc(50% + 8px)",
                    right: "calc(-50% + 8px)",
                  }}
                />
              )}

              {/* Step Button */}
              <button
                onClick={() => handleStepClick(step)}
                disabled={!isClickable}
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-200", // ✅ ensure above lines
                  isMobile ? "h-8 w-8" : "h-10 w-10",
                  isCompleted
                    ? "border-green-600 bg-green-600 text-white"
                    : isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-gray-300 bg-white text-gray-500",
                  isClickable
                    ? "cursor-pointer hover:scale-110 hover:shadow-md"
                    : "cursor-not-allowed",
                  !isClickable && !isActive && !isCompleted && "opacity-50"
                )}
                aria-label={isClickable ? `Go to ${step.title}` : step.title}
              >
                {isCompleted ? (
                  <Check
                    className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")}
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className={cn(
                      "font-bold",
                      isMobile ? "text-sm" : "text-base"
                    )}
                  >
                    {step.id}
                  </span>
                )}
              </button>

              {/* Labels */}
              <div
                className={cn(
                  "mt-2 text-center mx-auto relative z-10",
                  isMobile ? "w-16 px-1" : "w-24",
                  isClickable && "cursor-pointer"
                )}
                onClick={() => isClickable && handleStepClick(step)}
              >
                <span
                  className={cn(
                    "font-semibold block transition-colors",
                    isMobile ? "text-xs leading-tight" : "text-sm",
                    isCompleted
                      ? "text-green-600"
                      : isActive
                      ? "text-primary"
                      : "text-gray-500",
                    isClickable && "hover:text-primary"
                  )}
                >
                  {isMobile ? step.shortTitle || step.title : step.title}
                </span>
                {!isMobile && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
