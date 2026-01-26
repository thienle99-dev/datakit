<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { faker } from '@faker-js/faker';
import { 
  Plus, 
  Trash2, 
  Download, 
  Play, 
  ArrowLeft, 
  Database, 
  GripVertical,
  Table as TableIcon,
  FileType,
  Fingerprint,
  CreditCard,
  Banknote,
  Cpu as CpuIcon,
  Terminal,
  FileCode,
  Link,
  Car,
  Dog,
  Music,
  UserCircle,
  Hash as HashIcon,
  Clock,
  Compass,
  Key as KeyIcon,
  HardDrive,
  User,
  MapPin,
  Briefcase,
  Globe,
  ToggleLeft,
  Image as ImageIcon,
  Type,
  ShoppingCart,
  Palette,
  Layers as LayersIcon,
  Search as SearchIcon,
  ChevronRight,
  Sparkles
} from 'lucide-vue-next';
import DataTable from '../components/shared/DataTable.vue';
import Papa from 'papaparse';

interface Field {
  id: string;
  name: string;
  type: string;
  blankPct: number;
  options?: any;
}

const rowCount = ref(100);
const exportFormat = ref<'csv' | 'json' | 'sql'>('csv');
const activeSelector = ref<string | null>(null);
const typeQuery = ref('');

const fields = ref<Field[]>([
  { id: '1', name: 'id', type: 'UUID', blankPct: 0 },
  { id: '2', name: 'username', type: 'Username', blankPct: 0 },
  { id: '3', name: 'email', type: 'Email', blankPct: 0 },
  { id: '4', name: 'full_name', type: 'Full Name', blankPct: 0 },
  { id: '5', name: 'company', type: 'Company', blankPct: 20 },
  { id: '6', name: 'ip_address', type: 'IP Address', blankPct: 0 },
]);

const dataCategories = [
  {
    name: 'Identity',
    icon: User,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    types: [
      { name: 'Full Name', icon: User },
      { name: 'First Name', icon: User },
      { name: 'Last Name', icon: User },
      { name: 'Username', icon: UserCircle },
      { name: 'Password', icon: KeyIcon },
      { name: 'Gender', icon: User },
      { name: 'Avatar URL', icon: ImageIcon },
      { name: 'UUID', icon: Fingerprint },
    ]
  },
  {
    name: 'Internet & System',
    icon: Globe,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    types: [
      { name: 'Email', icon: Globe },
      { name: 'URL', icon: Link },
      { name: 'IP Address', icon: CpuIcon },
      { name: 'MAC Address', icon: HardDrive },
      { name: 'MIME Type', icon: FileCode },
      { name: 'File Extension', icon: FileType },
      { name: 'User Agent', icon: Terminal },
      { name: 'Boolean', icon: ToggleLeft },
    ]
  },
  {
    name: 'Finance',
    icon: Banknote,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    types: [
      { name: 'Credit Card', icon: CreditCard },
      { name: 'Currency Code', icon: Banknote },
      { name: 'IBAN', icon: Banknote },
      { name: 'Account Name', icon: User },
      { name: 'Price', icon: ShoppingCart },
    ]
  },
  {
    name: 'Geography',
    icon: MapPin,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    types: [
      { name: 'Country', icon: Globe },
      { name: 'City', icon: MapPin },
      { name: 'Street Address', icon: MapPin },
      { name: 'Latitude', icon: Compass },
      { name: 'Longitude', icon: Compass },
      { name: 'Phone', icon: Globe },
    ]
  },
  {
    name: 'Business',
    icon: Briefcase,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    types: [
        { name: 'Company', icon: Briefcase },
        { name: 'Department', icon: Briefcase },
        { name: 'Job Title', icon: Briefcase },
        { name: 'Product Name', icon: ShoppingCart },
        { name: 'Color', icon: Palette },
        { name: 'ID', icon: HashIcon },
        { name: 'Number', icon: HashIcon },
    ]
  },
  {
      name: 'Content',
      icon: Type,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      types: [
        { name: 'Date', icon: Clock },
        { name: 'Sentence', icon: Type },
        { name: 'Paragraph', icon: Type },
        { name: 'Description', icon: Type },
        { name: 'Animal', icon: Dog },
        { name: 'Music Genre', icon: Music },
        { name: 'Vehicle Model', icon: Car },
        { name: 'VIN (Vehicle ID)', icon: HashIcon },
        { name: 'Custom List', icon: LayersIcon },
      ]
  }
];

