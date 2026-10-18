import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await connectDB();
    const db = conn.connection.db!;

    const products = await db
      .collection("products")
      .find({ showOnWebsite: true, isActive: { $ne: false } })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(products);
  } catch (err) {
    console.error("public products error", err);
    return NextResponse.json([], { status: 500 });
  }
}
