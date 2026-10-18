import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

function phoneVariants(phone: string): string[] {
  const d = phone.replace(/\D/g, "");
  return [phone, d, `0${d.slice(-9)}`, `94${d.slice(-9)}`, `+94${d.slice(-9)}`];
}

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone");
    if (!phone) return NextResponse.json({ found: false });

    const conn = await connectDB();
    const db = conn.connection.db!;
    const col = db.collection("customers");
    const variants = phoneVariants(phone);

    const customer = await col.findOne({
      $or: variants.flatMap(v => [{ phone: v }, { mobile: v }]),
    });

    if (!customer) return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      name: customer.name ?? customer.customer_name ?? "",
      hasPassword: !!customer.password,
    });
  } catch (err) {
    console.error("customer lookup error", err);
    return NextResponse.json({ found: false });
  }
}
