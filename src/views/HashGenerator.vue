<script setup lang="ts">
import { ref, computed } from 'vue';
import CryptoJS from 'crypto-js';
import { 
  ArrowLeft, 
  Hash, 
  FileText, 
  UploadCloud, 
  Copy, 
  Check, 
  Trash2,
  Lock,
  RefreshCw,
  FileCheck
} from 'lucide-vue-next';

// --- State ---
const activeTab = ref<'text' | 'file'>('text');
const inputText = ref('');
const fileInfo = ref<{ name: string, size: number, type: string } | null>(null);
const fileContent = ref<string | null>(null); // For small files to hash
const isProcessing = ref(false);
const copiedField = ref<string | null>(null);
const fileProgress = ref(0);

// For File Hashing (Stream/Chunking simulation for UI, though crypto-js in browser is sync usually for strings. 
// For real large file hashing in browser, we should use FileReader + update chunks.
// CryptoJS supports progressive hashing.

const hashes = computed(() => {
    // If text mode
    if (activeTab.value === 'text') {
        if (!inputText.value) return getDefaultHashes();
        return computeHashes(inputText.value);
    } else {
        // File mode results are stored in a separate ref to handle async
        return fileResults.value || getDefaultHashes();
    }
});

const fileResults = ref<any>(null);

const algorithms = [
    { id: 'md5', name: 'MD5', label: 'MD5' },
    { id: 'sha1', name: 'SHA-1', label: 'SHA-1' },
    { id: 'sha256', name: 'SHA-256', label: 'SHA-256' },
    { id: 'sha512', name: 'SHA-512', label: 'SHA-512' },
    { id: 'ripemd160', name: 'RIPEMD-160', label: 'RIPEMD-160' },
];

function getDefaultHashes() {
    const res: any = {};
    algorithms.forEach(algo => res[algo.id] = '');
    return res;
}

function computeHashes(text: string) {
    return {
        md5: CryptoJS.MD5(text).toString(),
        sha1: CryptoJS.SHA1(text).toString(),
        sha256: CryptoJS.SHA256(text).toString(),
        sha512: CryptoJS.SHA512(text).toString(),
        ripemd160: CryptoJS.RIPEMD160(text).toString()
    };
}

// --- Actions ---

const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    copiedField.value = fieldId;
    setTimeout(() => copiedField.value = null, 2000);
};

// File Handling
const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        processFile(input.files[0]);
    }
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
        processFile(event.dataTransfer.files[0]);
    }
};

const processFile = (file: File) => {
    fileInfo.value = {
        name: file.name,
        size: file.size,
        type: file.type
    };
    isProcessing.value = true;
    fileProgress.value = 0;
    
    // For large files, we should use FileReader with chunks to avoid freezing UI
    // And use progressive hashing algo.MD5.create() update()...
    
    const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let currentChunk = 0;
    
    // Initialize algos
    const algos = {
        md5: CryptoJS.algo.MD5.create(),
        sha1: CryptoJS.algo.SHA1.create(),
        sha256: CryptoJS.algo.SHA256.create(),
        sha512: CryptoJS.algo.SHA512.create(),
        ripemd160: CryptoJS.algo.RIPEMD160.create(),
    };
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const wordArray = CryptoJS.lib.WordArray.create((e.target?.result as ArrayBuffer));
        
        // Update all hashes
        Object.values(algos).forEach(algo => algo.update(wordArray));
        
        currentChunk++;
        fileProgress.value = Math.round((currentChunk / totalChunks) * 100);
        
        if (currentChunk < totalChunks) {
            loadNext();
        } else {
            // Finalize
            fileResults.value = {
                md5: algos.md5.finalize().toString(),
                sha1: algos.sha1.finalize().toString(),
                sha256: algos.sha256.finalize().toString(),
                sha512: algos.sha512.finalize().toString(),
                ripemd160: algos.ripemd160.finalize().toString(),
            };
            isProcessing.value = false;
        }
    };
    
    reader.onerror = () => {
        isProcessing.value = false;
        alert('Error reading file');
    };
    
    function loadNext() {
        const start = currentChunk * CHUNK_SIZE;
        const end = start + CHUNK_SIZE >= file.size ? file.size : start + CHUNK_SIZE;
        reader.readAsArrayBuffer(file.slice(start, end));
    }
    
    loadNext();
};

const clearFile = () => {
    fileInfo.value = null;
    fileResults.value = null;
    fileProgress.value = 0;
};

// Formatting helper for file size
const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

</script>

