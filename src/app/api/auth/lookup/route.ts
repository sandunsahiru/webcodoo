import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    const conn = await connectDB();
    const db = conn.connection.db!;

    // Normalize phone: strip spaces/dashes, ensure starts with 0 or +94 or 94
    const normalized = phone.replace(/\D/g, "");
    const variants = [
      normalized,
      normalized.replace(/^0/, "94"),
      normalized.replace(/^94/, "0"),
      "0" + normalized.slice(-9),
      "94" + normalized.slice(-9),
    ];

    // Try to find customer in POS customers collection
    const customersCol = db.collection("customers");
    const customer = await customersCol.findOne({
      $or: variants.flatMap((v) => [
        { phone: v }, { mobile: v }, { contact: v },
        { phone: { $regex: v.slice(-9) } },
        { mobile: { $regex: v.slice(-9) } },
      ]),
    });

    // Get past POS purchases if customer found
    let posOrders: unknown[] = [];
    if (customer) {
      const ordersCol = db.collection("orders");
      posOrders = await ordersCol
        .find({ $or: [{ customer_id: customer._id }, { customerId: customer._id }, { phone: { $in: variants } }] })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
    }

    // Also get web orders
    const Order = mongoose.models.Order;
    const webOrders = Order
      ? await Order.find({ phone: { $in: variants } }).sort({ createdAt: -1 }).limit(10).lean()
      : [];

    return NextResponse.json({
      found: !!customer,
      customer: customer
        ? {
            id: customer._id?.toString(),
            name: customer.name ?? customer.customer_name ?? customer.fullName ?? "",
            phone: normalized,
          }
        : null,
      posOrders: posOrders.length,
      webOrders,
    });
  } catch (err) {
    console.error("lookup error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
