<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import yaml from 'js-yaml';
import { 
  ArrowRightLeft, 
  Loader2, 
  X, 
  Download, 
  FileJson, 
  Table, 
  Check,
  Copy,
  FileType,
  ArrowLeft,
  Sparkles,
  FileText,
  Database,
  Layers,
  FileCode
} from 'lucide-vue-next';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

const file = shallowRef<File | null>(null);
const headers = ref<string[]>([]);
const data = ref<any[]>([]);
const sheets = ref<string[]>([]);
const currentSheet = ref<string>('');
const loading = ref(false);
const processing = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);

const outputFormat = ref<'csv' | 'json' | 'yaml' | 'xlsx' | 'md' | 'sql' | 'html'>('json');

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  headers.value = [];
  data.value = [];
  sheets.value = [];
  currentSheet.value = '';

  try {
    const result = await parseFile(selectedFile);
    headers.value = result.headers;
    data.value = result.data;
    if (result.sheets && result.sheets.length > 0) {
        sheets.value = result.sheets;
        currentSheet.value = result.sheets[0] || '';
    }
    
    // Auto-detect best output format
    if (selectedFile.name.endsWith('.json') || selectedFile.name.endsWith('.yaml') || selectedFile.name.endsWith('.yml')) {
        outputFormat.value = 'csv';
    } else {
        outputFormat.value = 'json';
    }
  } catch (err: any) {
    console.error(err);
    error.value = 'Failed to parse file: ' + (err.message || err);
  } finally {
    loading.value = false;
  }
}

async function changeSheet(sheetName: string) {
    if (!file.value || currentSheet.value === sheetName) return;
    loading.value = true;
    try {
        currentSheet.value = sheetName;
        const result = await parseFile(file.value, sheetName);
        headers.value = result.headers;
        data.value = result.data;
    } catch (err: any) {
        error.value = 'Failed to switch sheet: ' + err.message;
    } finally {
        loading.value = false;
    }
}

// Formatters
const markdownOutput = computed(() => {
  if (!data.value.length || !headers.value.length) return '';
  const headerRow = '| ' + headers.value.join(' | ') + ' |';
  const separatorRow = '| ' + headers.value.map(() => '---').join(' | ') + ' |';
  const bodyRows = data.value.slice(0, 50).map(row => {
    return '| ' + headers.value.map(h => String(row[h] || '').replace(/\|/g, '\\|')).join(' | ') + ' |';
  }).join('\n');
  return `${headerRow}\n${separatorRow}\n${bodyRows}${data.value.length > 50 ? '\n\n... (truncated for preview)' : ''}`;
});

const sqlOutput = computed(() => {
  if (!data.value.length || !headers.value.length) return '';
  const tableName = file.value?.name.replace(/[^a-zA-Z0-9]/g, '_').split('.')[0] || 'table_name';
  const cols = headers.value.map(h => `\`${h}\``).join(', ');
  
  const values = data.value.slice(0, 30).map(row => {
    const rowVals = headers.value.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    }).join(', ');
    return `(${rowVals})`;
  }).join(',\n  ');

  return `INSERT INTO \`${tableName}\` (${cols}) VALUES\n  ${values};${data.value.length > 30 ? '\n\n-- ... (truncated for preview)' : ''}`;
});

const jsonOutput = computed(() => {
  return JSON.stringify(data.value.slice(0, 8), null, 2) + (data.value.length > 8 ? '\n\n... (truncated for preview)' : '');
});

const yamlOutput = computed(() => {
    return yaml.dump(data.value.slice(0, 8)) + (data.value.length > 8 ? '\n... (truncated for preview)' : '');
});

