<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { 
  GitCompare, 
  X, 
  FileText,
  MinusCircle,
  PlusCircle,
  Edit3
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import { parseFile } from '../utils/fileParser';

const file1 = shallowRef<File | null>(null);
const file2 = shallowRef<File | null>(null);
const data1 = ref<any[]>([]);
const data2 = ref<any[]>([]);
const headers = ref<string[]>([]);

const handleFile1Selected = async (f: File) => {
  file1.value = f;
  const res = await parseFile(f);
  data1.value = res.data;
  if (!headers.value.length) headers.value = res.headers;
};

const handleFile2Selected = async (f: File) => {
  file2.value = f;
  const res = await parseFile(f);
  data2.value = res.data;
  if (!headers.value.length) headers.value = res.headers;
};

interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  data: any;
  changes?: string[];
}

const diffResults = computed(() => {
  if (data1.value.length === 0 && data2.value.length === 0) return [];

  const results: DiffResult[] = [];
  const maxRows = Math.max(data1.value.length, data2.value.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1.value[i];
    const row2 = data2.value[i];

    if (!row1 && row2) {
      results.push({ type: 'added', data: row2 });
    } else if (row1 && !row2) {
      results.push({ type: 'removed', data: row1 });
    } else {
      const changes: string[] = [];
      headers.value.forEach(h => {
        if (JSON.stringify(row1[h]) !== JSON.stringify(row2[h])) {
          changes.push(h);
        }
      });

      if (changes.length > 0) {
        results.push({ type: 'modified', data: row2, changes });
      } else {
        results.push({ type: 'unchanged', data: row1 });
      }
    }
  }

  return results;
});

const stats = computed(() => {
  return {
    added: diffResults.value.filter(r => r.type === 'added').length,
    removed: diffResults.value.filter(r => r.type === 'removed').length,
    modified: diffResults.value.filter(r => r.type === 'modified').length,
    unchanged: diffResults.value.filter(r => r.type === 'unchanged').length,
  };
});
</script>

<template>
  <div class="max-w-7xl mx-auto py-12 px-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div class="space-y-1">
        <router-link to="/" class="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider hover:gap-3 transition-all mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All Tools
        </router-link>
        <h1 class="text-4xl font-black tracking-tight flex items-center gap-3">
          <GitCompare class="text-blue-500" :size="36" />
          Visual Diff
        </h1>
        <p class="text-muted-foreground">Compare two datasets side-by-side to track additions, deletions, and cell-level changes.</p>
      </div>
    </div>

    <!-- File Upload Section -->
    <div v-if="!file1 || !file2" class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <div class="space-y-4">
        <label class="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Original File (V1)</label>
        <div v-if="!file1">
          <FileUploader @files-selected="handleFile1Selected" />
        </div>
        <div v-else class="p-6 bg-card border border-border/50 rounded-2xl flex items-center justify-between shadow-sm">
           <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                 <FileText :size="20" />
              </div>
              <span class="font-bold text-sm truncate max-w-[200px]">{{ file1.name }}</span>
           </div>
           <button @click="file1 = null; data1 = []" class="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg">
             <X :size="18" />
           </button>
        </div>
      </div>

      <div class="space-y-4">
        <label class="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Modified File (V2)</label>
        <div v-if="!file2">
          <FileUploader @files-selected="handleFile2Selected" />
        </div>
        <div v-else class="p-6 bg-card border border-border/50 rounded-2xl flex items-center justify-between shadow-sm">
           <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                 <FileText :size="20" />
              </div>
              <span class="font-bold text-sm truncate max-w-[200px]">{{ file2.name }}</span>
           </div>
           <button @click="file2 = null; data2 = []" class="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg">
             <X :size="18" />
           </button>
        </div>
      </div>
    </div>

    <!-- Diff Content -->
    <div v-if="file1 && file2" class="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
      <!-- Stats Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
           <div class="flex items-center gap-2 text-emerald-600 font-bold text-sm">
             <PlusCircle :size="16" /> Unchanged
           </div>
           <span class="text-xl font-black text-emerald-600">{{ stats.unchanged }}</span>
        </div>
        <div class="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
           <div class="flex items-center gap-2 text-blue-600 font-bold text-sm">
             <Edit3 :size="16" /> Modified
           </div>
           <span class="text-xl font-black text-blue-600">{{ stats.modified }}</span>
        </div>
        <div class="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between">
           <div class="flex items-center gap-2 text-amber-600 font-bold text-sm">
             <PlusCircle :size="16" /> Added
           </div>
           <span class="text-xl font-black text-amber-600">{{ stats.added }}</span>
        </div>
        <div class="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between">
           <div class="flex items-center gap-2 text-rose-600 font-bold text-sm">
             <MinusCircle :size="16" /> Removed
           </div>
           <span class="text-xl font-black text-rose-600">{{ stats.removed }}</span>
        </div>
      </div>

      <!-- Diff Table -->
      <div class="glass-card rounded-[2rem] border border-border/50 overflow-hidden shadow-2xl">
        <div class="overflow-x-auto max-h-[600px]">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 z-20 bg-muted/95 backdrop-blur-xl shadow-sm">
              <tr>
                <th class="p-4 w-12 border-b border-border/50"></th>
                <th v-for="h in headers" :key="h" class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50">
                  {{ h }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/30">
              <tr 
                v-for="(row, idx) in diffResults" 
                :key="idx"
                class="group transition-colors"
                :class="{
                  'bg-amber-500/5 hover:bg-amber-500/10': row.type === 'added',
                  'bg-rose-500/5 hover:bg-rose-500/10': row.type === 'removed',
                  'bg-blue-500/5 hover:bg-blue-500/10': row.type === 'modified',
                  'hover:bg-muted/30': row.type === 'unchanged'
                }"
              >
                <td class="p-4 text-center">
                  <PlusCircle v-if="row.type === 'added'" :size="14" class="text-amber-500 mx-auto" />
                  <MinusCircle v-else-if="row.type === 'removed'" :size="14" class="text-rose-500 mx-auto" />
                  <Edit3 v-else-if="row.type === 'modified'" :size="14" class="text-blue-500 mx-auto" />
                  <div v-else class="text-[10px] font-bold text-muted-foreground/30">{{ idx + 1 }}</div>
                </td>
                <td 
                  v-for="h in headers" 
                  :key="h" 
                  class="p-4 text-xs font-medium"
                  :class="{ 
                    'text-blue-600 font-bold': row.changes?.includes(h),
                    'text-amber-600': row.type === 'added',
                    'text-rose-600 line-through opacity-50': row.type === 'removed'
                  }"
                >
                  {{ row.data[h] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
