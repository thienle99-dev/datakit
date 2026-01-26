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
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center ring-1 ring-blue-500/20">
            <GitCompare :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Visual <span class="text-blue-500">Diff</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="file1 && file2" class="animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="reset" 
          class="flex items-center gap-2 px-5 py-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 font-bold active:scale-95 group"
        >
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
          <span class="text-[11px] uppercase tracking-widest">Reset</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        <!-- Initial Upload State -->
        <div v-if="!file1 || !file2" class="h-full grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in zoom-in-95 duration-1000">
            <div class="flex flex-col gap-4">
               <div class="flex items-center justify-between px-4">
                  <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                     <Database :size="14" class="text-blue-500" /> Source Logic (V1)
                  </h3>
                  <div v-if="file1" class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Loaded ✓</div>
               </div>
               <div v-if="!file1" class="flex-1">
                  <FileUploader @files-selected="handleFile1Selected" class="h-full !min-h-[250px]" />
               </div>
               <div v-else class="flex-1 bg-card border border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                  <div class="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                     <FileText :size="20" />
                  </div>
                  <h4 class="font-black text-lg tracking-tighter mb-1">{{ file1.name }}</h4>
                  <p class="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{{ data1.length.toLocaleString() }} Entries detected</p>
                  <button @click="file1 = null; data1 = []" class="mt-4 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">Drop Origin</button>
               </div>
            </div>

            <div class="flex flex-col gap-4">
               <div class="flex items-center justify-between px-4">
                  <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                     <Zap :size="14" class="text-purple-500" /> Target Manifest (V2)
                  </h3>
                  <div v-if="file2" class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Loaded ✓</div>
               </div>
               <div v-if="!file2" class="flex-1">
                  <FileUploader @files-selected="handleFile2Selected" class="h-full !min-h-[250px]" />
               </div>
               <div v-else class="flex-1 bg-card border border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                  <div class="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-3 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                     <FileText :size="20" />
                  </div>
                  <h4 class="font-black text-lg tracking-tighter mb-1">{{ file2.name }}</h4>
                  <p class="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{{ data2.length.toLocaleString() }} Entries detected</p>
                  <button @click="file2 = null; data2 = []" class="mt-4 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">Drop Target</button>
               </div>
            </div>
        </div>

        <!-- Diff Workspace -->
        <div v-else class="h-full flex flex-col gap-8 animate-in slide-in-from-bottom-12 duration-1000 overflow-hidden">
           <!-- Premium Stats Bar -->
           <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 shrink-0">
              <div v-for="(val, key) in stats" :key="key" class="bg-card border border-border/50 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                 <div class="flex items-center justify-between mb-4">
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity" :class="{
                       'text-emerald-500': key === 'unchanged',
                       'text-blue-500': key === 'modified',
                       'text-amber-500': key === 'added',
                       'text-rose-500': key === 'removed'
                    }">{{ key }}</span>
                    <component :is="key === 'added' ? PlusCircle : key === 'removed' ? MinusCircle : key === 'modified' ? Edit3 : Check" 
                      :size="18" 
                      :class="{
                        'text-emerald-500': key === 'unchanged',
                        'text-blue-500': key === 'modified',
                        'text-amber-500': key === 'added',
                        'text-rose-500': key === 'removed'
                      }"
                    />
                 </div>
                 <div class="text-5xl font-black tracking-tighter">{{ val.toLocaleString() }}</div>
                 <div class="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity rotate-12">
                    <Activity :size="80" />
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
