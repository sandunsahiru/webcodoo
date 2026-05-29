import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ProductRequest from '@/lib/models/ProductRequest'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const request = await ProductRequest.findByIdAndDelete(id)
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()

    const update: Record<string, unknown> = {}
    if (body.status !== undefined) update.status = body.status
    if (body.notes  !== undefined) update.notes  = body.notes

    const request = await ProductRequest.findByIdAndUpdate(id, update, { new: true })
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(request)
  } catch {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
