"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { products } from "@/lib/products";
import { ThemeToggle } from "@/components/ThemeToggle";

const WA_NUMBER = "94702947854";
const WA_LINK = `https://wa.me/${WA_NUMBER}`;

const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

const categoryIcons: Record<string, string> = {
  All: "⚡",
  "AI Writing": "✍️",
  "AI Tools": "🤖",
  Creative: "🎬",
  Development: "💻",
  Design: "🎨",
  Academic: "📚",
  Education: "🎓",
  Productivity: "⚙️",
};

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div
      className="min-h-screen overflow-x-hidden transition-colors duration-300"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ── Animated background glows ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full blur-[130px] animate-pulse"
          style={{ background: "var(--glow-1)" }}
        />
        <div
          className="absolute top-[35%] right-[-8%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse delay-700"
          style={{ background: "var(--glow-2)" }}
        />
        <div
          className="absolute bottom-[-5%] left-[35%] w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse delay-1400"
          style={{ background: "var(--glow-3)" }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <nav
        className="relative z-50 sticky top-0 backdrop-blur-xl"
        style={{
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Image
            src="/logo.png"
            alt="Webcodoo"
            width={150}
            height={50}
            className="h-10 w-auto object-contain"
            priority
          />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb85a] text-white text-sm font-semibold px-4 py-2 rounded-full transition-all hover:scale-105 shadow-lg"
              style={{ boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
            >
              <WaIcon />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-20 pb-16 px-4 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full mb-6"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
            color: "#7c3aed",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping inline-block"
            style={{ background: "#7c3aed" }}
          />
          Premium Digital Subscriptions · Sri Lanka
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          <span>Get Premium</span>
          <br />
          <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Digital Tools
          </span>
          <br />
          <span className="text-3xl sm:text-4xl md:text-5xl">at Unbeatable Prices</span>
        </h1>

        <p className="text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Quillbot, StealthWriter, JetBrains, Figma, MS Office &amp; more — starting from just{" "}
          <span className="font-bold text-violet-600">Rs. 400</span>
        </p>

        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-white font-bold px-8 py-4 rounded-2xl text-base sm:text-lg transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
          }}
        >
          <WaIcon />
          Order via WhatsApp
        </a>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-14">
          {[
            { val: "500+", label: "Happy Customers" },
            { val: "11+", label: "Products" },
            { val: "Rs.400", label: "Starting From" },
            { val: "24/7", label: "Support" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold text-violet-600">{s.val}</div>
              <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS SECTION ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-20">

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <div
            className="absolute inset-y-0 left-4 flex items-center pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none transition-all"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                activeCategory === cat
                  ? {
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      color: "#ffffff",
                      boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                    }
                  : {
                      background: "var(--bg-input)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }
              }
            >
              <span>{categoryIcons[cat] ?? "📦"}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="group relative flex flex-col gap-4 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
              }}
            >
              {/* Badge */}
              {product.badge && (
                <span
                  className="absolute top-4 right-4 text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                >
                  {product.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center text-2xl shadow-lg`}
              >
                {product.icon}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-widest mb-1 text-violet-600">
                  {product.category}
                </div>
                <h3
                  className="font-bold text-base leading-snug mb-1 transition-colors group-hover:text-violet-600"
                  style={{ color: "var(--text-primary)" }}
                >
                  {product.name}
                </h3>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {product.tagline}
                </p>
              </div>

              {/* Price row */}
              <div
                className="flex items-end justify-between pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div>
                  <div className="text-[10px] mb-0.5" style={{ color: "var(--text-muted)" }}>Starting from</div>
                  <div className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                    Rs. {product.startingPrice.toLocaleString()}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>/ {product.duration}</div>
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  <svg
                    className="w-4 h-4 text-violet-600"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20" style={{ color: "var(--text-muted)" }}>
              <div className="text-5xl mb-3">🔍</div>
              <p>No products found. Try a different search.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY WEBCODOO ────────────────────────────────────────────── */}
      <section
        className="relative z-10 py-16 px-4"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Why Choose Webcodoo?
          </h2>
          <p className="mb-10" style={{ color: "var(--text-muted)" }}>
            Trusted by hundreds of students and professionals across Sri Lanka
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { icon: "⚡", title: "Instant Delivery", desc: "Get access within minutes after payment" },
              { icon: "🔒", title: "Secure & Trusted", desc: "Official subscriptions, verified accounts" },
              { icon: "💬", title: "24/7 WhatsApp", desc: "Support always available via WhatsApp" },
              { icon: "💰", title: "Best Prices", desc: "Lowest prices for premium tools in Sri Lanka" },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-5 text-center transition-all hover:-translate-y-0.5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <div className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{f.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ──────────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4">
        <div
          className="max-w-2xl mx-auto text-center rounded-3xl p-8 sm:p-12"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(79,70,229,0.08) 100%)",
            border: "1px solid rgba(124,58,237,0.18)",
          }}
        >
          <div className="text-4xl mb-4">🛒</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Ready to order?
          </h2>
          <p className="mb-6 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
            Message us on WhatsApp with the product name and your preferred plan.
            Fast, easy, and secure.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1fb85a] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105"
            style={{ boxShadow: "0 8px 24px rgba(37,211,102,0.3)" }}
          >
            <WaIcon />
            Message on WhatsApp
          </a>
          <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>+94 702 947 854</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 py-8 px-4 text-center"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <Image
          src="/logo.png"
          alt="Webcodoo"
          width={120}
          height={40}
          className="h-8 w-auto object-contain mx-auto mb-3 opacity-60"
        />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Webcodoo · Premium Digital Subscriptions · Sri Lanka
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          WhatsApp:{" "}
          <a href={WA_LINK} className="hover:text-violet-600 transition-colors">
            +94 702 947 854
          </a>
        </p>
      </footer>
    </div>
  );
}
