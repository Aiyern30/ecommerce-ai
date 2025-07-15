"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Separator } from "@/components/ui/";
import { Badge } from "@/components/ui/";
import { Button } from "@/components/ui/";
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
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>
        <Badge variant="outline" className="mb-4">
          Effective Date: July 15, 2025
        </Badge>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Your privacy is important to us. This Privacy Policy explains how YTL
          Concrete Hub collects, uses, and protects your personal information.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section 1 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                1. Information We Collect
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Personal Information:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Name, email address, phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely)</li>
                    <li>Account preferences and settings</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">AI & Usage Data:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Images uploaded for AI product search</li>
                    <li>Chat messages and interactions with our AI chatbot</li>
                    <li>Product searches and comparisons</li>
                    <li>Website usage patterns and preferences</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Technical Information:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>IP address, browser type, device information</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Log files and website analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 2 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                2. How We Use Your Information
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  •{" "}
                  <strong className="text-foreground">Service Delivery:</strong>{" "}
                  Process orders, payments, and shipments
                </li>
                <li>
                  • <strong className="text-foreground">AI Features:</strong>{" "}
                  Provide image search, product recommendations, and chatbot
                  assistance
                </li>
                <li>
                  •{" "}
                  <strong className="text-foreground">
                    Account Management:
                  </strong>{" "}
                  Maintain your account and preferences
                </li>
                <li>
                  • <strong className="text-foreground">Communication:</strong>{" "}
                  Send order updates, support responses, and service
                  notifications
                </li>
                <li>
                  • <strong className="text-foreground">Improvement:</strong>{" "}
                  Analyze usage to enhance our AI tools and website
                </li>
                <li>
                  • <strong className="text-foreground">Security:</strong>{" "}
                  Detect fraud and ensure platform security
                </li>
              </ul>
            </div>

            <Separator />

            {/* Section 3 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                3. Information Sharing
              </h3>
              <p className="mb-3">
                We do not sell your personal information. We may share
                information with:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  •{" "}
                  <strong className="text-foreground">
                    Service Providers:
                  </strong>{" "}
                  Payment processors, shipping companies, cloud storage
                </li>
                <li>
                  • <strong className="text-foreground">YTL Group:</strong>{" "}
                  Related companies within the YTL corporate family
                </li>
                <li>
                  •{" "}
                  <strong className="text-foreground">
                    Legal Requirements:
                  </strong>{" "}
                  When required by law or to protect our rights
                </li>
                <li>
                  •{" "}
                  <strong className="text-foreground">
                    Business Transfers:
                  </strong>{" "}
                  In case of merger, acquisition, or asset sale
                </li>
              </ul>
            </div>

            <Separator />

            {/* Section 4 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                4. AI Data Processing
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Image Uploads:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>
                      Images are processed by our AI to identify similar
                      products
                    </li>
                    <li>
                      Images may be stored temporarily to improve AI accuracy
                    </li>
                    <li>
                      We do not use your images for commercial purposes beyond
                      our services
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Chat Data:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Conversations help train and improve our chatbot</li>
                    <li>
                      Personal information is anonymized when used for training
                    </li>
                    <li>You can request deletion of your chat history</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 5 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">5. Data Security</h3>
              <p className="mb-3">
                We implement industry-standard security measures:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• SSL/TLS encryption for data transmission</li>
                <li>• Secure cloud storage with access controls</li>
                <li>• Regular security audits and updates</li>
                <li>• Employee training on data protection</li>
                <li>• Payment data handled by PCI-compliant processors</li>
              </ul>
            </div>

            <Separator />

            {/* Section 6 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">6. Your Rights</h3>
              <p className="mb-3">You have the right to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  • <strong className="text-foreground">Access:</strong> Request
                  a copy of your personal data
                </li>
                <li>
                  • <strong className="text-foreground">Correct:</strong> Update
                  inaccurate or incomplete information
                </li>
                <li>
                  • <strong className="text-foreground">Delete:</strong> Request
                  deletion of your personal data
                </li>
                <li>
                  • <strong className="text-foreground">Restrict:</strong> Limit
                  how we process your information
                </li>
                <li>
                  • <strong className="text-foreground">Portable:</strong>{" "}
                  Receive your data in a machine-readable format
                </li>
                <li>
                  • <strong className="text-foreground">Object:</strong> Opt-out
                  of certain data processing activities
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                To exercise these rights, please contact us using the
                information below.
              </p>
            </div>

            <Separator />

            {/* Section 7 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                7. Cookies & Tracking
              </h3>
              <p className="mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Remember your preferences and login status</li>
                <li>• Analyze website traffic and usage patterns</li>
                <li>• Provide personalized content and recommendations</li>
                <li>• Ensure website security and prevent fraud</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                You can manage cookie preferences through your browser settings.
              </p>
            </div>

            <Separator />

            {/* Section 8 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">8. Data Retention</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Account data: Retained while your account is active</li>
                <li>
                  • Order history: Kept for legal and business purposes
                  (typically 7 years)
                </li>
                <li>
                  • AI training data: Anonymized and retained to improve
                  services
                </li>
                <li>
                  • Marketing data: Until you unsubscribe or request deletion
                </li>
              </ul>
            </div>

            <Separator />

            {/* Section 9 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                9. Updates to This Policy
              </h3>
              <p className="mb-3 text-muted-foreground">
                We may update this Privacy Policy periodically. Material changes
                will be posted on our website with an updated effective date.
              </p>
              <p className="text-muted-foreground">
                Your continued use of our services after changes constitutes
                acceptance of the updated policy.
              </p>
            </div>

            <Separator />

            {/* Section 10 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">10. Contact Us</h3>
              <p className="mb-4">
                For privacy-related questions or to exercise your rights,
                contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="flex items-center gap-2">
                  📧 <strong>Privacy Email:</strong> privacy@ytlconcretehub.com
                </p>
                <p className="flex items-center gap-2">
                  📧 <strong>General Support:</strong>{" "}
                  support@ytlconcretehub.com
                </p>
                <p className="flex items-center gap-2">
                  📍 <strong>Address:</strong> Level 15, 205, Jln Bukit Bintang,
                  Bukit Bintang, 55100 Kuala Lumpur, Federal Territory of Kuala
                  Lumpur
                </p>
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
                <Button variant="outline" onClick={() => router.push("/terms")}>
                  View Terms & Conditions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
