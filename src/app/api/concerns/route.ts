import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Concern from '@/lib/models/Concern'

export async function GET() {
  try {
    await connectDB()
    const concerns = await Concern.find().sort({ createdAt: -1 })
    return NextResponse.json(concerns)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch concerns' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { productName, boughtDate, paidAmount, whatsapp, issue } = await req.json()

    if (!productName || !boughtDate || paidAmount === undefined || !whatsapp || !issue) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const concern = await Concern.create({
      productName: productName.trim(),
      boughtDate:  new Date(boughtDate),
      paidAmount:  Number(paidAmount),
      whatsapp:    whatsapp.trim(),
      issue:       issue.trim(),
    })

    return NextResponse.json(concern, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create concern' }, { status: 500 })
  }
}
