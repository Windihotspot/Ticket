<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'

const route = useRoute()
const router = useRouter()

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const event = ref(null)
const eventLoading = ref(true)
const eventError = ref('')

// Same id used on the event page — keep these in sync
const eventId = '22222222-2222-2222-2222-222222222222'

async function loadEvent() {
  eventLoading.value = true
  eventError.value = ''

  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        partner_id,
        event_name,
        event_date,
        location,
        description,
        ticket_price,
        total_capacity,
        status
      `)
      .eq('id', eventId)
      .eq('status', 'active')
      .single()

    if (error) {
      throw error
    }

    event.value = data
  } catch (error) {
    console.error('Failed to load event:', error)
    eventError.value = 'Unable to load this event.'
  } finally {
    eventLoading.value = false
  }
}

onMounted(() => {
  loadEvent()
})

// ============================================================
// CONFIG
// ============================================================

const PAYMENT_INITIATE_URL = 'https://syaxbgcwixomicckmfwq.supabase.co/functions/v1/payment-inititate'

// ============================================================
// CHECKOUT STATE
// ============================================================

const checkoutStep = ref('details')
const loadingPayment = ref(false)
const paymentError = ref('')
const orderRef = ref('')
const paymentSessionId = ref('')
const transactionId = ref('')

// ============================================================
// CUSTOMER
// ============================================================

const attendee = reactive({
  name: '',
  email: '',
  phone: ''
})

// ============================================================
// TICKETS (selected on the event page, passed via the route)
// ============================================================

const tickets = computed(() => {
  try {
    const rawTickets = route.query.tickets

    if (!rawTickets) {
      return []
    }

    return JSON.parse(rawTickets)
  } catch (error) {
    console.error('Unable to parse tickets:', error)
    return []
  }
})

// ============================================================
// PRICING
// ============================================================

const subtotal = computed(() => {
  return tickets.value.reduce((sum, ticket) => {
    return sum + Number(ticket.qty || 0) * Number(ticket.price || 0)
  }, 0)
})

const serviceFee = computed(() => {
  return Math.round(subtotal.value * 0.05)
})

const total = computed(() => {
  return subtotal.value + serviceFee.value
})

// ============================================================
// VALIDATION
// ============================================================

const isAttendeeValid = computed(() => {
  return (
    attendee.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(attendee.email) &&
    attendee.phone.trim().length >= 7
  )
})

const canInitiatePayment = computed(() => {
  return (
    Boolean(event.value?.id) &&
    tickets.value.length > 0 &&
    isAttendeeValid.value &&
    total.value > 0
  )
})

// ============================================================
// FORMAT
// ============================================================

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatEventDate(date) {
  if (!date) return ''

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date))
}

// ============================================================
// GO TO PAYMENT
// ============================================================

function goToPayment() {
  if (!isAttendeeValid.value) {
    return
  }

  paymentError.value = ''
  checkoutStep.value = 'payment'
}

function backToDetails() {
  checkoutStep.value = 'details'
}

// ============================================================
// SAVE CHECKOUT STATE
// ============================================================

function saveCheckoutState() {
  const checkoutState = {
    eventId,
    attendee: {
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone
    },
    tickets: tickets.value,
    subtotal: subtotal.value,
    serviceFee: serviceFee.value,
    total: total.value
  }

  sessionStorage.setItem('quidly_checkout_state', JSON.stringify(checkoutState))
}

// ============================================================
// INITIATE QUIDLY PAYMENT
// ============================================================

async function processPayment() {
  if (!canInitiatePayment.value) {
    paymentError.value = 'Please complete your details before continuing.'
    checkoutStep.value = tickets.value.length === 0 ? 'details' : checkoutStep.value
    return
  }

  loadingPayment.value = true
  paymentError.value = ''
  checkoutStep.value = 'processing'

  saveCheckoutState()

  try {
    const customReference = `TICKET-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`

    const returnUrl = `${window.location.origin}/checkout/${event.value.id}?payment_return=true`

    const payload = {
      even_name: event.value.event_name,
      event_id: event.value.id,
      customer_email: attendee.email.trim().toLowerCase(),
      customer_name: attendee.name.trim(),
      customer_phone: attendee.phone.trim(),
      // Full order total (tickets x qty + service fee) — NOT the flat per-ticket price
      amount: total.value,
      currency: 'NGN',
      custom_reference: customReference,
      return_url: returnUrl,
      // Line-item detail so the backend/webhook can reconcile qty per tier
      metadata: {
        tickets: tickets.value,
        subtotal: subtotal.value,
        service_fee: serviceFee.value
      }
    }

    const response = await fetch(PAYMENT_INITIATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result?.error || 'Unable to initialize payment.')
    }

    if (!result.success || !result.data?.widget_url) {
      throw new Error(result?.error || 'Invalid payment initialization response.')
    }

    orderRef.value = result.data.reference
    paymentSessionId.value = result.data.session_id
    transactionId.value = result.data.transaction_id

    sessionStorage.setItem('quidly_payment', JSON.stringify(result.data))

    // Hands off to the Quidly widget
    window.location.href = result.data.widget_url
  } catch (error) {
    console.error('Payment initialization failed:', error)
    paymentError.value = error instanceof Error ? error.message : 'Unable to initialize payment.'
    checkoutStep.value = 'payment'
  } finally {
    loadingPayment.value = false
  }
}

// ============================================================
// PAYMENT RETURN HANDLING
// ============================================================

function handlePaymentReturn() {
  const paymentReturn = route.query.payment_return

  if (paymentReturn !== 'true') {
    return
  }

  const storedPayment = sessionStorage.getItem('quidly_payment')

  if (!storedPayment) {
    return
  }

  try {
    const payment = JSON.parse(storedPayment)

    orderRef.value = payment.reference || ''
    paymentSessionId.value = payment.session_id || ''
    transactionId.value = payment.transaction_id || ''
  } catch (error) {
    console.error('Unable to restore payment:', error)
  }

  /*
   * IMPORTANT:
   * Do NOT automatically mark the payment successful here.
   * The return URL only means the customer returned from the widget.
   * The transaction should be verified using the backend/webhook
   * before tickets are issued.
   */
  checkoutStep.value = 'processing'
}

onMounted(() => {
  handlePaymentReturn()
})

// ============================================================
// CANCELLED PAYMENT
// ============================================================

function cancelledPayment() {
  paymentError.value = ''
  checkoutStep.value = 'payment'
}

// ============================================================
// GO HOME
// ============================================================

function goHome() {
  sessionStorage.removeItem('quidly_checkout_state')
  sessionStorage.removeItem('quidly_payment')
  router.push('/ticketdemo')
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">

      <!-- HEADER -->
      <div class="mb-8 flex items-center justify-between">
        <button
          type="button"
          class="flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
          @click="router.back()"
        >
          <span class="text-xl">←</span>
          Back to event
        </button>

        <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">Checkout</h1>

        <div class="w-24"></div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">

        <!-- LEFT -->
        <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">

          <!-- STEP INDICATOR -->
          <div class="mb-8 flex items-center">
            <div class="flex items-center">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5a5f] text-sm font-bold text-white">
                1
              </div>
              <span class="ml-3 text-sm font-semibold text-gray-900">Your Details</span>
            </div>

            <div class="mx-4 h-px flex-1 bg-gray-200"></div>

            <div class="flex items-center">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full"
                :class="checkoutStep === 'payment' || checkoutStep === 'processing' ? 'bg-[#ff5a5f] text-white' : 'bg-gray-200 text-gray-500'"
              >
                2
              </div>
              <span
                class="ml-3 text-sm font-medium"
                :class="checkoutStep === 'payment' || checkoutStep === 'processing' ? 'text-gray-900' : 'text-gray-400'"
              >
                Payment
              </span>
            </div>
          </div>

          <!-- DETAILS -->
          <div v-if="checkoutStep === 'details'">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Your details</h2>
              <p class="mt-1 text-sm text-gray-500">Enter your information to continue with payment.</p>
            </div>

            <form class="space-y-5" @submit.prevent="goToPayment">
              <div>
                <label for="name" class="mb-2 block text-sm font-semibold text-gray-700">Full name</label>
                <input
                  id="name"
                  v-model="attendee.name"
                  type="text"
                  placeholder="Jane Doe"
                  class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff5a5f] focus:ring-4 focus:ring-[#ff5a5f]/10"
                />
              </div>

              <div>
                <label for="email" class="mb-2 block text-sm font-semibold text-gray-700">Email address</label>
                <input
                  id="email"
                  v-model="attendee.email"
                  type="email"
                  placeholder="jane@example.com"
                  class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff5a5f] focus:ring-4 focus:ring-[#ff5a5f]/10"
                />
              </div>

              <div>
                <label for="phone" class="mb-2 block text-sm font-semibold text-gray-700">Phone number</label>
                <input
                  id="phone"
                  v-model="attendee.phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff5a5f] focus:ring-4 focus:ring-[#ff5a5f]/10"
                />
              </div>

              <button
                type="submit"
                :disabled="!isAttendeeValid"
                class="mt-4 w-full rounded-xl bg-[#ff5a5f] px-5 py-3.5 font-bold text-white transition hover:bg-[#e94b50] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Continue to payment
              </button>
            </form>
          </div>

          <!-- PAYMENT -->
          <div v-else-if="checkoutStep === 'payment'">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Payment</h2>
              <p class="mt-1 text-sm text-gray-500">Complete your payment securely with Quidly.</p>
            </div>

            <div v-if="paymentError" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <div class="flex gap-3">
                <span class="text-red-500">⚠</span>
                <div>
                  <p class="text-sm font-semibold text-red-800">Payment initialization failed</p>
                  <p class="mt-1 text-sm text-red-600">{{ paymentError }}</p>
                </div>
              </div>
            </div>

            <div class="overflow-hidden rounded-2xl border border-gray-200">
              <div class="bg-gradient-to-br from-purple-700 via-blue-700 to-cyan-600 px-6 py-7 text-white">
                <p class="text-sm font-medium text-white/70">Amount to pay</p>
                <p class="mt-2 text-3xl font-bold">{{ formatCurrency(total) }}</p>
                <p class="mt-2 text-xs text-white/60">Secure payment powered by Quidly</p>
              </div>

              <div class="bg-white p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Customer</span>
                    <span class="text-sm font-semibold text-gray-900">{{ attendee.name }}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Email</span>
                    <span class="max-w-[220px] truncate text-sm font-semibold text-gray-900">{{ attendee.email }}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Payment methods</span>
                    <span class="text-sm font-semibold text-gray-900">Card · Transfer · USSD</span>
                  </div>
                </div>

                <div class="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <span class="text-xl">🔒</span>
                  <p class="text-xs leading-5 text-gray-500">
                    Your payment information is securely handled by the Quidly Payment Widget.
                    Card details are not entered on this ticketing platform.
                  </p>
                </div>

                <button
                  type="button"
                  :disabled="loadingPayment"
                  class="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 px-5 py-4 font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="processPayment"
                >
                  <span
                    v-if="loadingPayment"
                    class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  ></span>
                  <span>
                    {{ loadingPayment ? 'Initializing Quidly...' : `Pay ${formatCurrency(total)} with Quidly` }}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 w-full rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              @click="backToDetails"
            >
              Back to details
            </button>
          </div>

          <!-- PROCESSING -->
          <div v-else-if="checkoutStep === 'processing'" class="py-20 text-center">
            <div class="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-[#ff5a5f]"></div>
            <h2 class="mt-7 text-xl font-bold text-gray-900">Processing payment</h2>
            <p class="mt-2 text-sm text-gray-500">Please do not close this page.</p>
            <p v-if="transactionId" class="mx-auto mt-5 max-w-md text-xs text-gray-400">
              Transaction: {{ transactionId }}
            </p>
          </div>

          <!-- SUCCESS -->
          <div v-else-if="checkoutStep === 'success'" class="py-12 text-center">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl font-bold text-green-600">
              ✓
            </div>
            <h2 class="mt-6 text-2xl font-bold text-gray-900">Payment successful!</h2>
            <p class="mx-auto mt-3 max-w-md text-gray-500">
              Your tickets have been sent to
              <span class="font-semibold text-gray-700">{{ attendee.email }}</span>
            </p>
            <div class="mx-auto mt-6 inline-flex rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700">
              Order reference: {{ orderRef }}
            </div>
            <button
              type="button"
              class="mx-auto mt-8 block rounded-xl bg-[#ff5a5f] px-8 py-3 font-bold text-white transition hover:bg-[#e94b50]"
              @click="goHome"
            >
              View ticket
            </button>
          </div>

          <!-- CANCELLED -->
          <div v-else-if="checkoutStep === 'cancelled'" class="py-12 text-center">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl text-red-500 ring-8 ring-red-50/50">
              ×
            </div>
            <h2 class="mt-6 text-2xl font-bold text-gray-900">Payment cancelled</h2>
            <p class="mx-auto mt-3 max-w-md text-gray-500">
              Your payment wasn't completed, and no money was charged.
            </p>
            <div class="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                class="rounded-xl bg-[#ff5a5f] px-7 py-3 font-bold text-white transition hover:bg-[#e94b50]"
                @click="checkoutStep = 'payment'"
              >
                Try payment again
              </button>
              <RouterLink
                to="/"
                class="rounded-xl border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Go back
              </RouterLink>
            </div>
          </div>
        </section>

        <!-- ORDER SUMMARY -->
        <aside class="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-6">
          <h2 class="text-lg font-bold text-gray-900">Order summary</h2>

          <div v-if="event" class="mt-5 rounded-xl bg-gray-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Event</p>
            <p class="mt-1 font-bold text-gray-900">{{ event.event_name }}</p>
            <p class="mt-1 text-sm text-gray-500">{{ event.location }}</p>
            <p class="mt-1 text-sm text-gray-500">{{ formatEventDate(event.event_date) }}</p>
          </div>

          <!-- Tickets (real line items selected on the event page) -->
          <div class="mt-6 space-y-4">
            <div
              v-for="ticket in tickets"
              :key="ticket.id"
              class="flex items-start justify-between gap-4"
            >
              <div>
                <p class="font-semibold text-gray-800">{{ ticket.qty }} × {{ ticket.name }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ formatCurrency(ticket.price) }} each</p>
              </div>
              <p class="font-semibold text-gray-800">{{ formatCurrency(ticket.qty * ticket.price) }}</p>
            </div>
          </div>

          <div class="my-6 border-t border-dashed border-gray-300"></div>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Service fee</span>
              <span>{{ formatCurrency(serviceFee) }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-medium text-green-700">
            <span>🔒</span>
            Secure payment powered by Quidly.
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>