export type ProductStatus = 'in-stock' | 'out-of-stock' | 'low-stock';

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

