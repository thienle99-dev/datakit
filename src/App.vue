<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue';
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col relative font-sans antialiased selection:bg-primary/30 selection:text-primary">
    <!-- Ambient Background Mesh -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
      <div class="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 4s"></div>
      <!-- Radial Mask to focus data -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_100%)] opacity-40"></div>
    </div>
    
    <AppHeader />
    
    <div class="flex flex-1 relative mt-4 md:mt-8">
      <main class="flex-1 bg-background p-4 md:p-8 lg:p-12 w-full relative z-0">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
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
