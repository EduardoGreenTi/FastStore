import { useEffect, useState } from 'react'
import { Icon as UIIcon } from '@faststore/ui'

import styles from './benefits-bar.module.scss'

interface Benefit {
  icon?: string
  text: string
}

interface Countdown {
  enabled?: boolean
  title?: string
  endDate?: string
  finishedText?: string
}

export interface BenefitsBarProps {
  benefits?: Benefit[]
  countdown?: Countdown
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
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
function useCountdown(endDate?: string) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const endTime = endDate ? new Date(endDate).getTime() : NaN
    if (Number.isNaN(endTime)) return

    const tick = () => setTimeLeft(getTimeLeft(endTime))
    tick()

    const interval = setInterval(tick, 1_000)
    return () => clearInterval(interval)
  }, [endDate])

  return { timeLeft, isMounted }
}

const pad = (value: number) => String(value).padStart(2, '0')

function BenefitsBar({ benefits = [], countdown }: BenefitsBarProps) {
  const isCountdownEnabled = Boolean(countdown?.enabled && countdown.endDate)
  const { timeLeft, isMounted } = useCountdown(
    isCountdownEnabled ? countdown?.endDate : undefined
  )

  const isFinished = isCountdownEnabled && isMounted && !timeLeft
  const showCountdown =
    isCountdownEnabled && (!isFinished || Boolean(countdown?.finishedText))

  if (!benefits.length && !showCountdown) return null

  return (
    <section className={`section ${styles.benefitsBar}`}>
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
