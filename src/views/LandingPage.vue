<template>
  <div class="event-page">
    <div v-if="eventLoading" class="state-msg">Loading event…</div>
    <div v-else-if="eventError" class="state-msg error">{{ eventError }}</div>

    <template v-else-if="event">
      <!-- Banner -->
      <div class="banner">
        <img :src="event.banner_url" :alt="event.event_name" class="banner-img" />
        <div class="banner-overlay">
          <span class="badge">Concert</span>
          <h1>{{ event.event_name }}</h1>
        </div>
      </div>

      <div class="content">
        <!-- Left: details -->
        <div class="details">
          <div class="info-row">
            <div class="info-item">
              <span class="icon">📅</span>
              <div>
                <p class="label">Date</p>
                <p class="value">{{ formatEventDate(event.event_date) }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icon">📍</span>
              <div>
                <p class="label">Venue</p>
                <p class="value">{{ event.location }}</p>
              </div>
            </div>
          </div>

          <h2>About this event</h2>
          <p class="description">{{ event.description }}</p>

          <h2 v-if="event.partners">Organiser</h2>
          <div v-if="event.partners" class="organiser">
            <div>
              <p class="value">{{ event.partners.business_name }}</p>
            </div>
          </div>
        </div>

        <!-- Right: ticket selector -->
        <div class="ticket-card">
          <h3>Select Tickets</h3>

          <div v-if="ticketTier" class="ticket-tier">
            <div class="tier-info">
              <p class="tier-name">{{ ticketTier.name }}</p>
              <p class="tier-desc">{{ ticketTier.description }}</p>
              <p class="tier-price">{{ formatCurrency(ticketTier.price) }}</p>
            </div>

            <div class="qty-control">
              <button class="qty-btn" :disabled="quantity === 0" @click="decrement">−</button>
              <span class="qty-value">{{ quantity }}</span>
              <button
                class="qty-btn"
                :disabled="quantity >= ticketTier.maxPerOrder"
                @click="increment"
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const router = useRouter()

// Same id used in the checkout page — keep these in sync
const eventId = '22222222-2222-2222-2222-222222222222'

const event = ref(null)
const eventLoading = ref(true)
const eventError = ref('')

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
        status,
        banner_url,
        partners ( business_name )
      `)
      .eq('id', eventId)
      .eq('status', 'active')
      .single()

    if (error) throw error
    event.value = data
  } catch (err) {
    console.error('Failed to load event:', err)
    eventError.value = 'Unable to load this event.'
  } finally {
    eventLoading.value = false
  }
}

onMounted(() => {
  loadEvent()
})

// The schema has one flat ticket_price per event (no tiers table yet),
// so this renders a single "General Admission" tier sourced from real data.
const ticketTier = computed(() => {
  if (!event.value) return null
  return {
    id: event.value.id,
    name: 'General Admission',
    description: 'Full access to the show',
    price: event.value.ticket_price,
    maxPerOrder: 6
  }
})

const quantity = ref(0)

function increment() {
  if (ticketTier.value && quantity.value < ticketTier.value.maxPerOrder) quantity.value++
}
function decrement() {
  if (quantity.value > 0) quantity.value--
}

const totalTickets = computed(() => quantity.value)

const orderLines = computed(() => {
  if (!ticketTier.value || quantity.value === 0) return []
  return [
    {
      id: ticketTier.value.id,
      name: ticketTier.value.name,
      qty: quantity.value,
      price: ticketTier.value.price
    }
  ]
})

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

function formatEventDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date(date))
}

function goToCheckout() {
  if (totalTickets.value === 0) return
  router.push({
    name: 'checkout',
    params: { eventId: event.value.id },
    query: { tickets: JSON.stringify(orderLines.value) }
  })
}
</script>

<style scoped>
.event-page {
  max-width: 1100px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1a1a1a;
  padding-bottom: 4rem;
}
.state-msg {
  text-align: center;
  padding: 4rem 1rem;
  color: #666;
}
.state-msg.error {
  color: #e74c3c;
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
.description {
  line-height: 1.6;
  color: #444;
}
.organiser {
  margin-top: 0.5rem;
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
</style>