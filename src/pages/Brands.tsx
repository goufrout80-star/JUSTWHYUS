import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useMultiStepForm } from '../hooks/useMultiStepForm'
import { useDocumentHead } from '../hooks/useDocumentHead'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const VOID = '#0a0a0a'
const INK = '#0D1A14'

const ease: [number, number, number, number] = [0.76, 0, 0.24, 1]
const TOTAL = 6

const nicheOpts = ['AI Tools', 'SaaS Product', 'Filmmaking Gear', 'Productivity & Setup', 'Creative Software', 'Subscription Platform']
const budgetOpts = ['Under $1,000', '$1,000 – $5,000', '$5,000 – $15,000', '$15,000+']
const goalOpts = ['Brand Awareness', 'Product Launch', 'Lead Generation', 'Audience Growth']

export default function Brands() {
  useDocumentHead({
    title: 'For Brands — Request Campaign Access | JUST WHY US',
    description: 'Get access to a vetted creator network across AI, SaaS, filmmaking and more. Tell us your campaign goal and we handle the rest.',
    canonical: 'https://justwhyus.com/brands',
  })
  const f = useMultiStepForm(TOTAL)

  const handleSubmit = useCallback(async () => {
    f.setSubmitting(true)
    const { error } = await supabase.from('brand_requests').insert({
      company_name: f.answers.company_name?.trim() || '',
      niche: f.answers.niche || null,
      budget_range: f.answers.budget || null,
      campaign_goal: f.answers.goal || null,
      email: f.answers.email?.trim() || '',
      website: f.answers.website?.trim() || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    if (error) f.setError('Something went wrong. Try again.')
    else f.setSuccess()
  }, [f])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && f.currentStep > 0 && !f.isSuccess) f.prevStep()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [f])

  if (f.isSuccess) return <SuccessScreen />

  return (
    <div style={{ height: '100dvh', backgroundColor: VOID, overflow: 'hidden', position: 'relative' }}>
      <DotGrid />
      {f.currentStep > 0 && <TopBar step={f.currentStep} total={TOTAL} onBack={f.prevStep} accent={TEAL} />}

      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <AnimatePresence mode="wait">
          {f.currentStep === 0 && (
            <Step key="intro">
              <h1 className="font-brand" style={{ fontSize: 'clamp(40px,6vw,72px)', color: CREAM, lineHeight: 1.1 }}>
                Stop thinking about creators.
              </h1>
              <p className="font-italic" style={{ fontSize: 16, color: 'rgba(240,235,216,0.45)', marginTop: 12, lineHeight: 1.7 }}>
                We handle everything.<br />Answer 5 quick questions.
              </p>
              <Btn accent={TEAL} onClick={f.nextStep} label="LET'S GO" />
            </Step>
          )}

          {f.currentStep === 1 && (
            <Step key="s1">
              <Label text="Your company" accent={TEAL} />
              <Question text="What's your company called?" />
              <TextInput
                value={f.answers.company_name || ''}
                onChange={(v) => f.setAnswer('company_name', v)}
                placeholder="Company name..."
                accent={TEAL}
                onEnter={() => f.answers.company_name?.trim() && f.nextStep()}
                autoFocus
              />
              <Hint />
            </Step>
          )}

          {f.currentStep === 2 && (
            <Step key="s2">
              <Label text="Your niche" accent={TEAL} />
              <Question text="What do you sell?" />
              <OptionGrid
                options={nicheOpts}
                selected={f.answers.niche || ''}
                accent={TEAL}
                onSelect={(v) => { f.setAnswer('niche', v); setTimeout(f.nextStep, 200) }}
              />
            </Step>
          )}

          {f.currentStep === 3 && (
            <Step key="s3">
              <Label text="Your budget" accent={TEAL} />
              <Question text="What's your campaign budget?" />
              <OptionGrid
                options={budgetOpts}
                selected={f.answers.budget || ''}
                accent={TEAL}
                cols={2}
                onSelect={(v) => { f.setAnswer('budget', v); setTimeout(f.nextStep, 200) }}
              />
            </Step>
          )}

          {f.currentStep === 4 && (
            <Step key="s4">
              <Label text="Your goal" accent={TEAL} />
              <Question text="What do you need from this?" />
              <OptionGrid
                options={goalOpts}
                selected={f.answers.goal || ''}
                accent={TEAL}
                cols={2}
                onSelect={(v) => { f.setAnswer('goal', v); setTimeout(f.nextStep, 200) }}
              />
            </Step>
          )}

          {f.currentStep === 5 && (
            <Step key="s5">
              <Label text="Last thing" accent={TEAL} />
              <Question text="Where do we reach you?" />
              <TextInput
                value={f.answers.email || ''}
                onChange={(v) => f.setAnswer('email', v)}
                placeholder="your@email.com"
                accent={TEAL}
                autoFocus
              />
              <TextInput
                value={f.answers.website || ''}
                onChange={(v) => f.setAnswer('website', v)}
                placeholder="yoursite.com"
                accent={TEAL}
                onEnter={() => f.answers.email?.trim() && handleSubmit()}
                style={{ marginTop: 16 }}
              />
              {f.error && <ErrMsg msg={f.error} />}
              <Btn accent={TEAL} onClick={handleSubmit} label={f.isSubmitting ? 'SENDING...' : 'SUBMIT REQUEST'} disabled={f.isSubmitting || !f.answers.email?.trim()} />
            </Step>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SuccessScreen() {
  return (
    <div style={{ height: '100dvh', backgroundColor: VOID, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textAlign: 'center', padding: '0 24px' }}>
      <DotGrid />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} style={{ position: 'relative' }}>
        <motion.svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 24px' }}>
          <motion.path d="M20 6L9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} />
        </motion.svg>
        <h1 className="font-brand" style={{ fontSize: 'clamp(36px,5vw,56px)', color: CREAM }}>YOU&rsquo;RE IN THE QUEUE.</h1>
        <p className="font-italic" style={{ fontSize: 15, color: 'rgba(240,235,216,0.4)', marginTop: 12, lineHeight: 1.7 }}>We review every request manually.<br />If there&rsquo;s a fit — you&rsquo;ll hear from us.</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(240,235,216,0.18)', marginTop: 24 }}>NO CONFIRMATION EMAIL.<br />WE&rsquo;LL REACH OUT DIRECTLY.</p>
      </motion.div>
    </div>
  )
}

/* ━━━ SHARED UI COMPONENTS ━━━ */

function DotGrid() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none',
      }}
    />
  )
}

