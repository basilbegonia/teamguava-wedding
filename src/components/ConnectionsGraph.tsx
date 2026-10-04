'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
} from 'd3-force'
import type { Connection } from '@/lib/sheets'

type GNode = SimulationNodeDatum & {
  id: string
  couple: boolean
  degree: number
}
type GEdge = {
  source: string
  target: string
  label: string
  detail: string
  side: string
  image_url: string
}

// Edge tint by whose side the connection belongs to.
const SIDE_COLOR: Record<string, string> = {
  bea: '#f19595', // blush
  basil: '#f1b964', // mustard
  both: '#ee8139', // terracotta
}
const EDGE_DEFAULT = 'rgba(77,87,63,0.28)' // forest @ 28%
const FOREST = '#4d573f'
const CREAM = '#fcf7ed'
const TERRACOTTA = '#ee8139'

const isCouple = (name: string) => {
  const n = name.trim().toLowerCase()
  return n === 'bea' || n === 'basil'
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function nodeRadius(n: GNode) {
  if (n.couple) return 28
  return clamp(12 + n.degree * 2, 12, 24)
}

export default function ConnectionsGraph({
  connections,
  viewerName,
}: {
  connections: Connection[]
  viewerName?: string
}) {
  // ── Build nodes + edges from the flat connection list ────────────────────
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, GNode>()
    const edges: GEdge[] = []
    for (const c of connections) {
      for (const name of [c.person_a, c.person_b]) {
        if (!nodeMap.has(name)) {
          nodeMap.set(name, { id: name, couple: isCouple(name), degree: 0 })
        }
      }
      nodeMap.get(c.person_a)!.degree++
      nodeMap.get(c.person_b)!.degree++
      edges.push({
        source: c.person_a,
        target: c.person_b,
        label: c.label,
        detail: c.detail,
        side: c.side,
        image_url: c.image_url,
      })
    }
    return { nodes: Array.from(nodeMap.values()), edges }
  }, [connections])

  // ── Container size ───────────────────────────────────────────────────────
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── Force layout (run headless to a stable layout) ───────────────────────
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (nodes.length === 0) {
      setPositions({})
      setReady(true)
      return
    }
    const simNodes: GNode[] = nodes.map((n) => ({ ...n }))
    const byId = new Map(simNodes.map((n) => [n.id, n]))
    const simLinks = edges
      .map((e) => ({ source: byId.get(e.source)!, target: byId.get(e.target)! }))
      .filter((l) => l.source && l.target)

    const sim = forceSimulation(simNodes)
      .force(
        'link',
        forceLink<GNode, { source: GNode; target: GNode }>(simLinks)
          .id((d) => d.id)
          .distance(84)
          .strength(0.35)
      )
      .force('charge', forceManyBody().strength(-280))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide<GNode>().radius((n) => nodeRadius(n) + 12))
      .stop()

    const ticks = Math.min(420, 140 + nodes.length * 4)
    for (let i = 0; i < ticks; i++) sim.tick()

    const pos: Record<string, { x: number; y: number }> = {}
    for (const n of simNodes) pos[n.id] = { x: n.x ?? 0, y: n.y ?? 0 }
    setPositions(pos)
    setReady(true)
  }, [nodes, edges])

  // ── Pan / zoom transform ─────────────────────────────────────────────────
  const [t, setT] = useState({ x: 0, y: 0, k: 1 })
  const svgRef = useRef<SVGSVGElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const pinchRef = useRef<{ dist: number; k: number; cx: number; cy: number; tx: number; ty: number } | null>(null)
  const movedRef = useRef(false)
  const userMovedRef = useRef(false)
  const fittedRef = useRef<string>('')
  const [fitted, setFitted] = useState(false)

  // Fit the graph to the viewport once positions + size are known (refit when
  // the data changes, but never override a pan/zoom the user has made).
  useEffect(() => {
    if (!ready || size.w === 0 || Object.keys(positions).length === 0) return
    const key = `${nodes.length}:${Math.round(size.w)}x${Math.round(size.h)}`
    if (fittedRef.current === key) return
    if (userMovedRef.current) {
      fittedRef.current = key
      setFitted(true)
      return
    }
    const xs = nodes.map((n) => positions[n.id]?.x ?? 0)
    const ys = nodes.map((n) => positions[n.id]?.y ?? 0)
    const pad = 60
    const minX = Math.min(...xs) - pad
    const maxX = Math.max(...xs) + pad
    const minY = Math.min(...ys) - pad
    const maxY = Math.max(...ys) + pad
    const bw = Math.max(1, maxX - minX)
    const bh = Math.max(1, maxY - minY)
    const k = clamp(Math.min(size.w / bw, size.h / bh), 0.3, 1.6)
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    setT({ x: size.w / 2 - cx * k, y: size.h / 2 - cy * k, k })
    fittedRef.current = key
    setFitted(true)
  }, [ready, size, positions, nodes])

  function rectPt(e: { clientX: number; clientY: number }) {
    const r = svgRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function onPointerDown(e: React.PointerEvent) {
    svgRef.current?.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    movedRef.current = false
    const pts = Array.from(pointers.current.values())
    if (pts.length === 2) {
      const [a, b] = pts
      const mid = rectPt({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 })
      pinchRef.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        k: t.k,
        cx: mid.x,
        cy: mid.y,
        tx: t.x,
        ty: t.y,
      }
      panRef.current = null
    } else if (pts.length === 1) {
      panRef.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y }
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = Array.from(pointers.current.values())
    if (pts.length >= 2 && pinchRef.current) {
      const [a, b] = pts
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const p = pinchRef.current
      const k = clamp((p.k * dist) / p.dist, 0.2, 4)
      setT({
        x: p.cx - (p.cx - p.tx) * (k / p.k),
        y: p.cy - (p.cy - p.ty) * (k / p.k),
        k,
      })
      movedRef.current = true
      userMovedRef.current = true
    } else if (pts.length === 1 && panRef.current) {
      const p = panRef.current
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      if (Math.abs(dx) + Math.abs(dy) > 6) {
        movedRef.current = true
        userMovedRef.current = true
      }
      setT((prev) => ({ ...prev, x: p.tx + dx, y: p.ty + dy }))
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchRef.current = null
    if (pointers.current.size === 0) panRef.current = null
  }

  // Wheel zoom (desktop) — needs a non-passive listener to preventDefault.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    function onWheel(ev: WheelEvent) {
      ev.preventDefault()
      const r = svg!.getBoundingClientRect()
      const px = ev.clientX - r.left
      const py = ev.clientY - r.top
      const factor = ev.deltaY < 0 ? 1.12 : 1 / 1.12
      userMovedRef.current = true
      setT((prev) => {
        const k = clamp(prev.k * factor, 0.2, 4)
        return {
          x: px - (px - prev.x) * (k / prev.k),
          y: py - (py - prev.y) * (k / prev.k),
          k,
        }
      })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  function zoomBy(factor: number) {
    userMovedRef.current = true
    setT((prev) => {
      const k = clamp(prev.k * factor, 0.2, 4)
      const cx = size.w / 2
      const cy = size.h / 2
      return {
        x: cx - (cx - prev.x) * (k / prev.k),
        y: cy - (cy - prev.y) * (k / prev.k),
        k,
      }
    })
  }

  // ── Selection ────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<string | null>(null)
  const viewerKey = (viewerName ?? '').trim().toLowerCase()

  const selectedEdges = useMemo(
    () =>
      selected
        ? edges.filter((e) => e.source === selected || e.target === selected)
        : [],
    [selected, edges]
  )

  function pickNode(id: string) {
    if (movedRef.current) return
    setSelected((s) => (s === id ? null : id))
  }

  // ── Search ───────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('')
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return nodes
      .filter((n) => n.id.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, nodes])

  // Select a person and pan/zoom so they sit in the upper-middle (clear of the
  // detail sheet that opens below).
  function focusNode(id: string) {
    const p = positions[id]
    setSelected(id)
    setQuery('')
    if (!p || size.w === 0) return
    userMovedRef.current = true
    setT((prev) => {
      const k = clamp(Math.max(prev.k, 1.2), 0.2, 4)
      return { x: size.w / 2 - p.x * k, y: size.h * 0.38 - p.y * k, k }
    })
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (ready && nodes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <p className="font-serif text-2xl font-bold">The web is empty… for now</p>
        <p className="mt-3 max-w-xs font-sans text-sm text-forest/60">
          Add rows to the <span className="font-semibold">Connections</span> tab in
          the Google Sheet — one per relationship — and they&rsquo;ll appear here.
        </p>
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="relative flex-1 overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Search + legend */}
      <div className="absolute left-3 right-16 top-3 z-30 flex flex-col gap-2 sm:right-auto sm:w-72">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matches[0]) focusNode(matches[0].id)
              if (e.key === 'Escape') setQuery('')
            }}
            placeholder="Search for a name…"
            aria-label="Search people"
            className="w-full rounded-full border border-forest/15 bg-cream/95 px-4 py-2 pr-9 font-sans text-sm text-forest shadow-sm backdrop-blur placeholder:text-forest/40 focus:border-forest focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-forest/50 hover:bg-forest/5"
            >
              ✕
            </button>
          ) : (
            <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          )}
          {matches.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-forest/10 bg-cream shadow-lg">
              {matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => focusNode(m.id)}
                  className="block w-full px-4 py-2 text-left font-sans text-sm text-forest/80 hover:bg-forest/5"
                >
                  {m.id}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pointer-events-none flex w-fit flex-wrap gap-x-3 gap-y-0.5 rounded-xl bg-cream/85 px-3 py-1.5 font-sans text-[11px] text-forest/70 shadow-sm backdrop-blur-sm">
          <Swatch color={SIDE_COLOR.bea} label="Bea's side" />
          <Swatch color={SIDE_COLOR.basil} label="Basil's side" />
          <Swatch color={SIDE_COLOR.both} label="both" />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-xl border border-forest/10 bg-cream/90 shadow-sm backdrop-blur-sm">
        <button onClick={() => zoomBy(1.25)} aria-label="Zoom in" className="h-9 w-9 font-sans text-lg text-forest/70 hover:bg-forest/5">+</button>
        <button onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out" className="h-9 w-9 border-t border-forest/10 font-sans text-lg text-forest/70 hover:bg-forest/5">−</button>
      </div>

      {!fitted && (
        <div className="absolute inset-0 flex items-center justify-center font-sans text-sm text-forest/50">
          laying out the web…
        </div>
      )}

      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (!movedRef.current) setSelected(null)
        }}
      >
        <g
          transform={`translate(${t.x},${t.y}) scale(${t.k})`}
          style={{ opacity: fitted ? 1 : 0, transition: 'opacity 0.25s ease' }}
        >
          {/* Edges */}
          {edges.map((e, i) => {
            const a = positions[e.source]
            const b = positions[e.target]
            if (!a || !b) return null
            const active = !selected || e.source === selected || e.target === selected
            const color = SIDE_COLOR[e.side] ?? EDGE_DEFAULT
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color}
                strokeWidth={selected && active ? 2.4 : 1.6}
                strokeOpacity={active ? 0.9 : 0.12}
                strokeLinecap="round"
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const p = positions[n.id]
            if (!p) return null
            const r = nodeRadius(n)
            const active = !selected || n.id === selected || selectedEdges.some((e) => e.source === n.id || e.target === n.id)
            const isSel = n.id === selected
            const isViewer = viewerKey && n.id.trim().toLowerCase() === viewerKey
            return (
              <g
                key={n.id}
                transform={`translate(${p.x},${p.y})`}
                style={{ cursor: 'pointer', opacity: active ? 1 : 0.2 }}
                onClick={(ev) => {
                  ev.stopPropagation()
                  pickNode(n.id)
                }}
              >
                {isSel && <circle r={r + 6} fill="none" stroke={TERRACOTTA} strokeWidth={2.5} />}
                {isViewer && !isSel && <circle r={r + 5} fill="none" stroke={TERRACOTTA} strokeWidth={1.5} strokeDasharray="3 3" />}
                <circle
                  r={r}
                  fill={n.couple ? FOREST : CREAM}
                  stroke={FOREST}
                  strokeWidth={n.couple ? 0 : 1.5}
                />
                {n.couple ? (
                  /* Couple nodes: name inside the filled circle */
                  <text
                    textAnchor="middle"
                    dy={4}
                    fontSize={13}
                    fontWeight={700}
                    fill={CREAM}
                    style={{ pointerEvents: 'none' }}
                    className="font-sans"
                  >
                    {n.id}
                  </text>
                ) : (
                  /* Guest nodes: name below the circle */
                  <text
                    y={r + 13}
                    textAnchor="middle"
                    className="font-sans"
                    fontSize={11}
                    fontWeight={500}
                    fill={FOREST}
                    stroke={CREAM}
                    strokeWidth={3}
                    paintOrder="stroke"
                    style={{ pointerEvents: 'none' }}
                  >
                    {n.id}
                    {isViewer ? ' (you)' : ''}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Detail sheet */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 z-20 max-h-[48%] overflow-y-auto rounded-t-2xl border-t border-forest/10 bg-cream shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="sticky top-0 flex items-center justify-between bg-cream px-5 py-3">
            <p className="font-serif text-lg font-bold">{selected}</p>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-forest/50 hover:bg-forest/5"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 px-5 pb-6">
            {selectedEdges.map((e, i) => {
              const other = e.source === selected ? e.target : e.source
              const color = SIDE_COLOR[e.side] ?? FOREST
              return (
                <div key={i} className="rounded-2xl border border-forest/10 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} />
                    <p className="font-sans text-sm">
                      <span className="text-forest/55">with </span>
                      <span className="font-semibold">{other}</span>
                    </p>
                  </div>
                  {e.label && <p className="mt-1.5 font-serif text-base font-bold">{e.label}</p>}
                  {e.detail && <p className="mt-0.5 font-sans text-sm text-forest/70">{e.detail}</p>}
                  {e.image_url &&
                    (e.image_url.startsWith('/') ? (
                      // Local (default /assets/connections) → Next image optimizer
                      // resizes + serves WebP/AVIF on deploy. width/height 0 with
                      // h-auto keeps the photo's natural aspect ratio (no crop).
                      <Image
                        src={e.image_url}
                        alt={`${selected} and ${other}`}
                        width={0}
                        height={0}
                        sizes="(max-width: 640px) 90vw, 360px"
                        className="mt-3 h-auto w-full rounded-xl"
                      />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={e.image_url}
                        alt={`${selected} and ${other}`}
                        className="mt-3 w-full rounded-xl"
                        loading="lazy"
                      />
                    ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
