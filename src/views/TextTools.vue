<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ArrowLeft, 
  Type, 
  AlignLeft, 
  CaseUpper, 
  CaseLower, 
  FileText,
  Copy, 
  Check, 
  Trash2
} from 'lucide-vue-next';

const inputText = ref('');
const copied = ref(false);

const stats = computed(() => {
  const text = inputText.value;
  return {
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
  };
});

function toUpperCase() {
  inputText.value = inputText.value.toUpperCase();
}

function toLowerCase() {
  inputText.value = inputText.value.toLowerCase();
}

function toTitleCase() {
  inputText.value = inputText.value.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function toCamelCase() {
  inputText.value = inputText.value
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

function toSnakeCase() {
  inputText.value = inputText.value
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('_') || inputText.value;
}

function toKebabCase() {
  inputText.value = inputText.value
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('-') || inputText.value;
}

function reverseText() {
  inputText.value = inputText.value.split('').reverse().join('');
}

function reverseLines() {
  inputText.value = inputText.value.split('\n').reverse().join('\n');
}

function sortLines() {
  inputText.value = inputText.value.split('\n').sort().join('\n');
}

function uniqueLines() {
  const lines = inputText.value.split('\n');
  inputText.value = [...new Set(lines)].join('\n');
}

function generateLorem() {
  inputText.value = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
}

function clearText() {
  inputText.value = '';
}

function copyText() {
  navigator.clipboard.writeText(inputText.value).then(() => {
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  });
}
</script>

<template>
  <div class="w-full flex flex-col h-screen-minus-header p-2 md:p-4">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center ring-1 ring-indigo-500/20">
            <Type :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-black tracking-tight text-foreground">
              Text <span class="text-indigo-500">Tools</span>
            </h2>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-black text-indigo-500">{{ stats.chars }}</span>
          <span class="text-[9px] font-black uppercase tracking-widest text-indigo-500/40 mr-3">Chars</span>
        </div>
        <div class="w-px h-4 bg-indigo-500/20"></div>
        <div class="flex items-baseline gap-1 px-3">
          <span class="text-lg font-black text-indigo-500">{{ stats.words }}</span>
          <span class="text-[9px] font-black uppercase tracking-widest text-indigo-500/40 mr-3">Words</span>
        </div>
        <div class="w-px h-4 bg-indigo-500/20"></div>
        <div class="flex items-baseline gap-1 px-3">
          <span class="text-lg font-black text-indigo-500">{{ stats.lines }}</span>
          <span class="text-[9px] font-black uppercase tracking-widest text-indigo-500/40">Lines</span>
        </div>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
      
      <!-- Toolbar -->
      <div class="w-full lg:w-64 flex flex-col gap-3 shrink-0 overflow-y-auto pr-1">
        <div class="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Type :size="12" /> Case
          </h3>
          <div class="grid grid-cols-2 gap-2">
             <button @click="toUpperCase" class="flex items-center justify-center gap-2 px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-[10px] font-bold uppercase tracking-wide border border-transparent hover:border-primary/20 transition-all active:scale-95"><CaseUpper :size="14" /> Upper</button>
             <button @click="toLowerCase" class="flex items-center justify-center gap-2 px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-[10px] font-bold uppercase tracking-wide border border-transparent hover:border-primary/20 transition-all active:scale-95"><CaseLower :size="14" /> Lower</button>
             <button @click="toTitleCase" class="flex items-center justify-center gap-2 px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-[10px] font-bold uppercase tracking-wide border border-transparent hover:border-primary/20 transition-all active:scale-95">Title Case</button>
             <button @click="toCamelCase" class="flex items-center justify-center gap-2 px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-[10px] font-bold uppercase tracking-wide border border-transparent hover:border-primary/20 transition-all active:scale-95">camelCase</button>
             <button @click="toSnakeCase" class="flex items-center justify-center gap-2 px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-[10px] font-bold uppercase tracking-wide border border-transparent hover:border-primary/20 transition-all active:scale-95">snake_case</button>
             <button @click="toKebabCase" class="flex items-center justify-center gap-2 px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-[10px] font-bold uppercase tracking-wide border border-transparent hover:border-primary/20 transition-all active:scale-95">kebab-case</button>
          </div>
        </div>

        <div class="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <AlignLeft :size="12" /> Lines & Order
          </h3>
          <div class="grid grid-cols-1 gap-2">
             <button @click="sortLines" class="w-full text-left px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium border border-transparent hover:border-primary/20 transition-all active:translate-x-1">Sort Lines (A-Z)</button>
             <button @click="uniqueLines" class="w-full text-left px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium border border-transparent hover:border-primary/20 transition-all active:translate-x-1">Remove Duplicates</button>
             <button @click="reverseLines" class="w-full text-left px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium border border-transparent hover:border-primary/20 transition-all active:translate-x-1">Reverse Lines</button>
             <button @click="reverseText" class="w-full text-left px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium border border-transparent hover:border-primary/20 transition-all active:translate-x-1">Reverse Text</button>
          </div>
        </div>

        <div class="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <FileText :size="12" /> Generators
          </h3>
          <div class="grid grid-cols-1 gap-2">
             <button @click="generateLorem" class="w-full text-left px-3 py-2 bg-muted/40 hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium border border-transparent hover:border-primary/20 transition-all active:translate-x-1">Insert Lorem Ipsum</button>
          </div>
        </div>
        
        <div class="mt-auto">
             <button @click="clearText" class="w-full py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl border border-rose-500/20 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                <Trash2 :size="14" /> Clear All
             </button>
        </div>
      </div>

      <!-- Editor -->
      <div class="flex-1 bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden flex flex-col relative group">
        <div class="absolute top-0 right-0 p-3 flex items-center gap-2 z-10">
           <button 
              @click="copyText" 
              class="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur border border-border rounded-lg hover:bg-muted transition-all active:scale-95 shadow-sm"
            >
              <Check v-if="copied" :size="14" class="text-emerald-500" />
              <Copy v-else :size="14" />
              <span class="text-[10px] font-black uppercase tracking-widest">{{ copied ? 'Copied' : 'Copy' }}</span>
           </button>
        </div>

        <textarea 
          v-model="inputText"
          class="flex-1 w-full h-full bg-transparent p-5 font-mono text-sm leading-relaxed outline-none resize-none pt-12"
          placeholder="Type or paste text here..."
        ></textarea>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* No scoped styles needed as we use Tailwind classes directly */
</style>
