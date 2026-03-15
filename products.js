/* ============================================================
   HAJI WADUD PARTS — PRODUCTS PAGE v3.0
   🆕 BATCH 2 UPGRADES:
   ✅ Product detail modal — click any card to see full details
   ✅ WhatsApp inquiry link pre-fills product name in message
   ✅ Category badge shown on each card
   ✅ Favorites fully integrated (no monkey-patching render)
   ✅ Hover "Inquire on WhatsApp" button on each card
   ✅ Keyboard shortcut: Ctrl/Cmd+K focuses search, Escape clears
   ✅ Smooth card entrance animation on page load
   ✅ Fixed applyFilters so favorites filter is built-in (no patch)
   ✅ Proper escapeHTML + highlight helpers
   ============================================================ */

'use strict';

/* ── ❶  CONFIGURATION ── */
const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX5mMXfl-gxvEPGLJ-MB4ySw_-8xSNaCeImbFpBwvRF33NphvgTjIaKQ-I8Loc6t4SIEt3UiAv5lEz/pub?gid=2052837076&single=true&output=csv';

const CONFIG = {
    itemsPerPage: 24,
    cacheMinutes: 5,
    cacheKey:    'hw_price_cache',
    cacheTimeKey:'hw_price_cache_ts',
};

/* ── ❷  CATEGORY KEYWORDS ── */
const CATEGORY_KEYWORDS = {
    '175':       ['175', '১৭৫'],
    '205':       ['205', '২০৫'],
    '225':       ['225', '২২৫'],
    'bearings':  [
        'bbc','ebh','nachi','sqy','6001','6002','6003','6004','6005',
        '6007','6200','6201','6202','6203','6204','6205','6301','6302',
        '6304','6305','16007','63/28','bearing','বেয়ারিং',
    ],
    'tires':     ['টায়ার','টিউব','tire','tube'],
    'oils':      ['মবিল','গ্রিজ','eppco','gulf','titan','total','bno','german oil','grease','oil'],
    'electrical':['সুইচ','switch','সিডি','cdi','চার্জার','charger','ওয়ারিং','wiring','লাইট','light','কয়েল','coil'],
};

const CATEGORY_LABELS = {
    '175': '175 Series', '205': '205 Series', '225': '225 Series',
    'bearings': 'Bearings', 'tires': 'Tires & Tubes',
    'oils': 'Oils', 'electrical': 'Electrical', 'other': 'Other',
};

const CATEGORY_ICONS = {
    '175':'⚙️','205':'🔧','225':'🛠️','bearings':'🔩','tires':'🛞','oils':'🛢️','electrical':'🔌','other':'📦',
};

function categorize(name) {
    const n = name.toLowerCase();
    for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keys.some(k => n.includes(k))) return cat;
    }
    return 'other';
}

function getIcon(name)  { return CATEGORY_ICONS[categorize(name)]  ?? '📦'; }
function getLabel(name) { return CATEGORY_LABELS[categorize(name)] ?? 'Other'; }

/* ── ❸  STATE ── */
let allProducts  = [];
let filteredList = [];
let currentPage  = 1;
let showFavsOnly = false;

/* ── ❹  DOM HELPERS ── */
const $ = id => document.getElementById(id);

