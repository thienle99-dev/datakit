<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  BarChart3, 
  ArrowLeft, 
  Upload, 
  Clipboard, 
  Settings2, 
  Download, 
  Layout,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChart,
  Radar,
  Sparkles,
  Check,
  Table,
  List,
  MessageSquare,
  Grid3X3,
  Zap,
  Type,
  Pencil,
  X
} from 'lucide-vue-next';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import VueApexCharts from 'vue3-apexcharts';

// Types
type InputMethod = 'upload' | 'paste' | 'manual';
type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar';

interface ChartConfig {
  title: string;
  type: ChartType;
  xAxis: string;
  yAxis: string[];
  stacked: boolean;
  horizontal: boolean;
  showLabels: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  showGrid: boolean;
  animations: boolean;
  curve: 'smooth' | 'straight' | 'stepline';
  barBorderRadius: number;
  colors: string[];
}

// State
const inputMethod = ref<InputMethod>('upload');
const rawDataString = ref('');
const parsedData = ref<any[]>([]);
const headers = ref<string[]>([]);
const isProcessing = ref(false);

const config = ref<ChartConfig>({
  title: 'My Visualization',
  type: 'bar',
  xAxis: '',
  yAxis: [],
  stacked: false,
  horizontal: false,
  showLabels: true,
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  animations: true,
  curve: 'smooth',
  barBorderRadius: 8,
  colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
});

const chartRef = ref<any>(null);

// Edit data modal
const showEditModal = ref(false);
const editDraft = ref<any[]>([]);
const editPage = ref(1);
const EDIT_PAGE_SIZE = 20;

const editPaginatedRows = computed(() => {
  const start = (editPage.value - 1) * EDIT_PAGE_SIZE;
  return editDraft.value.slice(start, start + EDIT_PAGE_SIZE);
});
const editTotalPages = computed(() => Math.max(1, Math.ceil(editDraft.value.length / EDIT_PAGE_SIZE)));

function openEditModal() {
  editDraft.value = JSON.parse(JSON.stringify(parsedData.value));
  editPage.value = 1;
  showEditModal.value = true;
}

function saveEditModal() {
  parsedData.value = JSON.parse(JSON.stringify(editDraft.value));
  rawDataString.value = Papa.unparse(parsedData.value);
  showEditModal.value = false;
}

function closeEditModal() {
  showEditModal.value = false;
}

