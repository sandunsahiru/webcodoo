import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productSlug: string;
  productName: string;
  planLabel: string;
  price: number;
}

export interface IOrder extends Document {
  orderId: string;
  phone: string;
  name: string;
  items: IOrderItem[];
  total: number;
  status: "pending_payment" | "confirmed" | "delivered" | "cancelled";
  posCustomerId?: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productSlug: String,
  productName: String,
  planLabel: String,
  price: Number,
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, unique: true },
    phone: { type: String, index: true },
    name: String,
    items: [OrderItemSchema],
    total: Number,
    status: { type: String, default: "pending_payment" },
    posCustomerId: String,
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order ?? mongoose.model<IOrder>("Order", OrderSchema);
