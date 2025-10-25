<!DOCTYPE html>
<html>

<head>
    <title>IoT Health Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">
    <div class="container mt-5">
        <h3 class="mb-4">Data Tekanan Darah - Omron</h3>

        @if(isset($error))
        <div class="alert alert-danger">{{ $error }}</div>
        @elseif(isset($data))
        <div class="card p-4 shadow-sm">
            <p><strong>Device Name:</strong> {{ $data['device_name'] }}</p>
            <p><strong>MAC Address:</strong> {{ $data['mac_address'] }}</p>
            <hr>
            <p><strong>SYS:</strong> {{ $data['latest_record']['sys'] ?? '-' }}</p>
            <p><strong>DIA:</strong> {{ $data['latest_record']['dia'] ?? '-' }}</p>
            <p><strong>BPM:</strong> {{ $data['latest_record']['bpm'] ?? '-' }}</p>
            <p><strong>Datetime:</strong> {{ $data['latest_record']['datetime'] ?? '-' }}</p>
        </div>
        @endif

        <div class="mt-4">
            <label for="deviceSelect">Pilih Sumber Data:</label>
            <select id="deviceSelect" class="form-select w-50">
                <option value="omron" selected>Omron BLE</option>
                <option value="max30100">MAX30100</option>
            </select>
        </div>
    </div>

    <script>
        document.getElementById('deviceSelect').addEventListener('change', function() {
            let device = this.value;
            if (device === 'omron') {
                window.location.href = '/omron';
            } else if (device === 'max30100') {
                alert('Belum ada API untuk MAX30100');
            }
        });
    </script>
</body>

</html>