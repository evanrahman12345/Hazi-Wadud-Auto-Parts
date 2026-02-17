/* ============================================================
   HAJI WADUD PARTS — PRICE LIST (Dynamic Google Sheets)
   ============================================================
   HOW TO CONNECT YOUR GOOGLE SHEET
   ─────────────────────────────────────────────────────────────
   1. Open your Google Sheet (copy your Excel data there first).
   2. Go to File → Share → Publish to web.
   3. In the dialog:
      • "Link" tab → select your sheet tab (e.g. "Price list")
      • Format → choose "Comma-separated values (.csv)"
      • Click "Publish" and confirm.
   4. Copy the published URL. It looks like:
        https://docs.google.com/spreadsheets/d/SHEET_ID/pub?gid=GID&single=true&output=csv
   5. Paste it below as SHEET_CSV_URL.

   COLUMN ORDER EXPECTED (first row = headers, ignored):
      A = serial | B = product_name | C = wholesale_price | D = selling_price
   ============================================================ */

'use strict';

/* ── ❶  CONFIGURATION — EDIT THIS ONE LINE ─────────────────── */

const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX5mMXfl-gxvEPGLJ-MB4ySw_-8xSNaCeImbFpBwvRF33NphvgTjIaKQ-I8Loc6t4SIEt3UiAv5lEz/pub?gid=2052837076&single=true&output=csv';
//   ↑ Replace with your actual published CSV URL from Google Sheets

/* ── ❷  OPTIONAL SETTINGS ──────────────────────────────────── */

const CONFIG = {
    itemsPerPage: 50,           // rows shown per page
    cacheMinutes: 5,            // how long to cache data in sessionStorage
    cacheKey:     'hw_price_cache',
    cacheTimeKey: 'hw_price_cache_ts',
};

/* ── ❸  CATEGORY KEYWORDS ──────────────────────────────────── */

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

/* ── ❹  STATE ──────────────────────────────────────────────── */

let allProducts    = [];   // raw data from sheet
let filteredList   = [];   // after search + category
let currentPage    = 1;

/* ── ❺  DOM HELPERS ────────────────────────────────────────── */

const $ = id => document.getElementById(id);

function showSection(section) {
    // section: 'loader' | 'error' | 'data'
    $('loaderState').style.display = section === 'loader' ? 'flex'   : 'none';
    $('errorState').style.display  = section === 'error'  ? 'block'  : 'none';
    $('dataArea').style.display    = section === 'data'   ? 'block'  : 'none';
}

/* ── ❻  CSV PARSER ─────────────────────────────────────────── */

/**
 * Minimal RFC 4180-compliant CSV parser that handles:
 *  - Quoted fields (including newlines and commas inside quotes)
 *  - Unicode / Bengali text
 *  - Empty fields
 * Returns: array of row arrays (strings).
 */
function parseCSV(text) {
    const rows = [];
    let row    = [];
    let field  = '';
    let inQ    = false;
    let i      = 0;

    while (i < text.length) {
        const ch   = text[i];
        const next = text[i + 1];

        if (inQ) {
            if (ch === '"' && next === '"') {   // escaped quote
                field += '"';
                i += 2;
            } else if (ch === '"') {            // end of quoted field
                inQ = false;
                i++;
            } else {
                field += ch;
                i++;
            }
        } else {
            if (ch === '"') {
                inQ = true;
                i++;
            } else if (ch === ',') {
                row.push(field.trim());
                field = '';
                i++;
            } else if (ch === '\r' && next === '\n') {
                row.push(field.trim());
                rows.push(row);
                row   = [];
                field = '';
                i += 2;
            } else if (ch === '\n' || ch === '\r') {
                row.push(field.trim());
                rows.push(row);
                row   = [];
                field = '';
                i++;
            } else {
                field += ch;
                i++;
            }
        }
    }

    // Flush last field / row
    if (field !== '' || row.length) {
        row.push(field.trim());
        if (row.some(f => f !== '')) rows.push(row);
    }

    return rows;
}

