let port;
let reader;
let inputStream;
let keepReading = true;

const connectBtn = document.getElementById('connect-btn');
const resetBtn = document.getElementById('reset-btn');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

// Elements
const hrValue = document.getElementById('hr-value');
const hrCircle = document.getElementById('hr-circle');
const spo2Value = document.getElementById('spo2-value');
const spo2Circle = document.getElementById('spo2-circle');
const tempValue = document.getElementById('temp-value');
const timeValue = document.getElementById('time-value');
const logContent = document.getElementById('log-content');
const logContainer = document.getElementById('log-container');
const toggleLogBtn = document.getElementById('toggle-log-btn');
const pulseContainer = document.querySelector('.pulse-animation-container');

// Circle Circumference for progress rings (r=52)
const circumference = 2 * Math.PI * 52;
hrCircle.style.strokeDasharray = `${circumference} ${circumference}`;
spo2Circle.style.strokeDasharray = `${circumference} ${circumference}`;

function setProgress(circle, percent, maxVal = 100) {
    if(percent > maxVal) percent = maxVal;
    if(percent < 0) percent = 0;
    const offset = circumference - (percent / maxVal) * circumference;
    circle.style.strokeDashoffset = offset;
}

toggleLogBtn.addEventListener('click', () => {
    if (logContainer.classList.contains('hidden')) {
        logContainer.classList.remove('hidden');
        toggleLogBtn.innerText = 'Hide';
    } else {
        logContainer.classList.add('hidden');
        toggleLogBtn.innerText = 'Show';
    }
});

resetBtn.addEventListener('click', () => {
    hrValue.innerText = '--';
    setProgress(hrCircle, 0);
    spo2Value.innerText = '--';
    setProgress(spo2Circle, 0);
    tempValue.innerText = '--';
    timeValue.innerText = '--:--:--';
    logContent.innerText = '';
});

connectBtn.addEventListener('click', async () => {
    if (port) {
        await disconnectSerial();
    } else {
        await connectSerial();
    }
});

async function connectSerial() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 }); // ESP32 Serial baud rate
        
        statusIndicator.classList.remove('offline');
        statusIndicator.classList.add('online');
        statusText.innerText = 'Connected';
        connectBtn.innerText = 'Disconnect';
        connectBtn.style.backgroundColor = '#EF4444';

        keepReading = true;
        readLoop();
    } catch (err) {
        console.error('Error connecting to serial:', err);
        alert('Failed to connect to serial port. Ensure no other program (like Arduino IDE) is using it.');
    }
}

async function disconnectSerial() {
    keepReading = false;
    if (reader) {
        await reader.cancel();
    }
    if (port) {
        await port.close();
    }
    
    port = null;
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
    statusText.innerText = 'Disconnected';
    connectBtn.innerText = 'Connect Serial';
    connectBtn.style.backgroundColor = '#1F2937';
}

class LineBreakTransformer {
    constructor() {
        this.chunks = "";
    }
    transform(chunk, controller) {
        this.chunks += chunk;
        const lines = this.chunks.split("\r\n");
        this.chunks = lines.pop(); // keep the last incomplete line
        lines.forEach(line => controller.enqueue(line));
    }
    flush(controller) {
        if (this.chunks !== "") controller.enqueue(this.chunks);
    }
}

async function readLoop() {
    const textDecoder = new TextDecoderStream();
    inputStream = port.readable.pipeTo(textDecoder.writable);
    
    const linesStream = textDecoder.readable.pipeThrough(
        new TransformStream(new LineBreakTransformer())
    );
    
    reader = linesStream.getReader();

    try {
        while (keepReading) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
                processData(value);
            }
        }
    } catch (err) {
        console.error('Serial Read Error:', err);
    } finally {
        reader.releaseLock();
    }
}

function processData(line) {
    // Add to log
    logContent.innerText += line + "\n";
    logContainer.scrollTop = logContainer.scrollHeight;

    // Filter out header row
    if (line.includes("Time[s]")) return;

    // Format: Time[s] \t SpO2 \t HR \t SpO2_MX \t HR_MX \t Clock \t Ratio \t Corr \t Temp[C]
    // Example: 28000 \t 98.00 \t 72 \t 97.50 \t 74 \t 0:00:28 \t 0.5 \t 0.9 \t 32.5
    const parts = line.split('\t');
    
    if (parts.length >= 9) {
        const spo2 = parseFloat(parts[1]);
        const hr = parseInt(parts[2]);
        const clock = parts[5];
        const temp = parseFloat(parts[8]);

        // Update HR
        if (hr > 0 && hr !== -999) {
            hrValue.innerText = hr;
            setProgress(hrCircle, hr, 200); // max hr mapped to 200 for circle
            
            // Add pulse animation class
            pulseContainer.classList.add('pulse');
            setTimeout(() => pulseContainer.classList.remove('pulse'), 800);
            
        } else {
            hrValue.innerText = '--';
            setProgress(hrCircle, 0);
        }

        // Update SpO2
        if (spo2 > 0 && spo2 !== -999) {
            spo2Value.innerText = spo2.toFixed(1);
            // SpO2 scale is 90-100 mostly, but we'll map 0-100 for simplicity
            setProgress(spo2Circle, spo2, 100);
        } else {
            spo2Value.innerText = '--';
            setProgress(spo2Circle, 0);
        }

        // Update smaller stats
        if (!isNaN(temp)) {
            tempValue.innerText = temp.toFixed(1);
        }
        
        if (clock) {
            timeValue.innerText = clock;
        }
    }
}