// Palette options: name + colors (min 5 colors so series stay consistent)
const palettes: { name: string; colors: string[] }[] = [
  { name: 'Indigo Mix', colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'] },
  { name: 'Ocean', colors: ['#3b82f6', '#0ea5e9', '#06b6d4', '#2dd4bf', '#10b981'] },
  { name: 'Rose', colors: ['#f43f5e', '#fb7185', '#fda4af', '#e879f9', '#c084fc'] },
  { name: 'Amber', colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'] },
  { name: 'Zinc', colors: ['#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#f4f4f5'] },
  { name: 'Emerald', colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'] },
  { name: 'Sky', colors: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'] },
  { name: 'Violet', colors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'] },
  { name: 'Slate', colors: ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'] },
  { name: 'Sunset', colors: ['#dc2626', '#ea580c', '#f59e0b', '#eab308', '#84cc16'] },
  { name: 'Mint', colors: ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'] },
  { name: 'Berry', colors: ['#be185d', '#db2777', '#ec4899', '#f472b6', '#f9a8d4'] },
  { name: 'Forest', colors: ['#15803d', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'] },
  { name: 'Steel', colors: ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'] },
  { name: 'Coral', colors: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'] },
];

// Computed
const chartOptions = computed(() => {
  const isPie = config.value.type === 'pie' || config.value.type === 'donut';
  const isRadar = config.value.type === 'radar';
  
  const options: any = {
    chart: {
      id: 'main-chart',
      type: config.value.type,
      stacked: config.value.stacked,
      toolbar: { show: false },
      fontFamily: 'Outfit, sans-serif',
      foreColor: 'var(--color-muted-foreground)',
      animations: {
        enabled: config.value.animations,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: config.value.animations, delay: 150 },
      },
      background: 'transparent'
    },
    colors: config.value.colors,
    stroke: {
      curve: ['line', 'area', 'radar'].includes(config.value.type) ? config.value.curve : 'smooth',
      width: config.value.type === 'line' || config.value.type === 'area' || config.value.type === 'radar' ? 2 : 0
    },
    title: {
      text: config.value.title,
      align: 'left',
      style: {
        fontSize: '12px',
        fontWeight: '700',
        fontFamily: 'Outfit, sans-serif',
        color: 'var(--color-foreground)'
      }
    },
    markers: {
      size: ['line', 'area', 'scatter', 'radar'].includes(config.value.type) ? (config.value.type === 'scatter' ? 4 : 3) : 0,
      strokeWidth: 1.5,
      strokeColors: '#fff',
      hover: { size: 6 }
    },
    dataLabels: {
      enabled: config.value.showLabels,
      style: {
         fontFamily: 'Outfit, sans-serif',
         fontWeight: '700',
         fontSize: '9px'
      },
      dropShadow: { enabled: false }
    },
    legend: {
      show: config.value.showLegend,
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '600',
      fontSize: '10px'
    },
    tooltip: {
      enabled: config.value.showTooltip,
      theme: 'dark',
      x: { show: true },
      y: { formatter: (val: number) => val.toLocaleString() }
    },
    theme: { mode: 'dark' }
  };

  if (isPie) {
    options.labels = parsedData.value.map(row => (config.value.xAxis ? row[config.value.xAxis] : 'N/A') || 'N/A');
  } else if (isRadar) {
    options.xaxis = {
        categories: parsedData.value.map(row => (config.value.xAxis ? row[config.value.xAxis] : '') || ''),
        labels: {
            style: {
                fontWeight: 600,
                fontSize: '9px'
            }
        }
    };
  } else if (config.value.type === 'scatter') {
     options.xaxis = {
        type: 'numeric',
        tickAmount: 10,
        labels: {
            formatter: (val: number) => val.toFixed(1)
        }
     };
  } else {
    options.xaxis = {
      categories: parsedData.value.map(row => (config.value.xAxis ? row[config.value.xAxis] : '') || ''),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontWeight: 600,
          fontSize: '9px'
        }
      }
    };
    options.yaxis = options.yaxis || {};
    options.yaxis.labels = { style: { fontSize: '9px', fontWeight: 600 } };
    options.grid = {
      show: config.value.showGrid,
      borderColor: 'var(--color-border)',
      strokeDashArray: 4,
      padding: { top: 6, right: 16, bottom: 0, left: 6 }
    };
    options.plotOptions = {
        bar: {
            horizontal: config.value.horizontal,
            borderRadius: config.value.barBorderRadius,
            columnWidth: '60%'
        }
    };
  }

  return options;
});

const chartSeries = computed(() => {
  if (config.value.type === 'pie' || config.value.type === 'donut') {
    return parsedData.value.map(row => {
      const yKey = config.value.yAxis[0];
      const val = yKey ? parseFloat(row[yKey]) : 0;
      return isNaN(val) ? 0 : val;
    });
  }

  if (config.value.type === 'scatter') {
      const xKey = config.value.xAxis;
      // Scatter needs [x, y] pairs
      // If xAxis is numeric, we use it. If not, we might fail or map index.
      // Re-map simple [x, y]
      return config.value.yAxis.map(yKey => ({
          name: yKey,
          data: parsedData.value.map((row, idx) => {
             const xVal = parseFloat(row[xKey]);
             const yVal = parseFloat(row[yKey]);
             return [isNaN(xVal) ? idx : xVal, isNaN(yVal) ? 0 : yVal];
          })
      }));
  }

  return config.value.yAxis.map(col => ({
    name: col,
    data: parsedData.value.map(row => {
      const val = parseFloat(row[col]);
      return isNaN(val) ? 0 : val;
    })
  }));
});

// Logic
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isProcessing.value = true;
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setData(results.data, results.meta.fields || []);
        }
      });
    } else if (['xlsx', 'xls', 'ods'].includes(extension || '')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) return;
        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) return;
        const json = XLSX.utils.sheet_to_json(worksheet);
        if (json.length > 0) {
          setData(json, Object.keys(json[0] as any));
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === 'json') {
      const text = await file.text();
      const json = JSON.parse(text);
      if (Array.isArray(json) && json.length > 0) {
        setData(json, Object.keys(json[0]));
      }
    }
  } catch (err) {
    console.error('File parse error:', err);
  } finally {
    isProcessing.value = false;
  }
};

const handlePaste = () => {
    if (!rawDataString.value) return;
    isProcessing.value = true;
    
    try {
        // Try JSON first
        if (rawDataString.value.trim().startsWith('[') || rawDataString.value.trim().startsWith('{')) {
          const json = JSON.parse(rawDataString.value);
          const data = Array.isArray(json) ? json : [json];
          setData(data, Object.keys(data[0]));
          return;
        }

        // Fallback to CSV/TSV
        const result = Papa.parse(rawDataString.value, { 
            header: true, 
            dynamicTyping: true, 
            skipEmptyLines: true 
        });
        setData(result.data, result.meta.fields || []);
    } catch (err) {
        console.error('Paste parse error:', err);
    } finally {
        isProcessing.value = false;
    }
};

const setData = (data: any[], cols: string[]) => {
  parsedData.value = data.slice(0, 500); // UI limit
  headers.value = cols;
  
  // Auto-config
  if (cols.length >= 2) {
    config.value.xAxis = cols[0] || '';
    const numericCols = cols.slice(1).filter(c => {
       if (!c || !data[0]) return false;
       const sample = data[0][c];
       return typeof sample === 'number' || !isNaN(parseFloat(sample));
    }) as string[];
    config.value.yAxis = numericCols.length > 0 ? [numericCols[0] as string] : [cols[1] as string];
  }
};

const toggleYAxis = (col: string) => {
  const index = config.value.yAxis.indexOf(col);
  if (index > -1) {
    config.value.yAxis.splice(index, 1);
  } else {
    config.value.yAxis.push(col);
  }
};

const exportChart = async (format: 'png' | 'svg') => {
  if (!chartRef.value) return;
  const chartInstance = (chartRef.value as any).chart;
  if (!chartInstance) return;
  
  if (format === 'png') {
    const dataUrl = await chartInstance.dataURI();
    const link = document.createElement('a');
    link.href = dataUrl.imgURI;
    link.download = `${config.value.title}.png`;
    link.click();
  } else {
    // ApexCharts SVG export is usually built-in, but dataURI gives PNG by default
    // We can use the build-in export if visible, otherwise this is fine
    chartInstance.exports.exportToSVG();
  }
};

onMounted(() => {
    // Demo data
    setData([
        { Month: 'Jan', Revenue: 45000, Users: 1200 },
        { Month: 'Feb', Revenue: 52000, Users: 1500 },
        { Month: 'Mar', Revenue: 48000, Users: 1900 },
        { Month: 'Apr', Revenue: 61000, Users: 2400 },
        { Month: 'May', Revenue: 55000, Users: 2100 },
        { Month: 'Jun', Revenue: 67000, Users: 3000 },
    ], ['Month', 'Revenue', 'Users']);
});
</script>

<template>
  <div class="w-full h-full flex flex-col p-4 md:p-6 bg-background overflow-hidden relative">
    
    <!-- Header -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 shrink-0 relative z-[60]">
      <div class="flex items-center gap-5">
        <router-link to="/" class="group flex items-center justify-center w-12 h-12 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-all hover:scale-105 active:scale-95">
          <ArrowLeft :size="20" class="text-muted-foreground group-hover:text-primary transition-all" />
        </router-link>
        
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
            <BarChart3 :size="20" class="text-white" />
          </div>
          <div>
            <h1 class="text-base font-bold tracking-tight text-foreground leading-tight">
              Data <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Visualization</span>
            </h1>
            <p class="text-2xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
               <Sparkles :size="10" /> Beautiful charts in seconds
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center bg-card border border-border p-1 rounded-2xl shadow-sm">
            <button 
                v-for="method in ['upload', 'paste', 'manual']" 
                :key="method"
                @click="inputMethod = method as any"
                class="px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest flex items-center gap-2"
                :class="inputMethod === method ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'"
            >
              <Upload v-if="method === 'upload'" :size="14" />
              <Clipboard v-else-if="method === 'paste'" :size="14" />
              <Table v-else :size="14" />
              {{ method }}
            </button>
        </div>

        <div class="h-8 w-px bg-border mx-2"></div>

        <button 
          @click="exportChart('png')"
          class="flex items-center gap-3 px-8 py-3 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:shadow-2xl transition-all active:scale-95 group"
        >
          <Download :size="16" class="group-hover:translate-y-0.5 transition-transform" />
          <span>Export PNG</span>
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 relative">
      
      <!-- Side Controls -->
      <aside class="w-full lg:w-80 flex flex-col gap-4 shrink-0 h-full">
        
        <!-- Input Panel -->
        <div v-if="inputMethod === 'upload'" class="bg-card border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div class="relative z-10 flex flex-col items-center text-center py-4">
                <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 ring-4 ring-primary/5 group-hover:scale-110 transition-transform duration-500">
                    <Upload :size="24" class="text-primary" />
                </div>
                <h3 class="text-sm font-black uppercase tracking-widest mb-2">Drop your file</h3>
                <p class="text-[11px] font-medium text-muted-foreground mb-4">CSV, Excel, or JSON are welcome</p>
                <label class="px-6 py-2.5 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:border-primary/50 transition-all shadow-sm">
                   Choose File
                   <input type="file" @change="handleFileUpload" class="hidden" accept=".csv,.xlsx,.xls,.json" />
                </label>
            </div>
        </div>

        <div v-if="inputMethod === 'paste'" class="flex-1 flex flex-col bg-card border border-border rounded-2xl p-5 shadow-xl overflow-hidden min-h-[300px]">
            <div class="flex items-center justify-between mb-4 px-2">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Clipboard :size="12" /> Paste Data
                </h3>
                <button @click="handlePaste" class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Parse Now</button>
            </div>
            <textarea 
              v-model="rawDataString"
              placeholder="Paste columns from Excel or stringified JSON here..."
              class="flex-1 w-full bg-background/50 border border-border rounded-xl p-4 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none custom-scrollbar"
            ></textarea>
        </div>

        <div v-if="inputMethod === 'manual'" class="flex-1 flex flex-col bg-card border border-border rounded-2xl p-5 shadow-xl overflow-hidden min-h-[300px]">
            <div class="flex items-center justify-between mb-4 px-2">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Table :size="12" /> Templates
                </h3>
                <div class="flex gap-2">
                    <button @click="rawDataString = 'Category,Value\nA,40\nB,20\nC,60\nD,30'; handlePaste()" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Bar</button>
                    <button @click="rawDataString = 'Date,Value\n2024-01-01,100\n2024-01-02,150\n2024-01-03,130\n2024-01-04,180'; handlePaste()" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Line</button>
                    <button @click="rawDataString = 'Segment,Share\nDirect,40\nSocial,30\nReferral,20\nEmail,10'; handlePaste()" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Pie</button>
                    <button @click="rawDataString = 'Height,Weight\n160,50\n170,60\n180,75\n165,55\n175,70'; handlePaste()" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Scatter</button>
                    <button @click="rawDataString = 'Attribute,Score\nSpeed,90\nPower,80\nAgility,85\nTechnique,95\nStamina,70'; handlePaste()" class="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary transition-colors">Radar</button>
                </div>
            </div>
            
            <textarea 
              v-model="rawDataString"
              placeholder="Select a template or type your data..."
              class="flex-1 w-full bg-background/50 border border-border rounded-xl p-4 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none custom-scrollbar font-mono leading-relaxed"
            ></textarea>
            
            <div class="mt-4 flex justify-end">
                 <button @click="handlePaste" class="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Visualize</button>
            </div>
        </div>

        <!-- Chart Settings -->
        <div v-if="parsedData.length > 0" class="flex-1 flex flex-col bg-card border border-border rounded-2xl p-5 shadow-xl overflow-hidden min-h-0">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
            <Settings2 :size="14" class="text-primary" /> Configuration
          </h3>

          <div class="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            <!-- Chart Type -->
            <div class="space-y-4">
                <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Select Visual Kind</span>
                <div class="grid grid-cols-5 gap-2">
                    <button 
                      v-for="t in [
                        { id: 'bar', icon: BarChart3 },
                        { id: 'line', icon: LineChart },
                        { id: 'area', icon: AreaChart },
                        { id: 'pie', icon: PieChart },
                        { id: 'donut', icon: Layout },
                        { id: 'scatter', icon: ScatterChart },
                        { id: 'radar', icon: Radar }
                      ]"
                      :key="t.id"
                      @click="config.type = t.id as ChartType"
                      class="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all border-2"
                      :class="config.type === t.id ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-background border-border text-muted-foreground hover:border-primary/30'"
                    >
                      <component :is="t.icon" :size="18" />
                    </button>
                </div>
            </div>

            <!-- Axis Selection -->
            <div class="space-y-6">
               <div class="space-y-3">
                  <div class="flex items-center justify-between">
                     <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Axis Labels (X)</span>
                     <div class="p-1 px-2 bg-muted rounded-lg text-[8px] font-black uppercase opacity-60">Category</div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                     <button 
                        v-for="h in headers" 
                        :key="h"
                        @click="config.xAxis = h"
                        class="px-4 py-2 rounded-xl text-[10px] font-black transition-all border shrink-0"
                        :class="config.xAxis === h ? 'bg-zinc-900 dark:bg-zinc-100 text-background border-transparent' : 'bg-background border-border text-muted-foreground hover:bg-muted'"
                     >
                        {{ h }}
                     </button>
                  </div>
               </div>

               <div class="space-y-3">
                  <div class="flex items-center justify-between">
                     <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Series Values (Y)</span>
                     <div class="p-1 px-2 bg-primary/10 text-primary rounded-lg text-[8px] font-black uppercase">Multi-select</div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                     <button 
                        v-for="h in headers" 
                        :key="h"
                        @click="toggleYAxis(h)"
                        class="px-4 py-2 rounded-xl text-[10px] font-black transition-all border shrink-0 flex items-center gap-2"
                        :class="config.yAxis.includes(h) ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-background border-border text-muted-foreground hover:bg-muted'"
                     >
                        {{ h }}
                        <Check v-if="config.yAxis.includes(h)" :size="10" />
                     </button>
                  </div>
               </div>
            </div>

            <!-- Design Toggles -->
            <div class="grid grid-cols-2 gap-3">
                <button 
                  @click="config.stacked = !config.stacked"
                  v-if="['bar', 'area'].includes(config.type)"
                  class="p-4 rounded-2xl border border-border flex flex-col gap-2 transition-all"
                  :class="config.stacked ? 'bg-primary/5 border-primary/30' : 'bg-background'"
                >
                   <span class="text-[9px] font-black uppercase tracking-widest">Stacked</span>
                   <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full" :class="config.stacked ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'"></div>
                      <span class="text-[10px] font-bold opacity-60">{{ config.stacked ? 'On' : 'Off' }}</span>
                   </div>
                </button>

                <button 
                  @click="config.horizontal = !config.horizontal"
                  v-if="config.type === 'bar'"
                  class="p-4 rounded-2xl border border-border flex flex-col gap-2 transition-all"
                  :class="config.horizontal ? 'bg-primary/5 border-primary/30' : 'bg-background'"
                >
                   <span class="text-[9px] font-black uppercase tracking-widest">Horizontal</span>
                   <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full" :class="config.horizontal ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'"></div>
                      <span class="text-[10px] font-bold opacity-60">{{ config.horizontal ? 'On' : 'Off' }}</span>
                   </div>
                </button>
            </div>

            <!-- Display Options -->
            <div class="space-y-4">
               <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Display</span>
               <div class="grid grid-cols-2 gap-2">
                 <button @click="config.showLabels = !config.showLabels" class="p-3 rounded-xl border border-border flex items-center justify-between transition-all" :class="config.showLabels ? 'bg-primary/5 border-primary/30' : 'bg-background'">
                   <span class="text-[9px] font-bold uppercase">Data labels</span>
                   <div class="w-2 h-2 rounded-full" :class="config.showLabels ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'"></div>
                 </button>
                 <button @click="config.showLegend = !config.showLegend" class="p-3 rounded-xl border border-border flex items-center justify-between transition-all" :class="config.showLegend ? 'bg-primary/5 border-primary/30' : 'bg-background'">
                   <span class="text-[9px] font-bold uppercase">Legend</span>
                   <div class="w-2 h-2 rounded-full" :class="config.showLegend ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'"></div>
                 </button>
                 <button @click="config.showTooltip = !config.showTooltip" class="p-3 rounded-xl border border-border flex items-center justify-between transition-all" :class="config.showTooltip ? 'bg-primary/5 border-primary/30' : 'bg-background'">
                   <span class="text-[9px] font-bold uppercase">Tooltip</span>
                   <div class="w-2 h-2 rounded-full" :class="config.showTooltip ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'"></div>
                 </button>
                 <button @click="config.showGrid = !config.showGrid" class="p-3 rounded-xl border border-border flex items-center justify-between transition-all" :class="config.showGrid ? 'bg-primary/5 border-primary/30' : 'bg-background'">
                   <span class="text-[9px] font-bold uppercase">Grid</span>
                   <div class="w-2 h-2 rounded-full" :class="config.showGrid ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'"></div>
                 </button>
                 <button @click="config.animations = !config.animations" class="p-3 rounded-xl border border-border flex items-center justify-between transition-all col-span-2" :class="config.animations ? 'bg-primary/5 border-primary/30' : 'bg-background'">
                   <span class="text-[9px] font-bold uppercase">Animations</span>
                   <div class="w-2 h-2 rounded-full" :class="config.animations ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'"></div>
                 </button>
               </div>
            </div>

            <!-- Line style (line / area) -->
            <div v-if="['line', 'area'].includes(config.type)" class="space-y-3">
               <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Line style</span>
               <div class="flex flex-wrap gap-2">
                 <button v-for="c in [{ id: 'smooth', label: 'Smooth' }, { id: 'straight', label: 'Straight' }, { id: 'stepline', label: 'Step' }]" :key="c.id"
                   @click="config.curve = c.id as any"
                   class="px-3 py-1.5 rounded-lg text-2xs font-bold border transition-all"
                   :class="config.curve === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/40'"
                 >{{ c.label }}</button>
               </div>
            </div>

            <!-- Bar corners (bar only) -->
            <div v-if="config.type === 'bar'" class="space-y-3">
               <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Bar corners</span>
               <div class="flex flex-wrap gap-2">
                 <button v-for="r in [0, 4, 8]" :key="r"
                   @click="config.barBorderRadius = r"
                   class="px-3 py-1.5 rounded-lg text-2xs font-bold border transition-all"
                   :class="config.barBorderRadius === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/40'"
                 >{{ r === 0 ? 'Sharp' : r }}</button>
               </div>
            </div>

            <!-- Color Palette -->
            <div class="space-y-4">
               <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Color Aesthetic</span>
               <div class="flex flex-col gap-2 max-h-[280px] overflow-y-auto overscroll-contain pr-0.5">
                  <button 
                    v-for="(p, idx) in palettes" 
                    :key="idx"
                    @click="config.colors = [...p.colors]"
                    class="p-2 rounded-2xl border border-border flex items-center justify-between hover:border-primary/50 transition-all bg-background pr-4 shrink-0"
                    :class="{ 'ring-2 ring-primary border-primary/50': JSON.stringify(config.colors) === JSON.stringify(p.colors) }"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <div class="flex -space-x-2 shrink-0">
                        <div v-for="c in p.colors" :key="c" :style="{ backgroundColor: c }" class="w-6 h-6 rounded-full border-2 border-background"></div>
                      </div>
                      <span class="text-2xs font-bold truncate">{{ p.name }}</span>
                    </div>
                    <Check v-if="JSON.stringify(config.colors) === JSON.stringify(p.colors)" :size="16" class="text-primary shrink-0" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Preview Engine -->
      <main class="flex-1 flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden relative group/engine">
          
          <!-- Gloss Effect -->
          <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/2 to-transparent opacity-0 group-hover/engine:opacity-100 transition-opacity pointer-events-none"></div>

          <div v-if="parsedData.length === 0" class="h-full flex flex-col items-center justify-center p-12 opacity-50 text-center">
              <div class="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-6 ring-1 ring-primary/10 animate-bounce-slow">
                  <BarChart3 :size="40" class="text-primary/30" />
              </div>
              <h2 class="text-lg font-bold mb-2">Feed the engine</h2>
              <p class="text-sm font-medium text-muted-foreground max-w-sm">Upload your dataset to unlock professional data visualization tools instantly.</p>
          </div>

          <div v-else class="h-full flex flex-col p-4 animate-in fade-in zoom-in-95 duration-1000">
             <div class="flex items-center justify-between mb-4 shrink-0">
                <input 
                  v-model="config.title"
                  type="text"
                  class="text-base font-bold tracking-tight bg-transparent border-none p-0 focus:ring-0 outline-none w-full"
                  placeholder="Chart Title..."
                />
                <div class="flex items-center gap-3">
                   <button 
                     @click="openEditModal"
                     class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-primary/10 hover:border-primary/50 text-2xs font-bold uppercase tracking-wider transition-all"
                   >
                     <Pencil :size="12" />
                     Edit data
                   </button>
                   <div class="px-3 py-1 bg-muted rounded-full text-2xs font-bold uppercase tracking-wider border border-border/50">
                      {{ parsedData.length }} Points
                   </div>
                </div>
             </div>

             <div class="flex-1 min-h-0 bg-white/5 dark:bg-black/20 rounded-lg p-3 border border-white/5 shadow-inner backdrop-blur-sm relative flex items-center justify-center">
                <div class="w-full h-full max-w-4xl max-h-[28rem] min-h-[200px] flex items-center justify-center">
                  <VueApexCharts 
                    ref="chartRef"
                    width="100%" 
                    height="100%" 
                    :type="config.type" 
                    :options="chartOptions" 
                    :series="chartSeries" 
                    class="w-full h-full min-w-0 min-h-0"
                  />
                </div>
             </div>

             <!-- Footer Stats or Meta -->
             <div class="mt-4 flex items-center justify-between text-muted-foreground/40">
                <div class="flex items-center gap-6">
                    <div class="flex flex-col">
                        <span class="text-[8px] font-black uppercase tracking-wider">X-Axis</span>
                        <span class="text-[10px] font-bold">{{ config.xAxis }}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[8px] font-black uppercase tracking-wider">Y-Series</span>
                        <span class="text-[10px] font-bold">{{ config.yAxis.join(', ') }}</span>
                    </div>
                </div>
                <div class="text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">
                   Engine is Live
                </div>
             </div>
          </div>
      </main>
    </div>

    <!-- Edit data modal -->
    <Teleport to="body">
      <div 
        v-if="showEditModal" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        @click.self="closeEditModal"
      >
        <div 
          class="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" 
          @click.stop
        >
          <div class="p-4 border-b border-border flex items-center justify-between shrink-0">
            <h3 class="text-sm font-black uppercase tracking-widest">Edit data</h3>
            <button @click="closeEditModal" class="p-2 rounded-xl hover:bg-muted transition-colors">
              <X :size="18" />
            </button>
          </div>
          <div class="flex-1 overflow-auto p-4 min-h-0">
            <table class="w-full text-left border-collapse table-fixed">
              <thead>
                <tr class="border-b border-border">
                  <th v-for="h in headers" :key="h" class="text-[9px] font-black uppercase tracking-wider text-muted-foreground pb-2 pr-2 align-bottom" style="min-width: 80px">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(row, rowIdx) in editPaginatedRows" 
                  :key="(editPage - 1) * EDIT_PAGE_SIZE + rowIdx" 
                  class="border-b border-border/50 hover:bg-muted/30"
                >
                  <td v-for="h in headers" :key="h" class="py-1 pr-2 align-top">
                    <input 
                      v-model="editDraft[(editPage - 1) * EDIT_PAGE_SIZE + rowIdx][h]" 
                      type="text" 
                      class="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4 shrink-0 bg-muted/20">
            <div class="flex items-center gap-2">
              <button 
                @click="editPage = Math.max(1, editPage - 1)" 
                :disabled="editPage <= 1"
                class="px-3 py-1.5 rounded-lg text-2xs font-bold border border-border bg-background disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >Prev</button>
              <span class="text-2xs font-bold px-2">{{ editPage }} / {{ editTotalPages }}</span>
              <button 
                @click="editPage = Math.min(editTotalPages, editPage + 1)" 
                :disabled="editPage >= editTotalPages"
                class="px-3 py-1.5 rounded-lg text-2xs font-bold border border-border bg-background disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >Next</button>
              <span class="text-2xs text-muted-foreground ml-2">{{ editDraft.length }} rows</span>
            </div>
            <div class="flex gap-2">
              <button @click="closeEditModal" class="px-4 py-2 rounded-xl text-2xs font-bold border border-border hover:bg-muted transition-colors">Cancel</button>
              <button @click="saveEditModal" class="px-4 py-2 rounded-xl text-2xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Save</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
.animate-bounce-slow {
  animation: bounce-slow 4s ease-in-out infinite;
}

:deep(.apexcharts-canvas) {
  margin: 0 auto;
}

:deep(.apexcharts-tooltip) {
  background: rgba(17, 17, 17, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5) !important;
  color: #fff !important;
}

:deep(.apexcharts-tooltip-title) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  font-size: 9px !important;
  padding: 8px 12px !important;
}
</style>
