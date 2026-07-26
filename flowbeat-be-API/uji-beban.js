import http from 'k6/http';
import { check } from 'k6';
 
export const options = {
  vus: 10,          // jumlah pengguna virtual bersamaan
  duration: '30s',  // lama pengujian
};
 
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
    headers: { 'Content-Type': 'application/json' },
  });
 
  check(res, {
    'status 200': (r) => r.status === 200,
  });
}
