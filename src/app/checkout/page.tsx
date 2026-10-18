"use client";

import { useState } from "react";
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

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "confirm" | "edit">("phone");
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<PosCustomer | null>(null);
  const [posOrders, setPosOrders] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const handleLookup = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.found && data.customer) {
        setCustomer(data.customer);
        setName(data.customer.name || "");
        setPosOrders(data.posOrders ?? 0);
        setStep("confirm");
      } else {
        // New customer
        setCustomer(null);
        setName("");
        setStep("edit");
      }
    } catch (e) {
      setError("Could not connect. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    const finalName = name.trim();
    if (!finalName) { setError("Please enter your name"); return; }
    // Store checkout info in sessionStorage and navigate to summary
    sessionStorage.setItem("wcd_checkout", JSON.stringify({
      phone: phone.trim(),
      name: finalName,
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

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 text-xs font-medium">
          {["Contact", "Summary", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={i === 0 ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff" } : { background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                {i + 1}
              </div>
              <span style={{ color: i === 0 ? "#7c3aed" : "var(--text-muted)" }}>{s}</span>
              {i < 2 && <span style={{ color: "var(--border)" }}>›</span>}
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-6 sm:p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {/* Order mini-summary */}
          <div className="mb-6 p-4 rounded-2xl" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-violet-500">Your Order</div>
            <div className="space-y-1">
              {items.map((item) => (
                <div key={`${item.productSlug}-${item.planLabel}`} className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>{item.productName} · {item.planLabel}</span>
                  <span className="font-semibold">Rs. {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <span>Total</span>
              <span className="text-violet-600">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Step: Phone */}
          {step === "phone" && (
            <div>
              <h2 className="text-lg font-bold mb-1">Enter your phone number</h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                We&apos;ll look up your account and purchase history.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="07X XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  onClick={handleLookup}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                >
                  {loading ? "Checking..." : "Continue →"}
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirm existing customer */}
          {step === "confirm" && customer && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                  {customer.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <div className="font-bold text-base">{customer.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {phone} · {posOrders > 0 ? `${posOrders} previous order${posOrders > 1 ? "s" : ""}` : "New web customer"}
                  </div>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Is this you?</p>
              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleProceed}
                  className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                >
                  Yes, that&apos;s me →
                </button>
                <button
                  onClick={() => { setStep("edit"); setName(""); }}
                  className="px-4 py-3 rounded-2xl text-sm font-medium transition-colors"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  No, update
                </button>
              </div>
            </div>
          )}

          {/* Step: Enter/Edit name */}
          {step === "edit" && (
            <div>
              <h2 className="text-lg font-bold mb-1">
                {customer ? "Update your details" : "Create account"}
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                {customer ? "Correct your name below." : "We didn't find an account. Please enter your name."}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleProceed()}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={handleProceed}
                    className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                  >
                    Continue →
                  </button>
                  <button
                    onClick={() => setStep("phone")}
                    className="px-4 py-3 rounded-2xl text-sm transition-colors"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
