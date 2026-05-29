'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, use } from 'react'

interface Concern {
  _id: string
  productName: string
  boughtDate: string
  paidAmount: number
  whatsapp: string
  issue: string
  status: string
  feedback: string
  refundRequested: boolean
  createdAt: string
}

const STATUS_OPTIONS = [
  { value: 'submitted',        label: 'Submitted',                 dot: 'bg-blue-500' },
  { value: 'reviewing',        label: 'Started Reviewing',         dot: 'bg-yellow-500' },
  { value: 'processing',       label: 'Processing',                dot: 'bg-orange-500' },
  { value: 'pending_supplier', label: 'Pending Supplier Response', dot: 'bg-purple-500' },
  { value: 'completed',        label: 'Completed',                 dot: 'bg-green-500' },
]

const STATUS_RING: Record<string, string> = {
  submitted:        'border-blue-500/50 bg-blue-500/10 text-blue-300',
  reviewing:        'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
  processing:       'border-orange-500/50 bg-orange-500/10 text-orange-300',
  pending_supplier: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
  completed:        'border-green-500/50 bg-green-500/10 text-green-300',
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {msg}
    </div>
  )
}

export default function ConcernDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [concern, setConcern]         = useState<Concern | null>(null)
  const [loading, setLoading]         = useState(true)
  const [savingStatus, setSavingStatus]     = useState(false)
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [sendingRefund, setSendingRefund]   = useState(false)
  const [feedback, setFeedback]       = useState('')
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/concerns/${id}`)
      if (res.ok) {
        const data = await res.json()
        setConcern(data)
        setFeedback(data.feedback || '')
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const updateStatus = async (status: string) => {
    if (!concern || concern.status === status) return
    setSavingStatus(true)
    try {
      const res = await fetch(`/api/concerns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) { setConcern(await res.json()); showToast('Status updated') }
      else showToast('Failed to update status', 'error')
    } catch { showToast('Error', 'error') }
    finally { setSavingStatus(false) }
  }

  const saveFeedback = async () => {
    setSavingFeedback(true)
    try {
      const res = await fetch(`/api/concerns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      if (res.ok) showToast('Notes saved')
      else showToast('Failed to save', 'error')
    } catch { showToast('Error', 'error') }
    finally { setSavingFeedback(false) }
  }

  const sendRefund = async () => {
    if (!confirm('Send WhatsApp refund request to this customer?')) return
    setSendingRefund(true)
    try {
      const res = await fetch(`/api/concerns/${id}/refund-request`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        showToast('✓ Refund request sent via WhatsApp')
        setConcern(prev => prev ? { ...prev, refundRequested: true } : prev)
      } else {
        showToast(data.error || 'Failed to send', 'error')
      }
    } catch { showToast('Error sending message', 'error') }
    finally { setSendingRefund(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <svg className="animate-spin w-6 h-6 text-zinc-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  if (!concern) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Concern not found.</p>
          <Link href="/admin/concerns" className="text-blue-400 text-sm">← Back to list</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-8 pb-16">
      {toast && <Toast {...toast} />}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/concerns" className="text-zinc-500 hover:text-zinc-300 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-white flex-1">Concern Detail</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_RING[concern.status]}`}>
            {STATUS_OPTIONS.find(o => o.value === concern.status)?.label ?? concern.status}
          </span>
        </div>

        <div className="space-y-4">

          {/* Info card */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <p className="text-xs text-zinc-600 uppercase tracking-wide font-semibold mb-4">Customer Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-600 mb-0.5">Product</p>
                <p className="text-sm font-semibold text-white">{concern.productName}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-0.5">Paid Amount</p>
                <p className="text-sm font-semibold text-white">Rs. {concern.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-0.5">Bought Date</p>
                <p className="text-sm text-zinc-300">
                  {new Date(concern.boughtDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-0.5">Submitted</p>
                <p className="text-sm text-zinc-300">
                  {new Date(concern.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-zinc-600 mb-0.5">WhatsApp</p>
                <a
                  href={`https://wa.me/${concern.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#25D366] hover:underline font-medium"
                >
                  {concern.whatsapp}
                </a>
              </div>
            </div>
          </div>

          {/* Issue */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <p className="text-xs text-zinc-600 uppercase tracking-wide font-semibold mb-3">Customer Issue</p>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{concern.issue}</p>
          </div>

          {/* Status */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-zinc-600 uppercase tracking-wide font-semibold">Change Status</p>
              {savingStatus && <span className="text-xs text-zinc-600">Saving…</span>}
            </div>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateStatus(opt.value)}
                  disabled={savingStatus}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-left ${
                    concern.status === opt.value
                      ? `${STATUS_RING[opt.value]} border-current`
                      : 'border-zinc-800 bg-zinc-800/30 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${opt.dot}`} />
                  <span className="text-sm font-medium flex-1">{opt.label}</span>
                  {concern.status === opt.value && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Refund */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <p className="text-xs text-zinc-600 uppercase tracking-wide font-semibold mb-3">Refund</p>
            {concern.refundRequested ? (
              <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400 text-sm font-medium">Refund details requested — WhatsApp sent</span>
              </div>
            ) : (
              <div>
                <p className="text-zinc-500 text-sm mb-3 leading-relaxed">
                  Send a WhatsApp message to the customer asking for their bank details to process a refund of
                  {' '}<span className="text-white font-medium">Rs. {concern.paidAmount.toLocaleString()}</span>.
                </p>
                <button
                  onClick={sendRefund}
                  disabled={sendingRefund}
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
                >
                  {sendingRefund ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Request Refund Details via WhatsApp
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Admin notes */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <p className="text-xs text-zinc-600 uppercase tracking-wide font-semibold mb-3">Admin Notes / Feedback</p>
            <textarea
              rows={4}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Add internal notes about this concern…"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
            <button
              onClick={saveFeedback}
              disabled={savingFeedback}
              className="mt-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              {savingFeedback ? 'Saving…' : 'Save Notes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
