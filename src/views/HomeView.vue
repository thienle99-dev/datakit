<script setup lang="ts">
import { Table, ArrowRightLeft, Sparkles, Zap, FileJson, Database, ArrowRight } from 'lucide-vue-next';
</script>

<template>
  <div class="max-w-5xl mx-auto py-16 px-6 text-center relative z-10">
    <div class="mb-10 flex justify-center">
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div class="relative h-24 w-24 bg-card ring-1 ring-border rounded-2xl flex items-center justify-center text-foreground shadow-2xl">
          <Zap :size="48" class="text-primary" fill="currentColor" fill-opacity="0.1" />
        </div>
      </div>
    </div>
    
    <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
      Privacy-First <span class="text-primary">Data Tools</span>
    </h1>
    
    <p class="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
      Process your data securely in your browser. No server uploads, zero latency, 
      <span class="text-foreground font-medium">100% private</span>.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
      <router-link to="/tools/csv-viewer" class="glass-card p-6 rounded-2xl group relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Table :size="96" />
        </div>
        <div class="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
          <Table :size="24" />
        </div>
        <h3 class="font-bold text-xl mb-2 flex items-center gap-2">
          CSV Viewer
          <ArrowRight :size="16" class="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed">Open and explore large CSV/Excel files instantly with virtualization.</p>
      </router-link>
      
      <router-link to="/tools/csv-converter" class="glass-card p-6 rounded-2xl group relative overflow-hidden">
        <div class="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300">
          <ArrowRightLeft :size="24" />
        </div>
        <h3 class="font-bold text-xl mb-2 flex items-center gap-2">
          Converter
           <ArrowRight :size="16" class="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed">Convert between CSV and Excel formats seamlessly.</p>
      </router-link>
      
      <router-link to="/tools/csv-cleaner" class="glass-card p-6 rounded-2xl group relative overflow-hidden">
        <div class="bg-amber-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform duration-300">
          <Sparkles :size="24" />
        </div>
        <h3 class="font-bold text-xl mb-2 flex items-center gap-2">
          Cleaner
           <ArrowRight :size="16" class="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500" />
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed">Trim whitespace, remove duplicates, and normalize data.</p>
      </router-link>

      <router-link to="/tools/json-converter" class="glass-card p-6 rounded-2xl group relative overflow-hidden">
        <div class="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-300">
          <FileJson :size="24" />
        </div>
        <h3 class="font-bold text-xl mb-2 flex items-center gap-2">
          JSON Converter
           <ArrowRight :size="16" class="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed">Transform tabular data into JSON for web apps.</p>
      </router-link>

      <router-link to="/tools/sql-generator" class="glass-card p-6 rounded-2xl group relative overflow-hidden">
        <div class="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform duration-300">
          <Database :size="24" />
        </div>
        <h3 class="font-bold text-xl mb-2 flex items-center gap-2">
          SQL Generator
           <ArrowRight :size="16" class="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-500" />
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed">Generate SQL INSERT statements automatically.</p>
      </router-link>
    </div>
  </div>
</template>
