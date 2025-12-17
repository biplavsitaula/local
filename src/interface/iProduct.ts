import { ProductStatus } from "@/types/product";

export interface Product {
    id?: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    rating: number;
    reviews: number;
    sales: number;
    status: ProductStatus;
    itemLink?: string;
    isRecommended: boolean;
  }