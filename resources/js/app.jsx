import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeSwitcherProvider } from './Context/ThemeSwitcherContext';
const appName = import.meta.env.VITE_APP_NAME || 'Muvausa Store';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Ambil warna `main` dari CSS variable
        const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--color-main').trim();

        // Set warna bilah status
        const themeMetaTag = document.querySelector('meta[name="theme-color"]');
        if (themeMetaTag) {
            themeMetaTag.setAttribute('content', mainColor);
        } else {
            const newMetaTag = document.createElement('meta');
            newMetaTag.name = 'theme-color';
            newMetaTag.content = mainColor;
            document.head.appendChild(newMetaTag);
        }

        root.render(
            <ThemeSwitcherProvider>
                <App {...props} />
            </ThemeSwitcherProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
