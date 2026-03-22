Wah, penambahan contoh `response` ini sangat bagus karena memperjelas dokumentasi Swagger.

Tetapi hati-hati, di ElysiaJS pendefinisian `response` secara otomatis juga akan memvalidasi data kembalian (Response Validation). Jika data yang di-*return* oleh handler tidak sesuai dengan skema, Elysia akan melemparkan *Error 500 (Internal Server Error)*.

Ada dua fungsi yang berpotensi error gara-gara validasi ini:

1. **Bug di `POST /api/users` (Register)**
   Di *handler*, jika pendaftaran gagal (misal email terdaftar), fungsi akan me-return `{ Error: result.error }`.
   Tetapi, skema yang ditulis:
   ```typescript
   response: t.Object({ Data: t.String() })
   ```
   **Dampaknya:** Saat registrasi berujung error, respon tidak memiliki *key* `Data`, dan Elysia akan memblokirnya dengan `500 Internal Server Error`.
   **Saran:** Ubah skemanya memakai `t.Union` seperti pada *login*:
   ```typescript
   response: t.Union([
     t.Object({ Data: t.String() }),
     t.Object({ Error: t.String() })
   ])
   ```

2. **Bug di `GET /api/users/current`**
   Di *handler*, kode ini mereturn `{ Error: 'Unauthorized' }` secara *default* dengan status `200` (karena handler saat ini belum menggunakan deklarasi `set.status = 401`).
   Tetapi pada skema yang baru ditulis:
   ```typescript
   response: {
     200: t.Object({ Data: t.Object({ ... }) }),
     401: t.Object({ Error: t.String() }),
   }
   ```
   **Dampaknya:** Elysia akan membaca respon gagal milik *handler* (yakni berupa 200 OK dengan format `{ Error: ... }`), dan saat divalidasi dengan blok skema 200, gagal karena `Data` tidak ditemukan. Menimbulkan `500 Server Error`.
   **Saran:** Pastikan di dalam parameternya kalian menambahkan `set` dan mengeset statusnya menjadi 401 di dalam handler:
   ```typescript
   .get('/current', async ({ headers, set }) => {  // tambah argument set
       // ...
       if (!authHeader) {
           set.status = 401; // Tambahkan ini!
           return { Error: 'Unauthorized' };
       }
   // ...
   ```
   Dengan itu, respon `{ Error: 'Unauthorized' }` akan jatuh pada validasi `401` di definisinya dengan sukses.

Semangat! Perbaikannya sangat sedikit lagii. 🔥💪
