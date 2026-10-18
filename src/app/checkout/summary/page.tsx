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
  posCustomerId?: string;
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

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 text-xs font-medium">
          {["Contact", "Summary", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={i <= 1 ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff" } : { background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                {i + 1}
              </div>
              <span style={{ color: i <= 1 ? "#7c3aed" : "var(--text-muted)" }}>{s}</span>
              {i < 2 && <span style={{ color: "var(--border)" }}>›</span>}
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-6 sm:p-8 space-y-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-bold">Review Your Order</h2>

          {/* Customer info */}
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              {info.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm">{info.name}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{info.phone}</div>
            </div>
            <button onClick={() => router.back()} className="ml-auto text-xs font-medium text-violet-500 hover:text-violet-700">Edit</button>
          </div>

          {/* Items */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3 text-violet-500">Items</div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={`${item.productSlug}-${item.planLabel}`} className="flex justify-between items-center text-sm py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.planLabel} × {item.qty}</div>
                  </div>
                  <div className="font-bold">Rs. {(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
              <div className="flex justify-between font-extrabold text-base pt-1">
                <span>Total</span>
                <span className="text-violet-600">Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery note */}
          <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)" }}>
            ⚡ Most subscriptions delivered within <strong>5–10 minutes</strong>. Some may take up to <strong>24 hours</strong>.
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}
          >
            {placing ? "Placing Order..." : "Confirm Order & Pay →"}
          </button>

          <p className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
            🔒 Your order will be confirmed after payment verification
          </p>
        </div>
      </div>
    </div>
  );
}
