<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { 
  Clipboard, 
  ArrowLeft,
  Check, 
  Trash2, 
  Settings2, 
  Braces,
  AlignLeft,
  Variable,
  FileCode,
  Search,
  Download,
  ChevronRight,
  Zap,
  LayoutGrid,
  SortAsc,
  SortDesc,
  Copy,
  Scissors,
  Filter
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
  <div class="w-full h-[calc(100vh-var(--header-h))] flex flex-col p-2 md:p-4 gap-4">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <Braces :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h1 class="text-lg md:text-xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Snap <span class="text-emerald-500">Array</span>
            </h1>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Universal Array Converter</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center bg-card p-1 rounded-lg border border-border/50 shadow-sm">
          <button 
            @click="livePreview = !livePreview"
            :class="livePreview ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20' : 'text-muted-foreground hover:text-foreground'"
            class="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all"
          >
             <div class="w-1.5 h-1.5 rounded-full" :class="livePreview ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'"></div>
            {{ livePreview ? 'Live Sync' : 'Manual' }}
          </button>
        </div>

        <div class="h-6 w-px bg-border/40 hidden sm:block"></div>
        
        <button 
          @click="generateArray"
          v-if="!livePreview"
          class="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Zap :size="16" /> Compile
        </button>

        <button 
          @click="copyToClipboard"
          :class="copied ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20' : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-primary/20'"
          class="px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wide shadow-lg active:scale-95 transition-all flex items-center gap-2 min-w-[130px] justify-center"
        >
          <Clipboard v-if="!copied" :size="16" />
          <Check v-else :size="16" />
          {{ copied ? 'Copied!' : 'Export Code' }}
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex flex-1 overflow-hidden gap-4 lg:gap-6 relative">
      <!-- Settings Sidebar -->
      <div class="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto scrollbar-hide pb-4">
         
         <!-- Language Card -->
         <div class="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-3">
             <h3 class="text-xs font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                <LayoutGrid :size="12" /> Target
             </h3>
             <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="lang in languages" 
                :key="lang.id"
                @click="language = lang.id"
                :class="[
                  language === lang.id 
                    ? `bg-primary/5 border-primary/50 ring-1 ring-primary/20 ${lang.color}` 
                    : 'bg-muted/30 hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground'
                ]"
                class="relative h-16 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all duration-200 active:scale-95 group"
              >
                  <span class="text-sm font-black opacity-80 group-hover:opacity-100 transition-opacity">{{ lang.icon }}</span>
                 <span class="text-[9px] font-bold uppercase tracking-tight opacity-70">{{ lang.name }}</span>
              </button>
             </div>
         </div>

         <!-- Config Card -->
         <div class="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
              <Settings2 :size="12" /> Config
            </h3>
            
            <div class="space-y-3">
              <!-- Variable Name -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">Variable Name</label>
                <div class="relative group">
                  <Variable :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    v-model="variableName" 
                    placeholder="e.g., items" 
                    class="w-full bg-muted/30 border border-border/50 rounded-lg pl-9 pr-3 py-2 text-xs font-medium focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>

               <!-- Quote Style -->
               <div class="space-y-1.5">
                 <label class="text-[10px] font-bold uppercase text-muted-foreground">Quote Style</label>
                 <div class="grid grid-cols-3 gap-1 p-1 bg-muted/30 rounded-lg border border-border/50">
                    <button 
                      v-for="q in ['none', 'single', 'double']" 
                      :key="q"
                      @click="quoteType = q"
                      :class="quoteType === q ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-muted-foreground hover:bg-background/50'"
                      class="py-1.5 rounded-md text-[10px] font-bold uppercase transition-all"
                    >
                      {{ q }}
                    </button>
                 </div>
               </div>

               <!-- Toggles -->
               <div class="grid grid-cols-2 gap-2">
                  <button 
                    @click="isPretty = !isPretty"
                    class="flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left hover:bg-muted/30"
                    :class="isPretty ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-transparent border-border/50 text-muted-foreground'"
                  >
                     <div class="w-3 h-3 rounded-full border border-current flex items-center justify-center shrink-0">
                        <div v-if="isPretty" class="w-1.5 h-1.5 rounded-full bg-current"></div>
                     </div>
                     <span class="text-[10px] font-bold uppercase">Pretty</span>
                  </button>

                  <button 
                     @click="autoDetectNumbers = !autoDetectNumbers"
                     class="flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left hover:bg-muted/30"
                     :class="autoDetectNumbers ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-transparent border-border/50 text-muted-foreground'"
                  >
                     <div class="w-3 h-3 rounded-full border border-current flex items-center justify-center shrink-0">
                        <div v-if="autoDetectNumbers" class="w-1.5 h-1.5 rounded-full bg-current"></div>
                     </div>
                     <span class="text-[10px] font-bold uppercase">Numbers</span>
                  </button>
               </div>
            </div>
         </div>

         <!-- Transformers Card -->
         <div class="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
             <h3 class="text-xs font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
              <Zap :size="12" /> Transform
            </h3>
            
            <div class="grid grid-cols-2 gap-2">
                <button 
                  @click="doTrim = !doTrim" 
                  :class="doTrim ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40'"
                  class="px-2 py-2 rounded-lg border text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  <Scissors v-if="doTrim" :size="12" /> Trim
                </button>
                <button 
                  @click="doRemoveEmpty = !doRemoveEmpty" 
                  :class="doRemoveEmpty ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40'"
                  class="px-2 py-2 rounded-lg border text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  <Filter v-if="doRemoveEmpty" :size="12" /> Clean
                </button>
                <button 
                  @click="handleSort" 
                  :class="sortOrder !== 'none' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 'bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40'"
                  class="px-2 py-2 rounded-lg border text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                   <SortAsc v-if="sortOrder === 'asc'" :size="12" />
                   <SortDesc v-else-if="sortOrder === 'desc'" :size="12" />
                   <span v-else>Sort</span>
                </button>
                <button 
                  @click="doDeduplicate = !doDeduplicate" 
                  :class="doDeduplicate ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 'bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40'"
                  class="px-2 py-2 rounded-lg border text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy :size="12" /> Unique
                </button>
            </div>

            <!-- Regex Extract -->
            <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">Regex Extract</label>
                <div class="relative group">
                  <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    v-model="extractRegex" 
                    placeholder="Pattern (e.g. \d+)" 
                    class="w-full bg-muted/30 border border-border/50 rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40"
                  />
                </div>
            </div>

            <!-- Text Case -->
            <div class="space-y-1.5">
                 <label class="text-[10px] font-bold uppercase text-muted-foreground">Text Casing</label>
                 <div class="relative">
                   <select v-model="caseStyle" class="w-full appearance-none bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-primary/50 transition-all">
                      <option value="none">Original Case</option>
                      <option value="camel">camelCase</option>
                      <option value="snake">snake_case</option>
                      <option value="kebab">kebab-case</option>
                      <option value="constant">CONSTANT_CASE</option>
                   </select>
                   <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <ChevronRight :size="12" class="rotate-90" />
                   </div>
                 </div>
             </div>
         </div>
      </div>

      <!-- Editor Area -->
      <div class="flex-1 flex flex-col md:flex-row min-w-0 gap-4 md:gap-6 h-full">
        
        <!-- Input Panel -->
        <div class="flex-1 flex flex-col bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden relative group">
           <div class="h-12 px-4 flex items-center justify-between border-b border-border/40 bg-muted/20 shrink-0">
             <div class="flex items-center gap-2">
               <AlignLeft :size="16" class="text-primary" />
               <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Input Data</span>
               <span class="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground border border-border">{{ processedLines.length }} lines</span>
             </div>
             <div class="flex items-center gap-1">
               <label title="Upload File" class="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  <Download :size="16" class="rotate-180" />
                  <input type="file" class="hidden" @change="handleFileUpload" />
               </label>
               <button @click="inputText = ''" title="Clear All" class="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors">
                 <Trash2 :size="16" />
               </button>
             </div>
           </div>
           
           <div class="flex-1 relative">
             <textarea 
                v-model="inputText"
                placeholder="Paste your list here..."
                class="absolute inset-0 w-full h-full bg-transparent p-5 outline-none resize-none font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/30 scrollbar-thin"
             ></textarea>
           </div>
        </div>

        <!-- Output Panel -->
        <div class="flex-1 flex flex-col bg-muted/10 border border-border/50 rounded-2xl shadow-xl overflow-hidden relative group">
           <div class="h-12 px-4 flex items-center justify-between border-b border-border/40 bg-muted/20 shrink-0">
             <div class="flex items-center gap-2">
               <FileCode :size="16" class="text-emerald-500" />
               <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Compiled Code</span>
             </div>
             <div class="flex items-center gap-2">
               <span v-if="isProcessing" class="text-[10px] font-mono text-emerald-500/80 animate-pulse mr-2">Compiling...</span>
               <button @click="copyToClipboard" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background hover:bg-emerald-500/10 text-[10px] font-bold uppercase text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-border/50 hover:border-emerald-500/30">
                 <ChevronRight :size="12" /> {{ copied ? 'Copied' : 'Copy' }}
               </button>
             </div>
           </div>

           <div class="flex-1 relative overflow-hidden bg-card/30">
             <div class="absolute inset-0 overflow-auto scrollbar-thin p-5">
               <pre class="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap selection:bg-emerald-500/30">{{ resultText }}</pre>
             </div>
             
             <!-- Empty State -->
             <div v-if="!resultText" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <div class="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4 ring-1 ring-border/20">
                 <Braces :size="32" class="text-muted-foreground/30" />
               </div>
               <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Waiting for input...</p>
             </div>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 99px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.4); }
</style>
