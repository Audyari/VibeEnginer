# VibeEnginer Backend API

VibeEnginer adalah backend REST API modern, super cepat, dan aman yang dibangun menggunakan ekosistem terbaru Javascript/Typescript. Aplikasi ini berfungsi untuk mengelola data user, autentikasi melalui token _session_, dan penyajian data layanan lainnya. Dirancang agar modular, mudah dites, dan didokumentasikan dengan baik melalui integrasi Swagger.

## 🚀 Teknologi Stack & Library
Proyek ini ditenagai oleh _tech stack_ modern berikut:
- **Runtime:** [Bun](https://bun.sh/) - Javascript runtime super cepat dan _all-in-one toolkit_.
- **Framework:** [ElysiaJS](https://elysiajs.com/) - Web framework tercepat untuk Bun.
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM minimalis dan _type-safe_.
- **Database:** SQLite via [LibSQL](https://turso.tech/libsql) client.
- **Validasi:** Elysia _built-in_ `t.Object` (berbasis TypeBox).
- **Keamanan:**
  - `bcryptjs`: Digunakan untuk melakukan *hashing* pada *password* user.
  - `uuid`: Generate session token (UUID v4) untuk autentikasi sesi user.
- **Dokumentasi API:** `@elysiajs/swagger` - Menyediakan Swagger UI.
- **Testing Engine:** `bun:test` - *Test runner* bawaan dari Bun.

---

## 📁 Arsitektur Direktori (Struktur File)
Aplikasi ini memakai pola standar _layered architecture_ yang memisahkan antara bagian *routing*, *business logic (services)*, dan interaksi *database*.

```text
vibeenginer/
├── src/
│   ├── config/       # (Opsional) Konfigurasi environment & aplikasi
│   ├── db/           # File koneksi DB, skema (schema.ts), dan seeder
│   ├── Router/       # Definisi Endpoint API (controller/router) (Contoh: users-route.ts)
│   ├── services/     # Business logic & interaksi DB (Contoh: users-services.ts)
│   └── index.ts      # Entry point utama aplikasi
├── test/             # Skrip unit testing & integration testing (Contoh: api.test.ts)
├── package.json      # Daftar dependency & script eksekusi
└── README.md         # Dokumentasi 
```
- **Penamaan File:** File direpresentasikan menggunakan *kebab-case* (e.g., `users-route.ts`, `users-services.ts`).

---

## 🗄️ Skema Database
Aplikasi ini memiliki 2 buah tabel utama yang didefinisikan pada `src/db/schema.ts`:

### 1. `users`
Menyimpan data pendaftaran dan kredensial.
- `id` (Integer) - *Primary Key*, *Auto Increment*
- `name` (Text) - Nama user (*Not Null*)
- `email` (Text) - Email user (*Not Null, Unique*)
- `password` (Text) - Password terekenkripsi (*Not Null*)
- `createdAt` (Text) - Tanggal terbuat (*Not Null, Default ISO String*)
- `updatedAt` (Text) - Tanggal pembaruan profil user

### 2. `sessions`
Menyimpan sesi login user supaya user tidak perlu login berulang.
- `id` (Integer) - *Primary Key*, *Auto Increment*
- `token` (Text) - Token keamanan berbentuk UUID (*Not Null*)
- `userId` (Integer) - Relasi ke tabel `users.id` (*Foreign Key*, *Not Null*)
- `createdAt` (Text) - Waktu sesi login dibuat (*Not Null, Default ISO String*)

---

## 🌍 API yang Tersedia

Secara *default*, *server* berjalan di **http://localhost:3000**.
List lengkap Endpoint interaktif tersedia di Halaman UI Docs: **`GET /swagger`**

| Endpoint | Method | Keterangan | Autentikasi |
| -------- | ------ | ---------- | ----------- |
| `/` | `GET` | Health check sederhana & informasi API | ❌ |
| `/health` | `GET` | Cek status server | ❌ |
| `/swagger` | `GET` | Halaman Dokumentasi Interaktif (Swagger UI) | ❌ |
| `/api/users` | `GET` | Mengambil semua profil user yang terdaftar | ❌ |
| `/api/users/:id` | `GET` | Mengambil sebuah data spesifik user berdasarkan ID-nya | ❌ |
| `/api/users/current`| `GET` | Mengambil data user yang sedang berhasil _login_ saat ini | ✅ (Header: `Authorization: Bearer <token>`) |
| `/api/users` | `POST` | Mendaftarkan *user* baru (*Register*) | ❌ |
| `/api/users/login` | `POST` | Autentikasi login *user* (Mengeluarkan token/session) | ❌ |
| `/api/users/:id` | `PUT` | Memperbarui profil (Data email/nama, dan secara opsional *password*) | ❌ |
| `/api/users/:id` | `DELETE`| Menghapus spesifik *user* beserta referensi *session*-nya | ❌ |
| `/api/users/logout` | `DELETE`| *Sign-out* / Membatalkan *session* user berdasarkan Token aktif | ✅ (Header: `Authorization: Bearer <token>`) |

---

## 🛠️ Cara Setup Project
Ikuti instruksi berikut untuk menjalankan projek secara lokal di komputer Anda:

1. **Clone repository ini** ke dalam direktori komputer Anda.
2. Akses masuk ke root folder proyek Anda.
3. Install semua *dependencies* menggunakan perintah berikut:
   ```bash
   bun install
   ```
4. Lakukan pembuatan skema ke dalam Drizzle dan lakukan migrasi SQLite DB:
   ```bash
   bun run db:generate
   bun run db:push
   ```
   *(Perintah ini akan secara otomatis memicu Drizzle untuk men-sinkronisasi `src/db/schema.ts` ke dalam file database SQLite Anda).*

---

## 🏃 Cara Menjalankan Aplikasi

Setelah Setup berhasil dilakukan, Anda bisa menyalakan *Server* Backend:

- **Mode Development (Untuk Development agar Auto-Reload aktif):**
  ```bash
  bun run dev
  ```
- **Mode Production:**
  ```bash
  bun run start
  ```
  *(Aplikasi biasanya akan terbuka di http://localhost:3000)*

---

## 🧪 Cara Test Aplikasi

Sistem pengetesan sudah mencakup seluruh integrasi utama layaknya simulasi _Real Client_ ke server menggunakan pustaka bawaan **Bun Test**. Test ini akan secara bersih mengeksekusi *login, logout, registrasi, delete, hingga validasi edge-cases update.*

Untuk menjalankan proses *Unit dan Integration Test* dengan hasil yang komprehensif, jalankan satu script berikut:
```bash
bun test
```
