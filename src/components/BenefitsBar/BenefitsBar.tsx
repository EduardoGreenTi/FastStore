import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Icon as UIIcon } from '@faststore/ui'

import styles from './benefits-bar.module.scss'

interface Benefit {
  icon?: string
  text: string
}

interface Countdown {
  enabled?: boolean
  title?: string
  date?: string
  time?: string
  timeZone?: string
  // Legacy/advanced: full ISO 8601 date, used when `date` is empty
  endDate?: string
  finishedText?: string
}

type Variant = 'dark' | 'brand' | 'light' | 'highlight'

interface Appearance {
  variant?: Variant
  backgroundColor?: string
  textColor?: string
}

export interface BenefitsBarProps {
  benefits?: Benefit[]
  countdown?: Countdown
  appearance?: Appearance
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const DEFAULT_TIME_ZONE = 'America/Santiago'
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

// Offset (ms) between the given time zone and UTC at a given instant
function getTimeZoneOffset(timeZone: string, instant: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)

  const asUTC = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  )

  return asUTC - Math.floor(instant / 1_000) * 1_000
}

// Converts a wall-clock date/time in a time zone to a UTC timestamp (DST-aware)
function zonedTimeToTimestamp(date: string, time: string, timeZone: string) {
  const dateMatch = DATE.exec(date)
  const timeMatch = TIME.exec(time)

  if (!dateMatch || !timeMatch) return NaN

  const [, year, month, day] = dateMatch.map(Number)
  const [, hour, minute] = timeMatch.map(Number)
  const wallClock = Date.UTC(year, month - 1, day, hour, minute, 59)
  const parsed = new Date(wallClock)

  // Reject overflowing dates such as 2026-13-01 or 2026-02-30
  if (parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return NaN
  }

  try {
    const firstOffset = getTimeZoneOffset(timeZone, wallClock)
    const timestamp = wallClock - firstOffset
    const secondOffset = getTimeZoneOffset(timeZone, timestamp)

    return secondOffset === firstOffset ? timestamp : wallClock - secondOffset
  } catch {
    // Invalid time zone
    return NaN
  }
}

function getEndTime(countdown?: Countdown) {
  if (countdown?.date) {
    return zonedTimeToTimestamp(
      countdown.date,
      countdown.time || '23:59',
      countdown.timeZone || DEFAULT_TIME_ZONE
    )
  }

  return countdown?.endDate ? new Date(countdown.endDate).getTime() : NaN
}

function getTimeLeft(endTime: number): TimeLeft | null {
  const diff = endTime - Date.now()

  if (diff <= 0) return null

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1_000) % 60,
  }
}

// Computed only on the client to avoid SSR/hydration mismatches
function useCountdown(endTime: number) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (Number.isNaN(endTime)) return

    const tick = () => setTimeLeft(getTimeLeft(endTime))
    tick()

    const interval = setInterval(tick, 1_000)
    return () => clearInterval(interval)
  }, [endTime])

  return { timeLeft, isMounted }
}

function getColorStyle({ backgroundColor, textColor }: Appearance = {}) {
  const style: Record<string, string> = {}

  if (backgroundColor && HEX_COLOR.test(backgroundColor)) {
    style['--benefits-bar-bg'] = backgroundColor
  }

  if (textColor && HEX_COLOR.test(textColor)) {
    style['--benefits-bar-text'] = textColor
  }

  return style as CSSProperties
}

const pad = (value: number) => String(value).padStart(2, '0')

function BenefitsBar({
  benefits = [],
  countdown,
  appearance,
}: BenefitsBarProps) {
  const endTime = countdown?.enabled ? getEndTime(countdown) : NaN
  const isCountdownEnabled = !Number.isNaN(endTime)
  const { timeLeft, isMounted } = useCountdown(endTime)

  const isFinished = isCountdownEnabled && isMounted && !timeLeft
  const showCountdown =
    isCountdownEnabled && (!isFinished || Boolean(countdown?.finishedText))

  if (!benefits.length && !showCountdown) return null

  return (
    <section
      className={`section ${styles.benefitsBar}`}
      data-benefits-bar-variant={appearance?.variant ?? 'dark'}
      style={getColorStyle(appearance)}
    >
      <div className="layout__content" data-benefits-bar-content>
        {showCountdown && (
          <div data-benefits-bar-countdown aria-live="off">
            {isFinished ? (
              <span data-benefits-bar-countdown-title>
                {countdown?.finishedText}
              </span>
            ) : (
              <>
                {countdown?.title && (
                  <span data-benefits-bar-countdown-title>
                    {countdown.title}
                  </span>
                )}
                <span data-benefits-bar-timer>
                  {(
                    [
                      ['d', timeLeft?.days],
                      ['h', timeLeft?.hours],
                      ['m', timeLeft?.minutes],
                      ['s', timeLeft?.seconds],
                    ] as const
                  ).map(([unit, value]) => (
                    <span key={unit} data-benefits-bar-timer-unit>
                      {value === undefined ? '--' : pad(value)}
                      <small>{unit}</small>
                    </span>
                  ))}
                </span>
              </>
            )}
          </div>
        )}

        {benefits.length > 0 && (
          <ul data-benefits-bar-list>
            {benefits.map(({ icon, text }, index) => (
              <li key={`${text}-${index}`} data-benefits-bar-item>
                {icon && <UIIcon name={icon} width={18} height={18} />}
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default BenefitsBar
