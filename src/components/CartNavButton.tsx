"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export function CartNavButton() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
      style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--text-secondary)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13l-.4-2M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
