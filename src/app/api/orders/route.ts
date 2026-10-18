import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/orderModel";
import { sendTelegramMessage } from "@/lib/telegram";
import { ObjectId } from "mongodb";

function genOrderId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WCD-${rand}`;
}

// Normalize to +94XXXXXXXXX for Sri Lankan numbers
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("94") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+94${digits.slice(1)}`;
  if (digits.length === 9) return `+94${digits}`;
  // Already has + or unknown format — return as-is
  return phone.trim();
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

    const order = await Order.create({ orderId, phone: normalizedPhone, name, notes, items, total, posCustomerId, status: "pending_payment" });

    // Mirror order to POS + register new customer if not in POS
    try {
      const conn = await connectDB();
      const db = conn.connection.db!;

      let resolvedCustomerId = posCustomerId;

      // New customer — add to POS customers collection
      if (!posCustomerId) {
        const newCustomer = {
          name,
          customer_name: name,
          phone: normalizedPhone,
          mobile: normalizedPhone,
          source: "webcodoo",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await db.collection("customers").insertOne(newCustomer);
        resolvedCustomerId = result.insertedId.toString();
      }

      const posOrder: Record<string, unknown> = {
        orderId,
        source: "webcodoo",
        phone: normalizedPhone,
        customer_name: name,
        name,
        notes: notes ?? "",
        items: items.map((i: { productName: string; planLabel: string; price: number; qty: number }) => ({
          name: i.productName,
          plan: i.planLabel,
          price: i.price,
          qty: i.qty ?? 1,
          subtotal: i.price * (i.qty ?? 1),
        })),
        total,
        status: "pending_payment",
        payment_method: "bank_transfer",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (resolvedCustomerId) {
        try { posOrder.customer_id = new ObjectId(resolvedCustomerId); } catch { posOrder.customer_id = resolvedCustomerId; }
      }
      await db.collection("orders").insertOne(posOrder);
    } catch (posErr) {
      // Non-fatal — web order already saved
      console.error("POS sync error", posErr);
    }

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
