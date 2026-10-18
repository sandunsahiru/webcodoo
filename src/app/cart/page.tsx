"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartNavButton } from "@/components/CartNavButton";

export default function CartPage() {
  const { items, removeItem, total, count } = useCart();
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/"><Image src="/logo.png" alt="Webcodoo" width={130} height={44} className="h-9 w-auto object-contain" /></Link>
          <div className="flex items-center gap-2">
            <CartNavButton />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-sm font-medium hover:text-violet-600 transition-colors" style={{ color: "var(--text-muted)" }}>← Continue Shopping</Link>
          <span style={{ color: "var(--border)" }}>|</span>
          <h1 className="text-xl font-bold">Cart ({count} item{count !== 1 ? "s" : ""})</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-lg font-semibold mb-2">Your cart is empty</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Add some products to get started</p>
            <Link
              href="/#products"
              className="inline-block px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productSlug}-${item.planLabel}`}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: "rgba(124,58,237,0.1)" }}
                  >
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{item.productName}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.planLabel}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-violet-600">Rs. {(item.price * item.qty).toLocaleString()}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Rs. {item.price.toLocaleString()} × {item.qty}</div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productSlug, item.planLabel)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-50"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div
                className="rounded-2xl p-5 sticky top-24"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h2 className="font-bold text-base mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={`${item.productSlug}-${item.planLabel}`} className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }} className="truncate mr-2">{item.productName}</span>
                      <span className="flex-shrink-0 font-medium">Rs. {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-base pt-3" style={{ borderTop: "2px solid var(--border)" }}>
                  <span>Total</span>
                  <span className="text-violet-600">Rs. {total.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full mt-5 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}
                >
                  Proceed to Checkout →
                </button>

                <p className="text-center text-[11px] mt-3" style={{ color: "var(--text-muted)" }}>
                  🔒 Secure checkout · Fast delivery
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
