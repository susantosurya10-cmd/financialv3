# BukuKas Rupiah — Aplikasi Laporan Keuangan Harian & Rekap Bulanan

Aplikasi web pencatatan keuangan pribadi dan rumah tangga berbasis Rupiah (IDR) tanpa login, dengan input transaksi harian, rekapitulasi statistik bulanan interaktif, custom kategori pengeluaran & pemasukan, penyimpanan otomatis di browser dengan cadangan berkas (Backup & Restore), serta unduh laporan resmi berformat PDF lengkap dengan grafik dan rincian transaksi.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi yang telah Anda pilih:

- **Penyimpanan Data & Akses Multi-Perangkat**: Menggunakan penyimpanan lokal browser (`localStorage`) yang otomatis tersimpan setiap ada penambahan atau pengubahan data, dilengkapi fitur **Cadangkan Data (Export JSON)** dan **Pulihkan Data (Import JSON)**. Anda dapat memindahkan file cadangan ke perangkat ponsel atau laptop lain kapan pun dengan aman tanpa perlu membuat akun atau login.
- **Tujuan Penggunaan**: Dirancang khusus untuk **keuangan pribadi, rumah tangga, dan pengelolaan kebutuhan harian**, dengan antarmuka yang bersih, cepat, dan mudah dipahami.
- **Format Laporan PDF**: Dokumen PDF komprehensif yang memuat kop laporan, ringkasan saldo bersih & rasio tabungan bulan terpilih, grafik distribusi kategori (pemasukan & pengeluaran), serta tabel rincian transaksi harian lengkap dengan tanggal, keterangan, dan nominal Rupiah.
- **Kategori Fleksibel (Custom)**: Pengguna bebas menambah, mengubah, atau menghapus sumber pemasukan (misal: Gaji, Bisnis Sampingan, Dividen) dan pos pengeluaran (misal: Bahan Makanan, Listrik & Air, Transportasi, Pendidikan, Cicilan).

---

## 1. Overview & Core Concept

- **Apa Fungsinya**:
  - **Pencatatan Harian Cepat**: Input transaksi pemasukan dan pengeluaran harian dengan pemilihan tanggal, kategori (custom), nominal Rupiah, dompet/metode (Tunai, Rekening Bank, E-Wallet), serta catatan/keterangan transaksi.
  - **Rekapitulasi & Statistik Bulanan Interaktif**: Pemilih bulan dan tahun (misal: Januari 2026, Februari 2026, dst.) yang secara otomatis menghitung:
    - Total Pemasukan bulan tersebut
    - Total Pengeluaran bulan tersebut
    - Saldo Bersih / Arus Kas (Surplus/Defisit)
    - Total frekuensi transaksi yang terjadi
    - Rincian pengeluaran untuk apa saja (beserta persentase) dan pemasukan dari mana saja.
  - **Ekspor Dokumen PDF Formal**: Mengonversi rekap bulanan yang dipilih menjadi lembar PDF berstandar cetak rapi siap unduh/arsip.
  - **Kustomisasi Kategori**: Manajemen pos pemasukan dan pengeluaran dengan ikon dan warna penanda.
  - **Keamanan & Persistensi**: Data tersimpan seketika di storage browser pengguna, tidak hilang saat halaman di-refresh, dan dapat dicadangkan/dipulihkan dalam format JSON.

- **Target Pengguna**: Individu, keluarga, pekerja mandiri, dan pengelola rumah tangga yang menginginkan catatan keuangan transparan dan bebas ribet tanpa registrasi akun.

---

## 2. User Experience & Visual Design

### A. Alur Pengguna (User Flow)
1. **Dasbor Utama (Dashboard View)**:
   - Header aplikasi dengan identitas "BukuKas Rupiah", navigasi cepat (Rekap Bulanan, Riwayat Transaksi, Kategori, Cadangan Data), dan tombol aksi utama **"+ Tambah Transaksi"**.
   - Kartu Metrik Utama Bulan Berjalan: Saldo Bersih, Total Pemasukan, Total Pengeluaran, dan Indikator Hemat/Defisit.
