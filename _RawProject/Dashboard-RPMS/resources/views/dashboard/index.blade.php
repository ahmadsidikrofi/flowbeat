@extends('layouts.app')

@section('title', 'Clinical Dashboard')

@section('content')
<!-- ===================== PAGE HEADER ===================== -->
<div class="flex items-end justify-between mb-lg">
    <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Clinical Dashboard</h2>
        <p class="font-body-lg text-body-lg text-on-surface-variant">Daily summary for Ward 4C — Remote Monitoring Hub</p>
    </div>
    <div class="flex gap-sm">
        <button class="flex items-center gap-xs px-md py-sm bg-surface-container-highest text-on-surface-variant rounded-lg font-bold hover:bg-outline-variant transition-colors">
            <span class="material-symbols-outlined text-lg">filter_list</span>
            Filter
        </button>
        <button class="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity">
            <span class="material-symbols-outlined text-lg">download</span>
            Export Data
        </button>
    </div>
</div>

<!-- ===================== STATS CARDS (Bento Style) ===================== -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">

    {{-- Total Patients --}}
    <div class="bg-surface-container-lowest p-md rounded-xl clinical-shadow border border-outline-variant/30 flex flex-col justify-between">
        <div class="flex justify-between items-start">
            <span class="text-primary p-2 bg-primary/10 rounded-lg material-symbols-outlined">group</span>
            <span class="text-on-secondary-container bg-secondary-container/30 text-xs font-bold px-2 py-1 rounded-full">+4%</span>
        </div>
        <div>
            <p class="font-label-caps text-on-surface-variant mt-md">TOTAL PATIENTS</p>
            <p class="font-headline-lg text-primary">{{ number_format($stats['total_patients']) }}</p>
        </div>
    </div>

    {{-- Critical Patients --}}
    <div class="bg-surface-container-lowest p-md rounded-xl clinical-shadow border border-outline-variant/30 flex flex-col justify-between">
        <div class="flex justify-between items-start">
            <span class="text-error p-2 bg-error/10 rounded-lg material-symbols-outlined">emergency</span>
            <span class="text-error font-bold text-xs px-2 py-1 bg-error-container/50 rounded-full">High Priority</span>
        </div>
        <div>
            <p class="font-label-caps text-on-surface-variant mt-md">CRITICAL PATIENTS</p>
            <p class="font-headline-lg text-error">{{ number_format($stats['critical_patients']) }}</p>
        </div>
    </div>

    {{-- Warning Patients --}}
    <div class="bg-surface-container-lowest p-md rounded-xl clinical-shadow border border-outline-variant/30 flex flex-col justify-between">
        <div class="flex justify-between items-start">
            <span class="text-on-secondary-container p-2 bg-secondary-container/30 rounded-lg material-symbols-outlined">warning</span>
            <span class="text-on-surface-variant text-xs font-medium">Needs Attention</span>
        </div>
        <div>
            <p class="font-label-caps text-on-surface-variant mt-md">WARNING PATIENTS</p>
            <p class="font-headline-lg text-on-secondary-container">{{ number_format($stats['warning_patients']) }}</p>
        </div>
    </div>

    {{-- Stable Patients --}}
    <div class="bg-surface-container-lowest p-md rounded-xl clinical-shadow border border-outline-variant/30 flex flex-col justify-between">
        <div class="flex justify-between items-start">
            <span class="text-secondary p-2 bg-secondary/10 rounded-lg material-symbols-outlined">check_circle</span>
            <span class="text-on-surface-variant text-xs font-medium">Normal</span>
        </div>
        <div>
            <p class="font-label-caps text-on-surface-variant mt-md">STABLE PATIENTS</p>
            <p class="font-headline-lg text-secondary">{{ number_format($stats['stable_patients']) }}</p>
        </div>
    </div>

</div>

