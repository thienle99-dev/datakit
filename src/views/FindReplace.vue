<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { 
  Search, 
  ArrowLeft, 
  X, 
  Download, 
  Loader2, 
  Repeat,
  Type
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';
import Papa from 'papaparse';

const file = shallowRef<File | null>(null);
const rawData = ref<any[]>([]);
const headers = ref<string[]>([]);
const loading = ref(false);
const processing = ref(false);

const findText = ref('');
const replaceText = ref('');
const targetColumn = ref('all');
const caseSensitive = ref(false);
const matchWholeCell = ref(false);
const isRegex = ref(false);

const handleFile = async (selectedFile: File) => {
  file.value = selectedFile;
  loading.value = true;
  try {
    const res = await parseFile(selectedFile);
    rawData.value = res.data;
    headers.value = res.headers;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const applyReplace = () => {
  if (!findText.value && !isRegex.value) return;
  processing.value = true;

  setTimeout(() => {
    try {
      const regexFlags = caseSensitive.value ? '' : 'i';
      let searchPattern: RegExp|string = findText.value;
      
      if (isRegex.value) {
        searchPattern = new RegExp(findText.value, regexFlags + 'g');
      }

      rawData.value = rawData.value.map(row => {
        const newRow = { ...row };
        const colsToProcess = targetColumn.value === 'all' ? headers.value : [targetColumn.value];

        colsToProcess.forEach(col => {
          let val = String(newRow[col] || '');
          
          if (isRegex.value) {
            newRow[col] = val.replace(searchPattern as RegExp, replaceText.value);
          } else {
            // Literal replace
            if (matchWholeCell.value) {
              const match = caseSensitive.value ? val === findText.value : val.toLowerCase() === findText.value.toLowerCase();
              if (match) newRow[col] = replaceText.value;
            } else {
              // Partial replace (global)
              const flags = caseSensitive.value ? 'g' : 'gi';
              const escaped = findText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              newRow[col] = val.replace(new RegExp(escaped, flags), replaceText.value);
            }
          }
        });
        return newRow;
      });
    } catch (err) {
      alert('Replace error: ' + err);
    } finally {
      processing.value = false;
    }
  }, 100);
};

const download = () => {
  const csv = Papa.unparse(rawData.value);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `replaced_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const reset = () => {
  file.value = null;
  rawData.value = [];
  headers.value = [];
};
</script>

<template>
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-cyan-500/10 text-cyan-500 rounded-xl flex items-center justify-center ring-1 ring-cyan-500/20">
            <Repeat :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Seek & <span class="text-cyan-500">Destroy</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="file" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="download" 
          class="flex items-center gap-2.5 px-6 py-3 bg-cyan-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all active:scale-95 group"
        >
          <Download :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export Result</span>
        </button>
        <button 
          @click="reset" 
          class="p-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 active:scale-95 group"
        >
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        <div v-if="!file" class="h-full flex flex-col items-center justify-center py-4 w-full">
            <div class="text-center space-y-2 mb-6">
               <h3 class="text-3xl font-black tracking-tight">Find & Replace.</h3>
               <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
                 Global or targeted string substitution with Regex support.
               </p>
            </div>
            <FileUploader @files-selected="(fs) => handleFile(fs[0])" class="w-full max-w-2xl" />
        </div>

        <div v-else class="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 overflow-hidden">
           <!-- Config Sidebar -->
           <div class="w-full lg:w-80 flex flex-col gap-5 shrink-0 h-full overflow-hidden">
              <div class="flex-1 bg-card border border-border/50 rounded-[2rem] p-7 shadow-2xl flex flex-col overflow-hidden">
                 <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-6">
                    <Search :size="12" class="text-cyan-500" /> Operation Config
                 </h3>

                 <div class="space-y-6 flex-1 overflow-y-auto scrollbar-none">
                    <div class="space-y-4">
                       <div class="space-y-1.5">
                          <label class="text-[9px] font-black uppercase text-muted-foreground/40">Find What</label>
                          <div class="relative">
                             <input v-model="findText" type="text" placeholder="Value to seek..." class="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-cyan-500/50" />
                             <Type class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/20" :size="14" />
                          </div>
                       </div>

                       <div class="space-y-1.5">
                          <label class="text-[9px] font-black uppercase text-muted-foreground/40">Replace With</label>
                          <input v-model="replaceText" type="text" placeholder="New value..." class="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-cyan-500/50" />
                       </div>

                       <div class="space-y-1.5">
                          <label class="text-[9px] font-black uppercase text-muted-foreground/40">Target Column</label>
                          <select v-model="targetColumn" class="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                             <option value="all">Everywhere (All Columns)</option>
                             <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
                          </select>
                       </div>

                       <div class="pt-4 space-y-3">
                          <label class="flex items-center gap-3 cursor-pointer group">
                             <input type="checkbox" v-model="caseSensitive" class="rounded border-border text-cyan-600 focus:ring-cyan-500" />
                             <span class="text-xs font-bold text-muted-foreground/60 group-hover:text-foreground">Case Sensitive</span>
                          </label>
                          <label class="flex items-center gap-3 cursor-pointer group">
                             <input type="checkbox" v-model="matchWholeCell" class="rounded border-border text-cyan-600 focus:ring-cyan-500" />
                             <span class="text-xs font-bold text-muted-foreground/60 group-hover:text-foreground">Match Whole Cell Only</span>
                          </label>
                          <label class="flex items-center gap-3 cursor-pointer group">
                             <input type="checkbox" v-model="isRegex" class="rounded border-border text-cyan-600 focus:ring-cyan-500" />
                             <span class="text-xs font-bold text-muted-foreground/60 group-hover:text-foreground">Use Regular Expression</span>
                          </label>
                       </div>
                    </div>
                 </div>

                 <div class="mt-auto pt-6 border-t border-border/50">
                    <button 
                      @click="applyReplace"
                      :disabled="processing"
                      class="w-full flex items-center justify-center gap-3 py-4 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                       <Loader2 v-if="processing" class="animate-spin" :size="14" />
                       <Repeat v-else :size="14" />
                       Apply Transformation
                    </button>
                 </div>
              </div>
           </div>

           <!-- Preview Area -->
           <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-1.5">
              <DataTable 
                :headers="headers"
                :data="rawData"
              />
           </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