2. **Pemilih Periode & Statistik Bulanan**:
   - Kontrol pemilih bulan dan tahun yang dinamis.
   - Grafik batang perbandingan pemasukan vs pengeluaran dan grafik distribusi kategori (donat interaktif / progres horizontal yang informatif).
   - Rincian detail pengeluaran per pos belanja (nominal + persentase dari total pengeluaran).
   - Rincian detail pemasukan per sumber (nominal + persentase dari total pemasukan).
3. **Formulir Transaksi Fleksibel (Modal / Panel Tambah)**:
   - Pilihan jenis: Pemasukan (hijau) atau Pengeluaran (merah).
   - Tanggal transaksi (default hari ini, bisa disesuaikan).
   - Input nominal dengan format Rupiah otomatis (`Rp 50.000`).
   - Dropdown kategori dengan tombol pintas tambah kategori baru jika belum ada.
   - Kolom sumber/dompet (Kas/Tunai, Rekening Utama, Dompet Digital) dan keterangan catatan.
4. **Tabel Log Transaksi Terperinci**:
   - Filter menurut tipe (Semua, Pemasukan, Pengeluaran), pencarian teks (keterangan/kategori), dan pengurutan tanggal.
   - Tombol edit dan hapus per transaksi dengan konfirmasi aman.
5. **Modal Cetak & Ekspor PDF**:
   - Tombol satu klik "Unduh Laporan PDF" pada bulan yang sedang dipilih.
   - Menghasilkan lembar laporan formal A4 yang rapi, berisi header laporan, tabel ringkasan keuangan, analisis persentase kategori, dan tabel rincian transaksi lengkap.
6. **Pengaturan Kategori & Backup**:
   - Tab khusus untuk mengelola daftar kategori pengeluaran dan pemasukan.
   - Fitur Ekspor File Cadangan (.json) dan Impor File Cadangan untuk memulihkan atau memindahkan data ke gadget lain.

### B. Desain Visual & Tipografi
- **Palet Warna**:
  - Dominan Kanvas: Slate netral bersih (`#F8FAFC` light, aksen kontras yang nyaman di mata).
  - Pemasukan / Aset Positif: Emerald Green (`#059669` / `#10B981`).
  - Pengeluaran / Defisit: Rose / Coral Crimson (`#E11D48` / `#F43F5E`).
  - Netral & Border: Garis hairline halus (`#E2E8F0` / `#CBD5E1`) tanpa tumpukan kartu ganda.
- **Tipografi**:
  - Display Font: `Plus Jakarta Sans` untuk judul dan navigasi yang modern dan profesional.
  - Body Font: `DM Sans` / `Plus Jakarta Sans` untuk teks yang mudah dibaca.
  - Tabular Numerals: `font-mono tabular-nums` untuk semua angka keuangan Rupiah agar rata vertikal.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Penyimpanan Tanpa Login vs Keamanan Privasi**
  - *Pendekatan*: Menggunakan Browser LocalStorage dengan skema data terstruktur dan fitur Backup/Restore JSON.
  - *Alasan*: Menjawab kebutuhan pengguna ("tanpa login") dengan waktu muat 0 detik, data 100% berada di kendali pengguna secara privat, tidak membutuhkan biaya server/database eksternal, dan aman dari kebocoran akun cloud.
- **Keputusan 2: Pembuatan PDF Sisi Klien (Client-Side PDF Engine)**
  - *Pendekatan*: Menggunakan pustaka pembuatan PDF presisi tinggi (`jspdf` dan `jspdf-autotable`) atau print CSS terstruktur beresolusi tinggi.
  - *Alasan*: Berjalan langsung di peramban pengguna tanpa bergantung pada server proxy backend, mendukung format Rupiah rapi, pembagian halaman (pagination) otomatis jika transaksi panjang, dan bisa diunduh secara offline.
