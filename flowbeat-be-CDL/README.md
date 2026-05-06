# [FlowBeat]

Project ini digunakan untuk memenuhi pelaksanaan dari Tugas Akhir pembuatan Dashboard Monitoring Pasien Berpenyakit Jantung

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
