import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Concern from '@/lib/models/Concern'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const concern = await Concern.findById(id)
    if (!concern) return NextResponse.json({ error: 'Concern not found' }, { status: 404 })

    const dateStr = new Date(concern.boughtDate).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

    const message =
      `Dear Customer,\n\n` +
      `We have reviewed your concern regarding your *${concern.productName}* subscription purchased on *${dateStr}*.\n\n` +
      `We would like to process a *refund* for you. To complete this, please reply with your bank details:\n\n` +
      `🏦 *Bank Name:*\n` +
      `💳 *Account Number:*\n` +
      `👤 *Account Holder Name:*\n` +
      `🏢 *Branch:*\n\n` +
      `We will process your refund as soon as we receive your details.\n\n` +
      `Thank you for your patience.\n` +
      `— *Webcodoo Team*`

    const result = await sendWhatsAppMessage(concern.whatsapp, message)

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Failed to send message' }, { status: 500 })
    }

    await Concern.findByIdAndUpdate(id, { refundRequested: true })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
