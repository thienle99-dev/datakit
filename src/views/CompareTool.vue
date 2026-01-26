<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { 
  GitCompare, 
  X, 
  FileText,
  MinusCircle,
  PlusCircle,
  Edit3,
  ArrowLeft,
  Database,
  Zap,
  Activity,
  Check
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
    unchanged: diffResults.value.filter(r => r.type === 'unchanged').length,
    modified: diffResults.value.filter(r => r.type === 'modified').length,
    added: diffResults.value.filter(r => r.type === 'added').length,
    removed: diffResults.value.filter(r => r.type === 'removed').length,
  };
});

function reset() {
    file1.value = null;
    file2.value = null;
    data1.value = [];
    data2.value = [];
    headers.value = [];
}
</script>

<template>
  <div class="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6 lg:p-10">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
      <div class="space-y-4 max-w-2xl">
        <router-link to="/" class="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all mb-2">
          <ArrowLeft :size="14" class="group-hover:-translate-x-1 transition-transform" />
          Back to Toolkit
        </router-link>
        
        <div class="flex items-center gap-6">
          <div class="p-4 bg-blue-500/10 text-blue-500 rounded-[2rem] shadow-inner ring-1 ring-blue-500/20">
            <GitCompare :size="40" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-2">
              Visual <span class="text-blue-500">Diff</span>
            </h2>
            <p class="text-muted-foreground text-lg font-medium leading-relaxed">
              Side-by-side reconciliation of divergent datasets.
            </p>
          </div>
        </div>
      </div>

      <div v-if="file1 && file2" class="animate-in fade-in slide-in-from-right-8 duration-700">
        <button 
          @click="reset" 
          class="flex items-center gap-3 px-6 py-4 bg-card hover:bg-muted text-foreground border border-border/50 rounded-2xl transition-all duration-300 font-bold active:scale-95 group"
        >
          <X :size="20" class="group-hover:rotate-90 transition-transform duration-500" />
          <span>Reset Comparison</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        <!-- Initial Upload State -->
        <div v-if="!file1 || !file2" class="h-full grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in zoom-in-95 duration-1000">
           <div class="flex flex-col gap-6">
              <div class="flex items-center justify-between px-4">
                 <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Database :size="14" class="text-blue-500" /> Source Logic (V1)
                 </h3>
                 <div v-if="file1" class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Loaded ✓</div>
              </div>
              <div v-if="!file1" class="flex-1">
                 <FileUploader @files-selected="handleFile1Selected" class="h-full !min-h-[300px]" />
              </div>
              <div v-else class="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                 <div class="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div class="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <FileText :size="32" />
                 </div>
                 <h4 class="font-black text-2xl tracking-tighter mb-2">{{ file1.name }}</h4>
                 <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{{ data1.length.toLocaleString() }} Entries detected</p>
                 <button @click="file1 = null; data1 = []" class="mt-8 px-5 py-2.5 bg-rose-500/10 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">Drop Origin</button>
              </div>
           </div>

           <div class="flex flex-col gap-6">
              <div class="flex items-center justify-between px-4">
                 <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Zap :size="14" class="text-purple-500" /> Target Manifest (V2)
                 </h3>
                 <div v-if="file2" class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Loaded ✓</div>
              </div>
              <div v-if="!file2" class="flex-1">
                 <FileUploader @files-selected="handleFile2Selected" class="h-full !min-h-[300px]" />
              </div>
              <div v-else class="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                 <div class="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div class="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <FileText :size="32" />
                 </div>
                 <h4 class="font-black text-2xl tracking-tighter mb-2">{{ file2.name }}</h4>
                 <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{{ data2.length.toLocaleString() }} Entries detected</p>
                 <button @click="file2 = null; data2 = []" class="mt-8 px-5 py-2.5 bg-rose-500/10 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">Drop Target</button>
              </div>
           </div>
        </div>

        <!-- Diff Workspace -->
        <div v-else class="h-full flex flex-col gap-8 animate-in slide-in-from-bottom-12 duration-1000 overflow-hidden">
           <!-- Premium Stats Bar -->
           <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
              <div v-for="(val, key) in stats" :key="key" class="bg-card border border-border/50 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                 <div class="flex items-center justify-between mb-2">
                    <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity" :class="{
                       'text-emerald-500': key === 'unchanged',
                       'text-blue-500': key === 'modified',
                       'text-amber-500': key === 'added',
                       'text-rose-500': key === 'removed'
                    }">{{ key }}</span>
                    <component :is="key === 'added' ? PlusCircle : key === 'removed' ? MinusCircle : key === 'modified' ? Edit3 : Check" 
                      :size="14" 
                      :class="{
                        'text-emerald-500': key === 'unchanged',
                        'text-blue-500': key === 'modified',
                        'text-amber-500': key === 'added',
                        'text-rose-500': key === 'removed'
                      }"
                    />
                 </div>
                 <div class="text-4xl font-black tracking-tighter">{{ val }}</div>
                 <div class="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Activity :size="64" />
                 </div>
              </div>
           </div>

           <!-- Multi-threaded Diff Table -->
           <div class="flex-1 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-2">
              <div class="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent rounded-[2rem]">
                 <table class="w-full text-left border-separate border-spacing-0">
                    <thead class="sticky top-0 z-10">
                       <tr>
                          <th class="bg-muted p-5 border-b border-border/50 w-16"></th>
                          <th v-for="h in headers" :key="h" class="bg-muted p-5 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                             {{ h }}
                          </th>
                       </tr>
                    </thead>
                    <tbody class="divide-y divide-border/20">
                       <tr v-for="(row, idx) in diffResults" :key="idx" 
                           class="group transition-all duration-300"
                           :class="{
                             'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]': row.type === 'unchanged',
                             'bg-blue-500/[0.03] hover:bg-blue-500/[0.08]': row.type === 'modified',
                             'bg-amber-500/[0.03] hover:bg-amber-500/[0.08]': row.type === 'added',
                             'bg-rose-500/[0.03] hover:bg-rose-500/[0.08]': row.type === 'removed'
                           }">
                          <td class="p-5 text-center border-r border-border/10">
                             <PlusCircle v-if="row.type === 'added'" :size="16" class="text-amber-500 mx-auto" />
                             <MinusCircle v-else-if="row.type === 'removed'" :size="16" class="text-rose-500 mx-auto" />
                             <Edit3 v-else-if="row.type === 'modified'" :size="16" class="text-blue-500 mx-auto" />
                             <Check v-else :size="16" class="text-emerald-500 opacity-20 group-hover:opacity-60 mx-auto" />
                          </td>
                          <td v-for="h in headers" :key="h" class="p-5 text-xs font-medium transition-all"
                              :class="{
                               'text-blue-500 font-black px-6 bg-blue-500/5 shadow-inner rounded-lg': row.changes?.includes(h),
                               'text-amber-500 font-bold': row.type === 'added',
                               'text-rose-500/40 line-through italic': row.type === 'removed',
                               'text-foreground/80': row.type === 'unchanged'
                              }">
                             {{ row.data[h] }}
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar polish */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border) / 0.5);
  border-radius: 10px;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 60px);
  filter: blur(10px);
}
</style>
