export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getVariantDisplayName = (
  variantType: string | null | undefined
) => {
  switch (variantType) {
    case "pump":
      return "Pump Delivery";
    case "tremie_1":
      return "Tremie 1";
    case "tremie_2":
      return "Tremie 2";
    case "tremie_3":
      return "Tremie 3";
    case "normal":
    case null:
    case undefined:
    default:
      return "Normal Delivery";
  }
};
