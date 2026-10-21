@extends('layouts.app')

@section('title', 'Patient Reports')

@section('content')

{{-- ===================== PAGE HEADER ===================== --}}
<div class="flex items-end justify-between mb-lg">
    <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Patient Reports</h2>
        <p class="font-body-lg text-body-lg text-on-surface-variant">
            Ward 4C — {{ count($patients) }} patients monitored
        </p>
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

{{-- ===================== SEARCH + FILTER BAR ===================== --}}
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden mb-lg">
    <div class="p-md border-b border-outline-variant/30 flex items-center gap-md">
        <div class="relative flex-1 max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input type="text"
                   id="patient-search"
                   placeholder="Search by name or ID…"
                   class="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-sm text-body-sm transition-all"/>
        </div>
        <div class="flex gap-xs">
            <button id="filter-all"      class="filter-btn active-filter px-md py-xs rounded-lg text-label-caps font-bold transition-colors">All</button>
            <button id="filter-critical" class="filter-btn px-md py-xs rounded-lg text-label-caps font-bold transition-colors text-on-surface-variant hover:bg-surface-container">Critical</button>
            <button id="filter-warning"  class="filter-btn px-md py-xs rounded-lg text-label-caps font-bold transition-colors text-on-surface-variant hover:bg-surface-container">Warning</button>
            <button id="filter-stable"   class="filter-btn px-md py-xs rounded-lg text-label-caps font-bold transition-colors text-on-surface-variant hover:bg-surface-container">Stable</button>
        </div>
    </div>

    {{-- ===================== PATIENT TABLE ===================== --}}
    <div class="overflow-x-auto">
        <table class="w-full text-left" id="patients-table">
            <thead class="bg-surface-container-low">
                <tr>
                    <th class="px-md py-sm font-label-caps text-on-surface-variant">PATIENT NAME</th>
                    <th class="px-md py-sm font-label-caps text-on-surface-variant">AGE</th>
                    <th class="px-md py-sm font-label-caps text-on-surface-variant text-center">HEART RATE</th>
                    <th class="px-md py-sm font-label-caps text-on-surface-variant text-center">SPO2</th>
                    <th class="px-md py-sm font-label-caps text-on-surface-variant">STATUS</th>
                    <th class="px-md py-sm font-label-caps text-on-surface-variant">ACTION</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/20" id="patient-rows">
                @forelse ($patients as $patient)
                    @php
                        $statusConfig = match($patient['status']) {
                            'critical' => ['bg' => 'bg-error/10',                  'text' => 'text-error',                  'dot' => 'bg-error',                  'label' => 'Critical'],
                            'warning'  => ['bg' => 'bg-on-secondary-container/10', 'text' => 'text-on-secondary-container', 'dot' => 'bg-on-secondary-container', 'label' => 'Warning'],
                            default    => ['bg' => 'bg-secondary/10',              'text' => 'text-secondary',              'dot' => 'bg-secondary',              'label' => 'Stable'],
                        };
                        $avatarColor = $patient['status'] === 'critical'
                            ? 'bg-error/10 text-error'
                            : ($patient['status'] === 'warning' ? 'bg-on-secondary-container/10 text-on-secondary-container' : 'bg-primary/10 text-primary');
                        $hrColor = $patient['status'] === 'critical' ? 'text-error' : ($patient['status'] === 'warning' ? 'text-on-surface' : 'text-secondary');
                        $spo2Color = $patient['status'] === 'critical' ? 'text-on-error-container' : ($patient['status'] === 'warning' ? 'text-on-surface' : 'text-secondary');
                    @endphp
                    <tr class="hover:bg-surface-container/30 transition-colors patient-row"
                        data-status="{{ $patient['status'] }}"
                        data-name="{{ strtolower($patient['name']) }}">

                        {{-- Name + Avatar --}}
                        <td class="px-md py-md">
                            <div class="flex items-center gap-sm">
                                <div class="w-9 h-9 {{ $avatarColor }} rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                    {{ $patient['initials'] }}
                                </div>
                                <div>
                                    <p class="font-title-md text-sm text-on-surface">{{ $patient['name'] }}</p>
                                    <p class="text-xs text-on-surface-variant">ID: #{{ $patient['id'] }}</p>
                                </div>
                            </div>
                        </td>

                        {{-- Age --}}
                        <td class="px-md py-md">
                            <span class="font-body-sm text-body-sm text-on-surface">{{ $patient['age'] }} yrs</span>
                        </td>

                        {{-- Heart Rate --}}
                        <td class="px-md py-md text-center">
                            <span class="font-data-mono {{ $hrColor }}">
                                {{ $patient['heart_rate'] }} <span class="text-xs">bpm</span>
                            </span>
                        </td>

                        {{-- SpO2 --}}
                        <td class="px-md py-md text-center">
                            <span class="font-data-mono {{ $spo2Color }}">
                                {{ $patient['spo2'] }} <span class="text-xs">%</span>
                            </span>
                        </td>

                        {{-- Status Badge --}}
                        <td class="px-md py-md">
                            <span class="inline-flex items-center gap-xs px-2 py-1 {{ $statusConfig['bg'] }} {{ $statusConfig['text'] }} text-xs font-bold rounded">
                                <span class="w-1.5 h-1.5 {{ $statusConfig['dot'] }} rounded-full"></span>
                                {{ $statusConfig['label'] }}
                            </span>
                        </td>

                        {{-- Action --}}
                        <td class="px-md py-md">
                            <a href="{{ route('patients.report', $patient['id']) }}"
                               class="inline-flex items-center gap-xs px-sm py-xs bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-on-primary transition-all">
                                <span class="material-symbols-outlined text-[16px]">open_in_new</span>
                                View Report
                            </a>
                        </td>

                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-md py-xl text-center text-on-surface-variant font-body-sm text-body-sm">
                            No patients found.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- ===================== PAGINATION FOOTER ===================== --}}
    <div class="p-md bg-surface-container-low flex justify-between items-center">
        <p class="text-xs text-on-surface-variant" id="showing-count">
            Showing {{ count($patients) }} patients
        </p>
        <div class="flex gap-xs">
            <button class="p-1 rounded hover:bg-surface-variant/50" aria-label="Previous">
                <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button class="p-1 rounded hover:bg-surface-variant/50" aria-label="Next">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
        </div>
    </div>
