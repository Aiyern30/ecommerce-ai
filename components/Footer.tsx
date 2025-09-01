/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
} from "lucide-react";
import { TypographyH3, TypographyP } from "./ui/Typography";

const Footer = () => {
  const socialLinks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/ytlcommunity",
      icon: Facebook,
      color: "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    {
      name: "Twitter",
      href: "https://x.com/ytlcommunity",
      icon: Twitter,
      color: "hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/ytlcommunity/",
      icon: Instagram,
      color: "hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20",
    },
    {
      name: "LinkedIn",
      href: "https://my.linkedin.com/company/ytl-corporation-bhd",
      icon: Linkedin,
      color: "hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/ytlcommunity",
      icon: Youtube,
      color: "hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
    },
  ];

  const companyLinks = [
    { name: "About", href: "/about" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { name: "FAQ", href: "/faq" },
    { name: "Orders", href: "/profile/orders" },
    { name: "Profile", href: "/profile" },
    { name: "Cart", href: "/cart" },
  ];

  const productLinks = [
    { name: "Products", href: "/products" },
    { name: "Wishlist", href: "/wishlists" },
    { name: "Notifications", href: "/notifications" },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative">
        {/* Main Footer Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <TypographyH3 className="text-gray-900 dark:text-white">
                      YTL Concrete Hub
                    </TypographyH3>
                    <p className="text-orange-600 dark:text-orange-400 text-sm">
                      Building Malaysia's Future
                    </p>
                  </div>
                </div>

                <TypographyP className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Your trusted partner for premium concrete and construction
                  materials. We deliver quality, reliability, and innovation to
                  construction projects across Malaysia.
                </TypographyP>

                {/* Contact Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <span>
                      11th Floor, Yeoh Tiong Lay Plaza, 55 Jalan Bukit Bintang,
                      KL
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <span>+60 3-2117 0088</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <Link
                      href="mailto:enquiry@ytl.com.my"
                      className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      enquiry@ytl.com.my
                    </Link>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-4">
                    Follow Us
                  </h4>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => {
                      const Icon = social.icon;
                      return (
                        <Link
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 ${social.color} group`}
                          title={`Follow us on ${social.name}`}
                        >
                          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="lg:col-span-3 grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-8">
                {/* Company */}
                <div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-xs sm:text-sm uppercase tracking-wider">
                    Company
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {companyLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-xs sm:text-sm flex items-center gap-2 group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {link.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Products */}
                <div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-xs sm:text-sm uppercase tracking-wider">
                    Products
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {productLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-xs sm:text-sm flex items-center gap-2 group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {link.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-xs sm:text-sm uppercase tracking-wider">
                    Support
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {supportLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-xs sm:text-sm flex items-center gap-2 group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {link.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="text-center lg:text-left">
              <TypographyP className="text-gray-500 dark:text-gray-400 text-sm">
                © 2025 YTL Concrete Hub. All rights reserved.
              </TypographyP>
              <TypographyP className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Built with ❤️ for the construction industry in Malaysia
              </TypographyP>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-end gap-4 text-xs">
              <Link
                href="/privacy"
                className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <Link
                href="/terms"
                className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
            <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>ISO Certified Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Secure SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Malaysia's Trusted Brand</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
