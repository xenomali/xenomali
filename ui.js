// ── ui.js — render data dari lowongan_publik.json ke DOM ──
// Depends on data.js (CONFIG, ICONS, LABELS). Load data.js dulu sebelum file ini.

let ALL_JOBS = [];
let FILTERED_JOBS = [];
let JOBS_RENDERED_COUNT = 0; // berapa kartu yang udah ditampilin dari FILTERED_JOBS

document.addEventListener('DOMContentLoaded', () => {
  loadJobs();
});

async function loadJobs() {
  const loadingEl = document.getElementById('loadingState');

  try {
    const res = await fetch(CONFIG.jsonUrl);
    if (!res.ok) throw new Error('Gagal fetch JSON: ' + res.status);
    const data = await res.json();

    if (Array.isArray(data)) {
      ALL_JOBS = data;
      updateMetaInfo(data.length);
    } else {
      ALL_JOBS = data.lowongan || [];
      updateMetaInfo(data.total || ALL_JOBS.length);
    }

    ALL_JOBS = ALL_JOBS.map(enrichJob);

    populateFilterDaerah(ALL_JOBS);
    populateFilterJenis(ALL_JOBS);

    FILTERED_JOBS = [...ALL_JOBS];
    sortJobs(FILTERED_JOBS, 'terbaru');
    resetAndRenderFirstBatch(FILTERED_JOBS);

  } catch (err) {
    console.error('Gagal memuat data lowongan:', err);
    if (loadingEl) {
      loadingEl.innerHTML = `<span style="color:var(--red)">Gagal memuat data lowongan. Coba refresh halaman.</span>`;
    }
    return;
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// ── Enrich: tambah field turunan yang dibutuhin UI ──
function enrichJob(job) {
  const lokasi = job.lokasi || '';
  const daerah = lokasi.includes(',') ? lokasi.split(',')[0].trim() : (lokasi.trim() || 'Tidak diketahui');

  const umurHari = hitungUmurHari(job.tanggal_posting || '');
  const isFresh = umurHari !== null && umurHari <= CONFIG.freshBadgeMaxHari;

  return {
    ...job,
    _daerah: daerah,
    _umurHari: umurHari,
    _isFresh: isFresh,
  };
}

function hitungUmurHari(tanggalStr) {
  if (!tanggalStr || !tanggalStr.trim()) return null;
  const teks = tanggalStr.trim().toLowerCase();

  let m = teks.match(/(\d+)\s*hari\s*yang\s*lalu/);
  if (m) return parseInt(m[1]);

  m = teks.match(/(\d+)\s*jam\s*yang\s*lalu/);
  if (m) return 0;

  m = teks.match(/(\d+)\+\s*hari/);
  if (m) return parseInt(m[1]);

  m = teks.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const tanggal = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
    const sekarang = new Date();
    const diffMs = sekarang - tanggal;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  return null;
}

function formatTanggal(str) {
  if (!str || !str.trim()) return 'Tidak diketahui';
  return str.replace(/^Diposting\s+/i, '').trim();
}

function populateFilterDaerah(jobs) {
  const select = document.getElementById('filterDaerah');
  if (!select) return;

  const daerahSet = new Set(jobs.map(j => j._daerah).filter(Boolean));
  const daerahList = Array.from(daerahSet).sort((a, b) => a.localeCompare(b));

  daerahList.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });
}

function populateFilterJenis(jobs) {
  const select = document.getElementById('filterJenis');
  if (!select) return;

  const jenisSet = new Set();
  jobs.forEach(j => {
    const jenis = (j.jenis_kerja || '').trim();
    if (!jenis) return;
    jenis.split(',').forEach(bagian => {
      const bersih = bagian.trim();
      if (bersih) jenisSet.add(bersih);
    });
  });
  const jenisList = Array.from(jenisSet).sort((a, b) => a.localeCompare(b));

  jenisList.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j;
    opt.textContent = j;
    select.appendChild(opt);
  });
}

function updateMetaInfo(total) {
  const metaEl = document.getElementById('metaInfo');
  if (metaEl) metaEl.textContent = `${total} lowongan dalam arsip`;
}

function sortJobs(jobs, mode) {
  jobs.sort((a, b) => {
    const ua = a._umurHari === null ? 999 : a._umurHari;
    const ub = b._umurHari === null ? 999 : b._umurHari;
    return mode === 'terbaru' ? ua - ub : ub - ua;
  });
  return jobs;
}