const htmlOutput = computed(() => {
  if (!data.value.length || !headers.value.length) return '';
  const headerRow = '  <thead>\n    <tr>\n' + headers.value.map(h => `      <th>${h}</th>`).join('\n') + '\n    </tr>\n  </thead>';
  const bodyRows = '  <tbody>\n' + data.value.slice(0, 50).map(row => {
    return '    <tr>\n' + headers.value.map(h => `      <td>${row[h] || ''}</td>`).join('\n') + '\n    </tr>';
  }).join('\n') + '\n  </tbody>';
  return `<table class="table">\n${headerRow}\n${bodyRows}\n</table>${data.value.length > 50 ? '\n<!-- ... (truncated for preview) -->' : ''}`;
});

// Respective handlers
function downloadFile() {
  if (!data.value.length) return;
  processing.value = true;
  
  setTimeout(() => {
    try {
      const originalName = file.value?.name || 'data';
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      
      let blob: Blob;
      let filename: string;

      switch(outputFormat.value) {
        case 'csv':
          const csv = Papa.unparse(data.value);
          blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          filename = `${baseName}.csv`;
          break;
        case 'json':
          blob = new Blob([JSON.stringify(data.value, null, 2)], { type: 'application/json' });
          filename = `${baseName}.json`;
          break;
        case 'yaml':
            blob = new Blob([yaml.dump(data.value)], { type: 'text/yaml' });
            filename = `${baseName}.yaml`;
            break;
        case 'md':
          const fullMd = '| ' + headers.value.join(' | ') + ' |\n| ' + 
            headers.value.map(() => '---').join(' | ') + ' |\n' + 
            data.value.map(row => '| ' + headers.value.map(h => String(row[h] || '').replace(/\|/g, '\\|')).join(' | ') + ' |').join('\n');
          blob = new Blob([fullMd], { type: 'text/markdown' });
          filename = `${baseName}.md`;
          break;
        case 'html':
          const fullHtml = `<table class="table">\n  <thead>\n    <tr>\n` + 
            headers.value.map(h => `      <th>${h}</th>`).join('\n') + 
            `\n    </tr>\n  </thead>\n  <tbody>\n` + 
            data.value.map(row => `    <tr>\n` + headers.value.map(h => `      <td>${row[h] || ''}</td>`).join('\n') + `\n    </tr>`).join('\n') + 
            `\n  </tbody>\n</table>`;
          blob = new Blob([fullHtml], { type: 'text/html' });
          filename = `${baseName}.html`;
          break;
        case 'sql':
          const tableName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
          const cols = headers.value.map(h => `\`${h}\``).join(', ');
          const sql = `INSERT INTO \`${tableName}\` (${cols}) VALUES\n  ` + 
            data.value.map(row => '(' + headers.value.map(h => {
                const val = row[h];
                return (val === null || val === undefined) ? 'NULL' : (typeof val === 'number' ? val : `'${String(val).replace(/'/g, "''")}'`);
            }).join(', ') + ')').join(',\n  ') + ';';
          blob = new Blob([sql], { type: 'text/plain' });
          filename = `${baseName}.sql`;
          break;
        case 'xlsx':
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(data.value);
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          blob = new Blob([wbout], { type: 'application/octet-stream' });
          filename = `${baseName}.xlsx`;
          break;
      }

      const url = URL.createObjectURL(blob!);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename!);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      error.value = 'Export failed: ' + err.message;
    } finally {
      processing.value = false;
    }
  }, 100);
}

function copyPreview() {
    let text = '';
    if (outputFormat.value === 'md') text = markdownOutput.value;
    else if (outputFormat.value === 'sql') text = sqlOutput.value;
    else if (outputFormat.value === 'json') text = jsonOutput.value;
    else if (outputFormat.value === 'yaml') text = yamlOutput.value;
    else if (outputFormat.value === 'html') text = htmlOutput.value;
    else if (outputFormat.value === 'csv') text = Papa.unparse(data.value.slice(0, 10));

    navigator.clipboard.writeText(text).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    });
}

function resetTool() {
  file.value = null;
  data.value = [];
  headers.value = [];
  sheets.value = [];
  currentSheet.value = '';
  error.value = null;
}

