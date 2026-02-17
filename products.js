/* ============================================================
   HAJI WADUD PARTS — PRODUCTS PAGE (Dynamic Google Sheets)
   ============================================================
   This file shares the same Google Sheets data source as
   price-list.js. Update SHEET_CSV_URL once in BOTH files,
   or better: extract it to a shared config.js (see README).

   COLUMN ORDER (Row 1 = headers, skipped automatically):
       A = serial | B = product_name | C = wholesale_price | D = selling_price
   ============================================================ */

'use strict';

/* ── ❶  CONFIGURATION ──────────────────────────────────────── */

const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX5mMXfl-gxvEPGLJ-MB4ySw_-8xSNaCeImbFpBwvRF33NphvgTjIaKQ-I8Loc6t4SIEt3UiAv5lEz/pub?gid=2052837076&single=true&output=csv';
//   ↑ Same URL used in price-list.js — keep both in sync

const CONFIG = {
    itemsPerPage: 24,           // cards per page (grid view)
    cacheMinutes: 5,
    cacheKey:    'hw_price_cache',     // intentionally same key as price-list.js
    cacheTimeKey:'hw_price_cache_ts',  // so both pages share one cached fetch
};

/* ── ❷  CATEGORY KEYWORDS (same as price-list.js) ─────────── */

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
    'oils':      [
        'মবিল','গ্রিজ','eppco','gulf','titan','total','bno',
        'german oil','grease','oil',
    ],
    'electrical':[
        'সুইচ','switch','সিডি','cdi','চার্জার','charger',
        'ওয়ারিং','wiring','লাইট','light','কয়েল','coil',
    ],
};

function categorize(name) {
    const n = name.toLowerCase();
    for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keys.some(k => n.includes(k))) return cat;
    }
    return 'other';
}

/* ── ❸  CATEGORY ICONS ─────────────────────────────────────── */

const CATEGORY_ICONS = {
    '175':       '⚙️',
    '205':       '🔧',
    '225':       '🛠️',
    'bearings':  '🔩',
    'tires':     '🛞',
    'oils':      '🛢️',
    'electrical':'🔌',
    'other':     '📦',
};

function getIcon(name) {
    return CATEGORY_ICONS[categorize(name)] ?? '📦';
}

/* ── ❹  STATE ──────────────────────────────────────────────── */

let allProducts  = [];
let filteredList = [];
let currentPage  = 1;

/* ── ❺  DOM HELPERS ────────────────────────────────────────── */

const $ = id => document.getElementById(id);

function showSection(section) {
    // section: 'loader' | 'error' | 'data'
    $('loaderState').style.display = section === 'loader' ? 'block' : 'none';
    $('errorState').style.display  = section === 'error'  ? 'block' : 'none';
    $('dataArea').style.display    = section === 'data'   ? 'block' : 'none';
}

/* ── ❻  CSV PARSER ─────────────────────────────────────────── */

/**
 * Minimal RFC 4180-compliant CSV parser.
 * Handles Bengali Unicode, quoted fields, embedded commas/newlines.
 * Returns: string[][]
 */
function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQ = false, i = 0;

    while (i < text.length) {
        const ch = text[i], next = text[i + 1];

        if (inQ) {
            if (ch === '"' && next === '"') { field += '"'; i += 2; }
            else if (ch === '"')            { inQ = false; i++; }
            else                            { field += ch; i++; }
        } else {
            if      (ch === '"')                      { inQ = true; i++; }
            else if (ch === ',')                      { row.push(field.trim()); field = ''; i++; }
            else if (ch === '\r' && next === '\n')    { row.push(field.trim()); rows.push(row); row = []; field = ''; i += 2; }
            else if (ch === '\n' || ch === '\r')      { row.push(field.trim()); rows.push(row); row = []; field = ''; i++; }
            else                                      { field += ch; i++; }
        }
    }

    if (field !== '' || row.length) {
        row.push(field.trim());
        if (row.some(f => f !== '')) rows.push(row);
    }

    return rows;
}

/**
 * Convert raw CSV rows → product objects.
 * Row 0 = headers (skipped). Columns: serial, name, wholesale, selling.
 */
