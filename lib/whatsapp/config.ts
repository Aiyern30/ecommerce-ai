// WhatsApp Business Configuration
export const WHATSAPP_CONFIG = {
  // Replace with your business WhatsApp number (include country code, no spaces or special characters)
  businessNumber: "+60182133211",

  // Business information
  businessName: "YTL Concrete Hub",

  // Default messages for different scenarios
  defaultMessages: {
    general: "Hello! I'm interested in your products and services.",
    quote: "I need a quote for concrete products.",
    support: "I need help with my order.",
    products: "I'd like to know more about your concrete products.",
  },

  // Message templates
  templates: [
    "Hello! I'm interested in your concrete products.",
    "I need a quote for bulk concrete orders.",
    "What are your current concrete prices?",
    "I need technical specifications for your products.",
    "I want to schedule a site visit.",
    "I have questions about product delivery.",
    "I need support with my existing order.",
  ],

  // Business hours (optional - for display purposes)
  businessHours: {
    weekdays: "9:00 AM - 6:00 PM",
    saturday: "9:00 AM - 2:00 PM",
    sunday: "Closed",
    timezone: "GMT+8",
  },

  // Response time expectation
  responseTime: "We typically respond within 30 minutes during business hours.",
};

// Helper function to create WhatsApp URL
export function createWhatsAppUrl(
  phoneNumber: string = WHATSAPP_CONFIG.businessNumber,
  message: string = WHATSAPP_CONFIG.defaultMessages.general
): string {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

// Helper function to format phone number for display
export function formatPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/(\+\d{2})(\d{3})(\d{3})(\d{4})/, "$1 $2-$3-$4");
}
