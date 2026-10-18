"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CartItem {
  productSlug: string;
  productName: string;
  planLabel: string;
  price: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (productSlug: string, planLabel: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wcd_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem("wcd_cart", JSON.stringify(next)); } catch {}
  };

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productSlug === item.productSlug && i.planLabel === item.planLabel);
      const next = idx >= 0
        ? prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
      try { localStorage.setItem("wcd_cart", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeItem = useCallback((productSlug: string, planLabel: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => !(i.productSlug === productSlug && i.planLabel === planLabel));
      try { localStorage.setItem("wcd_cart", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    save([]);
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