function csvToProducts(rows) {
    if (!rows || rows.length < 2) return [];
    return rows
        .slice(1)
        .filter(r => r.length >= 2 && r[1])
        .map(r => ({
            serial:    r[0] || '',
            name:      r[1] || '',
            wholesale: r[2] || '',
            selling:   r[3] || '',
        }));
}

/* ── ❼  FETCH WITH CACHE ────────────────────────────────────── */

/**
 * Fetches the published CSV. Caches in sessionStorage for
 * CONFIG.cacheMinutes. The cache key is shared with price-list.js
 * so navigating between pages doesn't double-fetch.
 */
async function fetchSheetData(forceRefresh = false) {
    const now      = Date.now();
    const cached   = sessionStorage.getItem(CONFIG.cacheKey);
    const cachedTs = parseInt(sessionStorage.getItem(CONFIG.cacheTimeKey) || '0', 10);
    const maxAge   = CONFIG.cacheMinutes * 60 * 1000;

    if (!forceRefresh && cached && (now - cachedTs) < maxAge) {
        return cached;
    }

    const url = SHEET_CSV_URL.includes('?')
        ? `${SHEET_CSV_URL}&_cb=${now}`
        : `${SHEET_CSV_URL}?_cb=${now}`;

    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    sessionStorage.setItem(CONFIG.cacheKey, text);
    sessionStorage.setItem(CONFIG.cacheTimeKey, String(now));

    return text;
}

/* ── ❽  MAIN LOAD ───────────────────────────────────────────── */

async function loadData(forceRefresh = false) {
    showSection('loader');

    try {
        const csvText = await fetchSheetData(forceRefresh);
        const rows    = parseCSV(csvText);
        allProducts   = csvToProducts(rows);

        if (allProducts.length === 0) {
            throw new Error('Sheet appears to be empty or column structure does not match.');
        }

        applyFilters();     // renders cards + pagination
        showSection('data');
        updateTimestamp();

        if (forceRefresh && typeof showToast === 'function') {
            showToast(`✓ Products refreshed — ${allProducts.length} items loaded.`);
        }

    } catch (err) {
        console.error('[Products] Fetch error:', err);
        $('errorMsg').textContent =
            err.message.startsWith('HTTP') || err.message.includes('Sheet')
                ? `Error: ${err.message} — Ensure the Google Sheet is published to the web.`
                : 'Network error. Please check your connection and try again.';
        showSection('error');
    }
}

/* ── ❾  FILTER + SORT ───────────────────────────────────────── */

function applyFilters() {
    const query    = ($('searchInput')?.value || '').toLowerCase().trim();
    const category = $('categoryFilter')?.value || 'all';

    filteredList = allProducts.filter(p => {
        const matchSearch =
            !query ||
            p.name.toLowerCase().includes(query) ||
            p.serial.toLowerCase().includes(query);

        const matchCat =
            category === 'all' || categorize(p.name) === category;

        return matchSearch && matchCat;
    });

    currentPage = 1;
    applySort();   // sort calls render()
}

function applySort() {
    const sort = $('sortFilter')?.value || 'serial';

    switch (sort) {
        case 'name':
            filteredList.sort((a, b) =>
                a.name.localeCompare(b.name, 'bn', { sensitivity: 'base' })
            );
            break;
        case 'price-low':
            filteredList.sort((a, b) =>
                (parseFloat(a.selling) || 0) - (parseFloat(b.selling) || 0)
            );
            break;
        case 'price-high':
            filteredList.sort((a, b) =>
                (parseFloat(b.selling) || 0) - (parseFloat(a.selling) || 0)
            );
            break;
        default: // 'serial'
            filteredList.sort((a, b) => {
                const nA = parseFloat(a.serial) || 0;
                const nB = parseFloat(b.serial) || 0;
                return nA !== nB ? nA - nB : a.serial.localeCompare(b.serial);
            });
    }

    render();
}

