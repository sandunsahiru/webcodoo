import mongoose, { Schema, Document, Model } from 'mongoose'

export type ConcernStatus =
  | 'submitted'
  | 'reviewing'
  | 'processing'
  | 'pending_supplier'
  | 'completed'

export interface IConcern extends Document {
  productName: string
  boughtDate: Date
  paidAmount: number
  whatsapp: string
  issue: string
  status: ConcernStatus
  feedback: string
  refundRequested: boolean
  createdAt: Date
  updatedAt: Date
}

const ConcernSchema = new Schema<IConcern>(
  {
    productName: { type: String, required: true, trim: true },
    boughtDate:  { type: Date,   required: true },
    paidAmount:  { type: Number, required: true, min: 0 },
    whatsapp:    { type: String, required: true, trim: true },
    issue:       { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['submitted', 'reviewing', 'processing', 'pending_supplier', 'completed'],
      default: 'submitted',
    },
    feedback:        { type: String, default: '', trim: true },
    refundRequested: { type: Boolean, default: false },
  },
  { timestamps: true }
)

ConcernSchema.index({ createdAt: -1 })
ConcernSchema.index({ status: 1 })

const Concern: Model<IConcern> =
  mongoose.models.Concern || mongoose.model<IConcern>('Concern', ConcernSchema)

export default Concern
