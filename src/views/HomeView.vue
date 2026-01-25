<script setup lang="ts">
import { Table, ArrowRightLeft, Sparkles, Zap } from 'lucide-vue-next';
</script>

<template>
  <div class="max-w-4xl mx-auto py-12 px-4 text-center">
    <div class="mb-8 flex justify-center">
      <div class="h-24 w-24 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
        <Zap :size="48" fill="currentColor" />
      </div>
    </div>
    <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4">
      Privacy-First Data Tools
    </h1>
    <p class="text-xl text-text-muted mb-12 max-w-2xl mx-auto">
      Fast, secure, and client-side only. Process your CSV/Excel files directly in your browser without uploading them to any server.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
      <router-link to="/tools/csv-viewer" class="group p-6 rounded-xl border border-border bg-surface hover:border-primary/50 hover:shadow-lg transition-all">
        <div class="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
          <Table :size="24" />
        </div>
        <h3 class="font-bold text-lg mb-2">CSV Viewer</h3>
        <p class="text-sm text-text-muted">Open and explore large CSV/Excel files with ease.</p>
      </router-link>
      
      <router-link to="/tools/csv-converter" class="group p-6 rounded-xl border border-border bg-surface hover:border-primary/50 hover:shadow-lg transition-all">
        <div class="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
          <ArrowRightLeft :size="24" />
        </div>
        <h3 class="font-bold text-lg mb-2">Converter</h3>
        <p class="text-sm text-text-muted">Convert between CSV and Excel formats instantly.</p>
      </router-link>
      
      <router-link to="/tools/csv-cleaner" class="group p-6 rounded-xl border border-border bg-surface hover:border-primary/50 hover:shadow-lg transition-all">
        <div class="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
          <Sparkles :size="24" />
        </div>
        <h3 class="font-bold text-lg mb-2">Cleaner</h3>
        <p class="text-sm text-text-muted">Clean, trim, and normalize your data.</p>
      </router-link>
    </div>
  </div>
</template>
