/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/gemini/concreteIntentAnalyzer.ts

export interface ConcreteIntentAnalysis {
  intent:
    | "product_search"
    | "grade_inquiry"
    | "price_inquiry"
    | "delivery_inquiry"
    | "technical_question"
    | "recommendation"
    | "stock_inquiry"
    | "general_question";
  confidence: number;
  extractedData: {
    query?: string;
    productType?: "concrete" | "mortar";
    grade?: string;
    deliveryMethod?: "normal" | "pump" | "tremie_1" | "tremie_2" | "tremie_3";
    priceRange?: { min?: number; max?: number };
    volume?: number;
    searchTerms?: string[];
    location?: string;
  };
}

export class ConcreteIntentAnalyzer {
  private static readonly PRODUCT_KEYWORDS = [
    "concrete",
    "mortar",
    "mix",
    "cement",
    "grade",
    "strength",
    "foundation",
    "structural",
    "building",
    "construction",
    "ready mix",
    "premix",
  ];

  private static readonly GRADE_KEYWORDS = [
    "c25",
    "c30",
    "c35",
    "c40",
    "c45",
    "c50",
    "m15",
    "m20",
    "m25",
    "m30",
    "grade",
    "strength",
    "mpa",
    "n/mm2",
    "class",
  ];

  private static readonly DELIVERY_KEYWORDS = {
    normal: ["normal", "standard", "regular", "truck", "lorry"],
    pump: ["pump", "pumped", "pumping", "concrete pump", "boom pump"],
    tremie: ["tremie", "underwater", "tremie 1", "tremie 2", "tremie 3"],
  };

  private static readonly PRICE_KEYWORDS = [
    "price",
    "cost",
    "rate",
    "how much",
    "expensive",
    "cheap",
    "budget",
    "per m3",
    "per cubic",
    "rm",
    "$",
    "ringgit",
    "quotation",
    "quote",
  ];

  private static readonly TECHNICAL_KEYWORDS = [
    "specification",
    "spec",
    "datasheet",
    "properties",
    "compressive strength",
    "workability",
    "slump",
    "aggregate",
    "cement content",
    "mix design",
    "curing",
    "setting time",
    "durability",
    "waterproof",
    "admixture",
  ];

  private static readonly DELIVERY_INQUIRY_KEYWORDS = [
    "delivery",
    "deliver",
    "transport",
    "shipping",
    "schedule",
    "when",
    "location",
    "area",
    "distance",
    "minimum order",
    "lead time",
  ];

  private static readonly STOCK_KEYWORDS = [
    "available",
    "stock",
    "inventory",
    "in stock",
    "supply",
    "shortage",
    "availability",
    "ready",
    "immediate",
  ];

  static analyzeIntent(message: string): ConcreteIntentAnalysis {
    const lowerMessage = message.toLowerCase();

    // Calculate confidence scores for each intent
    const scores = {
      product_search:
        this.calculateScore(lowerMessage, this.PRODUCT_KEYWORDS) * 1.2,
      grade_inquiry:
        this.calculateScore(lowerMessage, this.GRADE_KEYWORDS) * 1.5,
      price_inquiry:
        this.calculateScore(lowerMessage, this.PRICE_KEYWORDS) * 1.3,
      delivery_inquiry:
        this.calculateScore(lowerMessage, this.DELIVERY_INQUIRY_KEYWORDS) * 1.1,
      technical_question:
        this.calculateScore(lowerMessage, this.TECHNICAL_KEYWORDS) * 1.0,
      stock_inquiry:
        this.calculateScore(lowerMessage, this.STOCK_KEYWORDS) * 1.1,
      recommendation:
        this.calculateScore(lowerMessage, [
          "recommend",
          "suggest",
          "best",
          "suitable",
          "which",
        ]) * 0.9,
      general_question: 0.1, // Default low score
    };

    // Boost scores based on question patterns
    if (
      lowerMessage.includes("what") ||
      lowerMessage.includes("which") ||
      lowerMessage.includes("how")
    ) {
      if (
        this.GRADE_KEYWORDS.some((keyword) => lowerMessage.includes(keyword))
      ) {
        scores.grade_inquiry *= 1.5;
      }
      if (
        this.PRICE_KEYWORDS.some((keyword) => lowerMessage.includes(keyword))
      ) {
        scores.price_inquiry *= 1.3;
      }
      if (
        this.TECHNICAL_KEYWORDS.some((keyword) =>
          lowerMessage.includes(keyword)
        )
      ) {
        scores.technical_question *= 1.4;
      }
    }

    // Find the intent with the highest score
    const topIntent = Object.entries(scores).reduce((a, b) =>
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores]
        ? a
        : b
    );

