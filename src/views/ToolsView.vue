<script setup lang="ts">
import { ref, computed } from 'vue';
import { Table, ArrowRightLeft, Sparkles, FileJson, Database, Search, ArrowRight } from 'lucide-vue-next';

const searchQuery = ref('');

const tools = [
  { 
    id: 'csv-viewer', 
    name: 'CSV Viewer', 
    description: 'Open, view, and analyze large CSV & Excel files instantly without uploading.',
    path: '/tools/csv-viewer', 
    icon: Table,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10' 
  },
  { 
    id: 'csv-converter', 
    name: 'CSV Converter', 
    description: 'Convert data between CSV and Excel (XLSX) formats seamlessly.',
    path: '/tools/csv-converter', 
    icon: ArrowRightLeft,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  { 
    id: 'csv-cleaner', 
    name: 'CSV Cleaner', 
    description: 'Clean data, remove duplicates, and trim whitespace automatically.',
    path: '/tools/csv-cleaner', 
    icon: Sparkles,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  { 
    id: 'json-converter', 
    name: 'JSON Converter', 
    description: 'Transform tabular data into JSON format for development usage.',
    path: '/tools/json-converter', 
    icon: FileJson,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  { 
    id: 'sql-generator', 
    name: 'SQL Generator', 
    description: 'Generate SQL INSERT statements from your CSV or Excel files.',
    path: '/tools/sql-generator', 
    icon: Database,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
];

const filteredTools = computed(() => {
  if (!searchQuery.value) return tools;
  const q = searchQuery.value.toLowerCase();
  return tools.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q)
  );
});
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-6">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
        All Tools
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        A collection of powerful, privacy-first data utilities running entirely in your browser.
      </p>
    </div>

    <!-- Search Bar -->
    <div class="max-w-md mx-auto mb-16 relative group">
      <div class="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search :size="20" />
        </span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search tools..." 
          class="w-full pl-12 pr-4 py-4 bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xl transition-all"
        />
      </div>
    </div>

    <!-- Tools Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link 
        v-for="tool in filteredTools" 
        :key="tool.id" 
        :to="tool.path"
        class="glass-card p-6 rounded-2xl group relative overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-300"
      >
        <!-- Background Glow -->
        <div class="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity duration-500 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
           <component :is="tool.icon" :size="120" :class="tool.color" />
        </div>

        <div class="flex items-start justify-between mb-4">
          <div :class="[tool.bgColor, tool.color]" class="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
            <component :is="tool.icon" :size="28" />
          </div>
          
          <div class="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight :size="16" />
          </div>
        </div>

        <h3 class="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
          {{ tool.name }}
        </h3>
        
        <p class="text-sm text-muted-foreground leading-relaxed flex-1">
          {{ tool.description }}
        </p>

        <div class="mt-6 pt-4 border-t border-border/30 flex items-center text-xs font-medium text-muted-foreground">
           <span class="bg-secondary/30 px-2 py-1 rounded text-[10px] uppercase tracking-wider">Free</span>
           <span class="mx-2">•</span>
           <span>Browser-based</span>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTools.length === 0" class="text-center py-20">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-semibold mb-2">No tools found</h3>
      <p class="text-muted-foreground">Try adjusting your search query.</p>
    </div>
  </div>
</template>
