export type Product = {
  id: number;
  name: string;
  nameNe?: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating?: number;
  tag?: string;
  volume?: string;
  alcohol?: string;
  stock?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type AgeStatus = "pending" | "verified" | "denied";
