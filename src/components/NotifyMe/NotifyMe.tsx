import { useState } from 'react'
import type { FormEvent } from 'react'
import { usePDP } from '@faststore/core'
import { gql } from '@faststore/core/api'
import type {
  SubscribeToAvailabilityMutation,
  SubscribeToAvailabilityMutationVariables,
} from '@faststore/core/api'
import {
  useLazyQuery_unstable as useLazyQuery,
  useSession_unstable as useSession,
} from '@faststore/core/experimental'
import { Icon as UIIcon, OutOfStock as UIOutOfStock } from '@faststore/ui'

import styles from './notify-me.module.scss'

// gql must be at module scope so FastStore can extract the operation
export const mutation = gql(`
  mutation SubscribeToAvailability($input: AvailabilitySubscriptionInput!) {
    subscribeToAvailability(input: $input)
  }
`)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Replaces the disabled "not available" button on the PDP
function NotifyMe() {
  const context = usePDP()
  const product = context?.data?.product
  const { locale } = useSession()

  const [subscribe] = useLazyQuery<
    SubscribeToAvailabilityMutation,
    SubscribeToAvailabilityMutationVariables
  >(mutation, { input: { email: '', skuId: '', sellerId: null, locale: null } })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>(
    'idle'
  )
  const [error, setError] = useState('')

  const skuId = product?.sku
  const sellerId = product?.offers?.offers?.[0]?.seller?.identifier

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const email = String(
      new FormData(form).get('out-of-stock-email') ?? ''
    ).trim()

    if (!EMAIL.test(email)) {
      setError('Ingresa un correo válido')
      return
    }

    if (!skuId) return

    setError('')
    setStatus('loading')

    try {
      const result = await subscribe({
        input: { email, skuId, sellerId: sellerId ?? null, locale },
      })

      if (!result?.subscribeToAvailability) throw new Error()

      form.reset()
      setStatus('success')
    } catch {
      setError('No pudimos registrar tu solicitud. Intenta nuevamente.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.notifyMe} data-notify-me-success role="status">
        <UIIcon name="CircleWavyCheck" width={24} height={24} />
        <p>
          ¡Listo! Te enviaremos un correo cuando este producto vuelva a estar
          disponible.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.notifyMe}>
      <UIOutOfStock
        title="Producto sin stock"
        subtitle="Avísame cuando esté disponible"
        inputLabel="Correo electrónico"
        buttonLabel="Avisarme"
        loadingLabel="Enviando..."
        errorMessage={error}
        disabled={status === 'loading'}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NotifyMe
