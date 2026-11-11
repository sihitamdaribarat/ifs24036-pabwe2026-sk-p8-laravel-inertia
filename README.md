# BlogVerse Pro — ifs24036-pabwe2026-sk-p8-laravel-inertia

Platform publikasi artikel multi-tier dengan arsitektur **Clean Architecture & Feature-First**,
dibangun menggunakan **Laravel 13**, **Inertia.js v3**, **React 19**, **PostgreSQL**,
**PhpOffice/PhpSpreadsheet**, **TOAST UI Editor**, dan integrasi **OpenAI**.

## Tingkatan Akses

| Tingkatan | URL | Fitur |
|---|---|---|
| Umum (Guest) | `/`, `/articles`, `/articles/{slug}`, `/login`, `/register` | Galeri artikel publik, pencarian judul/konten, filter kategori, pembaca Markdown (TOAST UI Viewer), Sticky Top Navbar tanpa sidebar, CTA Login/Register di navbar, hero, kartu komunitas & footer. |
| Anggota (Penulis) | `/dashboard/posts`, `/dashboard/posts/{post}`, `/profile` | CRUD artikel milik sendiri (modal Full Screen + TOAST UI Editor), toggle Draf ↔ Published, unggah/hapus foto sampul, ekspor/impor Excel, AI Generator (OpenAI), statistik artikel. |
| Admin | `/admin/users`, `/admin/users/{user}/posts`, `/admin/posts` | Kelola pengguna (cari, ubah peran, hapus), monitoring artikel per-user & seluruh sistem (read-only), ekspor Excel per-user maupun seluruh artikel. |

## Instalasi Lokal

Prasyarat: PHP 8.3+ (ekstensi `pdo_pgsql`, `gd`, `zip`), Composer, Node.js 20+, PostgreSQL.

```bash
psql -U postgres -c "CREATE DATABASE pabwe_p8_blog;"

composer install
cp .env.example .env          # DB_* sudah mengarah ke pabwe_p8_blog (postgres/postgres)
php artisan key:generate
php artisan migrate --seed

npm install
npm run build                 # atau `npm run dev` saat pengembangan
php artisan serve
```

> Pastikan `extension=pdo_pgsql` aktif di `php.ini` (pada XAMPP baris ini default-nya dikomentari).

### Akun Demo (seeder)

| Peran | Username | Password |
|---|---|---|
| Admin | `admin` | `password` |
| Penulis | `penulis` | `password` |

Login dapat menggunakan **username atau email**.

### OpenAI

Isi `OPENAI_API_KEY` di `.env` untuk mengaktifkan AI Generator. Model default `gpt-4o-mini`
(ubah lewat `OPENAI_MODEL`). Tanpa kunci API, generator menampilkan pesan error yang informatif.

### Format Impor Excel

Baris pertama berisi header (tidak peka huruf besar/kecil): **Judul\***, Kategori, Ringkasan, **Konten\***, Status
(`Published`/`Draft`). File hasil ekspor dapat langsung diimpor kembali. Format: `.xlsx`, `.xls`, `.csv`.

## Struktur Kode (Feature-First)

```
app/Features/
├── Admin/    Controllers/AdminUserController, Services/AdminUserService
├── Ai/       Contracts/AiClientInterface, DTO/GeneratedPostItem, Services/OpenAiPostGeneratorService
├── Auth/     Actions/{Login,Register}UserAction, Controllers/AuthController
├── Post/     Contracts/PostRepositoryInterface, Controllers/{Admin,Public,}PostController,
│             Enums/PostCategory, Models/Post, Policies/PostPolicy,
│             Repositories/PostRepository, Services/{PostService,PostExcelService}
└── Profile/  Controllers/ProfileController, Services/ProfileService
app/Http/Middleware/  EnsurePostOwnership, EnsureRole, HandleInertiaRequests
resources/js/         app.jsx, Layouts/, Pages/{Admin,Auth,Post,Profile,Public}/, Components/
```

## Pengujian & Kualitas

```bash
php vendor/bin/phpunit --coverage-text   # butuh pcov/xdebug untuk laporan coverage
composer audit
npm audit
```

- Seluruh pengujian Unit & Feature berjalan pada SQLite in-memory (lihat `phpunit.xml`) dengan
  `failOnWarning`, `failOnNotice`, dan `failOnDeprecation` aktif.
- Target pipeline CI: 100% coverage (lines, methods, elements) untuk direktori `app/`.
- `@toast-ui/editor` 3.2.2 bergantung pada DOMPurify 2.x yang rentan; `package.json` memaksa
  `dompurify@^3.4.17` lewat `overrides`, dan Editor/Viewer memakai `customHTMLSanitizer` berbasis
  DOMPurify terbaru tersebut.
- Seluruh subdirektori `storage/` dipertahankan di git melalui `.gitignore` (`*` + `!.gitignore`).
