<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue';
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans antialiased selection:bg-primary/30 selection:text-primary">
    <!-- Ambient Background Mesh -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
    </div>
    
    <AppHeader />
    
    <div class="flex flex-1 overflow-hidden relative">
      <main class="flex-1 overflow-auto bg-background/50 md:p-6 w-full relative z-0">
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