- **Keputusan 3: Struktur Kategori Dinamis**
  - *Pendekatan*: Dilengkapi kategori standar bawaan khas rumah tangga Indonesia (Makan & Minum, Belanja Harian, Listrik/Air/Internet, Transportasi, Kesehatan, Pendidikan, Gaji, Bonus, dll.) yang dapat diedit, ditambah baru, atau dihapus sesuka hati.

---

## 4. Technical Architecture & Data Strategy

### Diagram Arsitektur Komponen

```
┌────────────────────────────────────────────────────────────────────────┐
│                          BukuKas Rupiah App                            │
├────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Top Bar: Brand Wordmark | Nav Links | [ + Tambah Transaksi ]       │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌───────────────────────────┐ ┌──────────────────────────────────────┐ │
│ │  Periode & Filter Waktu   │ │ Ringkasan Finansial Bulanan          │ │
│ │  [Bulan ▼] [Tahun ▼]      │ │ Saldo | Pemasukan | Pengeluaran      │ │
│ └───────────────────────────┘ └──────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Analisis Statistik Kategori Bulanan                                │ │
│ │ - Pengeluaran untuk apa saja (Donut/Bar Chart + Rincian Persentase)│ │
│ │ - Pemasukan dari mana saja (Donut/Bar Chart + Rincian Sumber)      │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Tabel Riwayat Transaksi Harian                                     │ │
│ │ [Cari / Filter] [Aksi Edit & Hapus] [Unduh PDF Laporan Bulanan]    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌───────────────────────────┐ ┌──────────────────────────────────────┐ │
│ │ Modal Form Transaksi      │ │ Modal Kelola Kategori & Backup JSON  │ │
│ └───────────────────────────┘ └──────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ LocalStorage Persistence Engine + PDF Document Generator           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Model Data (TypeScript)

```typescript
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  amount: number; // in Rupiah (integer)
  wallet: string; // e.g. "Kas / Tunai", "BCA", "GoPay/OVO"
  notes: string;
  createdAt: number;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: number; // 0-11
  selectedYear: number;  // e.g. 2026
}
```

---

## 5. Rencana Tahapan Eksekusi

1. **Instalasi Pustaka Pendukung**: Memasang paket `jspdf` dan `jspdf-autotable` untuk pembuatan berkas PDF profesional di sisi browser.
2. **Setup Konfigurasi Meta & Tipografi**: Menyesuaikan `metadata.json` dan `index.html` dengan font `Plus Jakarta Sans` dan label aplikasi yang profesional.
3. **Penyusunan State Management & Storage Engine**: Menyiapkan modul penyimpanan lokal reaktif dengan data awal (seed) transaksi realistis dalam Rupiah agar pengguna langsung melihat tampilan visual yang fungsional.
4. **Komponen Formulir Transaksi**: Input cerdas dengan pemformatan mata uang otomatis, validasi tanggal, dan pemilihan kategori cepat.
5. **Komponen Dasbor & Statistik Rekap Bulanan**: Pemilih bulan/tahun dinamis, kartu metrik arus kas, grafik distribusi pengeluaran untuk apa saja dan pemasukan dari mana saja.
6. **Komponen Tabel & Filter Transaksi**: Tabel transaksi terorganisir dengan fitur pencarian keterangan, filter kategori, edit, dan hapus.
7. **Modul Generator PDF Formal**: Menghasilkan dokumen laporan bulanan yang rapi, berkelas, siap cetak atau unduh.
8. **Modul Manajemen Kategori & Backup/Restore**: Antarmuka untuk tambah/edit kategori serta ekspor/impor file data cadangan.
9. **Verifikasi & Pengujian Kompilasi**: Menjalankan linting dan kompilasi untuk memastikan keandalan 100%.
