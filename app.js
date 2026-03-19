/**
 * Türkiye İnteraktif Türkü Haritası — app.js
 * ─────────────────────────────────────────────
 * Features:
 *   • Fetch songs.json (falls back to MOCK_DATA if fetch fails / local file system)
 *   • Name-normalisation so "Diyarbakir" in SVG matches "Diyarbakır" in JSON
 *   • Hover effects + custom tooltip that follows the cursor
 *   • Mouse-wheel zoom centred on cursor position
 *   • Click-and-drag pan
 *   • +/– zoom buttons and Reset button
 *   • Side-panel persistent info on click
 */

/* ── MOCK DATA (fallback for local file:// usage) ─────────────────────────── */
const MOCK_DATA = {
  "Sivas":      ["Uzun İnce Bir Yoldayım", "Sivas Ellerinde Sazım Çalınır", "Çiğdem Der Ki Ben Elayım"],
  "Kırşehir":  ["Zahidem", "Yalan Dünya", "Gönül Dağı"],
  "Şanlıurfa": ["Urfa'nın Etrafı Dumanlı Dağlar", "Nemrudun Kızı", "Fincanın Etrafı Yeşil"],
  "Kayseri":   ["Gesi Bağları", "Erkilet Güzeli Bağlar Bozuyor"],
  "İzmir":     ["İzmir'in Kavakları", "Fayton"],
  "Ankara":    ["Fidayda", "Misket"],
  "Erzincan":  ["Erzincan'a Girdim Ne Güzel Bağlar", "Munzur Dağı Silemedim Yaşını"],
  "Diyarbakır":["Suzan Suzi", "Diyarbakır Etrafında Bağlar Var"],
  "Trabzon":   ["Divane Aşık Gibi", "Maçka Yolları Taşlı"],
  "Bursa":     ["Zeytinyağlı Yiyemem Aman", "Bursa'nın Ufak Tefek Taşları"]
};

/* ── NAME NORMALISATION MAP ────────────────────────────────────────────────
   SVG `name` attribute  →  canonical display name (matches JSON key)
   Only entries that differ from the JSON key are listed here.
   Everything else is matched case-insensitively after stripping diacritics.
*/
const NAME_MAP = {
  /* SVG name        :  display / JSON key */
  "Sanliurfa"        : "Şanlıurfa",
  "Diyarbakir"       : "Diyarbakır",
  "Izmir"            : "İzmir",
  "Kirsehir"         : "Kırşehir",
  "Mugla"            : "Muğla",
  "Kutahya"          : "Kütahya",
  "Kütahya"          : "Kütahya",
  "Bingöl"           : "Bingöl",
  "Düzce"            : "Düzce",
  "Gümüshane"        : "Gümüşhane",
  "K. Maras"         : "Kahramanmaraş",
  "Kinkkale"         : "Kırıkkale",
  "Zinguldak"        : "Zonguldak",
  "Çankiri"          : "Çankırı",
  "Çanakkale"        : "Çanakkale",
  "Çorum"            : "Çorum",
  "Bartın"           : "Bartın",
  "Adiyaman"         : "Adıyaman",
  "Agri"             : "Ağrı",
  "Afyonkarahisar"   : "Afyonkarabisar",
  "Iğdir"            : "Iğdır",
  "Istanbul"         : "İstanbul",
  "Elazig"           : "Elazığ",
  "Nevsehir"         : "Nevşehir",
  "Eskisehir"        : "Eskişehir",
  "Usak"             : "Uşak",
  "Balikesir"        : "Balıkesir",
  "Tekirdag"         : "Tekirdağ",
  "Kirklareli"       : "Kırklareli",
  "Nigde"            : "Niğde",
  "Aydin"            : "Aydın",
  "Siirt"            : "Siirt",
  "Sirnak"           : "Şırnak",
};

/* ── STATE ─────────────────────────────────────────────────────────────────── */
let songData  = {};       // populated after fetch
let scale     = 1;
let translateX = 0;
let translateY = 0;

