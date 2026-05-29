'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

interface Concern {
  _id: string
  productName: string
  boughtDate: string
  paidAmount: number
  whatsapp: string
  issue: string
  status: string
  refundRequested: boolean
  createdAt: string
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  submitted:        { label: 'Submitted',                 cls: 'bg-blue-500/15 text-blue-400' },
  reviewing:        { label: 'Started Reviewing',         cls: 'bg-yellow-500/15 text-yellow-400' },
  processing:       { label: 'Processing',                cls: 'bg-orange-500/15 text-orange-400' },
  pending_supplier: { label: 'Pending Supplier Response', cls: 'bg-purple-500/15 text-purple-400' },
  completed:        { label: 'Completed',                 cls: 'bg-green-500/15 text-green-400' },
}

function Badge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, cls: 'bg-zinc-800 text-zinc-400' }
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  )
}

const FILTERS = [
  { key: 'all',             label: 'All' },
  { key: 'submitted',       label: 'Submitted' },
  { key: 'reviewing',       label: 'Reviewing' },
  { key: 'processing',      label: 'Processing' },
  { key: 'pending_supplier',label: 'Pending Supplier' },
  { key: 'completed',       label: 'Completed' },
]

export default function AdminConcernsPage() {
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/concerns')
      if (res.ok) setConcerns(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'all' ? concerns : concerns.filter(c => c.status === filter)

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-zinc-500 hover:text-zinc-300 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-white">Reports &amp; Concerns</h1>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{concerns.length}</span>
          </div>
          <Link
            href="/concerns"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition border border-zinc-800 px-3 py-1.5 rounded-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Customer Form
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f.key
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  {concerns.filter(c => c.status === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-6 h-6 text-zinc-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">No concerns found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <Link
                key={c._id}
                href={`/admin/concerns/${c._id}`}
                className="block bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white text-sm">{c.productName}</span>
                      <Badge status={c.status} />
                      {c.refundRequested && (
                        <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">Refund Sent</span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-2">{c.issue}</p>
                    <div className="flex flex-wrap gap-3">
                      <span className="text-xs text-zinc-600">📱 {c.whatsapp}</span>
                      <span className="text-xs text-zinc-600">💰 Rs. {c.paidAmount.toLocaleString()}</span>
                      <span className="text-xs text-zinc-600">
                        🗓 {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
