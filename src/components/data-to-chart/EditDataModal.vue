<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  headers: string[];
  data: any[];
}>();

const emit = defineEmits(['close', 'save']);

const editDraft = ref<any[]>([]);
const editPage = ref(1);
const EDIT_PAGE_SIZE = 20;

// Initialize draft when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    editDraft.value = JSON.parse(JSON.stringify(props.data));
    editPage.value = 1;
  }
});

const editPaginatedRows = computed(() => {
  const start = (editPage.value - 1) * EDIT_PAGE_SIZE;
  return editDraft.value.slice(start, start + EDIT_PAGE_SIZE);
});

const save = () => {
  emit('save', editDraft.value);
};
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
      @click.self="emit('close')"
    >
      <div 
        class="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" 
        @click.stop
      >
        <div class="p-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 class="text-sm font-black uppercase tracking-widest">Edit data</h3>
          <div class="flex items-center gap-2">
            <button @click="save" class="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
            <button @click="emit('close')" class="p-2 rounded-xl hover:bg-muted transition-colors">
              <X :size="18" />
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-auto p-4 min-h-0 custom-scrollbar">
          <table class="w-full text-left border-collapse table-fixed">
            <thead>
              <tr class="border-b border-border">
                <th v-for="h in headers" :key="h" class="text-[9px] font-black uppercase tracking-wider text-muted-foreground pb-2 pr-2 align-bottom" style="min-width: 80px">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(row, rowIdx) in editPaginatedRows" 
                :key="(editPage - 1) * EDIT_PAGE_SIZE + rowIdx" 
                class="border-b border-border/50 hover:bg-muted/30"
              >
                <td v-for="h in headers" :key="h" class="py-1 pr-2 align-top">
                  <input 
                    v-model="row[h]" 
                    type="text" 
                    class="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Simple Pagination Controls -->
          <div class="mt-4 flex justify-between items-center text-xs text-muted-foreground">
             <span>Showing {{ (editPage - 1) * EDIT_PAGE_SIZE + 1 }} - {{ Math.min(editPage * EDIT_PAGE_SIZE, editDraft.length) }} of {{ editDraft.length }}</span>
             <div class="flex gap-2">
               <button 
                 :disabled="editPage === 1"
                 @click="editPage--"
                 class="px-3 py-1 bg-muted rounded disabled:opacity-50 hover:bg-muted/80"
               >Prev</button>
               <button 
                 :disabled="editPage * EDIT_PAGE_SIZE >= editDraft.length"
                 @click="editPage++"
                 class="px-3 py-1 bg-muted rounded disabled:opacity-50 hover:bg-muted/80"
               >Next</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: theme('colors.border');
  border-radius: 4px;
}
</style>
