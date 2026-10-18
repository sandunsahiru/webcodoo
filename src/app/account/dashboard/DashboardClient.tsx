"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartNavButton } from "@/components/CartNavButton";
import type { OrderRow } from "./page";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending_payment: { label: "Pending Payment", color: "#d97706", bg: "#fef3c7", dot: "#f59e0b" },
  confirmed:       { label: "Confirmed",       color: "#0284c7", bg: "#e0f2fe", dot: "#38bdf8" },
  processing:      { label: "Processing",      color: "#7c3aed", bg: "#f3e8ff", dot: "#a78bfa" },
  delivered:       { label: "Delivered",       color: "#16a34a", bg: "#dcfce7", dot: "#4ade80" },
  cancelled:       { label: "Cancelled",       color: "#dc2626", bg: "#fee2e2", dot: "#f87171" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_payment;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
}

function formatAmount(n: number) {
  return `Rs. ${n.toLocaleString("en-LK")}`;
}

interface Props {
  name: string;
  phone: string;
  orders: OrderRow[];
}

export default function DashboardClient({ name, phone, orders }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalSpent = orders
    .filter(o => o.status !== "cancelled")
    .reduce((s, o) => s + o.totalAmount, 0);

  const cardStyle: React.CSSProperties = {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: 16,
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <Image src="/logo.png" alt="Webcodoo" width={130} height={44} className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <CartNavButton />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm font-medium px-3 py-1.5 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
              style={{ color: "var(--text-secondary)" }}
            >
              {loggingOut ? "..." : "Sign out"}
            </button>
          </div>
        </div>
      </nav>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }}
        />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-5" style={cardStyle}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{phone}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">{orders.length}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">{formatAmount(totalSpent)}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Total Spent</div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <h2 className="text-lg font-bold mb-4">Order History</h2>

        {orders.length === 0 ? (
          <div className="p-12 text-center" style={cardStyle}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "var(--input-bg)" }}>
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="font-semibold mb-1">No orders yet</p>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Your orders will appear here after you make a purchase.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="p-5" style={cardStyle}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="font-mono font-bold text-violet-600">{order.orderId}</span>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Items */}
                <div className="space-y-2 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        {item.planLabel && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                            {item.planLabel}
                          </span>
                        )}
                      </div>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {item.qty > 1 ? `${item.qty} × ` : ""}{formatAmount(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span className="text-sm font-semibold">Total</span>
                  <span className="font-bold text-violet-600">{formatAmount(order.totalAmount)}</span>
                </div>

                {/* CTA for pending orders */}
                {order.status === "pending_payment" && (
                  <div
                    className="mt-3 p-3 rounded-xl text-sm flex items-center gap-2"
                    style={{ background: "#fef3c7", color: "#92400e" }}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Payment pending — please complete your bank transfer and confirm via WhatsApp.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-sm mt-8" style={{ color: "var(--text-secondary)" }}>
          Need help?{" "}
          <a
            href="https://wa.me/94702947854"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:text-violet-600"
          >
            Contact us on WhatsApp
          </a>
        </p>
      </main>
    </div>
  );
}
