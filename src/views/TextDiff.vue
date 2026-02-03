<script setup lang="ts">
import { ref, computed } from 'vue';
import { diffLines, createTwoFilesPatch } from 'diff';
import { 
  ArrowLeft, 
  GitCompare, 
  Trash2, 
  Copy, 
  Check,
  Split,
  Maximize2
} from 'lucide-vue-next';

// --- State ---
const originalText = ref('');
const modifiedText = ref('');
const viewMode = ref<'split' | 'unified'>('split');
const copied = ref(false);

interface DiffLine {
    value: string;
    added?: boolean;
    removed?: boolean;
    count?: number;
    originalLineNumber?: number | null;
    modifiedLineNumber?: number | null;
}

// --- Computed ---

const unifiedDiff = computed(() => {
    // Basic line diff using jsdiff
    const diff = diffLines(originalText.value, modifiedText.value);
    
    // Process diff to add line numbers for unified view
    const result: DiffLine[] = [];
    let origLine = 1;
    let modLine = 1;

    diff.forEach((part: any) => {
        // diffLines returns part.value which might contain multiple newlines
        // We need to split them to render line by line
        const lines = part.value.split('\n');
        // The last element of split is often empty string if value ends with newline
        if (lines[lines.length - 1] === '') lines.pop();

        lines.forEach((line: string) => {
            const item: DiffLine = { 
                value: line,
                added: part.added, 
                removed: part.removed 
            };
            
            if (part.removed) {
                item.originalLineNumber = origLine++;
                item.modifiedLineNumber = null;
            } else if (part.added) {
                item.originalLineNumber = null;
                item.modifiedLineNumber = modLine++;
            } else {
                item.originalLineNumber = origLine++;
                item.modifiedLineNumber = modLine++;
            }
            result.push(item);
        });
    });

    return result;
});

const splitDiff = computed(() => {
    // For split view, we need two columns: Left (Original) and Right (Modified).
    // The previous implementation was complex.
    // Let's use a "pair" builder approach which is simpler and more robust.
    
    const diff = diffLines(originalText.value, modifiedText.value);
     
     // RE-DOING SPLIT LOGIC FOR BETTER COMPATIBILITY
     // The above logic is tricky to get perfect in one pass. 
     // Let's use a simpler "pair" builder.
     
    const rows: { left: any, right: any }[] = [];
    let lLine = 1;
    let rLine = 1;
    
    for (let i = 0; i < diff.length; i++) {
        const part = diff[i];
        if (!part) continue;
        const lines = part.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();
        
        if (part.removed) {
            // It's a deletion. Check if next is addition (Modification).
            const nextPart = diff[i + 1];
            if (nextPart && nextPart.added) {
                // MODIFICATION BLOCK
                const nextLines = nextPart.value.split('\n');
                if (nextLines[nextLines.length - 1] === '') nextLines.pop();
                
                const count = Math.max(lines.length, nextLines.length);
                
                for (let j = 0; j < count; j++) {
                    const lContent = lines[j];
                    const rContent = nextLines[j];
                    
                    rows.push({
                        left: lContent !== undefined ? { lineNum: lLine++, value: lContent, type: 'removed' } : { type: 'empty' },
                        right: rContent !== undefined ? { lineNum: rLine++, value: rContent, type: 'added' } : { type: 'empty' }
                    });
                }
                i++; // Skip next part since we handled it
            } else {
                // DELETE ONLY
                lines.forEach((line: string) => {
                    rows.push({
                        left: { lineNum: lLine++, value: line, type: 'removed' },
                        right: { type: 'empty' }
                    });
                });
            }
        } else if (part.added) {
            // ADD ONLY (because we handled Replace in the removed block)
             lines.forEach((line: string) => {
                rows.push({
                    left: { type: 'empty' },
                    right: { lineNum: rLine++, value: line, type: 'added' }
                });
            });
        } else {
            // UNCHANGED
             lines.forEach((line: string) => {
                rows.push({
                    left: { lineNum: lLine++, value: line, type: 'unchanged' },
                    right: { lineNum: rLine++, value: line, type: 'unchanged' }
                });
            });
        }
    }
    return rows;
});

