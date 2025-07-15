"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Separator } from "@/components/ui/";
import { Badge } from "@/components/ui/";
import { Button } from "@/components/ui/";
import { useRouter } from "next/navigation";
import { FileText, AlertTriangle } from "lucide-react";

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
        </div>
        <Badge variant="outline" className="mb-4">
          Effective Date: July 15, 2025
        </Badge>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Welcome to YTL Concrete Hub. These Terms & Conditions govern your use
          of our website and AI-powered services. By accessing our platform, you
          agree to these terms.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section 1 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">1. About Us</h3>
              <p className="text-muted-foreground">
                YTL Concrete Hub is an online platform operated by YTL that
                enables users to discover, compare, and purchase concrete
                products using advanced AI tools including image search, smart
                product comparison, and chatbot assistance.
              </p>
            </div>

            <Separator />

            {/* Section 2 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">2. Eligibility</h3>
              <p className="text-muted-foreground">
                You must be at least 18 years old, or legally capable of
                entering into binding contracts under applicable laws, to use
                our Services.
              </p>
            </div>

            <Separator />

            {/* Section 3 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                3. User Content & Image Uploads
              </h3>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You may upload images and other content to use features like
                  AI product search.
                </p>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium mb-2">
                    By uploading content, you grant YTL Concrete Hub:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>A worldwide, non-exclusive, royalty-free license</li>
                    <li>
                      Rights to store, process, analyze, and display content
                    </li>
                    <li>Usage solely to provide and improve our Services</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">Your responsibilities:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>
                      You represent that you own or have rights to any content
                      you upload
                    </li>
                    <li>
                      You must not upload images that are unlawful or infringe
                      intellectual property
                    </li>
                    <li>
                      Content must not contain harmful or offensive material
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground">
                  We may remove any content that violates these Terms.
                </p>
              </div>
            </div>

            <Separator />

            {/* Section 4 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                4. AI Tools & Limitations
              </h3>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Our AI-based features (including image product search, smart
                  comparison, and chatbot) are provided to assist you.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-950/20">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Important Limitations:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-yellow-700 dark:text-yellow-300">
                        <li>
                          AI may not always produce accurate, complete, or
                          up-to-date results
                        </li>
                        <li>
                          You should verify product details independently before
                          purchasing
                        </li>
                        <li>
                          We do not accept liability for decisions made solely
                          based on AI-generated content
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 5 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                5. Purchases & Pricing
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  • Product prices, availability, and specifications may change
                  without notice
                </li>
                <li>• Orders are only confirmed upon successful payment</li>
                <li>
                  • All purchases are subject to our Shipping & Delivery Policy
                  and Refund & Return Policy
                </li>
                <li>
                  • We may limit or cancel quantities purchased per person, per
                  company, or per order
                </li>
              </ul>
            </div>

            <Separator />

            {/* Section 6 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">6. Prohibited Uses</h3>
              <p className="mb-3">You agree not to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Use the Services for unlawful purposes</li>
                <li>
                  • Upload or distribute harmful, offensive, or infringing
                  content
                </li>
                <li>
                  • Reverse-engineer, decompile, or misuse our AI tools and
                  website systems
                </li>
                <li>
                  • Interfere with the operation or security of the Services
                </li>
              </ul>
            </div>

            <Separator />

            {/* Section 7 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                7. Intellectual Property
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  All content on YTL Concrete Hub, including AI models, product
                  data, logos, text, graphics, and software, is owned by or
                  licensed to us and is protected by intellectual property laws.
                </p>
                <p>
                  You may not reproduce, distribute, or modify this content
                  without prior written permission.
                </p>
              </div>
            </div>

            <Separator />

            {/* Section 8 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                8. Limitation of Liability
              </h3>
              <p className="mb-3">To the fullest extent permitted by law:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  • We do not guarantee the accuracy, completeness, or
                  reliability of AI-generated or website content
                </li>
                <li>
                  • We shall not be liable for any indirect, incidental,
                  consequential, or punitive damages arising from your use of
                  the Services
                </li>
              </ul>
            </div>

            <Separator />

            {/* Section 9 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                9. Changes to Terms
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We may update these Terms from time to time</li>
                <li>• Material changes will be posted on our website</li>
                <li>
                  • Your continued use of the Services after changes means you
                  accept the new Terms
                </li>
              </ul>
            </div>

            <Separator />

            {/* Section 10 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">10. Privacy</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>Your privacy is important to us.</p>
                <p>
                  Please read our Privacy Policy to understand how we collect,
                  use, and protect your data, including uploaded images and chat
                  data.
                </p>
              </div>
            </div>

            <Separator />

            {/* Section 11 */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">📧</span>
                  <div className="min-w-0 flex-1">
                    <strong>Privacy Email:</strong>
                    <br />
                    <a
                      href="mailto:privacy@ytlconcretehub.com"
                      className="text-primary hover:underline break-all"
                    >
                      privacy@ytlconcretehub.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-lg">📧</span>
                  <div className="min-w-0 flex-1">
                    <strong>General Support:</strong>
                    <br />
                    <a
                      href="mailto:support@ytlconcretehub.com"
                      className="text-primary hover:underline break-all"
                    >
                      support@ytlconcretehub.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-lg">📍</span>
                  <div className="min-w-0 flex-1">
                    <strong>Address:</strong>
                    <br />
                    <address className="not-italic text-muted-foreground mt-1 leading-relaxed">
                      Level 15, 205, Jln Bukit Bintang, Bukit Bintang, 55100
                      Kuala Lumpur, Federal Territory Malaysia
                    </address>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Footer */}
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Last updated: July 15, 2025
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button onClick={() => router.push("/")}>Return to Home</Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/privacy")}
                >
                  View Privacy Policy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
