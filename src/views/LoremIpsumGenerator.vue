<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Clipboard, 
  ArrowLeft,
  Check, 
  Settings2, 
  FileText,
  Type,
  AlignJustify,
  AlignLeft,
  Copy,
  RefreshCw
} from 'lucide-vue-next';

// Configuration State
const count = ref(3);
const type = ref('paragraphs'); // 'paragraphs', 'sentences', 'words'
const startWithLorem = ref(true);
const copied = ref(false);

const LOREM_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const SENTENCES = LOREM_TEXT.split('. ').map(s => s.trim() + '.');
const WORDS = LOREM_TEXT.replace(/[.,]/g, '').split(' ');

const generatedText = computed(() => {
  let result = '';
  
  // Custom generator logic (simple version)
  // In a real app, I might use a library or a larger dictionary
  // For now, I'll repeat/shuffle the base Lorem Text intelligently
  
  if (type.value === 'paragraphs') {
    const paras = [];
    for (let i = 0; i < count.value; i++) {
        // Create a slightly randomized paragraph
        const shuffledSentences = [...SENTENCES].sort(() => Math.random() - 0.5);
        // Ensure at least 3-7 sentences per paragraph
        const sentenceCount = Math.floor(Math.random() * 5) + 3; 
        let p = shuffledSentences.slice(0, sentenceCount).join(' ');
        
        // Ensure first paragraph starts with standard text if requested
        if (i === 0 && startWithLorem.value) {
           const standardStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
           if (!p.startsWith("Lorem")) {
              p = standardStart + p;
           }
        }
        paras.push(p);
    }
    result = paras.join('\n\n');
  } 
  else if (type.value === 'sentences') {
    const sents = [];
    for (let i = 0; i < count.value; i++) {
        const s = SENTENCES[i % SENTENCES.length];
        sents.push(s);
    }
    result = sents.join(' ');
    if (startWithLorem.value && !result.startsWith("Lorem")) {
        result = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + result;
    }
  }
  else if (type.value === 'words') {
    const w = [];
    for (let i = 0; i < count.value; i++) {
        w.push(WORDS[i % WORDS.length]);
    }
    result = w.join(' ');
    if (startWithLorem.value) {
        // Ensure it starts with Lorem ipsum...
        const standardWords = "Lorem ipsum dolor sit amet";
        if (!result.startsWith("Lorem")) {
            result = standardWords + " " + result;
            // Trim to requested word count roughly
            result = result.split(' ').slice(0, count.value).join(' ');
        }
    }
  }

  return result;
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedText.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {}
};

const refresh = () => {
   // Trigger re-computation by ticking count briefly or just relying on random
   // Since computed is reactive, we need to force update if logic is random inside computed
   // A better way is to have a seed ref
   // But for now, simple toggle
   const old = count.value;
   count.value = 0; 
   setTimeout(() => count.value = old, 10);
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
          <div class="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/5">
            <FileText :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h1 class="text-lg md:text-xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Lorem <span class="text-blue-500">Ipsum</span>
            </h1>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Placeholder Text Generator</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="copyToClipboard"
          :class="copied ? 'bg-blue-500 text-white border-blue-500 shadow-blue-500/20' : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-primary/20'"
          class="px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wide shadow-lg active:scale-95 transition-all flex items-center gap-2 min-w-[130px] justify-center"
        >
          <Clipboard v-if="!copied" :size="16" />
          <Check v-else :size="16" />
          {{ copied ? 'Copied!' : 'Copy Text' }}
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex flex-1 overflow-hidden gap-4 lg:gap-6 relative">
      <!-- Settings Sidebar -->
      <div class="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto scrollbar-hide pb-4">
         
         <div class="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
              <Settings2 :size="12" /> Configuration
            </h3>
            
            <div class="space-y-4">
                <!-- Type Selection -->
                <div class="space-y-1.5">
                   <label class="text-[10px] font-bold uppercase text-muted-foreground">Type</label>
                   <div class="flex flex-col gap-1">
                      <button 
                         v-for="t in ['paragraphs', 'sentences', 'words']" 
                         :key="t"
                         @click="type = t"
                         class="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left"
                         :class="type === t ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400' : 'bg-transparent border-transparent hover:bg-muted/30 text-muted-foreground'"
                      >
                         <AlignJustify v-if="t === 'paragraphs'" :size="16" />
                         <AlignLeft v-else-if="t === 'sentences'" :size="16" />
                         <Type v-else :size="16" />
                         <span class="text-xs font-bold capitalize">{{ t }}</span>
                      </button>
                   </div>
                </div>

                <!-- Count -->
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase text-muted-foreground">Count</label>
                    <div class="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-lg p-1">
                        <button @click="count = Math.max(1, count - 1)" class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background text-muted-foreground shadow-sm transition-all">-</button>
                        <input v-model="count" type="number" class="flex-1 bg-transparent text-center font-mono font-bold outline-none text-sm" />
                        <button @click="count++" class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background text-muted-foreground shadow-sm transition-all">+</button>
                    </div>
                </div>

                <!-- Start with Lorem -->
                <div class="pt-2 border-t border-border/40">
                    <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors group">
                       <input type="checkbox" v-model="startWithLorem" class="w-4 h-4 rounded border-border text-blue-500 focus:ring-blue-500/20" />
                       <span class="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Start with "Lorem ipsum..."</span>
                    </label>
                </div>
                
            </div>
            
            <button @click="refresh" class="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bold uppercase tracking-wide transition-colors">
               <RefreshCw :size="14" /> Regenerate
            </button>
         </div>
      </div>

      <!-- Editor Area -->
      <div class="flex-1 flex flex-col min-w-0 gap-4 h-full">
        <div class="flex-1 flex flex-col bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden relative group">
           <div class="h-12 px-4 flex items-center justify-between border-b border-border/40 bg-muted/20 shrink-0">
             <div class="flex items-center gap-2">
               <AlignLeft :size="16" class="text-blue-500" />
               <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated Text</span>
             </div>
             <div class="flex items-center gap-2">
               <button @click="copyToClipboard" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background hover:bg-blue-500/10 text-[10px] font-bold uppercase text-muted-foreground hover:text-blue-600 transition-colors border border-border/50 hover:border-blue-500/30">
                 <Copy :size="12" /> {{ copied ? 'Copied' : 'Copy' }}
               </button>
             </div>
           </div>
           
           <div class="flex-1 relative">
             <textarea 
                :value="generatedText"
                readonly
                class="absolute inset-0 w-full h-full bg-transparent p-6 outline-none resize-none font-serif text-base leading-relaxed text-foreground/80 scrollbar-thin"
             ></textarea>
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
