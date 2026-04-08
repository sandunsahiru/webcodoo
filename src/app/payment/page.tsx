"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const bankDetails = [
  { label: "Bank", value: "Commercial Bank of Ceylon PLC" },
  { label: "Branch", value: "Kurunegala" },
  { label: "Account No", value: "8160103864" },
  { label: "Account Name", value: "SMSS BANDARA" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        copied
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-zinc-700/50 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white"
      }`}
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-12">
      {/* Glow effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="Webcodoo"
              width={180}
              height={62}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Payment Details</h1>
          <p className="text-zinc-500 text-sm">Use the details below to complete your payment</p>
        </div>

        {/* Bank Details Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold">Bank Transfer</h2>
              <p className="text-zinc-500 text-xs">Tap any field to copy</p>
            </div>
          </div>

          <div className="space-y-3">
            {bankDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex items-center justify-between gap-3 bg-zinc-800/50 border border-zinc-700/40 rounded-xl px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-500 text-xs mb-0.5">{detail.label}</p>
                  <p className="text-white font-medium text-sm break-all">{detail.value}</p>
                </div>
                <CopyButton text={detail.value} />
              </div>
            ))}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-green-600/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="3" height="3" rx="0.5" />
                <path d="M17 17h3v3" />
                <path d="M20 14v3" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-white font-semibold">QR Code Payment</h2>
                <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full font-medium">
                  Under Rs. 5,000
                </span>
              </div>
              <p className="text-zinc-500 text-sm mt-1">
                For payments under <span className="text-white font-medium">Rs. 5,000</span>, scan the QR code below using any LankaQR supported app.
              </p>
            </div>
          </div>

          <div className="flex justify-center my-5">
            <div className="bg-white rounded-2xl p-3 shadow-lg">
              <Image
                src="/qr.jpg"
                alt="LankaQR Payment QR Code"
                width={220}
                height={220}
                className="w-52 h-52 object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 rounded-xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Open any <span className="text-blue-400 font-medium">LankaQR</span> supported app — such as BOC, Sampath, Commercial Bank, HNB, or your bank&apos;s mobile app — and scan this QR code to pay instantly.
            </p>
          </div>
        </div>

        {/* Payment slip note */}
        <a
          href="https://wa.me/94702947854"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#25D366]/8 border border-[#25D366]/20 rounded-xl px-5 py-4 mb-8 hover:bg-[#25D366]/15 transition-colors"
        >
          <div className="flex items-start gap-2.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366] flex-shrink-0 mt-0.5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <div>
              <p className="text-[#25D366] text-xs font-medium mb-0.5">Send your payment slip to WhatsApp</p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                After making a payment, send the slip or screenshot to{" "}
                <span className="text-white font-medium">+94 70 294 7854</span> on WhatsApp for quick confirmation.
              </p>
            </div>
          </div>
        </a>

        {/* Channel links */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a
            href="https://chat.whatsapp.com/EGBkKn9ji8aAMVrq94soa5"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-4 py-3 hover:bg-[#25D366]/15 transition-colors"
          >
            <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-xs font-medium">WhatsApp</p>
              <p className="text-zinc-500 text-xs">Channel</p>
            </div>
          </a>

          <a
            href="https://t.me/webcodoo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-[#229ED9]/10 border border-[#229ED9]/20 rounded-xl px-4 py-3 hover:bg-[#229ED9]/15 transition-colors"
          >
            <div className="w-8 h-8 bg-[#229ED9] rounded-full flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-xs font-medium">Telegram</p>
              <p className="text-zinc-500 text-xs">Channel</p>
            </div>
          </a>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors inline-flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <p className="text-zinc-700 text-xs text-center mt-8">
          &copy; {new Date().getFullYear()} Webcodoo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
