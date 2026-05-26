'use client'

import { useState } from 'react'
import type { Guest, RSVPData } from '@/lib/sheets'

type Attendance = RSVPData['attendance']

interface MemberState {
  attendance: Attendance
  dietary: string
  allergies: string
  transport: string
}

interface RSVPFormProps {
  party: Guest[]
  existingRsvps: (RSVPData | null)[]
}

const ATTENDANCE_OPTIONS: { value: Attendance; label: string; emoji: string }[] = [
  { value: 'ceremony_and_reception', label: 'Ceremony & Reception', emoji: '🎉' },
  { value: 'ceremony_only',          label: 'Ceremony only',        emoji: '💐' },
  { value: 'not_coming',             label: "Can't make it",        emoji: '😢' },
]

function initMemberState(existing: RSVPData | null): MemberState {
  return {
    attendance: existing?.attendance ?? 'ceremony_and_reception',
    dietary:    existing?.dietary    ?? '',
    allergies:  existing?.allergies  ?? '',
    transport:  existing?.transport  ?? '',
  }
}

export default function RSVPForm({ party, existingRsvps }: RSVPFormProps) {
  const alreadySubmitted = existingRsvps.some((r) => r !== null)

  const [members, setMembers] = useState<MemberState[]>(
    () => party.map((_, i) => initMemberState(existingRsvps[i]))
  )
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [editing, setEditing] = useState(!alreadySubmitted)

  function updateMember(index: number, patch: Partial<MemberState>) {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...patch } : m))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')

    const submissions = party.map((guest, i) => ({
      guest_token: guest.token,
      attendance:  members[i].attendance,
      dietary:     members[i].dietary,
      allergies:   members[i].allergies,
      transport:   members[i].transport,
    }))

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions }),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus('done')
      setEditing(false)
    } catch {
      setStatus('error')
    }
  }

  // ── Success banner ──────────────────────────────────────────────────────────
  if (status === 'done' && !editing) {
    return (
      <main className="flex-1 bg-cream text-forest flex flex-col items-center justify-start px-5 py-16">
        <div className="w-full max-w-xl text-center space-y-4">
          <p className="font-serif text-5xl">🎊</p>
          <h1 className="font-serif text-3xl font-bold text-forest">
            You&rsquo;re all set!
          </h1>
          <p className="font-sans text-forest/70">
            We&rsquo;ve got your RSVP. See you soon!
          </p>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 font-sans text-sm text-terracotta underline underline-offset-2"
          >
            Need to make a change?
          </button>
        </div>
      </main>
    )
  }

  // ── Previously submitted, not currently editing ─────────────────────────────
  if (alreadySubmitted && !editing) {
    return (
      <main className="flex-1 bg-cream text-forest flex flex-col items-center justify-start px-5 py-16">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-serif text-3xl font-bold">Your RSVP</h1>
            <p className="font-sans text-sm text-forest/60">Already submitted</p>
          </div>

          {party.map((guest, i) => {
            const m = members[i]
            const option = ATTENDANCE_OPTIONS.find((o) => o.value === m.attendance)
            return (
              <div key={guest.token} className="bg-white rounded-2xl border border-forest/10 p-5 space-y-2">
                <p className="font-serif text-lg font-semibold">{guest.name}</p>
                <p className="font-sans text-sm text-forest/80">
                  {option?.emoji} {option?.label}
                </p>
                {m.dietary && (
                  <p className="font-sans text-sm text-forest/60">Dietary: {m.dietary}</p>
                )}
                {m.allergies && (
                  <p className="font-sans text-sm text-forest/60">Allergies: {m.allergies}</p>
                )}
                {m.transport && (
                  <p className="font-sans text-sm text-forest/60">Transport: {m.transport}</p>
                )}
              </div>
            )
          })}

          <div className="text-center">
            <button
              onClick={() => setEditing(true)}
              className="font-sans text-sm text-terracotta underline underline-offset-2"
            >
              Edit your RSVP
            </button>
          </div>
        </div>
      </main>
    )
  }

  const isParty = party.length > 1
  const guestLabel = isParty ? `${party.length} guests` : '1 guest'

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 bg-cream text-forest flex flex-col items-center justify-start px-5 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-8">
        {/* Page header */}
        <div className="text-center space-y-1">
          <h1 className="font-serif text-3xl font-bold">RSVP</h1>
        </div>

        {/* Party callout — only shown for groups */}
        {isParty && (
          <div className="rounded-2xl bg-mustard/20 border border-mustard/40 px-5 py-4 space-y-2">
            <p className="font-sans text-sm font-semibold text-forest">
              You&rsquo;re RSVPing for your whole group&nbsp;✏️
            </p>
            <ul className="space-y-0.5">
              {party.map((g) => (
                <li key={g.token} className="font-sans text-sm text-forest/80 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-forest/40 inline-block flex-shrink-0" />
                  {g.name}
                </li>
              ))}
            </ul>
            <p className="font-sans text-xs text-forest/50 pt-0.5">
              Fill in each person&rsquo;s details below, then hit submit once at the end.
            </p>
          </div>
        )}

        {/* One card per party member */}
        {party.map((guest, i) => (
          <MemberCard
            key={guest.token}
            guest={guest}
            index={i}
            total={party.length}
            state={members[i]}
            onChange={(patch) => updateMember(i, patch)}
          />
        ))}

        {/* Error */}
        {status === 'error' && (
          <p className="font-sans text-sm text-terracotta text-center">
            Something went wrong — please try again.
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full bg-forest text-cream font-sans font-medium rounded-full py-3.5 transition-opacity disabled:opacity-50"
        >
          {status === 'saving'
            ? `Saving for ${guestLabel}…`
            : alreadySubmitted
            ? `Update RSVP for ${guestLabel}`
            : `Submit RSVP for ${guestLabel}`}
        </button>

        {alreadySubmitted && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="font-sans text-sm text-forest/50 underline underline-offset-2"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </main>
  )
}

// ── Sub-component: one party member card ──────────────────────────────────────

interface MemberCardProps {
  guest: Guest
  index: number
  total: number
  state: MemberState
  onChange: (patch: Partial<MemberState>) => void
}

function MemberCard({ guest, index, total, state, onChange }: MemberCardProps) {
  const isAttending = state.attendance !== 'not_coming'

  return (
    <div className="bg-white rounded-2xl border border-forest/10 p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-serif text-xl font-semibold">{guest.name}</p>
        {total > 1 && (
          <span className="flex-shrink-0 font-sans text-xs text-forest/40 bg-forest/8 rounded-full px-2.5 py-1">
            {index + 1} / {total}
          </span>
        )}
      </div>

      {/* Attendance */}
      <fieldset className="space-y-2">
        <legend className="font-sans text-xs font-medium uppercase tracking-wide text-forest/50">
          Attendance
        </legend>
        <div className="flex flex-col gap-2">
          {ATTENDANCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                state.attendance === opt.value
                  ? 'border-forest bg-forest/5'
                  : 'border-forest/15 hover:border-forest/30'
              }`}
            >
              <input
                type="radio"
                name={`attendance-${guest.token}`}
                value={opt.value}
                checked={state.attendance === opt.value}
                onChange={() => onChange({ attendance: opt.value })}
                className="accent-forest"
              />
              <span className="font-sans text-sm">
                <span className="mr-1.5">{opt.emoji}</span>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Dietary & allergies — only shown if attending */}
      {isAttending && (
        <>
          <div className="space-y-1">
            <label
              htmlFor={`dietary-${guest.token}`}
              className="block font-sans text-xs font-medium uppercase tracking-wide text-forest/50"
            >
              Dietary preference
            </label>
            <input
              id={`dietary-${guest.token}`}
              type="text"
              placeholder="e.g. vegetarian, vegan, halal…"
              value={state.dietary}
              onChange={(e) => onChange({ dietary: e.target.value })}
              className="w-full rounded-xl border border-forest/15 bg-transparent px-4 py-2.5 font-sans text-sm placeholder:text-forest/30 focus:border-forest focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor={`allergies-${guest.token}`}
              className="block font-sans text-xs font-medium uppercase tracking-wide text-forest/50"
            >
              Allergies
            </label>
            <input
              id={`allergies-${guest.token}`}
              type="text"
              placeholder="e.g. nuts, shellfish, gluten…"
              value={state.allergies}
              onChange={(e) => onChange({ allergies: e.target.value })}
              className="w-full rounded-xl border border-forest/15 bg-transparent px-4 py-2.5 font-sans text-sm placeholder:text-forest/30 focus:border-forest focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor={`transport-${guest.token}`}
              className="block font-sans text-xs font-medium uppercase tracking-wide text-forest/50"
            >
              Transport needs <span className="normal-case text-forest/30">(optional)</span>
            </label>
            <input
              id={`transport-${guest.token}`}
              type="text"
              placeholder="e.g. need a lift from the city…"
              value={state.transport}
              onChange={(e) => onChange({ transport: e.target.value })}
              className="w-full rounded-xl border border-forest/15 bg-transparent px-4 py-2.5 font-sans text-sm placeholder:text-forest/30 focus:border-forest focus:outline-none"
            />
          </div>
        </>
      )}
    </div>
  )
}
