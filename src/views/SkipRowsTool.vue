<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Download, X, Loader2, ArrowLeft, ListOrdered, Info } from 'lucide-vue-next';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';

const file = ref<File | null>(null);
const rawRows = ref<any[][]>([]);
const headerRowIndex = ref(1); // 1-based
const outHeaders = ref<string[]>([]);
const outData = ref<any[]>([]);

const loading = ref(false);
const error = ref<string | null>(null);

const maxHeaderRow = computed(() => Math.max(1, rawRows.value.length));

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  rawRows.value = [];
  outHeaders.value = [];
  outData.value = [];

  try {
    const ext = (selectedFile.name.split('.').pop() || '').toLowerCase();
    if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
      const text = await selectedFile.text();
      const res = Papa.parse(text, { header: false, skipEmptyLines: 'greedy' });
      rawRows.value = (res.data as any[][]).filter(row => row && row.length);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buf = await selectedFile.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const firstSheet = wb.SheetNames[0];
      if (!firstSheet) throw new Error('No sheets in workbook');
      const sheet = wb.Sheets[firstSheet];
      if (!sheet) throw new Error('Sheet not found');
      const arr = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      rawRows.value = arr.map(row => Array.isArray(row) ? row : [row]);
    } else {
      throw new Error('Only CSV, TSV, or Excel supported.');
    }
    headerRowIndex.value = 1;
    applyHeaderRow();
  } catch (e: any) {
    error.value = e?.message || 'Parse failed';
  } finally {
    loading.value = false;
  }
}

function applyHeaderRow() {
  const rows = rawRows.value;
  const hi = Math.min(Math.max(1, headerRowIndex.value), rows.length) - 1;
  const headerRow = rows[hi];
  const headers = (headerRow || []).map((h: any, i: number) => String(h ?? '').trim() || `Column ${i + 1}`);
  const dataRows = rows.slice(hi + 1);
  outHeaders.value = headers;
  outData.value = dataRows.map(row => {
    const obj: any = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

watch(headerRowIndex, () => applyHeaderRow());

function downloadResult() {
  const csv = Papa.unparse({ fields: outHeaders.value, data: outData.value });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${file.value?.name.replace(/\.[^.]+$/, '')}_header_fixed.csv`;
  a.click();
}

function closeTool() {
  file.value = null;
  rawRows.value = [];
  outHeaders.value = [];
  outData.value = [];
  error.value = null;
}
</script>

<template>
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-sky-500/10 text-sky-500 rounded-xl flex items-center justify-center ring-1 ring-sky-500/20">
            <ListOrdered :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Skip Rows & <span class="text-sky-500">Set Header</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="outData.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button
          @click="downloadResult"
          class="flex items-center gap-2.5 px-6 py-3 bg-sky-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-sky-500/20 transition-all active:scale-95 group"
        >
          <Download :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export CSV</span>
        </button>
        <button @click="closeTool" class="p-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 active:scale-95 group">
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-card rounded-[2rem]">
        <Loader2 class="animate-spin text-sky-500" :size="48" stroke-width="3" />
        <h4 class="text-xl font-black tracking-tight uppercase">Reading file...</h4>
      </div>

      <div v-else-if="!file" class="h-full flex flex-col items-center justify-center py-4 w-full">
        <div class="text-center space-y-2 mb-6">
          <h3 class="text-3xl font-black tracking-tight">Choose header row.</h3>
          <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
            Upload CSV or Excel, then set which row is the header and skip the rest above it.
          </p>
        </div>
        <FileUploader @files-selected="handleFile" class="w-full max-w-2xl" />
      </div>

      <div v-else class="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 overflow-hidden">
        <div class="w-full lg:w-72 flex flex-col gap-5 shrink-0 overflow-hidden">
          <div class="flex-1 bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl flex flex-col overflow-hidden">
            <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-4">
              <ListOrdered :size="12" class="text-sky-500" />
              Options
            </h3>
            <div class="space-y-4">
              <div>
                <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 block mb-2">Header at row (1-based)</label>
                <input
                  v-model.number="headerRowIndex"
                  type="number"
                  min="1"
                  :max="maxHeaderRow"
                  class="w-full px-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-foreground font-mono"
                />
                <p class="text-[10px] text-muted-foreground mt-1">Rows 1 to {{ headerRowIndex - 1 }} are skipped. Row {{ headerRowIndex }} = headers.</p>
              </div>
              <div class="p-3 bg-sky-500/5 rounded-xl border border-sky-500/10 flex gap-2">
                <Info :size="14" class="shrink-0 mt-0.5 text-sky-500" />
                <p class="text-[10px] text-muted-foreground">Total raw rows: {{ rawRows.length }} → {{ outData.length }} data rows after header.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden p-1.5">
          <DataTable v-if="outData.length > 0" :headers="outHeaders" :data="outData" />
        </div>
      </div>
    </div>
  </div>
</template>
