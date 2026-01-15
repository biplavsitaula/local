import { Product } from "@/types";

export interface BuyNowItem {
  product: Product;
  quantity: number;
}

export interface IPaymentCheckbox  {
  open: boolean;
  onClose: () => void;
  buyNowItem?: BuyNowItem | null;
};