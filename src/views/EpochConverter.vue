<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { 
  ArrowLeft, 
  Clock, 
  RefreshCw,
  Calendar
} from 'lucide-vue-next';

const now = ref(Math.floor(Date.now() / 1000));
const tsSeconds = ref(now.value);
const tsMillis = ref(now.value * 1000);
const isoString = ref(new Date(now.value * 1000).toISOString());
const localString = ref(new Date(now.value * 1000).toLocaleString());

let timer: any = null;
const isLive = ref(true);

const updateAll = (source: 'sec' | 'ms' | 'iso' | 'local') => {
    isLive.value = false; // Stop live update if user interacts
    let d: Date;

    try {
        if (source === 'sec') {
            d = new Date(tsSeconds.value * 1000);
        } else if (source === 'ms') {
            d = new Date(tsMillis.value);
        } else if (source === 'iso') {
            d = new Date(isoString.value);
        } else {
             d = new Date(localString.value);
        }
        
        if (isNaN(d.getTime())) throw new Error('Invalid Date');

        if (source !== 'sec') tsSeconds.value = Math.floor(d.getTime() / 1000);
        if (source !== 'ms') tsMillis.value = d.getTime();
        if (source !== 'iso') isoString.value = d.toISOString();
        if (source !== 'local') localString.value = d.toLocaleString();

    } catch (e) {
        // invalid date input
    }
};

const tick = () => {
    if (isLive.value) {
        const n = Date.now();
        tsSeconds.value = Math.floor(n / 1000);
        tsMillis.value = n;
        isoString.value = new Date(n).toISOString();
        localString.value = new Date(n).toLocaleString();
    }
};

timer = setInterval(tick, 1000);
onUnmounted(() => clearInterval(timer));

const setLive = () => {
    isLive.value = true;
    tick();
};

</script>

<template>
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-teal-500/10 text-teal-500 rounded-xl flex items-center justify-center ring-1 ring-teal-500/20">
            <Clock :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Epoch <span class="text-teal-500">Converter</span>
            </h2>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
         <button @click="setLive" class="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
            <RefreshCw :size="12" :class="{'animate-spin': isLive}" /> 
            {{ isLive ? 'Live' : 'Paused' }}
         </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-3xl mx-auto w-full flex flex-col gap-6 mt-8">
        
        <!-- Unix Timestamp -->
        <div class="bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col gap-4">
            <div class="flex items-center gap-3 text-muted-foreground mb-2">
                 <Clock :size="18" />
                 <span class="text-xs font-black uppercase tracking-widest">Unix Timestamp</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] uppercase font-bold text-muted-foreground">Seconds</label>
                    <input 
                        v-model.number="tsSeconds"
                        @input="updateAll('sec')"
                        type="number" 
                        class="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 font-mono text-xl font-medium outline-none text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] uppercase font-bold text-muted-foreground">Milliseconds</label>
                    <input 
                        v-model.number="tsMillis"
                        @input="updateAll('ms')"
                        type="number" 
                        class="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 font-mono text-xl font-medium outline-none text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>
        </div>

        <!-- Human Date -->
        <div class="bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col gap-4">
            <div class="flex items-center gap-3 text-muted-foreground mb-2">
                 <Calendar :size="18" />
                 <span class="text-xs font-black uppercase tracking-widest">Human Readable</span>
            </div>
            
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] uppercase font-bold text-muted-foreground">ISO 8601 (UTC)</label>
                    <input 
                        v-model="isoString"
                        @input="updateAll('iso')"
                        type="text" 
                        class="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 font-mono text-lg outline-none text-teal-600 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] uppercase font-bold text-muted-foreground">Local Time</label>
                    <input 
                        v-model="localString"
                        @input="updateAll('local')"
                        type="text" 
                        class="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 font-mono text-lg outline-none text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>
        </div>

    </div>
  </div>
</template>
