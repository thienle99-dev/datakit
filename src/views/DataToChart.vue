<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  BarChart3, 
  ArrowLeft, 
  Upload, 
  Clipboard, 
  Download, 
  Sparkles,
  Table,
  Pencil
} from 'lucide-vue-next';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { defineAsyncComponent } from 'vue';

// Sub-components
import EditDataModal from '../components/data-to-chart/EditDataModal.vue';
import DataInputPanel from '../components/data-to-chart/DataInputPanel.vue';
import ChartConfigPanel from '../components/data-to-chart/ChartConfigPanel.vue';

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'));

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

function openEditModal() {
  showEditModal.value = true;
}

function saveEditModal(newData: any[]) {
  parsedData.value = JSON.parse(JSON.stringify(newData));
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
const handleFileSelect = async (file: File) => {
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
    chartInstance.exports.exportToSVG();
  }
};

onMounted(() => {
    // Demo data handled by parent or init logic
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
        <DataInputPanel 
          :input-method="inputMethod"
          v-model:raw-data="rawDataString"
          @file-select="handleFileSelect"
          @parse="handlePaste"
        />

        <!-- Chart Settings -->
        <ChartConfigPanel 
          v-if="parsedData.length > 0"
          :config="config"
          :headers="headers"
          :palettes="palettes"
        />
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
    <EditDataModal 
      :is-open="showEditModal"
      :headers="headers"
      :data="parsedData"
      @close="closeEditModal"
      @save="saveEditModal"
    />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: theme('colors.border');
  border-radius: 4px;
}
</style>
