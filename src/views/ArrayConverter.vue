<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { 
  Clipboard, 
  Check, 
  Trash2, 
  Settings2, 
  Braces,
  AlignLeft,
  Variable,
  FileCode,
  Search,
  Download,
  Terminal,
  ChevronRight,
  Zap,
  LayoutGrid,
  Monitor,
  SortAsc,
  SortDesc
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
const isPretty = ref(true);
const variableName = ref('');

// Cleaning & Transformation State
const doTrim = ref(true);
const doRemoveEmpty = ref(true);
const doDeduplicate = ref(false);
const caseInsensitiveDedupe = ref(false);
const sortOrder = ref('none'); // 'none', 'asc', 'desc'
const prefix = ref('');
const suffix = ref('');
const findRegex = ref('');
const replaceText = ref('');
const extractRegex = ref('');
const caseStyle = ref('none'); // 'none', 'camel', 'snake', 'kebab', 'constant'
const addIndex = ref(false);
const indexStart = ref(1);
const livePreview = ref(true);
const isProcessing = ref(false);

// Object Mode
const objectMode = ref(false);
const objectSeparator = ref(':');

// Language Options
const languages = [
  { id: 'javascript', name: 'JS/TS', icon: 'JS', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'python', name: 'Python', icon: 'PY', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'php', name: 'PHP', icon: 'PHP', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'ruby', name: 'Ruby', icon: 'RB', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'java', name: 'Java', icon: 'JV', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'go', name: 'Go', icon: 'GO', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'rust', name: 'Rust', icon: 'RS', color: 'text-orange-600', bg: 'bg-orange-600/10' },
  { id: 'sql', name: 'SQL', icon: 'SQL', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'json', name: 'JSON', icon: '{ }', color: 'text-white/70', bg: 'bg-white/5' },
];

const STORAGE_KEY = 'array_this_plus_config_v2';

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      language.value = config.language || 'javascript';
      quoteType.value = config.quoteType || 'double';
      arrayFormat.value = config.arrayFormat || 'standard';
      numbersInQuotes.value = config.numbersInQuotes ?? false;
      autoDetectNumbers.value = config.autoDetectNumbers ?? true;
      includeSpaces.value = config.includeSpaces ?? true;
      isPretty.value = config.isPretty ?? true;
      variableName.value = config.variableName || '';
      doTrim.value = config.doTrim ?? true;
      doRemoveEmpty.value = config.doRemoveEmpty ?? true;
      caseStyle.value = config.caseStyle || 'none';
      objectMode.value = config.objectMode ?? false;
      objectSeparator.value = config.objectSeparator || ':';
      livePreview.value = config.livePreview ?? true;
      doDeduplicate.value = config.doDeduplicate ?? false;
      caseInsensitiveDedupe.value = config.caseInsensitiveDedupe ?? false;
      sortOrder.value = config.sortOrder || 'none';
      prefix.value = config.prefix || '';
      suffix.value = config.suffix || '';
      findRegex.value = config.findRegex || '';
      replaceText.value = config.replaceText || '';
      extractRegex.value = config.extractRegex || '';
      addIndex.value = config.addIndex ?? false;
      indexStart.value = config.indexStart ?? 1;
    } catch (e) {}
  }
});

watch([
  language, quoteType, arrayFormat, numbersInQuotes, autoDetectNumbers, 
  includeSpaces, isPretty, variableName, doTrim, doRemoveEmpty, 
  caseStyle, objectMode, objectSeparator, livePreview,
  doDeduplicate, caseInsensitiveDedupe, sortOrder, prefix, suffix,
  findRegex, replaceText, extractRegex, addIndex, indexStart
], () => {
  const config = {
    language: language.value,
    quoteType: quoteType.value,
    arrayFormat: arrayFormat.value,
    numbersInQuotes: numbersInQuotes.value,
    autoDetectNumbers: autoDetectNumbers.value,
    includeSpaces: includeSpaces.value,
    isPretty: isPretty.value,
    variableName: variableName.value,
    doTrim: doTrim.value,
    doRemoveEmpty: doRemoveEmpty.value,
    caseStyle: caseStyle.value,
    objectMode: objectMode.value,
    objectSeparator: objectSeparator.value,
    livePreview: livePreview.value,
    doDeduplicate: doDeduplicate.value,
    caseInsensitiveDedupe: caseInsensitiveDedupe.value,
    sortOrder: sortOrder.value,
    prefix: prefix.value,
    suffix: suffix.value,
    findRegex: findRegex.value,
    replaceText: replaceText.value,
    extractRegex: extractRegex.value,
    addIndex: addIndex.value,
    indexStart: indexStart.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}, { deep: true });

// Case Helpers
const toCamelCase = (str: string) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_m, chr) => chr.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
const toSnakeCase = (str: string) => str.replace(/\W+/g, " ").split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('_');
const toKebabCase = (str: string) => str.replace(/\W+/g, " ").split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('-');
const toConstantCase = (str: string) => str.replace(/\W+/g, " ").split(/ |\B(?=[A-Z])/).map(word => word.toUpperCase()).join('_');

