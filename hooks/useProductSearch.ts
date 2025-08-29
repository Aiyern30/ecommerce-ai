import { useState, useRef, useEffect } from "react";
import { Product } from "@/type/product";

export function useProductSearch() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchError(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const searchParams = new URLSearchParams({
          q: value,
          fuzzy: "true",
          fields:
            "name,description,category,grade,keywords,product_type,mortar_ratio",
          limit: "10",
        });

        const res = await fetch(`/api/products-search?${searchParams}`);

        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }

        const data = await res.json();

        let results = data.products || [];

        if (results.length === 0 && data.allProducts) {
          results = clientSideSearch(data.allProducts, value);
        }

        setSearchResults(results);
        setIsLoading(false);

        if (results.length > 0 && isSearchFocused) {
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchError(
          error instanceof Error ? error.message : "Search failed"
        );
        setSearchResults([]);
        setShowDropdown(false);
        setIsLoading(false);
      }
    }, 300);
  };

  const clientSideSearch = (products: Product[], query: string): Product[] => {
    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);

    return products
      .filter((product) => {
        const searchableFields = [
          product.name,
          product.description,
          product.category,
          product.grade,
          product.product_type,
          product.mortar_ratio,
          ...(Array.isArray(product.keywords) ? product.keywords : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchTerms.some((term) => {
          if (Array.isArray(product.keywords)) {
            const keywordMatch = product.keywords.some((keyword) =>
              keyword.toLowerCase().includes(term)
            );
            if (keywordMatch) return true;
          }

          if (searchableFields.includes(term)) return true;

          if (searchableFields.includes(term)) return true;

          const words = searchableFields.split(/\s+/);
          const exactWordMatch = words.some((word) => word === term);
          if (exactWordMatch) return true;

          if (term.length >= 3) {
            const partialMatch = words.some(
              (word) => word.includes(term) || term.includes(word)
            );
            if (partialMatch) return true;
          }

          if (term.length >= 4) {
            const fuzzyMatch = words.some((word) => {
              if (word.length >= 4) {
                return calculateSimilarity(word, term) > 0.75;
              }
              return false;
            });
            if (fuzzyMatch) return true;
          }

          return false;
        });
      })
      .sort((a, b) => {
        const aKeywordMatch =
          Array.isArray(a.keywords) &&
          a.keywords.some((keyword) =>
            searchTerms.some((term) => keyword.toLowerCase().includes(term))
          );
        const bKeywordMatch =
          Array.isArray(b.keywords) &&
          b.keywords.some((keyword) =>
            searchTerms.some((term) => keyword.toLowerCase().includes(term))
          );

        if (aKeywordMatch && !bKeywordMatch) return -1;
        if (!aKeywordMatch && bKeywordMatch) return 1;

        const aNameMatch = searchTerms.some((term) =>
          a.name.toLowerCase().includes(term)
        );
        const bNameMatch = searchTerms.some((term) =>
          b.name.toLowerCase().includes(term)
        );

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        return 0;
      })
      .slice(0, 10);
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleInputFocus = () => {
    setIsSearchFocused(true);
    if (searchResults.length > 0 && searchQuery.length >= 2) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    setIsSearchFocused(false);
    setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setSearchError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return {
    searchResults,
    searchQuery,
    setSearchQuery,
    showDropdown,
    setShowDropdown,
    isSearchFocused,
    setIsSearchFocused,
    isLoading,
    searchError,
    searchContainerRef,
    handleSearchChange,
    handleInputFocus,
    handleInputBlur,
    clearSearch,
  };
}