const filteredCategories = computed(() => {
  if (!typeQuery.value) return dataCategories;
  const q = typeQuery.value.toLowerCase();
  return dataCategories.map(c => ({
    ...c,
    types: c.types.filter(t => t.name.toLowerCase().includes(q))
  })).filter(c => c.types.length > 0);
});

const selectType = (fieldId: string, typeName: string) => {
  const field = fields.value.find(f => f.id === fieldId);
  if (field) field.type = typeName;
  activeSelector.value = null;
  typeQuery.value = '';
};

const generatedData = ref<any[]>([]);
const isGenerating = ref(false);

const addField = () => {
    try {
        const newField: Field = {
            id: Math.random().toString(36).substring(2, 11),
            name: `field_${fields.value.length + 1}`,
            type: 'Full Name',
            blankPct: 0
        };
        fields.value = [...fields.value, newField];
    } catch (err) {
        console.error('Error adding field:', err);
    }
};

const removeField = (id: string) => {
  fields.value = fields.value.filter(f => f.id !== id);
};

const generateData = () => {
    isGenerating.value = true;
    setTimeout(() => {
        const result = [];
        for (let i = 0; i < rowCount.value; i++) {
            const row: any = {};
            fields.value.forEach(field => {
                if (field.blankPct > 0 && Math.random() < (field.blankPct / 100)) {
                  row[field.name] = null;
                } else {
                  row[field.name] = generateValue(field, i + 1);
                }
            });
            result.push(row);
        }
        generatedData.value = result;
        isGenerating.value = false;
    }, 800);
};

const generateValue = (field: Field, index: number) => {
    switch (field.type) {
        case 'ID': return index;
        case 'Full Name': return faker.person.fullName();
        case 'First Name': return faker.person.firstName();
        case 'Last Name': return faker.person.lastName();
        case 'Username': return faker.internet.username();
        case 'Password': return faker.internet.password();
        case 'Gender': return faker.person.sex();
        case 'Avatar URL': return faker.image.avatar();
        case 'UUID': return faker.string.uuid();
        case 'Email': return faker.internet.email();
        case 'URL': return faker.internet.url();
        case 'IP Address': return faker.internet.ip();
        case 'MAC Address': return faker.internet.mac();
        case 'MIME Type': return faker.system.mimeType();
        case 'File Extension': return faker.system.fileExt();
        case 'User Agent': return faker.internet.userAgent();
        case 'Boolean': return faker.datatype.boolean();
        case 'Credit Card': return faker.finance.creditCardNumber();
        case 'Currency Code': return faker.finance.currencyCode();
        case 'IBAN': return faker.finance.iban();
        case 'Account Name': return faker.finance.accountName();
        case 'Price': return faker.commerce.price();
        case 'Country': return faker.location.country();
        case 'City': return faker.location.city();
        case 'Street Address': return faker.location.streetAddress();
        case 'Latitude': return faker.location.latitude();
        case 'Longitude': return faker.location.longitude();
        case 'Phone': return faker.phone.number();
        case 'Company': return faker.company.name();
        case 'Department': return faker.commerce.department();
        case 'Job Title': return faker.person.jobTitle();
        case 'Product Name': return faker.commerce.productName();
        case 'Color': return faker.color.human();
        case 'Number': return faker.number.int({ min: 1, max: 1000 });
        case 'Date': return faker.date.past().toISOString().split('T')[0];
        case 'Sentence': return faker.lorem.sentence();
        case 'Paragraph': return faker.lorem.paragraph();
        case 'Description': return faker.lorem.sentences(2);
        case 'Animal': return faker.animal.type();
        case 'Music Genre': return faker.music.genre();
        case 'Vehicle Model': return faker.vehicle.model();
        case 'VIN (Vehicle ID)': return faker.vehicle.vin();
        case 'Custom List': {
          const list = field.options?.list || 'Option 1, Option 2, Option 3';
          const items = list.split(',').map((s: string) => s.trim());
          return items[Math.floor(Math.random() * items.length)];
        }
        default: return '';
    }
};

