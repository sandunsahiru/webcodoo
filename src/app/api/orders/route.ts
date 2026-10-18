import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/orderModel";
import { sendTelegramMessage } from "@/lib/telegram";

function genOrderId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WCD-${rand}`;
}

/**
 * Normalize phone to E.164 (+CCXXXXXXXXX).
 * Rules (applied in order):
 *  1. Already has +  → strip spaces/dashes only, keep as-is
 *  2. Starts with 00 → replace 00 with +
 *  3. Known country-code prefix without + (94, 44, 61, 1, 49, 33, 91…)
 *     → add +
 *  4. Starts with 0, 10 digits total → Sri Lanka  (+94 + 9 digits)
 *  5. Starts with 0, 11 digits total → UK         (+44 + 10 digits)
 *  6. Starts with 04, 10 digits     → Australia   (+61 + 9 digits)
 *  7. 9 digits (no leading 0)       → Sri Lanka   (+94 + 9 digits)
 *  8. 10 digits (no leading 0)      → US/Canada   (+1 + 10 digits)
 *  9. Anything else                 → return cleaned as-is
 */
function normalizePhone(raw: string): string {
  const trimmed = raw.trim();

  // Already international
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");

  const digits = trimmed.replace(/\D/g, "");

  // 00-prefixed international dialing code
  if (digits.startsWith("00") && digits.length > 4) return `+${digits.slice(2)}`;

  // Explicit country code without + — match by known prefixes
  const knownPrefixes: [string, number][] = [
    ["94",  11], // Sri Lanka  (+94 + 9)
    ["44",  12], // UK         (+44 + 10)
    ["61",  11], // Australia  (+61 + 9)
    ["49",  12], // Germany    (+49 + 10)
    ["33",  11], // France     (+33 + 9)
    ["91",  12], // India      (+91 + 10)
    ["1",   11], // US/Canada  (+1  + 10)
  ];
  for (const [cc, len] of knownPrefixes) {
    if (digits.startsWith(cc) && digits.length === len) return `+${digits}`;
  }

  // Leading 0 — country determined by total length
  if (digits.startsWith("0")) {
    if (digits.length === 10) {
      // Could be Sri Lanka (07X…) or Australia (04X…)
      // Australian mobiles start with 04
      if (digits.startsWith("04")) return `+61${digits.slice(1)}`;
      return `+94${digits.slice(1)}`; // default → Sri Lanka
    }
    if (digits.length === 11) return `+44${digits.slice(1)}`; // UK  (07xxx = 11 digits with 0)
    if (digits.length === 12) return `+49${digits.slice(1)}`; // Germany (German mobile with 0)
  }

  // No leading 0, no country code detected
  if (digits.length === 9)  return `+94${digits}`;  // Sri Lankan local without 0
  if (digits.length === 10) return `+1${digits}`;   // US/Canada 10-digit

  // Unknown / already has enough info — just clean it
  return digits ? `+${digits}` : trimmed;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { phone, name, notes, items, posCustomerId } = body;

    if (!phone || !name || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalize phone to +94XXXXXXXXX
    const normalizedPhone = normalizePhone(phone);

    const total = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * (i.qty ?? 1), 0);
    const orderId = genOrderId();

    // Register new customer in POS customers collection if needed
    let resolvedCustomerId = posCustomerId;
    try {
      const conn = await connectDB();
      const db = conn.connection.db!;
      if (!posCustomerId) {
        const result = await db.collection("customers").insertOne({
          name,
          customer_name: name,
          phone: normalizedPhone,
          mobile: normalizedPhone,
          source: "webcodoo",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        resolvedCustomerId = result.insertedId.toString();
      }
    } catch (err) {
      console.error("customer sync error", err);
    }

    // Single insert — Order model writes to `orders` collection with source:"webcodoo"
    const order = await Order.create({
      orderId,
      phone: normalizedPhone,
      name,
      customer_name: name,
      notes,
      items: items.map((i: { productName: string; planLabel: string; price: number; qty: number }) => ({
        productSlug: "",
        productName: i.productName,
        planLabel: i.planLabel,
        price: i.price,
        qty: i.qty ?? 1,
        name: i.productName,
        plan: i.planLabel,
        subtotal: i.price * (i.qty ?? 1),
      })),
      total,
      totalAmount: total,
      posCustomerId: resolvedCustomerId,
      source: "webcodoo",
      status: "pending_payment",
    });

    // Send Telegram notification
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (chatId) {
      const itemLines = items
        .map((i: { productName: string; planLabel: string; price: number; qty: number }) =>
          `  • ${i.productName} - ${i.planLabel} × ${i.qty ?? 1} = Rs. ${(i.price * (i.qty ?? 1)).toLocaleString()}`)
        .join("\n");

      const notesLine = notes ? `\n📝 Note: ${notes}` : "";
      const msg = `🛒 <b>NEW ORDER</b> #${orderId}\n\n` +
        `👤 ${name}\n📱 ${phone}\n💰 <b>Total: Rs. ${total.toLocaleString()}</b>\n\n` +
        `📦 Items:\n${itemLines}${notesLine}\n\n` +
        `💳 Awaiting bank payment\n⏰ ${new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}`;

      await sendTelegramMessage(chatId, msg).catch(console.error);
    }

    return NextResponse.json({ orderId, total, id: order._id });
  } catch (err) {
    console.error("create order error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
