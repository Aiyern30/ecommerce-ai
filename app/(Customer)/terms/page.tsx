"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Separator } from "@/components/ui/";
import { Badge } from "@/components/ui/";
import { Button } from "@/components/ui/";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
  TypographyList,
  TypographyListItem,
  TypographyLead,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/Typography";
import { useRouter } from "next/navigation";
import { FileText, AlertTriangle } from "lucide-react";

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 pt-0 pb-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-primary" />
          <TypographyH1>Terms & Conditions</TypographyH1>
        </div>
        <TypographyLead>
          Welcome to YTL Concrete Hub. These Terms & Conditions govern your use
          of our website and AI-powered services. By accessing our platform, you
          agree to these terms.
        </TypographyLead>
        <div className="flex gap-2 justify-center mt-4">
          <Badge variant="outline">Effective Date: July 15, 2025</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section 1 */}
            <div>
              <TypographyH3 className="mb-3">1. About Us</TypographyH3>
              <TypographyP>
                YTL Concrete Hub is an online platform operated by YTL that
                enables users to discover, compare, and purchase concrete
                products using advanced AI tools including image search, smart
                product comparison, and chatbot assistance.
              </TypographyP>
            </div>

            <Separator />

            {/* Section 2 */}
            <div>
              <TypographyH3 className="mb-3">2. Eligibility</TypographyH3>
              <TypographyP>
                You must be at least 18 years old, or legally capable of
                entering into binding contracts under applicable laws, to use
                our Services.
              </TypographyP>
            </div>

            <Separator />

            {/* Section 3 */}
            <div>
              <TypographyH3 className="mb-3">
                3. User Content & Image Uploads
              </TypographyH3>
              <div className="space-y-4">
                <TypographyP>
                  You may upload images and other content to use features like
                  AI product search.
                </TypographyP>

                <div className="bg-muted p-4 rounded-lg">
                  <TypographyP className="font-medium mb-2">
                    By uploading content, you grant YTL Concrete Hub:
                  </TypographyP>
                  <TypographyList>
                    <TypographyListItem>
                      A worldwide, non-exclusive, royalty-free license
                    </TypographyListItem>
                    <TypographyListItem>
                      Rights to store, process, analyze, and display content
                    </TypographyListItem>
                    <TypographyListItem>
                      Usage solely to provide and improve our Services
                    </TypographyListItem>
                  </TypographyList>
                </div>

                <div>
                  <TypographyP className="font-medium mb-2">
                    Your responsibilities:
                  </TypographyP>
                  <TypographyList>
                    <TypographyListItem>
                      You represent that you own or have rights to any content
                      you upload
                    </TypographyListItem>
                    <TypographyListItem>
                      You must not upload images that are unlawful or infringe
                      intellectual property
                    </TypographyListItem>
                    <TypographyListItem>
                      Content must not contain harmful or offensive material
                    </TypographyListItem>
                  </TypographyList>
                </div>

                <TypographyMuted>
                  We may remove any content that violates these Terms.
                </TypographyMuted>
              </div>
            </div>

            <Separator />

            {/* Section 4 */}
            <div>
              <TypographyH3 className="mb-3">
                4. AI Tools & Limitations
              </TypographyH3>
              <div className="space-y-4">
                <TypographyP>
                  Our AI-based features (including image product search, smart
                  comparison, and chatbot) are provided to assist you.
                </TypographyP>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-950/20">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <TypographyP className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Important Limitations:
                      </TypographyP>
                      <TypographyList className="text-yellow-700 dark:text-yellow-300">
                        <TypographyListItem>
                          AI may not always produce accurate, complete, or
                          up-to-date results
                        </TypographyListItem>
                        <TypographyListItem>
                          You should verify product details independently before
                          purchasing
                        </TypographyListItem>
                        <TypographyListItem>
                          We do not accept liability for decisions made solely
                          based on AI-generated content
                        </TypographyListItem>
                      </TypographyList>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 5 */}
            <div>
              <TypographyH3 className="mb-3">
                5. Purchases & Pricing
              </TypographyH3>
              <TypographyList>
                <TypographyListItem>
                  Product prices, availability, and specifications may change
                  without notice
                </TypographyListItem>
                <TypographyListItem>
                  Orders are only confirmed upon successful payment
                </TypographyListItem>
                <TypographyListItem>
                  All purchases are subject to our Shipping & Delivery Policy
                  and Refund & Return Policy
                </TypographyListItem>
                <TypographyListItem>
                  We may limit or cancel quantities purchased per person, per
                  company, or per order
                </TypographyListItem>
              </TypographyList>
            </div>

            <Separator />

            {/* Section 6 */}
            <div>
              <TypographyH3 className="mb-3">6. Prohibited Uses</TypographyH3>
              <TypographyP className="mb-3">You agree not to:</TypographyP>
              <TypographyList>
                <TypographyListItem>
                  Use the Services for unlawful purposes
                </TypographyListItem>
                <TypographyListItem>
                  Upload or distribute harmful, offensive, or infringing content
                </TypographyListItem>
                <TypographyListItem>
                  Reverse-engineer, decompile, or misuse our AI tools and
                  website systems
                </TypographyListItem>
                <TypographyListItem>
                  Interfere with the operation or security of the Services
                </TypographyListItem>
              </TypographyList>
            </div>

            <Separator />

            {/* Section 7 */}
            <div>
              <TypographyH3 className="mb-3">
                7. Intellectual Property
              </TypographyH3>
              <div className="space-y-3">
                <TypographyP>
                  All content on YTL Concrete Hub, including AI models, product
                  data, logos, text, graphics, and software, is owned by or
                  licensed to us and is protected by intellectual property laws.
                </TypographyP>
                <TypographyP>
                  You may not reproduce, distribute, or modify this content
                  without prior written permission.
                </TypographyP>
              </div>
            </div>

            <Separator />

            {/* Section 8 */}
            <div>
              <TypographyH3 className="mb-3">
                8. Limitation of Liability
              </TypographyH3>
              <TypographyP className="mb-3">
                To the fullest extent permitted by law:
              </TypographyP>
              <TypographyList>
                <TypographyListItem>
                  We do not guarantee the accuracy, completeness, or reliability
                  of AI-generated or website content
                </TypographyListItem>
                <TypographyListItem>
                  We shall not be liable for any indirect, incidental,
                  consequential, or punitive damages arising from your use of
                  the Services
                </TypographyListItem>
              </TypographyList>
            </div>

            <Separator />

            {/* Section 9 */}
            <div>
              <TypographyH3 className="mb-3">9. Changes to Terms</TypographyH3>
              <TypographyList>
                <TypographyListItem>
                  We may update these Terms from time to time
                </TypographyListItem>
                <TypographyListItem>
                  Material changes will be posted on our website
                </TypographyListItem>
                <TypographyListItem>
                  Your continued use of the Services after changes means you
                  accept the new Terms
                </TypographyListItem>
              </TypographyList>
            </div>

            <Separator />

            {/* Section 10 */}
            <div>
              <TypographyH3 className="mb-3">10. Privacy</TypographyH3>
              <div className="space-y-3">
                <TypographyP>Your privacy is important to us.</TypographyP>
                <TypographyP>
                  Please read our Privacy Policy to understand how we collect,
                  use, and protect your data, including uploaded images and chat
                  data.
                </TypographyP>
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

            <Separator className="my-8" />

            {/* Enhanced Footer */}
            <div className="bg-gradient-to-r from-muted/50 to-muted/80 p-6 rounded-lg border">
              <div className="text-center space-y-6">
                {/* Last Updated Info */}
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <TypographySmall className="text-muted-foreground">
                    Last updated: July 15, 2025
                  </TypographySmall>
                </div>

                {/* Call to Action */}
                <div className="space-y-2">
                  <TypographyP className="font-medium">
                    Need help or have questions about our terms?
                  </TypographyP>
                  <TypographyMuted>
                    We&apos;re here to help clarify any concerns you might have.
                  </TypographyMuted>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full"
                  >
                    Go Back
                  </Button>
                  <Button onClick={() => router.push("/")} className="w-full">
                    Return to Home
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/privacy")}
                    className="w-full"
                  >
                    Privacy Policy
                  </Button>
                </div>

                {/* Additional Links */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <a
                      href="mailto:legal@ytlconcretehub.com"
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      📧 Legal Questions
                    </a>
                    <span className="text-muted-foreground/50">•</span>
                    <a
                      href="mailto:support@ytlconcretehub.com"
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      💬 General Support
                    </a>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-muted-foreground">
                      🏢 YTL Concrete Hub
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
