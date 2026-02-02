<script setup lang="ts">
import { 
  BarChart3, LineChart, AreaChart, PieChart, 
  Layout, ScatterChart, Radar, Check, Settings2 
} from 'lucide-vue-next';

// Re-defining types locally for simplicity, or could import if centralized
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

const props = defineProps<{
  config: ChartConfig;
  headers: string[];
  palettes: { name: string; colors: string[] }[];
}>();

// Wrapper to modify config safely if needed, but since we modify properties of the object, 
// Vue's reactivity system handles it if the parent passed a reactive object.
// If we wanted strict one-way data flow, we'd emit updates for every field. 
// For this refactor, we assume direct mutation of the specific properties is acceptable 
// as is common with complex configuration objects in Vue forms.

const toggleYAxis = (col: string) => {
  const index = props.config.yAxis.indexOf(col);
  if (index > -1) {
    props.config.yAxis.splice(index, 1);
  } else {
    props.config.yAxis.push(col);
  }
};
</script>

<template>
  <div class="flex-1 flex flex-col bg-card border border-border rounded-2xl p-5 shadow-xl overflow-hidden min-h-0">
    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
      <Settings2 :size="14" class="text-primary" /> Configuration
    </h3>

    <div class="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
      <!-- Chart Type -->
      <div class="space-y-4">
          <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Select Visual Kind</span>
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
               <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Axis Labels (X)</span>
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
               <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Series Values (Y)</span>
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
         <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Display</span>
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
         <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Line style</span>
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
         <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Bar corners</span>
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
         <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Color Aesthetic</span>
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