function TopBar({ step, total, onBack, accent }: { step: number; total: number; onBack: () => void; accent: string }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30, display: 'flex', alignItems: 'center', padding: '20px 32px', gap: 16 }}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', transition: 'opacity 200ms' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(240,235,216,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div style={{ flex: 1, height: 2, backgroundColor: INK, borderRadius: 1, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', backgroundColor: accent, borderRadius: 1 }}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 11, color: 'rgba(240,235,216,0.25)', whiteSpace: 'nowrap' }}>
        {step} / {total - 1}
      </span>
    </div>
  )
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ duration: 0.4, ease }}
      style={{ maxWidth: 640, width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function Label({ text, accent }: { text: string; accent: string }) {
  return (
    <p className="font-italic" style={{ fontSize: 12, color: `${accent}66`, marginBottom: 10 }}>
      {text}
    </p>
  )
}

function Question({ text }: { text: string }) {
  return (
    <h2 className="font-brand" style={{ fontSize: 'clamp(32px,5vw,56px)', color: CREAM, lineHeight: 1.1, marginBottom: 32 }}>
      {text}
    </h2>
  )
}

function TextInput({ value, onChange, placeholder, accent, onEnter, autoFocus, style: sx }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  accent: string
  onEnter?: () => void
  autoFocus?: boolean
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (autoFocus) setTimeout(() => ref.current?.focus(), 100) }, [autoFocus])

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
      placeholder={placeholder}
      style={{
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(240,235,216,0.2)',
        padding: '12px 0',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 24,
        color: CREAM,
        outline: 'none',
        transition: 'border-color 250ms',
        ...sx,
      }}
      onFocus={(e) => (e.currentTarget.style.borderBottomColor = accent)}
      onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'rgba(240,235,216,0.2)')}
    />
  )
}

function OptionGrid({ options, selected, accent, onSelect, cols = 3 }: {
  options: string[]
  selected: string
  accent: string
  onSelect: (v: string) => void
  cols?: number
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {options.map((o) => {
        const active = selected === o
        return (
          <motion.button
            key={o}
            onClick={() => onSelect(o)}
            style={{
              backgroundColor: active ? `${accent}1A` : INK,
              border: `1px solid ${active ? accent : '#0D1A14'}`,
              borderRadius: 4,
              padding: '16px 20px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: active ? accent : 'rgba(240,235,216,0.7)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 200ms',
            }}
            whileHover={{ borderColor: accent, color: CREAM }}
          >
            {o}
          </motion.button>
        )
      })}
    </div>
  )
}

function Btn({ accent, onClick, label, disabled }: { accent: string; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-brand"
      style={{
        marginTop: 32,
        fontSize: 16,
        letterSpacing: '0.12em',
        color: VOID,
        backgroundColor: accent,
        padding: '14px 48px',
        borderRadius: 3,
        border: 'none',
        cursor: disabled ? 'wait' : 'pointer',
        transition: 'all 250ms',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label} <span style={{ marginLeft: 8 }}>&rarr;</span>
    </button>
  )
}

function Hint() {
  return (
    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 11, color: 'rgba(240,235,216,0.2)', marginTop: 16 }}>
      Press Enter &crarr;
    </p>
  )
}

function ErrMsg({ msg }: { msg: string }) {
  return (
    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, color: '#FF5C38', marginTop: 12 }}>
      {msg}
    </p>
  )
}

