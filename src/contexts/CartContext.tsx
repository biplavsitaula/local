"use client";

import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/types";

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  removeFromCart: (productId: number | string) => void;
  clear: () => void;
  total: number;
  totalPrice: number;
  count: number;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'flame_cart';

// Helper functions to save/load cart from localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    // Only save essential product data to avoid circular references
    const cartData = items.map(item => ({
      product: {
        id: item?.product?.id,
        name: item?.product?.name,
        price: item?.product?.price,
        image: item?.product?.image,
        category: item?.product?.category,
        // Include other essential fields
        originalPrice: item?.product?.originalPrice,
        description: item?.product?.description,
        volume: item?.product?.volume,
        alcoholContent: item?.product?.alcoholContent,
        alcohol: item?.product?.alcohol,
        inStock: item?.product?.inStock,
        stock: item?.product?.stock,
        rating: item?.product?.rating,
        tag: item?.product?.tag,
      },
      quantity: item?.quantity,
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return [];
    
    const parsed = JSON.parse(cartData);
    // Validate and return cart items
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        product: item?.product as Product,
        quantity: item?.quantity || 1,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize cart from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadCartFromStorage();
  });

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // Listen for storage events to sync cart across tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setItems(parsed.map(item => ({
              product: item?.product as Product,
              quantity: item?.quantity || 1,
            })));
          }
        } catch (error) {
          console.error('Error syncing cart from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i?.product?.id === product?.id);
      const updated = existing
        ? prev.map((i) =>
            i?.product?.id === product?.id ? { ...i, quantity: (i?.quantity || 0) + quantity } : i,
          )
        : [...prev, { product, quantity }];
      return updated;
    });
  };

  const updateQuantity = (productId: number | string, quantity: number) => {
    setItems((prev) => {
      const updated = prev
        .map((i) => (i?.product?.id === productId ? { ...i, quantity } : i))
        .filter((i) => (i?.quantity || 0) > 0);
      return updated;
    });
  };

  const removeFromCart = (productId: number | string) => {
    setItems((prev) => prev.filter((i) => i?.product?.id !== productId));
  };

  const clear = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 0), 0),
    [items],
  );

  const count = useMemo(() => items.reduce((sum, i) => sum + (i?.quantity || 0), 0), [items]);

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clear, 
        total, 
        totalPrice: total,
        count,
        totalItems: count
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
