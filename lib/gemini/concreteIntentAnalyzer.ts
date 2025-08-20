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
    | "application_inquiry"
    | "comparison_request"
    | "general_question"
    | "cart_show"
    | "order_status";
  confidence: number;
  extractedData: {
    query?: string;
    productType?: "concrete" | "mortar";
    grade?: string;
    gradeRange?: { min?: string; max?: string };
    deliveryMethod?: "normal" | "pump" | "tremie_1" | "tremie_2" | "tremie_3";
    priceRange?: { min?: number; max?: number };
    volume?: number;
    searchTerms?: string[];
    location?: string;
    applicationType?: string;
    projectType?: string;
    strengthRequirement?: string;
  };
}

export class ConcreteIntentAnalyzer {
  // Enhanced product keywords specific to your concrete business
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
    "readymix",
    "concrete mix",
    "building materials",
    "slab",
    "beam",
    "column",
    "footing",
    "driveway",
    "floor",
    "patio",
    "sidewalk",
    "pavement",
    "pathway",
    "basement",
  ];

  // Updated grade keywords to match your N10-N25 and S30-S45 products
  private static readonly GRADE_KEYWORDS = [
    // N-Series grades (N10 to N25)
    "n10",
    "n15",
    "n20",
    "n25",
    // S-Series grades (S30 to S45)
    "s30",
    "s35",
    "s40",
    "s45",
    // Generic grade terms
    "grade",
    "strength",
    "class",
    "series",
    // Strength measurements
    "mpa",
    "n/mm2",
    "megapascal",
    "newton",
    // Common alternative references
    "low grade",
    "medium grade",
    "high grade",
    "standard grade",
    "premium grade",
    "residential grade",
    "commercial grade",
    "structural grade",
  ];

  private static readonly DELIVERY_KEYWORDS = {
    normal: [
      "normal",
      "standard",
      "regular",
      "truck",
      "lorry",
      "delivery truck",
      "concrete truck",
      "mixer truck",
    ],
    pump: [
      "pump",
      "pumped",
      "pumping",
      "concrete pump",
      "boom pump",
      "line pump",
      "trailer pump",
      "stationary pump",
    ],
    tremie: [
      "tremie",
      "underwater",
      "tremie 1",
      "tremie 2",
      "tremie 3",
      "special delivery",
      "difficult access",
    ],
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
    "per cube",
    "rm",
    "ringgit",
    "dollar",
    "$",
    "quotation",
    "quote",
    "estimate",
    "pricing",
    "charges",
    "fees",
    "affordable",
    "economical",
    "value",
    "total cost",
    "unit price",
  ];

  // Enhanced technical keywords relevant to concrete specifications
  private static readonly TECHNICAL_KEYWORDS = [
    "specification",
    "spec",
    "datasheet",
    "properties",
    "technical data",
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
    "additive",
    "water cement ratio",
    "consistency",
    "density",
    "porosity",
    "permeability",
    "shrinkage",
    "expansion",
    "freeze thaw",
    "chemical resistance",
    "abrasion resistance",
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
    "same day",
    "next day",
    "urgent",
    "rush",
    "timing",
    "availability",
    "coverage area",
    "service area",
    "delivery fee",
    "freight",
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
    "on hand",
    "reserve",
    "backorder",
    "out of stock",
    "restock",
    "replenish",
  ];

  // New application-specific keywords
  private static readonly APPLICATION_KEYWORDS = [
    // Residential applications
    "residential",
    "home",
    "house",
    "driveway",
    "garage",
    "patio",
    "sidewalk",
    "pathway",
    "basement",
    "foundation",
    "slab",

    // Commercial applications
    "commercial",
    "office",
    "retail",
    "warehouse",
    "factory",
    "industrial",
    "shopping center",
    "building",

    // Infrastructure applications
    "bridge",
    "tunnel",
    "road",
    "highway",
    "airport",
    "port",
    "infrastructure",
    "public works",

    // Specific structural elements
    "beam",
    "column",
    "wall",
    "footing",
    "pile",
    "deck",
    "staircase",
    "ramp",
    "curb",
    "gutter",
  ];

  // Project type keywords
  private static readonly PROJECT_TYPE_KEYWORDS = {
    foundation: [
      "foundation",
      "footing",
      "basement",
      "underground",
      "pile",
      "deep foundation",
    ],
    structural: [
      "beam",
      "column",
      "slab",
      "structural",
      "frame",
      "load bearing",
      "reinforced",
    ],
    flatwork: [
      "driveway",
      "sidewalk",
      "patio",
      "floor",
      "flatwork",
      "pavement",
      "pathway",
    ],
    wall: ["wall", "retaining wall", "boundary wall", "partition", "barrier"],
    repair: [
      "repair",
      "patch",
      "fix",
      "maintenance",
      "restoration",
      "renovation",
    ],
    decorative: [
      "decorative",
      "architectural",
      "stamped",
      "colored",
      "textured",
    ],
  };

  private static readonly CART_KEYWORDS = [
    "cart",
    "my cart",
    "show cart",
    "view cart",
    "open cart",
    "go to cart",
    "check cart",
    "cart items",
    "cart list",
    "cart contents",
    "cart details",
    "cart summary",
    "cart overview",
    "shopping cart",
    "shopping basket",
    "basket",
    "my basket",
    "show basket",
    "view basket",
    "basket items",
    "basket contents",
    "basket details",
    "basket summary",
    "basket overview",
    "see my cart",
    "show my cart",
    "open my cart",
    "check my cart",
    "what's in my cart",
    "items in cart",
    "products in cart",
    "things in my cart",
    "stuff in my cart",
    "display cart",
    "display my cart",
    "show what I added",
    "show my shopping cart",
    "what did I add",
    "see cart items",
    "review my cart",
    "review cart",
    "my shopping list",
    "shopping list",
  ];

  private static readonly ORDER_STATUS_KEYWORDS = [
    "order",
    "orders",
    "my order",
    "my orders",
    "show order",
    "show orders",
    "view order",
    "view orders",
    "check order",
    "check orders",
    "order status",
    "order update",
    "order updates",
    "order info",
    "order information",
    "order details",
    "order history",
    "order progress",
    "order summary",
    "recent order",
    "recent orders",
    "latest order",
    "latest orders",
    "my recent order",
    "my recent orders",
    "my last order",
    "last order",
    "past orders",
    "previous orders",
    "placed orders",
    "placed order",
    "order number",
    "order id",
    "order reference",
    "track order",
    "track orders",
    "track my order",
    "track my orders",
    "order tracking",
    "track package",
    "track parcel",
    "track shipment",
    "track delivery",
    "shipment status",
    "package status",
    "parcel status",
    "delivery status",
    "delivery info",
    "delivery information",
    "delivery update",
    "delivery updates",
    "shipping status",
    "shipping info",
    "shipping details",
    "where is my order",
    "where is my orders",
    "has my order shipped",
    "did my order ship",
    "is my order delivered",
    "when will my order arrive",
    "order arrival",
    "order dispatched",
    "order shipped",
    "order delivered",
    "order pending",
    "order processing",
    "order in progress",
    "order in transit",
    "order completed",
    "order cancelled",
    "order canceled",
    "order confirmed",
    "order not delivered",
    "order journey",
    "order placed",
    "order being prepared",
    "package tracking",
    "shipment tracking",
    "parcel tracking",
    "delivery tracking",
    "track my delivery",
    "track my package",
    "track my parcel",
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
      application_inquiry:
        this.calculateScore(lowerMessage, this.APPLICATION_KEYWORDS) * 1.0,
      comparison_request:
        this.calculateScore(lowerMessage, [
          "compare",
          "vs",
          "versus",
          "difference",
          "better",
          "best",
        ]) * 0.9,
      recommendation:
        this.calculateScore(lowerMessage, [
          "recommend",
          "suggest",
          "best",
          "suitable",
          "which",
          "what should",
        ]) * 0.9,
      general_question: 0.1, // Default low score
      cart_show: this.calculateScore(lowerMessage, this.CART_KEYWORDS) * 2.0, // <-- Added cart_show scoring
      order_status:
        this.calculateScore(lowerMessage, this.ORDER_STATUS_KEYWORDS) * 2.0, // <-- Added order_status scoring
    };

    // Boost scores based on question patterns and context
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
      if (
        this.APPLICATION_KEYWORDS.some((keyword) =>
          lowerMessage.includes(keyword)
        )
      ) {
        scores.application_inquiry *= 1.3;
      }
    }

    // Boost comparison requests
    if (
      lowerMessage.includes("compare") ||
      lowerMessage.includes("vs") ||
      lowerMessage.includes("difference")
    ) {
      scores.comparison_request *= 2.0;
    }

    // Boost grade inquiry for specific grade mentions
    const gradeMatches = this.extractGradeInformation(lowerMessage);
    if (gradeMatches.grade || gradeMatches.gradeRange) {
      scores.grade_inquiry *= 1.8;
    }

    // Find the intent with the highest score
    const topIntent = Object.entries(scores).reduce((a, b) =>
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores]
        ? a
        : b
    );

    const confidence = Math.min(scores[topIntent[0] as keyof typeof scores], 1);

    // Extract relevant data based on intent
    const extractedData = this.extractData(message);

    return {
      intent: topIntent[0] as keyof typeof scores,
      confidence,
      extractedData,
    };
  }

  private static calculateScore(message: string, keywords: string[]): number {
    let score = 0;
    const wordCount = keywords.length;

    keywords.forEach((keyword) => {
      if (message.includes(keyword)) {
        // Give higher weight to exact matches
        const exactMatch = new RegExp(`\\b${keyword}\\b`, "i").test(message);
        score += exactMatch ? 1.5 / wordCount : 1 / wordCount;
      }
    });

    return Math.min(score, 1);
  }

  private static extractGradeInformation(message: string): {
    grade?: string;
    gradeRange?: { min?: string; max?: string };
  } {
    const result: {
      grade?: string;
      gradeRange?: { min?: string; max?: string };
    } = {};

    // Specific grade patterns for N10-N25 and S30-S45
    const gradePatterns = [
      /\b([ns])(\d{2})\b/gi, // N20, S30, etc.
      /\bgrade\s+([ns]\d{2})\b/gi, // Grade N20
      /\b([ns])\s*(\d{2})\b/gi, // N 20, S 30
    ];

    // Range patterns
    const rangePatterns = [
      /\b([ns]\d{2})\s*(?:to|-|through)\s*([ns]\d{2})\b/gi, // N20 to N25
      /\bbetween\s+([ns]\d{2})\s+and\s+([ns]\d{2})\b/gi, // between N20 and N25
    ];

    // Check for single grade
    for (const pattern of gradePatterns) {
      const matches = Array.from(message.matchAll(pattern));
      for (const match of matches) {
        if (match[1] && match[2]) {
          const grade = `${match[1].toUpperCase()}${match[2]}`;
          // Validate grade is within our range
          if (this.isValidGrade(grade)) {
            result.grade = grade;
            break;
          }
        }
      }
      if (result.grade) break;
    }

    // Check for grade ranges
    if (!result.grade) {
      for (const pattern of rangePatterns) {
        const matches = Array.from(message.matchAll(pattern));
        for (const match of matches) {
          if (match[1] && match[2]) {
            const minGrade = match[1].toUpperCase();
            const maxGrade = match[2].toUpperCase();
            if (this.isValidGrade(minGrade) && this.isValidGrade(maxGrade)) {
              result.gradeRange = { min: minGrade, max: maxGrade };
              break;
            }
          }
        }
        if (result.gradeRange) break;
      }
    }

    return result;
  }

  private static isValidGrade(grade: string): boolean {
    const validGrades = [
      "N10",
      "N15",
      "N20",
      "N25",
      "S30",
      "S35",
      "S40",
      "S45",
    ];
    return validGrades.includes(grade);
  }

  private static extractData(message: string): any {
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

    // Extract grade information using enhanced method
    const gradeInfo = this.extractGradeInformation(lowerMessage);
    if (gradeInfo.grade) {
      data.grade = gradeInfo.grade;
    }
    if (gradeInfo.gradeRange) {
      data.gradeRange = gradeInfo.gradeRange;
    }

    // Extract delivery method with enhanced detection
    for (const [method, keywords] of Object.entries(this.DELIVERY_KEYWORDS)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        if (method === "tremie") {
          if (
            lowerMessage.includes("tremie 1") ||
            lowerMessage.includes("tremie1")
          ) {
            data.deliveryMethod = "tremie_1";
          } else if (
            lowerMessage.includes("tremie 2") ||
            lowerMessage.includes("tremie2")
          ) {
            data.deliveryMethod = "tremie_2";
          } else if (
            lowerMessage.includes("tremie 3") ||
            lowerMessage.includes("tremie3")
          ) {
            data.deliveryMethod = "tremie_3";
          } else {
            data.deliveryMethod = "tremie_1"; // Default tremie
          }
        } else {
          data.deliveryMethod = method;
        }
        break;
      }
    }

    // Extract price range with Malaysian Ringgit patterns
    const pricePatterns = [
      /under\s+(?:rm\s*)?(\d+)/gi,
      /below\s+(?:rm\s*)?(\d+)/gi,
      /less\s+than\s+(?:rm\s*)?(\d+)/gi,
      /over\s+(?:rm\s*)?(\d+)/gi,
      /above\s+(?:rm\s*)?(\d+)/gi,
      /more\s+than\s+(?:rm\s*)?(\d+)/gi,
      /between\s+(?:rm\s*)?(\d+)(?:\s+and\s+|\s*-\s*)(?:rm\s*)?(\d+)/gi,
      /rm\s*(\d+)(?:\s*-\s*|\s+to\s+)rm\s*(\d+)/gi,
      /budget\s+(?:of\s+)?(?:rm\s*)?(\d+)/gi,
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
          } else if (pattern.source.includes("budget")) {
            data.priceRange = { max: parseInt(nums[0]) };
          }
        }
        break;
      }
    }

    // Extract volume with enhanced patterns
    const volumePatterns = [
      /(\d+(?:\.\d+)?)\s*(?:m3|cubic\s*met(?:er|re)s?|m³|meter\s*cube|cube)/gi,
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

    // Extract application type
    data.applicationType = this.extractApplicationType(lowerMessage);

    // Extract project type
    data.projectType = this.getProjectType(lowerMessage);

    // Extract strength requirement context
    data.strengthRequirement = this.extractStrengthRequirement(lowerMessage);

    // Extract location (Malaysian locations)
    const locationPatterns = [
      /(?:in|at|to|for)\s+([a-zA-Z\s]+?)(?:\s|$|,)/gi,
      /area\s*:\s*([a-zA-Z\s]+?)(?:\s|$|,)/gi,
      /location\s*:\s*([a-zA-Z\s]+?)(?:\s|$|,)/gi,
    ];

    for (const pattern of locationPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
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

    // Enhanced search terms extraction
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
      "a",
      "an",
    ];
    data.searchTerms = message
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2 && !stopWords.includes(term))
      .slice(0, 6); // Increased to 6 terms

    return data;
  }

  // Helper methods
  private static extractApplicationType(message: string): string | null {
    const applications = {
      residential: [
        "residential",
        "home",
        "house",
        "driveway",
        "garage",
        "patio",
      ],
      commercial: [
        "commercial",
        "office",
        "retail",
        "warehouse",
        "factory",
        "industrial",
      ],
      infrastructure: [
        "bridge",
        "tunnel",
        "road",
        "highway",
        "airport",
        "port",
      ],
      structural: [
        "beam",
        "column",
        "structural",
        "load bearing",
        "reinforced",
      ],
    };

    for (const [type, keywords] of Object.entries(applications)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        return type;
      }
    }
    return null;
  }

  private static extractStrengthRequirement(message: string): string | null {
    if (message.includes("high strength") || message.includes("heavy duty"))
      return "high";
    if (message.includes("medium strength") || message.includes("standard"))
      return "medium";
    if (message.includes("low strength") || message.includes("light duty"))
      return "low";
    return null;
  }

  static generateSuggestions(intent: string, extractedData: any): string[] {
    const suggestions: { [key: string]: string[] } = {
      product_search: [
        "Show me N-series grades (N10-N25)",
        "Show me S-series grades (S30-S45)",
        "Compare delivery methods",
      ],
      grade_inquiry: [
        "Show N20 products",
        "Compare N20 vs N25",
        "What about S-series grades?",
      ],
      price_inquiry: [
        "Compare delivery prices",
        "Show pump vs normal prices",
        "Budget options under RM300",
      ],
      delivery_inquiry: [
        "Normal delivery pricing",
        "Pump delivery options",
        "Tremie delivery info",
      ],
      technical_question: [
        "Product specifications",
        "Strength comparisons",
        "Application guidelines",
      ],
      stock_inquiry: [
        "Check N20 availability",
        "Check S30 availability",
        "Current stock levels",
      ],
      application_inquiry: [
        "For foundation work",
        "For structural work",
        "For residential projects",
      ],
      comparison_request: [
        "N20 vs N25 comparison",
        "S30 vs S35 comparison",
        "Delivery method comparison",
      ],
      recommendation: [
        "For driveway projects",
        "For commercial buildings",
        "Budget-friendly options",
      ],
      general_question: [
        "Browse concrete grades",
        "Popular products",
        "Price list",
      ],
    };

    let baseSuggestions = suggestions[intent] || suggestions.general_question;

    // Customize based on extracted data
    if (extractedData.grade) {
      const grade = extractedData.grade;
      baseSuggestions = [
        `Show ${grade} details`,
        `${grade} pricing options`,
        `Compare ${grade} with other grades`,
      ];
    }

    if (extractedData.projectType) {
      const projectType = extractedData.projectType;
      baseSuggestions = baseSuggestions.map((s) =>
        s.includes("work") ? `For ${projectType} work` : s
      );
    }

    return baseSuggestions;
  }

  static isConstructionQuery(message: string): boolean {
    const constructionKeywords = [
      ...this.PRODUCT_KEYWORDS,
      ...this.GRADE_KEYWORDS,
      ...this.TECHNICAL_KEYWORDS,
      ...this.APPLICATION_KEYWORDS,
    ];

    const lowerMessage = message.toLowerCase();
    return constructionKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );
  }

  static getProjectType(message: string): string | null {
    const lowerMessage = message.toLowerCase();

    for (const [type, keywords] of Object.entries(this.PROJECT_TYPE_KEYWORDS)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        return type;
      }
    }

    return null;
  }

  // New helper method to get grade recommendations based on application
  static getGradeRecommendations(
    applicationType?: string,
    projectType?: string
  ): string[] {
    const recommendations: { [key: string]: string[] } = {
      // Application-based recommendations
      residential: ["N15", "N20", "N25"],
      commercial: ["N20", "N25", "S30", "S35"],
      structural: ["N25", "S30", "S35", "S40"],
      infrastructure: ["S35", "S40", "S45"],

      // Project-based recommendations
      foundation: ["N20", "N25", "S30"],
      flatwork: ["N15", "N20", "N25"],
      wall: ["N20", "N25", "S30"],
      repair: ["N15", "N20"],
      decorative: ["N15", "N20"],
    };

    if (applicationType && recommendations[applicationType]) {
      return recommendations[applicationType];
    }

    if (projectType && recommendations[projectType]) {
      return recommendations[projectType];
    }

    // Default recommendations
    return ["N20", "N25", "S30"];
  }
}
