<script setup lang="ts">
import { ref } from 'vue';
import { 
  ArrowLeft, 
  Fingerprint, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-vue-next';

const count = ref(1);
const uuids = ref<string[]>([]);
const copied = ref(false);

const generateUUID = () => {
    // Basic v4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const generate = () => {
    const arr = [];
    for(let i=0; i<count.value; i++) {
        arr.push(generateUUID());
    }
    uuids.value = arr;
};

// Init
generate();

const copyAll = () => {
    navigator.clipboard.writeText(uuids.value.join('\n')).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    });
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
          <div class="w-10 h-10 bg-violet-500/10 text-violet-500 rounded-xl flex items-center justify-center ring-1 ring-violet-500/20">
            <Fingerprint :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              UUID <span class="text-violet-500">Generator</span>
            </h2>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-xl mx-auto w-full mt-10 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div class="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col gap-6">
             <div class="flex items-center gap-4">
                 <div class="flex-1">
                     <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Quantity</label>
                     <input 
                        v-model.number="count" 
                        type="number" 
                        min="1" 
                        max="1000" 
                        class="w-full bg-muted border border-border rounded-xl px-4 py-2 font-mono text-lg outline-none focus:ring-2 focus:ring-primary/20"
                     />
                 </div>
                 <button 
                    @click="generate" 
                    class="h-[46px] mt-[22px] px-6 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all active:scale-95"
                 >
                    <RefreshCw :size="16" /> Generate
                 </button>
             </div>

             <div class="relative bg-muted/30 rounded-2xl border border-border p-4 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
                 <button 
                    @click="copyAll" 
                    class="absolute top-4 right-4 p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95 z-10"
                 >
                    <Check v-if="copied" :size="14" class="text-emerald-500" />
                    <Copy v-else :size="14" />
                 </button>
                 
                 <div class="font-mono text-sm leading-loose text-foreground">
                     <div v-for="id in uuids" :key="id" class="hover:bg-primary/5 rounded px-2 -mx-2 transition-colors">{{ id }}</div>
                 </div>
             </div>
        </div>

    </div>
  </div>
</template>
