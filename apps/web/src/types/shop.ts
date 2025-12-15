export interface Product {
  currency: string;
  id: string;
  name: string;
  price_minor: null | number;
  product_variants: ProductVariant[];
  slug: string;
  status: string;
  stock?: null | number;
}

export interface ProductVariant {
  age_group: string;
  color?: null | string;
  gender: string;
  id: string;
  price_override_minor?: null | number;
  size: string;
  stock?: null | number;
}

export type ShippingCountry = "EU" | "GB" | "ROW";

export interface ValidatedItem {
  currency: string;
  name: string;
  priceMinor: number;
  product: Product;
  productId: string;
  quantity: number;
  variant?: ProductVariant;
  variantLabel?: string;
}
