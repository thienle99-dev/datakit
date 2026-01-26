<script setup lang="ts">
import { ref, computed } from 'vue';
import { Table, ArrowRightLeft, Sparkles, Columns, ListFilter, Search, ArrowRight, Zap, ShieldCheck, Cpu, Layers, Scissors, BarChart3, GitCompare, Sigma, ListOrdered, Shuffle, EyeOff, FileDown, Database, FileJson, Code2, Binary, Shield, History, Key, Code, Type } from 'lucide-vue-next';

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
  },
  { 
    id: 'transpose-data', 
    name: 'Row-Col Transpose', 
    description: 'Instantly rotate your dataset: flip rows into columns and vice versa for analysis.',
    path: '/transpose-data', 
    icon: ArrowRightLeft,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10'
  },
  {
    id: 'validate-data',
    name: 'Data Validator',
    description: 'Audit file structure, inconsistent row lengths, and potential encoding issues.',
    path: '/validate-data',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  {
    id: 'reshape-data',
    name: 'Pivot / Unpivot',
    description: 'Reshape your data from long to wide or wide to long format for analysis.',
    path: '/reshape-data',
    icon: ArrowRightLeft,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10'
  },
  {
    id: 'find-replace',
    name: 'Seek & Destroy',
    description: 'Find and replace strings across your entire dataset using text or Regex.',
    path: '/find-replace',
    icon: Search,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  {
    id: 'summarize-data',
    name: 'Data Summarizer',
    description: 'Group rows and calculate sums, averages, or counts for deep insights.',
    path: '/summarize-data',
    icon: Sigma,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'mock-generator',
    name: 'Mock Generator',
    description: 'Generate millions of rows of fake data for testing and development with Faker.js logic.',
    path: '/mock-generator',
    icon: Database,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10'
  },
  {
    id: 'skip-rows',
    name: 'Skip Rows & Header',
    description: 'Set which row is the header and skip rows above it. CSV and Excel.',
    path: '/skip-rows',
    icon: ListOrdered,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10'
  },
  {
    id: 'random-sample',
    name: 'Random Sample',
    description: 'Take first N, last N, or a random sample. Ideal for train/test splits.',
    path: '/random-sample',
    icon: Shuffle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  {
    id: 'mask-data',
    name: 'Mask Sensitive Data',
    description: 'Mask emails, phones, or custom regex in chosen columns before sharing.',
    path: '/mask-data',
    icon: EyeOff,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10'
  },
  {
    id: 'data-to-chart',
    name: 'Data to Chart',
    description: 'Transform your raw data into stunning, interactive charts and visualizations instantly.',
    path: '/data-to-chart',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'templates',
    name: 'Download Templates',
    description: 'Start from a ready-made CSV or Excel template. No upload required.',
    path: '/templates',
    icon: FileDown,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10'
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Beautify, minify, and validate JSON data.',
    path: '/json-formatter',
    icon: FileJson,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    description: 'Compare two JSON objects side by side.',
    path: '/json-diff',
    icon: GitCompare,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    id: 'json-path',
    name: 'JSON Path',
    description: 'Query and extract data from JSON using JSONPath.',
    path: '/json-path',
    icon: Search,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'xml-converter',
    name: 'XML Converter',
    description: 'Convert between XML and JSON formats.',
    path: '/xml-converter',
    icon: Code2,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  {
    id: 'encoder',
    name: 'Encoder Suite',
    description: 'Base64, URL, HTML encoding/decoding and Hashing.',
    path: '/encoder',
    icon: Binary,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10'
  },
  {
    id: 'jwt-debugger',
    name: 'JWT Debugger',
    description: 'Decode and inspect JSON Web Tokens.',
    path: '/jwt-debugger',
    icon: Shield,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
  {
    id: 'epoch-converter',
    name: 'Epoch Converter',
    description: 'Convert between Epoch timestamps and human-readable dates.',
    path: '/epoch-converter',
    icon: History,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate version 4 UUIDs (Guids).',
    path: '/uuid-generator',
    icon: Key,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10'
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions.',
    path: '/regex-tester',
    icon: Code,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10'
  },
  {
    id: 'text-tools',
    name: 'Text Utils',
    description: 'Case conversion, sorting, deduplication, and string manipulation.',
    path: '/text-tools',
    icon: Type,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10'
  }
];

interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: any;
  color: string;
  bgColor: string;
}

const filteredTools = computed(() => {
  if (!searchQuery.value) return tools as Tool[];
  const q = searchQuery.value.toLowerCase();
  return (tools as Tool[]).filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q)
  );
});
</script>

<template>
  <div class="max-w-screen-2xl mx-auto py-10 md:py-12 px-4 md:px-8">
    <!-- Hero Section -->
    <div class="relative mb-14">
      <div class="absolute inset-0 -top-16 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,var(--primary-rgb,theme(colors.primary.DEFAULT))_0%,transparent_100%)] opacity-[0.03] blur-3xl"></div>
      
      <div class="text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-2xs font-bold uppercase tracking-[0.15em] animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Zap :size="10" fill="currentColor" /> v2.0 - Universal Data Toolkit
        </div>
        
        <h1 class="text-3xl md:text-5xl font-black tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
          Supercharge your <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 pb-0.5">Data Workflow</span>
        </h1>
        
        <p class="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          A suite of premium, heavy-duty data utilities that run 100% in your browser. 
          No uploads, no cloud, just raw speed and privacy.
        </p>

        <!-- Feature Badges -->
        <div class="flex flex-wrap justify-center gap-4 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div class="flex items-center gap-1.5 text-2xs font-bold text-muted-foreground uppercase tracking-wider">
            <ShieldCheck :size="14" class="text-emerald-500" /> Private by Design
          </div>
          <div class="flex items-center gap-1.5 text-2xs font-bold text-muted-foreground uppercase tracking-wider">
            <Cpu :size="14" class="text-blue-500" /> Local Processing
          </div>
          <div class="flex items-center gap-1.5 text-2xs font-bold text-muted-foreground uppercase tracking-wider">
            <ArrowRightLeft :size="14" class="text-amber-500" /> Multi-Format
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar: Search & View Options -->
    <div class="max-w-4xl mx-auto mb-12 space-y-6">
      <div class="relative group animate-in zoom-in-95 duration-1000 delay-300">
        <div class="absolute -inset-1.5 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
        
        <div class="relative flex flex-col gap-4">
          <div class="relative flex items-center">
            <span class="absolute left-5 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110">
              <Search :size="20" stroke-width="2.5" />
            </span>
            
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="What are we building today?" 
              class="w-full pl-12 pr-20 py-3.5 bg-card border border-border/80 rounded-xl text-base font-bold placeholder:text-muted-foreground/20 focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] group-hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.12)] transition-all tracking-tight"
            />

            <div class="absolute right-5 flex items-center gap-1 px-2 py-1 bg-muted/50 border border-border/50 rounded-lg text-2xs font-bold tracking-tight text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
              <span>⌘</span><span>K</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
             <button 
               v-for="cat in ['All', 'Converter', 'Viewer', 'Cleaner', 'Manager']" 
               :key="cat"
               @click="searchQuery = cat === 'All' ? '' : cat"
               class="px-4 py-1.5 rounded-full border border-border/40 hover:border-primary/50 text-2xs font-bold uppercase tracking-wider transition-all hover:bg-primary/5 hover:text-primary active:scale-95 shadow-sm"
               :class="{ 'bg-primary border-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-md shadow-primary/20': searchQuery.toLowerCase() === cat.toLowerCase() }"
             >
               {{ cat }}
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tools Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link 
        v-for="(tool, index) in filteredTools" 
        :key="tool.id" 
        :to="tool.path"
        class="group relative h-full animate-in fade-in slide-in-from-bottom-10 duration-1000"
        :style="{ transitionDelay: `${index * 50}ms` }"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/10 pointer-events-none"></div>
        
        <div class="h-full glass-card p-4 rounded-2xl border border-border/50 flex flex-col transition-all duration-500 group-hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 group-hover:border-primary/40 relative overflow-hidden bg-card">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="flex items-center gap-3 mb-3 relative z-10">
            <div :class="[tool.bgColor, tool.color]" class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 shadow-sm relative overflow-hidden ring-1 ring-white/10 shrink-0">
               <component :is="tool.icon" :size="18" stroke-width="2.5" />
            </div>
            
            <h3 class="text-base font-bold tracking-tight group-hover:text-primary transition-colors truncate">
              {{ tool.name }}
            </h3>
          </div>
          
          <p class="text-muted-foreground leading-relaxed text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity line-clamp-2">
            {{ tool.description }}
          </p>

          <div class="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-3 transition-all duration-500">
            <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-1 ring-primary/20">
              <ArrowRight :size="14" />
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTools.length === 0" class="text-center py-14 animate-in fade-in zoom-in-95 duration-500">
      <div class="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Search :size="32" class="text-muted-foreground/20" />
      </div>
      <h3 class="text-xl font-bold mb-1.5">No tools found</h3>
      <p class="text-sm text-muted-foreground">Adjust your search to find what you're looking for.</p>
    </div>
  </div>
</template>
