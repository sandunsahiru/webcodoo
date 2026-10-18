"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartNavButton } from "@/components/CartNavButton";

interface PosCustomer {
  id: string;
  name: string;
  phone: string;
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

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [customer, setCustomer] = useState<PosCustomer | null>(null);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [nameEdited, setNameEdited] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const handlePhoneBlur = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 9 || lookupDone || lookingUp) return;
    setLookingUp(true);
    try {
      const res = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.found && data.customer) {
        setCustomer(data.customer);
        if (!nameEdited) setName(data.customer.name || "");
      }
    } catch { /* silent */ } finally {
      setLookingUp(false);
      setLookupDone(true);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setLookupDone(false);
    setCustomer(null);
    if (!nameEdited) setName("");
  };

  const handleContinue = () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number"); return;
    }
    if (!name.trim()) {
      setError("Please enter your name"); return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service to continue"); return;
    }
    setError("");
    sessionStorage.setItem("wcd_checkout", JSON.stringify({
      phone: phone.trim(),
      name: name.trim(),
      notes: notes.trim(),
      posCustomerId: customer?.id,
    }));
    router.push("/checkout/summary");
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
                style={i === 0 ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff" } : { background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {i + 1}
              </div>
              <span style={{ color: i === 0 ? "#7c3aed" : "var(--text-muted)" }}>{s}</span>
              {i < 2 && <span style={{ color: "var(--border)" }}>›</span>}
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>

          {/* Card header */}
          <div className="px-7 pt-8 pb-5 text-center" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex justify-center gap-2 mb-4">
              {items.slice(0, 3).map((item) => (
                <div key={`${item.productSlug}-${item.planLabel}`}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.12))", border: "1px solid rgba(124,58,237,0.2)" }}>
                  {productEmoji(item.productName)}
                </div>
              ))}
            </div>
            <h1 className="text-2xl font-extrabold mb-1">Place Your Order</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Total: <span className="font-extrabold text-violet-600 text-base">Rs. {total.toLocaleString()}</span>
            </p>
          </div>

          <div className="px-7 py-6 space-y-5">
            {/* Items section */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-2.5 block">
                {items.length === 1 ? "Product" : "Products"}
              </label>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={`${item.productSlug}-${item.planLabel}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                    <span className="text-xl">{productEmoji(item.productName)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{item.productName}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.planLabel}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-violet-600">Rs. {(item.price * item.qty).toLocaleString()}</div>
                      {item.qty > 1 && <div className="text-xs" style={{ color: "var(--text-muted)" }}>× {item.qty}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="flex justify-between items-center px-4 py-2.5 text-sm" style={{ background: "var(--bg-input)", borderBottom: "1px dashed var(--border)" }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span className="font-medium">Rs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 text-sm" style={{ background: "var(--bg-input)", borderBottom: "1px dashed var(--border)" }}>
                <span style={{ color: "var(--text-muted)" }}>Discount</span>
                <span className="text-green-600 font-medium">Rs. 0.00</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 font-extrabold" style={{ background: "rgba(124,58,237,0.06)" }}>
                <span>Final Total</span>
                <span className="text-violet-600 text-lg">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Your Details</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameEdited(true); }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Contact Number</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="07X XXX XXXX"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={handlePhoneBlur}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", paddingRight: lookingUp ? "2.5rem" : undefined }}
                />
                {lookingUp && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {customer && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#166534" }}>
                  <span>✓</span>
                  <span>Welcome back, <strong>{customer.name}</strong>! We found your account.</span>
                  <button onClick={() => { setCustomer(null); setLookupDone(false); setName(""); }} className="ml-auto text-[10px] underline opacity-70">Not me</button>
                </div>
              )}
            </div>

            {/* Additional Request */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                Additional Request <span style={{ color: "var(--text-muted)" }}>(Optional)</span>
              </label>
              <textarea
                placeholder="Any special instructions or requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Delivery info */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <span className="text-base mt-0.5">⚡</span>
              <div>
                <strong>Fast Delivery</strong> — Most subscriptions are activated within <strong>5–10 minutes</strong> after payment. Some may take up to 24 hours.
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 accent-violet-600 cursor-pointer"
                />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                By clicking &quot;Continue to Review&quot;, I acknowledge that I have read and agree to the{" "}
                <Link href="/terms" className="text-violet-600 underline hover:text-violet-700">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-violet-600 underline hover:text-violet-700">Privacy Policy</Link>.
              </p>
            </label>

            {/* Submit */}
            <button
              onClick={handleContinue}
              disabled={!agreed}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: agreed ? "0 8px 28px rgba(124,58,237,0.35)" : "none" }}
            >
              Continue to Review →
            </button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <span>🔒 Secure</span>
              <span>·</span>
              <span>✓ Verified Products</span>
              <span>·</span>
              <span>💬 24/7 Support</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/cart" className="text-sm" style={{ color: "var(--text-muted)" }}>← Back to Cart</Link>
        </div>
      </div>
    </div>
  );
}
