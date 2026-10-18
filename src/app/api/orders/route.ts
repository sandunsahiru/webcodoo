import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/orderModel";
import { sendTelegramMessage } from "@/lib/telegram";
import { ObjectId } from "mongodb";

function genOrderId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WCD-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { phone, name, notes, items, posCustomerId } = body;

    if (!phone || !name || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const total = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * (i.qty ?? 1), 0);
    const orderId = genOrderId();

    const order = await Order.create({ orderId, phone, name, notes, items, total, posCustomerId, status: "pending_payment" });

    // Mirror order to POS database orders collection
    try {
      const conn = await connectDB();
      const db = conn.connection.db!;
      const posOrder: Record<string, unknown> = {
        orderId,
        source: "webcodoo",
        phone,
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
      // Link to existing POS customer if we have their ID
      if (posCustomerId) {
        try { posOrder.customer_id = new ObjectId(posCustomerId); } catch { posOrder.customer_id = posCustomerId; }
      }
      await db.collection("orders").insertOne(posOrder);
    } catch (posErr) {
      // Non-fatal: web order already saved, just log the POS sync failure
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
