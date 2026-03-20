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

/* ── DATA → CANONICAL PROVINCE NAME ────────────────────────────────────────────
   Maps short/alternate yoresi_ili values in the JSONL data to the canonical
   province name used as the key in songsByProvince (Title Case, matching SVG).
   Add new entries here whenever the data uses a non-standard name.
*/
const DATA_TO_PROVINCE = {
  // Afyon variants
  "AFYON"              : "Afyonkarahisar",
  "AFYONKARAHİSAR"     : "Afyonkarahisar",
  "AFYONKARAHISAR"     : "Afyonkarahisar",
  // Muş — data may use ASCII "MUS"
  "MUS"                : "Muş",
  "MUŞ"                : "Muş",
  // Kahramanmaraş variants
  "K. MARAŞ"           : "Kahramanmaraş",
  "K.MARAŞ"            : "Kahramanmaraş",
  "KAHRAMANMARAŞ"      : "Kahramanmaraş",
  "KAHRAMAN MARAŞ"     : "Kahramanmaraş",
  // Other common ASCII/short variants
  "AGRI"               : "Ağrı",
  "AĞRI"               : "Ağrı",
  "IGDIR"              : "Iğdır",
  "IĞDIR"              : "Iğdır",
  "ELAZIG"             : "Elazığ",
  "ELAZIĞ"             : "Elazığ",
  "NEVSEHIR"           : "Nevşehir",
  "NEVŞEHİR"           : "Nevşehir",
  "SANLIURFA"          : "Şanlıurfa",
  "ŞANLIURFA"          : "Şanlıurfa",
  "DIYARBAKIR"         : "Diyarbakır",
  "DİYARBAKIR"         : "Diyarbakır",
  "SIRNAK"             : "Şırnak",
  "ŞIRNAK"             : "Şırnak",
  "USAK"               : "Uşak",
  "UŞAK"               : "Uşak",
  "MUGLA"              : "Muğla",
  "MUĞLA"              : "Muğla",
  "KUTAHYA"            : "Kütahya",
  "KÜTAHYA"            : "Kütahya",
  "ESKISEHIR"          : "Eskişehir",
  "ESKİŞEHİR"          : "Eskişehir",
  "TEKIRDAG"           : "Tekirdağ",
  "TEKİRDAĞ"           : "Tekirdağ",
  "KIRKLARELI"         : "Kırklareli",
  "KIRKLARELİ"         : "Kırklareli",
  "KIRSEHIR"           : "Kırşehir",
  "KIRŞEHİR"           : "Kırşehir",
  "KIRIKKALE"          : "Kırıkkale",
  "KIRIKKALE"          : "Kırıkkale",
  "BALIKESIR"          : "Balıkesir",
  "BALIKESİR"          : "Balıkesir",
  "CANAKKALE"          : "Çanakkale",
  "ÇANAKKALE"          : "Çanakkale",
  "CANKIRI"            : "Çankırı",
  "ÇANKIRI"            : "Çankırı",
  "CORUM"              : "Çorum",
  "ÇORUM"              : "Çorum",
  "AYDIN"              : "Aydın",
  "AYDIN"              : "Aydın",
  "ADIYAMAN"           : "Adıyaman",
  "ADIYAMAN"           : "Adıyaman",
  "GUMUSHANE"          : "Gümüşhane",
  "GÜMÜŞHANE"          : "Gümüşhane",
  "NIGDE"              : "Niğde",
  "NİĞDE"              : "Niğde",
  "BARTIN"             : "Bartın",
  "BARTIN"             : "Bartın",
  "DUZCE"              : "Düzce",
  "DÜZCE"              : "Düzce",
  "BINGOL"             : "Bingöl",
  "BİNGÖL"             : "Bingöl",
  "ISTANBUL"           : "İstanbul",
  "İSTANBUL"           : "İstanbul",
  "IZMIR"              : "İzmir",
  "İZMİR"              : "İzmir",
};

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
  "Aydin":"Aydın","Siirt":"Siirt","Sirnak":"Şırnak","Mus":"Muş",
};

