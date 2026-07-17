// ── ux.js — interaksi: search, filter, sort, toggle, load more, jump nav, scroll top ──
// Depends on ui.js (ALL_JOBS, FILTERED_JOBS, resetAndRenderFirstBatch, renderNextBatch, sortJobs).

document.addEventListener('DOMContentLoaded', () => {
  const searchInput   = document.getElementById('searchInput');
  const filterDaerah  = document.getElementById('filterDaerah');
  const filterJenis   = document.getElementById('filterJenis');
  const sortBy        = document.getElementById('sortBy');
  const toggleGaji     = document.getElementById('toggleGaji');
  const resetBtn       = document.getElementById('resetFilterBtn');
  const loadMoreBtn    = document.getElementById('loadMoreBtn');

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
    resetAndRenderFirstBatch(FILTERED_JOBS);
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
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', renderNextBatch);

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

  // ── Sticky disclaimer offset — nempel tepat di bawah header, dinamis ──
  function updateDisclaimerOffset() {
    const header = document.getElementById('siteHeader');
    const banner = document.getElementById('disclaimerBanner');
    if (!header || !banner) return;
    banner.style.top = header.offsetHeight + 'px';
  }
  updateDisclaimerOffset();
  window.addEventListener('resize', updateDisclaimerOffset);
  window.addEventListener('load', updateDisclaimerOffset);

  // ── Scroll-to-top button — sticky, muncul setelah scroll jauh, auto scroll ke atas pas diklik ──
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
        scrollTicking = false;
      });
    });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Jump nav — lompat ke kartu sebelumnya/berikutnya, bukan scroll ke atas ──
  const jumpNav = document.getElementById('jumpNav');
  const jumpUpBtn = document.getElementById('jumpUpBtn');
  const jumpDownBtn = document.getElementById('jumpDownBtn');

  function getVisibleCards() {
    return Array.from(document.querySelectorAll('.job-card'));
  }

  function getCurrentCardIndex(cards) {
    const viewportMid = window.scrollY + window.innerHeight / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardMid = window.scrollY + rect.top + rect.height / 2;
      const dist = Math.abs(cardMid - viewportMid);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    return closestIdx;
  }

  function jumpToCard(direction) {
    const cards = getVisibleCards();
    if (!cards.length) return;
    const currentIdx = getCurrentCardIndex(cards);
    const targetIdx = currentIdx + direction;
    if (targetIdx < 0 || targetIdx >= cards.length) return;
    cards[targetIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (jumpUpBtn) jumpUpBtn.addEventListener('click', () => jumpToCard(-1));
  if (jumpDownBtn) jumpDownBtn.addEventListener('click', () => jumpToCard(1));

  if (jumpNav) {
    let jumpTicking = false;
    window.addEventListener('scroll', () => {
      if (jumpTicking) return;
      jumpTicking = true;
      requestAnimationFrame(() => {
        jumpNav.classList.toggle('visible', window.scrollY > 500);
        jumpTicking = false;
      });
    });
  }
});