// --- Actions ---
const clearAll = () => {
    originalText.value = '';
    modifiedText.value = '';
};

const copyResult = () => {
    // Copy a simple Unified Diff string? Or perhaps the Modified text?
    // Usually tool users want the output. In this case, maybe the patch text?
    // Let's verify what's most useful. 
    // For now, let's copy the unified diff text format provided by Diff.createPatch
    
    // We need filenames for createPatch, let's use dummy ones
    const patch = createTwoFilesPatch('Original', 'Modified', originalText.value, modifiedText.value);
    navigator.clipboard.writeText(patch);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
};

</script>

<template>
  <div class="h-screen-minus-header flex flex-col p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
    
    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
             <router-link to="/" class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <ArrowLeft :size="20" />
            </router-link>
            <div class="flex items-center gap-3">
              <div class="bg-orange-500/10 text-orange-500 p-2 rounded-lg">
                <GitCompare :size="24" />
              </div>
              <div>
                <h1 class="text-xl font-bold tracking-tight">Text Diff Viewer</h1>
                <p class="text-sm text-muted-foreground">Compare two pieces of text to find differences</p>
              </div>
            </div>
        </div>

        <div class="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/50">
             <button 
                @click="viewMode = 'split'"
                class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
                :class="viewMode === 'split' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
             >
                <Split :size="14" /> Split View
             </button>
             <button 
                @click="viewMode = 'unified'"
                class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
                :class="viewMode === 'unified' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
             >
                <Maximize2 :size="14" /> Unified
             </button>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col gap-4 min-h-0">
        
        <!-- Input Area (Only visible if empty or needed? No, always editable usually, or side-by-side inputs) -->
        <!-- Strategy: 
             If both inputs have content, show the DIFF VIEW mainly, but allow editing seamlessly?
             Or distinctive "Edit Mode" vs "Diff Mode"?
             Most online tools show inputs side-by-side at top, then Diff below.
             Let's use a Resizable Split Pane or just two Textareas side-by-side for Input, 
             and a Result area below.
        -->
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px] shrink-0">
            <!-- Original Input -->
            <div class="flex flex-col gap-2 h-full">
                <div class="flex items-center justify-between px-1">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Original Text</label>
                    <button @click="originalText = ''" v-if="originalText" class="text-xs text-muted-foreground hover:text-rose-500 transition-colors">Clear</button>
                </div>
                <textarea 
                    v-model="originalText"
                    class="flex-1 w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-muted-foreground/30"
                    placeholder="Paste original text here..."
                ></textarea>
            </div>

            <!-- Modified Input -->
            <div class="flex flex-col gap-2 h-full">
                <div class="flex items-center justify-between px-1">
                    <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Modified Text</label>
                    <button @click="modifiedText = ''" v-if="modifiedText" class="text-xs text-muted-foreground hover:text-rose-500 transition-colors">Clear</button>
                </div>
                <textarea 
                    v-model="modifiedText"
                    class="flex-1 w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-muted-foreground/30"
                    placeholder="Paste new text here..."
                ></textarea>
            </div>
        </div>

        <!-- Diff Output Area -->
        <div class="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
             <div class="px-4 py-2 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Diff Result</span>
                
                <div class="flex items-center gap-2">
                    <button 
                        @click="copyResult"
                        class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors"
                        title="Copy Diff Patch"
                    >
                        <Check v-if="copied" :size="16" class="text-emerald-500" />
                        <Copy v-else :size="16" />
                    </button>
                    <button 
                        @click="clearAll"
                        class="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-background rounded-md transition-colors"
                        title="Clear All"
                    >
                        <Trash2 :size="16" />
                    </button>
                </div>
             </div>

             <div class="flex-1 overflow-auto p-0 relative bg-background/50 font-mono text-xs md:text-sm">
                 
                 <!-- Unified View -->
                 <div v-if="viewMode === 'unified'" class="w-full">
                     <div v-for="(line, idx) in unifiedDiff" :key="idx" class="flex"
                        :class="{
                            'bg-emerald-500/10 hover:bg-emerald-500/20': line.added,
                            'bg-rose-500/10 hover:bg-rose-500/20': line.removed,
                            'hover:bg-muted/30': !line.added && !line.removed
                        }"
                     >
                         <!-- Line Numbers -->
                         <div class="w-12 shrink-0 text-right pr-3 py-0.5 select-none text-muted-foreground/40 border-r border-border/50 bg-muted/10">
                             {{ line.originalLineNumber || ' ' }}
                         </div>
                         <div class="w-12 shrink-0 text-right pr-3 py-0.5 select-none text-muted-foreground/40 border-r border-border/50 bg-muted/10">
                             {{ line.modifiedLineNumber || ' ' }}
                         </div>
                         
                         <!-- Content -->
                         <div class="px-4 py-0.5 whitespace-pre-wrap break-all flex-1 leading-relaxed">
                            <span v-if="line.added" class="select-none text-emerald-500 inline-block w-4 mr-1">+</span>
                            <span v-else-if="line.removed" class="select-none text-rose-500 inline-block w-4 mr-1">-</span>
                            <span v-else class="select-none inline-block w-4 mr-1"> </span>
                            <span :class="{ 'text-emerald-700 dark:text-emerald-300': line.added, 'text-rose-700 dark:text-rose-300': line.removed }">{{ line.value }}</span>
                         </div>
                     </div>
                      <div v-if="!originalText && !modifiedText" class="p-8 text-center text-muted-foreground opacity-40">
                        Enter text above to see the difference
                     </div>
                 </div>

                 <!-- Split View -->
                 <div v-if="viewMode === 'split'" class="w-full">
                     <table class="w-full border-collapse table-fixed">
                         <tbody class="divide-y divide-border/20">
                             <tr v-for="(row, idx) in splitDiff" :key="idx" class="group">
                                 <!-- Left Side (Original) -->
                                 <td class="w-1/2 align-top p-0 border-r border-border/50" 
                                    :class="row.left.type === 'removed' ? 'bg-rose-500/10' : (row.left.type === 'empty' ? 'bg-muted/5' : '')">
                                     <div v-if="row.left.type !== 'empty'" class="flex">
                                         <div class="w-10 shrink-0 text-right pr-2 py-0.5 select-none text-muted-foreground/40 border-r border-border/30 text-[10px] leading-6 bg-muted/10">
                                             {{ row.left.lineNum }}
                                         </div>
                                         <div class="px-3 py-0.5 whitespace-pre-wrap break-all text-[13px] leading-6" :class="{ 'text-rose-700 dark:text-rose-300': row.left.type === 'removed' }">
                                             {{ row.left.value }}
                                         </div>
                                     </div>
                                 </td>

                                 <!-- Right Side (Modified) -->
                                 <td class="w-1/2 align-top p-0" 
                                    :class="row.right.type === 'added' ? 'bg-emerald-500/10' : (row.right.type === 'empty' ? 'bg-muted/5' : '')">
                                     <div v-if="row.right.type !== 'empty'" class="flex">
                                         <div class="w-10 shrink-0 text-right pr-2 py-0.5 select-none text-muted-foreground/40 border-r border-border/30 text-[10px] leading-6 bg-muted/10">
                                              {{ row.right.lineNum }}
                                         </div>
                                         <div class="px-3 py-0.5 whitespace-pre-wrap break-all text-[13px] leading-6" :class="{ 'text-emerald-700 dark:text-emerald-300': row.right.type === 'added' }">
                                             {{ row.right.value }}
                                         </div>
                                     </div>
                                 </td>
                             </tr>
                         </tbody>
                     </table>
                      <div v-if="!originalText && !modifiedText" class="p-8 text-center text-muted-foreground opacity-40">
                        Enter text above to see the difference
                     </div>
                 </div>

             </div>
        </div>

    </div>
  </div>
</template>

<style scoped>
.h-screen-minus-header {
    height: calc(100vh - var(--header-height, 64px));
}
</style>
