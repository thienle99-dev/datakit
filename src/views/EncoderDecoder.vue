<script setup lang="ts">
import { ref } from 'vue';
import { 
  ArrowLeft, 
  Binary, 
  Link, 
  Code2, 
  Shield, 
  Copy, 
  Check, 
  Eraser
} from 'lucide-vue-next';

type Mode = 'base64' | 'url' | 'html' | 'hash';
const mode = ref<Mode>('base64');
const input = ref('');
const result = ref('');
const copied = ref(false);
const autoUpdate = ref(true);

// Hash options
const hashAlgo = ref<'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5'>('SHA-256');

// Encoders
const base64Encode = () => {
    try {
        result.value = btoa(input.value);
    } catch {
        result.value = "Error: Invalid input for Base64 encode";
    }
};
const base64Decode = () => {
    try {
        result.value = atob(input.value);
    } catch {
        result.value = "Error: Invalid Base64 string";
    }
};

const urlEncode = () => {
    result.value = encodeURIComponent(input.value);
};
const urlDecode = () => {
    try {
        result.value = decodeURIComponent(input.value);
    } catch {
        result.value = "Error: Malformed URL";
    }
};

const htmlEncode = () => {
    const div = document.createElement('div');
    div.innerText = input.value;
    result.value = div.innerHTML;
};
const htmlDecode = () => {
    const div = document.createElement('div');
    div.innerHTML = input.value;
    result.value = div.innerText;
};

const computeHash = async () => {
    if (!input.value) {
        result.value = '';
        return;
    }
    const msgBuffer = new TextEncoder().encode(input.value);
    const hashBuffer = await crypto.subtle.digest(hashAlgo.value, msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    result.value = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handleInput = () => {
    if (!autoUpdate.value) return;
    // For hash, we might debounce, but for others instant is fine.
    if (mode.value === 'hash') computeHash();
};

const copyResult = () => {
    if (!result.value) return;
    navigator.clipboard.writeText(result.value).then(() => {
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    });
};

const clear = () => {
    input.value = '';
    result.value = '';
};

// Mode switcher
const setMode = (m: Mode) => {
    mode.value = m;
    clear();
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
          <div class="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center ring-1 ring-indigo-500/20">
            <Binary v-if="mode === 'base64'" :size="20" />
            <Link v-else-if="mode === 'url'" :size="20" />
            <Code2 v-else-if="mode === 'html'" :size="20" />
            <Shield v-else-if="mode === 'hash'" :size="20" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-black tracking-tight text-foreground">
              Encoder <span class="text-indigo-500">Suite</span>
            </h2>
          </div>
        </div>
      </div>

      <!-- Mode Tabs -->
      <div class="flex bg-card border border-border/50 p-1 rounded-xl">
           <button 
             v-for="m in ['base64', 'url', 'html', 'hash']" 
             :key="m"
             @click="setMode(m as Mode)"
             class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
             :class="mode === m ? 'bg-indigo-500 text-white shadow-md' : 'text-muted-foreground hover:bg-muted'"
           >
             {{ m }}
           </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        <!-- Input Column -->
        <div class="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-lg group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Input</span>
                <button @click="clear" class="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground hover:text-rose-500">
                    <Eraser :size="12" /> Clear
                </button>
            </div>
            <div class="flex-1 relative">
                <textarea 
                    v-model="input"
                    @input="handleInput"
                    class="absolute inset-0 w-full h-full bg-transparent p-5 font-mono text-xs leading-relaxed outline-none resize-none"
                    placeholder="Type or paste content here..."
                    spellcheck="false"
                ></textarea>
            </div>
            <!-- Actions Bar -->
            <div class="p-3 border-t border-border flex gap-2 justify-end bg-background/50">
                 <template v-if="mode === 'hash'">
                     <select v-model="hashAlgo" class="bg-muted text-xs font-bold px-2 py-1 rounded border border-border outline-none">
                         <option value="SHA-256">SHA-256</option>
                         <option value="SHA-512">SHA-512</option>
                         <option value="SHA-1">SHA-1</option>
                         <option value="MD5">MD5 (Not Safe)</option>
                     </select>
                     <button @click="computeHash" class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] uppercase font-black tracking-widest rounded-lg transition-colors">Generate Hash</button>
                 </template>
                 <template v-else>
                     <div class="flex items-center gap-2 mr-auto px-2">
                        <label class="flex items-center gap-2 text-[10px] font-bold text-muted-foreground cursor-pointer">
                            <input type="checkbox" v-model="autoUpdate" class="rounded border-border" /> Live
                        </label>
                     </div>
                     <button @click="mode === 'base64' ? base64Encode() : mode === 'url' ? urlEncode() : htmlEncode()" class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] uppercase font-black tracking-widest rounded-lg transition-colors">Encode</button>
                     <button @click="mode === 'base64' ? base64Decode() : mode === 'url' ? urlDecode() : htmlDecode()" class="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-[10px] uppercase font-black tracking-widest rounded-lg transition-colors">Decode</button>
                 </template>
            </div>
        </div>

        <!-- Output Column -->
        <div class="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-lg relative">
            <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    Result
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
                    class="absolute inset-0 w-full h-full bg-muted/10 p-5 font-mono text-xs leading-relaxed outline-none resize-none text-indigo-600 dark:text-indigo-400 font-medium"
                    placeholder="Output will appear here..."
                    spellcheck="false"
                ></textarea>
            </div>
        </div>

    </div>
  </div>
</template>
