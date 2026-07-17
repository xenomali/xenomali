// ── ui.js — render data dari lowongan_publik.json ke DOM ──
// Depends on data.js (CONFIG, ICONS, LABELS). Load data.js dulu sebelum file ini.

let ALL_JOBS = [];
let FILTERED_JOBS = [];

document.addEventListener('DOMContentLoaded', () => {
  loadJobs();
});

async function loadJobs() {
  const loadingEl = document.getElementById('loadingState');
  const listEl = document.getElementById('jobList');

  try {
    const res = await fetch(CONFIG.jsonUrl);
    if (!res.ok) throw new Error('Gagal fetch JSON: ' + res.status);
    const data = await res.json();

    // Dukung 2 kemungkinan struktur: array polos, atau { generated_at, total, lowongan: [...] }
    if (Array.isArray(data)) {
      ALL_JOBS = data;
      updateMetaInfo(null, data.length);
    } else {
      ALL_JOBS = data.lowongan || [];
      updateMetaInfo(data.generated_at, data.total || ALL_JOBS.length);
    }

    // Tambahin field turunan yang dibutuhin UI (daerah, umur hari, fresh flag)
    ALL_JOBS = ALL_JOBS.map(enrichJob);

    populateFilterDaerah(ALL_JOBS);
    populateFilterJenis(ALL_JOBS);

    FILTERED_JOBS = [...ALL_JOBS];
    sortJobs(FILTERED_JOBS, 'terbaru');
    renderJobs(FILTERED_JOBS);

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

// ── Populate dropdown daerah — otomatis dari data, bukan hardcode ──
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

// ── Populate dropdown jenis kerja — otomatis dari data ──
function populateFilterJenis(jobs) {
  const select = document.getElementById('filterJenis');
  if (!select) return;

  const jenisSet = new Set();
  jobs.forEach(j => {
    const jenis = (j.jenis_kerja || '').trim();
    if (!jenis) return;
    // beberapa job punya "Full time, Kontrak/Temporer" digabung koma -- pecah jadi individual
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

function updateMetaInfo(generatedAt, total) {
  const metaEl = document.getElementById('metaInfo');
  const footerTsEl = document.getElementById('footerTimestamp');

  const totalText = `${total} lowongan tersedia`;
  if (metaEl) metaEl.textContent = totalText;

  if (footerTsEl) {
    if (generatedAt) {
      const tgl = new Date(generatedAt);
      const formatted = tgl.toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      footerTsEl.textContent = `Data diperbarui: ${formatted}`;
    } else {
      footerTsEl.textContent = 'Data diperbarui: tidak diketahui';
    }
  }
}

// ── Sort ──
function sortJobs(jobs, mode) {
  jobs.sort((a, b) => {
    const ua = a._umurHari === null ? 999 : a._umurHari;
    const ub = b._umurHari === null ? 999 : b._umurHari;
    return mode === 'terbaru' ? ua - ub : ub - ua;
  });
  return jobs;
}

// ── Render kartu lowongan ──
function renderJobs(jobs) {
  const listEl = document.getElementById('jobList');
  const emptyEl = document.getElementById('emptyState');
  const countEl = document.getElementById('resultCount');

  if (countEl) countEl.textContent = `${jobs.length} ditemukan`;

  if (!jobs.length) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = jobs.map(buatKartuHTML).join('');

  // reveal animation staggered
  const cards = listEl.querySelectorAll('.job-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 25);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  cards.forEach(c => observer.observe(c));

  bindDetailToggles();
}

function escapeHtml(teks) {
  if (!teks) return '';
  return teks
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function teksKeBulletHtml(teks) {
  if (!teks) return '';
  return teks.split('\n')
    .map(b => b.trim())
    .filter(Boolean)
    .map(b => `<li>${escapeHtml(b.replace(/^[-•*]\s*/, ''))}</li>`)
    .join('');
}

function buatKartuHTML(job, idx) {
  const judul = escapeHtml(job.judul_posisi || '-');
  const perusahaan = escapeHtml(job.nama_perusahaan || '-');
  const lokasi = escapeHtml(job.lokasi || '-');
  const daerah = escapeHtml(job._daerah || '-');
  const gajiRaw = (job.gaji || '').trim();
  const jenisKerja = escapeHtml(job.jenis_kerja || '-');
  const tanggal = escapeHtml(job.tanggal_posting || '-');
  const link = (job.link_lowongan || '').trim();
  const requirementHtml = teksKeBulletHtml(job.requirement || '');
  const deskripsi = escapeHtml(job.deskripsi || '');

  const gajiHtml = gajiRaw
    ? `<span class="job-salary">${escapeHtml(gajiRaw)}</span>`
    : `<span class="job-salary no-salary">${LABELS.salaryNotListed}</span>`;

  const freshBadge = job._isFresh
    ? `<span class="job-tag tag-fresh">${LABELS.freshBadge}</span>`
    : '';

  const linkHtml = link
    ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="job-link">${LABELS.linkText} ${ICONS.externalLink}</a>`
    : `<span class="job-link" style="color:var(--gray-38);border:none;cursor:default">${LABELS.linkTextFallback}</span>`;

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
        ${LABELS.detailToggleText} ${ICONS.chevronDown}
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

function bindDetailToggles() {
  document.querySelectorAll('.job-body-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const body = document.getElementById(targetId);
      if (!body) return;
      const isOpen = body.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
    });
  });
}
