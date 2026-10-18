import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productSlug: string;
  productName: string;
  planLabel: string;
  price: number;
  qty: number;
  name?: string;
  plan?: string;
  subtotal?: number;
}

export interface IOrder extends Document {
  orderId: string;
  phone: string;
  name: string;
  notes?: string;
  items: IOrderItem[];
  total: number;
  totalAmount: number;
  status: "pending_payment" | "confirmed" | "delivered" | "cancelled";
  posCustomerId?: string;
  source: string;
  customer_name: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productSlug: String,
  productName: String,
  planLabel: String,
  price: Number,
  qty: { type: Number, default: 1 },
  name: String,
  plan: String,
  subtotal: Number,
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, unique: true },
    phone: { type: String, index: true },
    name: String,
    customer_name: String,
    notes: String,
    items: [OrderItemSchema],
    total: Number,
    totalAmount: Number,
    status: { type: String, default: "pending_payment" },
    posCustomerId: String,
    source: { type: String, default: "webcodoo" },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order ?? mongoose.model<IOrder>("Order", OrderSchema);