<template>
  <div class="h-screen-minus-header flex flex-col p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
             <router-link to="/" class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <ArrowLeft :size="20" />
            </router-link>
            <div class="flex items-center gap-3">
              <div class="bg-violet-500/10 text-violet-500 p-2 rounded-lg">
                <Hash :size="24" />
              </div>
              <div>
                <h1 class="text-xl font-bold tracking-tight">Hash Generator</h1>
                <p class="text-sm text-muted-foreground">Generate cryptographic hashes for text or files</p>
              </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-col gap-6">
        
        <!-- Tabs -->
        <div class="flex p-1 bg-muted/30 rounded-xl w-fit border border-border/50">
            <button 
                @click="activeTab = 'text'"
                class="px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                :class="activeTab === 'text' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            >
                <Type :size="16" v-if="false" /> Text
            </button>
            <button 
                @click="activeTab = 'file'"
                class="px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                :class="activeTab === 'file' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            >
                <FileText :size="16" v-if="false" /> File
            </button>
        </div>

        <!-- Input Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left: Input -->
            <div class="lg:col-span-1 flex flex-col gap-4">
                
                <!-- Text Input -->
                <div v-if="activeTab === 'text'" class="flex-1 flex flex-col gap-2 min-h-[200px]">
                     <div class="flex items-center justify-between px-1">
                        <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Input Text</label>
                        <button v-if="inputText" @click="inputText = ''" class="text-xs text-muted-foreground hover:text-rose-500 transition-colors">Clear</button>
                     </div>
                     <textarea 
                        v-model="inputText"
                        class="flex-1 w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-muted-foreground/30"
                        placeholder="Type text to hash..."
                     ></textarea>
                </div>

                <!-- File Input -->
                <div v-else class="flex-1 flex flex-col gap-2 min-h-[200px]">
                    <div class="flex items-center justify-between px-1">
                        <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Input File</label>
                        <button v-if="fileInfo" @click="clearFile" class="text-xs text-muted-foreground hover:text-rose-500 transition-colors">Remove</button>
                     </div>
                     
                     <div 
                        v-if="!fileInfo"
                        class="flex-1 border-2 border-dashed border-border/50 hover:border-violet-500/50 hover:bg-violet-500/5 rounded-xl transition-all flex flex-col items-center justify-center gap-4 cursor-pointer relative group"
                        @dragover.prevent
                        @drop.prevent="handleDrop"
                     >
                        <input type="file" @change="handleFileUpload" class="absolute inset-0 opacity-0 cursor-pointer" />
                        <div class="p-4 bg-background/50 rounded-full text-muted-foreground group-hover:text-violet-500 group-hover:scale-110 transition-all">
                            <UploadCloud :size="32" />
                        </div>
                        <div class="text-center space-y-1">
                            <p class="text-sm font-bold text-foreground">Click or Drop File</p>
                            <p class="text-xs text-muted-foreground">Any file type supported</p>
                        </div>
                     </div>

                     <div v-else class="flex-1 bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center">
                        <div class="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                            <FileCheck :size="32" />
                        </div>
                        <div>
                            <p class="font-bold text-foreground truncate max-w-[250px]">{{ fileInfo.name }}</p>
                            <p class="text-xs text-muted-foreground">{{ formatSize(fileInfo.size) }}</p>
                        </div>
                        <div v-if="isProcessing" class="w-full max-w-[200px] space-y-2">
                             <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                 <div class="h-full bg-violet-500 transition-all duration-300" :style="{ width: fileProgress + '%' }"></div>
                             </div>
                             <p class="text-[10px] text-muted-foreground font-bold uppercase">Processing {{ fileProgress }}%</p>
                        </div>
                         <div v-else class="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase">
                             <Check :size="14" /> Ready
                         </div>
                     </div>
                </div>

            </div>

            <!-- Right: Results -->
            <div class="lg:col-span-2 flex flex-col gap-3">
                <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Calculated Hashes</label>
                
                <div class="grid gap-3">
                    <div v-for="algo in algorithms" :key="algo.id" class="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 group transition-all hover:border-violet-500/30 hover:shadow-sm">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="px-2 py-1 rounded bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:bg-violet-500/10 group-hover:text-violet-600 transition-colors">
                                    {{ algo.label }}
                                </div>
                            </div>
                            <button 
                                @click="copyToClipboard(hashes[algo.id], algo.id)"
                                class="p-1.5 rounded-lg text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 transition-colors"
                            >
                                <Check v-if="copiedField === algo.id" :size="16" class="text-emerald-500" />
                                <Copy v-else :size="16" />
                            </button>
                        </div>
                        
                        <div class="font-mono text-xs md:text-sm text-foreground/80 break-all leading-relaxed selection:bg-violet-500/20 selection:text-violet-700">
                            {{ hashes[algo.id] || '...' }}
                        </div>
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
