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
  Table
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
  colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
});

const chartRef = ref<any>(null);

// Palette options
const palettes = [
  ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'], // Indigo Mix
  ['#3b82f6', '#0ea5e9', '#06b6d4', '#2dd4bf', '#10b981'], // Blue/Green
  ['#f43f5e', '#fb7185', '#fda4af', '#fff1f2', '#881337'], // Rose
  ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#78350f'], // Amber
  ['#71717a', '#a1a1aa', '#d4d4d8', '#f4f4f5', '#18181b'], // Zinc
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
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
      },
      background: 'transparent'
    },
    colors: config.value.colors,
    stroke: {
      curve: 'smooth',
      width: config.value.type === 'line' || config.value.type === 'area' || config.value.type === 'radar' ? 3 : 0
    },
    title: {
      text: config.value.title,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: '900',
        fontFamily: 'Outfit, sans-serif',
        color: 'var(--color-foreground)'
      }
    },
    markers: {
      size: ['line', 'area', 'scatter', 'radar'].includes(config.value.type) ? (config.value.type === 'scatter' ? 6 : 4) : 0,
      strokeWidth: 2,
      strokeColors: '#fff',
      hover: { size: 8 }
    },
    dataLabels: {
      enabled: config.value.showLabels,
      style: {
         fontFamily: 'Outfit, sans-serif',
         fontWeight: '900'
      },
      dropShadow: { enabled: false }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 'bold'
    },
    tooltip: {
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
                fontWeight: 700,
                fontSize: '10px'
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
          fontWeight: 700,
          fontSize: '10px'
        }
      }
    };
    options.grid = {
      borderColor: 'var(--color-border)',
      strokeDashArray: 4,
      padding: { top: 10, right: 30, bottom: 0, left: 10 }
    };
    options.plotOptions = {
        bar: {
            horizontal: config.value.horizontal,
            borderRadius: 8,
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
        
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <BarChart3 :size="24" class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-foreground leading-tight">
              Data <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Visualization</span>
            </h1>
            <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
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
      <aside class="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 h-full">
        
        <!-- Input Panel -->
        <div v-if="inputMethod === 'upload'" class="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div class="relative z-10 flex flex-col items-center text-center py-4">
                <div class="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 ring-4 ring-primary/5 group-hover:scale-110 transition-transform duration-500">
                    <Upload :size="32" class="text-primary" />
                </div>
                <h3 class="text-sm font-black uppercase tracking-widest mb-2">Drop your file</h3>
                <p class="text-[11px] font-medium text-muted-foreground mb-6">CSV, Excel, or JSON are welcome</p>
                <label class="px-8 py-3 bg-background border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest cursor-pointer hover:border-primary/50 transition-all shadow-sm">
                   Choose File
                   <input type="file" @change="handleFileUpload" class="hidden" accept=".csv,.xlsx,.xls,.json" />
                </label>
            </div>
        </div>

        <div v-if="inputMethod === 'paste'" class="flex-1 flex flex-col bg-card border border-border rounded-[2.5rem] p-6 shadow-xl overflow-hidden min-h-[300px]">
            <div class="flex items-center justify-between mb-4 px-2">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Clipboard :size="12" /> Paste Data
                </h3>
                <button @click="handlePaste" class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Parse Now</button>
            </div>
            <textarea 
              v-model="rawDataString"
              placeholder="Paste columns from Excel or stringified JSON here..."
              class="flex-1 w-full bg-background/50 border border-border rounded-3xl p-5 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none custom-scrollbar"
            ></textarea>
        </div>

        <div v-if="inputMethod === 'manual'" class="flex-1 flex flex-col bg-card border border-border rounded-[2.5rem] p-6 shadow-xl overflow-hidden min-h-[300px]">
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
              class="flex-1 w-full bg-background/50 border border-border rounded-3xl p-5 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none custom-scrollbar font-mono leading-relaxed"
            ></textarea>
            
            <div class="mt-4 flex justify-end">
                 <button @click="handlePaste" class="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Visualize</button>
            </div>
        </div>

        <!-- Chart Settings -->
        <div v-if="parsedData.length > 0" class="flex-1 flex flex-col bg-card border border-border rounded-[3rem] p-7 shadow-xl overflow-hidden min-h-0">
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
                  class="p-4 rounded-3xl border border-border flex flex-col gap-2 transition-all"
                  :class="config.stacked ? 'bg-primary/5 border-primary/30' : 'bg-background'"
                >
                   <span class="text-[9px] font-black uppercase tracking-widest">Stacked</span>
                   <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full" :class="config.stacked ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'"></div>
                      <span class="text-[10px] font-bold opacity-60">{{ config.stacked ? 'Enabled' : 'Disabled' }}</span>
                   </div>
                </button>

                <button 
                  @click="config.horizontal = !config.horizontal"
                  v-if="config.type === 'bar'"
                  class="p-4 rounded-3xl border border-border flex flex-col gap-2 transition-all"
                  :class="config.horizontal ? 'bg-primary/5 border-primary/30' : 'bg-background'"
                >
                   <span class="text-[9px] font-black uppercase tracking-widest">Horizontal</span>
                   <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full" :class="config.horizontal ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'"></div>
                      <span class="text-[10px] font-bold opacity-60">{{ config.horizontal ? 'Enabled' : 'Disabled' }}</span>
                   </div>
                </button>
            </div>

            <!-- Color Palette -->
            <div class="space-y-4">
               <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Color Aesthetic</span>
               <div class="flex flex-col gap-2">
                  <button 
                    v-for="(p, idx) in palettes" 
                    :key="idx"
                    @click="config.colors = [...p]"
                    class="p-2 rounded-2xl border border-border flex items-center justify-between hover:border-primary/50 transition-all bg-background pr-4"
                    :class="{ 'ring-2 ring-primary border-primary/50': JSON.stringify(config.colors) === JSON.stringify(p) }"
                  >
                    <div class="flex -space-x-2">
                        <div v-for="c in p" :key="c" :style="{ backgroundColor: c }" class="w-8 h-8 rounded-full border-2 border-background"></div>
                    </div>
                    <Check v-if="JSON.stringify(config.colors) === JSON.stringify(p)" :size="16" class="text-primary" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Preview Engine -->
      <main class="flex-1 flex flex-col bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden relative group/engine">
          
          <!-- Gloss Effect -->
          <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/2 to-transparent opacity-0 group-hover/engine:opacity-100 transition-opacity pointer-events-none"></div>

          <div v-if="parsedData.length === 0" class="h-full flex flex-col items-center justify-center p-12 opacity-50 text-center">
              <div class="w-32 h-32 bg-primary/5 rounded-[4rem] flex items-center justify-center mb-10 ring-1 ring-primary/10 animate-bounce-slow">
                  <BarChart3 :size="56" class="text-primary/30" />
              </div>
              <h2 class="text-3xl font-black mb-4">Feed the engine</h2>
              <p class="text-sm font-medium text-muted-foreground max-w-sm">Upload your dataset to unlock professional data visualization tools instantly.</p>
          </div>

          <div v-else class="h-full flex flex-col p-8 animate-in fade-in zoom-in-95 duration-1000">
             <div class="flex items-center justify-between mb-10 shrink-0">
                <input 
                  v-model="config.title"
                  type="text"
                  class="text-2xl font-black tracking-tight bg-transparent border-none p-0 focus:ring-0 outline-none w-full"
                  placeholder="Chart Title..."
                />
                <div class="flex items-center gap-3">
                   <div class="px-4 py-1.5 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest border border-border/50">
                      {{ parsedData.length }} Points
                   </div>
                </div>
             </div>

             <div class="flex-1 min-h-0 bg-white/5 dark:bg-black/20 rounded-[2.5rem] p-6 border border-white/5 shadow-inner backdrop-blur-sm relative flex items-center justify-center">
                <VueApexCharts 
                  ref="chartRef"
                  width="100%" 
                  height="100%" 
                  :type="config.type" 
                  :options="chartOptions" 
                  :series="chartSeries" 
                  class="w-full h-full"
                />
             </div>

             <!-- Footer Stats or Meta -->
             <div class="mt-8 flex items-center justify-between text-muted-foreground/40">
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