function showSection(section) {
    $('loaderState').style.display = section === 'loader' ? 'block' : 'none';
    $('errorState').style.display  = section === 'error'  ? 'block' : 'none';
    $('dataArea').style.display    = section === 'data'   ? 'block' : 'none';
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function highlight(text, query) {
    if (!query) return escapeHTML(text);
    const esc   = query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const regex = new RegExp(`(${esc})`, 'gi');
    return escapeHTML(text).replace(regex, '<mark>$1</mark>');
}

function fmtPrice(val) {
    if (!val || val === '') return '—';
    const n = parseFloat(val);
    if (isNaN(n)) return '—';
    return '৳\u00A0' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── ❺  CSV PARSER (RFC 4180, handles Bengali Unicode) ── */
function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQ = false, i = 0;
    while (i < text.length) {
        const ch = text[i], nx = text[i+1];
        if (inQ) {
            if (ch === '"' && nx === '"') { field += '"'; i += 2; }
            else if (ch === '"')          { inQ = false; i++; }
            else                          { field += ch; i++; }
        } else {
            if      (ch === '"')                   { inQ = true; i++; }
            else if (ch === ',')                   { row.push(field.trim()); field = ''; i++; }
            else if (ch==='\r' && nx==='\n')       { row.push(field.trim()); rows.push(row); row=[]; field=''; i+=2; }
            else if (ch==='\n' || ch==='\r')       { row.push(field.trim()); rows.push(row); row=[]; field=''; i++; }
            else                                   { field += ch; i++; }
        }
    }
    if (field !== '' || row.length) { row.push(field.trim()); if(row.some(f=>f!=='')) rows.push(row); }
    return rows;
}

function csvToProducts(rows) {
    if (!rows || rows.length < 2) return [];
    return rows.slice(1)
        .filter(r => r.length >= 2 && r[1])
        .map(r => ({ serial: r[0]||'', name: r[1]||'', wholesale: r[2]||'', selling: r[3]||'' }));
}

/* ── ❻  FETCH WITH CACHE ── */
async function fetchSheetData(forceRefresh = false) {
    const now      = Date.now();
    const cached   = sessionStorage.getItem(CONFIG.cacheKey);
    const cachedTs = parseInt(sessionStorage.getItem(CONFIG.cacheTimeKey)||'0', 10);
    if (!forceRefresh && cached && (now - cachedTs) < CONFIG.cacheMinutes * 60000) return cached;
    const url = SHEET_CSV_URL.includes('?')
        ? `${SHEET_CSV_URL}&_cb=${now}` : `${SHEET_CSV_URL}?_cb=${now}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const text = await res.text();
    sessionStorage.setItem(CONFIG.cacheKey, text);
    sessionStorage.setItem(CONFIG.cacheTimeKey, String(now));
    return text;
}

/* ── ❼  MAIN LOAD ── */
async function loadData(forceRefresh = false) {
    showSection('loader');
    try {
        const csvText = await fetchSheetData(forceRefresh);
        const rows    = parseCSV(csvText);
        allProducts   = csvToProducts(rows);
        if (allProducts.length === 0) throw new Error('Sheet appears to be empty or columns do not match.');
        applyFilters();
        showSection('data');
        updateTimestamp();
        if (forceRefresh && typeof showToast === 'function')
            showToast(`✓ Products refreshed — ${allProducts.length} items loaded.`);
    } catch (err) {
        console.error('[Products] Fetch error:', err);
        $('errorMsg').textContent = err.message.startsWith('HTTP') || err.message.includes('Sheet')
            ? `Error: ${err.message} — Ensure the Google Sheet is published.`
            : 'Network error. Check your connection and try again.';
        showSection('error');
    }
}

/* ── ❽  FILTER + SORT (favorites built-in, no patching) ── */
function applyFilters() {
    const query    = ($('searchInput')?.value || '').toLowerCase().trim();
    const category = $('categoryFilter')?.value || 'all';
    const favs     = typeof window.getFavorites === 'function' ? window.getFavorites() : [];

    filteredList = allProducts.filter(p => {
        if (showFavsOnly && !favs.includes(p.serial)) return false;
        const matchSearch = !query || p.name.toLowerCase().includes(query) || p.serial.toLowerCase().includes(query);
        const matchCat    = category === 'all' || categorize(p.name) === category;
        return matchSearch && matchCat;
    });

    currentPage = 1;
    applySort();
}

function applySort() {
    const sort = $('sortFilter')?.value || 'serial';
    if (sort === 'name') {
        filteredList.sort((a,b) => a.name.localeCompare(b.name));
    } else if (sort === 'price-low') {
        filteredList.sort((a,b) => (parseFloat(a.wholesale)||Infinity) - (parseFloat(b.wholesale)||Infinity));
    } else if (sort === 'price-high') {
        filteredList.sort((a,b) => (parseFloat(b.wholesale)||0) - (parseFloat(a.wholesale)||0));
    } else {
        filteredList.sort((a,b) => a.serial.localeCompare(b.serial, undefined, { numeric:true }));
    }
    render();
}

/* ── ❾  RENDER CARDS ── */
function render() {
    const grid      = $('productsGrid');
    const empty     = $('emptyState');
    const countEl   = $('resultCount');
    const resultsEl = $('resultsInfo');

    if (!grid) return;

    if (countEl) countEl.textContent = filteredList.length;

    if (filteredList.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        $('pagination').innerHTML = '';
        return;
    }
    if (empty) empty.style.display = 'none';

    const query = ($('searchInput')?.value || '').toLowerCase().trim();
    const start = (currentPage - 1) * CONFIG.itemsPerPage;
    const slice = filteredList.slice(start, start + CONFIG.itemsPerPage);
    const favs  = typeof window.getFavorites === 'function' ? window.getFavorites() : [];

    grid.innerHTML = slice.map((p, idx) => {
        const isFav   = favs.includes(p.serial);
        const cat     = categorize(p.name);
        const rowNum  = start + idx + 1;
        const serial  = escapeHTML(p.serial || String(rowNum));
        const waText  = encodeURIComponent(`Hello! I'm interested in:\nProduct: ${p.name}\nSerial: ${p.serial || rowNum}\nWholesale: ${fmtPrice(p.wholesale)}\nPlease provide availability.`);

        return `
        <article
            class="product-card"
            tabindex="0"
            role="button"
            aria-label="View details for ${escapeHTML(p.name)}"
            data-serial="${serial}"
            data-idx="${start + idx}"
            onclick="openModal(${start + idx})"
            onkeydown="if(event.key==='Enter'||event.key===' '){openModal(${start + idx});}"
        >
            <div class="product-card-header">
                <div class="product-card-icon" aria-hidden="true">${getIcon(p.name)}</div>
                <button
                    class="fav-btn ${isFav ? 'active' : ''}"
                    aria-label="${isFav ? 'Remove from' : 'Add to'} favorites"
                    onclick="event.stopPropagation(); toggleFavCard(this, '${serial}')"
                    title="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
                >
                    <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
            </div>
            <span class="product-card-cat">${CATEGORY_LABELS[cat]}</span>
            <div class="product-card-serial">Serial #${serial}</div>
            <div class="product-card-name">${highlight(p.name, query)}</div>
            <div class="product-card-prices">
                <div class="price-item">
                    <div class="price-item-label">Wholesale</div>
                    <div class="price-item-value">${fmtPrice(p.wholesale)}</div>
                </div>
                <div class="price-item">
                    <div class="price-item-label">Retail</div>
                    <div class="price-item-value">${fmtPrice(p.selling)}</div>
                </div>
            </div>
            <a
                href="https://wa.me/8801XXXXXXXXX?text=${waText}"
                class="card-wa-btn"
                target="_blank"
                rel="noopener noreferrer"
                onclick="event.stopPropagation()"
                aria-label="Inquire about ${escapeHTML(p.name)} on WhatsApp"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Inquire on WhatsApp
            </a>
        </article>`;
    }).join('');

    renderPagination();
}

