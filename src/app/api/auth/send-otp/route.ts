import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

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

async function sendWhatsAppOtp(phone: string, otp: string): Promise<boolean> {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE_NAME;
  if (!apiUrl || !apiKey || !instance) return false;

  const to = phone.replace(/\D/g, "");
  const message =
    `🔐 *Webcodoo Verification*\n\nYour login code is:\n\n*${otp}*\n\nThis code expires in 5 minutes.\nDo not share it with anyone.`;

  try {
    const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({
        number: to,
        options: { delay: 1200 },
        textMessage: { text: message },
      }),
    });
    const data = await res.json();
    return res.ok && !!data.key;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    const normalized = normalizePhone(phone);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const conn = await connectDB();
    const db = conn.connection.db!;

    // Upsert OTP (one per phone, replace previous)
    await db.collection("web_otps").replaceOne(
      { phone: normalized },
      { phone: normalized, otp, expiresAt, createdAt: new Date() },
      { upsert: true }
    );

    // Ensure TTL index exists (runs once, no-op if already set)
    await db.collection("web_otps").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});

    const sent = await sendWhatsAppOtp(normalized, otp);

    if (!sent) {
      // Dev fallback: log to console (remove in production)
      console.log(`[OTP] ${normalized} → ${otp}`);
    }

    return NextResponse.json({ success: true, dev: !sent ? otp : undefined });
  } catch (err) {
    console.error("send-otp error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
