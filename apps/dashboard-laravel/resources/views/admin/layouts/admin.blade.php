<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>@yield('title', 'Admin Panel') — RPMS Admin</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block; vertical-align: middle;
        }
        .nav-active { background: rgba(239,246,255,1); color: #1d4ed8; font-weight: 600; border-left: 3px solid #1d4ed8; }
        .nav-inactive { color: #6b7280; border-left: 3px solid transparent; }
    </style>
    @stack('styles')
</head>
<body class="bg-slate-50 text-slate-800">

<!-- SIDEBAR -->
<aside class="w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col py-6 z-50 shadow-sm">
    <div class="px-6 mb-8">
        <div class="flex items-center gap-3 mb-1">
            <div class="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-[20px]">admin_panel_settings</span>
            </div>
            <div>
                <h1 class="font-bold text-blue-800 text-base leading-tight">RPMS Admin</h1>
                <p class="text-xs text-slate-400">Control Panel</p>
            </div>
        </div>
    </div>

    <nav class="flex-1 px-3 space-y-1">
        <a href="{{ route('admin.dashboard') }}"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                  {{ request()->routeIs('admin.dashboard') ? 'nav-active' : 'nav-inactive hover:bg-slate-50 hover:text-slate-800' }}">
            <span class="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard Admin
        </a>
        <a href="{{ route('admin.create-doctor') }}"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                  {{ request()->routeIs('admin.create-doctor') ? 'nav-active' : 'nav-inactive hover:bg-slate-50 hover:text-slate-800' }}">
            <span class="material-symbols-outlined text-[20px]">person_add</span>
            Buat Akun Dokter
        </a>
        <a href="{{ route('admin.assign-patient') }}"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                  {{ request()->routeIs('admin.assign-patient') ? 'nav-active' : 'nav-inactive hover:bg-slate-50 hover:text-slate-800' }}">
            <span class="material-symbols-outlined text-[20px]">assignment_ind</span>
            Assign Pasien
        </a>
    </nav>

    <div class="px-3 mt-4 border-t border-slate-100 pt-4 space-y-1">
        <a href="{{ route('dashboard') }}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all">
            <span class="material-symbols-outlined text-[20px]">open_in_new</span>
            Lihat Dashboard Dokter
        </a>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all text-left">
                <span class="material-symbols-outlined text-[20px]">logout</span>
                Logout
            </button>
        </form>
    </div>
</aside>

<!-- TOP BAR -->
<header class="fixed top-0 right-0 w-[calc(100%-256px)] h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-sm">
    <h2 class="text-slate-700 font-semibold text-sm">@yield('header', 'Admin Panel')</h2>
    <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold">
            {{ strtoupper(substr(Auth::user()->name ?? 'A', 0, 1)) }}
        </div>
        <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-slate-800 leading-tight">{{ Auth::user()->name ?? 'Admin' }}</p>
            <p class="text-xs text-slate-400">Administrator</p>
        </div>
    </div>
</header>

<!-- CONTENT -->
<main class="ml-64 pt-14 min-h-screen p-8">
    @if(session('success'))
        <div class="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm font-medium">
            <span class="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
            {{ session('success') }}
        </div>
    @endif
    @if(session('error'))
        <div class="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-medium">
            <span class="material-symbols-outlined text-red-600 text-[20px]">error</span>
            {{ session('error') }}
        </div>
    @endif

    @yield('content')
</main>

@stack('scripts')
</body>
</html>
