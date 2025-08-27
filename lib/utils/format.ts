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

export function getStatusBadgeConfig(status: string) {
  const statusConfig = {
    pending: {
      variant: "secondary" as const,
      className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      label: "Pending",
    },
    processing: {
      variant: "secondary" as const,
      className: "bg-blue-500 hover:bg-blue-600 text-white",
      label: "Processing",
    },
    shipped: {
      variant: "default" as const,
      className: "bg-purple-500 hover:bg-purple-600 text-white",
      label: "Shipped",
    },
    delivered: {
      variant: "default" as const,
      className: "bg-green-500 hover:bg-green-600 text-white",
      label: "Delivered",
    },
    cancelled: {
      variant: "destructive" as const,
      className: "bg-red-500 hover:bg-red-600 text-white",
      label: "Cancelled",
    },
    failed: {
      variant: "destructive" as const,
      className: "bg-red-500 hover:bg-red-600 text-white",
      label: "Failed",
    },
    refunded: {
      variant: "secondary" as const,
      className: "bg-gray-500 hover:bg-gray-600 text-white",
      label: "Refunded",
    },
  };

  return (
    statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending
  );
}

export function getPaymentStatusConfig(paymentStatus: string) {
  const statusConfig = {
    pending: {
      variant: "secondary" as const,
      className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      label: "Pending",
    },
    paid: {
      variant: "default" as const,
      className: "bg-green-500 hover:bg-green-600 text-white",
      label: "Paid",
    },
    failed: {
      variant: "destructive" as const,
      className: "bg-red-500 hover:bg-red-600 text-white",
      label: "Failed",
    },
    refunded: {
      variant: "secondary" as const,
      className: "bg-gray-500 hover:bg-gray-600 text-white",
      label: "Refunded",
    },
  };

  return (
    statusConfig[paymentStatus as keyof typeof statusConfig] ??
    statusConfig.pending
  );
}
