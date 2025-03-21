import Link from "next/link";

const Footer = () => {
  return (
    <div>
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold dark:text-white">
                Shop YTL
              </h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                We have clothes that suit your style and which you&apos;re proud
                to wear.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold dark:text-white">
                COMPANY
              </h3>
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
                    href="/careers"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Careers
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
                    href="/privacy"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold dark:text-white">HELP</h3>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                <li>
                  <Link
                    href="/support"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Customer Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/delivery"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Delivery Details
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
                    href="/privacy"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold dark:text-white">
                RESOURCES
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                <li>
                  <Link
                    href="/free-ebook"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Free eBook
                  </Link>
                </li>
                <li>
                  <Link
                    href="/development"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Development Tutorial
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/youtube"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    YouTube Playlist
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 w-full mt-8" />

        <div className="container mx-auto px-4">
          <div className="mt-8 flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              © 2024 SHOP.CO All Rights Reserved.
            </p>
            <div className="flex gap-2">
              {["visa", "mastercard", "paypal"].map((payment) => (
                <div
                  key={payment}
                  className="h-8 w-12 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                >
                  {payment.charAt(0).toUpperCase() + payment.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
