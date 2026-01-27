<script setup lang="ts">
import { ref, computed } from 'vue';
import { Table, ArrowRightLeft, Sparkles, Columns, ListFilter, Search, ShieldCheck, Layers, Scissors, BarChart3, GitCompare, Sigma, ListOrdered, Shuffle, EyeOff, FileDown, Database, FileJson, Code2, Binary, Shield, History, Key, Code, Type, Image as ImageIcon, ZoomIn } from 'lucide-vue-next';

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
    description: 'Generate UUIDs in multiple versions (v1-v8) with batch processing, format options, and export capabilities.',
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
  },
  { 
    id: 'image-studio', 
    name: 'Image Studio', 
    description: 'The all-in-one suite: Compress, Convert, Resize, Rotate, and Crop images with a professional editor.',
    path: '/image-studio', 
    icon: ImageIcon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  { 
    id: 'image-upscaler', 
    name: 'Image Upscaler', 
    description: 'Increase image resolution with preset aspect ratios (1:1, 16:9, 9:16, 4:3, 21:9) and multiple upscale methods.',
    path: '/image-upscaler', 
    icon: ZoomIn,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10'
  }
];

const categories = [
    {
        title: "Image Studio",
        tools: tools.filter(t => ['image-studio', 'image-upscaler'].includes(t.id))
    },
    {
        title: "All-in-One Data Tools",
        tools: tools.filter(t => ['universal-converter', 'merge-data', 'split-data', 'compare-data', 'csv-viewer', 'csv-cleaner', 'column-selector', 'filter-sort', 'transpose-data', 'data-stats', 'mock-generator', 'data-to-chart', 'skip-rows', 'random-sample', 'mask-data', 'validate-data', 'reshape-data', 'find-replace', 'summarize-data', 'templates'].includes(t.id))
    },
     {
        title: "Developer Utilities",
        tools: tools.filter(t => ['json-formatter', 'json-diff', 'json-path', 'xml-converter', 'encoder', 'jwt-debugger', 'epoch-converter', 'uuid-generator', 'regex-tester', 'text-tools'].includes(t.id))
    }
];

const filteredCategories = computed(() => {
    if (!searchQuery.value) return categories;
    const q = searchQuery.value.toLowerCase();
    
    return categories.map(cat => ({
        ...cat,
        tools: cat.tools.filter(t => 
             t.name.toLowerCase().includes(q) || 
             t.description.toLowerCase().includes(q)
        )
    })).filter(cat => cat.tools.length > 0);
});
</script>

<template>
  <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-8">
    
    <!-- Abstract 3D/Gradient Wallpaper -->
    <div class="fixed inset-0 -z-10 bg-[#0f172a]">
        <div class="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400/20 via-blue-600/10 to-transparent blur-3xl opacity-50 animate-pulse-slow"></div>
        <div class="absolute -bottom-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-fuchsia-600/10 to-transparent blur-3xl opacity-50"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
    </div>

    <!-- Main "Window" Container -->
    <div class="w-full max-w-[1000px] max-h-[90vh] bg-background/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-700">
      
      <!-- Window Header / Toolbar -->
      <div class="h-16 px-8 flex items-center justify-between border-b border-white/5 shrink-0 z-20 bg-white/5 backdrop-blur-sm">
        <div class="flex items-center gap-3">
           <div class="flex items-center gap-2">
             <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <component :is="ImageIcon" :size="16" stroke-width="2.5" />
             </div>
             <span class="text-xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
               Apps
             </span>
           </div>
           
           <div class="h-6 w-px bg-white/10 mx-2"></div>
           
           <div class="relative group">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search" 
                class="w-48 bg-black/5 dark:bg-white/5 border border-transparent focus:border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm transition-all focus:w-64 focus:outline-none placeholder:text-muted-foreground/50"
              />
           </div>
        </div>
        
        <div class="flex items-center gap-4 text-muted-foreground">
           <router-link to="/" class="hover:text-foreground transition-colors p-1.5 hover:bg-white/5 rounded-lg flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
             <Columns :size="16" /> Home
           </router-link>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 relative">
        
        <div v-for="(category, index) in filteredCategories" :key="category.title" class="space-y-4">
            <div class="flex items-center justify-between px-2" v-if="filteredCategories.length > 1">
                <h3 class="text-sm font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {{ category.title }}
                </h3>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
               <router-link 
                v-for="(tool, tIndex) in category.tools" 
                :key="tool.id" 
                :to="tool.path"
                class="group flex flex-col items-center gap-3 animate-in fade-in fill-mode-backwards duration-500"
                :style="{ animationDelay: `${(index * 100) + (tIndex * 30)}ms` }"
              >
                <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-active:scale-95 flex items-center justify-center overflow-hidden" 
                     :class="[tool.bgColor]">
                     <div class="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
                     <component :is="tool.icon" :size="36" stroke-width="2" :class="tool.color" class="drop-shadow-sm relative z-10" />
                     <div class="absolute inset-0 border border-black/5 dark:border-white/10 rounded-[1.5rem] pointer-events-none"></div>
                </div>

                <span class="text-xs sm:text-sm font-medium text-foreground/80 text-center leading-tight truncate px-1 w-full group-hover:text-foreground transition-colors">
                  {{ tool.name }}
                </span>
              </router-link>
            </div>
        </div>

        <div v-if="filteredCategories.length === 0" class="flex flex-col items-center justify-center py-20 opacity-50">
             <Search class="w-16 h-16 mb-4 opacity-50" />
             <p class="text-lg font-medium">No results found</p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.2);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.4);
}
</style>
