import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                utama: ['Poppins', ...defaultTheme.fontFamily.sans],
                hero: ['Lobster Two', ...defaultTheme.fontFamily.sans],
                rubik: ['Rubik', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'main': '#4285F4',
                'main-white': '#F6F6F6',
                'putih': '#f2f2f2',
                'cream': '#FEE9DE',
                'kuning': '#F2C94C',
              },
        },
    },

    plugins: [forms],
};


