/* ── NAMED EXTRA REGIONS (get their own button, not lumped into Diğer) ────────── */
const NAMED_REGIONS = {
  "RUMELİ"    : "Rumeli",
  "RUMELI"    : "Rumeli",
  "KIRKÜK"    : "Kerkük",
  "KERKÜK"    : "Kerkük",
  "KERKUK"    : "Kerkük",
  "AZERBAYCAN": "Azerbaycan",
  "KIBRIS"    : "Kıbrıs",
  "KIBRIŞ"    : "Kıbrıs",
  "KIBRИС"    : "Kıbrıs",
  "MUSUL"     : "Musul",
  "KIRIM"     : "Kırım",
  "KIRИМ"     : "Kırım",
};

/* ── PROVINCE LABEL COORDINATES (from SVG label_points, viewBox 0 0 1000 422) ── */
const PROVINCE_COORDS = {
  "Adana":[511.6,315.2],"Adiyaman":[654.1,282.2],"Afyonkarahisar":[277.4,233.6],
  "Agri":[869.6,173.1],"Aksaray":[434.1,252.8],"Amasya":[520.5,110.0],
  "Ankara":[374.2,163.1],"Antalya":[260.9,341.5],"Ardahan":[859.9,77.1],
  "Artvin":[807.8,83.6],"Aydin":[157.0,289.6],"Balikesir":[151.2,166.5],
  "Bartın":[369.3,53.1],"Batman":[794.5,257.1],"Bayburt":[736.9,133.7],
  "Bilecik":[254.6,145.8],"Bingöl":[763.2,210.5],"Bitlis":[837.3,242.3],
  "Bolu":[331.9,112.6],"Burdur":[247.3,305.0],"Bursa":[205.6,151.1],
  "Denizli":[216.6,283.6],"Diyarbakir":[737.1,269.4],"Düzce":[311.3,95.8],
  "Edirne":[87.9,81.4],"Elazig":[686.5,236.8],"Erzincan":[675.3,168.3],
  "Erzurum":[799.5,154.0],"Eskisehir":[302.9,174.3],"Gaziantep":[604.7,330.0],
  "Giresun":[656.3,115.1],"Gümüshane":[698.7,135.0],"Hakkari":[925.7,298.3],
  "Hatay":[546.0,370.8],"Isparta":[299.1,277.4],"Istanbul":[176.3,73.8],
  "Izmir":[127.6,259.0],"Iğdir":[915.7,161.9],"K. Maras":[580.1,277.2],
  "Karabük":[378.4,77.9],"Karaman":[398.4,323.7],"Kars":[875.3,126.2],
  "Kastamonu":[421.0,56.5],"Kayseri":[519.8,237.9],"Kilis":[586.2,344.3],
  "Kinkkale":[424.4,166.1],"Kirklareli":[126.1,47.6],"Kirsehir":[448.9,192.6],
  "Kocaeli":[254.3,93.2],"Konya":[368.1,267.4],"Kütahya":[231.8,194.5],
  "Malatya":[630.1,234.9],"Manisa":[175.1,230.6],"Mardin":[770.8,307.9],
  "Mersin":[432.7,353.6],"Mugla":[184.9,328.4],"Mus":[808.6,219.4],
  "Nevsehir":[473.8,226.7],"Nigde":[472.6,272.5],"Ordu":[609.4,101.2],
  "Osmaniye":[550.1,322.8],"Rize":[768.1,92.4],"Sakarya":[274.8,107.5],
  "Samsun":[529.3,74.0],"Sanliurfa":[688.5,321.0],"Siirt":[822.5,277.5],
  "Sinop":[483.6,48.4],"Sirnak":[843.9,306.9],"Sivas":[600.3,177.5],
  "Tekirdag":[115.5,87.1],"Tokat":[568.3,122.1],"Trabzon":[716.4,101.0],
  "Tunceli":[704.7,204.0],"Usak":[223.2,242.7],"Van":[900.1,246.9],
  "Yalova":[215.4,114.7],"Yozgat":[504.6,176.7],"Zinguldak":[343.3,71.5],
  "Çanakkale":[100.3,147.9],"Çankiri":[422.0,108.9],"Çorum":[471.6,120.2],
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
    let key;
    if (DATA_TO_PROVINCE[norm]) {
      key = DATA_TO_PROVINCE[norm];
    } else if (NAMED_REGIONS[norm]) {
      key = NAMED_REGIONS[norm];
    } else if (TURKISH_PROVINCES.has(norm)) {
      key = toTitleCase(raw);
    } else {
      key = 'Diğer';
    }
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
  <p class="diger-note">Diğer yöreler veya yöresi net bilinmeyen türküler</p>`;
  html += songs.length > 0
    ? songs.map(s => buildSongCard(s)).join('')
    : '<p class="empty-msg">Henüz türkü eklenmedi.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
  if (window.innerWidth <= 700) openDrawer();
}

function showRegionPanel(regionName) {
  const songs = songsByProvince[regionName] || [];
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  digerBtn.classList.remove('active');
  // Deactivate other region buttons, activate this one
  document.querySelectorAll('.btn-region').forEach(b => b.classList.remove('active'));
  const thisBtn = document.querySelector(`[data-region="${regionName}"]`);
  if (thisBtn) thisBtn.classList.add('active');

  let html = `<div class="panel-province-header">
    <h3>${regionName}</h3>
    <span class="panel-count">${songs.length} türkü</span>
  </div>`;
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
  selectedInfo.innerHTML = '<p class="empty-msg">Bir ilin üzerine gelin ve tıklayın…</p>';
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

/* ── KEYBOARD NAV STATE ─────────────────────────────────────────────────────── */
let provincePaths = [];   // ordered list of all path elements
let kbIndex       = -1;   // currently keyboard-focused province index

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

/* ── KEYBOARD NEIGHBOR FINDING ──────────────────────────────────────────────── */
function findNeighbor(fromIndex, arrowKey) {
  // If no current province, start from westernmost
  if (fromIndex < 0) {
    let best = 0, bestX = Infinity;
    provincePaths.forEach((p, i) => {
      const c = PROVINCE_COORDS[p.getAttribute('name')];
      if (c && c[0] < bestX) { bestX = c[0]; best = i; }
    });
    return best;
  }

  const fromName = provincePaths[fromIndex].getAttribute('name');
  const from = PROVINCE_COORDS[fromName];
  if (!from) return fromIndex;

  const [fx, fy] = from;

  const dirs = {
    'ArrowRight': [ 1,  0],
    'ArrowLeft':  [-1,  0],
    'ArrowUp':    [ 0, -1],
    'ArrowDown':  [ 0,  1],
  };
  const [dx, dy] = dirs[arrowKey];

  // Collect all candidates that are in the right half-plane
  const candidates = [];
  provincePaths.forEach((p, i) => {
    if (i === fromIndex) return;
    const name = p.getAttribute('name');
    const c = PROVINCE_COORDS[name];
    if (!c) return;
    const relX = c[0] - fx;
    const relY = c[1] - fy;
    const dot  = relX * dx + relY * dy;
    if (dot <= 0) return;           // wrong direction
    const dist     = Math.sqrt(relX * relX + relY * relY);
    const cosAngle = dot / dist;    // 1 = perfectly aligned, 0 = perpendicular
    candidates.push({ i, dist, cosAngle });
  });

  if (!candidates.length) return fromIndex;

  // Sort by distance ascending, take only the closest ~8 to limit search space
  candidates.sort((a, b) => a.dist - b.dist);
  const pool = candidates.slice(0, 8);

  // Among the pool, pick the one with the best alignment (highest cosAngle)
  // but heavily penalise those with poor alignment (< 0.5 = >60° off-axis)
  let bestIndex = -1;
  let bestScore = Infinity;
  pool.forEach(({ i, dist, cosAngle }) => {
    // Reject candidates more than 70° off the target direction
    if (cosAngle < 0.34) return;
    // Score = dist * (2 - cosAngle)²  → nearby + aligned wins
    const score = dist * Math.pow(2 - cosAngle, 2);
    if (score < bestScore) { bestScore = score; bestIndex = i; }
  });

  // Fallback: if angle filter eliminated everyone, just take closest in pool
  if (bestIndex === -1) bestIndex = pool[0].i;

  return bestIndex;
}

/* ── PROVINCE WIRING ────────────────────────────────────────────────────────── */
function wireProvinces() {
  const svg = mapContainer.querySelector('svg');
  if (!svg) return;
  provincePaths = Array.from(svg.querySelectorAll('path[name]'));

  provincePaths.forEach((path, idx) => {
    const svgName = path.getAttribute('name');
    if (getSongsFor(svgName)?.length) path.classList.add('has-data');

    // Make focusable for keyboard nav
    path.setAttribute('tabindex', '-1');

    path.addEventListener('mouseover', e => {
      if (window.innerWidth <= 700) return;
      e.stopPropagation();
      showTooltip(svgName, e.clientX, e.clientY);
    });
    path.addEventListener('mousemove', e => {
      if (window.innerWidth <= 700) return;
      positionTooltip(e.clientX, e.clientY);
    });
    path.addEventListener('mouseout', () => {
      hideTooltip();
    });
    path.addEventListener('click', e => {
      e.stopPropagation();
      selectProvince(path, svgName);
      kbIndex = idx;
    });
    path.addEventListener('focus', () => {
      kbIndex = idx;
    });
  });
}

/* ── SELECT PROVINCE (shared by click + keyboard Enter) ─────────────────────── */
function selectProvince(path, svgName) {
  // Clear classes and blur all paths reliably
  provincePaths.forEach(p => {
    p.classList.remove('active-province', 'kb-focus');
    p.blur(); 
  });

  activePanel = path;
  path.classList.add('active-province');
  
  // Force the browser to shift focus to the new element
  path.focus({ preventScroll: true });

  digerBtn.classList.remove('active');
  document.querySelectorAll('.btn-region').forEach(b => b.classList.remove('active'));
  if (searchInput) { searchInput.value = ''; searchClear.classList.remove('visible'); }
  const songs = getSongsFor(svgName);
  updateSidePanel(resolveName(svgName), songs);
  if (window.innerWidth <= 700) openDrawer();
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

  // Named region buttons (Rumeli, Kerkük, Azerbaycan…)
  document.getElementById('extra-regions').addEventListener('click', e => {
    const btn = e.target.closest('[data-region]');
    if (btn) showRegionPanel(btn.dataset.region);
  });
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
  digerBtn.style.display = digerCount > 0 ? 'inline-flex' : 'none';

  // Populate named region buttons
  const regionContainer = document.getElementById('extra-regions');
  Object.values(NAMED_REGIONS).forEach(regionName => {
    const count = (songsByProvince[regionName] || []).length;
    const countEl = document.getElementById('count-' + regionName);
    if (countEl) countEl.textContent = count;
    const btn = regionContainer?.querySelector(`[data-region="${regionName}"]`);
    if (btn) btn.style.display = count > 0 ? 'inline-flex' : 'none';
  });

  applyTransform();
  wireProvinces();

  // Keyboard navigation — registered after wireProvinces so provincePaths is populated
  window.addEventListener('keydown', e => {
    if (document.activeElement === searchInput) return;
    if (!provincePaths.length) return;
    if (!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Enter',' ','Escape'].includes(e.key)) return;
    e.preventDefault();

    if (e.key === 'Escape') {
      hideTooltip();
      provincePaths.forEach(p => p.classList.remove('kb-focus'));
      kbIndex = -1;
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      console.log('Enter pressed, kbIndex:', kbIndex, provincePaths[kbIndex]?.getAttribute('name'));
      if (kbIndex >= 0) {
        const path = provincePaths[kbIndex];
        hideTooltip();
        selectProvince(path, path.getAttribute('name'));
      }
      return;
    }

    const next = findNeighbor(kbIndex, e.key);
    if (next === -1) return;
    kbIndex = next;

    const path = provincePaths[kbIndex];
    const svgName = path.getAttribute('name');

    // Highlight without selecting — clear any previous mouse/click selection
    if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
    
    // Blur all paths so CSS :focus pseudo-class doesn't keep the clicked city red
    provincePaths.forEach(p => { p.classList.remove('kb-focus'); p.blur(); });
    path.classList.add('kb-focus');

    // Force focus to the new element while navigating with arrows
    path.focus({ preventScroll: true });

    if (window.innerWidth > 700) {
      const coords = PROVINCE_COORDS[svgName];
      if (coords) {
        const svgEl = mapContainer.querySelector('svg');
        const pt = svgEl.createSVGPoint();
        pt.x = coords[0]; pt.y = coords[1];
        const screen = pt.matrixTransform(svgEl.getScreenCTM());
        showTooltip(svgName, screen.x, screen.y);
      }
    }
  });
});