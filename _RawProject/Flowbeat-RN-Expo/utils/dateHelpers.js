/**
 * Menghitung umur dari tanggal lahir.
 * @param {string|Date} tanggalLahir - Tanggal lahir (ISO string atau Date object)
 * @returns {number} Umur dalam tahun
 */
export function hitungUmur(tanggalLahir) {
  if (!tanggalLahir) return 0;
  const birthDate = new Date(tanggalLahir);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Format tanggal ke format tampilan Indonesia (DD/MM/YYYY).
 * @param {string|Date} date - Tanggal
 * @returns {string} Tanggal dalam format DD/MM/YYYY
 */
export function formatTanggal(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Parse string DD/MM/YYYY menjadi Date object.
 * @param {string} dateStr - Tanggal dalam format DD/MM/YYYY
 * @returns {Date|null} Date object atau null jika invalid
 */
export function parseTanggal(dateStr) {
  if (!dateStr || dateStr.length !== 10) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > new Date().getFullYear()) return null;

  const date = new Date(year, month - 1, day);
  // Verify the date is valid (e.g., not Feb 30)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return null;
  }
  // Must not be in the future
  if (date > new Date()) return null;

  return date;
}

/**
 * Auto-format input menjadi DD/MM/YYYY saat user mengetik.
 * @param {string} text - Raw input text
 * @param {string} prevText - Previous text value
 * @returns {string} Formatted text
 */
export function formatDateInput(text, prevText) {
  // Only allow digits and slashes
  const cleaned = text.replace(/[^0-9/]/g, '');

  // Remove all slashes to work with raw digits
  const digits = cleaned.replace(/\//g, '');

  // Limit to 8 digits (DDMMYYYY)
  const limited = digits.slice(0, 8);

  // Auto-insert slashes
  let result = '';
  for (let i = 0; i < limited.length; i++) {
    if (i === 2 || i === 4) result += '/';
    result += limited[i];
  }

  return result;
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const NAMA_HARI_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const NAMA_HARI_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function formatMonthYear(dateVal) {
  if (!dateVal) return 'Lainnya';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Lainnya';
  return `${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(dateVal) {
  if (!dateVal) return '--';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '--';
  const hari = NAMA_HARI_SHORT[d.getDay()];
  const tgl = String(d.getDate()).padStart(2, '0');
  return `${hari}, ${tgl}`;
}

export function formatTimeShort(dateVal) {
  if (!dateVal) return '--';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '--';
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');
  return `${jam}.${menit}`;
}

export function formatDateFull(dateVal) {
  if (!dateVal) return '--';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '--';
  const hari = NAMA_HARI_FULL[d.getDay()];
  const tgl = d.getDate();
  const bulan = NAMA_BULAN[d.getMonth()];
  const thn = d.getFullYear();
  return `${hari}, ${tgl} ${bulan} ${thn}`;
}
