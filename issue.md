# Implementasi Fitur Registrasi User

**Tujuan:**
Mengimplementasikan fitur pendaftaran (registrasi) pengguna baru melalui REST API. Tugas ini mencakup pembuatan skema database, logika penanganan data (service), dan routing API menggunakan framework Elysia JS.

---

## 1. Persiapan Database (Tabel Users)

Buat skema atau jalankan migrasi database untuk membuat tabel `users` dengan spesifikasi kolom berikut:

- `id` : `integer`, Primary Key, Auto Increment
- `name` : `varchar(255)`, Not Null
- `email` : `varchar(255)`, Not Null, **Unique**
- `password` : `varchar(255)`, Not Null *(Catatan: Harus divalidasi dan disimpan dalam bentuk hash menggunakan **bcrypt**)*
- `created_at` : `timestamp`, Default `CURRENT_TIMESTAMP`

---

## 2. Struktur Direktori dan File

Kita menggunakan pemisahan tanggung jawab (Separation of Concerns). Pekerjaan akan dibagi ke dalam dua direktori utama di dalam folder `src/`:

- `src/services/` : Berisi logika bisnis, hashing password, dan query ke database.
- `src/Router/` : Berisi definisi endpoint Elysia JS dan validasi input (request handling).

**File yang harus dibuat:**
1. `src/services/users-services.ts`
2. `src/Router/users-route.ts`

---

## 3. Langkah-langkah Implementasi

### Tahap 1: Membuat Service layer (`src/services/users-services.ts`)
Di file ini, buat sebuah fungsi (misalnya `registerUser`) yang bertugas:
1. Menerima payload/parameter: `name`, `email`, dan `password` (plain text dari user).
2. Mengecek ke database apakah user dengan `email` tersebut sudah terdaftar.
   - Jika sudah terdaftar: kembalikan *error* / status gagal.
3. Jika belum terdaftar, lakukan *hashing* pada `password` menggunakan algoritma `bcrypt`.
4. Simpan data (`name`, `email`, dan *hashed password*) ke dalam tabel `users`.
5. Kembalikan response berhasil ke pemanggil fungsi.

### Tahap 2: Membuat Router API (`src/Router/users-route.ts`)
Di file ini, definisikan endpoint Elysia JS yang akan menangani HTTP request.

**Spesifikasi Endpoint:**
- **Method:** `POST`
- **Path:** `/api/users`

**Request Body yang Diharapkan (JSON):**
```json
{
    "name": "AudyariW",
    "email": "audy123ari@gmail.com",
    "password": "rahasia"
}
```

**Alur dalam Router:**
1. Ekstraksi dan (opsional) validasi body request untuk memastikan properti `name`, `email`, dan `password` terisi dengan benar.
2. Panggil fungsi service `registerUser` (yang dibuat di Tahap 1) dengan meneruskan data dari request body.
3. Evaluasi balikan dari service dan kirimkan response ke client.

**Response Berhasil (Status HTTP 200/201):**
```json
{
    "Data": "OK"
}
```

**Response Gagal / Email Duplikat (Status HTTP 400):**
```json
{
    "Error": "Email Sudah Terdaftar"
}
```

### Tahap 3: Mendaftarkan Route
Setelah `users-route.ts` selesai dibuat, pastikan route Elysia tersebut didaftarkan/di-import di file entri utama aplikasi (misalnya `src/index.ts` atau `main.ts`) agar endpoint `/api/users` bisa diakses melalui jaringan.

---

## 4. Pengujian (Testing)
Setelah selesai, lakukan pengujian (bisa menggunakan curl, Postman, atau Bruno) untuk dua skenario utama:
1. **Skenario Sukses:** Kirim payload dengan email yang belum ada, dan pastikan mendapat JSON balasan `{"Data": "OK"}` serta data password tersimpan secara *hashed* di database.
2. **Skenario Gagal:** Kirim payload dengan email yang sama dengan pengujian pertama. Pastikan API mengembalikan JSON balasan `{"Error": "Email Sudah Terdaftar"}` (dan data kedua tidak masuk ke tabel).
