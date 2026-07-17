// ── data.js — konfigurasi statis (bukan data lowongan) ──
// Data lowongan sendiri ada di lowongan_publik.json, di-fetch di ui.js

const CONFIG = {
  jsonUrl: "lowongan_publik.json",
  freshBadgeMaxHari: 2,      // lowongan <=2 hari dikasih badge "Baru" merah
  batchSize: 10,              // jumlah kartu per render batch (load more)
  cardRevealDelayMs: 25,      // jeda staggered antar kartu pas muncul
};

// SVG icons — 16-18px, stroke-based, currentColor (di-tint via CSS)
const ICONS = {
  chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,

  externalLink: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,

  calendar: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

const LABELS = {
  searchPlaceholder: "Cari judul posisi atau perusahaan...",
  loadingText: "Memuat data lowongan...",
  emptyStateText: "Tidak ada lowongan yang cocok dengan filter ini.",
  resetBtnText: "Reset Filter",
  loadMoreText: "Muat Lebih Banyak",

  salaryNotListed: "Tidak dicantumkan",
  linkText: "Buka di JobStreet",
  linkTextFallback: "Link tidak tersedia",

  metaLabels: {
    lokasi: "Lokasi",
    gaji: "Gaji",
    jenis: "Jenis",
  },

  freshBadge: "Baru",

  requirementHeader: "Requirement",
  deskripsiHeader: "Deskripsi",
  detailToggleOpen: "Lihat Detail",
  detailToggleClose: "Sembunyikan",
};

const DISCLAIMER_TEXT = {
  short: "Arsip statis hasil experiment bot pribadi, snapshot 16–17 Juli 2026, tidak akan diperbarui lagi. Wajib verifikasi mandiri ke link asli.",
  long: "Seluruh referensi lowongan di halaman ini dikumpulkan secara mandiri lewat experiment bot pribadi sebagai arsip data statis, snapshot 16–17 Juli 2026, dan tidak akan diperbarui lagi. Rentang postingan 7 hari terakhir dihitung relatif terhadap tanggal snapshot tersebut, bukan terhadap hari akses. Kami tidak berafiliasi resmi dengan JobStreet dan tidak menjamin keakuratan data. Selalu buka link asli untuk memastikan, dan waspada terhadap indikasi penipuan.",
};
