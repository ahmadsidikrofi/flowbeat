<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>@yield('title', 'RPMS Dashboard') — RPMS Portal</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-error-container": "#93000a",
                        "outline": "#727784",
                        "primary": "#003f87",
                        "outline-variant": "#c2c6d4",
                        "on-secondary-container": "#007354",
                        "on-secondary-fixed-variant": "#00513a",
                        "primary-container": "#0056b3",
                        "secondary": "#006c4f",
                        "surface-variant": "#e1e3e4",
                        "tertiary-fixed-dim": "#bfc8d0",
                        "on-primary": "#ffffff",
                        "inverse-on-surface": "#f0f1f2",
                        "secondary-container": "#67fcc6",
                        "tertiary-fixed": "#dbe4ed",
                        "secondary-fixed-dim": "#44dfab",
                        "on-surface-variant": "#424752",
                        "on-surface": "#191c1d",
                        "surface": "#f8f9fa",
                        "secondary-fixed": "#67fcc6",
                        "surface-bright": "#f8f9fa",
                        "error": "#ba1a1a",
                        "on-error": "#ffffff",
                        "inverse-primary": "#acc7ff",
                        "tertiary-container": "#515a62",
                        "surface-dim": "#d9dadb",
                        "on-tertiary-fixed": "#141d23",
                        "on-tertiary-fixed-variant": "#3f484f",
                        "surface-container-high": "#e7e8e9",
                        "background": "#f8f9fa",
                        "surface-container-low": "#f3f4f5",
                        "on-primary-fixed": "#001a40",
                        "surface-container-lowest": "#ffffff",
                        "error-container": "#ffdad6",
                        "on-tertiary": "#ffffff",
                        "surface-container": "#edeeef",
                        "on-secondary": "#ffffff",
                        "surface-container-highest": "#e1e3e4",
                        "primary-fixed-dim": "#acc7ff",
                        "on-secondary-fixed": "#002116",
                        "surface-tint": "#115cb9",
                        "on-primary-container": "#bbd0ff",
                        "inverse-surface": "#2e3132",
                        "on-background": "#191c1d",
                        "primary-fixed": "#d7e2ff",
                        "tertiary": "#3a434a",
                        "on-tertiary-container": "#c8d1da",
                        "on-primary-fixed-variant": "#004491"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "xl": "64px",
                        "margin-desktop": "32px",
                        "sm": "12px",
                        "md": "24px",
                        "gutter": "24px",
                        "margin-mobile": "16px",
                        "base": "8px",
                        "lg": "40px",
                        "xs": "4px"
                    },
                    "fontFamily": {
                        "body-sm": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-lg": ["Inter"],
                        "label-caps": ["Inter"],
                        "title-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "data-mono": ["Inter"]
                    },
                    "fontSize": {
                        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                        "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700"}],
                        "title-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                        "data-mono": ["18px", {"lineHeight": "24px", "fontWeight": "500"}]
                    }
                },
            },
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .clinical-shadow { box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05); }
        .nav-active {
            color: #003f87;
            border-left: 4px solid #003f87;
            font-weight: 700;
            background-color: rgba(0, 86, 179, 0.08);
        }
        .nav-inactive {
            border-left: 4px solid transparent;
            color: #424752;
        }
    </style>
    @stack('styles')
</head>
<body class="bg-surface text-on-surface">