const applyCase = (str: string) => {
  switch (caseStyle.value) {
    case 'camel': return toCamelCase(str);
    case 'snake': return toSnakeCase(str);
    case 'kebab': return toKebabCase(str);
    case 'constant': return toConstantCase(str);
    default: return str;
  }
};

const processedLines = computed(() => {
  let lines: string[] = [];
  
  if (extractRegex.value) {
    try {
      const re = new RegExp(extractRegex.value, 'g');
      const matches = inputText.value.matchAll(re);
      for (const match of matches) {
        lines.push(match[1] || match[0]);
      }
    } catch (e) {}
  } else {
    lines = inputText.value.split(/\r?\n|,/);
  }

  lines = lines.map(line => line.trim());
  if (doTrim.value) lines = lines.map(l => l.trim());
  if (doRemoveEmpty.value) lines = lines.filter(l => l !== '');
  if (caseStyle.value !== 'none') lines = lines.map(l => applyCase(l));

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

  if (sortOrder.value === 'asc') lines.sort((a, b) => a.localeCompare(b));
  else if (sortOrder.value === 'desc') lines.sort((a, b) => b.localeCompare(a));

  if (findRegex.value) {
    try {
      const re = new RegExp(findRegex.value, 'g');
      lines = lines.map(line => line.replace(re, replaceText.value));
    } catch (e) {}
  }

  if (prefix.value || suffix.value) lines = lines.map(line => `${prefix.value}${line}${suffix.value}`);
  if (addIndex.value) lines = lines.map((line, i) => `${indexStart.value + i}${line}`);

  return lines;
});

const generateArray = () => {
  isProcessing.value = true;
  const items = processedLines.value;
  if (items.length === 0) {
    resultText.value = '';
    isProcessing.value = false;
    return;
  }

  const formatItem = (item: string) => {
    if (objectMode.value && item.includes(objectSeparator.value)) {
      const parts = item.split(objectSeparator.value);
      const key = parts[0] || '';
      const valParts = parts.slice(1);
      const val = valParts.join(objectSeparator.value).trim();
      const k = applyCase(key.trim());
      return `"${k}": "${val.replace(/"/g, '\\"')}"`;
    }

    const isNum = autoDetectNumbers.value && !isNaN(Number(item)) && item.trim() !== '';
    if (isNum && !numbersInQuotes.value) return item;

    const escaped = item.replace(quoteType.value === 'single' ? /'/g : /"/g, "\\$&");
    return quoteType.value === 'single' ? `'${escaped}'` : quoteType.value === 'double' ? `"${escaped}"` : item;
  };

  const formattedItems = items.map(formatItem);
  const indent = isPretty.value ? "  " : "";
  const newline = isPretty.value ? "\n" : "";
  const baseSeparator = includeSpaces.value ? ", " : ",";
  const separator = isPretty.value ? `,${newline}${indent}` : baseSeparator;

  let body = formattedItems.join(separator);
  if (isPretty.value) body = `${newline}${indent}${body}${newline}`;

  let final = body;
  let wrapper = "";

  if (arrayFormat.value !== 'joined') {
    switch (language.value) {
      case 'javascript':
      case 'typescript': 
        wrapper = objectMode.value ? "{#}" : "[#]";
        if (variableName.value) final = `const ${variableName.value} = ${wrapper.replace('#', body)};`;
        else final = wrapper.replace('#', body);
        break;
      case 'python':
        final = `[${body}]`;
        if (variableName.value) final = `${variableName.value} = ${final}`;
        break;
      case 'php':
        final = `array(${body})`;
        if (variableName.value) final = `$${variableName.value} = ${final};`;
        break;
      case 'ruby':
        final = `[${body}]`;
        if (variableName.value) final = `${variableName.value} = ${final}`;
        break;
      case 'java':
        final = `new String[] {${body}}`;
        if (variableName.value) final = `String[] ${variableName.value} = ${final};`;
        break;
      case 'go':
        final = `[]string{${body}}`;
        if (variableName.value) final = `${variableName.value} := ${final}`;
        break;
      case 'json':
        final = objectMode.value ? `{${body}}` : `[${body}]`;
        break;
      case 'sql':
        final = `(${body})`;
        break;
      default:
        final = body;
    }
  } else {
    final = body;
  }

  resultText.value = final;
  isProcessing.value = false;
};

watch([
  inputText, processedLines, language, quoteType, arrayFormat, 
  numbersInQuotes, autoDetectNumbers, includeSpaces, isPretty, 
  variableName, objectMode, objectSeparator, livePreview
], () => {
  if (livePreview.value) {
    generateArray();
  }
}, { immediate: true });

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(resultText.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {}
};

const handleSort = () => {
  if (sortOrder.value === 'none') sortOrder.value = 'asc';
  else if (sortOrder.value === 'asc') sortOrder.value = 'desc';
  else sortOrder.value = 'none';
};

const handleFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { inputText.value = e.target?.result as string; };
  reader.readAsText(file);
};
</script>

