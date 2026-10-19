// import http from 'k6/http';
// import { check } from 'k6';

// const TOKEN = '1|f6rrdYmTevwWENutNEWumtuHcxUnvOQmkdF9cMYZ40b216ea';

// export const options = {
//   vus: 10,          // jumlah pengguna virtual bersamaan
//   duration: '30s',  // lama pengujian
// };

// export default function () {
//   // waktu dibuat unik agar tiap kiriman tersimpan, bukan terdeteksi duplikat
//   const detik = (__VU * 1000 + __ITER) % 59;
//   const waktu = '2026-01-01 10:00:' + String(detik).padStart(2, '0');

//   const payload = JSON.stringify({
//     mac_address: 'FA:E4:FA:F7:F7:AC',
//     records: [[
//       { sys: 120, dia: 80, bpm: 75, datetime: waktu }
//     ]],
//   });

//   const res = http.post('http://127.0.0.1:8080/api/v1/ingest', payload, {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${TOKEN}`,
//     },
//   });

//   check(res, {
//     'status 200': (r) => r.status === 200,
//   });
// }

// import http from 'k6/http';
// import { check } from 'k6';

// export const options = {
//   vus: 100,          // jumlah pengguna virtual bersamaan
//   duration: '30s',  // lama pengujian
// };

// export default function () {
//   // waktu dibuat unik agar tiap kiriman tersimpan, bukan terdeteksi duplikat
//   const detik = (__VU * 1000 + __ITER) % 59;
//   const waktu = '2026-01-01 10:00:' + String(detik).padStart(2, '0');

//   const payload = JSON.stringify({
//     mac_address: 'FA:E4:FA:F7:F7:AC',
//     records: [[
//       { sys: 120, dia: 80, bpm: 75, datetime: waktu }
//     ]],
//   });

//   const res = http.post('http://127.0.0.1:8080/api/v1/ingest', payload, {
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//     },
//   });

//   check(res, {
//     'sukses 200 atau 201': (r) => r.status === 200 || r.status === 201,
//   });
// }


import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,          // jumlah pengguna virtual bersamaan
  duration: '30s',  // lama pengujian
};

// Tempel token dari hasil login di sini, di antara tanda petik
const TOKEN = '1|UcPk0XuMwsxjwm7pbFL9VrCuRNNNkNPo0DO5qkeidc1933c4';

export default function () {
  // waktu dibuat unik agar tiap kiriman tersimpan, bukan terdeteksi duplikat
  const detik = (__VU * 1000 + __ITER) % 59;
  const waktu = '2026-01-01 10:00:' + String(detik).padStart(2, '0');

  const payload = JSON.stringify({
    mac_address: 'FA:E4:FA:F7:F7:AC',
    records: [[
      { sys: 120, dia: 80, bpm: 75, datetime: waktu }
    ]],
  });

  const res = http.post('http://127.0.0.1:8080/api/v1/ingest', payload, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  });

  check(res, {
    'sukses 200 atau 201': (r) => r.status === 200 || r.status === 201,
  });
  // tambahan sementara untuk melihat status yang muncul
console.log('status: ' + res.status);
}