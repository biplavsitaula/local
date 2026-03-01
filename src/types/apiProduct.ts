export interface ApiProduct {
  _id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  price: number;
  type: string;
  category?: string;
  discountPercentage?: number;
  discountPercent?: number;
  discountAmount?: number;
  finalPrice?: number;
  stock?: number;
  status?: string;
  rating?: number;
  tag?: string;
  brand?: string;
  volume?: string;
  alcoholPercentage?: number;
  originType?: string;
  subCategory?: string;
  description?: string;
  specification?: string;
  isRecommended?: boolean;
  isNew?: boolean;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProductResponse {
  message: string;
  data: ApiProduct[];
}



