import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div>
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">Shop YTL</h3>
              <p className="text-sm text-muted-foreground">
                We have clothes that suits your style and which you&apos;re
                proud to wear.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">COMPANY</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
                <li>
                  <Link href="/terms">Terms & Conditions</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">HELP</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/support">Customer Support</Link>
                </li>
                <li>
                  <Link href="/delivery">Delivery Details</Link>
                </li>
                <li>
                  <Link href="/terms">Terms & Conditions</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">RESOURCES</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/free-ebook">Free eBook</Link>
                </li>
                <li>
                  <Link href="/development">Development Tutorial</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/youtube">YouTube Playlist</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 SHOP.CO All Rights Reserved.
            </p>
            <div className="flex gap-2">
              {["visa", "mastercard", "paypal"].map((payment) => (
                <div key={payment} className="h-8 w-12 rounded bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
