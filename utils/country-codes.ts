// Country name to ISO code mapping
const COUNTRY_CODE_MAP: Record<string, string> = {
  Malaysia: "MY",
  Singapore: "SG",
  "United States": "US",
  "United Kingdom": "GB",
  Thailand: "TH",
  Indonesia: "ID",
  Philippines: "PH",
  Vietnam: "VN",
  Australia: "AU",
  Canada: "CA",
  // Add more countries as needed
};

export function getCountryCode(countryName: string): string {
  // If it's already a 2-character code, return as is
  if (countryName.length === 2) {
    return countryName.toUpperCase();
  }

  // Look up the country code
  const code = COUNTRY_CODE_MAP[countryName];
  if (code) {
    return code;
  }

  // Default fallback - you might want to handle this differently
  console.warn(`Unknown country: ${countryName}, defaulting to MY`);
  return "MY";
}
