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

function AddedDialog({ productName, planLabel, onContinue, onGoToCart }: {
  productName: string;
  planLabel: string;
  onContinue: () => void;
  onGoToCart: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onContinue}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated success icon */}
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full" style={{ background: "rgba(34,197,94,0.08)", animation: "ripple 1.6s ease-out 0.1s infinite" }} />
            <div className="anim-pop-in absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
              <svg viewBox="0 0 52 52" className="w-9 h-9" fill="none">
                <circle cx="26" cy="26" r="24" stroke="rgba(255,255,255,0.2)" strokeWidth="2"
                  strokeDasharray="150" className="anim-draw-circle" />
                <path d="M14 27 L22 35 L38 18" stroke="white" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="80" className="anim-draw-check" />
              </svg>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-extrabold text-center mb-1">Added to Cart!</h3>
        <p className="text-sm text-center mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>
          {productName}
        </p>
        <p className="text-xs text-center mb-6" style={{ color: "var(--text-muted)" }}>
          {planLabel}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onGoToCart}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 6px 20px rgba(124,58,237,0.35)" }}
          >
            🛒 Go to Cart & Checkout
          </button>
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.01]"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddToCartButton({ productSlug, productName, planLabel, price, variant = "cart" }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const handle = () => {
    addItem({ productSlug, productName, planLabel, price });
    if (variant === "buynow") {
      router.push("/cart");
    } else {
      setShowDialog(true);
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
    <>
      {showDialog && (
        <AddedDialog
          productName={productName}
          planLabel={planLabel}
          onContinue={() => setShowDialog(false)}
          onGoToCart={() => { setShowDialog(false); router.push("/cart"); }}
        />
      )}
      <button
        onClick={handle}
        className="flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "rgba(124,58,237,0.1)",
          border: "1px solid rgba(124,58,237,0.3)",
          color: "#7c3aed",
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13l-.4-2M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        Add to Cart
      </button>
    </>
  );
}
