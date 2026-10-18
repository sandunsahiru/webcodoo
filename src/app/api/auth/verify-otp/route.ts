import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { signSession, cookieOptions } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, name: providedName } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    const conn = await connectDB();
    const db = conn.connection.db!;

    // Verify OTP
    const record = await db.collection("web_otps").findOne({ phone: normalized });
    if (!record) {
      return NextResponse.json({ error: "No OTP found. Please request a new code." }, { status: 400 });
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
    }
    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    // OTP valid — delete it
    await db.collection("web_otps").deleteOne({ phone: normalized });

    // Look up or create customer
    const col = db.collection("customers");
    const d = normalized.replace(/\D/g, "");
    const variants = [normalized, d, `0${d.slice(-9)}`, `94${d.slice(-9)}`, `+94${d.slice(-9)}`];

    let customer = await col.findOne({
      $or: variants.flatMap(v => [{ phone: v }, { mobile: v }]),
    });

    let customerId: string;
    let resolvedName: string;

    if (customer) {
      customerId = customer._id.toString();
      resolvedName = customer.name ?? customer.customer_name ?? providedName ?? "";
      // Update lastLogin
      await col.updateOne({ _id: customer._id }, { $set: { lastLogin: new Date() } });
    } else {
      // New customer — create record
      const name = (providedName ?? "").trim();
      if (!name) {
        // Name required for new customers — ask the UI to collect it
        return NextResponse.json({ error: "name_required" }, { status: 400 });
      }
      const result = await col.insertOne({
        name,
        customer_name: name,
        phone: normalized,
        mobile: normalized,
        source: "webcodoo",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      customerId = result.insertedId.toString();
      resolvedName = name;
    }

    const token = await signSession({ sub: customerId, phone: normalized, name: resolvedName });
    const res = NextResponse.json({ success: true, name: resolvedName, isNew: !customer });
    res.cookies.set({ ...cookieOptions(), value: token });
    return res;
  } catch (err) {
    console.error("verify-otp error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
