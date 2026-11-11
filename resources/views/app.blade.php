<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="BlogVerse Pro — platform publikasi artikel modern.">
        <title inertia>{{ config('app.name', 'BlogVerse Pro') }}</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✒️</text></svg>">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        <x-inertia::head />
    </head>
    <body class="font-sans antialiased">
        {{-- Kerangka sementara sebelum React merender: tetap punya landmark main & h1. Dihapus di resources/js/app.jsx. --}}
        <main id="app-fallback" class="flex min-h-screen items-center justify-center bg-white">
            <h1 class="text-lg font-semibold text-slate-700">BlogVerse Pro</h1>
            <p class="sr-only">Memuat halaman…</p>
        </main>
        <x-inertia::app />
    </body>
</html>