const MIN_SCALE = 0.5;
const MAX_SCALE = 8;
const ZOOM_STEP = 0.25;

/* ── DOM REFS ───────────────────────────────────────────────────────────────── */
const mapWrapper    = document.getElementById('map-wrapper');
const mapContainer  = document.getElementById('map-container');
const tooltip       = document.getElementById('tooltip');
const scaleBadge    = document.getElementById('scale-badge');
const selectedInfo  = document.getElementById('selected-info');

/* ── UTILITY: resolve SVG name → canonical name ─────────────────────────────── */
function resolveName(svgName) {
  if (!svgName) return svgName;
  if (NAME_MAP[svgName]) return NAME_MAP[svgName];
  // Try direct case-insensitive match against JSON keys
  const lower = svgName.toLowerCase();
  for (const key of Object.keys(songData)) {
    if (key.toLowerCase() === lower) return key;
  }
  return svgName; // no match – return as-is (will show "Henüz türkü eklenmedi")
}

/* ── UTILITY: get songs for a province by its SVG name ─────────────────────── */
function getSongs(svgName) {
  const canonical = resolveName(svgName);
  return songData[canonical] || null;
}

/* ── TRANSFORM APPLICATION ──────────────────────────────────────────────────── */
function applyTransform(animated = false) {
  if (animated) {
    mapContainer.style.transition = 'transform 0.3s cubic-bezier(.4,0,.2,1)';
    requestAnimationFrame(() => {
      mapContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      setTimeout(() => { mapContainer.style.transition = 'none'; }, 320);
    });
  } else {
    mapContainer.style.transition = 'none';
    mapContainer.style.transform  = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
  scaleBadge.textContent = `${Math.round(scale * 100)}%`;
}

/* ── ZOOM LOGIC ─────────────────────────────────────────────────────────────── */
function zoomAt(cx, cy, newScale) {
  newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

  // Adjust translate so the point under the cursor stays fixed
  translateX = cx - (cx - translateX) * (newScale / scale);
  translateY = cy - (cy - translateY) * (newScale / scale);
  scale = newScale;
  applyTransform();
}

/* ── WHEEL ZOOM ─────────────────────────────────────────────────────────────── */
mapWrapper.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect    = mapWrapper.getBoundingClientRect();
  const cx      = e.clientX - rect.left;
  const cy      = e.clientY - rect.top;
  const delta   = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
  zoomAt(cx, cy, scale + delta);
}, { passive: false });

/* ── DRAG (PAN) ─────────────────────────────────────────────────────────────── */
let isDragging  = false;
let dragStartX  = 0;
let dragStartY  = 0;
let dragOriginX = 0;
let dragOriginY = 0;

mapWrapper.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  isDragging  = true;
  dragStartX  = e.clientX;
  dragStartY  = e.clientY;
  dragOriginX = translateX;
  dragOriginY = translateY;
  mapContainer.classList.add('dragging');
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  translateX = dragOriginX + (e.clientX - dragStartX);
  translateY = dragOriginY + (e.clientY - dragStartY);
  applyTransform();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  mapContainer.classList.remove('dragging');
});

/* ── TOUCH PAN (single finger) ──────────────────────────────────────────────── */
let lastTouchX = 0;
let lastTouchY = 0;

mapWrapper.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging  = true;
    lastTouchX  = e.touches[0].clientX;
    lastTouchY  = e.touches[0].clientY;
    dragOriginX = translateX;
    dragOriginY = translateY;
    dragStartX  = lastTouchX;
    dragStartY  = lastTouchY;
  }
}, { passive: true });

mapWrapper.addEventListener('touchmove', (e) => {
  if (isDragging && e.touches.length === 1) {
    translateX = dragOriginX + (e.touches[0].clientX - dragStartX);
    translateY = dragOriginY + (e.touches[0].clientY - dragStartY);
    applyTransform();
  }
}, { passive: true });

mapWrapper.addEventListener('touchend', () => { isDragging = false; });

