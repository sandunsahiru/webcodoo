import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products as staticProducts } from "@/lib/products";
import { connectDB } from "@/lib/mongodb";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CartNavButton } from "@/components/CartNavButton";

export const dynamic = "force-dynamic";

const WA_NUMBER = "94702947854";

interface DbVariation {
  _id: string;
  label: string;
  price: number;
  originalPrice?: number;
  stock: number;
  highlight?: boolean;
}

interface DbProduct {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  tagline?: string;
  category?: string;
  icon?: string;
  badge?: string;
  color?: string;
  accessMethod?: string;
  features?: string[];
  note?: string;
  loginLink?: string;
  variations?: DbVariation[];
}

interface OtherProduct {
  slug: string;
  name: string;
  image?: string;
  icon?: string;
  color?: string;
  startingPrice: number;
}

function proxyImg(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://')) return `/api/image?url=${encodeURIComponent(url)}`;
  return url;
}

async function getDbProduct(slug: string): Promise<DbProduct | null> {
  try {
    const conn = await connectDB();
    const db = conn.connection.db!;
    const doc = await db.collection("products").findOne({
      slug,
      isActive: { $ne: false },
    });
    if (!doc) return null;
    return {
      _id: doc._id.toString(),
      slug: doc.slug,
      name: doc.name,
      description: doc.description,
      image: doc.image,
      tagline: doc.tagline,
      category: doc.category,
      icon: doc.icon,
      badge: doc.badge,
      color: doc.color,
      accessMethod: doc.accessMethod,
      features: doc.features,
      note: doc.note,
      loginLink: doc.loginLink,
      variations: (doc.variations || []).map((v: Record<string, unknown>) => ({
        _id: v._id?.toString() ?? "",
        label: String(v.label ?? ""),
        price: Number(v.price ?? 0),
        originalPrice: v.originalPrice != null ? Number(v.originalPrice) : undefined,
        stock: Number(v.stock ?? -1),
        highlight: Boolean(v.highlight),
      })),
    };
  } catch {
    return null;
  }
}

async function getOtherProducts(currentSlug: string): Promise<OtherProduct[]> {
  try {
    const conn = await connectDB();
    const db = conn.connection.db!;
    const docs = await db.collection("products").find({
      slug: { $ne: currentSlug, $exists: true },
      showOnWebsite: true,
      isActive: { $ne: false },
    }).limit(4).toArray();

    return docs.map((doc) => {
      const prices = (doc.variations || [])
        .map((v: Record<string, unknown>) => Number(v.price ?? 0))
        .filter((p: number) => p > 0);
      const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
      return {
        slug: doc.slug,
        name: doc.name,
        image: doc.image,
        icon: doc.icon || "📦",
        color: doc.color || "from-violet-500 to-purple-600",
        startingPrice,
      };
    });
  } catch {
    return [];
  }
}

