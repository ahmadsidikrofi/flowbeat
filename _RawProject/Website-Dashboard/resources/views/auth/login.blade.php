<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>RPMS Portal - Access</title>
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
                        "headline-lg-mobile": ["Inter"],
                        "headline-lg": ["Inter"],
                        "label-caps": ["Inter"],
                        "title-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "data-mono": ["Inter"]
                    },
                    "fontSize": {
                        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                        "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                        "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700"}],
                        "title-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                        "data-mono": ["18px", {"lineHeight": "24px", "fontWeight": "500"}]
                    }
                }
            }
        }
    </script>
    <style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .form-transition {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hidden-form {
            opacity: 0;
            pointer-events: none;
            position: absolute;
            transform: translateY(10px);
        }
        .active-form {
            opacity: 1;
            pointer-events: auto;
            position: relative;
            transform: translateY(0);
        }
    </style>
</head>
<body class="bg-background font-body-lg text-on-background min-h-screen flex overflow-hidden">

<!-- Left Side: Visual Anchor -->
<section class="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
    <div class="absolute inset-0 z-0">
        <img alt="Medical Professional using Tablet"
             class="w-full h-full object-cover mix-blend-overlay opacity-60"
             src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnoXaKnMDAfGJiO2xkPV7NnTzexa7ZgE03cAI1C5ALcZTurcV03D2UtSMArI3PzlyCgYWp0gwRpE-kBV8djnff9scZThmE7jQliZUEejfnMxavnQ9ETyu9zgUSPJE-D6NFU3UynNGJNNYGot_9y2CAbA44HtIGZmvc5gemKftArZnd4si6toeshemCF7VYhLLNGoIbhG9CTkuCH7ursrCTvIvVME_0DaQEG46w8spvt4FnwH--z3AHW7uqfPx6GIrD7wVjx9GrLZY"/>
    </div>
    <!-- Brand Overlay -->
    <div class="relative z-10 p-xl text-on-primary max-w-xl">
        <div class="mb-md">
            <span class="material-symbols-outlined text-on-primary text-[64px]">shield_with_heart</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg mb-sm">Remote Patient Monitoring System</h1>
        <p class="font-body-lg text-body-lg opacity-90 leading-relaxed">
            Empowering healthcare professionals with real-time vitals, predictive diagnostics, and clinical intelligence to improve patient outcomes from anywhere.
        </p>
        <div class="mt-lg grid grid-cols-2 gap-md">
            <div class="flex items-center gap-sm">
                <span class="material-symbols-outlined text-secondary-container">security</span>
                <span class="font-label-caps text-label-caps">HIPAA COMPLIANT</span>
            </div>
            <div class="flex items-center gap-sm">
                <span class="material-symbols-outlined text-secondary-container">bolt</span>
                <span class="font-label-caps text-label-caps">REAL-TIME DATA</span>
            </div>
        </div>
    </div>
    <!-- Subtle Pattern -->
    <div class="absolute inset-0 opacity-10 pointer-events-none"
         style="background-image: radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0); background-size: 32px 32px;"></div>
</section>

<!-- Right Side: Interaction Canvas -->
<main class="w-full lg:w-1/2 flex items-center justify-center p-margin-mobile md:p-xl bg-surface">
    <div class="w-full max-w-md">
        <!-- Mobile Header Only -->
        <div class="lg:hidden mb-lg flex flex-col items-center">
            <span class="material-symbols-outlined text-primary text-[48px]">clinical_notes</span>
            <h2 class="font-title-md text-title-md text-primary mt-sm">RPMS Dashboard</h2>
        </div>

        <!-- Login Form -->
        <div class="form-transition active-form" id="login-container">
            <header class="mb-lg">
                <h2 class="font-headline-lg text-headline-lg text-on-surface">Welcome back</h2>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-xs">Access your clinical dashboard to review patient data</p>
            </header>

            {{-- Tampilkan error validasi --}}
            @if ($errors->any())
                <div class="mb-md p-4 bg-error-container rounded-lg border border-error">
                    <ul class="list-disc pl-4 space-y-1">
                        @foreach ($errors->all() as $error)
                            <li class="font-body-sm text-body-sm text-on-error-container">{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            {{-- Tampilkan pesan session (misal: logout berhasil) --}}
            @if (session('status'))
                <div class="mb-md p-4 bg-secondary-container rounded-lg">
                    <p class="font-body-sm text-body-sm text-on-secondary-container">{{ session('status') }}</p>
                </div>
            @endif

            <form class="space-y-md" method="POST" action="{{ route('login.submit') }}">
                @csrf

                <div class="space-y-xs">
                    <label class="block font-label-caps text-label-caps text-on-surface-variant" for="email">CLINICIAN EMAIL</label>
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary">mail</span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value="{{ old('email') }}"
                            autocomplete="email"
                            required
                            placeholder="dr.smith@medical.com"
                            class="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border @error('email') border-error @else border-outline-variant @enderror focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-body-lg text-body-lg"
                        />
                    </div>
                    @error('email')
                        <p class="font-body-sm text-[12px] text-error mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="space-y-xs">
                    <div class="flex justify-between items-center">
                        <label class="font-label-caps text-label-caps text-on-surface-variant" for="password">PASSWORD</label>
                        @if (Route::has('password.request'))
                            <a href="{{ route('password.request') }}" class="text-primary font-label-caps text-[11px] hover:underline">FORGOT PASSWORD?</a>
                        @endif
                    </div>
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary">lock</span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            placeholder="••••••••"
                            class="w-full pl-12 pr-12 py-3 bg-surface-container rounded-lg border @error('password') border-error @else border-outline-variant @enderror focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-body-lg text-body-lg"
                        />
                        <button class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" type="button" id="toggle-password" aria-label="Toggle password visibility">
                            <span class="material-symbols-outlined" id="password-icon">visibility</span>
                        </button>
                    </div>
                    @error('password')
                        <p class="font-body-sm text-[12px] text-error mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="flex items-center gap-sm">
                    <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                        {{ old('remember') ? 'checked' : '' }}
                    />
                    <label class="font-body-sm text-body-sm text-on-surface-variant select-none" for="remember">Remember this device for 30 days</label>
                </div>

                <button type="submit" class="w-full bg-primary text-on-primary py-4 rounded-lg font-title-md text-title-md hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-sm">
                    Sign In to Dashboard
                    <span class="material-symbols-outlined">arrow_forward</span>
                </button>
            </form>

            <footer class="mt-lg text-center">
                <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Don't have an account yet?
                    <button class="text-primary font-bold hover:underline" onclick="toggleForms()" type="button">Contact Administrator</button>
                    or
                    <button class="text-primary font-bold hover:underline" onclick="toggleForms()" type="button">Register Clinic</button>
                </p>
            </footer>
        </div>

        <!-- Registration Form (Hidden by Default) -->
        <div class="form-transition hidden-form" id="register-container">
            <header class="mb-lg">
                <h2 class="font-headline-lg text-headline-lg text-on-surface">Register Facility</h2>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-xs">Establish your remote monitoring infrastructure</p>
            </header>

            <form class="space-y-sm" method="POST" action="{{ route('register.submit') }}">
                @csrf

                <div class="grid grid-cols-2 gap-sm">
                    <div class="space-y-xs">
                        <label class="block font-label-caps text-label-caps text-on-surface-variant" for="first_name">FIRST NAME</label>
                        <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            value="{{ old('first_name') }}"
                            required
                            class="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary outline-none font-body-lg text-body-lg"
                        />
                    </div>
                    <div class="space-y-xs">
                        <label class="block font-label-caps text-label-caps text-on-surface-variant" for="last_name">LAST NAME</label>
                        <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            value="{{ old('last_name') }}"
                            required
                            class="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary outline-none font-body-lg text-body-lg"
                        />
                    </div>
                </div>

                <div class="space-y-xs">
                    <label class="block font-label-caps text-label-caps text-on-surface-variant" for="facility_name">FACILITY NAME</label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">apartment</span>
                        <input
                            id="facility_name"
                            name="facility_name"
                            type="text"
                            value="{{ old('facility_name') }}"
                            placeholder="Central City General Hospital"
                            class="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary outline-none font-body-lg text-body-lg"
                        />
                    </div>
                </div>

                <div class="space-y-xs">
                    <label class="block font-label-caps text-label-caps text-on-surface-variant" for="reg_email">PROFESSIONAL EMAIL</label>
                    <input
                        id="reg_email"
                        name="email"
                        type="email"
                        value="{{ old('email') }}"
                        placeholder="admin@facility.com"
                        required
                        class="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary outline-none font-body-lg text-body-lg"
                    />
                </div>

                <div class="space-y-xs">
                    <label class="block font-label-caps text-label-caps text-on-surface-variant" for="role">SECURITY CLEARANCE LEVEL</label>
                    <select
                        id="role"
                        name="role"
                        class="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary outline-none font-body-lg text-body-lg appearance-none cursor-pointer"
                    >
                        <option value="clinical_director" {{ old('role') == 'clinical_director' ? 'selected' : '' }}>Clinical Director</option>
                        <option value="attending_physician" {{ old('role') == 'attending_physician' ? 'selected' : '' }}>Attending Physician</option>
                        <option value="registered_nurse" {{ old('role') == 'registered_nurse' ? 'selected' : '' }}>Registered Nurse</option>
                        <option value="system_administrator" {{ old('role') == 'system_administrator' ? 'selected' : '' }}>System Administrator</option>
                    </select>
                </div>

                <div class="pt-md">
                    <button type="submit" class="w-full bg-primary text-on-primary py-4 rounded-lg font-title-md text-title-md hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm">
                        Create Professional Account
                    </button>
                </div>
            </form>

            <footer class="mt-lg text-center">
                <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Already have an account?
                    <button class="text-primary font-bold hover:underline" onclick="toggleForms()" type="button">Sign In Instead</button>
                </p>
            </footer>
        </div>

        <!-- Footer Info -->
        <div class="mt-xl flex justify-between items-center border-t border-outline-variant pt-md">
            <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                <span class="font-label-caps text-[10px] text-on-surface-variant">End-to-End Encrypted</span>
            </div>
            <div class="flex gap-md">
                <a class="font-label-caps text-[10px] text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
                <a class="font-label-caps text-[10px] text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
            </div>
        </div>
    </div>
</main>

<script>
    function toggleForms() {
        const login = document.getElementById('login-container');
        const register = document.getElementById('register-container');

        if (login.classList.contains('active-form')) {
            login.classList.replace('active-form', 'hidden-form');
            setTimeout(() => {
                register.classList.replace('hidden-form', 'active-form');
            }, 400);
        } else {
            register.classList.replace('active-form', 'hidden-form');
            setTimeout(() => {
                login.classList.replace('hidden-form', 'active-form');
            }, 400);
        }
    }

    // Toggle password visibility
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            passwordIcon.textContent = isPassword ? 'visibility_off' : 'visibility';
        });
    }

    // Micro-interactions to form inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('scale-[1.01]');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('scale-[1.01]');
        });
    });
</script>
</body>
</html>
