import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                'plutz-cream': '#fbfaf7',
                'plutz-cream-dark': '#f3f1eb',
                'plutz-brown': '#3D3328',
                'plutz-dark': '#181513',
                'plutz-teal': '#29768a',
                'plutz-teal-dark': '#1f5d6e',
                'plutz-accent': '#2c5a71',
                'plutz-accent-light': '#3e606f',
                'plutz-warm-gray': '#8a7e72',
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                serif: ['Playfair Display', 'Georgia', ...defaultTheme.fontFamily.serif],
            },
            boxShadow: {
                'warm': '0 1px 3px 0 rgba(61, 51, 40, 0.1), 0 1px 2px -1px rgba(61, 51, 40, 0.1)',
                'warm-md': '0 4px 6px -1px rgba(61, 51, 40, 0.1), 0 2px 4px -2px rgba(61, 51, 40, 0.1)',
                'warm-lg': '0 10px 15px -3px rgba(61, 51, 40, 0.1), 0 4px 6px -4px rgba(61, 51, 40, 0.1)',
            },
        },
    },

    plugins: [forms],
};
