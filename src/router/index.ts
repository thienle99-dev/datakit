import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/tools/csv-viewer',
            name: 'csv-viewer',
            component: () => import('../views/CsvViewer.vue'), // Lazy load
        },
        {
            path: '/tools/csv-converter',
            name: 'csv-converter',
            component: () => import('../views/CsvConverter.vue'),
        },
        {
            path: '/tools/csv-cleaner',
            name: 'csv-cleaner',
            component: () => import('../views/CsvCleaner.vue'),
        },
        {
            path: '/tools/json-converter',
            name: 'json-converter',
            component: () => import('../views/JsonConverter.vue'),
        },
        {
            path: '/tools/sql-generator',
            name: 'sql-generator',
            component: () => import('../views/SqlGenerator.vue'),
        },
        // Add other tool routes here
    ],
});

export default router;
