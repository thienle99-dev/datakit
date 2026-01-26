<script setup lang="ts">
import { ref, computed } from 'vue';
import { Download, X, Loader2, ArrowLeft, Shuffle, Percent, Hash } from 'lucide-vue-next';
import Papa from 'papaparse';
import FileUploader from '../components/shared/FileUploader.vue';
import DataTable from '../components/shared/DataTable.vue';
import { parseFile } from '../utils/fileParser';

type Mode = 'first' | 'last' | 'random' | 'percent';

const file = ref<File | null>(null);
const headers = ref<string[]>([]);
const allData = ref<any[]>([]);
const sampledData = ref<any[]>([]);

const mode = ref<Mode>('random');
const count = ref(100);
const percent = ref(10);

const loading = ref(false);
const error = ref<string | null>(null);

async function handleFile(selectedFile: File) {
  file.value = selectedFile;
  loading.value = true;
  error.value = null;
  allData.value = [];
  sampledData.value = [];

  try {
    const result = await parseFile(selectedFile);
    headers.value = result.headers;
    allData.value = result.data;
    applySample();
  } catch (e: any) {
    error.value = e?.message || 'Parse failed';
  } finally {
    loading.value = false;
  }
}

function applySample() {
  const n = allData.value.length;
  if (n === 0) {
    sampledData.value = [];
    return;
  }

  let indices: number[];
  if (mode.value === 'first') {
    const k = Math.min(Math.max(0, count.value), n);
    indices = Array.from({ length: k }, (_, i) => i);
  } else if (mode.value === 'last') {
    const k = Math.min(Math.max(0, count.value), n);
    indices = Array.from({ length: k }, (_, i) => n - 1 - i).reverse();
  } else if (mode.value === 'percent') {
    const p = Math.min(100, Math.max(0, percent.value)) / 100;
    const k = Math.max(0, Math.floor(n * p));
    indices = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = indices[i]!;
      const b = indices[j]!;
      indices[i] = b;
      indices[j] = a;
    }
    indices = indices.slice(0, k);
  } else {
    const k = Math.min(Math.max(0, count.value), n);
    const pool = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = pool[i]!;
      const b = pool[j]!;
      pool[i] = b;
      pool[j] = a;
    }
    indices = pool.slice(0, k).sort((a, b) => a - b);
  }

  sampledData.value = indices.map(i => allData.value[i]);
}

const totalRows = computed(() => allData.value.length);
const sampledRows = computed(() => sampledData.value.length);

function downloadResult() {
  const csv = Papa.unparse({ fields: headers.value, data: sampledData.value });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${file.value?.name.replace(/\.[^.]+$/, '')}_sample.csv`;
  a.click();
}

function resample() {
  applySample();
}

function closeTool() {
  file.value = null;
  allData.value = [];
  sampledData.value = [];
  headers.value = [];
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
          <div class="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20">
            <Shuffle :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Random <span class="text-amber-500">Sample</span>
            </h2>
          </div>
        </div>
      </div>

      <div v-if="sampledData.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <button
          v-if="mode === 'random' || mode === 'percent'"
          @click="resample"
          class="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-xl font-bold text-xs hover:bg-amber-500/20 transition-all"
        >
          <Shuffle :size="14" />
          Resample
        </button>
        <button
          @click="downloadResult"
          class="flex items-center gap-2.5 px-6 py-3 bg-amber-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95 group"
        >
          <Download :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export</span>
        </button>
        <button @click="closeTool" class="p-3 bg-card hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all duration-300 active:scale-95 group">
          <X :size="18" class="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-card rounded-[2rem]">
        <Loader2 class="animate-spin text-amber-500" :size="48" stroke-width="3" />
        <h4 class="text-xl font-black tracking-tight uppercase">Loading...</h4>
      </div>

      <div v-else-if="!file" class="h-full flex flex-col items-center justify-center py-4 w-full">
        <div class="text-center space-y-2 mb-6">
          <h3 class="text-3xl font-black tracking-tight">Sample your data.</h3>
          <p class="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed opacity-60">
            Take the first N, last N, or a random sample. Perfect for train/test splits or quick previews.
          </p>
        </div>
        <FileUploader @files-selected="handleFile" class="w-full max-w-2xl" />
      </div>

      <div v-else class="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 overflow-hidden">
        <div class="w-full lg:w-80 flex flex-col gap-5 shrink-0 overflow-hidden">
          <div class="flex-1 bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl flex flex-col overflow-hidden">
            <h3 class="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-4">
              <Shuffle :size="12" class="text-amber-500" />
              Sample mode
            </h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="m in [{ id: 'first', label: 'First N', icon: Hash }, { id: 'last', label: 'Last N', icon: Hash }, { id: 'random', label: 'Random N', icon: Shuffle }, { id: 'percent', label: 'Random %', icon: Percent }]"
                  :key="m.id"
                  @click="mode = m.id as Mode; applySample()"
                  class="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-[11px] font-bold transition-all"
                  :class="mode === m.id ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' : 'bg-muted/20 border-border/50 hover:border-amber-500/20'"
                >
                  <component :is="m.icon" :size="14" />
                  {{ m.label }}
                </button>
              </div>
              <div v-if="mode === 'percent'">
                <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 block mb-1">Percent %</label>
                <input v-model.number="percent" type="number" min="1" max="100" class="w-full px-3 py-2 rounded-lg border border-border/50 bg-muted/20" @change="applySample" />
              </div>
              <div v-else>
                <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 block mb-1">Count</label>
                <input v-model.number="count" type="number" min="1" class="w-full px-3 py-2 rounded-lg border border-border/50 bg-muted/20" @change="applySample" />
              </div>
              <div class="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] text-muted-foreground">
                Total: {{ totalRows }} rows → Sample: {{ sampledRows }} rows
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0 bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden p-1.5">
          <DataTable v-if="sampledData.length > 0" :headers="headers" :data="sampledData" />
        </div>
      </div>
    </div>
  </div>
</template>
