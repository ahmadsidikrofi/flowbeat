const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Contoh endpoint untuk tes
app.get('/', (req, res) => {
    res.send('Flowbeat backend aktif!');
});

// Contoh: endpoint notifikasi
app.get('/notifikasi', (req, res) => {
    res.json([
        { id: 1, title: 'Notif 1', pesan: 'Detak jantung tinggi, periksa segera!', date:'18-10-2025' },
        { id: 2, title: 'Notif 2', pesan: 'Terhubung ke perangkat Omron', date:'17-10-2025' },
    ]);
});

// Jalankan server
// app.listen(PORT, () => {
//     console.log(`Server berjalan di http://localhost:${PORT}`);
// });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Akses jaringan: http://192.168.18.210:${PORT}`); 
});