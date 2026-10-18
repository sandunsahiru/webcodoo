import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import DashboardClient from "./DashboardClient";

interface OrderItem {
  productName: string;
  planLabel: string;
  price: number;
  qty: number;
}

export interface OrderRow {
  _id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  phone: string;
}

async function getOrders(phone: string): Promise<OrderRow[]> {
  try {
    const conn = await connectDB();
    const db = conn.connection.db!;
    const col = db.collection("orders");

    const d = phone.replace(/\D/g, "");
    const variants = [phone, d, `0${d.slice(-9)}`, `94${d.slice(-9)}`, `+94${d.slice(-9)}`];

    const docs = await col
      .find({ $or: variants.map(v => ({ phone: v })) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return docs.map(doc => ({
      _id: doc._id.toString(),
      orderId: doc.orderId ?? doc.order_id ?? "—",
      status: doc.status ?? "pending_payment",
      totalAmount: doc.totalAmount ?? doc.total_amount ?? 0,
      items: (doc.items ?? []).map((it: OrderItem) => ({
        productName: it.productName ?? "",
        planLabel: it.planLabel ?? "",
        price: it.price ?? 0,
        qty: it.qty ?? 1,
      })),
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      phone: doc.phone ?? "",
    }));
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/account");

  const orders = await getOrders(session.phone);

  return (
    <DashboardClient
      name={session.name}
      phone={session.phone}
      orders={orders}
    />
  );
}
