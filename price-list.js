/* ============================================================
   HAJI WADUD PARTS — PRICE LIST v3.0
   🆕 BATCH 2 UPGRADES:
   ✅ Sortable columns — click any column header to sort asc/desc
   ✅ Print button support (window.print())
   ✅ Row fade-in animation on each render
   ✅ Amber hover on table rows (via CSS class, not inline)
   ✅ Export button shows loading state during export
   ✅ Category filter pre-selected from URL param on load
   ✅ All v2.0 bugs preserved as fixed
   ============================================================ */

'use strict';

/* ── ❶  CONFIGURATION ── */
const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX5mMXfl-gxvEPGLJ-MB4ySw_-8xSNaCeImbFpBwvRF33NphvgTjIaKQ-I8Loc6t4SIEt3UiAv5lEz/pub?gid=2052837076&single=true&output=csv';

const CONFIG = {
    itemsPerPage: 50,
    cacheMinutes: 5,
    cacheKey:     'hw_price_cache',
    cacheTimeKey: 'hw_price_cache_ts',
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

function categorize(name) {
    const n = name.toLowerCase();
    for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keys.some(k => n.includes(k))) return cat;
    }
    return 'other';
}

/* ── ❸  STATE ── */
let allProducts  = [];
let filteredList = [];
let currentPage  = 1;

// 🆕 Column sort state
let sortCol = 'serial';  // 'serial' | 'name' | 'wholesale' | 'retail'
let sortDir = 'asc';     // 'asc' | 'desc'

/* ── ❹  DOM HELPERS ── */
const $ = id => document.getElementById(id);

function showSection(section) {
    $('loaderState').style.display = section === 'loader' ? 'flex'  : 'none';
    $('errorState').style.display  = section === 'error'  ? 'block' : 'none';
    $('dataArea').style.display    = section === 'data'   ? 'block' : 'none';
}

/* ── ❺  CSV PARSER (RFC 4180, handles Bengali Unicode) ── */
function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQ = false, i = 0;
    while (i < text.length) {
        const ch = text[i], nx = text[i+1];
        if (inQ) {
            if (ch==='"' && nx==='"') { field+='"'; i+=2; }
            else if (ch==='"')        { inQ=false; i++; }
            else                      { field+=ch; i++; }
        } else {
            if      (ch==='"')                 { inQ=true; i++; }
            else if (ch===',')                 { row.push(field.trim()); field=''; i++; }
            else if (ch==='\r' && nx==='\n')   { row.push(field.trim()); rows.push(row); row=[]; field=''; i+=2; }
            else if (ch==='\n' || ch==='\r')   { row.push(field.trim()); rows.push(row); row=[]; field=''; i++; }
            else                               { field+=ch; i++; }
        }
    }
    if (field!=='' || row.length) { row.push(field.trim()); if(row.some(f=>f!=='')) rows.push(row); }
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
    if (!forceRefresh && cached && (now-cachedTs) < CONFIG.cacheMinutes*60000) return cached;
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
        if (allProducts.length === 0)
            throw new Error('Sheet appears to be empty or columns do not match the expected format.');
        updateStats();
        applyFilters();
        showSection('data');
        updateTimestamp();
        if (forceRefresh && typeof showToast === 'function')
            showToast(`✓ Price list refreshed — ${allProducts.length} products loaded.`);
    } catch (err) {
        console.error('[PriceList] Fetch error:', err);
        $('errorMsg').textContent = err.message.startsWith('HTTP') || err.message.includes('Sheet')
            ? `Error: ${err.message} — Check that your Google Sheet is published to the web.`
            : 'Network error. Please check your internet connection and try again.';
        showSection('error');
    }
}

/* ── ❽  FILTER ── */
function applyFilters() {
    const query    = ($('searchInput')?.value || '').toLowerCase().trim();
    const category = $('categoryFilter')?.value || 'all';

    filteredList = allProducts.filter(p => {
        const matchSearch = !query || p.name.toLowerCase().includes(query) || p.serial.toLowerCase().includes(query);
        const matchCat    = category === 'all' || categorize(p.name) === category;
        return matchSearch && matchCat;
    });

    currentPage = 1;
    applySortAndRender();
}

