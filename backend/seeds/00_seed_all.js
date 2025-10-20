/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('detak_jantung').truncate();
  await knex('spo2').truncate();
  await knex('notifikasi').truncate();
  await knex('lansia').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // LANSIA
  await knex('lansia').insert([
    {
      id: 1,
      name: 'Santoso Budi',
      phone_number: '081234567890',
      password: 'hashedpass1',
      address: 'Jl. Merdeka No.1'
    },
    {
      id: 2,
      name: 'Aminah Amira',
      phone_number: '082345678901',
      password: 'hashedpass2',
      address: 'Jl. Mawar No.2'
    }
  ]);

  //bpm
  await knex('detak_jantung').insert([
    { id: 1, lansia_id: 1, nilai: 88 },
    { id: 2, lansia_id: 2, nilai: 102 }
  ]);

  //spo2
  await knex('spo2').insert([
    { id: 1, lansia_id: 1, nilai: 97.5 },
    { id: 2, lansia_id: 2, nilai: 95.2 }
  ]);

  //notif
  await knex('notifikasi').insert([
    {
      id: 1,
      lansia_id: 1,
      title: 'Peringatan Detak Jantung',
      deskripsi: 'Detak jantung melebihi batas normal'
    },
    {
      id: 2,
      lansia_id: 2,
      title: 'Koneksi Perangkat',
      deskripsi: 'Perangkat Omron berhasil terhubung'
    }
  ]);
};
