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

export const getPaymentStatusColor = (paymentStatus: string) => {
  switch (paymentStatus.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200";
    case "refunded":
      return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";
  }
};
