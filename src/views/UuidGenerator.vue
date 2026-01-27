<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ArrowLeft, 
  Fingerprint, 
  RefreshCw,
  Copy,
  Check,
  Trash2,
  FileText,
  FileSpreadsheet
} from 'lucide-vue-next';
import { v1 as uuidv1, v4 as uuidv4, v5 as uuidv5 } from 'uuid';

// UUID version types
type UuidVersion = 'v1' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8';

// UUID format types
type UuidFormat = 'standard' | 'no-hyphens' | 'uppercase' | 'lowercase';

// Namespace options for v5
const NAMESPACES = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  'X.500': '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
};

// State
const version = ref<UuidVersion>('v4');
const count = ref(1);
const format = ref<UuidFormat>('standard');
const uuids = ref<string[]>([]);
const history = ref<string[]>([]);
const copied = ref<Record<number, boolean>>({});
const copiedAll = ref(false);

// V5 specific
const v5Namespace = ref<keyof typeof NAMESPACES>('DNS');
const v5Name = ref('example.com');

// V1 specific (optional MAC override - simplified)
const v1MacOverride = ref('');

// Format UUID based on selected format option
const formatUuid = (uuid: string): string => {
  let formatted = uuid;
  
  if (format.value === 'no-hyphens') {
    formatted = uuid.replace(/-/g, '');
  } else if (format.value === 'uppercase') {
    formatted = uuid.toUpperCase();
  } else if (format.value === 'lowercase') {
    formatted = uuid.toLowerCase();
  } else {
    // standard - ensure lowercase with hyphens
    formatted = uuid.toLowerCase();
  }
  
  return formatted;
};

// Generate UUID v6 (reordered v1 - time-ordered)
const generateV6 = (): string => {
  const v1 = uuidv1();
  // v6 is v1 with reordered timestamp bits for better time-ordering
  // Simple approach: use v1 and change version to 6
  const parts = v1.split('-');
  if (parts.length !== 5) return v1;
  
  // Change version from 1 to 6 in the third segment
  const versionSegment = parts[2];
  if (!versionSegment) return v1;
  const v6Segment = '6' + versionSegment.substring(1);
  
  return `${parts[0]}-${parts[1]}-${v6Segment}-${parts[3]}-${parts[4]}`;
};

// Generate UUID v7 (time-ordered with random)
const generateV7 = (): string => {
  const now = Date.now();
  
  // 48-bit Unix timestamp in milliseconds (12 hex digits)
  const timestampHex = now.toString(16).padStart(12, '0');
  
  // Split timestamp: 8 hex (32 bits) + 4 hex (16 bits)
  const unixTsMsA = timestampHex.substring(0, 8);
  const unixTsMsB = timestampHex.substring(8, 12);
  
  // Version 7 (4 bits) + 12 bits random (sub-second precision)
  const subSec = (now % 0x1000).toString(16).padStart(3, '0');
  const versionAndSubSec = '7' + subSec;
  
  // Variant (2 bits = 10xx) + 14 bits random
  const variant = (0x8 | Math.floor(Math.random() * 0x4)).toString(16);
  const random1 = Math.floor(Math.random() * 0x4000).toString(16).padStart(3, '0'); // 14 bits
  const variantAndRandom1 = variant + random1;
  
  // 48 bits random
  const random2 = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  const random3 = Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
  
  // Format: 8-4-4-4-12
  return `${unixTsMsA}-${unixTsMsB}-${versionAndSubSec}-${variantAndRandom1}-${random2}${random3}`;
};

// Generate UUID v8 (custom/experimental)
const generateV8 = (): string => {
  // v8 is experimental, allows custom implementations
  // Using a format similar to v4 but with version 8
  // Generate random UUID with version 8
  const random1 = Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
  const random2 = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  const version = '8';
  const variant = (0x8 | Math.floor(Math.random() * 0x4)).toString(16);
  const random3 = Math.floor(Math.random() * 0x1000).toString(16).padStart(3, '0');
  const random4 = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  const random5 = Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
  
  // Format: 8-4-4-4-12
  return `${random1}-${random2.substring(0, 3)}${version}-${variant}${random3}-${random4}-${random5}`;
};

