"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const options = [
  {
    id: "refund",
    icon: "💸",
    title: "Refund",
    description:
      "Receive a refund for your subscription. Please note the refund may be partial or full depending on your purchase date. Due to the current high volume of requests, this may take up to 72 hours to process.",
    badge: "Up to 72 hrs",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  {
    id: "other-subscription",
    icon: "🔄",
    title: "Buy Any Other Subscription",
    description:
      "Switch to any other available subscription we offer at a discounted or equivalent price. Our team will contact you with the best available options.",
    badge: "Flexible",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "gemini-pro",
    icon: "✨",
    title: "Get Gemini Pro 18 Months",
    description:
      "Receive a Gemini Pro 18-month activation invite worth Rs. 3,000/= as a replacement for your lost service. This is a great long-term alternative.",
    badge: "Worth Rs. 3,000",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
];

export default function ChatGPTCancellation() {
  const [formData, setFormData] = useState({
    whatsapp: "",
    email: "",
    purchaseDate: "",
    decision: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.whatsapp || !formData.email || !formData.purchaseDate || !formData.decision) {
      setError("Please fill in all fields and select one of the options below.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/submit-chatgpt-cancellation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 text-center max-w-lg w-full">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="mx-auto w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Response Received!</h2>
            <p className="text-zinc-400 leading-relaxed mb-2">
              Thank you for letting us know your preference. We sincerely apologize for the inconvenience caused.
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              Our team will reach out to you on your WhatsApp number as soon as possible. Due to high request volumes, please allow us a little time. We truly appreciate your patience and understanding. 🙏
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-10">
      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto">

        {/* Back + Logo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Image src="/logo.png" alt="Webcodoo" width={120} height={40} className="h-9 w-auto object-contain" priority />
        </div>

        {/* Apology banner */}
        <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-5 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl mt-0.5">😔</div>
            <div>
              <p className="text-red-400 font-semibold text-sm mb-2">We Sincerely Apologize</p>
              <p className="text-zinc-300 text-sm leading-relaxed">
                We are really sorry for the inconvenience caused. Please understand that this situation is not exclusive to us — <span className="text-white font-medium">all third-party ChatGPT service providers globally</span> are facing this same issue. Currently, no one has a stable method to continue these services.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed mt-2">
                We understand this is frustrating and we deeply regret the disruption to your workflow. We are committed to making this right for every affected customer. 💙
              </p>
            </div>
          </div>
        </div>

        {/* Global notice badge */}
        <div className="flex items-center gap-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 mb-7">
          <span className="text-lg">🌐</span>
          <p className="text-zinc-400 text-xs leading-relaxed">
            This is a <span className="text-white font-medium">global issue</span> affecting all ChatGPT third-party subscription services. We assure you this is completely outside our control and we are doing everything we can.
          </p>
        </div>

        {/* Page title */}
        <div className="mb-7">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            ChatGPT Service Cancellation
          </h1>
          <p className="text-zinc-500 text-sm">
            Please fill in your details and select your preferred resolution. We will contact you on WhatsApp as soon as we process your request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <input
                type="tel"
                placeholder="e.g. +94 77 123 4567"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* ChatGPT Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              ChatGPT Account Email <span className="text-red-500">*</span>
              <span className="ml-2 text-zinc-500 font-normal text-xs">(email given by us)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="e.g. yourname@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Purchase Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Decision options */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Choose Your Preferred Resolution <span className="text-red-500">*</span>
            </label>
            <p className="text-zinc-600 text-xs mb-3">
              Please note: Due to high request volume, all resolutions will take some time to deliver. We appreciate your patience.
            </p>
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, decision: option.id })}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    formData.decision === option.id
                      ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      formData.decision === option.id ? "border-blue-500" : "border-zinc-600"
                    }`}>
                      {formData.decision === option.id && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-base">{option.icon}</span>
                        <span className={`font-semibold text-sm ${formData.decision === option.id ? "text-white" : "text-zinc-200"}`}>
                          {option.title}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${option.badgeColor}`}>
                          {option.badge}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* High demand notice */}
          <div className="flex items-start gap-2.5 bg-zinc-800/40 border border-zinc-700/40 rounded-xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-zinc-500 text-xs leading-relaxed">
              We are currently handling a very high number of requests and cannot deliver resolutions instantly. We sincerely apologize for the wait and will contact you on WhatsApp in the order requests are received.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                  <path d="M22 2 11 13"/>
                </svg>
                Submit My Decision
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-zinc-600 text-xs mt-6 mb-2">
          Your data is secure and will only be used to process your resolution request.
        </p>
      </div>
    </div>
  );
}
