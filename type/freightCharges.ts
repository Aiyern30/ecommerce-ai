export interface FreightCharge {
  id: string;
  min_volume: number;
  max_volume: number | null;
  delivery_fee: number;
  description: string;
  is_active: boolean;
}
