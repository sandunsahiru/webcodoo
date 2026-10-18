import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ProductRequest from '@/lib/models/ProductRequest'

export async function GET() {
  try {
    await connectDB()
    const requests = await ProductRequest.find().sort({ createdAt: -1 })
    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { productName, subscriptionPeriod, whatsapp } = await req.json()

    if (!productName || !subscriptionPeriod || !whatsapp) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const request = await ProductRequest.create({
      productName:        productName.trim(),
      subscriptionPeriod: Number(subscriptionPeriod),
      whatsapp:           whatsapp.trim(),
    })

    return NextResponse.json(request, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