const WaIconSm = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const WaIconMd = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dbProduct = await getDbProduct(slug);
  const staticProduct = getProduct(slug);
  if (!dbProduct && !staticProduct) return {};
  const name = dbProduct?.name || staticProduct?.name || slug;
  const description = dbProduct?.description || staticProduct?.description || "";
  return {
    title: `${name} – Webcodoo`,
    description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const dbProduct = await getDbProduct(slug);

  // DB is source of truth — 404 if not in DB
  if (!dbProduct) notFound();

  // Static product used only as fallback for display data not yet filled in DB
  const staticProduct = getProduct(slug);

  // Merge: DB first, static fallback for legacy products
  const tagline = dbProduct.tagline || staticProduct?.tagline || "";
  const category = dbProduct.category || staticProduct?.category || "Digital";
  const icon = dbProduct.icon || staticProduct?.icon || "📦";
  const badge = dbProduct.badge || staticProduct?.badge;
  const color = dbProduct.color || staticProduct?.color || "from-violet-500 to-purple-600";
  const description = dbProduct.description || staticProduct?.description || "";
  const accessMethod = dbProduct.accessMethod || staticProduct?.accessMethod || "";
  const features = (dbProduct.features && dbProduct.features.length > 0)
    ? dbProduct.features
    : (staticProduct?.features || []);
  const note = dbProduct.note || staticProduct?.note;
  const loginLink = dbProduct.loginLink || staticProduct?.loginLink;
  const logoUrl = proxyImg(dbProduct.image) || staticProduct?.logoUrl;

  // Plans: prefer DB variations (live stock)
  type Plan = { label: string; price: number; originalPrice?: number; highlight?: boolean; variationId?: string; outOfStock?: boolean };
  const plans: Plan[] = (dbProduct.variations && dbProduct.variations.length > 0)
    ? dbProduct.variations.map((v) => ({
        label: v.label,
        price: v.price,
        originalPrice: v.originalPrice,
        highlight: v.highlight,
        variationId: v._id,
        outOfStock: v.stock === 0,
      }))
    : (staticProduct?.plans ?? []).map((p) => ({ label: p.label, price: p.price, highlight: p.highlight }));

  const productId = dbProduct._id;

  const otherProducts = await getOtherProducts(slug);

  const waMessage = encodeURIComponent(
    `Hi! I want to order *${dbProduct.name}* from Webcodoo. Please provide details.`
  );
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

  return (
    <div
      className="min-h-screen overflow-x-hidden transition-colors duration-300"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, var(--grid-color) 1.2px, transparent 1.2px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] right-[-8%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 70%)" }} />
      </div>

      {/* Navbar */}
      <nav
        className="relative z-50 sticky top-0 backdrop-blur-xl"
        style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <Image src="/logo.png" alt="Webcodoo" width={150} height={50} className="h-10 w-auto object-contain" />
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-violet-50 dark:hover:bg-violet-950/40" style={{ color: "var(--text-secondary)" }}>
              Home
            </Link>
            <Link href="/#products" className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-violet-50 dark:hover:bg-violet-950/40" style={{ color: "var(--text-secondary)" }}>
              Shop
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <CartNavButton />
            <ThemeToggle />
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb85a] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              style={{ boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
            >
              <WaIconSm />
              WhatsApp
            </a>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span style={{ color: "var(--text-secondary)" }}>{dbProduct.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── LEFT ── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Header card */}
            <div
              className="rounded-3xl p-6 sm:p-8"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start gap-5 mb-5">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0 p-3`}>
                  {logoUrl ? (
                    <img src={logoUrl} alt={dbProduct.name} className="w-full h-full object-contain drop-shadow" />
                  ) : (
                    <span className="text-4xl">{icon}</span>
                  )}
                </div>
                <div>
                  {badge && (
                    <span
                      className="inline-block text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                    >
                      {badge}
                    </span>
                  )}
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1 text-violet-600">
                    {category}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                    {dbProduct.name}
                  </h1>
                  {tagline && (
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{tagline}</p>
                  )}
                </div>
              </div>
              {description && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {description}
                </p>
              )}
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div
                className="rounded-3xl p-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-violet-600" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>✓</span>
                  What&apos;s Included
                </h2>
                <ul className="space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Access method */}
            {accessMethod && (
              <div
                className="rounded-3xl p-6"
                style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}
              >
                <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span>🔑</span> How You Get Access
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{accessMethod}</p>
                {loginLink && (
                  <a
                    href={loginLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-blue-500 hover:text-blue-400 text-sm transition-colors"
                  >
                    🌐 {loginLink}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* Note */}
            {note && (
              <div
                className="rounded-3xl p-5 flex gap-3"
                style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.15)" }}
              >
                <span className="text-yellow-500 text-lg flex-shrink-0">⚠️</span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{note}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Pricing ── */}
          <div className="lg:col-span-2">
            <div
              className="rounded-3xl p-6 sticky top-24"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Choose a Plan</h2>

              <div className="space-y-3 mb-5">
                {plans.map((plan) => (
                  <div
                    key={plan.label}
                    className="hover-plan flex items-center justify-between p-4 rounded-2xl"
                    style={
                      plan.highlight
                        ? { background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)" }
                        : { background: "var(--bg-input)", border: "1px solid var(--border)" }
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {plan.label}
                      </span>
                      {plan.highlight && (
                        <span className="text-[9px] text-white px-2 py-0.5 rounded-full font-bold" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-extrabold text-violet-600">Rs. {plan.price.toLocaleString()}</div>
                        {plan.originalPrice && plan.originalPrice > plan.price && (
                          <div className="text-[10px] line-through" style={{ color: "var(--text-muted)" }}>Rs. {plan.originalPrice.toLocaleString()}</div>
                        )}
                      </div>
                      <AddToCartButton
                        productSlug={dbProduct.slug}
                        productName={dbProduct.name}
                        planLabel={plan.label}
                        price={plan.price}
                        productId={productId}
                        variationId={plan.variationId}
                        outOfStock={plan.outOfStock}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Buy Now CTA */}
              {(() => {
                const firstAvailable = plans.find((p) => !p.outOfStock);
                if (!firstAvailable) return (
                  <div className="w-full text-center py-4 rounded-2xl text-gray-400 text-sm font-medium" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                    All plans currently out of stock
                  </div>
                );
                return (
                  <AddToCartButton
                    productSlug={dbProduct.slug}
                    productName={dbProduct.name}
                    planLabel={firstAvailable.label}
                    price={firstAvailable.price}
                    productId={productId}
                    variationId={firstAvailable.variationId}
                    variant="buynow"
                  />
                );
              })()}

              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1fb85a] text-white font-bold py-3 rounded-2xl text-sm transition-colors mt-3"
                style={{ boxShadow: "0 6px 20px rgba(37,211,102,0.25)" }}
              >
                <WaIconMd />
                Order via WhatsApp
              </a>

              <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                Fast delivery · Secure · Trusted
              </p>

              <div className="flex justify-center gap-4 mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                {["⚡ Instant", "🔒 Safe", "💬 Support"].map((b) => (
                  <div key={b} className="text-xs" style={{ color: "var(--text-muted)" }}>{b}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Other products — fully DB-driven */}
        {otherProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Other Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {otherProducts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="hover-subcard group rounded-2xl p-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="relative w-10 h-10 mb-3 flex-shrink-0">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${p.color} blur-md opacity-50 scale-90`} />
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center p-1.5">
                      {p.image ? (
                        <img src={proxyImg(p.image)} alt={p.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-lg">{p.icon}</span>
                      )}
                    </div>
                  </div>
                  <div className="font-semibold text-sm group-hover:text-violet-600 transition-colors" style={{ color: "var(--text-primary)" }}>
                    {p.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {p.startingPrice > 0 ? `Rs. ${p.startingPrice.toLocaleString()}` : "View plans"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 text-center mt-10" style={{ borderTop: "1px solid var(--border)" }}>
        <Image src="/logo.png" alt="Webcodoo" width={120} height={40} className="h-8 w-auto object-contain mx-auto mb-3 opacity-60" />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Webcodoo · Premium Digital Subscriptions · Sri Lanka
        </p>
      </footer>
    </div>
  );
}
