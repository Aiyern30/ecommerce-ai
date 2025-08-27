import { Product } from "@/type/product";

interface RecommendationRule {
  id: string;
  name: string;
  condition: (product: Product) => boolean;
  getRecommendations: (
    product: Product,
    allProducts: Product[]
  ) => RecommendationResult[];
}

interface RecommendationResult {
  product: Product;
  reason: string;
  type: "upsell" | "downsell" | "alternative" | "complement";
  score: number;
}

interface RecommendationGroup {
  title: string;
  description: string;
  products: RecommendationResult[];
}

class RecommendationEngine {
  private rules: RecommendationRule[] = [
    // Concrete Grade Rules
    {
      id: "concrete-grade-upsell-downsell",
      name: "Concrete Grade Recommendations",
      condition: (product) =>
        product.category === "concrete" &&
        Boolean(product.grade) &&
        /^N\d+$/i.test(product.grade || ""),
      getRecommendations: (product, allProducts) => {
        const currentGrade = this.extractGradeNumber(product.grade);
        if (!currentGrade) return [];

        const recommendations: RecommendationResult[] = [];

        // Find higher grade (upsell)
        const higherGrades = allProducts
          .filter((p) => {
            const grade = this.extractGradeNumber(p.grade);
            return (
              p.category === "concrete" &&
              grade &&
              grade > currentGrade &&
              grade <= currentGrade + 10 && // Don't recommend too high
              p.id !== product.id
            );
          })
          .sort((a, b) => {
            const gradeA = this.extractGradeNumber(a.grade) || 0;
            const gradeB = this.extractGradeNumber(b.grade) || 0;
            return gradeA - gradeB;
          });

        if (higherGrades.length > 0) {
          const higherGrade = higherGrades[0];
          recommendations.push({
            product: higherGrade,
            reason: `For higher strength applications requiring ${this.extractGradeNumber(
              higherGrade.grade
            )}MPa`,
            type: "upsell",
            score: 0.9,
          });
        }

        // Find lower grade (downsell)
        const lowerGrades = allProducts
          .filter((p) => {
            const grade = this.extractGradeNumber(p.grade);
            return (
              p.category === "concrete" &&
              grade &&
              grade < currentGrade &&
              grade >= currentGrade - 10 && // Don't recommend too low
              p.id !== product.id
            );
          })
          .sort((a, b) => {
            const gradeA = this.extractGradeNumber(a.grade) || 0;
            const gradeB = this.extractGradeNumber(b.grade) || 0;
            return gradeB - gradeA;
          });

        if (lowerGrades.length > 0) {
          const lowerGrade = lowerGrades[0];
          recommendations.push({
            product: lowerGrade,
            reason: `Cost-effective option for lighter applications at ${this.extractGradeNumber(
              lowerGrade.grade
            )}MPa`,
            type: "downsell",
            score: 0.8,
          });
        }

        // Find alternative product types
        const alternatives = allProducts
          .filter((p) => {
            return (
              p.product_type !== "concrete" &&
              p.product_type === "mortar" &&
              p.id !== product.id
            );
          })
          .slice(0, 1);

        alternatives.forEach((alt) => {
          recommendations.push({
            product: alt,
            reason: `Consider mortar for wall construction and non-structural applications`,
            type: "alternative",
            score: 0.6,
          });
        });

        return recommendations;
      },
    },

    // Mortar Ratio Rules
    {
      id: "mortar-ratio-recommendations",
      name: "Mortar Ratio Recommendations",
      condition: (product) =>
        product.category === "mortar" &&
        Boolean(product.mortar_ratio) &&
        /^\d+:\d+$/i.test(product.mortar_ratio || ""),
      getRecommendations: (product, allProducts) => {
        const currentRatio = this.parseMortarRatio(product.mortar_ratio);
        if (!currentRatio) return [];

        const recommendations: RecommendationResult[] = [];

        // Find stronger ratio (lower cement ratio = stronger)
        const strongerMortars = allProducts
          .filter((p) => {
            const ratio = this.parseMortarRatio(p.mortar_ratio);
            return (
              p.category === "mortar" &&
              ratio &&
              ratio.cement > currentRatio.cement && // Higher cement content = stronger
              p.id !== product.id
            );
          })
          .sort((a, b) => {
            const ratioA = this.parseMortarRatio(a.mortar_ratio);
            const ratioB = this.parseMortarRatio(b.mortar_ratio);
            return (ratioB?.cement || 0) - (ratioA?.cement || 0);
          });

        if (strongerMortars.length > 0) {
          const stronger = strongerMortars[0];
          recommendations.push({
            product: stronger,
            reason: `Higher strength mortar (${stronger.mortar_ratio}) for load-bearing walls`,
            type: "upsell",
            score: 0.9,
          });
        }

        // Find weaker/cheaper ratio
        const weakerMortars = allProducts
          .filter((p) => {
            const ratio = this.parseMortarRatio(p.mortar_ratio);
            return (
              p.category === "mortar" &&
              ratio &&
              ratio.cement < currentRatio.cement && // Lower cement content = cheaper
              p.id !== product.id
            );
          })
          .sort((a, b) => {
            const ratioA = this.parseMortarRatio(a.mortar_ratio);
            const ratioB = this.parseMortarRatio(b.mortar_ratio);
            return (ratioA?.cement || 0) - (ratioB?.cement || 0);
          });

        if (weakerMortars.length > 0) {
          const weaker = weakerMortars[0];
          recommendations.push({
            product: weaker,
            reason: `Cost-effective option (${weaker.mortar_ratio}) for non-load bearing applications`,
            type: "downsell",
            score: 0.8,
          });
        }

        // Suggest concrete alternatives
        const concreteAlternatives = allProducts
          .filter((p) => {
            return p.product_type === "concrete" && p.id !== product.id;
          })
          .slice(0, 1);

        concreteAlternatives.forEach((alt) => {
          recommendations.push({
            product: alt,
            reason: `Consider concrete for structural applications requiring higher strength`,
            type: "alternative",
            score: 0.7,
          });
        });

        return recommendations;
      },
    },

    // Generic category-based recommendations
    {
      id: "category-similar",
      name: "Similar Category Products",
      condition: () => true, // Always applies as fallback
      getRecommendations: (product, allProducts) => {
        const recommendations: RecommendationResult[] = [];

        // Find products in same category with different specifications
        const similarProducts = allProducts
          .filter((p) => {
            return (
              p.product_type === product.product_type &&
              p.id !== product.id &&
              (p.grade !== product.grade ||
                p.mortar_ratio !== product.mortar_ratio)
            );
          })
          .slice(0, 2);

        similarProducts.forEach((similar) => {
          recommendations.push({
            product: similar,
            reason: `Alternative ${product.product_type} option with different specifications`,
            type: "alternative",
            score: 0.5,
          });
        });

        return recommendations;
      },
    },
  ];

