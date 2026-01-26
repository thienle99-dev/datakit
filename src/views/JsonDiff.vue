<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ArrowLeft, 
  GitCompare, 
  ArrowRightLeft
} from 'lucide-vue-next';

// Simple text diff logic
const diffLines = (text1: string, text2: string) => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    
    const result = [];
    
    for (let i = 0; i < maxLines; i++) {
        const l1 = lines1[i] || '';
        const l2 = lines2[i] || '';
        
        const type = l1 === l2 ? 'same' : (l1 && l2 ? 'mod' : (l1 ? 'del' : 'add'));
        result.push({
            lineIdx: i + 1,
            left: l1,
            right: l2,
            type
        });
    }
    return result;
};

const leftInput = ref('{\n  "name": "Project A",\n  "version": 1,\n  "settings": {\n    "active": true\n  }\n}');
const rightInput = ref('{\n  "name": "Project B",\n  "version": 2,\n  "settings": {\n    "active": false,\n    "debug": true\n  }\n}');

const leftError = ref<string | null>(null);
const rightError = ref<string | null>(null);

const computedDiff = computed(() => {
    let leftFormatted = '';
    let rightFormatted = '';

    try {
        const lObj = JSON.parse(leftInput.value);
        leftFormatted = JSON.stringify(sortKeys(lObj), null, 2);
        leftError.value = null;
    } catch (e: any) {
        leftError.value = e.message;
        leftFormatted = leftInput.value; // Fallback text compare
    }

    try {
        const rObj = JSON.parse(rightInput.value);
        rightFormatted = JSON.stringify(sortKeys(rObj), null, 2);
        rightError.value = null;
    } catch (e: any) {
        rightError.value = e.message;
        rightFormatted = rightInput.value;
    }

    return diffLines(leftFormatted, rightFormatted);
});

// Recursive sort keys for consistent/stable JSON stringify
const sortKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(sortKeys);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj)
            .sort()
            .reduce((acc: any, key) => {
                acc[key] = sortKeys(obj[key]);
                return acc;
            }, {});
    }
    return obj;
};

const formatLeft = () => {
    try {
        const obj = JSON.parse(leftInput.value);
        leftInput.value = JSON.stringify(obj, null, 2);
    } catch(e) {}
};

const formatRight = () => {
    try {
        const obj = JSON.parse(rightInput.value);
        rightInput.value = JSON.stringify(obj, null, 2);
    } catch(e) {}
}

const clear = () => {
    leftInput.value = '';
    rightInput.value = '';
};
</script>

<template>
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-2 md:p-4">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center ring-1 ring-blue-500/20">
            <GitCompare :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-black tracking-tight text-foreground">
              JSON <span class="text-blue-500">Diff</span>
            </h2>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
         <button @click="clear" class="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Clear All</button>
      </div>
    </div>

    <!-- Main Diff Area -->
    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 relative">
        
        <!-- Editors (Input Mode) -->
        <div class="flex-1 flex flex-col gap-4 min-h-0">
             
             <!-- Left Input -->
             <div class="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
                 <div class="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
                     <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original (A)</span>
                     <button @click="formatLeft" class="text-[10px] font-bold text-primary hover:underline">Prettier</button>
                 </div>
                 <textarea 
                    v-model="leftInput"
                    class="flex-1 w-full bg-transparent p-4 font-mono text-xs leading-relaxed outline-none resize-none"
                    placeholder="Paste JSON A..."
                    spellcheck="false"
                 ></textarea>
                 <div v-if="leftError" class="absolute bottom-2 left-2 right-2 p-2 bg-rose-500/10 text-rose-500 text-[10px] rounded-lg border border-rose-500/20 truncate">
                    Invalid JSON: {{ leftError }}
                 </div>
             </div>

             <!-- Right Input -->
             <div class="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
                 <div class="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
                     <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Modified (B)</span>
                     <button @click="formatRight" class="text-[10px] font-bold text-primary hover:underline">Prettier</button>
                 </div>
                 <textarea 
                    v-model="rightInput"
                    class="flex-1 w-full bg-transparent p-4 font-mono text-xs leading-relaxed outline-none resize-none"
                    placeholder="Paste JSON B..."
                    spellcheck="false"
                 ></textarea>
                 <div v-if="rightError" class="absolute bottom-2 left-2 right-2 p-2 bg-rose-500/10 text-rose-500 text-[10px] rounded-lg border border-rose-500/20 truncate">
                    Invalid JSON: {{ rightError }}
                 </div>
             </div>
        </div>

        <!-- Center Action (Desktop) -->
        <div class="hidden lg:flex flex-col justify-center items-center text-muted-foreground">
             <ArrowRightLeft :size="20" />
        </div>

        <!-- Visual Diff Result -->
        <div class="flex-[1.5] w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col">
             <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <GitCompare :size="12" /> Diff View (Sorted Keys)
                </span>
                <div class="flex gap-4 text-[10px] font-bold">
                    <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-rose-500"></div> Removed</div>
                    <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> Added</div>
                    <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-amber-500"></div> Modified</div>
                </div>
             </div>

             <div class="flex-1 overflow-auto custom-scrollbar bg-background/50 relative">
                 <div class="flex flex-col font-mono text-xs min-w-max">
                     <div 
                        v-for="(line, idx) in computedDiff" 
                        :key="idx"
                        class="grid grid-cols-[30px_1fr_30px_1fr] border-b border-border/30 hover:bg-muted/30 transition-colors"
                        :class="{
                            'bg-rose-500/5': line.type === 'del',
                            'bg-emerald-500/5': line.type === 'add',
                            'bg-amber-500/5': line.type === 'mod'
                        }"
                     >
                        <!-- Left Line Num -->
                        <div class="text-right pr-2 py-1 text-muted-foreground/30 select-none border-r border-border/30 bg-muted/10">{{ line.left ? idx+1 : '' }}</div>
                        
                        <!-- Left Content -->
                        <div class="px-2 py-1 whitespace-pre-wrap break-all" :class="{'text-rose-500 bg-rose-500/10': line.type === 'del' || line.type === 'mod'}">
                            {{ line.left }}
                        </div>

                        <!-- Right Line Num -->
                        <div class="text-right pr-2 py-1 text-muted-foreground/30 select-none border-r border-border/30 bg-muted/10 border-l">{{ line.right ? idx+1 : '' }}</div>
                        
                        <!-- Right Content -->
                        <div class="px-2 py-1 whitespace-pre-wrap break-all" :class="{'text-emerald-500 bg-emerald-500/10': line.type === 'add' || line.type === 'mod'}">
                            {{ line.right }}
                        </div>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  </div>
</template>
