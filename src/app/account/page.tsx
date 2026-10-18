"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

type Step = "phone" | "password" | "create";

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
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [existingName, setExistingName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handlePhoneNext(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setError("");
    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(normalized)}`);
      const data = await res.json();
      if (data.found) {
        setExistingName(data.name || "");
        if (data.hasPassword) {
          setStep("password");
        } else {
          // POS customer without password — ask them to create one
          setName(data.name || "");
          setStep("create");
        }
      } else {
        setStep("create");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
    setTimeout(() => passwordRef.current?.focus(), 100);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "no_password") {
          setStep("create");
        } else {
          setError(data.error || "Login failed");
        }
        return;
      }
      router.push("/account/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !password) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone), name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes("already exists")) {
          setStep("password");
          setError("Account already exists. Please login.");
        } else {
          setError(data.error || "Registration failed");
        }
        return;
      }
      router.push("/account/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const btnStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px 0",
    width: "100%",
    fontWeight: 700,
    fontSize: 15,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    transition: "opacity 0.2s",
  };

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
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1">
              {step === "phone" && "My Account"}
              {step === "password" && `Welcome back${existingName ? `, ${existingName.split(" ")[0]}` : ""}!`}
              {step === "create" && (existingName ? "Create a Password" : "Create Account")}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {step === "phone" && "Sign in or create your Webcodoo account"}
              {step === "password" && "Enter your password to continue"}
              {step === "create" && (existingName ? "Set a password to access your order history" : "Join Webcodoo to track your orders")}
            </p>
          </div>

          <div className="p-6 sm:p-8" style={cardStyle}>
            {/* Phone step */}
            {step === "phone" && (
              <form onSubmit={handlePhoneNext} className="space-y-4">
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
                <button type="submit" style={btnStyle} disabled={loading}>
                  {loading ? "Checking..." : "Continue →"}
                </button>
              </form>
            )}

            {/* Login step */}
            {step === "password" && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Phone chip */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{phone}</span>
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setError(""); setPassword(""); }}
                    className="text-violet-500 hover:text-violet-600 font-medium text-xs"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordRef}
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {showPw ? (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" style={btnStyle} disabled={loading}>
                  {loading ? "Signing in..." : "Sign In →"}
                </button>
              </form>
            )}

            {/* Create / Register step */}
            {step === "create" && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Phone chip */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{phone}</span>
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setError(""); setPassword(""); setConfirmPassword(""); }}
                    className="text-violet-500 hover:text-violet-600 font-medium text-xs"
                  >
                    Change
                  </button>
                </div>

                {/* Name (hidden if existing POS customer already has a name) */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    style={inputStyle}
                    autoFocus={!existingName}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    {existingName ? "Create Password" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      ref={!existingName ? undefined : passwordRef}
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      autoFocus={!!existingName}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {showPw ? (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Confirm Password
                  </label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    style={inputStyle}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" style={btnStyle} disabled={loading || !name.trim() || password.length < 6 || password !== confirmPassword}>
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
