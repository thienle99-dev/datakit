import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@views/ToolsView.vue'),
        },
        {
            path: '/universal-converter',
            name: 'universal-converter',
            component: () => import('@views/UniversalConverter.vue'),
        },
        {
            path: '/csv-viewer',
            name: 'csv-viewer',
            component: () => import('@views/CsvViewer.vue'),
        },
        {
            path: '/csv-cleaner',
            name: 'csv-cleaner',
            component: () => import('@views/CsvCleaner.vue'),
        },
        {
            path: '/column-selector',
            name: 'column-selector',
            component: () => import('@views/ColumnSelector.vue'),
        },
        {
            path: '/filter-sort',
            name: 'filter-sort',
            component: () => import('@views/FilterSort.vue'),
        },
        {
            path: '/merge-data',
            name: 'merge-data',
            component: () => import('@views/MergeTool.vue'),
        },
        {
            path: '/split-data',
            name: 'split-data',
            component: () => import('@views/SplitTool.vue'),
        },
        {
            path: '/data-stats',
            name: 'data-stats',
            component: () => import('@views/StatsTool.vue'),
        },
        {
            path: '/compare-data',
            name: 'compare-data',
            component: () => import('@views/CompareTool.vue'),
        },

        {
            path: '/image-studio', // Main Entry
            name: 'image-studio',
            component: () => import('@views/ImageEditor.vue'),
        },
        {
            path: '/image-compress',
            name: 'image-compress',
            component: () => import('@views/ImageEditor.vue'),
        },
        {
            path: '/image-converter',
            name: 'image-converter',
            component: () => import('@views/ImageEditor.vue'),
        },
        {
            path: '/image-editor',
            name: 'image-resize',
            component: () => import('@views/ImageEditor.vue'),
        },
        {
            path: '/image-rotate',
            name: 'image-rotate',
            component: () => import('@views/ImageEditor.vue'),
        },
        {
            path: '/image-crop',
            name: 'image-crop',
            component: () => import('@views/ImageEditor.vue'),
        },
        {
            path: '/image-upscaler',
            name: 'image-upscaler',
            component: () => import('@views/ImageUpscaler.vue'),
        },
        {
            path: '/transpose-data',
            name: 'transpose-data',
            component: () => import('@views/TransposeTool.vue'),
        },
        {
            path: '/validate-data',
            name: 'validate-data',
            component: () => import('@views/ValidateTool.vue'),
        },
        {
            path: '/reshape-data',
            name: 'reshape-data',
            component: () => import('@views/PivotTool.vue'),
        },
        {
            path: '/summarize-data',
            name: 'summarize-data',
            component: () => import('@views/AggregateTool.vue'),
        },
        {
            path: '/find-replace',
            name: 'find-replace',
            component: () => import('@views/FindReplace.vue'),
        },
        {
            path: '/mock-generator',
            name: 'mock-generator',
            component: () => import('@views/MockGenerator.vue'),
        },
        {
            path: '/skip-rows',
            name: 'skip-rows',
            component: () => import('@views/SkipRowsTool.vue'),
        },
        {
            path: '/random-sample',
            name: 'random-sample',
            component: () => import('@views/SampleTool.vue'),
        },
        {
            path: '/mask-data',
            name: 'mask-data',
            component: () => import('@views/MaskDataTool.vue'),
        },
        {
            path: '/data-to-chart',
            name: 'data-to-chart',
            component: () => import('@views/DataToChart.vue'),
        },
        {
            path: '/templates',
            name: 'templates',
            component: () => import('@views/TemplateTool.vue'),
        },
        {
            path: '/json-formatter',
            name: 'json-formatter',
            component: () => import('@views/JsonFormatter.vue'),
        },
        {
            path: '/json-diff',
            name: 'json-diff',
            component: () => import('@views/JsonDiff.vue'),
        },
        {
            path: '/json-path',
            name: 'json-path',
            component: () => import('@views/JsonPath.vue'),
        },
        {
            path: '/xml-converter',
            name: 'xml-converter',
            component: () => import('@views/XmlConverter.vue'),
        },
        {
            path: '/encoder',
            name: 'encoder',
            component: () => import('@views/EncoderDecoder.vue'),
        },
        {
            path: '/jwt-debugger',
            name: 'jwt-debugger',
            component: () => import('@views/JwtDebugger.vue'),
        },
        {
            path: '/epoch-converter',
            name: 'epoch-converter',
            component: () => import('@views/EpochConverter.vue'),
        },
        {
            path: '/uuid-generator',
            name: 'uuid-generator',
            component: () => import('@views/UuidGenerator.vue'),
        },
        {
            path: '/regex-tester',
            name: 'regex-tester',
            component: () => import('@views/RegexTester.vue'),
        },
        {
            path: '/text-tools',
            name: 'text-tools',
            component: () => import('@views/TextTools.vue'),
        },
        {
            path: '/color-palette-extractor',
            name: 'color-palette-extractor',
            component: () => import('@views/ColorPaletteExtractor.vue'),
        },
        {
            path: '/screenshot-beautifier',
            name: 'screenshot-beautifier',
            component: () => import('@views/ScreenshotBeautifier.vue'),
        },
        {
            path: '/array-converter',
            name: 'array-converter',
            component: () => import('@views/ArrayConverter.vue'),
        },
        {
            path: '/lorem-ipsum-generator',
            name: 'lorem-ipsum-generator',
            component: () => import('@views/LoremIpsumGenerator.vue'),
        },
        {
            path: '/url-cleaner',
            name: 'url-cleaner',
            component: () => import('@views/UrlCleaner.vue'),
        },
    ],
});

export default router;
