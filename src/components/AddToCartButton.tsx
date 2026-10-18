"use client";

import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  productSlug: string;
  productName: string;
  planLabel: string;
  price: number;
  variant?: "cart" | "buynow";
}

export function AddToCartButton({ productSlug, productName, planLabel, price, variant = "cart" }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handle = () => {
    addItem({ productSlug, productName, planLabel, price });
    if (variant === "buynow") {
      router.push("/cart");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  if (variant === "buynow") {
    return (
      <button
        onClick={handle}
        className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13l-.4-2M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        Buy Now
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      className="flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: added ? "rgba(34,197,94,0.1)" : "rgba(124,58,237,0.1)",
        border: `1px solid ${added ? "rgba(34,197,94,0.4)" : "rgba(124,58,237,0.3)"}`,
        color: added ? "#16a34a" : "#7c3aed",
      }}
    >
      {added ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Added!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13l-.4-2M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          Add to Cart
        </>
      )}
    </button>
  );
}