/* ── ❿  PAGINATION ── */
function renderPagination() {
    const totalPages = Math.ceil(filteredList.length / CONFIG.itemsPerPage);
    const nav = $('pagination');
    if (totalPages <= 1) { nav.innerHTML = ''; return; }

    const MAX = 5;
    let sp = Math.max(1, currentPage - Math.floor(MAX/2));
    let ep = Math.min(totalPages, sp + MAX - 1);
    if (ep - sp < MAX - 1) sp = Math.max(1, ep - MAX + 1);

    let html = `<button class="page-btn" onclick="changePage(${currentPage-1})" ${currentPage===1?'disabled':''} aria-label="Previous page">← Prev</button>`;
    if (sp > 1) { html += `<button class="page-btn" onclick="changePage(1)">1</button>`; if(sp>2) html += `<span class="page-ellipsis">…</span>`; }
    for (let i = sp; i <= ep; i++) html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="changePage(${i})" aria-label="Page ${i}" ${i===currentPage?'aria-current="page"':''}>${i}</button>`;
    if (ep < totalPages) { if(ep<totalPages-1) html+=`<span class="page-ellipsis">…</span>`; html+=`<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`; }
    html += `<button class="page-btn" onclick="changePage(${currentPage+1})" ${currentPage===totalPages?'disabled':''} aria-label="Next page">Next →</button>`;
    nav.innerHTML = html;
}

function changePage(page) {
    const total = Math.ceil(filteredList.length / CONFIG.itemsPerPage);
    if (page < 1 || page > total) return;
    currentPage = page;
    render();
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.changePage = changePage;

/* ── ⓫  TIMESTAMP ── */
function updateTimestamp() {
    const ts = $('lastUpdated');
    if (!ts) return;
    ts.innerHTML = `Data last fetched: <span>${new Date().toLocaleString('en-BD',{dateStyle:'medium',timeStyle:'short'})}</span>`;
}

/* ── ⓬  TOGGLE FAV ON CARD (without opening modal) ── */
function toggleFavCard(btn, serial) {
    if (!window.toggleFavorite) return;
    window.toggleFavorite(serial);
    const isFav = window.isFavorite(serial);
    btn.classList.toggle('active', isFav);
    btn.setAttribute('aria-label', (isFav ? 'Remove from' : 'Add to') + ' favorites');
    const svgPath = btn.querySelector('svg');
    if (svgPath) svgPath.setAttribute('fill', isFav ? 'currentColor' : 'none');
    // If showing favs only and we just un-faved, re-render
    if (showFavsOnly && !isFav) { applyFilters(); }
}
window.toggleFavCard = toggleFavCard;

/* ── ⓭  PRODUCT DETAIL MODAL  🆕 NEW ── */
function openModal(idx) {
    const p = filteredList[idx];
    if (!p) return;

    const overlay = $('productModal');
    const cat = categorize(p.name);
    const waText = encodeURIComponent(`Hello! I'd like to inquire about:\nProduct: ${p.name}\nSerial: ${p.serial || idx+1}\nWholesale: ${fmtPrice(p.wholesale)}\n\nIs this available?`);

    $('modalIcon').textContent   = getIcon(p.name);
    $('modalCat').textContent    = CATEGORY_LABELS[cat];
    $('modalSerial').textContent = `Serial #${p.serial || (idx+1)}`;
    $('modalTitle').textContent  = p.name;
    $('modalWholesale').textContent = fmtPrice(p.wholesale);
    $('modalRetail').textContent    = fmtPrice(p.selling);
    $('modalWaBtn').href = `https://wa.me/8801XXXXXXXXX?text=${waText}`;

    // Fav button state
    const favBtn = $('modalFavBtn');
    const isFav  = window.isFavorite?.(p.serial) || false;
    favBtn.classList.toggle('active', isFav);
    favBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="${isFav?'currentColor':'none'}" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>${isFav ? 'Remove from Favorites' : 'Add to Favorites'}`;

    favBtn.onclick = () => {
        if (!window.toggleFavorite) return;
        window.toggleFavorite(p.serial);
        const nowFav = window.isFavorite?.(p.serial) || false;
        favBtn.classList.toggle('active', nowFav);
        favBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="${nowFav?'currentColor':'none'}" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>${nowFav ? 'Remove from Favorites' : 'Add to Favorites'}`;
        // Also update the card in the grid
        const card = document.querySelector(`[data-serial="${escapeHTML(p.serial)}"] .fav-btn`);
        if (card) { card.classList.toggle('active', nowFav); card.querySelector('svg')?.setAttribute('fill', nowFav?'currentColor':'none'); }
    };

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('modalClose').focus();
}
window.openModal = openModal;