/* ── ❿  RENDER CARDS ────────────────────────────────────────── */

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function highlight(text, query) {
    if (!query) return escapeHTML(text);
    const esc   = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${esc})`, 'gi');
    return escapeHTML(text).replace(regex, '<mark>$1</mark>');
}

function fmtPrice(val) {
    if (!val || val === '') return '–';
    const n = parseFloat(val);
    if (isNaN(n)) return '–';
    return '৳\u00A0' + n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function render() {
    const grid       = $('productsGrid');
    const emptyState = $('emptyState');
    const countEl    = $('resultCount');

    if (countEl) countEl.textContent = filteredList.length;

    if (filteredList.length === 0) {
        grid.style.display       = 'none';
        emptyState.style.display = 'block';
        $('pagination').innerHTML = '';
        return;
    }

    grid.style.display       = 'grid';
    emptyState.style.display = 'none';

    const query     = ($('searchInput')?.value || '').toLowerCase().trim();
    const start     = (currentPage - 1) * CONFIG.itemsPerPage;
    const paginated = filteredList.slice(start, start + CONFIG.itemsPerPage);

    grid.innerHTML = paginated.map((p, idx) => {
        const rowNum = start + idx + 1;
        return `
            <article class="product-card animate-on-scroll visible">
                <div class="product-card-icon" aria-hidden="true">${getIcon(p.name)}</div>
                <div class="product-card-serial">
                    Serial #${escapeHTML(p.serial) || rowNum}
                </div>
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
            </article>
        `;
    }).join('');

    renderPagination();
}

/* ── ⓫  PAGINATION ─────────────────────────────────────────── */

function renderPagination() {
    const totalPages = Math.ceil(filteredList.length / CONFIG.itemsPerPage);
    const nav        = $('pagination');

    if (totalPages <= 1) { nav.innerHTML = ''; return; }

    const MAX = 5;
    let sp = Math.max(1, currentPage - Math.floor(MAX / 2));
    let ep = Math.min(totalPages, sp + MAX - 1);
    if (ep - sp < MAX - 1) sp = Math.max(1, ep - MAX + 1);

    let html = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})"
                ${currentPage === 1 ? 'disabled' : ''}
                aria-label="Previous page">← Prev</button>`;

    if (sp > 1) {
        html += `<button class="page-btn" onclick="changePage(1)" aria-label="Page 1">1</button>`;
        if (sp > 2) html += `<span class="page-ellipsis" aria-hidden="true">…</span>`;
    }

    for (let i = sp; i <= ep; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}"
                    onclick="changePage(${i})"
                    aria-label="Page ${i}"
                    ${i === currentPage ? 'aria-current="page"' : ''}>${i}</button>`;
    }

    if (ep < totalPages) {
        if (ep < totalPages - 1) html += `<span class="page-ellipsis" aria-hidden="true">…</span>`;
        html += `<button class="page-btn" onclick="changePage(${totalPages})" aria-label="Last page">${totalPages}</button>`;
    }

    html += `
        <button class="page-btn" onclick="changePage(${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled' : ''}
                aria-label="Next page">Next →</button>`;

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

/* ── ⓬  TIMESTAMP ──────────────────────────────────────────── */

function updateTimestamp() {
    const ts = $('lastUpdated');
    if (!ts) return;
    const fmt = new Date().toLocaleString('en-BD', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    ts.innerHTML = `Data last fetched: <span>${fmt}</span>`;
}

/* ── ⓭  EVENT LISTENERS ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

    const searchInput    = $('searchInput');
    const categoryFilter = $('categoryFilter');
    const sortFilter     = $('sortFilter');

    /* ── Search (debounced 280 ms) ── */
    if (searchInput) {
        const debounced = window.debounce
            ? window.debounce(applyFilters, 280)
            : applyFilters;
        searchInput.addEventListener('input', debounced);
    }

    /* ── Category filter ── */
    categoryFilter?.addEventListener('change', applyFilters);

    /* ── Sort filter (sort only, no re-fetch needed) ── */
    sortFilter?.addEventListener('change', () => {
        currentPage = 1;
        applySort();
    });

    /* ── Keyboard shortcuts ── */
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

    /* ── Pre-select category from URL param ── */
    const urlParams = new URLSearchParams(window.location.search);
    const cat       = urlParams.get('category');
    if (cat && categoryFilter) {
        categoryFilter.value = cat;
    }

    /* ── Initial data load ── */
    loadData();
});

/* ── ⓮  GLOBAL EXPOSE ──────────────────────────────────────── */
window.loadData = loadData;
