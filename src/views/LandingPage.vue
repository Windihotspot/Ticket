<template>
  <div class="event-page">
    <!-- Banner -->
    <div class="banner">
      <img :src="event.bannerUrl" :alt="event.title" class="banner-img" />
      <div class="banner-overlay">
        <span class="badge">{{ event.category }}</span>
        <h1>{{ event.title }}</h1>
      </div>
    </div>

    <!-- <div>
      <h1 class="bg-red-500 font-black">HELLO WORLD</h1>
    </div> -->

    <div class="content">
      <!-- Left: details -->
      <div class="details">
        <div class="info-row">
          <div class="info-item">
            <span class="icon">📅</span>
            <div>
              <p class="label">Date</p>
              <p class="value">{{ event.date }} · {{ event.time }}</p>
            </div>
          </div>
          <div class="info-item">
            <span class="icon">📍</span>
            <div>
              <p class="label">Venue</p>
              <p class="value">{{ event.venue }}</p>
              <p class="sub">{{ event.address }}</p>
            </div>
          </div>
          <div class="info-item">
            <span class="icon">🎤</span>
            <div>
              <p class="label">Lineup</p>
              <p class="value">{{ event.lineup.join(', ') }}</p>
            </div>
          </div>
        </div>

        <h2>About this event</h2>
        <p class="description">{{ event.description }}</p>

        <h2>Organiser</h2>
        <div class="organiser">
          <img :src="event.organiser.logo" :alt="event.organiser.name" />
          <div>
            <p class="value">{{ event.organiser.name }}</p>
            <p class="sub">{{ event.organiser.eventsHosted }} events hosted</p>
          </div>
        </div>
      </div>

      <!-- Right: ticket selector -->
      <div class="ticket-card">
        <h3>Select Tickets</h3>

        <div
          v-for="tier in ticketTiers"
          :key="tier.id"
          class="ticket-tier"
          :class="{ 'sold-out': tier.soldOut }"
        >
          <div class="tier-info">
            <p class="tier-name">{{ tier.name }}</p>
            <p class="tier-desc">{{ tier.description }}</p>
            <p class="tier-price">{{ formatCurrency(tier.price) }}</p>
            <p v-if="tier.soldOut" class="sold-out-label">Sold Out</p>
            <p v-else-if="tier.remaining <= 20" class="low-stock">Only {{ tier.remaining }} left</p>
          </div>

          <div class="qty-control" v-if="!tier.soldOut">
            <button class="qty-btn" :disabled="getQty(tier.id) === 0" @click="decrement(tier.id)">
              −
            </button>
            <span class="qty-value">{{ getQty(tier.id) }}</span>
            <button
              class="qty-btn"
              :disabled="getQty(tier.id) >= tier.maxPerOrder"
              @click="increment(tier.id)"
            >
              +
            </button>
          </div>
        </div>

        <div class="summary" v-if="totalTickets > 0">
          <div class="summary-row">
            <span>Tickets ({{ totalTickets }})</span>
            <span>{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Service fee</span>
            <span>{{ formatCurrency(serviceFee) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ formatCurrency(total) }}</span>
          </div>
        </div>

        <button
          type="button"
          :disabled="totalTickets === 0"
          class="mt-5 w-full rounded-xl bg-[#ff5a5f] px-4 py-3 font-bold text-white transition hover:bg-[#e94b50] disabled:cursor-not-allowed disabled:bg-gray-300"
          @click="goToCheckout"
        >
          {{ totalTickets === 0 ? 'Select a ticket' : 'Get Tickets' }}
        </button>
      </div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

// ---------------------------------------------------------------------------
// Dummy event data — swap this out for real API data
// ---------------------------------------------------------------------------

const router = useRouter()

function goToCheckout() {
  if (totalTickets.value === 0) return

  router.push({
    name: 'checkout',
    query: {
      tickets: JSON.stringify(orderLines.value)
    }
  })
}

const event = reactive({
  title: 'Amber Skies Music Festival',
  category: 'Music Festival',
  date: 'Sat, 12 Sep 2026',
  time: '4:00 PM',
  venue: 'Landmark Beach Arena',
  address: 'Water Corporation Rd, Victoria Island, Lagos',
  lineup: ['Tems', 'Asake', 'Ayra Starr', 'DJ Spinall'],
  description:
    'Amber Skies returns for its third year with a full day of live performances across two stages, food trucks, art installations, and a sunset-to-midnight lineup of Afrobeats and alté acts. Bring your friends, your dancing shoes, and get ready for the biggest outdoor show of the year.',
  bannerUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=500&fit=crop',
  organiser: {
    name: 'Skyline Live Events',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=skyline',
    eventsHosted: 34
  }
})

const ticketTiers = reactive([
  {
    id: 'regular',
    name: 'Regular',
    description: 'General access to all stages',
    price: 15000,
    remaining: 400,
    maxPerOrder: 6,
    soldOut: false
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'Front-of-stage access + lounge + free drinks',
    price: 45000,
    remaining: 18,
    maxPerOrder: 4,
    soldOut: false
  },
  {
    id: 'vvip',
    name: 'VVIP Table',
    description: 'Private table for 4, backstage access',
    price: 180000,
    remaining: 0,
    maxPerOrder: 2,
    soldOut: true
  }
])

// ---------------------------------------------------------------------------
// Ticket quantity state
// ---------------------------------------------------------------------------
const quantities = ref({})

function getQty(tierId) {
  return quantities.value[tierId] || 0
}
function increment(tierId) {
  const tier = ticketTiers.find((t) => t.id === tierId)
  const current = getQty(tierId)
  if (current < tier.maxPerOrder) {
    quantities.value = { ...quantities.value, [tierId]: current + 1 }
  }
}
function decrement(tierId) {
  const current = getQty(tierId)
  if (current > 0) {
    quantities.value = { ...quantities.value, [tierId]: current - 1 }
  }
}

const totalTickets = computed(() => Object.values(quantities.value).reduce((sum, q) => sum + q, 0))

const orderLines = computed(() =>
  ticketTiers
    .filter((t) => getQty(t.id) > 0)
    .map((t) => ({ id: t.id, name: t.name, qty: getQty(t.id), price: t.price }))
)

const subtotal = computed(() => orderLines.value.reduce((sum, l) => sum + l.qty * l.price, 0))
const serviceFee = computed(() => Math.round(subtotal.value * 0.05))
const total = computed(() => subtotal.value + serviceFee.value)

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount)
}