// Generate single UUID based on version
const generateSingleUuid = (): string => {
  let uuid = '';
  
  switch (version.value) {
    case 'v1':
      uuid = uuidv1();
      break;
    case 'v4':
      // Use native crypto.randomUUID if available, fallback to uuid library
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        uuid = crypto.randomUUID();
      } else {
        uuid = uuidv4();
      }
      break;
    case 'v5':
      if (!v5Name.value.trim()) {
        throw new Error('Name is required for UUID v5');
      }
      uuid = uuidv5(v5Name.value, NAMESPACES[v5Namespace.value]);
      break;
    case 'v6':
      uuid = generateV6();
      break;
    case 'v7':
      uuid = generateV7();
      break;
    case 'v8':
      uuid = generateV8();
      break;
    default:
      uuid = uuidv4();
  }
  
  return formatUuid(uuid);
};

// Generate UUIDs
const generate = () => {
  try {
    const arr: string[] = [];
    const maxCount = Math.min(count.value, 10000); // Limit to 10k
    
    for (let i = 0; i < maxCount; i++) {
      arr.push(generateSingleUuid());
    }
    
    uuids.value = arr;
    
    // Add to history
    history.value = [...arr, ...history.value].slice(0, 1000); // Keep last 1000
    
  } catch (error: any) {
    alert(error.message || 'Failed to generate UUIDs');
  }
};

