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
    | "order_status"
    | "mortar_inquiry"; // Added mortar_inquiry to the union type
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
  private static readonly CONSTRUCTION_KEYWORDS = [
    // Concrete keywords
    "concrete",
    "grade",
    "n15",
    "n20",
    "n25",
    "n30",
    "s30",
    "s35",
    "s40",
    "s45",
    "ready mix",
    "readymix",
    "pump",
    "tremie",
    "structural",
    "foundation",
    "slab",
    "beam",
    "column",
    "footing",
    "driveway",
    "walkway",
    "patio",

    // Mortar keywords
    "mortar",
    "ratio",
    "1:3",
    "1:4",
    "1:5",
    "1:6",
    "m034",
    "m044",
    "m054",
    "m064",
    "brickwork",
    "blockwork",
    "masonry",
    "plastering",
    "rendering",
    "pointing",
    "bedding",
    "brick",
    "block",
    "stone",
    "tile",
    "wall",
    "partition",

    // General construction
    "construction",
    "building",
    "project",
    "site",
    "delivery",
    "price",
    "cost",
    "cubic meter",
    "m3",
    "volume",
    "quantity",
    "stock",
  ];

  private static readonly INTENT_PATTERNS = {
    product_search: [
      /(?:show|find|search|look for|need|want)\s+(?:me\s+)?(?:some\s+)?(?:concrete|mortar|products?)/i,
      /(?:what|which)\s+(?:concrete|mortar|products?)\s+(?:do you have|are available)/i,
      /(?:concrete|mortar)\s+(?:grades?|types?|options?)/i,
    ],
    grade_inquiry: [
      /(?:what|which|tell me about)\s+(?:is\s+)?(?:grade\s+)?([ns]\d+|m0\d+)/i,
      /(?:difference|compare)\s+between\s+(?:grades?|[ns]\d+|m0\d+)/i,
      /(?:grade|ratio)\s+(?:for|suitable for)\s+(\w+)/i,
    ],
    mortar_inquiry: [
      /(?:mortar|ratio)\s+(?:1:[3-6]|m0\d+)/i,
      /(?:brickwork|blockwork|masonry|plastering)/i,
      /(?:which|what)\s+(?:mortar|ratio)\s+(?:for|to use)/i,
    ],
    application_inquiry: [
      /(?:what|which)\s+(?:concrete|mortar)\s+(?:for|to use for)\s+(\w+)/i,
      /(?:suitable|best|recommended)\s+(?:for|to)\s+(\w+)/i,
      /(?:foundation|slab|beam|column|driveway|wall|brickwork)/i,
    ],
    // ...existing patterns...
  };

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

  // Updated grade keywords to match your N10-N25, S30-S45, and mortar products
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
    // Mortar grades (M034 to M064)
    "m034",
    "m044",
    "m054",
    "m064",
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
    // Mortar specific
    "mortar",
    "cement mortar",
    "mortar mix",
    "mortar ratio",
    "1:3",
    "1:4",
    "1:5",
    "1:6",
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

    // Enhanced mortar detection
    if (this.isMortarQuery(lowerMessage)) {
      return {
        intent: "mortar_inquiry",
        confidence: 0.9,
        extractedData: {
          productType: "mortar",
          ...this.extractMortarData(lowerMessage),
          query: message,
        },
      };
    }

    // Enhanced concrete detection
    if (this.isConcreteQuery(lowerMessage)) {
      return {
        intent: "product_search",
        confidence: 0.85,
        extractedData: {
          productType: "concrete",
          ...this.extractConcreteData(lowerMessage),
          query: message,
        },
      };
    }

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

    // Patterns for N, S, and M grades
    const gradePatterns = [
      /\b([ns])(\d{2})\b/gi, // N20, S30, etc.
      /\bgrade\s+([ns]\d{2})\b/gi, // Grade N20
      /\b([ns])\s*(\d{2})\b/gi, // N 20, S 30
      /\b([m])(\d{3})\b/gi, // M034, M044, etc.
      /\bgrade\s+([m]\d{3})\b/gi, // Grade M034
      /\bmortar\s+1:(3|4|5|6)\b/gi, // mortar 1:3, 1:4, etc.
    ];

    // Range patterns for all grades
    const rangePatterns = [
      /\b([ns]\d{2}|m\d{3})\s*(?:to|-|through)\s*([ns]\d{2}|m\d{3})\b/gi,
      /\bbetween\s+([ns]\d{2}|m\d{3})\s+and\s+([ns]\d{2}|m\d{3})\b/gi,
    ];

    // Check for single grade
    for (const pattern of gradePatterns) {
      const matches = Array.from(message.matchAll(pattern));
      for (const match of matches) {
        if (match[1] && match[2]) {
          let grade = "";
          if (match[1].toLowerCase() === "m" && match[2].length === 3) {
            grade = `M${match[2]}`;
          } else if (match[1].toLowerCase() === "mortar" && match[2]) {
            // mortar 1:3, 1:4, etc.
            const ratioMap: { [key: string]: string } = {
              "3": "M034",
              "4": "M044",
              "5": "M054",
              "6": "M064",
            };
            grade = ratioMap[match[2]];
          } else {
            grade = `${match[1].toUpperCase()}${match[2]}`;
          }
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
      "M034",
      "M044",
      "M054",
      "M064",
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

  private static isMortarQuery(message: string): boolean {
    const mortarKeywords = [
      "mortar",
      "ratio",
      "1:",
      "brickwork",
      "blockwork",
      "masonry",
      "plastering",
      "pointing",
      "rendering",
      "m034",
      "m044",
      "m054",
      "m064",
    ];
    return mortarKeywords.some((keyword) => message.includes(keyword));
  }

  private static isConcreteQuery(message: string): boolean {
    const concreteKeywords = [
      "concrete",
      "grade",
      "n15",
      "n20",
      "n25",
      "n30",
      "s30",
      "s35",
      "s40",
      "s45",
      "ready mix",
      "readymix",
      "pump",
      "tremie",
      "structural",
      "foundation",
      "slab",
    ];
    return concreteKeywords.some((keyword) => message.includes(keyword));
  }

  private static extractMortarData(message: string): any {
    const data: any = {};

    // Extract mortar ratio
    const ratioMatch = message.match(/(1:[3-6])/);
    if (ratioMatch) {
      data.mortarRatio = ratioMatch[1];
    }

    // Extract mortar grade
    const gradeMatch = message.match(/(m0[3-6][4])/);
    if (gradeMatch) {
      data.grade = gradeMatch[1].toUpperCase();
    }

    // Extract application type
    const applicationKeywords = {
      brickwork: ["brick", "brickwork", "brick wall"],
      blockwork: ["block", "blockwork", "concrete block"],
      plastering: ["plaster", "plastering", "render", "rendering"],
      pointing: ["pointing", "repointing", "joint"],
      bedding: ["bedding", "laying", "setting"],
    };

    for (const [app, keywords] of Object.entries(applicationKeywords)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        data.applicationType = app;
        break;
      }
    }

    return data;
  }

  private static extractConcreteData(message: string): any {
    // ...existing concrete extraction logic...
    const data: any = {};

    // Extract grade
    const gradeMatch = message.match(/([ns]\d+)/i);
    if (gradeMatch) {
      data.grade = gradeMatch[1].toUpperCase();
    }

    // Extract delivery method
    const deliveryKeywords = {
      pump: ["pump", "pumped", "pumping"],
      tremie: ["tremie", "underwater", "submerged"],
      normal: ["normal", "truck", "direct"],
    };

    for (const [method, keywords] of Object.entries(deliveryKeywords)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        data.deliveryMethod = method;
        break;
      }
    }

    return data;
  }

  static getMortarRecommendations(applicationType?: string): string[] {
    const recommendations = {
      brickwork: ["M044", "M054"],
      blockwork: ["M054", "M064"],
      plastering: ["M064"],
      pointing: ["M034", "M044"],
      bedding: ["M044", "M054"],
    };

    if (
      applicationType &&
      recommendations[applicationType as keyof typeof recommendations]
    ) {
      return recommendations[applicationType as keyof typeof recommendations];
    }

    return ["M044", "M054", "M064"]; // Default popular mortar grades
  }

  static generateSuggestions(intent: string, extractedData: any): string[] {
    if (extractedData.productType === "mortar") {
      return [
        "Browse mortar ratios (1:3 to 1:6)",
        "Compare M034, M044, M054, M064",
        "Mortar for brickwork vs plastering",
        "Calculate mortar quantity needed",
      ];
    }

    if (extractedData.productType === "concrete") {
      return [
        "Compare N-series (N15-N25)",
        "Compare S-series (S30-S45)",
        "Pump vs normal delivery",
        "Calculate concrete volume needed",
      ];
    }

    return [
      "Browse concrete products",
      "Browse mortar products",
      "Compare grades and ratios",
      "Delivery options available",
    ];
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
      residential: ["N15", "N20", "N25", "M054", "M064"],
      commercial: ["N20", "N25", "S30", "S35", "M044", "M054"],
      structural: ["N25", "S30", "S35", "S40", "M034", "M044"],
      infrastructure: ["S35", "S40", "S45"],
      // Project-based recommendations
      foundation: ["N20", "N25", "S30", "M034"],
      flatwork: ["N15", "N20", "N25", "M054", "M064"],
      wall: ["N20", "N25", "S30", "M044", "M054"],
      repair: ["N15", "N20", "M054", "M064"],
      decorative: ["N15", "N20", "M054"],
    };

    if (applicationType && recommendations[applicationType]) {
      return recommendations[applicationType];
    }

    if (projectType && recommendations[projectType]) {
      return recommendations[projectType];
    }

    // Default recommendations
    return ["N20", "N25", "S30", "M054", "M064"];
  }
}
