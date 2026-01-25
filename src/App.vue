<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';

const isSidebarOpen = ref(true);

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<template>
  <div class="min-h-screen bg-background text-text flex flex-col">
    <AppHeader @toggle-sidebar="toggleSidebar" />
    
    <div class="flex flex-1 overflow-hidden">
      <AppSidebar 
        class="transition-transform duration-300 ease-in-out md:translate-x-0 absolute md:relative z-10 h-full"
        :class="isSidebarOpen ? 'translate-x-0 shadow-xl md:shadow-none' : '-translate-x-full md:hidden'" 
      />
      
      <main class="flex-1 overflow-auto bg-background md:p-6 w-full">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
      <!-- Overlay for mobile sidebar -->
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false"
        class="fixed inset-0 bg-black/50 z-0 md:hidden"
      ></div>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
