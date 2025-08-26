import { useState, useRef, useEffect } from "react";
import { Product } from "@/type/product";

export function useProductSearch() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products-search?q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setSearchResults(data.products || []);
        if (data.products && data.products.length > 0 && isSearchFocused) {
          setShowDropdown(true);
        }
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
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

  return {
    searchResults,
    searchQuery,
    setSearchQuery,
    showDropdown,
    setShowDropdown,
    isSearchFocused,
    setIsSearchFocused,
    searchContainerRef,
    handleSearchChange,
    handleInputFocus,
    handleInputBlur,
  };
}