<!-- ===================== MAIN GRID: TABLE + ALERTS ===================== -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-lg">

    <!-- Patient List Table -->
    <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl clinical-shadow border border-outline-variant/30 overflow-hidden">
        <div class="p-md border-b border-outline-variant/30 flex items-center justify-between">
            <h3 class="font-title-md text-title-md text-on-surface">Nama Pasien &amp; Tanda Vital</h3>
            <div class="flex gap-base items-center">
                <span class="px-2 py-1 bg-surface-container rounded text-xs text-on-surface-variant font-medium">Updated 2m ago</span>
                <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" aria-label="Refresh">refresh</button>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-surface-container-low">
                    <tr>
                        <th class="px-md py-sm font-label-caps text-on-surface-variant">PATIENT NAME</th>
                        <th class="px-md py-sm font-label-caps text-on-surface-variant text-center">HEART RATE</th>
                        <th class="px-md py-sm font-label-caps text-on-surface-variant text-center">SYS / DIA</th>
                        <th class="px-md py-sm font-label-caps text-on-surface-variant text-center">GLUCOSE LEVEL</th>
                        <th class="px-md py-sm font-label-caps text-on-surface-variant">STATUS</th>
                        <th class="px-md py-sm font-label-caps text-on-surface-variant">ACTION</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/20">
                    @forelse ($patients as $patient)
                        @php
                            // Tentukan warna dan label status berdasarkan kondisi
                            $statusConfig = match($patient['status']) {
                                'critical' => ['bg' => 'bg-error/10',                   'text' => 'text-error',                   'dot' => 'bg-error',                   'label' => 'Critical'],
                                'warning'  => ['bg' => 'bg-on-secondary-container/10',  'text' => 'text-on-secondary-container',  'dot' => 'bg-on-secondary-container',  'label' => 'Warning'],
                                'no-data'  => ['bg' => 'bg-surface-container',          'text' => 'text-on-surface-variant',      'dot' => 'bg-outline',                 'label' => 'No Data'],
                                default    => ['bg' => 'bg-secondary/10',               'text' => 'text-secondary',               'dot' => 'bg-secondary',               'label' => 'Stable'],
                            };
                            $hrColor      = $patient['status'] === 'critical' ? 'text-error' : ($patient['status'] === 'warning' ? 'text-on-surface' : 'text-secondary');
                            $bpColor      = $patient['status'] === 'critical' ? 'text-error' : ($patient['status'] === 'warning' ? 'text-on-secondary-container' : 'text-on-surface');
                            $glucoseColor = isset($patient['glucose']) ? ($patient['glucose'] > 140 ? 'text-error' : ($patient['glucose'] > 100 ? 'text-on-secondary-container' : 'text-secondary')) : 'text-on-surface-variant';
                        @endphp
                        <tr class="hover:bg-surface-container/30 transition-colors">
                            <td class="px-md py-md">
                                <div class="flex items-center gap-sm">
                                    <div class="w-8 h-8 {{ $patient['status'] === 'critical' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary' }} rounded-full flex items-center justify-center font-bold text-xs">
                                        {{ $patient['initials'] }}
                                    </div>
                                    <div>
                                        <p class="font-title-md text-sm text-on-surface">{{ $patient['name'] }}</p>
                                        <p class="text-xs text-on-surface-variant">ID: #{{ $patient['id'] }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-md py-md text-center">
                                <span class="font-data-mono {{ $hrColor }}">{{ $patient['heart_rate'] }} <span class="text-xs">bpm</span></span>
                            </td>
                            <td class="px-md py-md text-center">
                                @if($patient['status'] !== 'no-data')
                                    <span class="font-data-mono {{ $bpColor }}">
                                        {{ $patient['sys'] }}<span class="text-xs">/</span>{{ $patient['dia'] }}
                                        <span class="text-xs">mmHg</span>
                                    </span>
                                @else
                                    <span class="text-on-surface-variant">—</span>
                                @endif
                            </td>
                            <td class="px-md py-md text-center">
                                @if($patient['status'] !== 'no-data')
                                    <span class="font-data-mono {{ $glucoseColor }}">
                                        {{ $patient['glucose'] !== null ? number_format($patient['glucose'], 1) : '—' }}
                                        @if($patient['glucose'] !== null)
                                            <span class="text-xs">mg/dL</span>
                                        @endif
                                    </span>
                                @else
                                    <span class="text-on-surface-variant">—</span>
                                @endif
                            </td>
                            <td class="px-md py-md">
                                <span class="inline-flex items-center gap-xs px-2 py-1 {{ $statusConfig['bg'] }} {{ $statusConfig['text'] }} text-xs font-bold rounded">
                                    <span class="w-1.5 h-1.5 {{ $statusConfig['dot'] }} rounded-full"></span>
                                    {{ $statusConfig['label'] }}
                                </span>
                            </td>
                            <td class="px-md py-md">
                                <a href="{{ route('patients.report', $patient['id']) }}"
                               class="text-primary hover:underline text-sm font-medium">View Chart</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-md py-lg text-center text-on-surface-variant font-body-sm text-body-sm">
                                No patient data available.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-md bg-surface-container-low flex justify-between items-center">
            <p class="text-xs text-on-surface-variant">
                Showing {{ count($patients) }} of {{ number_format($stats['total_patients']) }} patients
            </p>
            <div class="flex gap-xs">
                <button class="p-1 rounded hover:bg-surface-variant/50" aria-label="Previous page">
                    <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button class="p-1 rounded hover:bg-surface-variant/50" aria-label="Next page">
                    <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Right Column: Alerts + ML Card -->
    <div class="flex flex-col gap-lg">

        <!-- Recent Alerts Panel -->
        <div class="bg-surface-container-lowest rounded-xl clinical-shadow border border-outline-variant/30 flex flex-col flex-1">
            <div class="p-md border-b border-outline-variant/30 flex items-center justify-between">
                <h3 class="font-title-md text-title-md text-on-surface">Recent Alerts</h3>
                @if(count($alerts) > 0)
                    <span class="px-2 py-0.5 bg-error text-on-error text-[10px] font-bold rounded-full">NEW</span>
                @endif
            </div>

            <div class="p-md space-y-md overflow-y-auto max-h-[500px] hide-scrollbar flex-1">
                @forelse ($alerts as $alert)
                    @php
                        $alertStyles = match($alert['type']) {
                            'critical' => ['wrap' => 'bg-error-container/20 border-error',       'label' => 'text-error',           'title' => 'text-error'],
                            'warning'  => ['wrap' => 'bg-tertiary-container/10 border-primary-container', 'label' => 'text-primary-container', 'title' => 'text-primary-container'],
                            default    => ['wrap' => 'bg-surface-container border-outline opacity-80', 'label' => 'text-on-surface-variant', 'title' => 'text-on-surface-variant'],
                        };
                    @endphp
                    <div class="p-md {{ $alertStyles['wrap'] }} border-l-4 rounded-lg transition-all duration-300" id="{{ $alert['id'] ?? 'alert-'.$loop->index }}">
                        <div class="flex justify-between items-start mb-xs">
                            <span class="font-label-caps {{ $alertStyles['label'] }}">{{ strtoupper($alert['label']) }}</span>
                            <span class="text-[10px] text-on-surface-variant">{{ $alert['time'] }}</span>
                        </div>
                        <p class="font-title-md text-sm text-on-surface mb-xs">{{ $alert['patient'] }}</p>
                        <p class="font-body-sm text-xs text-on-surface-variant leading-normal">{{ $alert['message'] }}</p>
                        @if(!empty($alert['actions']))
                            <div class="mt-md flex gap-base">
                                @foreach($alert['actions'] as $action)
                                    @if(isset($action['url']))
                                        <a href="{{ $action['url'] }}" class="{{ $action['class'] }} px-3 py-1.5 rounded-lg text-xs font-bold inline-block text-center">
                                            {{ $action['label'] }}
                                        </a>
                                    @elseif(isset($action['action']) && $action['action'] === 'dismiss')
                                        <button type="button" onclick="document.getElementById('{{ $alert['id'] ?? 'alert-'.$loop->index }}').style.display = 'none'" class="{{ $action['class'] }} px-3 py-1.5 rounded-lg text-xs font-bold">
                                            {{ $action['label'] }}
                                        </button>
                                    @else
                                        <button type="button" class="{{ $action['class'] }} px-3 py-1.5 rounded-lg text-xs font-bold">
                                            {{ $action['label'] }}
                                        </button>
                                    @endif
                                @endforeach
                            </div>
                        @endif
                    </div>
                @empty
                    <p class="text-center text-on-surface-variant font-body-sm text-body-sm py-lg">No active alerts.</p>
                @endforelse
            </div>

            <div class="p-md">
                <button class="w-full py-2 border border-outline-variant text-on-surface-variant rounded-lg font-bold text-sm hover:bg-surface-container transition-all">
                    View All History
                </button>
            </div>
        </div>

        <!-- ML Prediction Insight Card -->
        <div class="relative overflow-hidden bg-primary text-on-primary rounded-xl clinical-shadow p-md">
            <div class="relative z-10">
                <h4 class="font-title-md text-on-primary-container mb-xs">ML Insight</h4>
                <p class="text-body-sm mb-md opacity-90">
                    Predictive analytics suggest a potential 12% increase in patient readmission risk
                    for chronic heart failure patients in your current cohort over the next 48 hours.
                </p>
                <a class="inline-flex items-center gap-base text-sm font-bold border-b border-on-primary-container pb-0.5" href="#">
                    Read Prediction Report
                    <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </a>
            </div>
            <div class="absolute -right-10 -bottom-10 opacity-10">
                <span class="material-symbols-outlined text-[160px]" style="font-variation-settings: 'FILL' 1;">monitoring</span>
            </div>
        </div>

    </div>{{-- end right column --}}
</div>{{-- end main grid --}}
@endsection

@push('scripts')
<script>
    // Pulsing border for critical alert
    const criticalAlerts = document.querySelectorAll('[id^="alert-"]');
    criticalAlerts.forEach(el => {
        if (el.classList.contains('bg-error-container/20') || el.style.borderColor === '#ba1a1a') {
            let active = true;
            setInterval(() => {
                el.style.borderColor = active ? '#ba1a1a' : '#ffdad6';
                active = !active;
            }, 1500);
        }
    });
</script>
@endpush
