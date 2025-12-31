export interface ApiProduct {
  _id: string;
  name: string;
  image: string;
  price: number;
  type: string;
  discountPercentage?: number;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProductResponse {
  message: string;
  data: ApiProduct[];
}



