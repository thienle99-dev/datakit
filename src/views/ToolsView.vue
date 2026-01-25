<script setup lang="ts">
import { ref, computed } from 'vue';
import { Table, ArrowRightLeft, Sparkles, Columns, ListFilter, Search, ArrowRight, Zap, ShieldCheck, Cpu, Layers, Scissors, BarChart3, GitCompare } from 'lucide-vue-next';

const searchQuery = ref('');

const tools = [
  { 
    id: 'universal-converter', 
    name: 'Universal Converter', 
    description: 'The ultimate tool to transform data between CSV, JSON, Excel, SQL, and Markdown with live preview.',
    path: '/universal-converter', 
    icon: ArrowRightLeft,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  { 
    id: 'merge-data', 
    name: 'Merge Data', 
    description: 'Combine multiple CSV or Excel files into a single master document with automatic alignment.',
    path: '/merge-data', 
    icon: Layers,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10'
  },
  { 
    id: 'split-data', 
    name: 'Data Splitter', 
    description: 'Tear large datasets into smaller chunks or a specific number of files for easier handling.',
    path: '/split-data', 
    icon: Scissors,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10'
  },
  { 
    id: 'data-stats', 
    name: 'Column Statistics', 
    description: 'Detailed data profiling and automated insights: min/max, averages, and unique counts.',
    path: '/data-stats', 
    icon: BarChart3,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10'
  },
  { 
    id: 'compare-data', 
    name: 'Visual Diff', 
    description: 'Compare two datasets side-by-side to track additions, deletions, and cell-level changes.',
    path: '/compare-data', 
    icon: GitCompare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10'
  },
  { 
    id: 'csv-viewer', 
    name: 'Data Viewer', 
    description: 'Instant spreadsheet preview with multi-column sorting and lightning-fast search for large datasets.',
    path: '/csv-viewer', 
    icon: Table,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10' 
  },
  { 
    id: 'csv-cleaner', 
    name: 'Data Cleaner', 
    description: 'Automated data normalization: deduplicate, trim spaces, and fix formatting in one click.',
    path: '/csv-cleaner', 
    icon: Sparkles,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  { 
    id: 'column-selector', 
    name: 'Column Manager', 
    description: 'Ergonomic workspace to reorder, rename, or cherry-pick specific columns from your files.',
    path: '/column-selector', 
    icon: Columns,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
  { 
    id: 'filter-sort', 
    name: 'Advanced Filter', 
    description: 'Apply professional sorting presets and complex multi-rule conditions to refine your data.',
    path: '/filter-sort', 
    icon: ListFilter,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  }
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
  <div class="max-w-7xl mx-auto py-12 md:py-20 px-6 lg:px-8">
    <!-- Hero Section -->
    <div class="relative mb-20">
      <div class="absolute inset-0 -top-20 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,var(--primary-rgb,theme(colors.primary.DEFAULT))_0%,transparent_100%)] opacity-[0.03] blur-3xl"></div>
      
      <div class="text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Zap :size="12" fill="currentColor" /> v2.0 - Universal Data Toolkit
        </div>
        
        <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Supercharge your <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">Data Workflow</span>
        </h1>
        
        <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          A suite of premium, heavy-duty data utilities that run 100% in your browser. 
          No uploads, no cloud, just raw speed and privacy.
        </p>

        <!-- Feature Badges -->
        <div class="flex flex-wrap justify-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <ShieldCheck :size="16" class="text-emerald-500" /> Private by Design
          </div>
          <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <Cpu :size="16" class="text-blue-500" /> Local Processing
          </div>
          <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <ArrowRightLeft :size="16" class="text-amber-500" /> Multi-Format
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar: Search & View Options -->
    <div class="max-w-4xl mx-auto mb-16 space-y-8">
      <div class="relative group animate-in zoom-in-95 duration-1000 delay-300">
        <!-- Modern Glow Backdrop -->
        <div class="absolute -inset-2 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
        
        <div class="relative flex flex-col gap-6">
          <div class="relative flex items-center">
            <span class="absolute left-7 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110">
              <Search :size="24" stroke-width="2.5" />
            </span>
            
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="What are we building today?" 
              class="w-full pl-16 pr-24 py-7 bg-card/85 backdrop-blur-3xl border border-border/50 rounded-[2rem] text-xl font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] group-hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] transition-all"
            />

            <!-- Keystroke Hint -->
            <div class="absolute right-7 flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-xl text-[10px] font-black tracking-tighter text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
              <span class="text-xs">⌘</span>
              <span>K</span>
            </div>
          </div>

          <!-- Quick Filters / Categories -->
          <div class="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
             <button 
               v-for="cat in ['All', 'Converter', 'Viewer', 'Cleaner', 'Manager']" 
               :key="cat"
               @click="searchQuery = cat === 'All' ? '' : cat"
               class="px-5 py-2 rounded-full border border-border/40 hover:border-primary/50 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-primary/5 hover:text-primary active:scale-95 shadow-sm"
               :class="{ 'bg-primary border-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-lg shadow-primary/20': searchQuery.toLowerCase() === cat.toLowerCase() }"
             >
               {{ cat }}
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tools Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <router-link 
        v-for="(tool, index) in filteredTools" 
        :key="tool.id" 
        :to="tool.path"
        class="group relative h-full animate-in fade-in slide-in-from-bottom-10 duration-1000"
        :style="{ transitionDelay: `${index * 50}ms` }"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/10 pointer-events-none"></div>
        
        <div class="h-full glass-card p-8 rounded-3xl border border-border/50 flex flex-col transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:-translate-y-2 group-hover:border-primary/30">
          <div class="flex items-start justify-between mb-8">
            <div :class="[tool.bgColor, tool.color]" class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner relative overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <component :is="tool.icon" :size="32" stroke-width="2" />
            </div>
            
            <div class="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-500">
              <ArrowRight :size="20" class="group-hover:text-primary" />
            </div>
          </div>

          <h3 class="text-2xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">
            {{ tool.name }}
          </h3>
          
          <p class="text-muted-foreground leading-relaxed text-sm flex-1">
            {{ tool.description }}
          </p>

          <div class="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[10px] font-black uppercase tracking-widest opacity-40">Ready to Use</span>
             </div>
             <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span class="text-[10px] font-bold uppercase text-primary">Open Tool</span>
                <ArrowRight :size="10" />
             </div>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTools.length === 0" class="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
      <div class="w-24 h-24 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Search :size="48" class="text-muted-foreground/20" />
      </div>
      <h3 class="text-2xl font-bold mb-2">No tools found</h3>
      <p class="text-muted-foreground">Adjust your search to find what you're looking for.</p>
    </div>
  </div>
</template>
