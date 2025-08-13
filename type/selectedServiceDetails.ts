export interface SelectedServiceDetails {
  id: string;
  service_code: string;
  service_name: string;
  rate_per_m3: number;
  total_price: number;
  description?: string;
}