// ---------------------------------------------------------------------------
// Checkout flow (simulated — no real payment provider wired up)
// ---------------------------------------------------------------------------
// const showCheckout = ref(false)
// const checkoutStep = ref('details') // details -> payment -> processing -> success
const attendee = reactive({ name: '', email: '', phone: '' })
const selectedMethod = ref('card')
const orderRef = ref('')

const paymentMethods = [
  { id: 'card', label: 'Debit/Credit Card', icon: '💳' },
  { id: 'transfer', label: 'Bank Transfer', icon: '🏦' },
  { id: 'ussd', label: 'USSD', icon: '📱' }
]

const isAttendeeValid = computed(
  () =>
    attendee.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(attendee.email) &&
    attendee.phone.trim().length >= 7
)

// function openCheckout() {
//   console.log('Opening checkout modal')
//   checkoutStep.value = 'details'
//   showCheckout.value = true
// }
// function closeCheckout() {
//   showCheckout.value = false
//   checkoutStep.value = 'details'
// }
// function goToPayment() {
//   if (!isAttendeeValid.value) return
//   checkoutStep.value = 'payment'
// }

// // Simulates handing off to a payment widget (e.g. Paystack/Flutterwave/Stripe)
// function launchPaymentWidget() {
//   checkoutStep.value = 'processing'

//   // Simulate network/payment provider latency
//   setTimeout(() => {
//     orderRef.value = 'TX-' + Math.random().toString(36).slice(2, 9).toUpperCase()
//     checkoutStep.value = 'success'

//     // Reset ticket quantities after a successful "purchase"
//     quantities.value = {}
//   }, 2200)
// }
</script>

<style scoped>
.event-page {
  max-width: 1100px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1a1a1a;
  padding-bottom: 4rem;
}

.banner {
  position: relative;
  height: 340px;
  border-radius: 12px;
  overflow: hidden;
  margin: 1.5rem 1.5rem 0;
}
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
  color: white;
}
.banner-overlay h1 {
  font-size: 2rem;
  margin: 0.5rem 0 0;
}
.badge {
  background: #ff5a5f;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.content {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2rem;
  padding: 2rem 1.5rem;
}
@media (max-width: 800px) {
  .content {
    grid-template-columns: 1fr;
  }
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1.25rem;
  background: #f7f7f9;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}
.info-item {
  display: flex;
  gap: 0.6rem;
  min-width: 180px;
}
.icon {
  font-size: 1.3rem;
}
.label {
  font-size: 0.75rem;
  color: #888;
  margin: 0;
}
.value {
  font-weight: 600;
  margin: 0.1rem 0;
}
.sub {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
}

.description {
  line-height: 1.6;
  color: #444;
}

.organiser {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.organiser img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.ticket-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 1.5rem;
  height: fit-content;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 1.5rem;
}
.ticket-card h3 {
  margin-top: 0;
}

.ticket-tier {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}
.ticket-tier.sold-out {
  opacity: 0.5;
}
.tier-name {
  font-weight: 700;
  margin: 0;
}
.tier-desc {
  font-size: 0.8rem;
  color: #888;
  margin: 0.15rem 0;
}
.tier-price {
  font-weight: 600;
  margin: 0.1rem 0 0;
}
.sold-out-label {
  color: #e74c3c;
  font-size: 0.75rem;
  font-weight: 600;
}
.low-stock {
  color: #e67e22;
  font-size: 0.75rem;
  font-weight: 600;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.qty-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  font-size: 1rem;
  cursor: pointer;
}
.qty-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.qty-value {
  min-width: 20px;
  text-align: center;
  font-weight: 600;
}

.summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin: 0.3rem 0;
  color: #555;
}
.summary-row.total {
  font-weight: 700;
  color: #1a1a1a;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.checkout-btn {
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.9rem;
  border: none;
  border-radius: 10px;
  background: #ff5a5f;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.15s;
}
.checkout-btn:disabled {
  background: #ddd;
  cursor: not-allowed;
}
.link-btn {
  width: 100%;
  margin-top: 0.6rem;
  padding: 0.6rem;
  border: none;
  background: transparent;
  color: #888;
  cursor: pointer;
}

/* Modal */
/* .modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}
.modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: #f0f0f0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.form-group input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.order-mini-summary {
  background: #f7f7f9;
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 1rem 0;
}
.payment-method {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 0.95rem;
  text-align: left;
}
.payment-method.active {
  border-color: #ff5a5f;
  background: #fff5f5;
}

.processing {
  text-align: center;
  padding: 2rem 0;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #ff5a5f;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success {
  text-align: center;
  padding: 1rem 0;
}
.success-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #2ecc71;
  color: white;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}
.order-ref {
  font-family: monospace;
  background: #f7f7f9;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: inline-block;
  margin: 0.8rem 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
} */
</style>
