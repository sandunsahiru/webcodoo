import mongoose, { Schema, Document, Model } from 'mongoose'

export type ProductRequestStatus = 'pending' | 'reviewing' | 'available' | 'unavailable'

export interface IProductRequest extends Document {
  productName: string
  subscriptionPeriod: number
  whatsapp: string
  status: ProductRequestStatus
  notes: string
  createdAt: Date
  updatedAt: Date
}

const ProductRequestSchema = new Schema<IProductRequest>(
  {
    productName:        { type: String, required: true, trim: true },
    subscriptionPeriod: { type: Number, required: true, min: 1 },
    whatsapp:           { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'available', 'unavailable'],
      default: 'pending',
    },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
)

ProductRequestSchema.index({ createdAt: -1 })
ProductRequestSchema.index({ status: 1 })

const ProductRequest: Model<IProductRequest> =
  mongoose.models.ProductRequest ||
  mongoose.model<IProductRequest>('ProductRequest', ProductRequestSchema)

export default ProductRequest