const downloadData = () => {
    if (generatedData.value.length === 0) return;
    
    let content = '';
    let mimeType = '';
    let ext = '';

    if (exportFormat.value === 'csv') {
      content = Papa.unparse(generatedData.value);
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
    } else if (exportFormat.value === 'json') {
      content = JSON.stringify(generatedData.value, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      ext = 'json';
    } else if (exportFormat.value === 'sql') {
      const tableName = 'mock_data';
      content = generatedData.value.map(row => {
        const keys = Object.keys(row).join(', ');
        const values = Object.values(row).map(v => 
          v === null ? 'NULL' : (typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v)
        ).join(', ');
        return `INSERT INTO ${tableName} (${keys}) VALUES (${values});`;
      }).join('\n');
      mimeType = 'text/plain;charset=utf-8;';
      ext = 'sql';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mock_data_${Date.now()}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const headers = computed(() => fields.value.map(f => f.name));

onMounted(() => {
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') activeSelector.value = null;
    };
    window.addEventListener('keydown', handleKeydown);
    onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
});
</script>

<template>
  <div class="w-full h-[calc(100vh-6rem)] flex flex-col p-4 bg-background overflow-hidden relative">
    
    <!-- Design Decor -->
    <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

    <!-- Header -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0 relative z-[60]">
      <div class="flex items-center gap-4">
        <router-link to="/" class="flex items-center justify-center w-10 h-10 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-all group">
          <ArrowLeft :size="18" class="text-muted-foreground group-hover:text-primary transition-colors" />
        </router-link>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Database :size="20" class="text-primary-foreground" />
          </div>
          <h1 class="text-xl font-black tracking-tight text-foreground">
            Mock <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Generator</span>
          </h1>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center bg-card border border-border p-1 rounded-xl shadow-sm">
            <div class="flex items-center gap-2 px-3 border-r border-border">
                <span class="text-[8px] font-black uppercase text-muted-foreground">Rows</span>
                <input v-model.number="rowCount" type="number" class="w-12 bg-transparent border-none text-xs font-black focus:ring-0 outline-none p-0 text-center text-foreground" />
            </div>
            <div class="flex items-center gap-1 px-1">
                <button 
                  v-for="format in ['csv', 'json', 'sql']" 
                  :key="format"
                  @click="exportFormat = format as any"
                  class="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all"
                  :class="exportFormat === format ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'"
                >
                  {{ format }}
                </button>
            </div>
        </div>

        <button @click="generateData" :disabled="isGenerating" class="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background dark:bg-foreground dark:text-background rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 disabled:opacity-50">
          <Play v-if="!isGenerating" :size="14" />
          <div v-else class="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>{{ isGenerating ? 'Generating...' : 'Generate' }}</span>
        </button>

        <button v-if="generatedData.length > 0" @click="downloadData" class="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95">
          <Download :size="14" />
          <span>Export</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
      
      <!-- Sidebar -->
      <aside class="w-full lg:w-[380px] flex flex-col gap-4 shrink-0 transition-all duration-500">
        <div class="flex-1 flex flex-col bg-card/80 backdrop-blur-xl border border-border rounded-[2rem] p-4 shadow-xl">
          <div class="flex items-center justify-between mb-4 px-2">
            <h2 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Schema Designer</h2>
            <button @click="addField" class="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all active:scale-95">
              <Plus :size="16" stroke-width="3" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-1 space-y-3 pb-64 custom-scrollbar">
            <div 
              v-for="field in fields" 
              :key="field.id"
              class="group relative flex flex-col p-4 bg-background border border-border rounded-2xl hover:border-primary/30 transition-all duration-300"
              :class="{ 'z-[70] ring-2 ring-primary/20': activeSelector === field.id }"
            >
              <div class="flex items-center gap-3">
                <div class="opacity-10 group-hover:opacity-30 cursor-grab text-foreground"><GripVertical :size="16" /></div>
                
                <div class="flex-1 min-w-0">
                  <input 
                    v-model="field.name" 
                    type="text" 
                    class="w-full bg-transparent border-none p-0 text-xs font-black text-foreground uppercase focus:ring-0 outline-none"
                    placeholder="Field name"
                  />
                </div>

                <div class="relative">
                  <button 
                    @click="activeSelector = activeSelector === field.id ? null : field.id"
                    class="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted border border-border text-[9px] font-black uppercase tracking-wider text-primary"
                  >
                    <span class="max-w-[70px] truncate">{{ field.type }}</span>
                    <ChevronRight :size="10" class="opacity-30" />
                  </button>

                  <!-- Popover Picker -->
                  <div v-show="activeSelector === field.id" class="fixed lg:absolute top-1/2 left-1/2 lg:top-[calc(100%+8px)] lg:left-auto lg:right-0 -translate-x-1/2 -translate-y-1/2 lg:translate-x-0 lg:translate-y-0 w-72 bg-popover border border-border rounded-2xl shadow-2xl z-50 flex flex-col max-h-[400px]">
                    <div class="p-3 border-b border-border bg-muted/20">
                      <div class="relative flex items-center">
                        <SearchIcon :size="14" class="absolute left-3 text-muted-foreground" />
                        <input v-model="typeQuery" type="text" placeholder="Search types..." class="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-[10px] font-bold outline-none ring-offset-background focus:ring-2 focus:ring-ring" autofocus />
                      </div>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                      <div v-for="cat in filteredCategories" :key="cat.name" class="space-y-2">
                        <h4 class="px-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">{{ cat.name }}</h4>
                        <div class="grid grid-cols-1 gap-0.5">
                          <button v-for="t in cat.types" :key="t.name" @click="selectType(field.id, t.name)" class="flex items-center p-2 rounded-xl hover:bg-muted text-left group/item">
                            <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center mr-2 group-hover/item:bg-primary transition-colors">
                              <component :is="t.icon" :size="12" class="text-primary group-hover/item:text-primary-foreground" />
                            </div>
                            <span class="text-[10px] font-bold text-muted-foreground group-hover/item:text-foreground">{{ t.name }}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button @click="removeField(field.id)" class="p-1.5 text-muted-foreground/30 hover:text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 :size="14" />
                </button>
              </div>

              <div class="mt-3 pt-3 border-t border-border flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <span class="text-[8px] font-black uppercase text-muted-foreground">Blank %</span>
                  <input v-model.number="field.blankPct" type="number" min="0" max="100" class="w-8 bg-muted rounded px-1 py-0.5 text-[9px] font-black text-center text-foreground" />
                </div>
                <div class="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                   <div class="h-full bg-primary/40 transition-all" :style="{ width: `${field.blankPct}%` }"></div>
                </div>
              </div>

              <textarea v-if="field.type === 'Custom List'" @input="e => field.options = { ...field.options, list: (e.target as HTMLTextAreaElement).value }" class="mt-2 w-full bg-muted rounded-xl px-3 py-2 text-[10px] font-bold border-none h-16 resize-none text-foreground outline-none focus:ring-1 focus:ring-primary/30" placeholder="Value 1, Value 2...">{{ field.options?.list }}</textarea>
            </div>
          </div>
        </div>
      </aside>

      <!-- Preview Area -->
      <main class="flex-1 flex flex-col bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden relative">
          <Transition name="fade">
            <div v-if="isGenerating" class="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center">
                <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-[10px] font-black uppercase tracking-widest text-foreground">Processing Data...</p>
            </div>
          </Transition>

          <div v-if="generatedData.length === 0" class="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
              <Sparkles :size="48" class="text-primary mb-6" />
              <h2 class="text-2xl font-black text-foreground mb-2">Ready to generate?</h2>
              <p class="text-xs font-medium text-muted-foreground max-w-xs">Configure your fields and hit Generate to see the magic happen.</p>
          </div>

          <div v-else class="h-full flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/5">
                <div class="flex items-center gap-3">
                    <TableIcon :size="18" class="text-emerald-500" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-foreground">Live Preview (Top 50)</span>
                </div>
                <div class="text-[9px] font-bold text-muted-foreground uppercase">Records: {{ generatedData.length }}</div>
            </div>
            <div class="flex-1 overflow-hidden">
                <DataTable :headers="headers" :data="generatedData.slice(0, 50)" class="h-full" />
            </div>
          </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
