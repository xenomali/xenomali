// ── data.js — konfigurasi statis (bukan data lowongan) ──
// Data lowongan sendiri ada di lowongan_publik.json, di-fetch di ui.js

const CONFIG = {
  jsonUrl: "lowongan_publik.json",
  freshBadgeMaxHari: 2, // lowongan <=2 hari dikasih badge "Baru" merah
};

// SVG icons — 16-18px, stroke-based, currentColor (di-tint via CSS)
const ICONS = {
  chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,

  externalLink: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,

  calendar: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

// Teks label UI — biar gampang diedit tanpa nyentuh ui.js/ux.js
const LABELS = {
  heroTitlePart1: "Lowongan kerja terbaru,",
  heroTitleRed: "disaring",
  heroTitleMid: ", bukan",
  heroTitleBlue: "dijamin",
  heroTitleEnd: ".",

  searchPlaceholder: "Cari judul posisi atau perusahaan...",
  filterDaerahDefault: "Semua Daerah",
  filterJenisDefault: "Semua Jenis Kerja",
  sortTerbaru: "Terbaru",
  sortTerlama: "Terlama",
  toggleGajiLabel: "Hanya yang cantumkan gaji",

  loadingText: "Memuat data lowongan...",
  emptyStateText: "Tidak ada lowongan yang cocok dengan filter ini.",
  resetBtnText: "Reset Filter",

  salaryNotListed: "Tidak dicantumkan",
  linkText: "Buka lowongan di JobStreet",
  linkTextFallback: "Link tidak tersedia",

  metaLabels: {
    lokasi: "Lokasi",
    gaji: "Gaji",
    jenis: "Jenis",
  },

  freshBadge: "Baru",

  requirementHeader: "Requirement",
  deskripsiHeader: "Deskripsi",
  detailToggleText: "Lihat detail",
};

// Disclaimer — dipakai ui.js kalau perlu re-render dinamis (banner + footer sudah ada di index.html,
// ini cadangan kalau nanti mau ditampilkan ulang di tempat lain)
const DISCLAIMER_TEXT = {
  short: "Data ini hasil scraping otomatis, bukan fakta final. Selalu cek & verifikasi sendiri lewat link JobStreet yang tersedia di tiap lowongan sebelum melamar.",
  long: "Seluruh lowongan di halaman ini dikumpulkan secara otomatis lewat proses scraping dan diproses AI tanpa verifikasi manual satu per satu. Kami tidak menjamin lowongan masih tersedia, keakuratan detail (gaji, requirement, deskripsi), maupun keabsahan perusahaan yang mencantumkan lowongan. Selalu buka link asli di JobStreet untuk memastikan, dan waspada terhadap indikasi penipuan (permintaan uang muka, transfer di awal, atau data pribadi mencurigakan). Halaman ini murni referensi awal — tanggung jawab verifikasi ada di tangan pengguna.",
};
