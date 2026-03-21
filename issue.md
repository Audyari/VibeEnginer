# Implementasi Fitur Login User

**Tujuan:**
Mengimplementasikan fitur autentikasi (login) pengguna. Tugas ini mencakup pembuatan tabel `sessions` di database, logika pengecekan email dan pencocokan password bcrypt (service), pembuatan token untuk representasi sesi pengguna, dan ekspos endpoint API menggunakan framework Elysia JS.

---

## 1. Persiapan Database (Tabel Sessions)
Buat skema atau jalankan skrip migrasi untuk membikin tabel `sessions` di database dengan spesifikasi berikut:

- `id` : `integer`, Primary Key, Auto Increment
- `token` : `varchar(255)`, Not Null *(Catatan: Diisi dengan UUID unik yang digenerate oleh backend saat operasi login berhasil)*
- `user_id` : `integer`, Foreign Key yang mereferensikan kolom `id` di tabel `users`
- `created_at` : `timestamp`, Default `CURRENT_TIMESTAMP`

---

## 2. Struktur Direktori dan File
Tambahkan kode pengerjaan fitur ini pada file yang sudah ada dari fitur registrasi di dalam folder `src/`:

- `src/services/users-services.ts` : Tambahkan logika fungsi login, validasi password, generasi UUID, serta insert parameter sesi ke database di file ini.
- `src/Router/users-route.ts` : Tambahkan spesifikasi HTTP *route/endpoint* Elysia JS baru untuk login di sini.

---

## 3. Langkah-langkah Implementasi

### Tahap 1: Membuat Logika Service (`src/services/users-services.ts`)
Sediakan satu fungsi (misalnya `loginUser`) yang menjalankan alur pemrosesan ini:
1. Menerima input: `email` dan `password` (berupa un-hashed text dari user).
2. Lakukan query pencarian ke tabel `users` berdasarkan nilai `email`.
   - Jika data tidak ditemukan di database, segera batalkan proses dan kembalikan *error* validasi.
3. Bila data `email` ditemukan, gunakan *library* seperti `bcrypt` untuk melakukan proses komparasi (*compare*) nilai `password` inputan dengan nilai *hashed password* yang didapat dari tabel `users`.
   - Jika passsword **tidak cocok / invalid**, segera batalkan proses dan kembalikan *error*.
4. Jika kata sandi cocok, buat kombinasi nilai UUID v4 secara acak yang akan bertindak sebagai `token`.
5. Masukkan data row ke tabel `sessions` untuk memulai pencatatan login. Simpan (`token` UUID dan `user_id` dari objek user) masing-masing ke kolom yang relevan.
6. Kembalikan / *return* data berupa nilai string `token` tersebut.

### Tahap 2: Menyiapkan Endpoint / Route API (`src/Router/users-route.ts`)
Definisikan endpoint login Elysia JS di dalam file router.

**Spesifikasi Endpoint:**
- **Method:** `POST`
- **Path:** `/api/users/login`

**Request Body yang Dibutuhkan untuk Login (Format JSON):**
```json
{
    "email": "audy123ari@gmail.com",
    "password": "rahasia"
}
```

**Alur dalam Route Handler:**
1. Lakukan ekstraksi body JSON atas key `email` dan `password`. Opsional: perketat via validasi schema type T Elysia.
2. Teruskan data nilai ekstraksi tersebut untuk memanggil operasional service `loginUser` yang disiapkan di Tahap 1.
3. Terjemahkan balikan objek *exception* service maupun objek sukses kembalian token ke standar return JSON.

**Format Response Berhasil (Status HTTP 200):**
```json
{
    "Data": "nilai-token-uuid-di-sini"
}
```

**Format Response Gagal (Status HTTP 400/401):**
*(Gunakan satu response error general baik saat kendala email tidak dikenal maupun saat kecocokan sandi luput)*
```json
{
    "Error": "Email atau password salah"
}
```

---

## 4. Pengujian (Testing)
Validasi finalisasi fitur ini melalui Postman, cURL, atau alat sejenis:
1. **Sukses:** Operasikan request ke `/api/users/login` pakai akun yang telah diregistrasi. Evaluasi status kembalian nilai "token" berjenis JSON sesuai kriteria di atas, lalu buktikan database tabel log `sessions` membukukan baris baru hasil dari request ini.
2. **Gagal (Email atau Sandi salah):** Lakukan eksekusi API memakai e-mail atau password sembarang. Pastikan API secara tegas mengembalikan galat identik seperti `"Error": "Email atau password salah"`.
