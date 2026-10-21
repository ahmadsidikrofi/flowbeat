@extends('layouts.app')

@section('title', 'Patient Report — ' . $patient['name'])

@push('styles')
<style>
    .chart-container {
        background: linear-gradient(180deg, rgba(233, 236, 239, 0) 0%, rgba(233, 236, 239, 0.2) 100%);
    }
    .glass-card {
        backdrop-filter: blur(8px);
        background-color: rgba(255, 255, 255, 0.8);
    }
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
@endpush

@section('content')

{{-- ===================== BREADCRUMB + HEADER ===================== --}}
<div class="flex justify-between items-end mb-lg">
    <div>
        <nav class="flex items-center gap-xs text-on-surface-variant mb-base">
            <a class="text-body-sm font-body-sm hover:text-primary transition-colors" href="{{ route('patients.index') }}">Patients</a>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            <span class="text-body-sm font-body-sm text-primary font-bold">Patient Details</span>
        </nav>
        <div class="flex items-center gap-md">
            <h2 class="font-headline-lg text-headline-lg">{{ $patient['name'] }}</h2>
            <span class="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-lg font-label-caps text-label-caps">
                ID: #{{ $patient['patient_id'] }}
            </span>
        </div>
    </div>
    <div class="flex gap-sm">
        <button class="flex items-center gap-xs px-md py-sm bg-surface-container border border-outline-variant rounded-lg font-title-md text-on-surface hover:bg-surface-container-high transition-all">
            <span class="material-symbols-outlined">mail</span>
            Contact Patient
        </button>
        <button class="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg font-title-md hover:bg-primary-container shadow-md transition-all active:scale-95">
            <span class="material-symbols-outlined">edit_note</span>
            Update Report
        </button>
    </div>
</div>

