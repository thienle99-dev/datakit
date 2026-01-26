<script setup lang="ts">
import { ref, watch } from 'vue';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Trash2, 
  FileJson, 
  Minimize2, 
  Maximize2,
  AlertCircle,
  Braces
} from 'lucide-vue-next';

const input = ref('');
const result = ref('');
const error = ref<string | null>(null);
const copied = ref(false);
const indentSize = ref(2);

// Actions
const format = () => {
    if (!input.value.trim()) {
        result.value = '';
        error.value = null;
        return;
    }
    
    try {
        const parsed = JSON.parse(input.value);
        result.value = JSON.stringify(parsed, null, indentSize.value);
        error.value = null;
    } catch (err: any) {
        error.value = err.message;
        // Don't clear result, keep previous output or empty
    }
};

const minify = () => {
    if (!input.value.trim()) {
        result.value = '';
        error.value = null;
        return;
    }

    try {
        const parsed = JSON.parse(input.value);
        result.value = JSON.stringify(parsed);
        error.value = null;
    } catch (err: any) {
        error.value = err.message;
    }
};

const clear = () => {
    input.value = '';
    result.value = '';
    error.value = null;
};

const copyResult = () => {
    if (!result.value) return;
    navigator.clipboard.writeText(result.value).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    });
};

const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        input.value = text;
        format(); // Auto format on paste button
    } catch (err) {
        // Fallback or permission error
    }
};

// Auto format when indent changes
watch(indentSize, () => {
    if (result.value && !error.value) format();
});

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
          <div class="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20">
            <Braces :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              JSON <span class="text-amber-500">Beautifier</span>
            </h2>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
         <!-- Toolbar -->
         <div class="flex items-center bg-card border border-border p-1 rounded-xl shadow-sm">
             <button 
                @click="format"
                class="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                :class="!error ? 'text-foreground' : ''"
            >
                <Maximize2 :size="14" /> Beaufity
            </button>
            <div class="w-px h-4 bg-border mx-1"></div>
            <button 
                @click="minify"
                class="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
            >
                <Minimize2 :size="14" /> Minify
            </button>
         </div>

         <div class="h-8 w-px bg-border/50 mx-2"></div>

         <button 
            @click="clear"
            class="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all active:scale-95 duration-300"
         >
            <Trash2 :size="18" />
         </button>
      </div>
    </div>

    <!-- Main Editor Area -->
    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 relative">
        <!-- Input -->
        <div class="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-3xl overflow-hidden shadow-lg group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileJson :size="12" /> Input
                </span>
                <button @click="handlePaste" class="text-[10px] font-bold text-primary hover:underline">Paste & Format</button>
            </div>
            <div class="flex-1 relative">
                <textarea 
                    v-model="input"
                    class="absolute inset-0 w-full h-full bg-transparent p-5 font-mono text-xs leading-relaxed outline-none resize-none"
                    placeholder='Paste JSON here, e.g. { "key": "value" }'
                    spellcheck="false"
                ></textarea>
            </div>
        </div>

        <!-- Output -->
        <div class="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-3xl overflow-hidden shadow-lg relative">
            <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Check :size="12" /> Result
                </span>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-muted-foreground mr-2">Indent:</span>
                    <select v-model="indentSize" class="bg-background border border-border rounded text-[10px] font-bold px-1 py-0.5 outline-none">
                        <option :value="2">2 spaces</option>
                        <option :value="4">4 spaces</option>
                        <option :value="'\t'">Tab</option>
                    </select>
                    <button 
                        @click="copyResult" 
                        class="ml-2 flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-[9px] font-black uppercase tracking-widest hover:shadow transition-all active:scale-95"
                    >
                        <Check v-if="copied" :size="10" />
                        <Copy v-else :size="10" />
                        {{ copied ? 'Copied' : 'Copy' }}
                    </button>
                </div>
            </div>
            
            <div class="flex-1 relative">
                 <textarea 
                    readonly
                    :value="result"
                    class="absolute inset-0 w-full h-full bg-muted/10 p-5 font-mono text-xs leading-relaxed outline-none resize-none text-emerald-600 dark:text-emerald-400 font-medium"
                    placeholder="Result will appear here..."
                    spellcheck="false"
                ></textarea>

                <!-- Error Overlay -->
                <div v-if="error" class="absolute inset-x-4 bottom-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300">
                    <AlertCircle :size="18" class="shrink-0 mt-0.5" />
                    <div>
                        <p class="text-[11px] font-black uppercase tracking-widest mb-1">Invalid JSON</p>
                        <p class="text-xs font-mono">{{ error }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
