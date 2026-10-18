import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/orderModel";
import { sendTelegramMessage } from "@/lib/telegram";

function genOrderId(): string {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WCD-${date}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { phone, name, items, posCustomerId } = body;

    if (!phone || !name || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const total = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * (i.qty ?? 1), 0);
    const orderId = genOrderId();

    const order = await Order.create({ orderId, phone, name, items, total, posCustomerId, status: "pending_payment" });

    // Send Telegram notification
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (chatId) {
      const itemLines = items
        .map((i: { productName: string; planLabel: string; price: number; qty: number }) =>
          `  • ${i.productName} - ${i.planLabel} × ${i.qty ?? 1} = Rs. ${(i.price * (i.qty ?? 1)).toLocaleString()}`)
        .join("\n");

      const msg = `🛒 <b>NEW ORDER</b> #${orderId}\n\n` +
        `👤 ${name}\n📱 ${phone}\n💰 <b>Total: Rs. ${total.toLocaleString()}</b>\n\n` +
        `📦 Items:\n${itemLines}\n\n` +
        `💳 Awaiting bank payment\n⏰ ${new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}`;

      await sendTelegramMessage(chatId, msg).catch(console.error);
    }

    return NextResponse.json({ orderId, total, id: order._id });
  } catch (err) {
    console.error("create order error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
