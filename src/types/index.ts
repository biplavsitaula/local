export type Product = {
  id: number | string;
  name: string;
  nameNe?: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  descriptionNe?: string;
  image: string;
  rating?: number;
  sales?: number;
  tag?: string;
  volume?: string;
  alcohol?: string;
  alcoholContent?: string;
  stock?: number;
  inStock?: boolean;
  isNew?: boolean;
  origin?: string;
  originType?: string;
  subCategory?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type AgeStatus = "pending" | "verified" | "denied";
