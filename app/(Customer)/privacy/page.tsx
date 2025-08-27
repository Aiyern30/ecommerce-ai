/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Eye,
  Lock,
  Users,
  Cookie,
  Database,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/";
import {
  TypographyH1,
  TypographyH3,
  TypographyH6,
  TypographyP,
} from "@/components/ui/Typography";

const privacySections = [
  {
    id: "information-collection",
    title: "Information We Collect",
    icon: Database,
    content: {
      intro:
        "We collect information you provide directly to us, information we obtain automatically when you use our services, and information from third parties.",
      subsections: [
        {
          title: "Personal Information",
          items: [
            "Name and contact information (email, phone, address)",
            "Account credentials and preferences",
            "Payment and billing information",
            "Communication history and support requests",
          ],
        },
        {
          title: "Automatic Information",
          items: [
            "Device and browser information",
            "IP address and location data",
            "Usage patterns and analytics",
            "Cookies and similar technologies",
          ],
        },
        {
          title: "Third-Party Information",
          items: [
            "Social media profile information",
            "Payment processor data",
            "Business verification services",
            "Marketing and analytics partners",
          ],
        },
      ],
    },
  },
  {
    id: "information-use",
    title: "How We Use Your Information",
    icon: Eye,
    content: {
      intro:
        "We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.",
      subsections: [
        {
          title: "Service Provision",
          items: [
            "Process and fulfill your orders",
            "Provide customer support and assistance",
            "Manage your account and preferences",
            "Send transactional communications",
          ],
        },
        {
          title: "Business Operations",
          items: [
            "Analyze usage patterns and improve services",
            "Detect and prevent fraud and abuse",
            "Comply with legal obligations",
            "Protect our rights and property",
          ],
        },
        {
          title: "Marketing Communications",
          items: [
            "Send promotional offers and updates",
            "Provide personalized recommendations",
            "Conduct surveys and research",
            "Share news about our products and services",
          ],
        },
      ],
    },
  },
  {
    id: "information-sharing",
    title: "Information Sharing and Disclosure",
    icon: Users,
    content: {
      intro:
        "We do not sell, trade, or rent your personal information to third parties. We may share your information in limited circumstances as described below.",
      subsections: [
        {
          title: "Service Providers",
          items: [
            "Payment processing and fraud prevention",
            "Shipping and logistics partners",
            "Cloud hosting and data storage",
            "Customer support and communication tools",
          ],
        },
        {
          title: "Business Transfers",
          items: [
            "Mergers, acquisitions, or asset sales",
            "Bankruptcy or insolvency proceedings",
            "Corporate restructuring or reorganization",
          ],
        },
        {
          title: "Legal Requirements",
          items: [
            "Compliance with applicable laws and regulations",
            "Response to legal processes and government requests",
            "Protection of our rights and safety",
            "Prevention of fraud and illegal activities",
          ],
        },
      ],
    },
  },
  {
    id: "data-security",
    title: "Data Security and Protection",
    icon: Lock,
    content: {
      intro:
        "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
      subsections: [
        {
          title: "Technical Safeguards",
          items: [
            "Encryption of data in transit and at rest",
            "Secure server infrastructure and firewalls",
            "Regular security assessments and monitoring",
            "Access controls and authentication systems",
          ],
        },
        {
          title: "Organizational Measures",
          items: [
            "Employee training on data protection",
            "Limited access on a need-to-know basis",
            "Regular review of security policies",
            "Incident response and breach notification procedures",
          ],
        },
        {
          title: "Data Retention",
          items: [
            "Retention only for as long as necessary",
            "Secure deletion when no longer needed",
            "Regular review of retention periods",
            "Compliance with legal requirements",
          ],
        },
      ],
    },
  },
  {
    id: "cookies-tracking",
    title: "Cookies and Tracking Technologies",
    icon: Cookie,
    content: {
      intro:
        "We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content and advertising.",
      subsections: [
        {
          title: "Types of Cookies",
          items: [
            "Essential cookies for basic functionality",
            "Performance cookies for analytics",
            "Functional cookies for preferences",
            "Advertising cookies for personalization",
          ],
        },
        {
          title: "Cookie Management",
          items: [
            "Browser settings to control cookies",
            "Opt-out mechanisms for advertising",
            "Cookie preference center",
            "Regular review and cleanup",
          ],
        },
        {
          title: "Third-Party Tracking",
          items: [
            "Google Analytics for website analytics",
            "Social media plugins and widgets",
            "Advertising network pixels",
            "Payment processor tracking",
          ],
        },
      ],
    },
  },
  {
    id: "your-rights",
    title: "Your Privacy Rights and Choices",
    icon: Shield,
    content: {
      intro:
        "You have certain rights regarding your personal information. We are committed to honoring these rights and providing you with control over your data.",
      subsections: [
        {
          title: "Access and Portability",
          items: [
            "Request access to your personal information",
            "Obtain a copy of your data in a portable format",
            "Review how your information is being used",
            "Verify the accuracy of your information",
          ],
        },
        {
          title: "Correction and Deletion",
          items: [
            "Update or correct inaccurate information",
            "Request deletion of your personal data",
            "Restrict processing in certain circumstances",
            "Object to processing for marketing purposes",
          ],
        },
        {
          title: "Communication Preferences",
          items: [
            "Unsubscribe from marketing communications",
            "Update your communication preferences",
            "Choose your preferred contact methods",
            "Manage notification settings",
          ],
        },
      ],
    },
  },
];

