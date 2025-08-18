<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Muvausa Store') }}</title>

        <!-- Fonts -->
        <link rel="icon" href="/storage/favicon.png" />
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@500;600;700;800&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        <style>
            body.dark {
                background-color: rgb(3 7 18 / 0.9);
            }
        </style>
    </head>
    <body class="font-sans antialiased bg-gray-100" style="font-family: 'Jost', sans-serif;" onload="setInitialTheme()">
        @inertia
        <script>
            function setInitialTheme() {
                const darkMode = localStorage.getItem('darkMode') === 'true';
                if (darkMode) {
                    document.body.classList.add('dark');
                    document.body.classList.remove('light');
                } else {
                    document.body.classList.add('light');
                    document.body.classList.remove('dark');
                }
            }
        </script>
        <script type="text/javascript"
      src="{{ config('midtrans.is_production') ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js' }}"
      data-client-key="{{ config('midtrans.client_key') }}"></script>
    </body>
</html>
