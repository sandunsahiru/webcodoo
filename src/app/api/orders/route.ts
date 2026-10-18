import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/orderModel";
import { sendTelegramMessage } from "@/lib/telegram";
import { ObjectId } from "mongodb";

function genOrderId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WCD-${rand}`;
}

/**
 * Normalize phone to E.164 (+CCXXXXXXXXX).
 */
function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00") && digits.length > 4) return `+${digits.slice(2)}`;
  const knownPrefixes: [string, number][] = [
    ["94", 11], ["44", 12], ["61", 11], ["49", 12], ["33", 11], ["91", 12], ["1", 11],
  ];
  for (const [cc, len] of knownPrefixes) {
    if (digits.startsWith(cc) && digits.length === len) return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    if (digits.length === 10) {
      if (digits.startsWith("04")) return `+61${digits.slice(1)}`;
      return `+94${digits.slice(1)}`;
    }
    if (digits.length === 11) return `+44${digits.slice(1)}`;
    if (digits.length === 12) return `+49${digits.slice(1)}`;
  }
  if (digits.length === 9) return `+94${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return digits ? `+${digits}` : trimmed;
}

interface OrderItem {
  productName: string;
  planLabel: string;
  price: number;
  qty?: number;
  productId?: string;
  variationId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const conn = await connectDB();
    const db = conn.connection.db!;
    const body = await req.json();
    const { phone, name, notes, items, posCustomerId } = body as {
      phone: string;
      name: string;
      notes?: string;
      items: OrderItem[];
      posCustomerId?: string;
    };

    if (!phone || !name || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check stock availability for tracked variations
    for (const item of items) {
      if (item.variationId && item.productId) {
        try {
          const available = await db.collection("products").findOne({
            _id: new ObjectId(item.productId),
            variations: {
              $elemMatch: {
                _id: new ObjectId(item.variationId),
                $or: [{ stock: { $gt: 0 } }, { stock: -1 }],
              },
            },
          });
          if (!available) {
            return NextResponse.json(
              { error: `"${item.productName}" (${item.planLabel}) is out of stock` },
              { status: 400 }
            );
          }
        } catch { /* invalid ObjectId — skip check */ }
      }
    }

    const normalizedPhone = normalizePhone(phone);
    const total = items.reduce((s, i) => s + i.price * (i.qty ?? 1), 0);
    const orderId = genOrderId();

    // Register new customer if needed
    let resolvedCustomerId = posCustomerId;
    if (!posCustomerId) {
      try {
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
      } catch (err) {
        console.error("customer sync error", err);
      }
    }

    // Create order
    const order = await Order.create({
      orderId,
      phone: normalizedPhone,
      name,
      customer_name: name,
      notes,
      items: items.map((i) => ({
        productSlug: "",
        productName: i.productName,
        planLabel: i.planLabel,
        price: i.price,
        qty: i.qty ?? 1,
        name: i.productName,
        plan: i.planLabel,
        subtotal: i.price * (i.qty ?? 1),
        productId: i.productId,
        variationId: i.variationId,
      })),
      total,
      totalAmount: total,
      posCustomerId: resolvedCustomerId,
      source: "webcodoo",
      status: "pending_payment",
    });

    // Create pending Sale records
    try {
      const saleDocs = items.map((i) => {
        const qty = i.qty ?? 1;
        const displayName = i.planLabel ? `${i.productName} (${i.planLabel})` : i.productName;
        const doc: Record<string, unknown> = {
          originalPrice: i.price,
          discount: 0,
          finalPrice: i.price * qty,
          saleDate: new Date(),
          isPaid: false,
          notificationSent: false,
          source: "webcodoo",
          webOrderId: orderId,
          productName: displayName,
          notes: `Web order ${orderId}${notes ? " — " + notes : ""}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        if (resolvedCustomerId) {
          try { doc.customer = new ObjectId(resolvedCustomerId); } catch { /* skip */ }
        }
        if (i.productId) {
          try { doc.product = new ObjectId(i.productId); } catch { /* skip */ }
        }
        return doc;
      });
      await db.collection("sales").insertMany(saleDocs);
    } catch (err) {
      console.error("sale sync error", err);
    }

    // Decrement stock for tracked variations (stock >= 0, not -1)
    for (const item of items) {
      if (item.variationId && item.productId) {
        try {
          await db.collection("products").updateOne(
            {
              _id: new ObjectId(item.productId),
              "variations._id": new ObjectId(item.variationId),
              "variations.stock": { $gt: 0 },
            },
            { $inc: { "variations.$.stock": -(item.qty ?? 1) } }
          );
        } catch { /* skip — invalid IDs or unlimited stock */ }
      }
    }

    // Telegram notification
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (chatId) {
      const itemLines = items
        .map((i) => `  • ${i.productName} - ${i.planLabel} × ${i.qty ?? 1} = Rs. ${(i.price * (i.qty ?? 1)).toLocaleString()}`)
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
