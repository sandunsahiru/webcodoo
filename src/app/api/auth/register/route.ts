import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { signSession, cookieOptions } from "@/lib/auth";

function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  const d = trimmed.replace(/\D/g, "");
  if (d.startsWith("00") && d.length > 4) return `+${d.slice(2)}`;
  if (d.startsWith("94") && d.length === 11) return `+${d}`;
  if (d.startsWith("0") && d.length === 10) return d.startsWith("04") ? `+61${d.slice(1)}` : `+94${d.slice(1)}`;
  if (d.startsWith("0") && d.length === 11) return `+44${d.slice(1)}`;
  if (d.length === 9) return `+94${d}`;
  if (d.length === 10) return `+1${d}`;
  return d ? `+${d}` : trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, name, password } = await req.json();
    if (!phone || !name || !password) {
      return NextResponse.json({ error: "Phone, name and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const conn = await connectDB();
    const db = conn.connection.db!;
    const col = db.collection("customers");

    const existing = await col.findOne({
      $or: [{ phone: normalizedPhone }, { mobile: normalizedPhone }],
    });

    if (existing?.password) {
      return NextResponse.json({ error: "Account already exists. Please login." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);

    let customerId: string;
    if (existing) {
      // Add password to existing POS customer
      await col.updateOne({ _id: existing._id }, { $set: { password: hash, updatedAt: new Date() } });
      customerId = existing._id.toString();
    } else {
      // New customer
      const result = await col.insertOne({
        name,
        customer_name: name,
        phone: normalizedPhone,
        mobile: normalizedPhone,
        password: hash,
        source: "webcodoo",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      customerId = result.insertedId.toString();
    }

    const resolvedName = existing?.name ?? existing?.customer_name ?? name;
    const token = await signSession({ sub: customerId, phone: normalizedPhone, name: resolvedName });

    const res = NextResponse.json({ success: true, name: resolvedName });
    res.cookies.set({ ...cookieOptions(), value: token });
    return res;
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
