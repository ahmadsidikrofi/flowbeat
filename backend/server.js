const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

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

const bcrypt = require('bcryptjs'); //untuk autentikasi
const jwt = require('jsonwebtoken');

const verifyToken = require('./middleware/auth'); //menggunakan middleware

// =====================
// ROUTES
// =====================

// Test route
app.get('/', (req, res) => {
    res.send('Server Node.js + XAMPP aktif!');
});

// =====================
// AUTENTIKASI: REGISTER
// =====================
app.post('/register', async (req, res) => {
    try {
        const { name, phone_number, password, address } = req.body;
        if (!name || !phone_number || !password || !address) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        // Cek apakah nomor hp sudah terdaftar
        db.query('SELECT * FROM lansia WHERE phone_number = ?', [phone_number], async (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length > 0) {
                return res.status(400).json({ message: 'Nomor handphone sudah terdaftar.' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Simpan ke database
            db.query(
                'INSERT INTO lansia (name, phone_number, password, address) VALUES (?, ?, ?, ?)',
                [name, phone_number, hashedPassword, address],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err });
                    res.json({ message: 'Registrasi berhasil.', id: result.insertId });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error });
    }
});

// =====================
// AUTENTIKASI: LOGIN
// =====================
app.post('/login', (req, res) => {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
        return res.status(400).json({ message: 'Nomor handphone dan password wajib diisi.' });
    }

    db.query('SELECT * FROM lansia WHERE phone_number = ?', [phone_number], async (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(401).json({ message: 'Nomor handphone tidak ditemukan.' });

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return res.status(401).json({ message: 'Password salah.' });

        // Buat token JWT
        const token = jwt.sign(
            { id: user.id, phone_number: user.phone_number },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                name: user.name,
                phone_number: user.phone_number,
                address: user.address
            }
        });
    });
});



// ---------------------
// CRUD: LANSIA
// ---------------------

// GET semua lansia
app.get('/lansia', verifyToken, (req, res) => { //tambahan verifyToken
    db.query('SELECT * FROM lansia', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// READ - Lansia by ID
app.get('/lansia/:id', verifyToken, (req, res) => {
    const sql = 'SELECT * FROM lansia WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
        res.json(result[0]);
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
// DELETE - Lansia (dengan peringatan & pengecekan relasi)
app.delete('/lansia/:id', (req, res) => {
    const lansiaId = req.params.id;

    // Cek apakah ada data terkait di tabel lain
    const checkRelations = `
        SELECT 
        (SELECT COUNT(*) FROM detak_jantung WHERE lansia_id = ?) AS detak_count,
        (SELECT COUNT(*) FROM spo2 WHERE lansia_id = ?) AS spo2_count,
        (SELECT COUNT(*) FROM notifikasi WHERE lansia_id = ?) AS notif_count
    `;

    db.query(checkRelations, [lansiaId, lansiaId, lansiaId], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        const { detak_count, spo2_count, notif_count } = results[0];
        const totalRelations = detak_count + spo2_count + notif_count;

        if (totalRelations > 0) {
        return res.status(400).json({
            message: 'Tidak dapat menghapus data lansia ini karena masih memiliki data terkait di tabel lain.',
            detail: { detak_count, spo2_count, notif_count }
        });
        }

        // Jika aman untuk dihapus
        const sql = 'DELETE FROM lansia WHERE id = ?';
        db.query(sql, [lansiaId], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
        res.json({ message: 'Data lansia berhasil dihapus' });
        });
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

app.get('/spo-2', (req, res) => {
    const sql = `
        SELECT s.*, l.name AS nama_lansia 
        FROM spo2 s
        JOIN lansia l ON s.lansia_id = l.id
        ORDER BY s.created_at DESC
    `;
    db.query(sql, (err, results) => {
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

// GET semua detak_jantung
app.get('/detak_jantung', (req, res) => {
    const sql = `
        SELECT dj.*, l.name AS nama_lansia 
        FROM detak_jantung dj
        JOIN lansia l ON dj.lansia_id = l.id
        ORDER BY dj.created_at DESC
    `;
    db.query(sql, (err, results) => {
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

app.get('/notif', (req, res) => {
    const sql = `
        SELECT n.*, l.name AS nama_lansia 
        FROM notifikasi n
        JOIN lansia l ON n.lansia_id = l.id
        ORDER BY n.created_at DESC
    `;
    db.query(sql, (err, results) => {
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




const HOST = process.env.HOST;
const PORT = process.env.PORT;
const IP_PUBLIC = process.env.IP_PUBLIC;

app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Akses jaringan: http://${IP_PUBLIC}:${PORT}`);
});
