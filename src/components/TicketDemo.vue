<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4">
    <!-- Phone-like container -->
    <div class="w-full max-w-sm">
      <!-- Header -->
      <div class="flex items-center justify-between px-2 mb-6 text-white">
        <button class="p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-medium">Your ticket</h1>
        <button class="p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      <!-- Ticket Card -->
      <div class="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
        <!-- Top section with QR -->
        <div class="px-6 pt-8 pb-6 text-center">
          <h2 class="text-white text-xl font-semibold">Winter Music Festival</h2>
          <p class="text-zinc-400 text-sm mt-1">2026 Edition</p>
          <p class="text-zinc-500 text-xs mt-3">Show this QR code at the event entrance</p>
          <p class="text-zinc-500 text-xs mt-1">Ticket: SMF-2026-001234</p>

          <!-- QR Code -->
          <div class="mt-6 flex justify-center">
            <div class="bg-white p-3 rounded-2xl">
              <!-- Replace with real QR later -->
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SMF-2026-001234"
                alt="QR Code"
                class="w-44 h-44"
              />
            </div>
          </div>
        </div>

        <!-- Ticket cutout effect -->
        <div class="relative h-6">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-black"></div>
          <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-black"></div>
          <div class="absolute inset-x-6 top-1/2 border-t border-dashed border-zinc-600"></div>
        </div>

        <!-- Details section -->
        <div class="px-6 pb-8 pt-2 space-y-5 mt-10">
          <!-- Venue -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-zinc-700/80 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p class="text-zinc-500 text-xs">Venue</p>
              <p class="text-white text-sm font-medium">Central park, NY</p>
            </div>
          </div>

          <!-- Date & Time -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-zinc-700/80 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-zinc-500 text-xs">Date & Time</p>
              <p class="text-white text-sm font-medium">Jan 25, 2026 · 6:00 PM</p>
            </div>
          </div>

          <!-- Price -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-zinc-700/80 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-zinc-500 text-xs">Price</p>
              <p class="text-white text-sm font-medium">$99</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Download button -->
      <button
        class="mt-8 w-full bg-white text-black font-medium py-3.5 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download ticket
      </button>
    </div>
  </div>
</template>

<script setup>
// No extra logic needed for this static ticket
</script>