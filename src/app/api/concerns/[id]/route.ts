import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Concern from '@/lib/models/Concern'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const concern = await Concern.findById(id)
    if (!concern) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(concern)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch concern' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const concern = await Concern.findByIdAndDelete(id)
    if (!concern) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete concern' }, { status: 500 })
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
    if (body.status   !== undefined) update.status   = body.status
    if (body.feedback !== undefined) update.feedback = body.feedback
    if (body.refundRequested !== undefined) update.refundRequested = body.refundRequested

    const concern = await Concern.findByIdAndUpdate(id, update, { new: true })
    if (!concern) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(concern)
  } catch {
    return NextResponse.json({ error: 'Failed to update concern' }, { status: 500 })
  }
}