<!-- ===================== SIDEBAR ===================== -->
<aside class="w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface-container-lowest flex flex-col py-md z-50">
    <div class="px-md mb-lg">
        <h1 class="font-headline-lg text-headline-lg font-bold text-primary">RPMS Portal</h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Remote Monitoring System</p>
    </div>

    <nav class="flex-1 space-y-1">
        <a href="{{ route('dashboard') }}"
           class="flex items-center gap-sm px-md py-sm transition-colors
                  {{ request()->routeIs('dashboard') ? 'nav-active' : 'nav-inactive hover:bg-surface-container' }}">
            <span class="material-symbols-outlined mr-sm">dashboard</span>
            <span class="font-title-md text-title-md">Dashboard</span>
        </a>
        <a href="{{ route('patients.index') }}"
           class="flex items-center gap-sm px-md py-sm transition-colors
                  {{ request()->routeIs('patients.*') ? 'nav-active' : 'nav-inactive hover:bg-surface-container' }}">
            <span class="material-symbols-outlined mr-sm">description</span>
            <span class="font-title-md text-title-md">Patient Reports</span>
        </a>
    </nav>

    <div class="px-md mb-md">
        <button id="btn-add-patient"
                class="w-full bg-primary text-on-primary py-sm rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">add</span>
            Add New Patient
        </button>
    </div>

    <div class="border-t border-outline-variant pt-md px-md space-y-1">
        <a class="flex items-center py-xs text-on-surface-variant hover:text-primary transition-colors" href="#">
            <span class="material-symbols-outlined mr-sm">help</span>
            <span class="font-body-lg text-body-lg">Help Center</span>
        </a>
        {{-- Tombol logout menggunakan POST sesuai standar Laravel --}}
        <form method="POST" action="{{ route('logout') }}" id="logout-form">
            @csrf
            <button type="submit"
                    class="flex items-center py-xs text-on-surface-variant hover:text-primary transition-colors w-full text-left">
                <span class="material-symbols-outlined mr-sm">logout</span>
                <span class="font-body-lg text-body-lg">Logout</span>
            </button>
        </form>
    </div>
</aside>

<!-- ===================== TOP BAR ===================== -->
<header class="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm flex items-center justify-between px-md z-40">
    <div class="flex items-center flex-1 max-w-xl">
        <div class="relative w-full group">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input class="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-body-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                   placeholder="Search patients, alerts, or reports..."
                   type="text"
                   id="global-search"/>
        </div>
    </div>

    <div class="flex items-center gap-md">
        <button class="relative p-2 rounded-full hover:bg-surface-variant/50 transition-all" aria-label="Notifications">
            <span class="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button class="p-2 rounded-full hover:bg-surface-variant/50 transition-all" aria-label="Settings">
            <span class="material-symbols-outlined text-on-surface-variant">settings</span>
        </button>
        <div class="flex items-center gap-sm pl-md border-l border-outline-variant">
            <div class="text-right">
                <p class="font-title-md text-sm text-on-surface leading-tight">
                    {{ Auth::user()->name ?? 'Dr. Julian Thorne' }}
                </p>
                <p class="font-body-sm text-xs text-on-surface-variant">
                    {{ Auth::user()->role ?? 'Chief Medical Officer' }}
                </p>
            </div>
            <img alt="Clinician Avatar"
                 class="w-10 h-10 rounded-full border-2 border-primary-container object-cover"
                 src="{{ Auth::user()->avatar ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSaUYf2heZkivjN7Thy9gLBin6WaK2tPBi7UMRMxI8FkxO8RrKve6fXI05Hu5h2N70MfSK7-Z-PiSM1nVkRQfGjs5n1MQQhkmJj93h7QS2Bj7WfVSazGscH6Nqdgl-DKLXBsrtnoLFNxwDvkBTkmGbMK-Frr5EL2gPHr1fcMSO-W_RqK_iDAEdT-vFlrS5fwJB84BX2Lc0dVLnDOl4_2nrpEhqTYRMV8ZiCUh8sWGLa_xyMtBtU1oSV8r1ec3TrT24E2V7-kIp6Lc' }}"/>
        </div>
    </div>
</header>

<!-- ===================== PAGE CONTENT ===================== -->
<main class="ml-[280px] pt-16 p-margin-desktop min-h-screen">
    @yield('content')
</main>

<!-- ===================== FLOATING ACTION BUTTON ===================== -->
<button id="fab-add"
        class="fixed bottom-margin-desktop right-margin-desktop w-14 h-14 bg-primary text-on-primary rounded-full clinical-shadow flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
        aria-label="Quick Add Patient">
    <span class="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">add</span>
    <div class="absolute right-full mr-4 bg-inverse-surface text-inverse-on-surface px-md py-base rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
        Quick Add Patient
    </div>
</button>

<script>
    // Smooth scaling interaction for cards
    document.querySelectorAll('.clinical-shadow').forEach(card => {
        card.addEventListener('mousedown', () => card.style.transform = 'scale(0.99)');
        card.addEventListener('mouseup',   () => card.style.transform = 'scale(1)');
        card.addEventListener('mouseleave',() => card.style.transform = 'scale(1)');
    });
</script>
@stack('scripts')
</body>
</html>
