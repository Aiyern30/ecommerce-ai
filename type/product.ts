export interface ProductSpec {
  value: string;
  score: number;
}

export interface ProductFeature {
  name: string;
  available: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  rating: number;
  image: string;
  specs: {
    performance: ProductSpec;
    battery: ProductSpec;
    storage: ProductSpec;
    camera: ProductSpec;
  };
  features: ProductFeature[];
}
