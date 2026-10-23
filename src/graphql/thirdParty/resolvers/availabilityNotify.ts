import storeConfig from 'discovery.config'

type SubscribeToAvailabilityArgs = {
  input: {
    email: string
    skuId: string
    sellerId?: string | null
    locale?: string | null
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SKU_ID = /^\d+$/

// Same mutation the app's own Store Framework block sends
const AVAILABILITY_SUBSCRIBE = `
  mutation AvailabilitySubscribe(
    $email: String
    $skuId: String
    $locale: String
    $sellerObj: SellerObjInputType!
  ) {
    availabilitySubscribe(
      email: $email
      skuId: $skuId
      locale: $locale
      sellerObj: $sellerObj
    ) @context(provider: "vtex.availability-notify")
  }
`

function getGraphQLEndpoint() {
  const { storeId, workspace } = storeConfig.api
  const host =
    workspace && workspace !== 'master'
      ? `${workspace}--${storeId}.myvtex.com`
      : `${storeId}.myvtex.com`

  return `https://${host}/_v/private/graphql/v1`
}

const availabilityNotifyResolver = {
  Mutation: {
    subscribeToAvailability: async (
      _: unknown,
      { input }: SubscribeToAvailabilityArgs
    ) => {
      const email = input.email.trim().toLowerCase()
      const skuId = input.skuId.trim()

      if (!EMAIL.test(email) || email.length > 254) {
        throw new Error('Invalid email')
      }

      if (!SKU_ID.test(skuId)) {
        throw new Error('Invalid SKU')
      }

      const response = await fetch(getGraphQLEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: AVAILABILITY_SUBSCRIBE,
          variables: {
            email,
            skuId,
            locale: input.locale ?? storeConfig.session.locale,
            sellerObj: {
              sellerId: input.sellerId ?? '1',
              sellerDefault: true,
            },
          },
        }),
      })

      const body = await response.json().catch(() => null)

      if (!response.ok || body?.errors?.length) {
        console.error(
          '[availability-notify] subscribe failed',
          response.status,
          JSON.stringify(body?.errors ?? body)
        )
        throw new Error('Could not register the notification request')
      }

      return body?.data?.availabilitySubscribe === true
    },
  },
}

export default availabilityNotifyResolver
