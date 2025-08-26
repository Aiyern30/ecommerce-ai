"use client";

import Link from "next/link";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import { useChat } from "./ChatContext";
import { TbPhotoSearch } from "react-icons/tb";
import { RiRobot2Line } from "react-icons/ri";
import { Brain, Sparkles } from "lucide-react";

// Enhanced Card component with hover effects and gradient backgrounds
function Card({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "gradient" | "ai";
}) {
  const getCardStyles = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-200 dark:hover:from-gray-700 dark:hover:to-gray-800";
      case "ai":
        return "bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950 border-purple-200 dark:border-purple-800 hover:shadow-lg hover:shadow-purple-200/50 dark:hover:shadow-purple-900/50";
      default:
        return "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700";
    }
  };

  return (
    <div
      className={`
      ${getCardStyles()}
      rounded-xl shadow-md hover:shadow-xl p-6 text-center border 
      transition-all duration-300 ease-in-out transform hover:-translate-y-2
      group
      min-h-[400px] flex flex-col justify-between
    `}
    >
      {children}
    </div>
  );
}

// Icon components for visual enhancement
function ConcreteIcon() {
  return (
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
      <div className="w-8 h-8 bg-white rounded-sm opacity-90"></div>
    </div>
  );
}

function SupportIcon() {
  return (
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
      <svg
        className="w-8 h-8 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        ></path>
      </svg>
    </div>
  );
}

function PhotoSearchIcon() {
  return (
    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
      <TbPhotoSearch className="w-6 h-6 text-white" />
    </div>
  );
}

function AIServiceIcon() {
  return (
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
      <Sparkles className="w-8 h-8 text-white" />
    </div>
  );
}

function AIChatbotIcon() {
  return (
    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
      <RiRobot2Line className="w-7 h-7 text-white" />
    </div>
  );
}

function AISmartComparisonIcon() {
  return (
    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
      <Brain className="w-6 h-6 text-white" />
    </div>
  );
}

export function ServicesShowcase() {
  const { openChat } = useChat();

  // Scroll to AI Tools section
  const handleAIServicesClick = () => {
    const el = document.getElementById("ai-tools");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <TypographyH1>Our Services</TypographyH1>
          <TypographyP className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            YTL Concrete provides high-quality ready-mix concrete solutions for
            residential, commercial, and civil engineering projects. Our expert
            team ensures reliable delivery, technical support, and tailored
            mixes for every construction need.
          </TypographyP>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">
          <Link href="/products">
            <Card variant="gradient">
              <ConcreteIcon />
              <TypographyH3 className="mb-3 text-gray-800 dark:text-gray-100 font-bold">
                Ready-Mix Concrete
              </TypographyH3>
              <TypographyP className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Durable and consistent concrete mixes for foundations, slabs,
                columns, and more. Quality guaranteed with every batch. Browse
                all products.
              </TypographyP>
              <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium justify-center w-full flex">
                <span>View Products</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </Card>
          </Link>

          {/* AI Services card with new icon */}
          <button
            type="button"
            className="text-left w-full"
            onClick={handleAIServicesClick}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <Card variant="gradient">
              <AIServiceIcon />
              <TypographyH3 className="mb-3 text-gray-800 dark:text-gray-100 font-bold">
                AI Services
              </TypographyH3>
              <TypographyP className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Enhance your construction experience with our AI-powered tools:
                Chatbot for instant answers, Smart Comparison for product
                selection, and Recommended Products tailored to your needs.
              </TypographyP>
              <div className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium justify-center w-full flex">
                <span>Explore AI Tools</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </Card>
          </button>

          <Link href="/contact">
            <Card variant="gradient">
              <SupportIcon />
              <TypographyH3 className="mb-3 text-gray-800 dark:text-gray-100 font-bold">
                Technical Support
              </TypographyH3>
              <TypographyP className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Expert advice on mix selection, application, and compliance with
                Malaysian standards. Professional guidance at every step.
              </TypographyP>
              <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium justify-center w-full flex">
                <span>Contact Us</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </Card>
          </Link>
        </div>

        {/* AI Tools Section */}
        <div className="text-center mb-12" id="ai-tools">
          <TypographyH1>AI Tools for Smarter Construction</TypographyH1>
          <TypographyP className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Harness the power of artificial intelligence to optimize your
            construction projects
          </TypographyP>
        </div>

        {/* AI Tools Grid - same layout as Our Services */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card variant="gradient">
            <AIChatbotIcon />
            <TypographyH3 className="mb-3 text-gray-800 dark:text-gray-100 font-bold">
              AI Chatbot
            </TypographyH3>
            <TypographyP className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Get instant answers to your concrete and construction questions,
              24/7. Smart assistance whenever you need it.
            </TypographyP>
            <button
              type="button"
              className="w-full"
              onClick={openChat}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <div className="inline-flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium w-full py-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                <span>Try AI Chatbot</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </button>
          </Card>

          <Card variant="gradient">
            <AISmartComparisonIcon />
            <TypographyH3 className="mb-3 text-gray-800 dark:text-gray-100 font-bold">
              AI Smart Comparison
            </TypographyH3>
            <TypographyP className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Compare concrete grades, prices, and applications with intelligent
              recommendations tailored to your project.
            </TypographyP>
            <Link href="/compare" className="w-full">
              <div className="inline-flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium w-full py-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                <span>Compare Products</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </Link>
          </Card>

          <Card variant="gradient">
            <PhotoSearchIcon />
            <TypographyH3 className="mb-3 text-gray-800 dark:text-gray-100 font-bold">
              AI Search
            </TypographyH3>
            <TypographyP className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Find products, services, and technical info quickly using our
              smart search engine powered by advanced AI.
            </TypographyP>
            <Link href="/search" className="w-full">
              <div className="inline-flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium w-full py-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                <span>AI Search</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
