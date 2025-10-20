instalasi node:
npm init -y

Install Express.js
npm install express mysql2 cors body-parser

cors agar aplikasi React Native bisa akses API kamu.
body-parser untuk membaca data JSON dari request.

runcode: node server.js  

agar link apinya bisa diakses di hp, harus pakai IPv4 pc kita


code sql
CREATE TABLE lansia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  password VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE spo2 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lansia_id INT NOT NULL,
  nilai FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lansia_id) REFERENCES lansia(id)
);
CREATE TABLE detak_jantung (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lansia_id INT NOT NULL,
  nilai INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lansia_id) REFERENCES lansia(id)
);

Manual seeder jalankan dengan : node seeder.js

Library Seeder KnexJs
nstall Knex:
npm install knex mysql2
npx knex init

Buat file seeder (nama file tidak harus sama dengan tabel)
npx knex seed:make seed_lansia
namun, sesuaikan await knex('table_name') dengan nama table (Harus sama)

konfigurasi knexjs mysql:
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      port: 7000, // atau 3306 jika default XAMPP
      user: 'root',
      password: '',
      database: 'flowbeat'
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};

table yang tidak ada foreignkey bisa dengan seeder file terpisah tapi kalau ada foreign key dijadikan 1 file seeder saja

running knexjs: npx knex seed:run