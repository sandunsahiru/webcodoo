"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const WA_NUMBER = "94702947854";

interface Order {
  orderId: string;
  name: string;
  phone: string;
  total: number;
  items: { productName: string; planLabel: string; price: number; qty: number }[];
  status: string;
}

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const waText = encodeURIComponent(
    `Hi! I've placed an order on Webcodoo.\n\n🧾 Order ID: ${orderId}\n\nPlease confirm my order and payment details. Thank you!`
  );
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waText}`;

  const WaIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p style={{ color: "var(--text-muted)" }}>Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <p className="font-semibold">Order not found</p>
          <Link href="/" className="mt-4 inline-block text-violet-600 text-sm">← Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Webcodoo" width={130} height={44} className="h-9 w-auto object-contain" /></Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
        {/* Order confirmed header */}
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 text-3xl" style={{ background: "rgba(124,58,237,0.1)", border: "2px solid rgba(124,58,237,0.3)" }}>
            🎉
          </div>
          <h1 className="text-2xl font-extrabold mb-1">Order Placed!</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Hi {order.name}, complete your payment to receive access.</p>
        </div>

        {/* Order ID */}
        <div
          className="flex items-center justify-between p-4 rounded-2xl"
          style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-0.5">Order ID</div>
            <div className="font-extrabold text-lg tracking-wide">{order.orderId}</div>
          </div>
          <button
            onClick={() => copy(order.orderId)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: copied ? "rgba(34,197,94,0.1)" : "rgba(124,58,237,0.1)", color: copied ? "#16a34a" : "#7c3aed", border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(124,58,237,0.25)"}` }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Items summary */}
        <div className="p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3 text-violet-500">Items Ordered</div>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>{item.productName} · {item.planLabel} × {item.qty}</span>
                <span className="font-semibold">Rs. {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-extrabold pt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <span>Total to Pay</span>
              <span className="text-violet-600 text-lg">Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="p-5 rounded-2xl space-y-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="font-bold text-base">💳 Payment Details</h2>

          {/* QR Code */}
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="rounded-2xl overflow-hidden p-3 flex-shrink-0" style={{ background: "#fff", border: "3px solid rgba(124,58,237,0.2)" }}>
              <Image src="/payment-qr.png" alt="Payment QR" width={150} height={150} className="w-[140px] h-[140px] object-contain" />
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="font-bold text-base">Scan to Pay</div>
              <p style={{ color: "var(--text-muted)" }}>Use any banking app to scan this QR code and pay Rs. {order.total.toLocaleString()}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>or bank deposit</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Bank Details */}
          <div className="rounded-2xl p-4 space-y-2 text-sm" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
            <div className="font-bold mb-3">🏦 Commercial Bank</div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Branch</span>
              <span className="font-medium">Kurunegala (016) - Suratissa Mawatha</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Account No.</span>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider">8160103864</span>
                <button
                  onClick={() => copy("8160103864")}
                  className="text-[10px] px-2 py-0.5 rounded font-medium"
                  style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Name</span>
              <span className="font-medium">SMSS BANDARA</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Amount</span>
              <span className="font-extrabold text-violet-600">Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Important note */}
          <div
            className="p-3 rounded-xl text-xs font-medium"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", color: "#92400e" }}
          >
            🔔 <strong>Important:</strong> Include <strong>{order.orderId}</strong> in the bank transfer description/reference. This helps us match your payment instantly!
          </div>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.02]"
          style={{ background: "#25D366", boxShadow: "0 8px 24px rgba(37,211,102,0.35)" }}
        >
          <WaIcon />
          Confirm Payment on WhatsApp
        </a>
        <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          After paying, tap above to send us your payment slip. Your order ID ({order.orderId}) is included automatically.
        </p>

        {/* Delivery note */}
        <div
          className="p-4 rounded-2xl text-sm text-center"
          style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)" }}
        >
          ⚡ Orders are delivered within <strong>5–10 minutes</strong> after payment. Some subscriptions may take up to <strong>24 hours</strong>.
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
