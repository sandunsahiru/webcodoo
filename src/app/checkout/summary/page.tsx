"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartNavButton } from "@/components/CartNavButton";

interface CheckoutInfo {
  phone: string;
  name: string;
  notes?: string;
  posCustomerId?: string;
}

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

export default function SummaryPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wcd_checkout");
      if (raw) setInfo(JSON.parse(raw));
      else router.replace("/checkout");
    } catch { router.replace("/checkout"); }
  }, [router]);

  if (!info || items.length === 0) return null;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: info.phone,
          name: info.name,
          notes: info.notes,
          items: items.map((i) => ({ ...i })),
          posCustomerId: info.posCustomerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      clearCart();
      sessionStorage.removeItem("wcd_checkout");
      router.push(`/checkout/payment/${data.orderId}`);
    } catch (e) {
      setError("Could not place order. Please try again.");
      console.error(e);
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Webcodoo" width={130} height={44} className="h-9 w-auto object-contain" /></Link>
          <div className="flex items-center gap-2"><CartNavButton /><ThemeToggle /></div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8 text-xs font-medium">
          {["Contact", "Review", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={i <= 1 ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff" } : { background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {i <= 1 ? "✓" : "3"}
              </div>
              <span style={{ color: i <= 1 ? "#7c3aed" : "var(--text-muted)" }}>{s}</span>
              {i < 2 && <span style={{ color: "var(--border)" }}>›</span>}
            </div>
          ))}
        </div>

        <div className="rounded-3xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>

          {/* Header */}
          <div className="px-7 pt-7 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <h1 className="text-xl font-extrabold mb-1">Review Your Order</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Please confirm everything looks correct before placing your order.</p>
          </div>

          <div className="px-7 py-6 space-y-5">

            {/* Customer card */}
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-extrabold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                {info.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{info.name}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{info.phone}</div>
                {info.notes && <div className="text-xs mt-1 italic" style={{ color: "var(--text-muted)" }}>&quot;{info.notes}&quot;</div>}
              </div>
              <button onClick={() => router.back()} className="text-xs font-semibold text-violet-500 hover:text-violet-700 transition-colors flex-shrink-0">Edit</button>
            </div>

            {/* Items */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-3 text-violet-500">Items Ordered</div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={`${item.productSlug}-${item.planLabel}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                    <span className="text-xl">{productEmoji(item.productName)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{item.productName}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.planLabel}{item.qty > 1 ? ` × ${item.qty}` : ""}</div>
                    </div>
                    <div className="font-bold text-sm text-violet-600">Rs. {(item.price * item.qty).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="flex justify-between px-4 py-2.5 text-sm" style={{ background: "var(--bg-input)", borderBottom: "1px dashed var(--border)" }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span className="font-medium">Rs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 text-sm" style={{ background: "var(--bg-input)", borderBottom: "1px dashed var(--border)" }}>
                <span style={{ color: "var(--text-muted)" }}>Discount</span>
                <span className="text-green-600 font-medium">Rs. 0.00</span>
              </div>
              <div className="flex justify-between px-4 py-3 font-extrabold" style={{ background: "rgba(124,58,237,0.06)" }}>
                <span>Total to Pay</span>
                <span className="text-violet-600 text-lg">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment method preview */}
            <div className="p-4 rounded-2xl space-y-2" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
              <div className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-2">Payment Method</div>
              <div className="flex items-center gap-3 text-sm">
                <span>🏦</span>
                <div>
                  <div className="font-semibold">Bank Transfer / QR Payment</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>Commercial Bank · Account 8160103864</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm mt-1">
                <span>💬</span>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>After payment, confirm via WhatsApp — your Order ID is included automatically</div>
              </div>
            </div>

            {/* Delivery note */}
            <div className="flex items-start gap-3 p-3 rounded-xl text-xs" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <span className="text-base">⚡</span>
              <div>Most subscriptions are delivered within <strong>5–10 minutes</strong> after payment. Some may take up to <strong>24 hours</strong>.</div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 8px 28px rgba(124,58,237,0.35)" }}
            >
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </span>
              ) : "Confirm & Place Order →"}
            </button>

            <p className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
              🔒 Your order will be confirmed after payment verification
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => router.back()} className="text-sm" style={{ color: "var(--text-muted)" }}>← Edit Order Details</button>
        </div>
      </div>
    </div>
  );
}
