import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'AppConfig';

// Default values — dipakai jika belum ada setting yang disimpan
const DEFAULTS = {
    BASE_URL: "https://rpms.gilangramadhani.tech",
    DASHBOARD_API_URL: "https://rpms.gilangramadhani.tech",
    DEVICE_MAC: "00:5F:BF:1B:AF:01",
    DEVICE_NAME: "HEM-7155T",
};

// Runtime config — dimulai dari defaults, lalu ditimpa oleh saved values
const Config = { ...DEFAULTS };

/**
 * Load config dari AsyncStorage (dipanggil saat app start).
 * Mengembalikan config yang sudah di-merge.
 */
Config.load = async () => {
    try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(Config, parsed);
        }
    } catch (err) {
        console.log('Error loading config:', err);
    }
    return Config;
};

/**
 * Simpan config ke AsyncStorage.
 * @param {object} newValues — key-value yang ingin diubah, contoh: { BASE_URL: "http://..." }
 */
Config.save = async (newValues) => {
    try {
        Object.assign(Config, newValues);
        // Simpan hanya field config, bukan fungsi
        const toSave = {
            BASE_URL: Config.BASE_URL,
            DASHBOARD_API_URL: Config.DASHBOARD_API_URL,
            DEVICE_MAC: Config.DEVICE_MAC,
            DEVICE_NAME: Config.DEVICE_NAME,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
        console.log('Error saving config:', err);
    }
};

/**
 * Reset config ke nilai default.
 */
Config.reset = async () => {
    try {
        Object.assign(Config, DEFAULTS);
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.log('Error resetting config:', err);
    }
};

/** Ambil defaults untuk ditampilkan di UI */
Config.DEFAULTS = DEFAULTS;

export default Config;