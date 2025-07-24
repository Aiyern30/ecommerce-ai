/* eslint-disable @typescript-eslint/no-explicit-any */

export function convertToCSV(
  data: any[],
  headers: { key: string; label: string }[]
): string {
  const headerRow = headers.map((header) => `"${header.label}"`).join(",");

  const rows = data.map((item) => {
    return headers
      .map((header) => {
        const value =
          typeof item[header.key] === "object"
            ? JSON.stringify(item[header.key])
            : item[header.key];
        return `"${value}"`;
      })
      .join(",");
  });

  return [headerRow, ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatDateForExport(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatCurrencyForExport(value: string): string {
  return value.replace("RM", "");
}