/* ── ❾  SORT ── */
function applySortAndRender() {
    if (sortCol === 'name') {
        filteredList.sort((a,b) => {
            const cmp = a.name.localeCompare(b.name);
            return sortDir === 'asc' ? cmp : -cmp;
        });
    } else if (sortCol === 'wholesale') {
        filteredList.sort((a,b) => {
            const av = parseFloat(a.wholesale) || 0;
            const bv = parseFloat(b.wholesale) || 0;
            return sortDir === 'asc' ? av - bv : bv - av;
        });
    } else if (sortCol === 'retail') {
        filteredList.sort((a,b) => {
            const av = parseFloat(a.selling) || 0;
            const bv = parseFloat(b.selling) || 0;
            return sortDir === 'asc' ? av - bv : bv - av;
        });
    } else {
        // serial (default)
        filteredList.sort((a,b) => {
            const cmp = a.serial.localeCompare(b.serial, undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }

    updateSortIndicators();
    updateStats();
    renderTable();
}

/* ── Update sort indicator arrows on headers ── */
function updateSortIndicators() {
    document.querySelectorAll('.price-table th.sortable').forEach(th => {
        const col = th.dataset.sort;
        th.classList.remove('sort-asc', 'sort-desc');
        if (col === sortCol) th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    });
}

/* ── ❿  RENDER TABLE ── */
function escapeHTML(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function highlight(text, query) {
    if (!query) return escapeHTML(text);
    const esc   = query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const regex = new RegExp(`(${esc})`, 'gi');
    return escapeHTML(text).replace(regex, '<mark>$1</mark>');
}

function fmtPrice(val) {
    if (!val || val === '') return '–';
    const n = parseFloat(val);
    if (isNaN(n)) return '–';
    return '৳\u00A0' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderTable() {
    const tbody    = $('priceTableBody');
    const noResult = $('noResults');
    const tableW   = $('tableWrap');

    if (filteredList.length === 0) {
        tableW.style.display   = 'none';
        noResult.style.display = 'block';
        $('pagination').innerHTML = '';
        return;
    }

    tableW.style.display   = 'block';
    noResult.style.display = 'none';

    const query = ($('searchInput')?.value || '').toLowerCase().trim();
    const start = (currentPage - 1) * CONFIG.itemsPerPage;
    const slice = filteredList.slice(start, start + CONFIG.itemsPerPage);

    // 🆕 Row fade-in animation on each new render
    tbody.innerHTML = slice.map((p, idx) => {
        const rowNum = start + idx + 1;
        const delay  = Math.min(idx * 12, 200); // cap at 200ms
        return `
            <tr class="row-in" style="animation-delay:${delay}ms">
                <td>${escapeHTML(p.serial) || rowNum}</td>
                <td>${highlight(p.name, query)}</td>
                <td>${fmtPrice(p.wholesale)}</td>
                <td>${fmtPrice(p.selling)}</td>
            </tr>`;
    }).join('');

    renderPagination();
}

/* ── ⓫  PAGINATION ── */
function renderPagination() {
    const totalPages = Math.ceil(filteredList.length / CONFIG.itemsPerPage);
    const nav = $('pagination');
    if (totalPages <= 1) { nav.innerHTML = ''; return; }

    const MAX = 5;
    let sp = Math.max(1, currentPage - Math.floor(MAX/2));
    let ep = Math.min(totalPages, sp + MAX - 1);
    if (ep - sp < MAX - 1) sp = Math.max(1, ep - MAX + 1);

    let html = `<button class="page-btn" onclick="changePage(${currentPage-1})" ${currentPage===1?'disabled':''} aria-label="Previous page">← Prev</button>`;
    if (sp > 1) { html += `<button class="page-btn" onclick="changePage(1)">1</button>`; if(sp>2) html+=`<span class="page-ellipsis">…</span>`; }
    for (let i = sp; i <= ep; i++) html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="changePage(${i})" aria-label="Page ${i}" ${i===currentPage?'aria-current="page"':''}>${i}</button>`;
    if (ep < totalPages) { if(ep<totalPages-1) html+=`<span class="page-ellipsis">…</span>`; html+=`<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`; }
    html += `<button class="page-btn" onclick="changePage(${currentPage+1})" ${currentPage===totalPages?'disabled':''} aria-label="Next page">Next →</button>`;
    nav.innerHTML = html;
}

function changePage(page) {
    const total = Math.ceil(filteredList.length / CONFIG.itemsPerPage);
    if (page < 1 || page > total) return;
    currentPage = page;
    renderTable();
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.changePage = changePage;

/* ── ⓬  STATISTICS ── */
function updateStats() {
    const withPrices = allProducts.filter(p => p.wholesale || p.selling).length;
    if ($('statTotal'))     $('statTotal').textContent     = allProducts.length;
    if ($('statPriced'))    $('statPriced').textContent    = withPrices;
    if ($('statDisplayed')) $('statDisplayed').textContent = filteredList.length;
}

/* ── ⓭  TIMESTAMP ── */
function updateTimestamp() {
    const ts = $('lastUpdated');
    if (!ts) return;
    ts.innerHTML = `Data last fetched: <span>${new Date().toLocaleString('en-BD',{dateStyle:'medium',timeStyle:'short'})}</span>`;
}

/* ── ⓮  CSV EXPORT ── */
function exportToCSV() {
    const btn = $('exportBtn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Exporting…'; }

    setTimeout(() => {
        const header = 'Serial,Product Name,Wholesale Price (৳),Retail Price (৳)\n';
        const rows   = filteredList.map(p => {
            const name = `"${p.name.replace(/"/g,'""')}"`;
            return `${p.serial},${name},${p.wholesale},${p.selling}`;
        }).join('\n');

        const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url;
        link.download = `Haji-Wadud-Price-List-${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        if (typeof showToast === 'function')
            showToast(`✓ Exported ${filteredList.length} products to CSV.`);

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:16px;height:16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV`;
        }
    }, 50);
}

/* ── ⓯  EVENT LISTENERS ── */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput    = $('searchInput');
    const categoryFilter = $('categoryFilter');

    // Search (debounced)
    if (searchInput) {
        const debounced = window.debounce ? window.debounce(applyFilters, 280) : applyFilters;
        searchInput.addEventListener('input', debounced);
    }

    // Category filter
    categoryFilter?.addEventListener('change', applyFilters);

    // Export button
    $('exportBtn')?.addEventListener('click', exportToCSV);

    // 🆕 Print button
    $('printBtn')?.addEventListener('click', () => window.print());

    // Refresh button
    $('refreshBtn')?.addEventListener('click', () => {
        sessionStorage.removeItem(CONFIG.cacheKey);
        sessionStorage.removeItem(CONFIG.cacheTimeKey);
        loadData(true);
    });

    // 🆕 Column sort — click sortable headers
    document.querySelectorAll('.price-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortCol === col) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortCol = col;
                sortDir = 'asc';
            }
            applySortAndRender();
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput?.focus();
        }
        if (e.key === 'Escape' && searchInput?.value) {
            searchInput.value = '';
            applyFilters();
        }
    });

    // Pre-select category from URL param
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat && categoryFilter) categoryFilter.value = cat;

    // Initial load
    loadData();
});

window.loadData    = loadData;
window.exportToCSV = exportToCSV;