const formats = [
  { id: 'json', label: 'JSON Object', icon: FileJson, color: 'text-amber-500' },
  { id: 'csv', label: 'CSV File', icon: Table, color: 'text-blue-500' },
  { id: 'xlsx', label: 'Excel Sheet', icon: FileType, color: 'text-emerald-500' },
  { id: 'sql', label: 'SQL Inserts', icon: Database, color: 'text-indigo-500' },
  { id: 'yaml', label: 'YAML File', icon: Layers, color: 'text-rose-500' },
  { id: 'md', label: 'Markdown Table', icon: FileText, color: 'text-slate-500' },
  { id: 'html', label: 'HTML Table', icon: FileCode, color: 'text-orange-500' },
] as const;
</script>

<template>
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4">
    <!-- Premium Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center ring-1 ring-emerald-500/20">
            <ArrowRightLeft :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-black tracking-tight text-foreground">
              Universal <span class="text-emerald-500">Converter</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="data.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          @click="downloadFile" 
          :disabled="processing"
          class="flex items-center gap-2.5 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 group"
        >
          <Loader2 v-if="processing" :size="16" class="animate-spin" />
          <Download v-else :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export {{ outputFormat }}</span>
        </button>

        <button 
          @click="resetTool" 
          class="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all duration-300 active:scale-95 group"
        >
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col relative">
      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-card rounded-[2.5rem]">
          <div class="relative">
            <div class="absolute inset-0 bg-emerald-500/40 rounded-full blur-3xl animate-pulse"></div>
            <div class="relative p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-2xl">
              <Loader2 class="animate-spin text-emerald-500" :size="64" stroke-width="3" />
            </div>
          </div>
          <div class="text-center space-y-2">
            <h4 class="text-2xl font-black tracking-tight uppercase">Restructuring Schema</h4>
            <p class="text-muted-foreground font-bold tracking-widest text-[11px] uppercase opacity-60">Optimizing {{ file?.name }} for conversion</p>
          </div>
        </div>

        <div v-else-if="!file" class="h-full flex flex-col items-center justify-center py-4">
            <div class="text-center space-y-3 mb-8">
               <div class="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                 Schema Agnostic
               </div>
               <h3 class="text-2xl font-black tracking-tight">Bridge your datasets.</h3>
               <p class="text-muted-foreground text-xs font-medium max-w-md mx-auto leading-relaxed">
                 The most versatile data converter. Optimized for modern pipelines.
               </p>
            </div>

            <FileUploader @files-selected="handleFile" accept=".csv,.xlsx,.xls,.json,.yaml,.yml,.txt" class="min-h-[400px]" />
            
            <div class="mt-12 grid grid-cols-5 gap-6 justify-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <div v-for="fmt in formats" :key="fmt.id" class="flex flex-col items-center gap-3">
                  <div class="p-4 bg-muted rounded-2xl border border-border/50">
                     <component :is="fmt.icon" :size="24" :class="fmt.color" />
                  </div>
                  <span class="text-[9px] font-black uppercase tracking-widest">{{ fmt.id }}</span>
               </div>
            </div>
          </div>

        <!-- Converter UI -->
        <div v-else class="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
          
          <!-- Sidebar: Target Configuration -->
          <div class="w-full lg:w-80 flex flex-col gap-5 shrink-0">
            <div class="flex-1 bg-card border border-border/50 rounded-2xl p-5 shadow-2xl flex flex-col overflow-hidden">
              <div v-if="sheets.length > 1" class="mb-6 animate-in slide-in-from-left-2 duration-500">
                 <h3 class="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-4">
                    <Layers :size="12" class="text-amber-500" />
                    Select Sheet
                 </h3>
                 <div class="flex flex-wrap gap-2">
                    <button 
                      v-for="sheet in sheets" 
                      :key="sheet"
                      @click="changeSheet(sheet)"
                      class="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all"
                      :class="currentSheet === sheet ? 'bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-sm' : 'bg-background text-muted-foreground border-border/50 hover:border-amber-500/30 hover:text-foreground'"
                    >
                      {{ sheet }}
                    </button>
                 </div>
              </div>

              <div class="mb-6">
                 <h3 class="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-4">
                    <Sparkles :size="12" class="text-emerald-500" />
                    Target Output
                 </h3>
                 <div class="grid grid-cols-1 gap-2">
                    <button 
                      v-for="fmt in formats" 
                      :key="fmt.id"
                      @click="outputFormat = fmt.id as any"
                      class="flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-300 group/btn"
                      :class="outputFormat === fmt.id ? 'bg-primary/5 border-primary text-primary shadow-lg scale-[1.01]' : 'bg-background border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground'"
                    >
                      <div class="flex items-center gap-3">
                         <div class="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover/btn:bg-background transition-all duration-500 shadow-sm" :class="outputFormat === fmt.id ? 'bg-primary/10' : ''">
                            <component :is="fmt.icon" :size="16" :class="outputFormat === fmt.id ? 'text-primary' : 'opacity-40'" />
                         </div>
                         <div class="flex flex-col items-start translate-y-0.5">
                           <span class="font-black uppercase tracking-[0.1em] text-[9px]">{{ fmt.id }}</span>
                           <span class="text-xs font-bold opacity-60 group-hover/btn:opacity-100 transition-opacity">
                             {{ fmt.label.split(' ')[0] }}
                           </span>
                         </div>
                      </div>
                      <div v-if="outputFormat === fmt.id" class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                        <Check :size="10" stroke-width="4" />
                      </div>
                    </button>
                 </div>
              </div>

              <div class="flex-1 flex flex-col min-h-0">
                 <div class="flex items-center justify-between mb-4">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Live Preview</h4>
                    <button 
                      @click="copyPreview"
                      class="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-xl hover:bg-muted transition-all active:scale-95"
                    >
                      <Check v-if="copied" :size="12" class="text-emerald-500" />
                      <Copy v-else :size="12" />
                      <span class="text-[9px] font-black uppercase tracking-widest">{{ copied ? 'Copied' : 'Copy' }}</span>
                    </button>
                 </div>
                 <div class="flex-1 bg-muted/40 rounded-2xl p-4 font-mono text-xs border border-border/50 overflow-hidden relative group/preview shadow-inner">
                    <pre class="h-full overflow-auto whitespace-pre-wrap break-all opacity-70 leading-relaxed scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">{{ 
                      outputFormat === 'json' ? jsonOutput : 
                      outputFormat === 'yaml' ? yamlOutput :
                      outputFormat === 'sql' ? sqlOutput : 
                      outputFormat === 'md' ? markdownOutput : 
                      outputFormat === 'html' ? htmlOutput :
                      outputFormat === 'csv' ? Papa.unparse(data.slice(0, 5)) : 
                      'Ready for Excel Export...' 
                    }}</pre>
                 </div>
              </div>
            </div>
          </div>

          <!-- Table Area -->
          <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-2">
             <!-- Sheet tabs (Excel multi-sheet) -->
             <div v-if="sheets.length > 1" class="flex flex-wrap items-center gap-2 mb-3 shrink-0 px-1">
               <span class="text-[9px] font-black uppercase text-muted-foreground/70 tracking-widest flex items-center gap-1.5">
                 <Layers :size="10" /> Sheet
               </span>
               <button
                 v-for="s in sheets"
                 :key="s"
                 @click="changeSheet(s)"
                 class="px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate max-w-[140px]"
                 :class="currentSheet === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/50'"
               >
                 {{ s }}
               </button>
             </div>
             <DataTable 
               :headers="headers" 
               :data="data" 
             />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar polish */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border) / 0.5);
  border-radius: 10px;
}
</style>