// ── Render: batch pertama (dipanggil pas load awal / filter berubah) ──
function resetAndRenderFirstBatch(jobs) {
  JOBS_RENDERED_COUNT = 0;
  const listEl = document.getElementById('jobList');
  const emptyEl = document.getElementById('emptyState');
  const countEl = document.getElementById('resultCount');

  if (countEl) countEl.textContent = `${jobs.length} ditemukan`;

  if (listEl) listEl.innerHTML = '';

  if (!jobs.length) {
    if (emptyEl) emptyEl.style.display = 'flex';
    updateLoadMoreButton();
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  renderNextBatch();
}

// ── Render: batch berikutnya (dipanggil pas klik "Muat Lebih Banyak") ──
function renderNextBatch() {
  const listEl = document.getElementById('jobList');
  if (!listEl) return;

  const nextChunk = FILTERED_JOBS.slice(JOBS_RENDERED_COUNT, JOBS_RENDERED_COUNT + CONFIG.batchSize);
  if (!nextChunk.length) {
    updateLoadMoreButton();
    return;
  }

  const startIdx = JOBS_RENDERED_COUNT;
  nextChunk.forEach((job, i) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buatKartuHTML(job, startIdx + i);
    const card = wrapper.firstElementChild;
    listEl.appendChild(card);

    setTimeout(() => {
      card.classList.add('show');
    }, i * CONFIG.cardRevealDelayMs);
  });

  JOBS_RENDERED_COUNT += nextChunk.length;
  bindDetailToggles(listEl);
  updateLoadMoreButton();
}

function updateLoadMoreButton() {
  const wrap = document.getElementById('loadMoreWrap');
  const countEl = document.getElementById('loadMoreCount');
  if (!wrap) return;

  const sisa = FILTERED_JOBS.length - JOBS_RENDERED_COUNT;
  if (sisa > 0) {
    wrap.style.display = 'flex';
    if (countEl) countEl.textContent = `${JOBS_RENDERED_COUNT} dari ${FILTERED_JOBS.length} ditampilkan`;
  } else {
    wrap.style.display = 'none';
  }
}

function escapeHtml(teks) {
  if (!teks) return '';
  return teks
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Bersihin karakter sisa scraping (strip/em-dash/bullet/angka nggantung di awal baris)
// sebelum dipecah jadi list <li>
function bersihkanBarisRequirement(teks) {
  if (!teks) return '';
  return teks
    .replace(/^[—\-•*\s:.,\d]+/, '')
    .trim();
}

function teksKeBulletHtml(teks) {
  if (!teks) return '';
  return teks.split(/\n|—(?=\s*[A-Z])/)
    .map(b => bersihkanBarisRequirement(b))
    .filter(Boolean)
    .map(b => `<li>${escapeHtml(b)}</li>`)
    .join('');
}

function buatKartuHTML(job, idx) {
  const judul = escapeHtml(job.judul_posisi || '-');
  const perusahaan = escapeHtml(job.nama_perusahaan || '-');
  const lokasi = escapeHtml(job.lokasi || '-');
  const daerah = escapeHtml(job._daerah || '-');
  const gajiRaw = (job.gaji || '').trim();
  const jenisKerja = escapeHtml(job.jenis_kerja || '-');
  const tanggal = escapeHtml(formatTanggal(job.tanggal_posting));
  const link = (job.link_lowongan || '').trim();
  const requirementHtml = teksKeBulletHtml(job.requirement || '');
  const deskripsi = escapeHtml(bersihkanBarisRequirement(job.deskripsi || ''));

  const gajiHtml = gajiRaw
    ? `<span class="job-salary">${escapeHtml(gajiRaw)}</span>`
    : `<span class="job-salary no-salary">${LABELS.salaryNotListed}</span>`;

  const freshBadge = job._isFresh
    ? `<span class="job-tag tag-fresh">${LABELS.freshBadge}</span>`
    : '';

  const linkHtml = link
    ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="job-link">${LABELS.linkText} ${ICONS.externalLink}</a>`
    : `<span class="job-link disabled">${LABELS.linkTextFallback}</span>`;

  const bodyId = `jobBody-${idx}-${Math.random().toString(36).slice(2, 8)}`;

  return `
    <div class="job-card${job._isFresh ? ' is-fresh' : ''}">
      <div class="job-title">${judul}</div>
      <div class="job-company">${perusahaan}</div>

      <div class="job-meta-grid">
        <div class="job-meta"><span class="meta-label">${LABELS.metaLabels.lokasi}</span>${lokasi}</div>
        <div class="job-meta"><span class="meta-label">${LABELS.metaLabels.gaji}</span>${gajiHtml}</div>
        <div class="job-meta"><span class="meta-label">${LABELS.metaLabels.jenis}</span>${jenisKerja}</div>
      </div>

      <div class="job-tags">
        ${freshBadge}
        <span class="job-tag tag-daerah">${daerah}</span>
      </div>

      <button class="job-body-toggle" data-target="${bodyId}">
        ${LABELS.detailToggleOpen} ${ICONS.chevronDown}
      </button>
      <div class="job-body" id="${bodyId}">
        ${requirementHtml ? `<h4>${LABELS.requirementHeader}</h4><ul>${requirementHtml}</ul>` : ''}
        ${deskripsi ? `<h4>${LABELS.deskripsiHeader}</h4><p>${deskripsi}</p>` : ''}
      </div>

      <div class="job-footer">
        <span class="job-date">${ICONS.calendar} ${tanggal}</span>
        ${linkHtml}
      </div>
    </div>
  `;
}

function bindDetailToggles(scope) {
  const root = scope || document;
  root.querySelectorAll('.job-body-toggle').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const body = document.getElementById(targetId);
      if (!body) return;
      const isOpen = body.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.innerHTML = (isOpen ? LABELS.detailToggleClose : LABELS.detailToggleOpen) + ' ' + ICONS.chevronDown;
    });
  });
}
