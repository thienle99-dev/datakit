<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ArrowLeft, 
  Regex, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-vue-next';

// Lucide icon alias manually if Regex not exported (it is usually available as Regex or Code)
// If not, use generic Code
const regexStr = ref(String.raw`([A-Z])\w+`);
const flags = ref('g');
const testString = ref('Hello World from DataTools 2024');
const error = ref<string | null>(null);

const flagsList = [
    { char: 'g', label: 'Global', desc: 'Don\'t return after first match' },
    { char: 'm', label: 'Multi line', desc: '^ and $ match start/end of line' },
    { char: 'i', label: 'Insensitive', desc: 'Case insensitive match' },
    { char: 's', label: 'Single line', desc: 'Dot matches newline' },
    { char: 'u', label: 'Unicode', desc: 'Enable full unicode support' },
    { char: 'y', label: 'Sticky', desc: 'Anchor to last match' },
];

const toggleFlag = (char: string) => {
    if (flags.value.includes(char)) {
        flags.value = flags.value.replace(char, '');
    } else {
        flags.value += char;
    }
};

const matches = computed(() => {
    if (!regexStr.value) return [];
    try {
        const re = new RegExp(regexStr.value, flags.value);
        error.value = null;
        
        // If global, we can use matchAll, else match
        if (!flags.value.includes('g')) {
            const m = testString.value.match(re);
            return m ? [m] : [];
        } else {
            return Array.from(testString.value.matchAll(re));
        }
    } catch (e: any) {
        error.value = e.message;
        return [];
    }
});

const highlightedText = computed(() => {
    if (!regexStr.value || error.value) return escapeHtml(testString.value);
    
    try {
        const re = new RegExp(regexStr.value, flags.value);
        let html = '';
        let lastIndex = 0;
        
        // We need to iterate matches and reconstruct string with spans
        // This is tricky if overlaps, but JS regex usually consumes.
        // Simplest is to replace, but we want to keep groups visualization?
        // Let's just highlight full match for now.
        
        // Note: String.replace with function is safer
        // But for display, we want to wrap matches.
        
        const text = testString.value;
        const list = Array.from(text.matchAll(re));
        
        if (list.length === 0) return escapeHtml(text);

        for (const m of list) {
            const start = m.index!;
            const end = start + m[0].length;
            
            // Append non-match part
            html += escapeHtml(text.substring(lastIndex, start));
            
            // Append matched part
            html += `<mark class="bg-yellow-500/30 text-yellow-500 rounded-sm px-0.5 border-b-2 border-yellow-500">${escapeHtml(m[0])}</mark>`;
            
            lastIndex = end;
            
            if (!flags.value.includes('g')) break; // Only first match if not global
        }
        
        html += escapeHtml(text.substring(lastIndex));
        return html;

    } catch (e) {
        return escapeHtml(testString.value);
    }
});

const escapeHtml = (text: string) => {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
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
          <div class="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center ring-1 ring-yellow-500/20">
            <Regex :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Regex <span class="text-yellow-500">Tester</span>
            </h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-h-0 flex flex-col gap-6">
        
        <!-- Controls -->
        <div class="flex flex-col gap-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
             <div class="flex items-center gap-2 relative">
                 <span class="text-2xl font-mono text-muted-foreground">/</span>
                 <input 
                    v-model="regexStr"
                    type="text" 
                    placeholder="Regular Expression"
                    class="flex-1 bg-transparent text-xl font-mono outline-none placeholder-muted-foreground/30 text-yellow-500 font-bold"
                 />
                 <span class="text-2xl font-mono text-muted-foreground">/</span>
                 <div class="flex gap-1 ml-2">
                     <button 
                        v-for="flag in flagsList" 
                        :key="flag.char"
                        @click="toggleFlag(flag.char)"
                        class="px-2 py-1 rounded text-xs font-bold uppercase border transition-colors relative group"
                        :class="flags.includes(flag.char) ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'"
                     >
                        {{ flag.char }}
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            {{ flag.label }}
                        </div>
                     </button>
                 </div>
             </div>
             
             <div v-if="error" class="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl text-xs font-bold">
                 <AlertTriangle :size="14" /> {{ error }}
             </div>
        </div>

        <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
            <!-- Test String Input -->
            <div class="flex-1 flex flex-col gap-2">
                 <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Test String</label>
                 <textarea 
                    v-model="testString"
                    class="flex-1 w-full bg-card border border-border rounded-3xl p-5 font-mono text-sm leading-loose outline-none resize-none focus:ring-2 focus:ring-primary/20 transition-all custom-scrollbar"
                    placeholder="String to test..."
                 ></textarea>
            </div>

            <!-- Matches -->
            <div class="flex-1 flex flex-col gap-2 min-h-0">
                 <div class="flex justify-between items-center pl-1">
                    <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Match Visualization</label>
                    <span class="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">{{ matches.length }} matches</span>
                 </div>
                 
                 <!-- Highlight Layer -->
                 <div class="flex-1 bg-card border border-border rounded-3xl p-5 font-mono text-sm leading-loose overflow-auto custom-scrollbar whitespace-pre-wrap relative">
                      <div class="absolute inset-x-5 inset-y-5" v-html="highlightedText"></div>
                 </div>
                 
                 <!-- Groups Detail -->
                 <div class="h-40 bg-card border border-border rounded-3xl overflow-hidden flex flex-col">
                      <div class="px-4 py-2 border-b border-border bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Match Details</div>
                      <div class="flex-1 overflow-auto p-2">
                           <div v-if="matches.length === 0" class="h-full flex items-center justify-center text-muted-foreground text-xs italic">No matches</div>
                           <div v-else class="flex flex-col gap-2">
                                <div v-for="(m, idx) in matches" :key="idx" class="p-2 rounded bg-muted/20 border border-border/50 text-xs font-mono">
                                     <div class="flex items-center gap-2 mb-1">
                                         <CheckCircle2 :size="12" class="text-emerald-500" />
                                         <span class="font-bold text-foreground">Match {{ idx + 1 }}</span>
                                         <span class="opacity-50">Range: [{{ m.index }} - {{ (m.index || 0) + m[0].length }}]</span>
                                     </div>
                                     <div class="pl-5 flex flex-col gap-1">
                                          <div class="text-yellow-600">Full: "{{ m[0] }}"</div>
                                          <template v-if="m.length > 1">
                                              <div v-for="(g, gIdx) in m.slice(1)" :key="gIdx" class="text-muted-foreground">
                                                  Group {{ gIdx + 1 }}: "{{ g }}"
                                              </div>
                                          </template>
                                     </div>
                                </div>
                           </div>
                      </div>
                 </div>
            </div>
        </div>

    </div>
  </div>
</template>
