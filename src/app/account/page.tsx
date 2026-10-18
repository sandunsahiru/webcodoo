"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

type Step = "phone" | "otp" | "name";

function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  const d = trimmed.replace(/\D/g, "");
  if (d.startsWith("00") && d.length > 4) return `+${d.slice(2)}`;
  if (d.startsWith("94") && d.length === 11) return `+${d}`;
  if (d.startsWith("0") && d.length === 10)
    return d.startsWith("04") ? `+61${d.slice(1)}` : `+94${d.slice(1)}`;
  if (d.startsWith("0") && d.length === 11) return `+44${d.slice(1)}`;
  if (d.length === 9) return `+94${d}`;
  if (d.length === 10) return `+1${d}`;
  return d ? `+${d}` : trimmed;
}

export default function AccountPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send code"); return; }
      setStep("otp");
      setResendTimer(60);
      setTimeout(() => otpRef.current?.focus(), 100);
      // Dev mode: pre-fill OTP if returned
      if (data.dev) setOtp(data.dev);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone) }),
      });
      setResendTimer(60);
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent, withName?: string) {
    e.preventDefault();
    if (!otp.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone), otp: otp.trim(), name: withName ?? name }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "name_required") { setStep("name"); setLoading(false); return; }
        setError(data.error || "Verification failed");
        return;
      }
      router.push("/account/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await handleVerifyOtp(e, name.trim());
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: 20,
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--input-bg)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: 12,
    padding: "12px 16px",
    width: "100%",
    fontSize: 15,
    outline: "none",
  };

  const btnStyle = (disabled?: boolean): React.CSSProperties => ({
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px 0",
    width: "100%",
    fontWeight: 700,
    fontSize: 15,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    transition: "opacity 0.2s",
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Webcodoo" width={130} height={44} className="h-9 w-auto" />
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #7c3aed22, #4f46e522)", border: "1px solid var(--border)" }}
            >
              {step === "phone" && (
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              )}
              {step === "otp" && (
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#25D366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              )}
              {step === "name" && (
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-1">
              {step === "phone" && "My Account"}
              {step === "otp" && "Enter Verification Code"}
              {step === "name" && "What's your name?"}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {step === "phone" && "Sign in or create your Webcodoo account"}
              {step === "otp" && (
                <>We sent a 6-digit code to<br /><strong>{phone}</strong> via WhatsApp</>
              )}
              {step === "name" && "First time here — tell us your name to continue"}
            </p>
          </div>

          <div className="p-6 sm:p-8" style={cardStyle}>
            {/* ── Step 1: Phone ── */}
            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="07X XXX XXXX or +44..."
                    style={inputStyle}
                    autoFocus
                    required
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                    International? Add country code (e.g. +44, +61)
                  </p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" style={btnStyle(loading || !phone.trim())} disabled={loading || !phone.trim()}>
                  {loading ? "Sending code..." : "Send WhatsApp Code →"}
                </button>

                {/* WhatsApp hint */}
                <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
                  <svg className="w-3.5 h-3.5 inline mr-1 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  You&apos;ll receive a 6-digit code on WhatsApp
                </p>
              </form>
            )}

            {/* ── Step 2: OTP ── */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Phone chip */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{phone}</span>
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
                    className="text-violet-500 hover:text-violet-600 font-medium text-xs"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Verification Code
                  </label>
                  <input
                    ref={otpRef}
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6-digit code"
                    style={{ ...inputStyle, letterSpacing: "0.25em", fontSize: 22, textAlign: "center", fontWeight: 700 }}
                    autoFocus
                    maxLength={6}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" style={btnStyle(loading || otp.length < 6)} disabled={loading || otp.length < 6}>
                  {loading ? "Verifying..." : "Verify & Continue →"}
                </button>

                <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                  Didn&apos;t receive it?{" "}
                  {resendTimer > 0 ? (
                    <span>Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-violet-500 hover:text-violet-600 font-medium"
                    >
                      Resend code
                    </button>
                  )}
                </p>
              </form>
            )}

            {/* ── Step 3: Name (new users only) ── */}
            {step === "name" && (
              <form onSubmit={handleSubmitName} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    style={inputStyle}
                    autoFocus
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" style={btnStyle(loading || !name.trim())} disabled={loading || !name.trim()}>
                  {loading ? "Creating account..." : "Create Account →"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            <Link href="/" className="hover:text-violet-500 transition-colors">← Back to Shop</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
