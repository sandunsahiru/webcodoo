'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  concerns:  { total: number; open: number }
  requests:  { total: number; pending: number }
}

export default function AdminHubPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/concerns').then(r => r.json()),
      fetch('/api/product-requests').then(r => r.json()),
    ]).then(([concerns, requests]) => {
      setStats({
        concerns: {
          total: Array.isArray(concerns) ? concerns.length : 0,
          open:  Array.isArray(concerns) ? concerns.filter((c: {status:string}) => c.status !== 'completed').length : 0,
        },
        requests: {
          total:   Array.isArray(requests) ? requests.length : 0,
          pending: Array.isArray(requests) ? requests.filter((r: {status:string}) => r.status === 'pending').length : 0,
        },
      })
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const cards = [
    {
      href: '/admin/concerns',
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: 'bg-orange-500/15',
      title: 'Reports & Concerns',
      desc: 'Review and manage customer complaints and issues.',
      statLabel: stats ? `${stats.concerns.open} open` : '…',
      statSub:   stats ? `${stats.concerns.total} total` : '',
      statColor: 'text-orange-400',
      formHref: '/concerns',
    },
    {
      href: '/admin/product-requests',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      iconBg: 'bg-blue-500/15',
      title: 'Product Requests',
      desc: 'See what products customers want you to stock.',
      statLabel: stats ? `${stats.requests.pending} pending` : '…',
      statSub:   stats ? `${stats.requests.total} total` : '',
      statColor: 'text-blue-400',
      formHref: '/product-requests',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-10">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Image src="/logo.png" alt="Webcodoo" width={120} height={40} className="h-10 w-auto object-contain" priority />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-zinc-500 text-sm mb-7">Manage customer reports and product requests.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(card => (
            <div key={card.href} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold text-sm">{card.title}</h2>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{card.desc}</p>
                  <p className={`text-sm font-bold mt-1.5 ${card.statColor}`}>
                    {card.statLabel}
                    {card.statSub && <span className="font-normal text-zinc-600 ml-1.5 text-xs">· {card.statSub}</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={card.href}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition"
                >
                  Open Dashboard
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href={card.formHref}
                  target="_blank"
                  className="flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium py-2.5 px-3 rounded-xl border border-zinc-700 transition"
                  title="Customer form link"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Form
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-700 text-xs mt-8">
          &copy; {new Date().getFullYear()} Webcodoo Admin
        </p>
      </div>
    </div>
  )
}
