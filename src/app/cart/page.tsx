"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartNavButton } from "@/components/CartNavButton";

const PRODUCT_EMOJI: Record<string, string> = {
  netflix: "🎬", youtube: "▶️", spotify: "🎵", adobe: "🎨",
  microsoft: "💼", office: "💼", canva: "✏️", discord: "💬",
  amazon: "📦", prime: "📦", duolingo: "🦉", grammarly: "✍️",
  chatgpt: "🤖", openai: "🤖", linkedin: "💼", nordvpn: "🛡️",
};

function productEmoji(name: string) {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(PRODUCT_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "📦";
}

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
          <Link href="/#products" className="text-sm font-medium hover:text-violet-600 transition-colors" style={{ color: "var(--text-muted)" }}>← Continue Shopping</Link>
          <span style={{ color: "var(--border)" }}>|</span>
          <h1 className="text-xl font-bold">Shopping Cart</h1>
          {count > 0 && <span className="text-sm px-2.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>{count} item{count !== 1 ? "s" : ""}</span>}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-xl font-bold mb-2">Your cart is empty</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Looks like you haven&apos;t added any subscriptions yet.</p>
            <Link
              href="/#products"
              className="inline-block px-7 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}
            >
              Browse Products →
            </Link>
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
              {["✅ Instant Delivery", "🔒 Secure Checkout", "💬 WhatsApp Support"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productSlug}-${item.planLabel}`}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.12))", border: "1px solid rgba(124,58,237,0.15)" }}
                  >
                    {productEmoji(item.productName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{item.productName}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.planLabel}</div>
                    {item.qty > 1 && (
                      <div className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>Qty: {item.qty}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-extrabold text-violet-600">Rs. {(item.price * item.qty).toLocaleString()}</div>
                    {item.qty > 1 && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Rs. {item.price.toLocaleString()} each</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.productSlug, item.planLabel)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-50"
                    style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
                    title="Remove item"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Why trust us */}
              <div className="rounded-2xl p-5 mt-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Why Shop with Webcodoo</div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: "⚡", title: "Instant Delivery", desc: "Most orders activated in 5–10 minutes" },
                    { icon: "🔒", title: "100% Secure", desc: "Encrypted checkout & privacy guaranteed" },
                    { icon: "💬", title: "WhatsApp Support", desc: "Real-time help — always available" },
                  ].map((t) => (
                    <div key={t.title} className="text-center">
                      <div className="text-2xl mb-1.5">{t.icon}</div>
                      <div className="text-xs font-bold mb-0.5">{t.title}</div>
                      <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary sidebar */}
            <div>
              <div className="rounded-2xl p-5 sticky top-24 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h2 className="font-extrabold text-base">Order Summary</h2>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={`${item.productSlug}-${item.planLabel}`} className="flex justify-between text-sm gap-2">
                      <span style={{ color: "var(--text-secondary)" }} className="truncate">{item.productName}</span>
                      <span className="flex-shrink-0 font-semibold">Rs. {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <div className="flex justify-between px-3 py-2 text-xs" style={{ background: "var(--bg-input)", borderBottom: "1px dashed var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                    <span className="font-medium">Rs. {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 text-xs" style={{ background: "var(--bg-input)", borderBottom: "1px dashed var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Discount</span>
                    <span className="text-green-600 font-medium">Rs. 0.00</span>
                  </div>
                  <div className="flex justify-between px-3 py-2.5 font-extrabold text-sm" style={{ background: "rgba(124,58,237,0.06)" }}>
                    <span>Total</span>
                    <span className="text-violet-600">Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}
                >
                  Proceed to Checkout →
                </button>

                {/* Trust badges */}
                <div className="space-y-2 pt-1">
                  {["🔒 SSL Secured Checkout", "⚡ Digital delivery — no shipping", "💬 WhatsApp order confirmation"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                {/* Payment methods */}
                <div className="pt-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Accepted Payments</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {["🏦 Bank Transfer", "📱 QR Pay"].map((p) => (
                      <span key={p} className="text-[11px] px-2.5 py-1 rounded-lg font-medium" style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
