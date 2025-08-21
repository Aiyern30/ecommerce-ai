import Link from "next/link";
import { TypographyH3, TypographyP } from "./ui/Typography";

const Footer = () => {
  return (
    <div>
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <TypographyH3 className="mb-4 dark:text-white">
                YTL CONCRETE HUB
              </TypographyH3>
              <TypographyP className="text-sm text-muted-foreground dark:text-gray-400">
                YTL Concrete Hub is your trusted source for high-quality
                concrete and mortar products, serving Malaysian construction
                projects with reliable materials and expert support.
              </TypographyP>
            </div>
            <div>
              <TypographyH3 className="mb-4 dark:text-white">
                COMPANY
              </TypographyH3>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compare"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Compare
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blogs"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <TypographyH3 className="mb-4 dark:text-white">HELP</TypographyH3>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/orders"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Order
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <TypographyH3 className="mb-4 dark:text-white">
                RESOURCES
              </TypographyH3>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cart
                  </Link>
                </li>

                <li>
                  <Link
                    href="/profile"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/checkout"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Checkout
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notifications"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Notifications
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Search
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 w-full mt-8" />

        <div className="container mx-auto px-4">
          <div className="mt-8 flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
            <TypographyP className="text-sm text-muted-foreground dark:text-gray-400">
              © 2025 YTL Concrete Hub All Rights Reserved.
            </TypographyP>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
