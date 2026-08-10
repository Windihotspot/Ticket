import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import CheckoutPage from '@/views/CheckoutPage.vue'
import PaymentPage from '@/views/PaymentPage.vue'
import TicketDemo from '@/components/TicketDemo.vue'
import CheckoutTest from '@/views/CheckoutTest.vue'
// import TicketDemo from '@/components/TicketDemo.vue'
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
    {
      path: '/ticketdemo',
      name: 'ticketdemo',
      component: TicketDemo
    },
    {
      path: '/check',
      name: 'check',
      component: CheckoutTest
    },
  ]
})

export default router