function closeModal() {
    $('productModal')?.classList.remove('open');
    document.body.style.overflow = '';
}

/* ── ⓮  EVENT LISTENERS ── */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput    = $('searchInput');
    const categoryFilter = $('categoryFilter');
    const sortFilter     = $('sortFilter');
    const favsBtn        = $('favsToggleBtn');

    // Search (debounced)
    if (searchInput) {
        const debounced = window.debounce ? window.debounce(applyFilters, 280) : applyFilters;
        searchInput.addEventListener('input', debounced);
    }

    // Category + sort filters
    categoryFilter?.addEventListener('change', applyFilters);
    sortFilter?.addEventListener('change', () => { currentPage = 1; applySort(); });

    // Favorites toggle
    if (favsBtn) {
        favsBtn.addEventListener('click', () => {
            showFavsOnly = !showFavsOnly;
            favsBtn.classList.toggle('active', showFavsOnly);
            favsBtn.setAttribute('aria-pressed', String(showFavsOnly));
            currentPage = 1;
            applyFilters();
        });
    }

    // Modal close button + overlay click
    $('modalClose')?.addEventListener('click', closeModal);
    $('productModal')?.addEventListener('click', (e) => {
        if (e.target === $('productModal')) closeModal();
    });

    // Keyboard: Escape closes modal or clears search
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if ($('productModal')?.classList.contains('open')) { closeModal(); return; }
            if (searchInput?.value) { searchInput.value = ''; applyFilters(); }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput?.focus();
        }
    });

    // Pre-select category from URL param
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat && categoryFilter) categoryFilter.value = cat;

    // Initial load
    loadData();
});

window.loadData = loadData;