  private extractGradeNumber(grade?: string | null): number | null {
    if (!grade) return null;
    const match = grade.match(/N(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }

  private parseMortarRatio(
    ratio?: string | null
  ): { cement: number; sand: number } | null {
    if (!ratio) return null;
    const match = ratio.match(/(\d+):(\d+)/);
    if (!match) return null;
    return {
      cement: parseInt(match[1]),
      sand: parseInt(match[2]),
    };
  }

  public getRecommendations(
    product: Product,
    allProducts: Product[]
  ): RecommendationGroup[] {
    const allRecommendations: RecommendationResult[] = [];

    // Apply each rule
    for (const rule of this.rules) {
      if (rule.condition(product)) {
        const ruleRecommendations = rule.getRecommendations(
          product,
          allProducts
        );
        allRecommendations.push(...ruleRecommendations);
      }
    }

    // Remove duplicates and sort by score
    const uniqueRecommendations = allRecommendations
      .filter(
        (rec, index, self) =>
          index === self.findIndex((r) => r.product.id === rec.product.id)
      )
      .sort((a, b) => b.score - a.score);

    // Group recommendations
    const groups: RecommendationGroup[] = [];

    // Group 1: Upgrade options (upsell)
    const upsells = uniqueRecommendations.filter((r) => r.type === "upsell");
    if (upsells.length > 0) {
      groups.push({
        title: "Upgrade Options",
        description: "Higher performance options for demanding applications",
        products: upsells.slice(0, 3),
      });
    }

    // Group 2: Budget alternatives (downsell)
    const downsells = uniqueRecommendations.filter(
      (r) => r.type === "downsell"
    );
    if (downsells.length > 0) {
      groups.push({
        title: "Budget-Friendly Alternatives",
        description: "Cost-effective options for lighter applications",
        products: downsells.slice(0, 3),
      });
    }

    // Group 3: Alternative solutions
    const alternatives = uniqueRecommendations.filter(
      (r) => r.type === "alternative"
    );
    if (alternatives.length > 0) {
      groups.push({
        title: "Alternative Solutions",
        description: "Different product types for various construction needs",
        products: alternatives.slice(0, 3),
      });
    }

    // Group 4: Frequently bought together (fallback)
    if (groups.length === 0) {
      const fallback = uniqueRecommendations.slice(0, 3);
      if (fallback.length > 0) {
        groups.push({
          title: "You Might Also Like",
          description: "Similar products other customers have considered",
          products: fallback,
        });
      }
    }

    return groups;
  }
}

export const recommendationEngine = new RecommendationEngine();
export type { RecommendationGroup, RecommendationResult };
