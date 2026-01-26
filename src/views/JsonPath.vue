<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ArrowLeft, 
  Search, 
  Code2, 
  FileJson, 
  Copy, 
  Check, 
  AlertCircle 
} from 'lucide-vue-next';

const input = ref('{\n  "store": {\n    "book": [\n      { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 },\n      { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 }\n    ],\n    "bicycle": {\n      "color": "red",\n      "price": 19.95\n    }\n  }\n}');
const query = ref('store.book[*].title');
const error = ref<string | null>(null);
const copied = ref(false);

// Simple JSONPath-like implementation
// Supports: dot notation, array index [0], wildcard [*] mapped 
const executeQuery = (data: any, path: string): any => {
    if (!path || path.trim() === '$') return data;
    
    // Normalize path: $.store.book[0].title -> store.book.0.title
    // Remove leading $.
    let normalized = path.replace(/^\$\.?/, '');
    
    // Convert brackets to dots: [0] -> .0, ['prop'] -> .prop
    normalized = normalized.replace(/\[['"]?([^'"\]]+)['"]?\]/g, '.$1');
    
    const parts = normalized.split('.').filter(p => p);
    
    let current = data;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (part === '*') {
            // Wildcard: if current is array, map rest of path
            if (Array.isArray(current)) {
                const restPath = parts.slice(i + 1).join('.');
                if (!restPath) return current; // no more path, return all
                
                // Recursively query each item
                return current.map(item => executeQuery(item, restPath));
            } else if (typeof current === 'object' && current !== null) {
                 const restPath = parts.slice(i + 1).join('.');
                 if (!restPath) return Object.values(current);
                 return Object.values(current).map(item => executeQuery(item, restPath));
            }
            return undefined;
        }
        
        if (current === undefined || current === null) return undefined;
        // @ts-ignore
        current = current[part];
    }
    
    return current;
};

const result = computed(() => {
    try {
        if (!input.value.trim()) return '';
        const data = JSON.parse(input.value);
        const res = executeQuery(data, query.value);
        error.value = null;
        return JSON.stringify(res, null, 2);
    } catch (e: any) {
        // If JSON parse error vs Query error
        if (e instanceof SyntaxError) {
             error.value = "Invalid input JSON";
        } else {
             error.value = e.message;
        }
        return '';
    }
});

const copyResult = () => {
    if (!result.value) return;
    navigator.clipboard.writeText(result.value).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    });
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
          <div class="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center ring-1 ring-orange-500/20">
            <Search :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              JSON <span class="text-orange-500">Query</span>
            </h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-h-0 flex flex-col gap-4">
        
        <!-- Query Input -->
        <div class="bg-card border border-border rounded-2xl p-2 md:p-4 shadow-sm flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                <Code2 :size="16" />
            </div>
            <input 
                v-model="query"
                type="text" 
                placeholder="Enter path (e.g. $.store.book[*].title)" 
                class="flex-1 bg-transparent outline-none font-mono text-sm text-foreground placeholder-muted-foreground"
            />
        </div>

        <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
            <!-- Source JSON -->
            <div class="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-3xl overflow-hidden shadow-lg group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                    <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <FileJson :size="12" /> Source JSON
                    </span>
                </div>
                <div class="flex-1 relative">
                    <textarea 
                        v-model="input"
                        class="absolute inset-0 w-full h-full bg-transparent p-5 font-mono text-xs leading-relaxed outline-none resize-none"
                        placeholder="Paste JSON here..."
                        spellcheck="false"
                    ></textarea>
                </div>
            </div>

            <!-- Result -->
            <div class="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-3xl overflow-hidden shadow-lg relative">
                <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                    <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Check :size="12" /> Result
                    </span>
                    <button 
                        @click="copyResult" 
                        class="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-[9px] font-black uppercase tracking-widest hover:shadow transition-all active:scale-95"
                    >
                        <Check v-if="copied" :size="10" />
                        <Copy v-else :size="10" />
                        {{ copied ? 'Copied' : 'Copy' }}
                    </button>
                </div>
                
                <div class="flex-1 relative">
                     <textarea 
                        readonly
                        :value="result"
                        class="absolute inset-0 w-full h-full bg-muted/10 p-5 font-mono text-xs leading-relaxed outline-none resize-none text-orange-600 dark:text-orange-400 font-medium"
                        placeholder="Query result..."
                        spellcheck="false"
                    ></textarea>

                    <!-- Error Overlay -->
                    <div v-if="error" class="absolute inset-x-4 bottom-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300">
                        <AlertCircle :size="18" class="shrink-0 mt-0.5" />
                        <div>
                            <p class="text-[11px] font-black uppercase tracking-widest mb-1">Error</p>
                            <p class="text-xs font-mono">{{ error }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