</div>

@endsection

@push('styles')
<style>
    .active-filter {
        background-color: #003f87;
        color: #ffffff;
    }
    .active-filter:hover {
        background-color: #0056b3;
    }
</style>
@endpush

@push('scripts')
<script>
    // ── Live search ──────────────────────────────────────────────────────────
    const searchInput = document.getElementById('patient-search');
    searchInput.addEventListener('input', applyFilters);

    // ── Status filter buttons ────────────────────────────────────────────────
    const filterBtns = document.querySelectorAll('.filter-btn');
    let activeStatus = 'all';

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active-filter');
                b.classList.add('text-on-surface-variant', 'hover:bg-surface-container');
            });
            btn.classList.add('active-filter');
            btn.classList.remove('text-on-surface-variant', 'hover:bg-surface-container');
            activeStatus = btn.id.replace('filter-', '');
            applyFilters();
        });
    });

    function applyFilters() {
        const query  = searchInput.value.toLowerCase().trim();
        const rows   = document.querySelectorAll('.patient-row');
        let visible  = 0;

        rows.forEach(row => {
            const name   = row.dataset.name;
            const status = row.dataset.status;

            const matchSearch = name.includes(query);
            const matchStatus = activeStatus === 'all' || status === activeStatus;

            if (matchSearch && matchStatus) {
                row.style.display = '';
                visible++;
            } else {
                row.style.display = 'none';
            }
        });

        document.getElementById('showing-count').textContent = `Showing ${visible} patients`;
    }
</script>
@endpush
