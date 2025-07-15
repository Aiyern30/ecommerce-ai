"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Separator } from "@/components/ui/";
import { Badge } from "@/components/ui/";
import { Button } from "@/components/ui/";
import {
  TypographyH1,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyList,
  TypographyListItem,
  TypographyLead,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/Typography";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <TypographyH1>Privacy Policy</TypographyH1>
        </div>
        <Badge variant="outline" className="mb-4">
          Effective Date: July 15, 2025
        </Badge>
        <TypographyLead className="max-w-3xl mx-auto">
          Your privacy is important to us. This Privacy Policy explains how YTL
          Concrete Hub collects, uses, and protects your personal information.
        </TypographyLead>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none dark:prose-invert space-y-6">
            {/* Section 1 */}
            <div>
              <TypographyH3 className="mb-3">
                1. Information We Collect
              </TypographyH3>

              <div className="space-y-4">
                <div>
                  <TypographyH4 className="mb-2">
                    Personal Information:
                  </TypographyH4>
                  <TypographyList>
                    <TypographyListItem>
                      Name, email address, phone number
                    </TypographyListItem>
                    <TypographyListItem>
                      Billing and shipping addresses
                    </TypographyListItem>
                    <TypographyListItem>
                      Payment information (processed securely)
                    </TypographyListItem>
                    <TypographyListItem>
                      Account preferences and settings
                    </TypographyListItem>
                  </TypographyList>
                </div>

                <div>
                  <TypographyH4 className="mb-2">AI & Usage Data:</TypographyH4>
                  <TypographyList>
                    <TypographyListItem>
                      Images uploaded for AI product search
                    </TypographyListItem>
                    <TypographyListItem>
                      Chat messages and interactions with our AI chatbot
                    </TypographyListItem>
                    <TypographyListItem>
                      Product searches and comparisons
                    </TypographyListItem>
                    <TypographyListItem>
                      Website usage patterns and preferences
                    </TypographyListItem>
                  </TypographyList>
                </div>

                <div>
                  <TypographyH4 className="mb-2">
                    Technical Information:
                  </TypographyH4>
                  <TypographyList>
                    <TypographyListItem>
                      IP address, browser type, device information
                    </TypographyListItem>
                    <TypographyListItem>
                      Cookies and similar tracking technologies
                    </TypographyListItem>
                    <TypographyListItem>
                      Log files and website analytics
                    </TypographyListItem>
                  </TypographyList>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 2 */}
            <div>
              <TypographyH3 className="mb-3">
                2. How We Use Your Information
              </TypographyH3>
              <TypographyList>
                <TypographyListItem>
                  <strong className="text-foreground">Service Delivery:</strong>{" "}
                  Process orders, payments, and shipments
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">AI Features:</strong>{" "}
                  Provide image search, product recommendations, and chatbot
                  assistance
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">
                    Account Management:
                  </strong>{" "}
                  Maintain your account and preferences
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">Communication:</strong>{" "}
                  Send order updates, support responses, and service
                  notifications
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">Improvement:</strong>{" "}
                  Analyze usage to enhance our AI tools and website
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">Security:</strong> Detect
                  fraud and ensure platform security
                </TypographyListItem>
              </TypographyList>
            </div>

            <Separator />

            {/* Section 3 */}
            <div>
              <TypographyH3 className="mb-3">
                3. Information Sharing
              </TypographyH3>
              <TypographyP className="mb-3">
                We do not sell your personal information. We may share
                information with:
              </TypographyP>
              <TypographyList>
                <TypographyListItem>
                  <strong className="text-foreground">
                    Service Providers:
                  </strong>{" "}
                  Payment processors, shipping companies, cloud storage
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">YTL Group:</strong>{" "}
                  Related companies within the YTL corporate family
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">
                    Legal Requirements:
                  </strong>{" "}
                  When required by law or to protect our rights
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">
                    Business Transfers:
                  </strong>{" "}
                  In case of merger, acquisition, or asset sale
                </TypographyListItem>
              </TypographyList>
            </div>

            <Separator />

            {/* Section 4 */}
            <div>
              <TypographyH3 className="mb-3">
                4. AI Data Processing
              </TypographyH3>
              <div className="space-y-4">
                <div>
                  <TypographyH4 className="mb-2">Image Uploads:</TypographyH4>
                  <TypographyList>
                    <TypographyListItem>
                      Images are processed by our AI to identify similar
                      products
                    </TypographyListItem>
                    <TypographyListItem>
                      Images may be stored temporarily to improve AI accuracy
                    </TypographyListItem>
                    <TypographyListItem>
                      We do not use your images for commercial purposes beyond
                      our services
                    </TypographyListItem>
                  </TypographyList>
                </div>

                <div>
                  <TypographyH4 className="mb-2">Chat Data:</TypographyH4>
                  <TypographyList>
                    <TypographyListItem>
                      Conversations help train and improve our chatbot
                    </TypographyListItem>
                    <TypographyListItem>
                      Personal information is anonymized when used for training
                    </TypographyListItem>
                    <TypographyListItem>
                      You can request deletion of your chat history
                    </TypographyListItem>
                  </TypographyList>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 5 */}
            <div>
              <TypographyH3 className="mb-3">5. Data Security</TypographyH3>
              <TypographyP className="mb-3">
                We implement industry-standard security measures:
              </TypographyP>
              <TypographyList>
                <TypographyListItem>
                  SSL/TLS encryption for data transmission
                </TypographyListItem>
                <TypographyListItem>
                  Secure cloud storage with access controls
                </TypographyListItem>
                <TypographyListItem>
                  Regular security audits and updates
                </TypographyListItem>
                <TypographyListItem>
                  Employee training on data protection
                </TypographyListItem>
                <TypographyListItem>
                  Payment data handled by PCI-compliant processors
                </TypographyListItem>
              </TypographyList>
            </div>

            <Separator />

            {/* Section 6 */}
            <div>
              <TypographyH3 className="mb-3">6. Your Rights</TypographyH3>
              <TypographyP className="mb-3">You have the right to:</TypographyP>
              <TypographyList>
                <TypographyListItem>
                  <strong className="text-foreground">Access:</strong> Request a
                  copy of your personal data
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">Correct:</strong> Update
                  inaccurate or incomplete information
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">Delete:</strong> Request
                  deletion of your personal data
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">Restrict:</strong> Limit
                  how we process your information
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">Portable:</strong> Receive
                  your data in a machine-readable format
                </TypographyListItem>
                <TypographyListItem>
                  <strong className="text-foreground">Object:</strong> Opt-out
                  of certain data processing activities
                </TypographyListItem>
              </TypographyList>
              <TypographyMuted className="mt-3">
                To exercise these rights, please contact us using the
                information below.
              </TypographyMuted>
            </div>

            <Separator />

            {/* Section 7 */}
            <div>
              <TypographyH3 className="mb-3">
                7. Cookies & Tracking
              </TypographyH3>
              <TypographyP className="mb-3">
                We use cookies and similar technologies to:
              </TypographyP>
              <TypographyList>
                <TypographyListItem>
                  Remember your preferences and login status
                </TypographyListItem>
                <TypographyListItem>
                  Analyze website traffic and usage patterns
                </TypographyListItem>
                <TypographyListItem>
                  Provide personalized content and recommendations
                </TypographyListItem>
                <TypographyListItem>
                  Ensure website security and prevent fraud
                </TypographyListItem>
              </TypographyList>
              <TypographyMuted className="mt-3">
                You can manage cookie preferences through your browser settings.
              </TypographyMuted>
            </div>

            <Separator />

            {/* Section 8 */}
            <div>
              <TypographyH3 className="mb-3">8. Data Retention</TypographyH3>
              <TypographyList>
                <TypographyListItem>
                  Account data: Retained while your account is active
                </TypographyListItem>
                <TypographyListItem>
                  Order history: Kept for legal and business purposes (typically
                  7 years)
                </TypographyListItem>
                <TypographyListItem>
                  AI training data: Anonymized and retained to improve services
                </TypographyListItem>
                <TypographyListItem>
                  Marketing data: Until you unsubscribe or request deletion
                </TypographyListItem>
              </TypographyList>
            </div>

            <Separator />

            {/* Section 9 */}
            <div>
              <TypographyH3 className="mb-3">
                9. Updates to This Policy
              </TypographyH3>
              <TypographyP className="mb-3">
                We may update this Privacy Policy periodically. Material changes
                will be posted on our website with an updated effective date.
              </TypographyP>
              <TypographyP>
                Your continued use of our services after changes constitutes
                acceptance of the updated policy.
              </TypographyP>
            </div>

            <Separator />

            {/* Section 10 */}
            <div>
              <TypographyH3 className="mb-3">10. Contact Us</TypographyH3>
              <TypographyP className="mb-4">
                For privacy-related questions or to exercise your rights,
                contact us:
              </TypographyP>
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
            </div>

            <Separator className="my-8" />

            {/* Enhanced Footer */}
            <div className="bg-gradient-to-r from-muted/50 to-muted/80 p-6 rounded-lg border">
              <div className="text-center space-y-6">
                {/* Last Updated Info */}
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <TypographySmall className="text-muted-foreground">
                    Last updated: July 15, 2025
                  </TypographySmall>
                </div>
                
                {/* Call to Action */}
                <div className="space-y-2">
                  <TypographyP className="font-medium">
                    Questions about your privacy and data protection?
                  </TypographyP>
                  <TypographyMuted>
                    Your privacy matters to us. Contact us for any privacy-related concerns.
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
                  <Button 
                    onClick={() => router.push("/")}
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/terms")}
                    className="w-full"
                  >
                    Terms & Conditions
                  </Button>
                </div>

                {/* Privacy-Specific Links */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <a 
                      href="mailto:privacy@ytlconcretehub.com" 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      🛡️ Privacy Officer
                    </a>
                    <span className="text-muted-foreground/50">•</span>
                    <a 
                      href="mailto:dpo@ytlconcretehub.com" 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      📋 Data Protection
                    </a>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-muted-foreground">
                      🔒 GDPR Compliant
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