/* ── ZOOM BUTTONS ───────────────────────────────────────────────────────────── */
document.getElementById('btn-zoom-in').addEventListener('click', () => {
  const rect = mapWrapper.getBoundingClientRect();
  zoomAt(rect.width / 2, rect.height / 2, scale + ZOOM_STEP);
  applyTransform(true);
});

document.getElementById('btn-zoom-out').addEventListener('click', () => {
  const rect = mapWrapper.getBoundingClientRect();
  zoomAt(rect.width / 2, rect.height / 2, scale - ZOOM_STEP);
  applyTransform(true);
});

document.getElementById('btn-reset').addEventListener('click', () => {
  scale      = 1;
  translateX = 0;
  translateY = 0;
  applyTransform(true);
});

/* ── TOOLTIP ────────────────────────────────────────────────────────────────── */
function showTooltip(svgName, cx, cy) {
  const displayName = resolveName(svgName);
  const songs       = getSongs(svgName);

  tooltip.className = 'visible' + (songs ? ' has-data-tt' : '');
  tooltip.querySelector('h2').textContent = displayName;

  const ul = tooltip.querySelector('ul');
  ul.innerHTML = '';

  if (songs && songs.length) {
    songs.forEach(song => {
      const li = document.createElement('li');
      li.textContent = song;
      ul.appendChild(li);
    });
    tooltip.querySelector('.no-data').style.display = 'none';
  } else {
    tooltip.querySelector('.no-data').style.display = 'block';
  }

  positionTooltip(cx, cy);
}

function positionTooltip(cx, cy) {
  const tw = tooltip.offsetWidth  || 240;
  const th = tooltip.offsetHeight || 120;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const OFFSET = 16;
  let left = cx + OFFSET;
  let top  = cy + OFFSET;

  if (left + tw > vw - 8) left = cx - tw - OFFSET;
  if (top  + th > vh - 8) top  = cy - th - OFFSET;

  tooltip.style.left = `${left}px`;
  tooltip.style.top  = `${top}px`;
}

function hideTooltip() {
  tooltip.className = '';
}

/* ── SIDE PANEL UPDATE ──────────────────────────────────────────────────────── */
function updateSidePanel(svgName) {
  if (!selectedInfo) return;
  const displayName = resolveName(svgName);
  const songs       = getSongs(svgName);

  let html = `<h3>${displayName}</h3>`;
  if (songs && songs.length) {
    html += '<ul>' + songs.map(s => `<li>${s}</li>`).join('') + '</ul>';
  } else {
    html += `<p class="empty-msg">Henüz türkü eklenmedi.</p>`;
  }
  selectedInfo.innerHTML = html;
}

/* ── PROVINCE EVENT WIRING ──────────────────────────────────────────────────── */
function wireProvinces() {
  const svg = mapContainer.querySelector('svg');
  if (!svg) { console.warn('SVG not found inside #map-container'); return; }

  const paths = svg.querySelectorAll('path[name]');

  paths.forEach(path => {
    const svgName = path.getAttribute('name');

    // Mark provinces that have song data
    if (getSongs(svgName)) {
      path.classList.add('has-data');
    }

    path.addEventListener('mouseover', (e) => {
      e.stopPropagation();
      showTooltip(svgName, e.clientX, e.clientY);
    });

    path.addEventListener('mousemove', (e) => {
      positionTooltip(e.clientX, e.clientY);
    });

    path.addEventListener('mouseout', () => {
      hideTooltip();
    });

    path.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSidePanel(svgName);
    });
  });
}

/* ── DATA LOAD ──────────────────────────────────────────────────────────────── */
async function loadData() {
  try {
    const response = await fetch('songs.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    songData = await response.json();
    console.log('✅ songs.json loaded from server:', Object.keys(songData).length, 'entries');
  } catch (err) {
    console.warn('⚠️ Could not fetch songs.json, using mock data.', err.message);
    songData = MOCK_DATA;
  }
}

/* ── INIT ───────────────────────────────────────────────────────────────────── */
async function init() {
  await loadData();
  applyTransform();
  wireProvinces();
}

document.addEventListener('DOMContentLoaded', init);
