/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                surface: 'var(--surface)',
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                text: 'var(--text)',
                'text-muted': 'var(--text-muted)',
                border: 'var(--border)',
            }
        },
    },
    plugins: [],
}