/**
 * Convert raw CSV rows → product objects.
 * Skips the header row (first row) automatically.
 * Handles missing columns gracefully.
 */
function csvToProducts(rows) {
    if (!rows || rows.length < 2) return [];

    return rows
        .slice(1)                         // skip header
        .filter(r => r.length >= 2 && r[1])  // must have at least name
        .map(r => ({
            serial:    r[0] || '',
            name:      r[1] || '',
            wholesale: r[2] || '',
            selling:   r[3] || '',
        }));
}

/* ── ❼  FETCH WITH CACHE ────────────────────────────────────── */

/**
 * Fetches CSV from Google Sheets.
 * Caches result in sessionStorage for CONFIG.cacheMinutes to avoid
 * hammering the endpoint on every page interaction.
 *
 * @param {boolean} forceRefresh - bypass cache when true (Refresh button)
 */
async function fetchSheetData(forceRefresh = false) {
    const now      = Date.now();
    const cached   = sessionStorage.getItem(CONFIG.cacheKey);
    const cachedTs = parseInt(sessionStorage.getItem(CONFIG.cacheTimeKey) || '0', 10);
    const maxAge   = CONFIG.cacheMinutes * 60 * 1000;

    if (!forceRefresh && cached && (now - cachedTs) < maxAge) {
        return cached;   // return cached CSV text
    }

    // Bust browser cache with a timestamp query param
    const url = SHEET_CSV_URL.includes('?')
        ? `${SHEET_CSV_URL}&_cb=${now}`
        : `${SHEET_CSV_URL}?_cb=${now}`;

    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();

    // Persist to sessionStorage
    sessionStorage.setItem(CONFIG.cacheKey, text);
    sessionStorage.setItem(CONFIG.cacheTimeKey, String(now));

    return text;
}

/* ── ❽  MAIN LOAD FUNCTION ──────────────────────────────────── */

async function loadData(forceRefresh = false) {
    showSection('loader');

    try {
        const csvText = await fetchSheetData(forceRefresh);
        const rows    = parseCSV(csvText);
        allProducts   = csvToProducts(rows);

        if (allProducts.length === 0) {
            throw new Error('Sheet appears to be empty or columns do not match the expected format.');
        }

        updateStats();
        applyFilters();   // renders table + pagination
        showSection('data');
        updateTimestamp();

        if (forceRefresh && typeof showToast === 'function') {
            showToast(`✓ Price list refreshed — ${allProducts.length} products loaded.`);
        }

    } catch (err) {
        console.error('[PriceList] Fetch error:', err);
        $('errorMsg').textContent =
            err.message.startsWith('HTTP') || err.message.includes('Sheet')
                ? `Error: ${err.message} — Check that your Google Sheet is published to the web.`
                : 'Network error. Please check your internet connection and try again.';
        showSection('error');
    }
}

/* ── ❾  FILTERS & SEARCH ────────────────────────────────────── */

function applyFilters() {
    const query    = ($('searchInput')?.value || '').toLowerCase().trim();
    const category = $('categoryFilter')?.value || 'all';

    filteredList = allProducts.filter(p => {
        // Search: match name or serial
        const matchSearch =
            !query ||
            p.name.toLowerCase().includes(query) ||
            p.serial.toLowerCase().includes(query);

        // Category
        const matchCat =
            category === 'all' || categorize(p.name) === category;

        return matchSearch && matchCat;
    });

    currentPage = 1;
    updateStats();
    renderTable();
}

/* ── ❿  RENDER TABLE ────────────────────────────────────────── */

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Wraps matched search term in <mark> tags for highlight.
 */
