<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
    <div
      class="bg-white border border-gray-200 rounded-lg shadow-sm max-w-2xl w-full overflow-hidden"
    >
      <!-- Header -->
      <div class="flex justify-between items-center px-6 pt-5 pb-2">
        <div class="flex items-center gap-2">
          <!-- EventPrime Logo -->
          <div
            class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-green-400 to-yellow-400 flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm tracking-tighter">EP</span>
          </div>
          <span class="text-xl font-semibold text-gray-900">EventPrime</span>
        </div>
        <span class="text-sm text-gray-700 font-medium">Ticket #130690</span>
      </div>

      <!-- Main Content -->
      <div class="px-6 pb-6 pt-2 flex gap-6">
        <!-- Left Content -->
        <div class="flex-1 space-y-3">
          <p class="text-xs text-gray-600 uppercase tracking-wide">
            CONFERENCE (EARLY BIRD) (Discounted - VictorFaXHackfest23)
          </p>

          <h1 class="text-2xl font-bold text-gray-900 leading-tight">Gen Z Hackfest 2023</h1>

          <p class="text-sm text-gray-800">Sat 26 Aug, 2023 at 09:00 AM</p>

          <p class="text-sm text-gray-700 leading-snug">
            UNILAG Multi-Purpose Hall, (Jelili Adebisi Omotola Hall), University of Lagos,
            University of Lagos, Akoka
          </p>

          <div class="pt-3 space-y-1 text-sm text-gray-800">
            <p><span class="font-medium">Ticket Id:</span> #130690</p>
            <p><span class="font-medium">Purchased By:</span> Ifiok Usanga</p>
            <p><span class="font-medium">Amount Paid:</span> ₦ 2500</p>
          </div>
        </div>

        <!-- Right Side: QR + Organizer -->
        <div class="flex flex-col items-end shrink-0">
          <!-- QR Code -->
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=Ticket%23130690-GenZHackfest2023"
            alt="QR Code"
            class="w-36 h-36 border border-gray-200 rounded"
          />

          <!-- Organizer -->
          <div class="mt-4 text-right text-sm">
            <p class="text-gray-500">Organized by:</p>
            <p class="font-semibold text-gray-900">GenZtechies</p>
            <p class="text-gray-600">hello@genztechies.com</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3 border-t border-gray-100 flex justify-end">
        <div class="text-right text-xs text-gray-500">
          <p>Powered by EventPrime</p>
          <a href="https://eventprime.co/" class="text-gray-600 hover:underline">
            https://eventprime.co/
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No extra logic needed – pure presentational component
</script>
