/**
 * Türkiye İnteraktif Türkü Haritası — app.js
 */

/* ── 81 PROVINCES ───────────────────────────────────────────────────────────── */
const TURKISH_PROVINCES = new Set([
  "ADANA","ADIYAMAN","AFYONKARAHİSAR","AFYON","AĞRI","AKSARAY","AMASYA","ANKARA",
  "ANTALYA","ARDAHAN","ARTVİN","AYDIN","BALIKESİR","BARTIN","BATMAN","BAYBURT",
  "BİLECİK","BİNGÖL","BİTLİS","BOLU","BURDUR","BURSA","ÇANAKKALE","ÇANKIRI",
  "ÇORUM","DENİZLİ","DİYARBAKIR","DÜZCE","EDİRNE","ELAZIĞ","ERZİNCAN",
  "ERZURUM","ESKİŞEHİR","GAZİANTEP","GİRESUN","GÜMÜŞHANE","HAKKARİ","HATAY","IĞDIR",
  "ISPARTA","İSTANBUL","İZMİR","KAHRAMANMARAŞ","K. MARAŞ","KARABÜK","KARAMAN","KARS",
  "KASTAMONU","KAYSERİ","KIRIKKALE","KIRKLARELİ","KIRŞEHİR","KİLİS","KOCAELİ","KONYA",
  "KÜTAHYA","MALATYA","MANİSA","MARDİN","MERSİN","MUĞLA","MUŞ","NEVŞEHİR","NİĞDE",
  "ORDU","OSMANİYE","RİZE","SAKARYA","SAMSUN","SİİRT","SİNOP","SİVAS","ŞANLIURFA",
  "ŞIRNAK","TEKİRDAĞ","TOKAT","TRABZON","TUNCELİ","UŞAK","VAN","YALOVA","YOZGAT","ZONGULDAK"
]);

/* ── SVG NAME → PROVINCE KEY ────────────────────────────────────────────────── */
const SVG_TO_PROVINCE = {
  "Sanliurfa":"Şanlıurfa","Diyarbakir":"Diyarbakır","Izmir":"İzmir",
  "Kirsehir":"Kırşehir","Mugla":"Muğla","Kutahya":"Kütahya","Kütahya":"Kütahya",
  "Bingöl":"Bingöl","Düzce":"Düzce","Gümüshane":"Gümüşhane",
  "K. Maras":"Kahramanmaraş","Kinkkale":"Kırıkkale","Zinguldak":"Zonguldak",
  "Çankiri":"Çankırı","Çanakkale":"Çanakkale","Çorum":"Çorum","Bartın":"Bartın",
  "Adiyaman":"Adıyaman","Agri":"Ağrı","Afyonkarahisar":"Afyonkarahisar",
  "Iğdir":"Iğdır","Istanbul":"İstanbul","Elazig":"Elazığ","Nevsehir":"Nevşehir",
  "Eskisehir":"Eskişehir","Usak":"Uşak","Balikesir":"Balıkesir",
  "Tekirdag":"Tekirdağ","Kirklareli":"Kırklareli","Nigde":"Niğde",
  "Aydin":"Aydın","Siirt":"Siirt","Sirnak":"Şırnak",
};

/* ── STATE ──────────────────────────────────────────────────────────────────── */
let songsByProvince = {};
let allSongs        = [];
let scale = 1, translateX = 0, translateY = 0;
let activePanel  = null;
let drawerOpen   = false;
const MIN_SCALE  = 0.5, MAX_SCALE = 8, ZOOM_STEP = 0.25;

/* ── DOM REFS (set inside DOMContentLoaded) ─────────────────────────────────── */
let mapWrapper, mapContainer, tooltip, scaleBadge,
    selectedInfo, digerBtn, searchInput, searchClear,
    drawerToggle, drawerBackdrop, sidePanel;

/* ── HELPERS ────────────────────────────────────────────────────────────────── */
function toTitleCase(str) {
  return str.split(' ').map(w =>
    w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR')
  ).join(' ');
}

