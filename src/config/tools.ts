
import {
    Table, ArrowRightLeft, Sparkles, Columns, ShieldCheck, Layers, Scissors,
    BarChart3, GitCompare, Sigma, Database, ListFilter, ListOrdered,
    Shuffle, EyeOff, FileDown, Search as SearchIcon, Braces,
    Search as SearchQuery, Code2, Binary, Clock, Fingerprint, Regex,
    Type, Image as ImageIcon, ZoomIn, Palette, FileJson, FileText, Link,
    Hash
} from 'lucide-vue-next';

export interface Tool {
    id: string;
    name: string;
    description: string;
    path: string;
    icon: any;
    color: string;
    bgColor: string;
}

export const tools: Tool[] = [
    {
        id: 'universal-converter',
        name: 'Universal Converter',
        description: 'Transform CSV/JSON/Excel/SQL with live preview',
        path: '/universal-converter',
        icon: ArrowRightLeft,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    },
    {
        id: 'merge-data',
        name: 'Merge Data',
        description: 'Combine multiple files into a master document',
        path: '/merge-data',
        icon: Layers,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10'
    },
    {
        id: 'split-data',
        name: 'Data Splitter',
        description: 'Split large datasets into smaller chunks',
        path: '/split-data',
        icon: Scissors,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10'
    },
    {
        id: 'data-stats',
        name: 'Column Statistics',
        description: 'In-depth automated data profiling & insights',
        path: '/data-stats',
        icon: BarChart3,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-600/10'
    },
    {
        id: 'compare-data',
        name: 'Visual Diff',
        description: 'Track changes between two datasets',
        path: '/compare-data',
        icon: GitCompare,
        color: 'text-blue-600',
        bgColor: 'bg-blue-600/10'
    },
    {
        id: 'csv-viewer',
        name: 'Data Viewer',
        description: 'Instant spreadsheet preview & sorting',
        path: '/csv-viewer',
        icon: Table,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'csv-cleaner',
        name: 'Data Cleaner',
        description: 'Normalize, deduplicate, and clean data',
        path: '/csv-cleaner',
        icon: Sparkles,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 'column-selector',
        name: 'Column Manager',
        description: 'Reorder and cherry-pick columns',
        path: '/column-selector',
        icon: Columns,
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10'
    },
    {
        id: 'filter-sort',
        name: 'Advanced Filter',
        description: 'Complex filtering and sorting presets',
        path: '/filter-sort',
        icon: ListFilter,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    },
    {
        id: 'transpose-data',
        name: 'Transpose',
        description: 'Flip rows to columns and vice versa',
        path: '/transpose-data',
        icon: ArrowRightLeft,
        color: 'text-violet-500',
        bgColor: 'bg-violet-500/10'
    },
    {
        id: 'validate-data',
        name: 'Data Validator',
        description: 'Audit file structure and consistency',
        path: '/validate-data',
        icon: ShieldCheck,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    },
    {
        id: 'reshape-data',
        name: 'Pivot / Unpivot',
        description: 'Reshape data from long to wide formats',
        path: '/reshape-data',
        icon: ArrowRightLeft,
        color: 'text-violet-500',
        bgColor: 'bg-violet-500/10'
    },
    {
        id: 'find-replace',
        name: 'Seek & Destroy',
        description: 'Global text search and replace',
        path: '/find-replace',
        icon: SearchIcon,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10'
    },
    {
        id: 'summarize-data',
        name: 'Data Summarizer',
        description: 'Group rows and calculate aggregates',
        path: '/summarize-data',
        icon: Sigma,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'mock-generator',
        name: 'Mock Generator',
        description: 'Generate millions of fake data rows',
        path: '/mock-generator',
        icon: Database,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-500/10'
    },
    {
        id: 'skip-rows',
        name: 'Skip Rows',
        description: 'Set header and skip top rows',
        path: '/skip-rows',
        icon: ListOrdered,
        color: 'text-sky-500',
        bgColor: 'bg-sky-500/10'
    },
    {
        id: 'random-sample',
        name: 'Random Sample',
        description: 'Extract random N rows or percentage',
        path: '/random-sample',
        icon: Shuffle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 'mask-data',
        name: 'Masking',
        description: 'Obfuscate sensitive PII data',
        path: '/mask-data',
        icon: EyeOff,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10'
    },
    {
        id: 'data-to-chart',
        name: 'Data to Chart',
        description: 'Visualize data instantly',
        path: '/data-to-chart',
        icon: BarChart3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-500/10'
    },
    {
        id: 'templates',
        name: 'Templates',
        description: 'Download CSV/Excel starter templates',
        path: '/templates',
        icon: FileDown,
        color: 'text-slate-500',
        bgColor: 'bg-slate-500/10'
    },
    {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Beautify, minify, and validate JSON',
        path: '/json-formatter',
        icon: FileJson,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10'
    },
    {
        id: 'json-diff',
        name: 'JSON Diff',
        description: 'Compare two JSON objects',
        path: '/json-diff',
        icon: GitCompare,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    },
    {
        id: 'json-path',
        name: 'JSON Path',
        description: 'Query JSON with JSONPath',
        path: '/json-path',
        icon: SearchQuery,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'xml-converter',
        name: 'XML Converter',
        description: 'Convert between XML and JSON',
        path: '/xml-converter',
        icon: Code2,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10'
    },
    {
        id: 'encoder',
        name: 'Encoder Suite',
        description: 'Base64, URL, HTML, Hashing',
        path: '/encoder',
        icon: Binary,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10'
    },
    {
        id: 'jwt-debugger',
        name: 'JWT Debugger',
        description: 'Decode and verify JWTs',
        path: '/jwt-debugger',
        icon: ShieldCheck,
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10'
    },
    {
        id: 'epoch-converter',
        name: 'Epoch Time',
        description: 'Timestamp conversion',
        path: '/epoch-converter',
        icon: Clock,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    },
    {
        id: 'uuid-generator',
        name: 'UUID Generator',
        description: 'Generate V1-V8 UUIDs',
        path: '/uuid-generator',
        icon: Fingerprint,
        color: 'text-violet-500',
        bgColor: 'bg-violet-500/10'
    },
    {
        id: 'regex-tester',
        name: 'Regex Tester',
        description: 'Test & debug Regular Expressions',
        path: '/regex-tester',
        icon: Regex,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10'
    },
    {
        id: 'text-tools',
        name: 'Text Utils',
        description: 'Case conversion & string tools',
        path: '/text-tools',
        icon: Type,
        color: 'text-slate-500',
        bgColor: 'bg-slate-500/10'
    },
    {
        id: 'image-studio',
        name: 'Image Studio',
        description: 'Compress, Convert, Resize & Edit',
        path: '/image-studio',
        icon: ImageIcon,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        id: 'lorem-ipsum-generator',
        name: 'Lorem Ipsum',
        description: 'Generate placeholder text',
        path: '/lorem-ipsum-generator',
        icon: FileText,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'url-cleaner',
        name: 'URL Cleaner',
        description: 'Remove tracking parameters',
        path: '/url-cleaner',
        icon: Link,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10'
    },
    {
        id: 'cron-parser',
        name: 'Cron Parser',
        description: 'Decode & Build Cron Expressions',
        path: '/cron-parser',
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 'hash-generator',
        name: 'Hash Generator',
        description: 'MD5, SHA1-512 generator',
        path: '/hash-generator',
        icon: Hash,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
    },
    {
        id: 'text-diff',
        name: 'Text Diff',
        description: 'Compare text differences',
        path: '/text-diff',
        icon: GitCompare,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    },
    {
        id: 'color-converter',
        name: 'Color Converter',
        description: 'Hex ↔ RGB ↔ HSL ↔ CMYK',
        path: '/color-converter',
        icon: Palette,
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10'
    },
    {
        id: 'image-compressor',
        name: 'Compressor / Resizer',
        description: 'Compress & Resize Images',
        path: '/image-compressor',
        icon: ImageIcon,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10'
    },
    {
        id: 'image-upscaler',
        name: 'Image Upscaler',
        description: 'AI-powered image enlargement',
        path: '/image-upscaler',
        icon: ZoomIn,
        color: 'text-purple-600',
        bgColor: 'bg-purple-500/10'
    },
    {
        id: 'color-palette-extractor',
        name: 'Palette Extractor',
        description: 'Extract colors from images',
        path: '/color-palette-extractor',
        icon: Palette,
        color: 'text-pink-600',
        bgColor: 'bg-pink-500/10'
    },
    {
        id: 'screenshot-beautifier',
        name: 'Screenshot Beautifier',
        description: 'Create pro mockups from screenshots',
        path: '/screenshot-beautifier',
        icon: Sparkles,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 'array-converter',
        name: 'Snap Array',
        description: 'Convert lists to code arrays',
        path: '/array-converter',
        icon: Braces,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    }
];

// Helper to get tools by category if needed
export const getToolsByCategory = (_categoryTitle: string) => {
    // Logic can be implemented here or kept in ToolsView
    return [];
};
