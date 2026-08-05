import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import CheckoutPage from '@/views/CheckoutPage.vue'
import PaymentPage from '@/views/PaymentPage.vue'
<<<<<<< HEAD
=======
import TicketDemo from '@/components/TicketDemo.vue'
// import TicketDemo from '@/components/TicketDemo.vue'
>>>>>>> Dimeji/dev
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutPage
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentPage
    },
<<<<<<< HEAD
=======
    {
      path: '/ticketdemo',
      name: 'ticketdemo',
      component: TicketDemo
    },
>>>>>>> Dimeji/dev
  ]
})

export default router
