const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Konfigurasi koneksi ke MySQL (XAMPP) dengan env
const dotenv = require('dotenv');
dotenv.config();
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Coba koneksi
db.connect(err => {
    if (err) {
        console.error('Gagal konek ke MySQL:', err);
        return;
    }
    console.log('✅ Terhubung ke MySQL (XAMPP)');
});

// =====================
// ROUTES
// =====================

// Test route
app.get('/', (req, res) => {
    res.send('Server Node.js + XAMPP aktif!');
});

// Contoh: endpoint notifikasi
// app.get('/notifikasi', (req, res) => {
//     res.json([
//         { id: 1, title: 'Notif 1', pesan: 'Detak jantung tinggi, periksa segera!', date:'18-10-2025' },
//         { id: 2, title: 'Notif 2', pesan: 'Terhubung ke perangkat Omron', date:'17-10-2025' },
//     ]);
// });

// ---------------------
// CRUD: LANSIA
// ---------------------

// GET semua lansia
app.get('/lansia', (req, res) => {
    db.query('SELECT * FROM lansia', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// POST tambah lansia
app.post('/lansia', (req, res) => {
    const { name, phone_number, password, address } = req.body;
    db.query(
        'INSERT INTO lansia (name, phone_number, password, address) VALUES (?, ?, ?, ?)',
        [name, phone_number, password, address],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Lansia ditambahkan', id: result.insertId });
        }
    );
});

// PUT update lansia
app.put('/lansia/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone_number, password, address } = req.body;
    db.query(
        'UPDATE lansia SET name=?, phone_number=?, password=?, address=? WHERE id=?',
        [name, phone_number, password, address, id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Lansia diperbarui' });
        }
    );
});
// DELETE lansia
app.delete('/lansia/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM lansia WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Lansia dihapus' });
    });
});

// ---------------------
// CRUD: SPO2
// ---------------------

app.get('/spo2', (req, res) => {
    db.query('SELECT * FROM spo2', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

app.post('/spo2', (req, res) => {
    const { lansia_id, nilai } = req.body;
    db.query(
        'INSERT INTO spo2 (lansia_id, nilai) VALUES (?, ?)',
        [lansia_id, nilai],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Data SpO2 ditambahkan', id: result.insertId });
        }
    );
});

// ---------------------
// CRUD: Detak Jantung
// ---------------------

app.get('/detak-jantung', (req, res) => {
    db.query('SELECT * FROM detak_jantung', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

app.post('/detak-jantung', (req, res) => {
    const { lansia_id, nilai } = req.body;
    db.query(
        'INSERT INTO detak_jantung (lansia_id, nilai) VALUES (?, ?)',
        [lansia_id, nilai],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Data detak jantung ditambahkan', id: result.insertId });
        }
    );
});

// ---------------------
// CRUD: Notifikasi
// ---------------------

app.get('/notifikasi', (req, res) => {
    db.query('SELECT * FROM notifikasi', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

app.post('/notifikasi', (req, res) => {
    const { lansia_id, title, deskripsi } = req.body;
    db.query(
        'INSERT INTO notifikasi (lansia_id, title, deskripsi) VALUES (?, ?, ?)',
        [lansia_id, title, deskripsi],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Notifikasi ditambahkan', id: result.insertId });
        }
    );
});

app.delete('/notifikasi/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM notifikasi WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Notifikasi dihapus' });
    });
});




app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Akses jaringan: http://192.168.18.210:${PORT}`); 
});