<template>
  <div class="h-[calc(100vh-64px)] overflow-hidden bg-background/50 flex flex-col">
    <!-- Slim Top Bar -->
    <div class="h-14 border-b border-border/50 bg-card/30 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20">
          <Terminal :size="16" />
        </div>
        <div>
          <h1 class="text-sm font-black tracking-tight flex items-center gap-1.5 uppercase">
            ArrayThis
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">PRO</span>
          </h1>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <button 
          @click="livePreview = !livePreview"
          :class="livePreview ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted/30 text-muted-foreground border-border/20'"
          class="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95"
        >
          <Check v-if="livePreview" :size="12" />
          <RefreshCw v-else :size="12" :class="{ 'animate-spin': isProcessing }" />
          Live Preview {{ livePreview ? 'Active' : 'Off' }}
        </button>
        <div class="h-4 w-px bg-border/50 hidden sm:block"></div>
        <button 
          @click="copyToClipboard"
          :class="copied ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:scale-[1.02] shadow-lg shadow-primary/20 active:scale-95 transition-all'"
          class="px-5 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"
        >
          <Clipboard v-if="!copied" :size="14" />
          <Check v-else :size="14" />
          {{ copied ? 'Copied' : 'Copy Output' }}
        </button>
        <button 
          v-if="!livePreview"
          @click="generateArray"
          class="px-5 py-1.5 rounded-lg text-[10px] font-black uppercase bg-emerald-500 text-white hover:scale-[1.02] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Zap :size="14" />
          Run
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar Settings -->
      <div class="w-64 border-r border-border/50 bg-card/20 backdrop-blur-sm overflow-y-auto p-4 space-y-6 scrollbar-hide shrink-0">
        <!-- Language Group -->
        <section class="space-y-2.5">
          <h2 class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
            <LayoutGrid :size="10" /> Target Environment
          </h2>
          <div class="grid grid-cols-3 gap-1.5">
            <button 
              v-for="lang in languages" 
              :key="lang.id"
              @click="language = lang.id"
              :class="[
                language === lang.id 
                  ? `${lang.bg} ${lang.color} ring-1 ring-current border-transparent` 
                  : 'bg-muted/10 hover:bg-muted/30 border-border/20 text-muted-foreground'
              ]"
              class="relative h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border group overflow-hidden active:scale-95"
              :title="lang.name"
            >
              <div v-if="language === lang.id" class="absolute top-0 right-0 w-3 h-3 translate-x-1.5 -translate-y-1.5 bg-current rotate-45 opacity-20"></div>
              <span class="text-[9px] font-black tracking-tighter shrink-0">{{ lang.icon }}</span>
              <span class="text-[6px] font-bold uppercase opacity-60 shrink-0">{{ lang.name }}</span>
            </button>
          </div>
        </section>

        <!-- Generation Rules -->
        <section class="space-y-3">
          <h2 class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
             <Settings2 :size="10" /> Rules
          </h2>
          
          <div class="space-y-2.5">
            <div class="space-y-1">
              <label class="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Variable :size="10" /> Var Name
              </label>
              <input 
                v-model="variableName" 
                placeholder="items..." 
                class="w-full bg-muted/20 border border-border/50 rounded-lg px-2.5 py-1.5 text-[10px] font-bold outline-none"
              />
            </div>

            <div class="flex items-center justify-between group cursor-pointer" @click="isPretty = !isPretty">
              <span class="text-[9px] font-bold text-muted-foreground uppercase group-hover:text-foreground">Pretty Print</span>
              <button 
                :class="isPretty ? 'bg-primary' : 'bg-muted/50'"
                class="w-6 h-3 rounded-full relative transition-all"
              >
                <div :class="isPretty ? 'translate-x-3' : 'translate-x-0.5'" class="absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all"></div>
              </button>
            </div>

            <div class="flex items-center justify-between group cursor-pointer" @click="autoDetectNumbers = !autoDetectNumbers">
              <span class="text-[9px] font-bold text-muted-foreground uppercase group-hover:text-foreground">Numbers</span>
              <button 
                :class="autoDetectNumbers ? 'bg-emerald-500' : 'bg-muted/50'"
                class="w-6 h-3 rounded-full relative transition-all"
              >
                <div :class="autoDetectNumbers ? 'translate-x-3' : 'translate-x-0.5'" class="absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all"></div>
              </button>
            </div>
            
            <div class="flex bg-muted/20 p-0.5 rounded-lg border border-border/50">
              <button 
                v-for="q in ['none', 'single', 'double']" 
                :key="q"
                @click="quoteType = q"
                :class="quoteType === q ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'"
                class="flex-1 py-1 rounded-md text-[7px] font-black uppercase transition-all"
              >
                {{ q }}
              </button>
            </div>
          </div>
        </section>

        <!-- Transformers -->
        <section class="space-y-3">
          <h2 class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
            <Zap :size="10" /> Transformers
          </h2>
          
          <div class="space-y-2.5">
            <div class="grid grid-cols-2 gap-1">
              <button 
                v-for="c in ['none', 'camel', 'snake', 'kebab', 'constant']" 
                :key="c"
                @click="caseStyle = c"
                :class="caseStyle === c ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'bg-muted/10 border-border/20 text-muted-foreground'"
                class="px-1.5 py-1 rounded-md text-[7px] font-black uppercase border"
              >
                {{ c }}
              </button>
            </div>

            <div class="relative">
              <Search :size="10" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input 
                v-model="extractRegex" 
                placeholder="Regex extract..." 
                class="w-full bg-muted/20 border border-border/50 rounded-lg pl-8 pr-2 py-1.5 text-[9px] font-mono outline-none"
              />
            </div>

            <div class="flex items-center justify-between group cursor-pointer" @click="objectMode = !objectMode">
              <span class="text-[9px] font-bold text-muted-foreground uppercase">Object Mode</span>
              <button 
                :class="objectMode ? 'bg-indigo-500' : 'bg-muted/50'"
                class="w-6 h-3 rounded-full relative transition-all"
              >
                <div :class="objectMode ? 'translate-x-3' : 'translate-x-0.5'" class="absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all"></div>
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Main Editor Area -->
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden p-3 gap-3">
        <!-- Input Panel -->
        <div class="flex-1 flex flex-col glass-card rounded-xl border border-border/50 overflow-hidden bg-card/40 shadow-lg h-full">
          <div class="h-8 px-3 border-b border-border/40 flex items-center justify-between bg-muted/5 shrink-0">
            <div class="flex items-center gap-1.5">
              <AlignLeft :size="10" class="text-primary" />
              <span class="text-[8px] font-black uppercase tracking-widest text-muted-foreground/70">{{ processedLines.length }} Items</span>
            </div>
            <div class="flex items-center gap-1.5">
              <label title="Upload File" class="cursor-pointer p-1 text-muted-foreground hover:text-primary transition-colors">
                <Download :size="10" class="rotate-180" />
                <input type="file" class="hidden" @change="handleFileUpload" />
              </label>
              <button @click="inputText = ''" title="Clear All" class="p-1 text-muted-foreground hover:text-rose-500">
                <Trash2 :size="10" />
              </button>
            </div>
          </div>
          <div class="flex-1 relative">
            <textarea 
              v-model="inputText"
              placeholder="Paste data..."
              class="w-full h-full bg-transparent p-4 outline-none resize-none font-mono text-[10px] leading-relaxed placeholder:opacity-30 scrollbar-hide"
            ></textarea>
            <div class="absolute inset-y-0 left-0 w-6 bg-primary/5 pointer-events-none border-r border-border/10"></div>
          </div>
          <div class="p-1.5 border-t border-border/40 flex gap-1 bg-muted/5 overflow-x-auto scrollbar-hide shrink-0">
            <button @click="doTrim = !doTrim" :class="doTrim ? 'bg-primary text-white shadow-sm' : 'bg-muted/50 text-muted-foreground'" class="px-2 py-0.5 rounded-md text-[7px] font-black uppercase transition-all shrink-0">Trim</button>
            <button @click="doRemoveEmpty = !doRemoveEmpty" :class="doRemoveEmpty ? 'bg-primary text-white shadow-sm' : 'bg-muted/50 text-muted-foreground'" class="px-2 py-0.5 rounded-md text-[7px] font-black uppercase transition-all shrink-0">Static</button>
            <button @click="doDeduplicate = !doDeduplicate" :class="doDeduplicate ? 'bg-primary text-white shadow-sm' : 'bg-muted/50 text-muted-foreground'" class="px-2 py-0.5 rounded-md text-[7px] font-black uppercase transition-all shrink-0">Unique</button>
            <button @click="handleSort" :class="sortOrder !== 'none' ? 'bg-primary text-white shadow-sm' : 'bg-muted/50 text-muted-foreground'" class="px-2 py-0.5 rounded-md text-[7px] font-black uppercase transition-all shrink-0 flex items-center gap-1">
              Sort <SortAsc v-if="sortOrder==='asc'" :size="8" /> <SortDesc v-if="sortOrder==='desc'" :size="8" />
            </button>
          </div>
        </div>

        <!-- Output Panel -->
        <div class="flex-1 flex flex-col glass-card rounded-xl border border-border/50 overflow-hidden bg-[#0a0c10]/95 shadow-xl h-full">
          <div class="h-8 px-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01] shrink-0">
            <div class="flex items-center gap-1.5">
              <FileCode :size="10" class="text-emerald-500" />
              <span class="text-[8px] font-black uppercase tracking-widest text-emerald-500/60">Generated Code</span>
            </div>
            <button @click="copyToClipboard" class="text-[7px] font-black uppercase text-muted-foreground hover:text-emerald-400 flex items-center gap-1.5 bg-white/5 px-1.5 py-0.5 rounded">
              <ChevronRight :size="8" /> {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <div class="flex-1 p-4 overflow-auto scrollbar-thin">
            <pre class="font-mono text-[10px] leading-relaxed text-emerald-50/80 whitespace-pre-wrap">{{ resultText }}</pre>
            <div v-if="!resultText" class="h-full flex flex-col items-center justify-center text-white/5 gap-2 pointer-events-none">
              <Braces :size="32" stroke-width="0.5" />
              <span class="text-[8px] font-black uppercase tracking-[0.2em] opacity-30">Waiting...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ultra Slim Footer -->
    <div class="h-8 border-t border-border/50 bg-card/30 px-6 flex items-center justify-between shrink-0 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5 hover:text-muted-foreground transition-colors cursor-default"><Monitor :size="10" /> Client-Side Core</span>
        <span class="flex items-center gap-1.5 hover:text-muted-foreground transition-colors cursor-default"><Zap :size="10" /> Instant Compilation</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        System Operational
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  position: relative;
}
.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent 50%, rgba(255,255,255,0.05));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }

pre {
  text-shadow: 0 0 30px rgba(16, 185, 129, 0.05);
}

textarea::placeholder {
  font-family: inherit;
  font-weight: 500;
}
</style>