function highlight(text, query) {
    if (!query) return escapeHTML(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex   = new RegExp(`(${escaped})`, 'gi');
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

function renderTable() {
    const tbody    = $('priceTableBody');
    const noResult = $('noResults');
    const tableW   = $('tableWrap');

    if (filteredList.length === 0) {
        tableW.style.display  = 'none';
        noResult.style.display = 'block';
        $('pagination').innerHTML = '';
        return;
    }

    tableW.style.display  = 'block';
    noResult.style.display = 'none';

    const query  = ($('searchInput')?.value || '').toLowerCase().trim();
    const start  = (currentPage - 1) * CONFIG.itemsPerPage;
    const slice  = filteredList.slice(start, start + CONFIG.itemsPerPage);

    tbody.innerHTML = slice.map((p, idx) => {
        const rowNum = start + idx + 1;
        return `
            <tr>
                <td>${escapeHTML(p.serial) || rowNum}</td>
                <td>${highlight(p.name, query)}</td>
                <td>${fmtPrice(p.wholesale)}</td>
                <td>${fmtPrice(p.selling)}</td>
            </tr>
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
    renderTable();
    // Scroll smoothly to top of main content
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Expose globally for inline onclick handlers
window.changePage = changePage;

/* ── ⓬  STATISTICS ─────────────────────────────────────────── */

function updateStats() {
    const withPrices = allProducts.filter(p => p.wholesale || p.selling).length;

    $('statTotal').textContent     = allProducts.length;
    $('statPriced').textContent    = withPrices;
    $('statDisplayed').textContent = filteredList.length;
}

/* ── ⓭  TIMESTAMP ──────────────────────────────────────────── */

function updateTimestamp() {
    const ts = $('lastUpdated');
    if (!ts) return;
    const now = new Date();
    const fmt = now.toLocaleString('en-BD', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    ts.innerHTML = `Data last fetched: <span>${fmt}</span>`;
}

/* ── ⓮  CSV EXPORT ─────────────────────────────────────────── */

function exportToCSV() {
    const header = 'Serial,Product Name,Wholesale Price (৳),Retail Price (৳)\n';

    const rows = filteredList.map(p => {
        const name = `"${p.name.replace(/"/g, '""')}"`;
        return `${p.serial},${name},${p.wholesale},${p.selling}`;
    }).join('\n');

    // BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\uFEFF' + header + rows], {
        type: 'text/csv;charset=utf-8;',
    });

    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `Haji-Wadud-Price-List-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    if (typeof showToast === 'function') {
        showToast(`✓ Exported ${filteredList.length} products to CSV.`);
    }
}

/* ── ⓯  EVENT LISTENERS ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Search (debounced) ── */
    const searchInput = $('searchInput');
    if (searchInput) {
        const debounced = window.debounce ? window.debounce(applyFilters, 280) : applyFilters;
        searchInput.addEventListener('input', debounced);
    }

    /* ── Category filter ── */
    $('categoryFilter')?.addEventListener('change', applyFilters);

    /* ── Export button ── */
    $('exportBtn')?.addEventListener('click', exportToCSV);

    /* ── Refresh button ── */
    $('refreshBtn')?.addEventListener('click', () => {
        // Clear cache and reload
        sessionStorage.removeItem(CONFIG.cacheKey);
        sessionStorage.removeItem(CONFIG.cacheTimeKey);
        loadData(true);
    });

    /* ── Keyboard shortcuts ── */
    document.addEventListener('keydown', e => {
        // Ctrl/Cmd + K → focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput?.focus();
        }
        // Escape → clear search
        if (e.key === 'Escape' && searchInput?.value) {
            searchInput.value = '';
            applyFilters();
        }
    });

    /* ── Pre-select category from URL param ── */
    const urlParams = new URLSearchParams(window.location.search);
    const cat       = urlParams.get('category');
    if (cat && $('categoryFilter')) {
        $('categoryFilter').value = cat;
    }

    /* ── Initial data load ── */
    loadData();
});

/* ── ⓰  GLOBAL EXPOSE ──────────────────────────────────────── */
window.loadData     = loadData;
window.exportToCSV  = exportToCSV;
