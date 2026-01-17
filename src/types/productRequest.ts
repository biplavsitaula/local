/**
 * Request payload for creating a new product
 */
export interface CreateProductRequest {
  name: string;
  type: string; // category mapped to type
  price: number;
  image: string;
  discountPercentage?: number;
  discountPercent?: number;
  tag?: string;
  subCategory?: string;
  originType?: string;
  // Additional fields that might be supported by the API
  stock?: number;
  rating?: number;
  itemLink?: string;
  isRecommended?: boolean;
}

/**
 * Request payload for updating an existing product
 */
export interface UpdateProductRequest {
  name?: string;
  type?: string; // category mapped to type
  price?: number;
  image?: string;
  discountPercentage?: number;
  discountPercent?: number;
  tag?: string;
  subCategory?: string;
  originType?: string;
  // Additional fields that might be supported by the API
  stock?: number;
  rating?: number;
  itemLink?: string;
  isRecommended?: boolean;
}

/**
 * Response from create product API
 */
export interface CreateProductResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    image: string;
    price: number;
    type: string;
    discountPercentage?: number;
    discountPercent?: number;
    tag?: string;
    subCategory?: string;
    originType?: string;
    __v?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

/**
 * Response from update product API
 */
export interface UpdateProductResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    image: string;
    price: number;
    type: string;
    discountPercentage?: number;
    discountPercent?: number;
    tag?: string;
    subCategory?: string;
    originType?: string;
    __v?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

/**
 * Response from delete product API
 */
export interface DeleteProductResponse {
  message: string;
  data?: {
    _id: string;
  };
}