{{-- ===================== MAIN GRID ===================== --}}
<div class="grid grid-cols-12 gap-gutter">

    {{-- ====== LEFT COLUMN: Bio, ML Predictions, Alert History ====== --}}
    <div class="col-span-4 space-y-gutter">

        {{-- Patient Bio Card --}}
        <section class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <h3 class="font-title-md text-title-md mb-md flex items-center gap-sm">
                <span class="material-symbols-outlined text-primary">person</span>
                Patient Bio
            </h3>
            <div class="space-y-md">
                <div class="flex justify-between border-b border-surface-variant pb-sm">
                    <span class="text-on-surface-variant font-body-sm">Age</span>
                    <span class="font-title-md text-primary">{{ $patient['age'] }} Years</span>
                </div>
                <div class="flex justify-between border-b border-surface-variant pb-sm">
                    <span class="text-on-surface-variant font-body-sm">Sex</span>
                    <span class="font-title-md">{{ $patient['sex'] }}</span>
                </div>
                <div class="flex justify-between border-b border-surface-variant pb-sm">
                    <span class="text-on-surface-variant font-body-sm">Blood Type</span>
                    <span class="font-title-md">{{ $patient['blood_type'] }}</span>
                </div>
                <div>
                    <span class="text-on-surface-variant font-body-sm block mb-xs">Medical History</span>
                    <div class="flex flex-wrap gap-xs">
                        @foreach ($patient['medical_history'] as $condition)
                            <span class="bg-surface-container text-on-surface-variant px-sm py-xs rounded text-body-sm">
                                {{ $condition }}
                            </span>
                        @endforeach
                    </div>
                </div>
            </div>
        </section>

        {{-- ML Predictions Card --}}
        <section class="bg-primary text-on-primary rounded-xl p-md shadow-lg relative overflow-hidden">
            {{-- Atmospheric dot pattern --}}
            <div class="absolute inset-0 opacity-10 pointer-events-none"
                 style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
            <div class="relative z-10">
                <h3 class="font-title-md text-title-md mb-md flex items-center gap-sm">
                    <span class="material-symbols-outlined">psychology</span>
                    ML Health Predictions
                </h3>

                {{-- Risk Level --}}
                <div class="bg-white/10 rounded-lg p-sm mb-md backdrop-blur-sm border border-white/20">
                    <div class="flex items-center justify-between mb-xs">
                        <span class="text-body-sm font-label-caps uppercase">Health Risk Level</span>
                        <span class="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full text-label-caps font-bold" id="risk-badge">
                            {{ strtoupper($ml['risk_level']) }}
                        </span>
                    </div>
                    <p class="text-body-sm opacity-90">{{ $ml['risk_description'] }}</p>
                </div>

                {{-- Predicted Outcome --}}
                <div class="bg-white/10 rounded-lg p-sm backdrop-blur-sm border border-white/20">
                    <div class="flex items-center justify-between mb-xs">
                        <span class="text-body-sm font-label-caps uppercase">Predicted Outcome</span>
                        <span class="text-title-md font-bold">{{ $ml['predicted_outcome'] }}</span>
                    </div>
                    <p class="text-body-sm opacity-90">{{ $ml['outcome_description'] }}</p>
                </div>
            </div>
        </section>

        {{-- Alert History Card --}}
        <section class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <h3 class="font-title-md text-title-md mb-md flex items-center gap-sm">
                <span class="material-symbols-outlined text-error">history</span>
                Alert History
            </h3>
            <div class="space-y-sm">
                @forelse ($alertHistory as $alert)
                    @php
                        $isCritical = $alert['severity'] === 'critical';
                        $wrapClass  = $isCritical
                            ? 'bg-error-container/20 border-error'
                            : 'bg-surface-container border-outline';
                        $iconBg     = $isCritical ? 'bg-error text-on-error' : 'bg-outline text-on-primary';
                        $icon       = $isCritical ? 'priority_high' : 'warning';
                        $titleClass = $isCritical ? 'text-on-error-container' : '';
                    @endphp
                    <div class="flex gap-sm p-sm rounded-lg {{ $wrapClass }} border-l-4">
                        <div class="{{ $iconBg }} w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-[20px]">{{ $icon }}</span>
                        </div>
                        <div>
                            <p class="text-body-sm font-bold {{ $titleClass }}">{{ $alert['title'] }}</p>
                            <p class="text-[12px] text-on-surface-variant">{{ $alert['meta'] }}</p>
                        </div>
                    </div>
                @empty
                    <p class="text-center text-on-surface-variant font-body-sm py-md">No alert history.</p>
                @endforelse
            </div>
            <button class="w-full text-center mt-md text-primary font-body-sm hover:underline">
                View All History
            </button>
        </section>

    </div>{{-- end left col --}}

    {{-- ====== RIGHT COLUMN: Vital Charts + Summary ====== --}}
    <div class="col-span-8 space-y-gutter">

        {{-- Heart Rate Trend Chart --}}
        <section class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <div class="flex justify-between items-center mb-lg">
                <h3 class="font-title-md text-title-md flex items-center gap-sm">
                    <span class="material-symbols-outlined text-error">favorite</span>
                    Heart Rate Trend
                </h3>
                <div class="flex gap-xs bg-surface-container p-xs rounded-lg">
                    <button class="px-sm py-xs bg-white shadow-sm rounded-md text-label-caps">24H</button>
                    <button class="px-sm py-xs text-on-surface-variant text-label-caps hover:text-on-surface transition-colors">7D</button>
                    <button class="px-sm py-xs text-on-surface-variant text-label-caps hover:text-on-surface transition-colors">30D</button>
                </div>
            </div>

            <div class="h-64 relative chart-container rounded-lg overflow-hidden">
                {{-- SVG Chart: Heart Rate --}}
                <svg class="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="hrGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%"   stop-color="#ba1a1a" stop-opacity="0.2"/>
                            <stop offset="100%" stop-color="#ba1a1a" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    <line x1="0" y1="50"  x2="800" y2="50"  stroke="#E9ECEF" stroke-width="1"/>
                    <line x1="0" y1="100" x2="800" y2="100" stroke="#E9ECEF" stroke-width="1"/>
                    <line x1="0" y1="150" x2="800" y2="150" stroke="#E9ECEF" stroke-width="1"/>
                    <path d="{{ $charts['hr_path'] }}"
                          fill="none" stroke="#ba1a1a" stroke-width="3"
                          stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="{{ $charts['hr_fill'] }}"
                          fill="url(#hrGradient)"/>
                </svg>
                {{-- Tooltip pin --}}
                <div class="absolute left-1/2 top-1/4 -translate-x-1/2 flex flex-col items-center cursor-pointer">
                    <div class="bg-inverse-surface text-inverse-on-surface text-[12px] px-sm py-xs rounded mb-xs shadow-lg">
                        {{ $charts['hr_tooltip'] }}
                    </div>
                    <div class="w-4 h-4 rounded-full border-2 border-white bg-error shadow-md"></div>
                    <div class="w-px grow bg-error/30"></div>
                </div>
            </div>

            <div class="flex justify-between mt-sm text-label-caps text-on-surface-variant px-base">
                @foreach (['08:00','12:00','16:00','20:00','00:00','04:00','08:00'] as $label)
                    <span>{{ $label }}</span>
                @endforeach
            </div>
        </section>

        {{-- SpO2 Trend Chart --}}
        <section class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <div class="flex justify-between items-center mb-lg">
                <h3 class="font-title-md text-title-md flex items-center gap-sm">
                    <span class="material-symbols-outlined text-secondary">air</span>
                    SpO2 Saturation Trend
                </h3>
                <div class="flex gap-sm items-center">
                    <span class="w-3 h-3 rounded-full bg-secondary"></span>
                    <span class="text-label-caps text-on-surface-variant">Real-time Data</span>
                </div>
            </div>

            <div class="h-64 relative chart-container rounded-lg overflow-hidden">
                {{-- SVG Chart: SpO2 --}}
                <svg class="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="spo2Gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%"   stop-color="#006c4f" stop-opacity="0.2"/>
                            <stop offset="100%" stop-color="#006c4f" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    <line x1="0" y1="50"  x2="800" y2="50"  stroke="#E9ECEF" stroke-width="1"/>
                    <line x1="0" y1="100" x2="800" y2="100" stroke="#E9ECEF" stroke-width="1"/>
                    <line x1="0" y1="150" x2="800" y2="150" stroke="#E9ECEF" stroke-width="1"/>
                    <path d="{{ $charts['spo2_path'] }}"
                          fill="none" stroke="#006c4f" stroke-width="3" stroke-linecap="round"/>
                    <path d="{{ $charts['spo2_fill'] }}"
                          fill="url(#spo2Gradient)"/>
                </svg>
            </div>

            <div class="flex justify-between mt-sm text-label-caps text-on-surface-variant px-base">
                @foreach (['08:00','12:00','16:00','20:00','00:00','04:00','08:00'] as $label)
                    <span>{{ $label }}</span>
                @endforeach
            </div>
        </section>

        {{-- Sys/Dia Blood Pressure Chart --}}
        <section class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <div class="flex justify-between items-center mb-lg">
                <h3 class="font-title-md text-title-md flex items-center gap-sm">
                    <span class="material-symbols-outlined text-primary">bloodtype</span>
                    Blood Pressure Trend (Sys / Dia)
                </h3>
                <div class="flex gap-sm items-center text-label-caps text-on-surface-variant">
                    <span class="inline-flex items-center gap-xs"><span class="w-3 h-1 rounded bg-primary inline-block"></span> Systolic</span>
                    <span class="inline-flex items-center gap-xs"><span class="w-3 h-1 rounded bg-secondary inline-block"></span> Diastolic</span>
                </div>
            </div>
            <div class="h-64">
                <canvas id="bpChart"></canvas>
            </div>
        </section>

        {{-- Glucose Level Chart --}}
        <section class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <div class="flex justify-between items-center mb-lg">
                <h3 class="font-title-md text-title-md flex items-center gap-sm">
                    <span class="material-symbols-outlined" style="color:#7B5EA7">water_drop</span>
                    Blood Glucose Level Trend
                </h3>
                <div class="flex gap-sm items-center">
                    @php
                        $latestGlucose = $vitals['latest_glucose'];
                        $glucoseBadgeClass = 'bg-secondary/10 text-secondary';
                        $glucoseBadgeText  = 'Normal';
                        if ($latestGlucose !== null) {
                            if ($latestGlucose > 140) { $glucoseBadgeClass = 'bg-error/10 text-error'; $glucoseBadgeText = 'High'; }
                            elseif ($latestGlucose > 100) { $glucoseBadgeClass = 'bg-on-secondary-container/10 text-on-secondary-container'; $glucoseBadgeText = 'Elevated'; }
                        }
                    @endphp
                    @if($latestGlucose !== null)
                        <span class="px-sm py-xs rounded-full text-label-caps font-bold {{ $glucoseBadgeClass }}">
                            {{ $glucoseBadgeText }} — {{ number_format($latestGlucose, 1) }} mg/dL
                        </span>
                    @else
                        <span class="px-sm py-xs rounded-full text-label-caps bg-surface-container text-on-surface-variant">No SpO2 Data</span>
                    @endif
                </div>
            </div>
            <div class="h-64">
                <canvas id="glucoseChart"></canvas>
            </div>
            {{-- Reference lines legend --}}
            <div class="flex gap-lg mt-sm text-[11px] text-on-surface-variant px-base">
                <span class="inline-flex items-center gap-xs"><span class="w-4 h-px bg-secondary/60 inline-block border-t-2 border-dashed border-secondary"></span> Normal ≤ 100</span>
                <span class="inline-flex items-center gap-xs"><span class="w-4 h-px bg-on-secondary-container/60 inline-block border-t-2 border-dashed border-on-secondary-container"></span> Elevated ≤ 140</span>
                <span class="inline-flex items-center gap-xs"><span class="w-4 h-px bg-error/60 inline-block border-t-2 border-dashed border-error"></span> High > 140</span>
            </div>
        </section>

        {{-- Data Summary Grid --}}
        <div class="grid grid-cols-4 gap-gutter">

            {{-- Avg Heart Rate --}}
            <div class="bg-surface-container-low p-md rounded-xl border border-outline-variant">
                <p class="text-label-caps text-on-surface-variant mb-xs">Avg. Heart Rate</p>
                <h4 class="text-headline-lg font-bold text-primary">
                    {{ $vitals['avg_heart_rate'] }} <span class="text-body-sm font-normal">BPM</span>
                </h4>
                <div class="flex items-center gap-xs mt-base text-secondary font-bold text-body-sm">
                    <span class="material-symbols-outlined text-[16px]">trending_down</span>
                    {{ $vitals['hr_trend'] }}
                </div>
            </div>

            {{-- Avg Sys/Dia --}}
            <div class="bg-surface-container-low p-md rounded-xl border border-outline-variant">
                <p class="text-label-caps text-on-surface-variant mb-xs">Avg. Blood Pressure</p>
                <h4 class="text-headline-lg font-bold text-on-surface">
                    {{ $vitals['avg_spo2'] }}<span class="text-body-sm font-normal text-on-surface-variant"> mmHg</span>
                </h4>
                <div class="flex items-center gap-xs mt-base text-on-surface-variant font-bold text-body-sm">
                    <span class="material-symbols-outlined text-[16px]">bloodtype</span>
                    {{ $vitals['spo2_trend'] }}
                </div>
            </div>

            {{-- Avg Glucose --}}
            <div class="bg-surface-container-low p-md rounded-xl border border-outline-variant">
                <p class="text-label-caps text-on-surface-variant mb-xs">Avg. Glucose</p>
                <h4 class="text-headline-lg font-bold" style="color:#7B5EA7">
                    {{ $vitals['avg_glucose'] }} <span class="text-body-sm font-normal">mg/dL</span>
                </h4>
                <div class="flex items-center gap-xs mt-base text-on-surface-variant font-bold text-body-sm">
                    <span class="material-symbols-outlined text-[16px]">water_drop</span>
                    From SpO2 measurement
                </div>
            </div>

            {{-- Daily Temp --}}
            <div class="bg-surface-container-low p-md rounded-xl border border-outline-variant">
                <p class="text-label-caps text-on-surface-variant mb-xs">Daily Temp</p>
                <h4 class="text-headline-lg font-bold">
                    {{ $vitals['temperature'] }} <span class="text-body-sm font-normal">°C</span>
                </h4>
                <div class="flex items-center gap-xs mt-base text-on-surface-variant font-bold text-body-sm">
                    <span class="material-symbols-outlined text-[16px]">device_thermostat</span>
                    {{ $vitals['temp_trend'] }}
                </div>
            </div>

        </div>{{-- end summary grid --}}

    </div>{{-- end right col --}}