const quickStats = [
  {
    icon: Shield,
    title: "Data Protection",
    description: "Enterprise-grade security measures protect your information",
  },
  {
    icon: Users,
    title: "No Data Selling",
    description: "We never sell your personal information to third parties",
  },
  {
    icon: Lock,
    title: "Secure Processing",
    description: "All transactions are encrypted and securely processed",
  },
  {
    icon: Eye,
    title: "Transparent Practices",
    description: "Clear policies on how we collect and use your data",
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>(
    "information-collection"
  );

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });

      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    privacySections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <TypographyH1 className="mb-4 text-gray-900 dark:text-gray-100">
          Privacy Policy
        </TypographyH1>
        <TypographyP className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
          Your privacy is important to us. This policy explains how YTL Cement
          Hub collects, uses, and protects your personal information when you
          use our services.
        </TypographyP>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Last updated: December 2024</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Effective Date: January 1, 2024</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            className="text-center border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors duration-200"
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <TypographyP className="text-sm text-gray-600 dark:text-gray-400">
                {stat.description}
              </TypographyP>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-36">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Table of Contents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {privacySections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    activeSection === section.id
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <section.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Accordion
            type="multiple"
            defaultValue={privacySections.map((s) => s.id)}
            className="space-y-4"
          >
            {privacySections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                id={section.id}
                className="border rounded-xl bg-white dark:bg-slate-800 shadow-lg scroll-mt-24"
              >
                <AccordionTrigger
                  className="px-6 py-4 hover:no-underline"
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <TypographyH3 className="text-left text-gray-900 dark:text-gray-100">
                      {section.title}
                    </TypographyH3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <TypographyP className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {section.content.intro}
                    </TypographyP>

                    <div className="space-y-6">
                      {section.content.subsections.map((subsection, index) => (
                        <div key={index} className="space-y-3">
                          <TypographyH6 className="text-gray-900 dark:text-gray-100 font-semibold">
                            {subsection.title}
                          </TypographyH6>
                          <ul className="space-y-2">
                            {subsection.items.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="flex items-start gap-3"
                              >
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Questions About This Policy?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TypographyP className="text-gray-600 dark:text-gray-300">
                If you have any questions about this Privacy Policy or our data
                practices, please don't hesitate to contact us.
              </TypographyP>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <a
                    href="mailto:privacy@ytl.com.my"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    privacy@ytl.com.my
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <a
                    href="tel:+60321170088"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    +60 3-2117 0088
                  </a>
                </div>
              </div>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                <TypographyP className="text-xs text-gray-500 dark:text-gray-400">
                  YTL Cement Berhad • 11th Floor, Yeoh Tiong Lay Plaza, 55 Jalan
                  Bukit Bintang, 55100 Kuala Lumpur, Malaysia
                </TypographyP>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