    const intent = topIntent[0] as keyof typeof scores;
    const confidence = Math.min(scores[intent], 1);

    // Extract relevant data based on intent
    const extractedData = this.extractData(message, intent);

    return {
      intent,
      confidence,
      extractedData,
    };
  }

  private static calculateScore(message: string, keywords: string[]): number {
    let score = 0;
    keywords.forEach((keyword) => {
      if (message.includes(keyword)) {
        score += 1 / keywords.length;
      }
    });
    return Math.min(score, 1);
  }

  private static extractData(message: string, intent: string): any {
    console.log(`Extracting data for intent: ${intent}`);
    const data: any = {};
    const lowerMessage = message.toLowerCase();

    // Extract search query
    data.query = message.trim();

    // Extract product type
    if (
      lowerMessage.includes("concrete") ||
      lowerMessage.includes("ready mix")
    ) {
      data.productType = "concrete";
    } else if (lowerMessage.includes("mortar")) {
      data.productType = "mortar";
    }

    // Extract grade information
    const gradePatterns = [
      /\bc(\d{2})(?:\/(\d{2}))?\b/gi, // C25/30, C30, etc.
      /\bm(\d{1,2})\b/gi, // M15, M20, etc.
      /grade\s+(\w+)/gi, // Grade C25
      /(\d{2,3})\s*(?:mpa|n\/mm2)/gi, // 25 MPa, 30 N/mm2
    ];

    for (const pattern of gradePatterns) {
      const matches = lowerMessage.matchAll(pattern);
      for (const match of matches) {
        if (match[0]) {
          data.grade = match[0].toUpperCase();
          break;
        }
      }
      if (data.grade) break;
    }

    // Extract delivery method
    for (const [method, keywords] of Object.entries(this.DELIVERY_KEYWORDS)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        if (method === "tremie") {
          // Check for specific tremie types
          if (lowerMessage.includes("tremie 1"))
            data.deliveryMethod = "tremie_1";
          else if (lowerMessage.includes("tremie 2"))
            data.deliveryMethod = "tremie_2";
          else if (lowerMessage.includes("tremie 3"))
            data.deliveryMethod = "tremie_3";
          else data.deliveryMethod = "tremie_1"; // Default tremie
        } else {
          data.deliveryMethod = method;
        }
        break;
      }
    }

    // Extract price range
    const pricePatterns = [
      /under\s+(?:rm\s*)?(\d+)/gi,
      /below\s+(?:rm\s*)?(\d+)/gi,
      /less\s+than\s+(?:rm\s*)?(\d+)/gi,
      /over\s+(?:rm\s*)?(\d+)/gi,
      /above\s+(?:rm\s*)?(\d+)/gi,
      /more\s+than\s+(?:rm\s*)?(\d+)/gi,
      /between\s+(?:rm\s*)?(\d+)(?:\s+and\s+|\s*-\s*)(?:rm\s*)?(\d+)/gi,
      /rm\s*(\d+)(?:\s*-\s*|\s+to\s+)rm\s*(\d+)/gi,
    ];

    for (const pattern of pricePatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        const nums = match[0].match(/\d+/g);
        if (nums) {
          if (pattern.source.includes("under|below|less")) {
            data.priceRange = { max: parseInt(nums[0]) };
          } else if (pattern.source.includes("over|above|more")) {
            data.priceRange = { min: parseInt(nums[0]) };
          } else if (nums.length > 1) {
            data.priceRange = {
              min: parseInt(nums[0]),
              max: parseInt(nums[1]),
            };
          }
        }
        break;
      }
    }

    // Extract volume information
    const volumePatterns = [
      /(\d+(?:\.\d+)?)\s*(?:m3|cubic\s*met(?:er|re)s?|m³)/gi,
      /(\d+(?:\.\d+)?)\s*(?:meter|metre)s?\s*cube/gi,
    ];

    for (const pattern of volumePatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        const nums = match[0].match(/\d+(?:\.\d+)?/);
        if (nums) {
          data.volume = parseFloat(nums[0]);
          break;
        }
      }
    }

    // Extract location information
    const locationPatterns = [
      /(?:in|at|to|for)\s+([a-zA-Z\s]+?)(?:\s|$|,)/gi,
      /area\s*:\s*([a-zA-Z\s]+?)(?:\s|$|,)/gi,
      /location\s*:\s*([a-zA-Z\s]+?)(?:\s|$|,)/gi,
    ];

    for (const pattern of locationPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
        // Filter out common non-location words
        if (
          !["delivery", "construction", "building", "project"].includes(
            location.toLowerCase()
          )
        ) {
          data.location = location;
          break;
        }
      }
    }

    // Extract search terms (filter out stop words)
    const stopWords = [
      "the",
      "and",
      "for",
      "with",
      "what",
      "how",
      "where",
      "when",
      "why",
      "is",
      "are",
      "can",
      "do",
      "does",
    ];
    data.searchTerms = message
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2 && !stopWords.includes(term))
      .slice(0, 5); // Limit to first 5 meaningful terms

    return data;
  }

  // Helper method to generate appropriate suggestions based on intent
  static generateSuggestions(intent: string, extractedData: any): string[] {
    const suggestions: { [key: string]: string[] } = {
      product_search: [
        "Show me concrete grades",
        "What about mortar options?",
        "Compare different strengths",
      ],
      grade_inquiry: [
        "Show C25/30 products",
        "What about higher grades?",
        "Compare grade prices",
      ],
      price_inquiry: [
        "Compare delivery methods",
        "Show pump prices",
        "Budget options under RM100",
      ],
      delivery_inquiry: [
        "Minimum order quantity?",
        "Delivery schedule?",
        "Available areas",
      ],
      technical_question: [
        "Product specifications",
        "Mix design details",
        "Application guide",
      ],
      stock_inquiry: [
        "Check availability",
        "Alternative products",
        "Restock schedule",
      ],
      recommendation: [
        "For foundation work",
        "For structural work",
        "Budget-friendly options",
      ],
      general_question: [
        "Browse concrete products",
        "Show popular grades",
        "Compare prices",
      ],
    };

    let baseSuggestions = suggestions[intent] || suggestions.general_question;

    // Customize suggestions based on extracted data
    if (extractedData.productType === "concrete") {
      baseSuggestions = baseSuggestions.map((s) =>
        s.replace("products", "concrete mixes")
      );
    } else if (extractedData.productType === "mortar") {
      baseSuggestions = baseSuggestions.map((s) =>
        s.replace("products", "mortar mixes")
      );
    }

    return baseSuggestions;
  }

  // Helper method to determine if the query is construction-related
  static isConstructionQuery(message: string): boolean {
    const constructionKeywords = [
      ...this.PRODUCT_KEYWORDS,
      ...this.GRADE_KEYWORDS,
      ...this.TECHNICAL_KEYWORDS,
      "building",
      "construction",
      "foundation",
      "slab",
      "beam",
      "column",
      "footing",
      "driveway",
      "sidewalk",
      "patio",
      "structure",
    ];

    const lowerMessage = message.toLowerCase();
    return constructionKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );
  }

  // Helper method to extract construction project type
  static getProjectType(message: string): string | null {
    const projectTypes = {
      foundation: ["foundation", "footing", "basement"],
      structural: ["beam", "column", "slab", "structural", "frame"],
      flatwork: ["driveway", "sidewalk", "patio", "floor", "flatwork"],
      wall: ["wall", "retaining", "boundary"],
      repair: ["repair", "patch", "fix", "maintenance"],
    };

    const lowerMessage = message.toLowerCase();

    for (const [type, keywords] of Object.entries(projectTypes)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        return type;
      }
    }

    return null;
  }
}
