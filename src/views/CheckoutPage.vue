<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const checkoutStep = ref('details')

const attendee = reactive({
  name: '',
  email: '',
  phone: ''
})

const selectedMethod = ref('card')

const orderRef = ref('')

const paymentMethods = [
  {
    id: 'card',
    label: 'Debit/Credit Card',
    icon: '💳'
  },
  {
    id: 'transfer',
    label: 'Bank Transfer',
    icon: '🏦'
  },
  {
    id: 'ussd',
    label: 'USSD',
    icon: '📱'
  }
]

const tickets = computed(() => {
  try {
    return JSON.parse(route.query.tickets || '[]')
  } catch {
    return []
  }
})

const subtotal = computed(() => {
  return tickets.value.reduce((sum, ticket) => {
    return sum + ticket.qty * ticket.price
  }, 0)
})

const serviceFee = computed(() => {
  return Math.round(subtotal.value * 0.05)
})

const total = computed(() => {
  return subtotal.value + serviceFee.value
})

const isAttendeeValid = computed(() => {
  return (
    attendee.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(attendee.email) &&
    attendee.phone.trim().length >= 7
  )
})

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount)
}

function goToPayment() {
  if (!isAttendeeValid.value) return

  checkoutStep.value = 'payment'
}

function processPayment() {
  checkoutStep.value = 'paymentId'

  setTimeout(() => {
    orderRef.value = 'TX-' + Math.random().toString(36).slice(2, 9).toUpperCase()

    checkoutStep.value = 'success'
  }, 2200)
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
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
        <!-- Left side -->
        <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
          <!-- Step indicator -->
          <div class="mb-8 flex items-center">
            <div class="flex items-center">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5a5f] text-sm font-bold text-white"
              >
                1
              </div>

              <span class="ml-3 text-sm font-semibold text-gray-900"> Your Details </span>
            </div>

            <div class="mx-4 h-px flex-1 bg-gray-200"></div>

            <div class="flex items-center">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-500"
              >
                2
              </div>

              <span class="ml-3 text-sm font-medium text-gray-400"> Payment </span>
            </div>
          </div>

          <div v-if="checkoutStep === 'details'">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Your details</h2>

              <p class="mt-1 text-sm text-gray-500">
                Enter your information to continue with payment.
              </p>
            </div>

            <form class="space-y-5" @submit.prevent="goToPayment">
              <!-- Name -->
              <div>
                <label for="name" class="mb-2 block text-sm font-semibold text-gray-700">
                  Full name
                </label>

                <input
                  id="name"
                  v-model="attendee.name"
                  type="text"
                  placeholder="Jane Doe"
                  class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff5a5f] focus:ring-4 focus:ring-[#ff5a5f]/10"
                />
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="mb-2 block text-sm font-semibold text-gray-700">
                  Email address
                </label>

                <input
                  id="email"
                  v-model="attendee.email"
                  type="email"
                  placeholder="jane@example.com"
                  class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff5a5f] focus:ring-4 focus:ring-[#ff5a5f]/10"
                />
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="mb-2 block text-sm font-semibold text-gray-700">
                  Phone number
                </label>

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

          <!-- Payment section -->
          <div v-else-if="checkoutStep === 'payment'">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Payment</h2>

              <p class="mt-1 text-sm text-gray-500">Select your preferred payment method.</p>
            </div>

            <div class="space-y-3">
              <button
                v-for="method in paymentMethods"
                :key="method.id"
                type="button"
                class="flex w-full items-center gap-4 rounded-xl border p-4 text-left transition"
                :class="
                  selectedMethod === method.id
                    ? 'border-[#ff5a5f] bg-red-50 ring-2 ring-[#ff5a5f]/10'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                "
                @click="selectedMethod = method.id"
              >
                <span class="text-2xl">
                  {{ method.icon }}
                </span>

                <span class="font-semibold text-gray-800">
                  {{ method.label }}
                </span>

                <span
                  class="ml-auto flex h-5 w-5 items-center justify-center rounded-full border"
                  :class="
                    selectedMethod === method.id
                      ? 'border-[#ff5a5f] bg-[#ff5a5f]'
                      : 'border-gray-300'
                  "
                >
                  <span
                    v-if="selectedMethod === method.id"
                    class="h-2 w-2 rounded-full bg-white"
                  ></span>
                </span>
              </button>
            </div>

            <!-- <button
              type="button"
              class="mt-7 w-full rounded-xl bg-[#ff5a5f] px-5 py-3.5 font-bold text-white transition hover:bg-[#e94b50]"
              @click="processPayment"
            >
              Pay {{ formatCurrency(total) }}
            </button> -->

            <!--Payment Section per id-->
            <button
              v-if="selectedMethod !== 'transfer'"
              type="button"
              class="mt-7 w-full rounded-xl bg-[#ff5a5f] px-5 py-3.5 font-bold text-white transition hover:bg-[#e94b50]"
              @click="processPayment"
            >
              Pay {{ formatCurrency(total) }}
            </button>

            <div v-else class="mt-7 overflow-hidden rounded-xl border border-[#d7e3e7]">
              <!-- Amount -->
              <div class="bg-[#e8f2f4] px-6 py-6 text-center">
                <p class="text-sm font-medium text-gray-500">Amount to Send</p>

                <div class="mt-3 flex items-center justify-center gap-2">
                  <p class="text-lg font-bold text-[#334155]">
                    {{ formatCurrency(total) }}
                  </p>

                  <button
                    type="button"
                    class="text-[#4d7c85] hover:text-[#2f5963]"
                    @click="copyText(total)"
                  >
                    📋
                  </button>
                </div>
              </div>

              <!-- Bank name -->
              <div class="bg-white px-6 py-5 text-center">
                <p class="text-xs font-medium text-gray-500">Bank Name</p>

                <p class="mt-3 text-sm font-bold text-[#315460]">78 FINANCE COMPANY LIMITED</p>
              </div>

              <!-- Account number -->
              <div class="border-t border-gray-100 bg-white px-6 py-6 text-center">
                <p class="text-xs font-medium text-gray-500">Account Number</p>

                <div class="mt-3 flex items-center justify-center gap-2">
                  <p class="text-3xl font-semibold tracking-wider text-[#263d46]">7530093169</p>

                  <button
                    type="button"
                    class="text-[#4d7c85] hover:text-[#2f5963]"
                    @click="copyText('7530093169')"
                  >
                    📋
                  </button>
                </div>
              </div>

              <!-- Expiry -->
              <div class="bg-[#f8fafb] px-5 py-5 text-center">
                <p class="text-sm font-medium leading-6 text-gray-600">
                  This account is going to expire in

                  <span class="font-bold text-[#315460]">
                    {{ formattedTime }}
                  </span>

                  make your payment before it expires
                </p>
              </div>

              <!-- Confirmation button -->
              <div class="bg-white px-4 pb-5">
                <button
                  type="button"
                  class="w-full rounded-md bg-gradient-to-r from-green-500 via-purple-700 to-cyan-600 px-4 py-4 text-sm font-bold text-white transition hover:opacity-90"
                  @click="processPayment"
                >
                  I'VE SENT THE MONEY ({{ formatCurrency(total) }})
                </button>
              </div>
            </div>

            <button
              type="button"
              class="mt-4 w-full py-2 text-sm font-semibold text-gray-500 hover:text-gray-900"
              @click="checkoutStep = 'details'"
            >
              Back to details
            </button>
          </div>

          <!-- Processing -->
          <!-- <div v-else-if="checkoutStep === 'processing'" class="py-20 text-center">
            <div
              class="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-[#ff5a5f]"
            ></div>

            <h2 class="mt-7 text-xl font-bold text-gray-900">Processing payment</h2>

            <p class="mt-2 text-sm text-gray-500">Please do not close this page.</p>
          </div> -->

          <!-- Success -->
          <!-- <div v-else-if="checkoutStep === 'success'" class="py-12 text-center">
            <div
              class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl font-bold text-green-600"
            >
              ✓
            </div>

            <h2 class="mt-6 text-2xl font-bold text-gray-900">Payment successful!</h2>

            <p class="mx-auto mt-3 max-w-md text-gray-500">
              Your tickets have been sent to
              <span class="font-semibold text-gray-700">
                {{ attendee.email }}
              </span>
            </p>

            <div
              class="mx-auto mt-6 inline-flex rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700"
            >
              Order reference: {{ orderRef }}
            </div>

            <button
              type="button"
              class="mx-auto mt-8 block rounded-xl bg-[#ff5a5f] px-8 py-3 font-bold text-white transition hover:bg-[#e94b50]"
              @click="goHome"
            >
              Done
            </button>
          </div> -->
        </section>

        <!-- Order summary -->
        <aside
          class="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-6"
        >
          <h2 class="text-lg font-bold text-gray-900">Order summary</h2>

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

              <p class="font-semibold text-gray-800">
                {{ formatCurrency(ticket.qty * ticket.price) }}
              </p>
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

            <div
              class="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900"
            >
              <span>Total</span>
              <span>{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <div
            class="mt-6 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-medium text-green-700"
          >
            <span>🔒</span>
            Your payment information is secure.
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>
