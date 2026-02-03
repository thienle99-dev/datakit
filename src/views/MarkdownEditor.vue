<script setup lang="ts">
import { ref, computed } from 'vue';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { 
  ArrowLeft, 
  FileText, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Link, 
  Image as ImageIcon, 
  Code, 
  Download,
  Eye,
  Columns,
  Maximize2
} from 'lucide-vue-next';

// --- Configuration ---
// Configure Marked to use Highlight.js

marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
}));

marked.use({
    breaks: true,
    gfm: true,
});

// --- State ---
const input = ref(`# Markdown Editor

Welcome to your offline-capable Markdown editor.

## Features
- **Live Preview**: See changes as you type
- **Syntax Highlighting**: Code blocks look great
- **Export**: Download as HTML or MD

\`\`\`javascript
console.log("Hello World");
\`\`\`

> "Simplicity is the ultimate sophistication."

1. List item one
2. List item two
`);

const viewMode = ref<'split' | 'preview'>('split');
const editorRef = ref<HTMLTextAreaElement | null>(null);

// --- Computed ---
const renderedHtml = computed(() => {
    const raw = marked.parse(input.value) as string;
    return DOMPurify.sanitize(raw);
});

// --- Actions ---
const insertText = (before: string, after = '') => {
    if (!editorRef.value) return;
    
    const textarea = editorRef.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    
    const replacement = before + selection + after;
    
    input.value = text.substring(0, start) + replacement + text.substring(end);
    
    // Restore selection / cursor
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
};

const curDate = new Date().toISOString().split('T')[0];

const downloadHtml = () => {
    const blob = new Blob([
        `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Markdown Export</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; line-height: 1.6; }
img { max-width: 100%; }
pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
blockquote { border-left: 4px solid #ccc; padding-left: 1rem; color: #666; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
</style>
</head>
<body>
${renderedHtml.value}
</body>
</html>`
    ], { type: 'text/html' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `document-${curDate}.html`;
    link.click();
};

const downloadMd = () => {
    const blob = new Blob([input.value], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `document-${curDate}.md`;
    link.click();
};

</script>

<template>
  <div class="h-screen-minus-header flex flex-col p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 mb-4 shrink-0">
        <div class="flex items-center gap-4">
             <router-link to="/" class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <ArrowLeft :size="20" />
            </router-link>
            <div class="flex items-center gap-3">
              <div class="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg">
                <FileText :size="24" />
              </div>
              <div>
                <h1 class="text-xl font-bold tracking-tight">Markdown Editor</h1>
                <p class="text-xs text-muted-foreground hidden md:block">Write, preview, and export documentation</p>
              </div>
            </div>
        </div>
        
        <div class="flex items-center gap-2">
            <!-- View Mode Toggle -->
            <div class="bg-muted/30 p-1 rounded-lg border border-border/50 flex items-center mr-2">
                 <button 
                    @click="viewMode = 'split'"
                    class="p-1.5 rounded-md transition-all"
                    :class="viewMode === 'split' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
                    title="Split View"
                 >
                    <Columns :size="16" />
                 </button>
                 <button 
                    @click="viewMode = 'preview'"
                    class="p-1.5 rounded-md transition-all"
                    :class="viewMode === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
                    title="Preview Only"
                 >
                    <Eye :size="16" />
                 </button>
            </div>

            <button @click="downloadMd" class="hidden md:flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-lg border border-border hover:bg-muted transition-colors">
                <Download :size="14" /> MD
            </button>
            <button @click="downloadHtml" class="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                <Download :size="14" /> HTML
            </button>
        </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-1 p-2 bg-card border border-border rounded-t-xl border-b-0 overflow-x-auto shrink-0 scrollbar-hide">
        <button @click="insertText('**', '**')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Bold"><Bold :size="16" /></button>
        <button @click="insertText('*', '*')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Italic"><Italic :size="16" /></button>
        <button @click="insertText('# ')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Heading"><Heading1 :size="16" /></button>
        <div class="w-px h-6 bg-border mx-1"></div>
        <button @click="insertText('- ')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="List"><List :size="16" /></button>
        <button @click="insertText('1. ')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Ordered List"><ListOrdered :size="16" /></button>
        <div class="w-px h-6 bg-border mx-1"></div>
        <button @click="insertText('> ')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Quote"><Quote :size="16" /></button>
        <button @click="insertText('`', '`')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Code"><Code :size="16" /></button>
        <div class="w-px h-6 bg-border mx-1"></div>
        <button @click="insertText('[', '](url)')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Link"><Link :size="16" /></button>
        <button @click="insertText('![alt](', ')')" class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Image"><ImageIcon :size="16" /></button>
    </div>

    <!-- Split Pane -->
    <div class="flex-1 flex min-h-0 border border-border rounded-b-xl overflow-hidden bg-card shadow-sm">
        
        <!-- Editor -->
        <textarea 
            v-if="viewMode === 'split'"
            ref="editorRef"
            v-model="input"
            class="flex-1 w-full h-full resize-none bg-background p-6 font-mono text-sm leading-relaxed outline-none border-r border-border/50 focus:bg-muted/5 transition-colors"
            placeholder="Write markdown here..."
        ></textarea>
        
        <!-- Preview -->
        <div 
            class="flex-1 h-full overflow-y-auto w-full"
            :class="{'p-8 md:p-12 max-w-4xl mx-auto bg-card': viewMode === 'preview', 'p-6 bg-muted/5': viewMode === 'split'}"
        >
             <div 
                class="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-500 prose-code:text-pink-500 prose-pre:bg-[#282c34] prose-pre:p-0 prose-pre:overflow-hidden prose-img:rounded-xl"
                v-html="renderedHtml"
             ></div>
        </div>

    </div>

  </div>
</template>

<style scoped>
.h-screen-minus-header {
    height: calc(100vh - var(--header-height, 64px));
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