// Copy individual UUID
const copyUuid = async (uuid: string, index: number) => {
  try {
    await navigator.clipboard.writeText(uuid);
    copied.value[index] = true;
    setTimeout(() => {
      copied.value[index] = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Copy all UUIDs
const copyAll = async () => {
  if (uuids.value.length === 0) return;
  
  try {
    const text = uuids.value.join('\n');
    await navigator.clipboard.writeText(text);
    copiedAll.value = true;
    setTimeout(() => {
      copiedAll.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Export to file
const exportToFile = (format: 'txt' | 'csv') => {
  if (uuids.value.length === 0) return;
  
  let content = '';
  let filename = '';
  let mimeType = '';
  
  if (format === 'csv') {
    content = 'UUID\n' + uuids.value.join('\n');
    filename = `uuids-${Date.now()}.csv`;
    mimeType = 'text/csv';
  } else {
    content = uuids.value.join('\n');
    filename = `uuids-${Date.now()}.txt`;
    mimeType = 'text/plain';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Clear results
const clearResults = () => {
  uuids.value = [];
};

// Clear history
const clearHistory = () => {
  history.value = [];
};

// Validate UUID format (for future use)
// const isValidUuid = (uuid: string): boolean => {
//   const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//   const noHyphensRegex = /^[0-9a-f]{32}$/i;
//   return uuidRegex.test(uuid) || noHyphensRegex.test(uuid);
// };

// Auto-generate on mount
generate();

// Watch for format changes and regenerate
const regenerateOnFormatChange = () => {
  if (uuids.value.length > 0) {
    const originalUuids = uuids.value.map(uuid => {
      // Remove formatting to get base UUID
      return uuid.replace(/-/g, '').toLowerCase();
    });
    
    // Reformat
    uuids.value = originalUuids.map(uuid => {
      // Reconstruct with hyphens if needed
      const withHyphens = `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}-${uuid.substring(16, 20)}-${uuid.substring(20)}`;
      return formatUuid(withHyphens);
    });
  }
};

// Computed
const showV5Options = computed(() => version.value === 'v5');
const showV1Options = computed(() => version.value === 'v1');
const hasResults = computed(() => uuids.value.length > 0);
const hasHistory = computed(() => history.value.length > 0);
</script>

<template>
  <div class="w-full h-screen-minus-header flex flex-col p-2 md:p-4 overflow-hidden">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <router-link to="/" class="p-2.5 bg-card border border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        
        <div class="h-10 w-px bg-border/30 hidden lg:block"></div>

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-violet-500/10 text-violet-500 rounded-xl flex items-center justify-center ring-1 ring-violet-500/20">
            <Fingerprint :size="20" stroke-width="2.5" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-foreground">
              UUID <span class="text-violet-500">Generator</span>
            </h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div class="max-w-4xl mx-auto w-full flex flex-col gap-6 mt-4 pb-6">
        
        <!-- Configuration Panel -->
        <div class="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Version Selection -->
            <div>
              <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">UUID Version</label>
              <select 
                v-model="version" 
                class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="v1">v1 - Time-based</option>
                <option value="v4">v4 - Random</option>
                <option value="v5">v5 - Name-based (SHA-1)</option>
                <option value="v6">v6 - Time-ordered</option>
                <option value="v7">v7 - Time-ordered + Random</option>
                <option value="v8">v8 - Custom/Experimental</option>
              </select>
            </div>

            <!-- Format Selection -->
            <div>
              <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Format</label>
              <select 
                v-model="format" 
                @change="regenerateOnFormatChange"
                class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="standard">Standard (with hyphens)</option>
                <option value="no-hyphens">No Hyphens</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
              </select>
            </div>
          </div>

          <!-- V5 Options -->
          <div v-if="showV5Options" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50">
            <div>
              <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Namespace</label>
              <select 
                v-model="v5Namespace" 
                class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="DNS">DNS</option>
                <option value="URL">URL</option>
                <option value="OID">OID</option>
                <option value="X.500">X.500</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Name</label>
              <input 
                v-model="v5Name" 
                type="text" 
                placeholder="example.com"
                class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <!-- V1 Options -->
          <div v-if="showV1Options" class="pt-2 border-t border-border/50">
            <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">MAC Address Override (Optional)</label>
            <input 
              v-model="v1MacOverride" 
              type="text" 
              placeholder="Leave empty for default"
              class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <!-- Quantity and Generate -->
          <div class="flex items-end gap-4 pt-2 border-t border-border/50">
            <div class="flex-1">
              <label class="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Quantity</label>
              <input 
                v-model.number="count" 
                type="number" 
                min="1" 
                max="10000" 
                class="w-full bg-muted border border-border rounded-xl px-4 py-2.5 font-mono text-lg outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button 
              @click="generate" 
              class="h-[46px] px-6 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw :size="16" /> Generate
            </button>
          </div>
        </div>

        <!-- Results Panel -->
        <div v-if="hasResults" class="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-foreground">Generated UUIDs ({{ uuids.length }})</h3>
            <div class="flex items-center gap-2">
              <button 
                @click="exportToFile('txt')"
                class="p-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95"
                title="Export as TXT"
              >
                <FileText :size="14" />
              </button>
              <button 
                @click="exportToFile('csv')"
                class="p-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95"
                title="Export as CSV"
              >
                <FileSpreadsheet :size="14" />
              </button>
              <button 
                @click="copyAll"
                class="p-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95"
                title="Copy All"
              >
                <Check v-if="copiedAll" :size="14" class="text-emerald-500" />
                <Copy v-else :size="14" />
              </button>
              <button 
                @click="clearResults"
                class="p-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95"
                title="Clear Results"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
          
          <div class="relative bg-muted/30 rounded-2xl border border-border p-4 min-h-[200px] max-h-[500px] overflow-y-auto custom-scrollbar">
            <div class="font-mono text-sm leading-loose text-foreground">
              <div 
                v-for="(uuid, index) in uuids" 
                :key="`${uuid}-${index}`" 
                class="group flex items-center justify-between hover:bg-primary/5 rounded px-2 -mx-2 transition-colors py-1"
              >
                <span class="flex-1">{{ uuid }}</span>
                <button 
                  @click="copyUuid(uuid, index)"
                  class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-background rounded transition-all active:scale-95"
                  title="Copy UUID"
                >
                  <Check v-if="copied[index]" :size="12" class="text-emerald-500" />
                  <Copy v-else :size="12" class="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- History Panel -->
        <div v-if="hasHistory" class="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-foreground">History ({{ history.length }})</h3>
            <button 
              @click="clearHistory"
              class="p-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-95"
              title="Clear History"
            >
              <Trash2 :size="14" />
            </button>
          </div>
          
          <div class="relative bg-muted/30 rounded-2xl border border-border p-4 min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar">
            <div class="font-mono text-xs leading-relaxed text-muted-foreground">
              <div 
                v-for="(uuid, index) in history.slice(0, 50)" 
                :key="`history-${uuid}-${index}`" 
                class="hover:bg-primary/5 rounded px-2 -mx-2 transition-colors py-0.5"
              >
                {{ uuid }}
              </div>
              <div v-if="history.length > 50" class="text-center text-muted-foreground pt-2 text-[10px]">
                ... and {{ history.length - 50 }} more
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
