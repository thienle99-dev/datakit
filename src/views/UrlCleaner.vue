<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ArrowLeft, 
  Link, 
  Copy, 
  Check, 
  Trash2,
  ExternalLink,
  ClipboardPaste,
  ArrowDown
} from 'lucide-vue-next';

// State
const input = ref('');
const copiedAll = ref(false);
const options = ref({
  utm: true,
  fbclid: true,
  gclid: true,
  amazon: true,
  allParams: false,
  decode: false,
  removeHash: false,
});

interface CleanedResult {
    original: string;
    cleaned: string;
    removedCount: number;
    removedParams: string[];
    isChanged: boolean;
}

const cleanLine = (url: string): CleanedResult => {
  if (!url.trim()) return { original: url, cleaned: '', removedCount: 0, removedParams: [], isChanged: false };

  try {
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      try {
        urlObj = new URL('https://' + url);
      } catch {
         return { original: url, cleaned: url, removedCount: 0, removedParams: [], isChanged: false };
      }
    }

    if (options.value.decode) {
        try {
            const decoded = decodeURIComponent(urlObj.href);
            urlObj = new URL(decoded);
        } catch {}
    }

    const removedParams: string[] = [];

    if (options.value.allParams) {
      if (urlObj.search) {
          removedParams.push('All Params');
          urlObj.search = '';
      }
    } else {
      const params = urlObj.searchParams;
      const keysToRemove: string[] = [];

      params.forEach((_, key) => {
        let remove = false;
        if (options.value.utm && key.startsWith('utm_')) remove = true;
        if (options.value.fbclid && key === 'fbclid') remove = true;
        if (options.value.gclid && (key === 'gclid' || key.startsWith('_ga'))) remove = true;
        
        if (remove) keysToRemove.push(key);
      });

      keysToRemove.forEach(k => {
          removedParams.push(k);
          params.delete(k);
      });
    }

    if (options.value.removeHash && urlObj.hash) {
      removedParams.push('#hash');
      urlObj.hash = '';
    }

    const cleaned = urlObj.href;
    const isChanged = cleaned !== url;

    return {
        original: url,
        cleaned,
        removedCount: removedParams.length,
        removedParams,
        isChanged
    };

  } catch (e) {
    return { original: url, cleaned: url, removedCount: 0, removedParams: [], isChanged: false };
  }
};

const processedResults = computed(() => {
    if (!input.value) return [];
    return input.value
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => cleanLine(line.trim()));
});

// For bulk copy
const allCleanedText = computed(() => processedResults.value.map(r => r.cleaned).join('\n'));
const copiedIndex = ref<number | null>(null);

const copyAll = () => {
    if (!allCleanedText.value) return;
    navigator.clipboard.writeText(allCleanedText.value).then(() => {
        copiedAll.value = true;
        setTimeout(() => copiedAll.value = false, 2000);
    });
};

const copySingle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    copiedIndex.value = idx;
    setTimeout(() => {
        copiedIndex.value = null;
    }, 2000);
};

const clear = () => {
    input.value = '';
};

const paste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        input.value = text;
    } catch (e) {
        // Fallback or permission error
    }
};

const openLink = (url: string) => {
    window.open(url, '_blank');
};