function fmt(val) {
  if (!val || val.trim() === '-' || val.trim() === '') return null;
  return val.trim();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlightText(text, query) {
  const escaped = escapeHtml(text);
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return escaped.replace(re, '<span class="search-highlight">$1</span>');
}

/* ── DATA PROCESSING ────────────────────────────────────────────────────────── */
function processData(rawArray) {
  const grouped = {};
  rawArray.forEach(song => {
    const raw  = (song.yoresi_ili || '').trim();
    const norm = raw.toLocaleUpperCase('tr-TR');
    const key  = TURKISH_PROVINCES.has(norm) ? toTitleCase(raw) : 'Diğer';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(song);
  });
  return grouped;
}

/* ── NAME RESOLUTION ────────────────────────────────────────────────────────── */
function resolveName(svgName) {
  if (!svgName) return svgName;
  if (SVG_TO_PROVINCE[svgName]) return SVG_TO_PROVINCE[svgName];
  const lower = svgName.toLowerCase();
  for (const key of Object.keys(songsByProvince)) {
    if (key.toLowerCase() === lower) return key;
  }
  return toTitleCase(svgName);
}

function getSongsFor(svgName) {
  return songsByProvince[resolveName(svgName)] || null;
}

/* ── SONG CARD ──────────────────────────────────────────────────────────────── */
function buildSongCard(song, highlightQuery) {
  const rows = [
    ['İlçe / Köy',    fmt(song.ilcesi_koyu)],
    ['Makam',         fmt(song.makamsal_dizi)],
    ['Konu / Tür',    fmt(song.konusu_turu)],
    ['Usul',          fmt(song.usul)],
    ['Karar Sesi',    fmt(song.karar_sesi)],
    ['Ses Genişliği', fmt(song.ses_genisligi)],
    ['Kaynak Kişi',   fmt(song.kaynak_kisi)?.replace(/\n/g, ', ')],
    ['Derleyen',      fmt(song.derleyen)],
    ['Notaya Alan',   fmt(song.notaya_alan)?.replace(/\n/g, ', ')],
    ['İcra Eden',     fmt(song.icra_eden)],
    ['Repertuar No',  fmt(song.repertuar_no)],
  ].filter(([, v]) => v);

  const metaHTML = rows.map(([label, val]) =>
    `<div class="song-meta-row">
       <span class="meta-label">${label}</span>
       <span class="meta-val">${val}</span>
     </div>`
  ).join('');

  const title = highlightQuery
    ? highlightText(song.song_title, highlightQuery)
    : escapeHtml(song.song_title);

  const lyricsHTML = fmt(song.lyrics)
    ? `<button class="song-lyrics-toggle" onclick="this.nextElementSibling.classList.toggle('open');this.classList.toggle('open')">Sözleri Göster</button>
       <div class="song-lyrics">${song.lyrics.replace(/\n/g, '<br>')}</div>`
    : '';

  const linkHTML = fmt(song.source_url) && song.source_url !== '#'
    ? `<a class="song-source-link" href="${song.source_url}" target="_blank" rel="noopener noreferrer">Repertükül'de Gör ↗</a>`
    : '';

  return `<div class="song-card">
    <div class="song-card-title">♩ ${title}</div>
    <div class="song-meta">${metaHTML}</div>
    ${lyricsHTML}${linkHTML}
  </div>`;
}

/* ── SIDE PANEL ─────────────────────────────────────────────────────────────── */
function updateSidePanel(displayName, songs) {
  const count = songs ? songs.length : 0;
  let html = `<div class="panel-province-header">
    <h3>${displayName}</h3>
    <span class="panel-count">${count} türkü</span>
  </div>`;
  html += count > 0
    ? songs.map(s => buildSongCard(s)).join('')
    : '<p class="empty-msg">Bu ile ait türkü bulunamadı.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
  const lbl = document.getElementById('drawer-toggle-label');
  if (lbl) lbl.textContent = count > 0 ? `♩ ${displayName} (${count})` : `♩ ${displayName}`;
}

function showDigerPanel() {
  const songs = songsByProvince['Diğer'] || [];
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  digerBtn.classList.add('active');
  let html = `<div class="panel-province-header">
    <h3>Diğer Yöreler</h3>
    <span class="panel-count">${songs.length} türkü</span>
  </div>
  <p class="diger-note">Haritada yer almayan yöreler (Rumeli, Kerkük vb.)</p>`;
  html += songs.length > 0
    ? songs.map(s => buildSongCard(s)).join('')
    : '<p class="empty-msg">Henüz türkü eklenmedi.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
  if (window.innerWidth <= 700) openDrawer();
}

/* ── SEARCH ─────────────────────────────────────────────────────────────────── */
function runSearch(query) {
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  digerBtn.classList.remove('active');
  const q = query.toLocaleLowerCase('tr-TR');
  const results = allSongs.filter(s =>
    s.song_title.toLocaleLowerCase('tr-TR').includes(q)
  );
  let html = `<div class="search-results-header">
    "<strong>${escapeHtml(query)}</strong>" — <strong>${results.length}</strong> sonuç
  </div>`;
  html += results.length > 0
    ? results.map(s => buildSongCard(s, query)).join('')
    : '<p class="empty-msg">Sonuç bulunamadı.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
}

function clearSearch() {
  selectedInfo.innerHTML = '<p class="empty-msg">Bir ile tıklayın…</p>';
}

/* ── RANDOM TÜRKÜ ────────────────────────────────────────────────────────────── */
function showRandomSong() {
  if (allSongs.length === 0) return;
  const song = allSongs[Math.floor(Math.random() * allSongs.length)];
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  digerBtn.classList.remove('active');
  if (searchInput) { searchInput.value = ''; searchClear.classList.remove('visible'); }
  // Highlight city on map
  const svg = mapContainer.querySelector('svg');
  if (svg) {
    const songCity = toTitleCase((song.yoresi_ili || '').trim());
    svg.querySelectorAll('path[name]').forEach(path => {
      if (resolveName(path.getAttribute('name')) === songCity) {
        activePanel = path;
        path.classList.add('active-province');
      }
    });
  }
  const cityDisplay = toTitleCase((song.yoresi_ili || '').trim());
  selectedInfo.innerHTML = `<div class="random-banner">🎲 Rastgele seçildi — <strong>${cityDisplay}</strong></div>
    ${buildSongCard(song)}`;
  selectedInfo.scrollTop = 0;
  if (window.innerWidth <= 700) openDrawer();
}

/* ── TOOLTIP ────────────────────────────────────────────────────────────────── */
function showTooltip(svgName, cx, cy) {
  const displayName = resolveName(svgName);
  const songs       = getSongsFor(svgName);
  const count       = songs ? songs.length : 0;
  const hasData     = count > 0;
  tooltip.className = 'visible' + (hasData ? ' has-data-tt' : '');
  tooltip.innerHTML = `<div class="tt-header">
    <span class="tt-city">${displayName}</span>
    <span class="tt-count ${hasData ? '' : 'tt-count-empty'}">${hasData ? count + ' türkü' : 'türkü yok'}</span>
  </div>
  ${hasData
    ? `<ul class="tt-list">${songs.slice(0,4).map(s=>`<li>${escapeHtml(s.song_title)}</li>`).join('')}
       ${count > 4 ? `<li class="tt-more">+${count-4} daha…</li>` : ''}</ul>`
    : '<p class="no-data">Henüz türkü eklenmedi.</p>'}`;
  positionTooltip(cx, cy);
}

function positionTooltip(cx, cy) {
  const tw = tooltip.offsetWidth || 240, th = tooltip.offsetHeight || 100;
  const OFFSET = 16;
  let left = cx + OFFSET, top = cy + OFFSET;
  if (left + tw > window.innerWidth  - 8) left = cx - tw - OFFSET;
  if (top  + th > window.innerHeight - 8) top  = cy - th - OFFSET;
  tooltip.style.left = `${left}px`;
  tooltip.style.top  = `${top}px`;
}

function hideTooltip() { tooltip.className = ''; }

/* ── TRANSFORM ──────────────────────────────────────────────────────────────── */
function applyTransform(animated) {
  if (animated) {
    mapContainer.style.transition = 'transform 0.3s cubic-bezier(.4,0,.2,1)';
    requestAnimationFrame(() => {
      mapContainer.style.transform = `translate(${translateX}px,${translateY}px) scale(${scale})`;
      setTimeout(() => { mapContainer.style.transition = 'none'; }, 320);
    });
  } else {
    mapContainer.style.transition = 'none';
    mapContainer.style.transform  = `translate(${translateX}px,${translateY}px) scale(${scale})`;
  }
  scaleBadge.textContent = `${Math.round(scale * 100)}%`;
}

function zoomAt(cx, cy, ns) {
  ns = Math.max(MIN_SCALE, Math.min(MAX_SCALE, ns));
  translateX = cx - (cx - translateX) * (ns / scale);
  translateY = cy - (cy - translateY) * (ns / scale);
  scale = ns;
  applyTransform();
}

/* ── PAN STATE ──────────────────────────────────────────────────────────────── */
let isDragging = false, dragStartX = 0, dragStartY = 0, dragOriginX = 0, dragOriginY = 0;

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  translateX = dragOriginX + (e.clientX - dragStartX);
  translateY = dragOriginY + (e.clientY - dragStartY);
  applyTransform();
});
window.addEventListener('mouseup', () => {
  isDragging = false;
  if (mapContainer) mapContainer.classList.remove('dragging');
});

