// ── ux.js — interaksi: search, filter, sort, toggle ──
// Depends on ui.js (ALL_JOBS, FILTERED_JOBS, renderJobs, sortJobs) sudah di-load duluan.

document.addEventListener('DOMContentLoaded', () => {
  const searchInput   = document.getElementById('searchInput');
  const filterDaerah  = document.getElementById('filterDaerah');
  const filterJenis   = document.getElementById('filterJenis');
  const sortBy        = document.getElementById('sortBy');
  const toggleGaji     = document.getElementById('toggleGaji');
  const resetBtn       = document.getElementById('resetFilterBtn');

  let debounceTimer;

  function applyFilters() {
    const keyword = (searchInput?.value || '').trim().toLowerCase();
    const daerah  = filterDaerah?.value || '';
    const jenis   = filterJenis?.value || '';
    const sortMode = sortBy?.value || 'terbaru';
    const hanyaGaji = toggleGaji?.checked || false;

    let hasil = ALL_JOBS.filter(job => {
      if (keyword) {
        const judul = (job.judul_posisi || '').toLowerCase();
        const perusahaan = (job.nama_perusahaan || '').toLowerCase();
        if (!judul.includes(keyword) && !perusahaan.includes(keyword)) return false;
      }

      if (daerah && job._daerah !== daerah) return false;

      if (jenis) {
        const jenisJob = (job.jenis_kerja || '');
        const daftarJenis = jenisJob.split(',').map(j => j.trim());
        if (!daftarJenis.includes(jenis)) return false;
      }

      if (hanyaGaji) {
        const gaji = (job.gaji || '').trim();
        if (!gaji) return false;
      }

      return true;
    });

    sortJobs(hasil, sortMode);
    FILTERED_JOBS = hasil;
    renderJobs(FILTERED_JOBS);
  }

  function debouncedApplyFilters() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 200);
  }

  if (searchInput) searchInput.addEventListener('input', debouncedApplyFilters);
  if (filterDaerah) filterDaerah.addEventListener('change', applyFilters);
  if (filterJenis) filterJenis.addEventListener('change', applyFilters);
  if (sortBy) sortBy.addEventListener('change', applyFilters);
  if (toggleGaji) toggleGaji.addEventListener('change', applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (filterDaerah) filterDaerah.value = '';
      if (filterJenis) filterJenis.value = '';
      if (sortBy) sortBy.value = 'terbaru';
      if (toggleGaji) toggleGaji.checked = false;
      applyFilters();
    });
  }

  // ── Sticky disclaimer offset — nempel tepat di bawah header, dinamis
  // (jaga-jaga kalau tinggi header berubah karena font loading dsb) ──
  function updateDisclaimerOffset() {
    const header = document.getElementById('siteHeader');
    const banner = document.getElementById('disclaimerBanner');
    if (!header || !banner) return;
    banner.style.top = header.offsetHeight + 'px';
  }
  updateDisclaimerOffset();
  window.addEventListener('resize', updateDisclaimerOffset);
  window.addEventListener('load', updateDisclaimerOffset);
});
