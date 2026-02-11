"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function LinkedInReplacement() {
  const [formData, setFormData] = useState({
    whatsapp: "",
    subscriptionType: "",
    redeemLink: "",
    purchaseDate: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.whatsapp || !formData.subscriptionType || !formData.redeemLink || !formData.purchaseDate || !screenshot) {
      setError("Please fill in all fields and upload a screenshot");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload image via our API route
      const uploadFormData = new FormData();
      uploadFormData.append("file", screenshot);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload screenshot. Please try again.");
      }

      const { url: imageUrl } = await uploadRes.json();

      // Step 2: Send data to our API route (which sends to Telegram)
      const response = await fetch("/api/submit-replacement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp: formData.whatsapp,
          subscriptionType: formData.subscriptionType,
          redeemLink: formData.redeemLink,
          purchaseDate: formData.purchaseDate,
          screenshotUrl: imageUrl,
        }),
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
        <div className="relative z-10 text-center max-w-lg">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Request Submitted Successfully!
            </h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Thank you for submitting your details. We&apos;ll send you new <span className="text-blue-400 font-medium">LinkedIn Career Premium</span> codes soon.
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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">
            LinkedIn Subscription Replacement
          </h1>
          <p className="text-zinc-400">
            If your LinkedIn Sales Navigator or Business Premium subscription was revoked, fill out this form to receive a free Career Premium replacement.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* WhatsApp Number */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. +94 77 123 4567"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Subscription Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Subscription Name <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "business", label: "Business Premium", icon: "💼" },
                { value: "sales-nav", label: "Sales Navigator", icon: "🧭" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, subscriptionType: option.value })}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${formData.subscriptionType === option.value
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                    }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Redeem Link */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              LinkedIn Redeem Link (Given by us) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://www.linkedin.com/..."
              value={formData.redeemLink}
              onChange={(e) => setFormData({ ...formData, redeemLink: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Purchase Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Screenshot of Revoke Email / Subscription Page <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${previewUrl
                  ? "border-blue-500/50 bg-blue-500/5"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {previewUrl ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-zinc-400">{screenshot?.name}</p>
                  <p className="text-xs text-blue-400">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="w-10 h-10 mx-auto text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-zinc-400 text-sm">Click to upload screenshot</p>
                  <p className="text-zinc-600 text-xs">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Replacement Request"
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Your data is secure and will only be used to process your replacement.
        </p>
      </div>
    </div>
  );
}