</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <!-- Simple Header -->
    <div class="flex items-center gap-4 mb-8">
        <router-link to="/" class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
          <ArrowLeft :size="20" />
        </router-link>
        
        <div class="flex items-center gap-3">
          <div class="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg">
            <Link :size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">URL Cleaner</h1>
            <p class="text-sm text-muted-foreground">Remove tracking parameters from links</p>
          </div>
        </div>
    </div>

    <!-- Main Container -->
    <div class="flex flex-col gap-6">
        
        <!-- Input Area -->
        <div class="space-y-3">
            <div class="flex items-center justify-between px-1">
                <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dirty URLs</label>
                <div class="flex items-center gap-2">
                    <button @click="paste" class="text-xs font-medium text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-1">
                        <ClipboardPaste :size="12" /> Paste
                    </button>
                    <button @click="clear" v-if="input" class="text-xs font-medium text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1">
                        <Trash2 :size="12" /> Clear
                    </button>
                </div>
            </div>
            <div class="relative group">
                <textarea 
                    v-model="input"
                    class="w-full h-32 md:h-40 bg-card border border-border rounded-xl p-4 font-mono text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-y shadow-sm"
                    placeholder="https://example.com?utm_source=...&#10;https://..."
                    spellcheck="false"
                ></textarea>
                <!-- Quick Floating Action if empty -->
                <div v-if="!input" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <span class="text-sm text-muted-foreground">Paste URLs here</span>
                </div>
            </div>
        </div>

        <!-- Options Toolbar -->
        <div class="bg-card border border-border/60 rounded-xl p-3 flex flex-wrap gap-x-6 gap-y-3 items-center justify-between shadow-sm">
             <div class="flex flex-wrap items-center gap-4">
                 <label class="flex items-center gap-2 cursor-pointer select-none">
                     <input type="checkbox" v-model="options.utm" class="rounded border-border text-indigo-500 focus:ring-0" />
                     <span class="text-sm font-medium">UTM</span>
                 </label>
                 <label class="flex items-center gap-2 cursor-pointer select-none">
                     <input type="checkbox" v-model="options.fbclid" class="rounded border-border text-indigo-500 focus:ring-0" />
                     <span class="text-sm font-medium">Facebook</span>
                 </label>
                 <label class="flex items-center gap-2 cursor-pointer select-none">
                     <input type="checkbox" v-model="options.gclid" class="rounded border-border text-indigo-500 focus:ring-0" />
                     <span class="text-sm font-medium">Google</span>
                 </label>
                 <label class="flex items-center gap-2 cursor-pointer select-none">
                     <input type="checkbox" v-model="options.removeHash" class="rounded border-border text-indigo-500 focus:ring-0" />
                     <span class="text-sm font-medium">Hash (#)</span>
                 </label>
                 <div class="w-px h-4 bg-border"></div>
                 <label class="flex items-center gap-2 cursor-pointer select-none">
                     <input type="checkbox" v-model="options.allParams" class="rounded border-border text-rose-500 focus:ring-0" />
                     <span class="text-sm font-medium text-muted-foreground hover:text-rose-500 transition-colors">Clear All Params</span>
                 </label>
             </div>
        </div>

        <!-- Arrow Divider -->
        <div class="flex items-center justify-center text-muted-foreground/30 -my-2">
            <ArrowDown :size="24" stroke-width="1.5" />
        </div>

        <!-- Results Area -->
        <div class="space-y-3">
             <div class="flex items-center justify-between px-1">
                <div class="flex items-center gap-3">
                    <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cleaned Output</label>
                    <span v-if="processedResults.length > 0" class="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{{ processedResults.length }} links</span>
                </div>
                <button 
                    v-if="processedResults.length > 0"
                    @click="copyAll" 
                    class="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                >
                    <Check v-if="copiedAll" :size="14" />
                    <Copy v-else :size="14" />
                    {{ copiedAll ? 'Copied' : 'Copy All' }}
                </button>
            </div>

            <div v-if="processedResults.length > 0" class="bg-card border border-border rounded-xl shadow-sm divide-y divide-border/40 overflow-hidden">
                <div 
                    v-for="(item, idx) in processedResults" 
                    :key="idx"
                    class="group p-4 flex gap-4 items-start hover:bg-muted/30 transition-colors"
                >
                    <div class="flex-1 min-w-0 grid gap-1.5">
                        <div class="font-mono text-sm text-foreground break-all">
                            {{ item.cleaned }}
                        </div>
                        
                        <!-- Info Row -->
                        <div class="flex flex-wrap items-center gap-2 text-xs">
                             <span 
                                v-if="item.isChanged"
                                class="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"
                             >
                                 Cleaned {{ item.removedCount }} params
                             </span>
                             <span v-else class="text-muted-foreground bg-muted/50 px-1.5 rounded">No changes</span>

                             <div v-if="item.removedCount > 0" class="flex flex-wrap gap-1 opacity-60">
                                 <span v-for="tag in item.removedParams" :key="tag" class="bg-muted px-1 rounded text-[10px] text-muted-foreground">{{ tag }}</span>
                             </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                         <button @click="openLink(item.cleaned)" class="p-2 text-muted-foreground hover:text-indigo-500 rounded-lg hover:bg-indigo-500/10 transition-colors" title="Open Link">
                            <ExternalLink :size="16" />
                        </button>
                        <button @click="copySingle(item.cleaned, idx)" class="p-2 text-muted-foreground hover:text-indigo-500 rounded-lg hover:bg-indigo-500/10 transition-colors" title="Copy">
                            <Check v-if="copiedIndex === idx" :size="16" class="text-emerald-500 animate-in zoom-in spin-in-90 duration-300" />
                            <Copy v-else :size="16" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Empty State Output -->
            <div v-else class="h-32 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-muted-foreground/40 bg-muted/5">
                <span class="text-sm font-medium">Clean URLs will appear here</span>
            </div>
        </div>

    </div>
  </div>
</template>
