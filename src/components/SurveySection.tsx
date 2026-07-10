'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const SNACKS = [
  { id: 'kikiam',        name: 'Kikiam',                img: '/assets/something-yummy/kikiam.webp' },
  { id: 'cheese-balls',  name: 'Cheese Balls',          img: '/assets/something-yummy/cheese-balls.webp' },
  { id: 'chorizo',       name: 'Chorizo & Kesong Puti', img: '/assets/something-yummy/chorizo-kesong-puti.webp' },
  { id: 'squid-balls',   name: 'Squid balls',           img: '/assets/something-yummy/squid-balls.webp' },
  { id: 'bicol-express', name: 'Bicol Express',         img: '/assets/something-yummy/bicol-express.webp' },
  { id: 'fish-balls',    name: 'Fish balls',            img: '/assets/something-yummy/fish-balls.webp' },
  { id: 'lumpiang',      name: 'Lumpiang Shanghai',     img: '/assets/something-yummy/lumpiang-shanghai.webp' },
  { id: 'crab-balls',    name: 'Crab balls',            img: '/assets/something-yummy/crab-balls.webp' },
]

type Step = 'landing' | 'yummy' | 'sweet' | 'spicy' | 'done'

async function postSurvey(step: string, response: unknown, anonymous = false) {
  const res = await fetch('/api/survey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, response, anonymous }),
  })
  if (!res.ok) throw new Error('Failed to save survey response')
}

