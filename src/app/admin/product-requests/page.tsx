'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

interface ProductRequest {
  _id: string
  productName: string
  subscriptionPeriod: number
  whatsapp: string
  status: string
  notes: string
  createdAt: string
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending:     { label: 'Pending',     cls: 'bg-zinc-800 text-zinc-400' },
  reviewing:   { label: 'Reviewing',   cls: 'bg-yellow-500/15 text-yellow-400' },
  available:   { label: 'Available',   cls: 'bg-green-500/15 text-green-400' },
  unavailable: { label: 'Unavailable', cls: 'bg-red-500/15 text-red-400' },
}

const STATUS_LIST = ['pending', 'reviewing', 'available', 'unavailable']

function Badge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, cls: 'bg-zinc-800 text-zinc-400' }
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>
}

function RequestCard({ req, onUpdate }: {
  req: ProductRequest
  onUpdate: (id: string, status: string, notes: string) => void
}) {
  const [saving, setSaving]       = useState(false)
  const [notes, setNotes]         = useState(req.notes || '')
  const [showNote, setShowNote]   = useState(false)

  const changeStatus = async (status: string) => {
    if (req.status === status) return
    setSaving(true)
    try {
      const res = await fetch(`/api/product-requests/${req._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) onUpdate(req._id, status, req.notes)
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  const saveNotes = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/product-requests/${req._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (res.ok) { onUpdate(req._id, req.status, notes); setShowNote(false) }
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-white text-sm">{req.productName}</span>
            <Badge status={req.status} />
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="text-xs text-zinc-600">📅 {req.subscriptionPeriod} {req.subscriptionPeriod === 1 ? 'month' : 'months'}</span>
            <a
              href={`https://wa.me/${req.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#25D366] hover:underline"
            >
              📱 {req.whatsapp}
            </a>
            <span className="text-xs text-zinc-600">
              🗓 {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          {req.notes && (
            <p className="text-xs text-zinc-600 mt-1.5 italic">Note: {req.notes}</p>
          )}
        </div>
      </div>

      {/* Status buttons */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {STATUS_LIST.map(s => (
          <button
            key={s}
            disabled={saving || req.status === s}
            onClick={() => changeStatus(s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              req.status === s
                ? `${STATUS_META[s].cls} border-current`
                : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-700 hover:text-zinc-400'
            }`}
          >
            {STATUS_META[s].label}
          </button>
        ))}
        <button
          onClick={() => setShowNote(v => !v)}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition"
        >
          {showNote ? 'Cancel' : req.notes ? 'Edit Note' : '+ Note'}
        </button>
      </div>

      {showNote && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Internal note…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={saveNotes}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminProductRequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/product-requests')
      if (res.ok) setRequests(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpdate = (id: string, status: string, notes: string) => {
    setRequests(prev => prev.map(r => r._id === id ? { ...r, status, notes } : r))
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

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
            <h1 className="text-lg font-bold text-white">Product Requests</h1>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{requests.length}</span>
          </div>
          <Link
            href="/product-requests"
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
          {[
            { key: 'all',         label: `All (${requests.length})` },
            { key: 'pending',     label: `Pending (${requests.filter(r => r.status === 'pending').length})` },
            { key: 'reviewing',   label: `Reviewing (${requests.filter(r => r.status === 'reviewing').length})` },
            { key: 'available',   label: `Available (${requests.filter(r => r.status === 'available').length})` },
            { key: 'unavailable', label: `Unavailable (${requests.filter(r => r.status === 'unavailable').length})` },
          ].map(f => (
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
            <p className="text-zinc-600 text-sm">No product requests found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => (
              <RequestCard key={req._id} req={req} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
