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

function phoneVariants(phone: string): string[] {
  const d = phone.replace(/\D/g, "");
  return [phone, d, `0${d.slice(-9)}`, `94${d.slice(-9)}`, `+94${d.slice(-9)}`];
}

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const variants = phoneVariants(normalizedPhone);

    const conn = await connectDB();
    const db = conn.connection.db!;
    const col = db.collection("customers");

    const customer = await col.findOne({
      $or: variants.flatMap(v => [{ phone: v }, { mobile: v }]),
    });

    if (!customer) {
      return NextResponse.json({ error: "No account found. Please sign up first." }, { status: 404 });
    }
    if (!customer.password) {
      return NextResponse.json({ error: "no_password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    await col.updateOne({ _id: customer._id }, { $set: { lastLogin: new Date() } });

    const name = customer.name ?? customer.customer_name ?? "";
    const token = await signSession({ sub: customer._id.toString(), phone: normalizedPhone, name });

    const res = NextResponse.json({ success: true, name });
    res.cookies.set({ ...cookieOptions(), value: token });
    return res;
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
