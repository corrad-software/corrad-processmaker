<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top navigation -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-8">
          <NuxtLink to="/" class="text-lg font-bold">Corrad ProcessMaker</NuxtLink>
          <div class="flex space-x-4">
            <NuxtLink to="/execution" class="px-3 py-2 rounded hover:bg-gray-100">Dashboard</NuxtLink>
            <NuxtLink to="/execution/new-case" class="px-3 py-2 rounded hover:bg-gray-100">New Case</NuxtLink>
            <NuxtLink to="/execution/inbox" class="px-3 py-2 rounded hover:bg-gray-100">Inbox</NuxtLink>
            <NuxtLink to="/execution/history" class="px-3 py-2 rounded hover:bg-gray-100">History</NuxtLink>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="relative">
            <button class="flex items-center text-gray-700 focus:outline-none">
              <span class="mr-2">User Name</span>
              <i class="material-symbols-outlined">account_circle</i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="container mx-auto px-4 py-6">
      <slot />
    </div>
  </div>
</template> 