export default function SurveySection({ rsvped }: { rsvped: boolean }) {
  const [step, setStep] = useState<Step>('landing')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  // Clear any save error whenever we move to a new step.
  useEffect(() => { setSaveError(false) }, [step])

  // Only show once the guest has an RSVP on record — or reveals it live when
  // they submit their RSVP in this session (RSVPForm fires "rsvp:submitted").
  const [revealed, setRevealed] = useState(rsvped)
  useEffect(() => {
    function onRsvp() { setRevealed(true) }
    window.addEventListener('rsvp:submitted', onRsvp)
    return () => window.removeEventListener('rsvp:submitted', onRsvp)
  }, [])

  // yummy
  const [selectedSnacks, setSelectedSnacks] = useState<string[]>([])

  // sweet
  const [memory, setMemory] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Revoke the object URL when it changes or the component unmounts.
  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }
  }, [imagePreview])

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setImageFile(f)
    setImagePreview(f ? URL.createObjectURL(f) : null)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // spicy
  const [question, setQuestion] = useState('')

  // "Other people's responses" — pulled semi-live from the Response highlights sheet.
  const [highlights, setHighlights] = useState<string[]>([])
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/highlights')
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.highlights)) setHighlights(data.highlights)
      } catch {
        /* ignore transient fetch errors */
      }
    }
    load()
    const id = setInterval(load, 45000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  function toggleSnack(id: string) {
    setSelectedSnacks((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  async function submitYummy() {
    setSaving(true)
    setSaveError(false)
    try {
      await postSurvey('yummy', {
        snacks: selectedSnacks.map((id) => SNACKS.find((s) => s.id === id)?.name ?? id),
      })
      setStep('sweet')
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  async function submitSweet() {
    setSaving(true)
    setSaveError(false)
    try {
      let imageUrl: string | undefined
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const res = await fetch('/api/survey/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Image upload failed')
        const data = await res.json()
        imageUrl = data.url
      }
      await postSurvey('sweet', { memory, image_url: imageUrl ?? null })
      setStep('spicy')
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  async function submitSpicy() {
    setSaving(true)
    setSaveError(false)
    try {
      await postSurvey('spicy', { question })
      setStep('done')
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  // Hidden until the guest has RSVP'd.
  if (!revealed) return null

  // ── Landing ───────────────────────────────────────────────────────────────
  if (step === 'landing') {
    return (
      <div
        id="survey"
        className="bg-cream text-forest py-20 px-5 min-h-[80svh] flex flex-col items-center justify-center text-center gap-6"
      >
        <p className="text-5xl">🎉</p>
        <h2 className="font-serif text-4xl font-bold">
          Thanks for <span className="whitespace-nowrap">RSVP-ing!</span>
        </h2>
        <p className="font-serif text-2xl font-bold text-terracotta leading-snug">
          Please help us make<br />our day extra special.
        </p>
        <button
          onClick={() => setStep('yummy')}
          className="mt-2 bg-forest text-cream font-sans font-medium rounded-full px-10 py-3"
        >
          Tara
        </button>
        <p className="font-sans text-sm text-forest/55 leading-snug max-w-xs">
          No rush — you can come back anytime with the same invite link. It stays
          valid, so feel free to finish later. 💚
        </p>
      </div>
    )
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div
        id="survey"
        className="bg-cream text-forest py-16 px-5 min-h-[50svh] flex flex-col items-center justify-center text-center"
      >
        <p className="font-serif text-5xl mb-4">🎉</p>
        <h2 className="font-serif text-2xl font-bold">Salamat!</h2>
        <p className="font-sans text-sm text-forest/60 mt-2">See you on Nov. 27!</p>
      </div>
    )
  }

  // ── Something Yummy ───────────────────────────────────────────────────────
  if (step === 'yummy') {
    return (
      <div id="survey" className="bg-cream text-forest py-16 px-5">
        <div className="max-w-sm mx-auto space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-bold">
              Something <span className="text-mustard">yummy</span>
            </h2>
            <p className="font-sans font-bold text-base mt-2">
              Vote for your top 3 favorite snacks!
            </p>
            <p className="font-sans text-sm text-forest/60">
              We&apos;ll serve the winners at the reception. 😄
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SNACKS.map((snack) => {
              const sel = selectedSnacks.includes(snack.id)
              return (
                <button
                  key={snack.id}
                  onClick={() => toggleSnack(snack.id)}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                    sel ? 'ring-4 ring-inset ring-white' : 'opacity-90'
                  }`}
                >
                  <Image
                    src={snack.img}
                    alt={snack.name}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <span className="font-sans text-[10px] font-bold text-white text-left leading-tight block">
                      {snack.name}
                    </span>
                  </div>
                  {sel && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-forest text-[9px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <p className="font-sans text-xs text-forest/50 text-center">
            {selectedSnacks.length}/3 selected
          </p>

          {saveError && (
            <p className="font-sans text-sm text-terracotta text-center">
              Couldn&apos;t save — please check your connection and try again.
            </p>
          )}

          <div className="flex gap-3">
            <button
              disabled={saving}
              onClick={() => setStep('sweet')}
              className="flex-1 bg-forest/15 text-forest font-sans font-medium rounded-full py-3 disabled:opacity-50"
            >
              Skip
            </button>
            <button
              disabled={saving}
              onClick={submitYummy}
              className="flex-1 bg-forest text-cream font-sans font-medium rounded-full py-3 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Something Sweet ───────────────────────────────────────────────────────
  if (step === 'sweet') {
    return (
      <div id="survey" className="bg-cream text-forest py-16 px-5">
        <div className="max-w-sm mx-auto space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-bold">
              Something <span className="text-blush">sweet</span>
            </h2>
            <p className="font-sans font-bold text-base mt-3 leading-snug">
              What is a favourite memory you have with us / either of us? Bakit mo siya favorite?
            </p>
          </div>

          <textarea
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            rows={6}
            className="w-full rounded-2xl border border-forest/20 bg-transparent px-4 py-3 font-sans text-base resize-none focus:border-forest focus:outline-none"
          />

          {/* File upload — hidden input triggered by the label */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={pickImage}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 font-sans text-sm text-forest/60"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {imageFile ? 'Change image' : 'Upload image (if any)'}
          </button>

          {/* Preview of the selected image */}
          {imagePreview && (
            <div className="relative w-full overflow-hidden rounded-2xl border border-forest/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Selected preview" className="w-full max-h-64 object-cover" />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center"
              >
                ✕
              </button>
              <p className="absolute bottom-0 inset-x-0 bg-black/45 text-white font-sans text-xs px-3 py-1.5 truncate">
                {imageFile?.name}
              </p>
            </div>
          )}

          {saveError && (
            <p className="font-sans text-sm text-terracotta text-center">
              Couldn&apos;t save — please check your connection and try again.
            </p>
          )}

          <div className="flex gap-3">
            <button
              disabled={saving}
              onClick={() => setStep('spicy')}
              className="flex-1 bg-forest/15 text-forest font-sans font-medium rounded-full py-3 disabled:opacity-50"
            >
              Skip
            </button>
            <button
              disabled={saving}
              onClick={submitSweet}
              className="flex-1 bg-forest text-cream font-sans font-medium rounded-full py-3 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Something Spicy ───────────────────────────────────────────────────────
  return (
    <div id="survey" className="bg-cream text-forest py-16 px-5">
      <div className="max-w-sm mx-auto space-y-6">
        <div>
          <h2 className="font-serif text-3xl font-bold">
            Something <span className="text-terracotta">spicy</span>
          </h2>
          <p className="font-sans font-bold text-base mt-3 leading-snug">
            Do you have a question you are curious about / want to ask us? 💀
          </p>
          <p className="font-sans text-sm text-forest/70 mt-2 leading-relaxed">
            Iho-hotseat kami sa reception. We will answer{' '}
            <span className="underline">any</span> question na mabubunot mula sa lahat ng
            questions na makuha namin dito: kahit serious, walang kwenta, s p i c y,
            intrusive, chismosa pa &apos;yan. HAHA
          </p>
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-forest/20 bg-transparent px-4 py-3 font-sans text-base resize-none focus:border-forest focus:outline-none"
        />

        {/* Other people's responses — pulled from the Response highlights sheet */}
        {highlights.length > 0 && (
          <div className="space-y-3">
            <p className="font-sans font-bold text-sm">Other people&apos;s responses</p>
            {highlights.map((text, i) => (
              <div key={i} className="border-l-2 border-terracotta pl-3">
                <p className="font-sans text-sm">{text}</p>
              </div>
            ))}
          </div>
        )}

        {saveError && (
          <p className="font-sans text-sm text-terracotta text-center">
            Couldn&apos;t save — please check your connection and try again.
          </p>
        )}

        <div className="flex gap-3">
          <button
            disabled={saving}
            onClick={() => setStep('done')}
            className="flex-1 bg-forest/15 text-forest font-sans font-medium rounded-full py-3 disabled:opacity-50"
          >
            Skip
          </button>
          <button
            disabled={saving}
            onClick={submitSpicy}
            className="flex-1 bg-forest text-cream font-sans font-medium rounded-full py-3 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
