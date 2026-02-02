<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  Clipboard, 
  Check, 
  Trash2, 
  Copy, 
  Settings2, 
  Wand2, 
  Eraser, 
  SortAsc, 
  SortDesc, 
  Type, 
  Braces,
  Hash,
  Quote,
  Filter,
  Plus
} from 'lucide-vue-next';

// Input State
const inputText = ref('');
const resultText = ref('');
const copied = ref(false);

// Configuration State
const language = ref('javascript');
const quoteType = ref('double'); // 'none', 'single', 'double'
const arrayFormat = ref('standard'); // 'standard', 'joined'
const numbersInQuotes = ref(false);
const autoDetectNumbers = ref(true);
const includeSpaces = ref(true);

// Cleaning State
const doTrim = ref(true);
const doRemoveEmpty = ref(true);
const doDeduplicate = ref(false);
const caseInsensitiveDedupe = ref(false);
const sortOrder = ref('none'); // 'none', 'asc', 'desc'
const prefix = ref('');
const suffix = ref('');
const findRegex = ref('');
const replaceText = ref('');

// Language Options
const languages = [
  { id: 'javascript', name: 'JavaScript / TS', icon: 'JS' },
  { id: 'typescript', name: 'TypeScript', icon: 'TS' },
  { id: 'python', name: 'Python', icon: 'PY' },
  { id: 'php', name: 'PHP', icon: 'PHP' },
  { id: 'ruby', name: 'Ruby', icon: 'RB' },
  { id: 'java', name: 'Java', icon: 'JV' },
  { id: 'go', name: 'Go', icon: 'GO' },
  { id: 'perl', name: 'Perl', icon: 'PL' },
  { id: 'json', name: 'JSON', icon: '{ }' },
  { id: 'sql', name: 'SQL IN List', icon: 'SQL' },
];

const processedLines = computed(() => {
  let lines = inputText.value
    .split(/\r?\n|,/)
    .map(line => line.trim())
    .filter(line => line !== '');

  if (doTrim.value) {
    lines = lines.map(l => l.trim());
  }

  if (doRemoveEmpty.value) {
    lines = lines.filter(l => l !== '');
  }

  if (doDeduplicate.value) {
    if (caseInsensitiveDedupe.value) {
      const seen = new Set();
      lines = lines.filter(item => {
        const lower = item.toLowerCase();
        return seen.has(lower) ? false : seen.add(lower);
      });
    } else {
      lines = Array.from(new Set(lines));
    }
  }

  if (sortOrder.value === 'asc') {
    lines.sort((a, b) => a.localeCompare(b));
  } else if (sortOrder.value === 'desc') {
    lines.sort((a, b) => b.localeCompare(a));
  }

  if (findRegex.value) {
    try {
      const re = new RegExp(findRegex.value, 'g');
      lines = lines.map(line => line.replace(re, replaceText.value));
    } catch (e) {
      // Invalid regex, ignore
    }
  }

  if (prefix.value || suffix.value) {
    lines = lines.map(line => `${prefix.value}${line}${suffix.value}`);
  }

  return lines;
});

const generateArray = () => {
  const items = processedLines.value;
  if (items.length === 0) {
    resultText.value = '';
    return;
  }

  const formattedItems = items.map(item => {
    const isNum = autoDetectNumbers.value && !isNaN(Number(item)) && item.trim() !== '';
    
    if (isNum && !numbersInQuotes.value) {
      return item;
    }

    if (quoteType.value === 'single') {
      return `'${item.replace(/'/g, "\\'")}'`;
    } else if (quoteType.value === 'double') {
      return `"${item.replace(/"/g, '\\"')}"`;
    } else {
      return item;
    }
  });

  const separator = includeSpaces.value ? ', ' : ',';
  const joined = formattedItems.join(separator);

  if (arrayFormat.value === 'joined') {
    resultText.value = joined;
    return;
  }

  switch (language.value) {
    case 'javascript':
    case 'typescript':
    case 'python':
    case 'json':
      resultText.value = `[${joined}]`;
      break;
    case 'php':
      resultText.value = `array(${joined})`;
      break;
    case 'ruby':
      resultText.value = `[${joined}]`;
      break;
    case 'java':
      resultText.value = `new String[] {${joined}}`;
      break;
    case 'go':
      resultText.value = `[]string{${joined}}`;
      break;
    case 'perl':
      resultText.value = `(${joined})`;
      break;
    case 'sql':
      resultText.value = `(${joined})`;
      break;
    default:
      resultText.value = joined;
  }
};

