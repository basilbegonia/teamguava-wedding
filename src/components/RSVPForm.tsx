'use client'

import { useState } from 'react'
import type { Guest, RSVPData } from '@/lib/sheets'

type Attendance = RSVPData['attendance']

interface MemberState {
  attendance: Attendance
  dietary: string[]
  allergies: string
  transport: string
  transport_home: string
}

interface RSVPFormProps {
  party: Guest[]
  existingRsvps: (RSVPData | null)[]
}

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: 'ceremony_and_reception', label: 'Yes (ceremony + reception)' },
  { value: 'ceremony_only',          label: 'Yes (ceremony only)' },
  { value: 'not_coming',             label: 'Sorry, I can\'t go' },
]

const DIETARY_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Halal',
  'Gluten Free',
  'Dairy-free/Lactose free',
  'Nut free',
]

const TRANSPORT_OPTIONS = [
  'Yes, I\'d like some help',
  'No, but I need my own parking spot',
  'No, I got it (I\'m arranging my own transport/riding with someone)',
]

function initMemberState(existing: RSVPData | null): MemberState {
  return {
    attendance:     existing?.attendance ?? 'ceremony_and_reception',
    dietary:        existing?.dietary ? existing.dietary.split(', ').filter(Boolean) : [],
    allergies:      existing?.allergies ?? '',
    transport:      existing?.transport ?? '',
    transport_home: existing?.transport_home ?? '',
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
      name:           guest.name,
      attendance:     members[i].attendance,
      dietary:        members[i].dietary.join(', '),
      allergies:      members[i].allergies,
      transport:      members[i].transport,
      transport_home: members[i].transport_home,
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
      // Reveal the post-RSVP survey (hidden until now) and scroll to it.
      window.dispatchEvent(new Event('rsvp:submitted'))
      setTimeout(() => {
        document.getElementById('survey')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch {
      setStatus('error')
    }
  }

  const isParty = party.length > 1
  const guestLabel = isParty ? `${party.length} guests` : '1 guest'

  return (
    <div
      id="rsvp"
      className="bg-cream text-forest flex flex-col items-center justify-start px-5 py-16 min-h-[60svh]"
    >
      {/* ── Read-only summary (shown once RSVP'd, or right after submitting) ── */}
      {(alreadySubmitted || status === 'done') && !editing ? (
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-3xl font-bold">Your RSVP</h2>
            <p className="font-sans text-sm text-forest/60">Already submitted</p>
          </div>

          {party.map((guest, i) => {
            const m = members[i]
            const option = ATTENDANCE_OPTIONS.find((o) => o.value === m.attendance)
            return (
              <div key={guest.name} className="bg-white rounded-2xl border border-forest/10 p-5 space-y-2">
                <p className="font-serif text-lg font-semibold">{guest.name}</p>
                <p className="font-sans text-sm text-forest/80">{option?.label}</p>
                {m.dietary.length > 0 && (
                  <p className="font-sans text-sm text-forest/60">Dietary: {m.dietary.join(', ')}</p>
                )}
                {m.allergies && <p className="font-sans text-sm text-forest/60">Allergies: {m.allergies}</p>}
                {m.transport && <p className="font-sans text-sm text-forest/60">Transport help: {m.transport}</p>}
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

      ) : (
        /* ── Form ──────────────────────────────────────────────────────── */
        <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-3xl font-bold">RSVP</h2>
            <p className="font-sans text-base font-medium text-brown text-center">
              Please let us know if you can make it{' '}
              <span className="whitespace-nowrap">by August 30 🙂</span>
            </p>
          </div>

          {/* Party callout */}
          {isParty && (
            <div className="rounded-2xl bg-mustard/20 border border-mustard/40 px-5 py-4 space-y-2">
              <p className="font-sans text-sm font-semibold text-forest">
                You&rsquo;re RSVPing for your whole group&nbsp;✏️
              </p>
              <ul className="space-y-0.5">
                {party.map((g) => (
                  <li key={g.name} className="font-sans text-sm text-forest/80 flex items-center gap-2">
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

          {/* Member cards */}
          {party.map((guest, i) => (
            <MemberCard
              key={guest.name}
              guest={guest}
              index={i}
              total={party.length}
              state={members[i]}
              onChange={(patch) => updateMember(i, patch)}
            />
          ))}

          {status === 'error' && (
            <p className="font-sans text-sm text-terracotta text-center">
              Something went wrong — please try again.
            </p>
          )}

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
      )}
    </div>
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

  function toggleDietary(option: string) {
    const next = state.dietary.includes(option)
      ? state.dietary.filter((d) => d !== option)
      : [...state.dietary, option]
    onChange({ dietary: next })
  }

  return (
    <div className="bg-white rounded-2xl border border-forest/10 p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-serif text-xl font-semibold">{guest.name}</p>
        {total > 1 && (
          <span className="flex-shrink-0 font-sans text-xs text-forest/40 bg-forest/5 rounded-full px-2.5 py-1">
            {index + 1} / {total}
          </span>
        )}
      </div>

      {/* Attendance */}
      <fieldset className="space-y-2">
        <legend className="font-sans text-sm font-bold text-forest mb-3">
          Will you be able to come?
        </legend>
        <div className="flex flex-col gap-2">
          {ATTENDANCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="radio"
                name={`attendance-${index}`}
                value={opt.value}
                checked={state.attendance === opt.value}
                onChange={() => onChange({ attendance: opt.value })}
                className="accent-forest w-4 h-4 flex-shrink-0"
              />
              <span className="font-sans text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {isAttending && (
        <>
          {/* Dietary requirements */}
          <fieldset className="space-y-2">
            <legend className="font-sans text-sm font-bold text-forest mb-1">
              Dietary requirements
            </legend>
            <p className="font-sans text-xs text-forest/45 mb-3">Skip if none</p>
            <div className="flex flex-col gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.dietary.includes(opt)}
                    onChange={() => toggleDietary(opt)}
                    className="accent-forest w-4 h-4 flex-shrink-0 rounded"
                  />
                  <span className="font-sans text-sm">{opt}</span>
                </label>
              ))}
            </div>

            {/* Allergies free-text */}
            <div className="mt-3">
              <label className="font-sans text-sm text-forest/70 block mb-1.5">
                Allergies (please specify)
              </label>
              <input
                type="text"
                placeholder="e.g. peanuts, shellfish…"
                value={state.allergies}
                onChange={(e) => onChange({ allergies: e.target.value })}
                className="w-full rounded-xl border border-forest/15 bg-transparent px-4 py-2.5 font-sans text-base placeholder:text-forest/30 focus:border-forest focus:outline-none"
              />
            </div>
          </fieldset>

          {/* Transport help */}
          <fieldset className="space-y-2">
            <legend className="font-sans text-sm font-bold text-forest mb-3">
              Do you need help with arranging transport, to/from the church or reception?
            </legend>
            <div className="flex flex-col gap-2">
              {TRANSPORT_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`transport-${index}`}
                    value={opt}
                    checked={state.transport === opt}
                    onChange={() => onChange({ transport: opt })}
                    className="accent-forest w-4 h-4 flex-shrink-0"
                  />
                  <span className="font-sans text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </div>
  )
}