/* ── DRAWER ─────────────────────────────────────────────────────────────────── */
function openDrawer() {
  drawerOpen = true;
  hideTooltip();
  sidePanel.classList.add('drawer-open');
  drawerBackdrop.classList.add('visible');
  drawerToggle.classList.add('hidden');
}

function closeDrawer() {
  drawerOpen = false;
  sidePanel.classList.remove('drawer-open');
  drawerBackdrop.classList.remove('visible');
  drawerToggle.classList.remove('hidden');
}

/* ── PROVINCE WIRING ────────────────────────────────────────────────────────── */
function wireProvinces() {
  const svg = mapContainer.querySelector('svg');
  if (!svg) return;
  svg.querySelectorAll('path[name]').forEach(path => {
    const svgName = path.getAttribute('name');
    if (getSongsFor(svgName)?.length) path.classList.add('has-data');
    path.addEventListener('mouseover', e => {
      if (window.innerWidth <= 700) return;
      e.stopPropagation();
      showTooltip(svgName, e.clientX, e.clientY);
    });
    path.addEventListener('mousemove', e => {
      if (window.innerWidth <= 700) return;
      positionTooltip(e.clientX, e.clientY);
    });
    path.addEventListener('mouseout', () => hideTooltip());
    path.addEventListener('click', e => {
      e.stopPropagation();
      if (activePanel) activePanel.classList.remove('active-province');
      activePanel = path;
      path.classList.add('active-province');
      digerBtn.classList.remove('active');
      if (searchInput) { searchInput.value = ''; searchClear.classList.remove('visible'); }
      const songs = getSongsFor(svgName);
      updateSidePanel(resolveName(svgName), songs);
      if (window.innerWidth <= 700) openDrawer();
    });
  });
}

