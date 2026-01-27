<script setup lang="ts">
defineProps<{
  src: string;
  originalSrc?: string; // For comparison in future
  alt?: string;
}>();
</script>

<template>
  <div class="relative w-full h-full min-h-[300px] bg-muted/30 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center">
    <img 
      v-if="src"
      :src="src" 
      :alt="alt || 'Image Preview'" 
      class="max-w-full max-h-[600px] object-contain shadow-sm"
    />
    <div v-else class="text-muted-foreground flex flex-col items-center">
      <span class="text-sm">No image to preview</span>
    </div>
  </div>
</template>