watch([processedLines, language, quoteType, arrayFormat, numbersInQuotes, autoDetectNumbers, includeSpaces], () => {
  generateArray();
}, { immediate: true });

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(resultText.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

const clearInput = () => {
  inputText.value = '';
};

const handleSort = () => {
  if (sortOrder.value === 'none') sortOrder.value = 'asc';
  else if (sortOrder.value === 'asc') sortOrder.value = 'desc';
  else sortOrder.value = 'none';
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex flex-col gap-8">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20">
            <Braces :size="24" />
          </div>
          <div>
            <h1 class="text-3xl font-black tracking-tight">ArrayThis<span class="text-primary">+</span></h1>
            <p class="text-muted-foreground font-medium">Turn any list into code-ready arrays in seconds.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Input & Controls -->
        <div class="lg:col-span-7 space-y-6">
          <div class="glass-card rounded-3xl border border-border/50 overflow-hidden bg-card shadow-xl">
            <div class="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
              <div class="flex items-center gap-2">
                <Type :size="18" class="text-primary" />
                <span class="text-sm font-bold uppercase tracking-wider">Input List</span>
                <span class="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">{{ processedLines.length }} Items</span>
              </div>
              <button 
                @click="clearInput"
                class="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-colors"
                title="Clear Input"
              >
                <Trash2 :size="18" />
              </button>
            </div>
            <div class="p-0 relative">
              <textarea
                v-model="inputText"
                placeholder="Paste your list here (newline or comma separated)..."
                class="w-full h-[400px] p-6 bg-transparent focus:outline-none resize-none font-mono text-sm leading-relaxed"
              ></textarea>
            </div>
            
            <!-- Quick Clean Tools -->
            <div class="p-4 bg-muted/20 border-t border-border/50 flex flex-wrap gap-2">
              <button 
                @click="doTrim = !doTrim"
                :class="doTrim ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Eraser :size="14" /> Trim
              </button>
              <button 
                @click="doRemoveEmpty = !doRemoveEmpty"
                :class="doRemoveEmpty ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Filter :size="14" /> Remove Empty
              </button>
              <button 
                @click="doDeduplicate = !doDeduplicate"
                :class="doDeduplicate ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Copy :size="14" /> Unique
              </button>
              <button 
                @click="handleSort"
                :class="sortOrder !== 'none' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <SortAsc v-if="sortOrder !== 'desc'" :size="14" />
                <SortDesc v-else :size="14" />
                Sort: {{ sortOrder === 'none' ? 'None' : sortOrder.toUpperCase() }}
              </button>
            </div>
          </div>

          <!-- Advanced Clean Options -->
          <div class="glass-card rounded-3xl border border-border/50 p-6 bg-card shadow-lg space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Wand2 :size="18" />
              </div>
              <h2 class="text-sm font-bold uppercase tracking-widest text-muted-foreground">Clean & Optimize</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-muted-foreground uppercase">Prefix / Suffix</label>
                  <div class="flex gap-2">
                    <input 
                      v-model="prefix" 
                      placeholder="Prefix..." 
                      class="flex-1 px-3 py-2 rounded-xl bg-muted/30 border border-border/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <input 
                      v-model="suffix" 
                      placeholder="Suffix..." 
                      class="flex-1 px-3 py-2 rounded-xl bg-muted/30 border border-border/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <input type="checkbox" v-model="caseInsensitiveDedupe" id="case-dedupe" class="rounded border-border" />
                  <label for="case-dedupe" class="text-xs font-medium text-muted-foreground">Case-insensitive deduplication</label>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-muted-foreground uppercase">Find & Replace (Regex)</label>
                  <div class="flex gap-2">
                    <input 
                      v-model="findRegex" 
                      placeholder="Find..." 
                      class="flex-1 px-3 py-2 rounded-xl bg-muted/30 border border-border/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <input 
                      v-model="replaceText" 
                      placeholder="Replace..." 
                      class="flex-1 px-3 py-2 rounded-xl bg-muted/30 border border-border/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Output & Config -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Configuration -->
          <div class="glass-card rounded-3xl border border-border/50 p-6 bg-card shadow-lg flex flex-col gap-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Settings2 :size="18" />
              </div>
              <h2 class="text-sm font-bold uppercase tracking-widest text-muted-foreground">Output Settings</h2>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-muted-foreground uppercase">Target Language</label>
                <div class="grid grid-cols-3 md:grid-cols-5 gap-2">
                  <button 
                    v-for="lang in languages" 
                    :key="lang.id"
                    @click="language = lang.id"
                    :class="language === lang.id ? 'bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/20' : 'bg-muted/30 hover:bg-muted/50 border border-border/50'"
                    class="p-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1"
                  >
                    <span>{{ lang.icon }}</span>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 pt-2">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-muted-foreground uppercase">Quote Style</label>
                  <div class="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                    <button 
                      v-for="q in ['none', 'single', 'double']" 
                      :key="q"
                      @click="quoteType = q"
                      :class="quoteType === q ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'"
                      class="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      {{ q }}
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-bold text-muted-foreground uppercase">Format</label>
                  <div class="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                    <button 
                      @click="arrayFormat = 'standard'"
                      :class="arrayFormat === 'standard' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'"
                      class="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      Default
                    </button>
                    <button 
                      @click="arrayFormat = 'joined'"
                      :class="arrayFormat === 'joined' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'"
                      class="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      Joined
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-3 pt-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Hash :size="14" />
                    </div>
                    <span class="text-xs font-bold">Auto-detect numbers</span>
                  </div>
                  <button 
                    @click="autoDetectNumbers = !autoDetectNumbers"
                    :class="autoDetectNumbers ? 'bg-emerald-500' : 'bg-muted'"
                    class="w-10 h-5 rounded-full relative transition-colors"
                  >
                    <div :class="autoDetectNumbers ? 'translate-x-5' : 'translate-x-1'" class="absolute top-1 w-3 h-3 bg-white rounded-full transition-transform"></div>
                  </button>
                </div>

                <div class="flex items-center justify-between" v-if="autoDetectNumbers">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Quote :size="14" />
                    </div>
                    <span class="text-xs font-bold">Numbers in quotes</span>
                  </div>
                  <button 
                    @click="numbersInQuotes = !numbersInQuotes"
                    :class="numbersInQuotes ? 'bg-amber-500' : 'bg-muted'"
                    class="w-10 h-5 rounded-full relative transition-colors"
                  >
                    <div :class="numbersInQuotes ? 'translate-x-5' : 'translate-x-1'" class="absolute top-1 w-3 h-3 bg-white rounded-full transition-transform"></div>
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Plus :size="14" />
                    </div>
                    <span class="text-xs font-bold">Include spaces</span>
                  </div>
                  <button 
                    @click="includeSpaces = !includeSpaces"
                    :class="includeSpaces ? 'bg-blue-500' : 'bg-muted'"
                    class="w-10 h-5 rounded-full relative transition-colors"
                  >
                    <div :class="includeSpaces ? 'translate-x-5' : 'translate-x-1'" class="absolute top-1 w-3 h-3 bg-white rounded-full transition-transform"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Output -->
          <div class="glass-card rounded-3xl border border-border/50 overflow-hidden bg-card shadow-xl h-full flex flex-col">
            <div class="p-4 border-b border-border/50 flex items-center justify-between bg-emerald-500/5">
              <div class="flex items-center gap-2">
                <Check :size="18" class="text-emerald-500" />
                <span class="text-sm font-bold uppercase tracking-wider text-emerald-500">Output Code</span>
              </div>
              <button 
                @click="copyToClipboard"
                :class="copied ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:scale-105'"
                class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Clipboard v-if="!copied" :size="14" />
                <Check v-else :size="14" />
                {{ copied ? 'COPIED!' : 'COPY ARRAY' }}
              </button>
            </div>
            <div class="p-6 h-[300px] overflow-auto bg-card/50 font-mono text-xs leading-relaxed break-all">
              <pre class="whitespace-pre-wrap">{{ resultText }}</pre>
              <div v-if="!resultText" class="h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-4">
                <Braces :size="48" stroke-width="1" />
                <p class="font-bold uppercase tracking-widest text-[10px]">Result will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  position: relative;
  transition: all 0.3s ease;
}

.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(var(--primary-rgb), 0.1);
  border-radius: 10px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--primary-rgb), 0.2);
}
</style>
