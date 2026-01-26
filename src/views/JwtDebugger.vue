<script setup lang="ts">
import { ref } from 'vue';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Copy, 
  AlertCircle 
} from 'lucide-vue-next';

const token = ref('');
const error = ref<string | null>(null);
const header = ref('');
const payload = ref('');
const signature = ref('');

const decode = (t: string) => {
    if (!t) {
        header.value = '';
        payload.value = '';
        signature.value = '';
        error.value = null;
        return;
    }
    
    try {
        const parts = t.split('.');
        if (parts.length !== 3) {
            throw new Error("Invalid JWT format (must have 3 parts)");
        }
        
        // Helper to decode base64url
        const b64Decode = (str: string) => {
             const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
             const pad = base64.length % 4;
             const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
             return decodeURIComponent(atob(padded).split('').map(c => {
                 return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
             }).join(''));
        };
        
        // Check length
        if (parts.length < 3) throw new Error("Incomplete JWT");

        header.value = JSON.stringify(JSON.parse(b64Decode(parts[0] || '')), null, 2);
        payload.value = JSON.stringify(JSON.parse(b64Decode(parts[1] || '')), null, 2);
        signature.value = parts[2] || ''; 
        error.value = null;
    } catch (e: any) {
        error.value = e.message;
        // Don't clear fields to allow debugging
    }
};

const handleInput = () => {
    decode(token.value);
};

const copyPayload = () => {
    if (!payload.value) return;
    navigator.clipboard.writeText(payload.value);
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
          <div class="w-10 h-10 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center ring-1 ring-pink-500/20">
            <ShieldCheck :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-black tracking-tight text-foreground">
              JWT <span class="text-pink-500">Debugger</span>
            </h2>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        <!-- Input Column -->
        <div class="flex-1 flex flex-col min-h-0 gap-4">
            <div class="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-lg group focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
                <div class="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                    <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Encoded Token</span>
                    <button @click="token = ''; handleInput()" class="text-[10px] uppercase font-bold text-muted-foreground hover:text-rose-500">Clear</button>
                </div>
                <textarea 
                    v-model="token"
                    @input="handleInput"
                    class="absolute inset-0 w-full h-full bg-transparent p-5 font-mono text-xs leading-relaxed outline-none resize-none text-pink-600 break-all"
                    placeholder="Paste JWT here (ey...)"
                    spellcheck="false"
                ></textarea>
            </div>
            
            <div v-if="error" class="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl backdrop-blur-md flex items-start gap-3">
                <AlertCircle :size="18" class="shrink-0 mt-0.5" />
                <div>
                    <p class="text-[11px] font-black uppercase tracking-widest mb-1">Invalid Token</p>
                    <p class="text-xs font-mono">{{ error }}</p>
                </div>
            </div>
        </div>

        <!-- Output Column -->
        <div class="flex-1 flex flex-col min-h-0 gap-4 overflow-y-auto">
             <!-- Header -->
             <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm shrink-0">
                 <div class="px-4 py-2 border-b border-border bg-muted/30">
                     <span class="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Header</span>
                 </div>
                 <div class="p-4 bg-muted/5">
                     <pre class="text-xs font-mono text-foreground whitespace-pre-wrap">{{ header }}</pre>
                 </div>
             </div>

             <!-- Payload -->
             <div class="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                 <div class="px-4 py-2 border-b border-border bg-muted/30 flex justify-between items-center">
                     <span class="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Payload</span>
                     <button @click="copyPayload" class="text-primary hover:text-primary/70"><Copy :size="12" /></button>
                 </div>
                 <div class="flex-1 p-4 bg-muted/5 relative">
                     <pre class="absolute inset-0 p-4 overflow-auto text-xs font-mono text-purple-600 font-medium whitespace-pre-wrap">{{ payload }}</pre>
                 </div>
             </div>

             <!-- Signature -->
             <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm shrink-0 opacity-70">
                 <div class="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-2">
                     <Lock :size="10" />
                     <span class="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Signature</span>
                 </div>
                 <div class="p-4 bg-blue-500/5 break-all font-mono text-[10px] text-blue-500">
                     {{ signature }}
                 </div>
             </div>
        </div>
    </div>
  </div>
</template>