/* ── INIT ───────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  mapWrapper     = document.getElementById('map-wrapper');
  mapContainer   = document.getElementById('map-container');
  tooltip        = document.getElementById('tooltip');
  scaleBadge     = document.getElementById('scale-badge');
  selectedInfo   = document.getElementById('selected-info');
  digerBtn       = document.getElementById('btn-diger');
  searchInput    = document.getElementById('search-input');
  searchClear    = document.getElementById('search-clear');
  drawerToggle   = document.getElementById('drawer-toggle');
  drawerBackdrop = document.getElementById('drawer-backdrop');
  sidePanel      = document.getElementById('side-panel');

  // Zoom buttons
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    const r = mapWrapper.getBoundingClientRect();
    zoomAt(r.width/2, r.height/2, scale + ZOOM_STEP); applyTransform(true);
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    const r = mapWrapper.getBoundingClientRect();
    zoomAt(r.width/2, r.height/2, scale - ZOOM_STEP); applyTransform(true);
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    scale = 1; translateX = 0; translateY = 0; applyTransform(true);
  });

  // Panel buttons
  digerBtn.addEventListener('click', showDigerPanel);
  document.getElementById('btn-random').addEventListener('click', showRandomSong);

  // Search
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    searchClear.classList.toggle('visible', q.length > 0);
    q.length > 0 ? runSearch(q) : clearSearch();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    clearSearch();
    searchInput.focus();
  });

  // Drawer (mobile)
  drawerToggle.addEventListener('click', openDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  let touchStartY = 0;
  sidePanel.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  sidePanel.addEventListener('touchend',   e => { if (e.changedTouches[0].clientY - touchStartY > 60) closeDrawer(); }, { passive: true });

  // Map interactions
  mapWrapper.addEventListener('wheel', e => {
    e.preventDefault();
    const r = mapWrapper.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, scale + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });

  mapWrapper.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true;
    dragStartX = e.clientX; dragStartY = e.clientY;
    dragOriginX = translateX; dragOriginY = translateY;
    mapContainer.classList.add('dragging');
  });

  mapWrapper.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    isDragging = true;
    dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY;
    dragOriginX = translateX; dragOriginY = translateY;
  }, { passive: true });

  mapWrapper.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    translateX = dragOriginX + (e.touches[0].clientX - dragStartX);
    translateY = dragOriginY + (e.touches[0].clientY - dragStartY);
    applyTransform();
  }, { passive: true });

  mapWrapper.addEventListener('touchend', () => { isDragging = false; });

  // Load data
  let rawArray = [];
  try {
    const res = await fetch('songs.jsonl');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    rawArray = text.split('\n').map(l => l.trim()).filter(l => l).map(l => JSON.parse(l));
    console.log(`✅ Loaded ${rawArray.length} songs`);
  } catch (err) {
    console.error('❌ songs.jsonl yüklenemedi:', err.message);
    selectedInfo.innerHTML = '<p class="empty-msg" style="color:var(--accent)">songs.jsonl yüklenemedi. Dosyanın index.html ile aynı klasörde olduğundan emin olun.</p>';
  }

  songsByProvince = processData(rawArray);
  allSongs = rawArray;

  const totalEl = document.getElementById('total-count');
  if (totalEl) totalEl.textContent = rawArray.length;

  const digerCount = (songsByProvince['Diğer'] || []).length;
  const badge = document.getElementById('diger-count');
  if (badge) badge.textContent = digerCount;
  digerBtn.style.display = digerCount > 0 ? 'flex' : 'none';

  applyTransform();
  wireProvinces();
});