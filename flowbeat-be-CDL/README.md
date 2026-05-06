# [FlowBeat]

Proyek ini dikembangkan sebagai bagian dari pelaksanaan Tugas Akhir yang berfokus pada pembuatan Dashboard Monitoring untuk pasien berpenyakit jantung. Sistem ini memungkinkan tenaga medis untuk memantau data kesehatan pasien secara terpusat melalui dashboard berbasis web.

Salah satu komponen utama dalam proyek ini adalah penerapan Control Delay Layer (CDL), yaitu sebuah lapisan tambahan dalam arsitektur sistem yang berfungsi untuk mengatur interval pengiriman data dari perangkat ke server. Dalam skenario Remote Patient Monitoring (RPM), data sensor cenderung dikirim secara terus-menerus dalam frekuensi tinggi, yang berpotensi menyebabkan overload pada server dan menurunkan performa sistem.

CDL hadir sebagai mekanisme kontrol yang memungkinkan pengaturan jeda (delay) dalam proses transmisi data. Dengan pendekatan ini, sistem tidak hanya mampu mengurangi lonjakan request ke server, tetapi juga menjaga kestabilan performa serta efisiensi pengelolaan data. Selain itu, CDL dirancang agar fleksibel, sehingga interval pengiriman data dapat disesuaikan berdasarkan kebutuhan monitoring, baik secara real-time maupun berkala.

> **Warning**
> This project is still in development and is not ready for production use.
>
> 
## Tech Stack 💻

- **Back-end:** [Laravel](https://laravel.com/)
- **Front-end (Mobile):** [React native](https://reactnative.dev/)
- **Front-end (Web):** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Database:** [Mysql](https://www.mysql.com)

Easy step to run locally

1. Install Composer

   ```bash
   Composer install
   ```

2. Copy the `.env.example` to `.env` and update the variables.

   ```bash
   cp .env.example .env
   ```

3. Generate key for `.env`

   ```bash
   php artisan key:generate
   ```
   
4. Push the database locally

   ```bash
   php artisan migrate
   ```
   
5. Start the server

   ```bash
   php artisan serve
   ```

## License

Licensed under the MIT License. Check the [LICENSE](./LICENSE) file for details.
