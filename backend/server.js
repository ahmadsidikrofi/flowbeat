const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

// Konfigurasi koneksi ke MySQL dengan env
const dotenv = require('dotenv');
dotenv.config();

const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const bcrypt = require('bcryptjs'); //untuk autentikasi
const jwt = require('jsonwebtoken'); //untuk autentikasi

const multer = require('multer'); //untuk update akun
const fs = require('fs');

//port dengan env (tidak hardcode)
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const IP_PUBLIC = process.env.IP_PUBLIC;


//KONEKSI DATABASE
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// CEK KONEKSI DB
db.connect(err => {
    if (err) {
        console.error('Gagal konek ke MySQL:', err);
        return;
    }
    console.log('✅ Terhubung ke MySQL (XAMPP)');
});


const verifyToken = require('./middleware/auth'); //menggunakan middleware
const JWT_SECRET = process.env.JWT_SECRET;



// =====================
// Test ROUTES
// =====================
app.get('/', (req, res) => {
    res.send('Server Node.js + XAMPP aktif!');
});

// =====================
// AUTENTIKASI dgn React Native
// =====================

// REGISTER
app.post('/api/register', async (req, res) => {
    const { name, phone_number, password, address } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const defaultPhoto = 'default-avatar-profile.jpg';

    const sql = `
        INSERT INTO lansia (name, phone_number, password, address, photo)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [name, phone_number, hashed, address, defaultPhoto], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Akun berhasil dibuat', id: result.insertId });
    });
});

// LOGIN
app.post('/api/login', (req, res) => {
    // console.log('Body login diterima:', req.body);

    // Terima keduanya: phone atau phone_number
    const phone_number = req.body.phone_number || req.body.phone;
    const { password } = req.body;

    if (!phone_number || !password) {
        return res.status(400).json({ message: 'Nomor handphone dan password wajib diisi.' });
    }

    db.query('SELECT * FROM lansia WHERE phone_number = ?', [phone_number], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'User tidak ditemukan' });

        const user = results[0];
        try {
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ message: 'Password salah' });

            const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
            return res.json({
                message: 'Login berhasil',
                token,
                lansia: {
                    id: user.id,
                    name: user.name,
                    phone_number: user.phone_number,
                    address: user.address
                }
            });
        } catch (e) {
            console.error('Error bcrypt.compare:', e);
            return res.status(500).json({ message: 'Terjadi kesalahan saat verifikasi password' });
        }
    });
});

// =====================
// GET data-data home
// =====================
app.get('/api/home', verifyToken, (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT 
            l.name, 
            l.photo,
            (SELECT nilai FROM detak_jantung WHERE lansia_id = l.id ORDER BY created_at DESC LIMIT 1) AS bpm,
            (SELECT nilai FROM spo2 WHERE lansia_id = l.id ORDER BY created_at DESC LIMIT 1) AS spo2
        FROM lansia l WHERE l.id = ?`;
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = result[0];

        // ✅ Tambahkan path relatif (jika ada foto)
        if (user.photo) {
        user.photo = `images/${user.photo}`;
        }

        res.json(user);
    });
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// =====================
// GET Akun
// =====================
app.get('/api/akun', verifyToken, (req, res) => {
    const userId = req.user.id;
    const sql=`SELECT name, phone_number, address, photo FROM lansia WHERE id = ?`;
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = result[0];

        // ✅ Tambahkan path relatif (jika ada foto)
        if (user.photo) {
        user.photo = `images/${user.photo}`;
        }

        res.json(user);
    });
});

// =====================
// KONFIGURASI UPLOAD FOTO
// =====================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'images');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

// =====================
// Update Profil
// =====================
app.put('/api/edit-profile', verifyToken, upload.single('photo'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone_number, password, address } = req.body;
        const photo = req.file ? req.file.filename : null;

        // Buat query dinamis (jika password dikosongkan, jangan update)
        let sql = 'UPDATE lansia SET name = ?, phone_number = ?, address = ?';
        const params = [name, phone_number, address];

        if (photo) {
        sql += ', photo = ?';
        params.push(photo);
        }

        if (password && password.trim() !== '') {
        const hashed = await bcrypt.hash(password, 10);
        sql += ', password = ?';
        params.push(hashed);
        }

        sql += ' WHERE id = ?';
        params.push(userId);

        db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profil berhasil diperbarui' });
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Gagal memperbarui profil' });
    }
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
//sudah digantikan dengan /regist

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


app.get('/notifikasi', verifyToken, (req, res) => {
    const userId = req.user.id;
    const sql = 'SELECT * FROM notifikasi WHERE lansia_id = ? ORDER BY created_at DESC';
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
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


app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Akses jaringan: http://${IP_PUBLIC}:${PORT}`);
});