</div>{{-- end main grid --}}

{{-- ===================== FLOATING ACTION BUTTON ===================== --}}
<button class="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:bg-primary-container transition-all active:scale-95 group z-50"
        aria-label="Immediate Action">
    <span class="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">emergency</span>
    <span class="absolute right-full mr-sm bg-inverse-surface text-inverse-on-surface px-md py-xs rounded-lg text-body-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Immediate Action
    </span>
</button>

@endsection

@push('scripts')
<script>
    // Micro-interactions: tactile feedback on buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function () {
            this.classList.add('scale-95');
            setTimeout(() => this.classList.remove('scale-95'), 150);
        });
    });

    // Live data pulse every 10 seconds on risk badge
    setInterval(() => {
        const badge = document.getElementById('risk-badge');
        if (badge) {
            badge.classList.add('animate-pulse');
            setTimeout(() => badge.classList.remove('animate-pulse'), 1000);
        }
    }, 10000);

    // ── Chart.js: Blood Pressure (Sys / Dia) ────────────────────────────────
    const bpLabels  = {!! $charts['bp_labels'] !!};
    const bpSysData = {!! $charts['bp_sys'] !!};
    const bpDiaData = {!! $charts['bp_dia'] !!};

    const bpCtx = document.getElementById('bpChart')?.getContext('2d');
    if (bpCtx && bpLabels.length > 0) {
        new Chart(bpCtx, {
            type: 'line',
            data: {
                labels: bpLabels,
                datasets: [
                    {
                        label: 'Systolic (mmHg)',
                        data: bpSysData,
                        borderColor: '#1565C0',
                        backgroundColor: 'rgba(21,101,192,0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        borderWidth: 2.5,
                    },
                    {
                        label: 'Diastolic (mmHg)',
                        data: bpDiaData,
                        borderColor: '#006c4f',
                        backgroundColor: 'rgba(0,108,79,0.06)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        borderWidth: 2.5,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} mmHg`
                        }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { maxTicksLimit: 8, font: { size: 11 } } },
                    y: {
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: { font: { size: 11 }, callback: v => v + ' mmHg' },
                        // Reference zone
                        suggestedMin: 60,
                        suggestedMax: 160,
                    }
                }
            }
        });
    } else if (bpCtx) {
        bpCtx.canvas.parentElement.innerHTML =
            '<p class="flex h-full items-center justify-center text-on-surface-variant text-body-sm">No blood pressure data available.</p>';
    }

    // ── Chart.js: Glucose Level ──────────────────────────────────────────────
    const glucoseLabels = {!! $charts['glucose_labels'] !!};
    const glucoseData   = {!! $charts['glucose_data'] !!};

    const glCtx = document.getElementById('glucoseChart')?.getContext('2d');
    if (glCtx && glucoseLabels.length > 0) {
        new Chart(glCtx, {
            type: 'line',
            data: {
                labels: glucoseLabels,
                datasets: [{
                    label: 'Blood Glucose (mg/dL)',
                    data: glucoseData,
                    borderColor: '#7B5EA7',
                    backgroundColor: 'rgba(123,94,167,0.08)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 2.5,
                    spanGaps: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ctx.parsed.y !== null
                                ? ` Glucose: ${ctx.parsed.y} mg/dL`
                                : ' No data'
                        }
                    },
                    // Draw reference horizontal lines
                    annotation: undefined
                },
                scales: {
                    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { maxTicksLimit: 8, font: { size: 11 } } },
                    y: {
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: { font: { size: 11 }, callback: v => v + ' mg/dL' },
                        suggestedMin: 60,
                        suggestedMax: 200,
                    }
                }
            },
            plugins: [{
                id: 'referenceLines',
                afterDraw(chart) {
                    const { ctx: c, chartArea: { left, right }, scales: { y } } = chart;
                    const drawLine = (value, color, label) => {
                        const yPos = y.getPixelForValue(value);
                        c.save();
                        c.beginPath();
                        c.setLineDash([6, 4]);
                        c.strokeStyle = color;
                        c.lineWidth = 1.2;
                        c.moveTo(left, yPos);
                        c.lineTo(right, yPos);
                        c.stroke();
                        c.fillStyle = color;
                        c.font = '10px Inter, sans-serif';
                        c.fillText(label, right - c.measureText(label).width - 4, yPos - 3);
                        c.restore();
                    };
                    drawLine(100, 'rgba(0,108,79,0.5)',  'Normal  100');
                    drawLine(140, 'rgba(90,60,0,0.45)',  'Elevated 140');
                }
            }]
        });
    } else if (glCtx) {
        glCtx.canvas.parentElement.innerHTML =
            '<p class="flex h-full items-center justify-center text-on-surface-variant text-body-sm">No glucose data available. SpO2 measurement required.</p>';
    }
</script>
@endpush
