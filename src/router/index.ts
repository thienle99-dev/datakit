import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/ToolsView.vue'),
        },
        {
            path: '/universal-converter',
            name: 'universal-converter',
            component: () => import('../views/UniversalConverter.vue'),
        },
        {
            path: '/csv-viewer',
            name: 'csv-viewer',
            component: () => import('../views/CsvViewer.vue'),
        },
        {
            path: '/csv-cleaner',
            name: 'csv-cleaner',
            component: () => import('../views/CsvCleaner.vue'),
        },
        {
            path: '/sql-generator',
            name: 'sql-generator',
            component: () => import('../views/SqlGenerator.vue'),
        },
        {
            path: '/column-selector',
            name: 'column-selector',
            component: () => import('../views/ColumnSelector.vue'),
        },
        {
            path: '/filter-sort',
            name: 'filter-sort',
            component: () => import('../views/FilterSort.vue'),
        },
        // Add other tool routes here
    ],
});

export default router;
