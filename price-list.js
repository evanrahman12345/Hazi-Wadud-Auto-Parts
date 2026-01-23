// ========================================
// PRODUCT DATA - Add all your products here
// ========================================

const products = [
    {id: 1, name: "১০নং SS নাট ১০০", wholesale: "150", selling: "180"},
    {id: 2, name: "১০নং নাট ১০০", wholesale: "120", selling: "150"},
    {id: 3, name: "১২/১৩ রিং", wholesale: "80", selling: "100"},
    {id: 4, name: "১২নং SS নাট ১০০", wholesale: "160", selling: "190"},
    {id: 5, name: "১২নং কেপ নাট ১০০", wholesale: "140", selling: "170"},
    {id: 6, name: "১২নং নাট ১০০", wholesale: "130", selling: "160"},
    {id: 7, name: "১৪/১৫ রিং", wholesale: "90", selling: "115"},
    {id: 8, name: "১৪/১৬ ওভার", wholesale: "200", selling: "240"},
    {id: 9, name: "১৪/১৬ স্টেন্ডার", wholesale: "180", selling: "220"},
    {id: 10, name: "16/16 (BAJAJ)", wholesale: "250", selling: "300"},
    {id: 11, name: "16/16 (IKO)", wholesale: "280", selling: "340"},
    {id: 12, name: "১৬/১৭ রিং", wholesale: "95", selling: "120"},
    {id: 13, name: "১৭৫ কাপ S (VIRA)", wholesale: "450", selling: "550"},
    {id: 14, name: "১৭৫ ১৮ কয়েল", wholesale: "320", selling: "390"},
    {id: 15, name: "১৭৫ ১নং পিনিয়ম", wholesale: "280", selling: "340"},
    {id: 16, name: "১৭৫ ২নং পিনিয়ম", wholesale: "285", selling: "345"},
    {id: 17, name: "১৭৫ ৩নং পিনিয়ম", wholesale: "290", selling: "350"},
    {id: 18, name: "১৭৫ Top Gear (VIRA)", wholesale: "650", selling: "780"},
    {id: 19, name: "১৭৫ আউটকয়েল (POWER)", wholesale: "420", selling: "510"},
    {id: 20, name: "১৭৫ ইঞ্জিন কভার", wholesale: "380", selling: "460"},
    // Add remaining 469 products here...
    // Format: {id: X, name: "Product Name", wholesale: "XXX", selling: "XXX"},
    // For demonstration, I'll add a few more categories

    // 205 Series
    {id: 110, name: "২০৫ ১৮ কয়েল", wholesale: "330", selling: "400"},
    {id: 111, name: "২০৫ ইঞ্জিন সুইচ (PAVNA)", wholesale: "280", selling: "340"},
    {id: 112, name: "২০৫ ইঞ্জিন সুইচ Complete (PAVNA)", wholesale: "550", selling: "670"},

    // 225 Series
    {id: 130, name: "২২৫ সিডি (MAT)", wholesale: "890", selling: "1080"},
    {id: 131, name: "২২৫ ১৮ কয়েল", wholesale: "340", selling: "410"},
    {id: 132, name: "২২৫ ১নং পিনিয়ম", wholesale: "290", selling: "350"},

    // Bearings
    {id: 224, name: "6004 (BAJAJ)", wholesale: "180", selling: "220"},
    {id: 228, name: "BBC-6204", wholesale: "250", selling: "300"},
    {id: 229, name: "BBC-6301", wholesale: "270", selling: "330"},
    {id: 242, name: "EBH-16007", wholesale: "420", selling: "510"},
    {id: 258, name: "NACHI-16007", wholesale: "480", selling: "580"},
    {id: 259, name: "NACHI-6002", wholesale: "210", selling: "260"},

    // Tires
    {id: 344, name: "টায়ার- ২.৭৫-১৪ (GAZI)", wholesale: "1850", selling: "2250"},
    {id: 345, name: "টায়ার- ২.৭৫-১৪ (HUSSEN)", wholesale: "1780", selling: "2150"},
    {id: 348, name: "টায়ার- ৪.০০-১২ (HUSSEN)", wholesale: "2450", selling: "2950"},
    {id: 352, name: "টায়ার- ৪.০০-৮ (GAZI CITY)", wholesale: "2150", selling: "2600"},

    // Tubes
    {id: 360, name: "টিউব- ১০০.৯০-১৭", wholesale: "420", selling: "510"},
    {id: 362, name: "টিউব- ২.৭৫-১৪", wholesale: "380", selling: "460"},
    {id: 367, name: "টিউব- ৪.০০-১২", wholesale: "450", selling: "550"},
    {id: 368, name: "টিউব- ৪.০০-৮", wholesale: "420", selling: "510"},

    // Oils
    {id: 422, name: "মবিল- EPPCO 2L", wholesale: "680", selling: "820"},
    {id: 423, name: "মবিল- German Oil 2L", wholesale: "720", selling: "870"},
    {id: 424, name: "মবিল- GULF 3L", wholesale: "1050", selling: "1270"},
    {id: 425, name: "মবিল- HD-40 (BNO) 2L", wholesale: "590", selling: "710"},
    {id: 429, name: "মবিল- TITAN 2L", wholesale: "780", selling: "950"},
];

// ========================================
// STATE MANAGEMENT
// ========================================

let filteredProducts = [...products];
let currentPage = 1;
const itemsPerPage = 50;

// ========================================
// CATEGORY HELPER
// ========================================

function getCategoryFromProduct(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('175') || nameLower.includes('১৭৫')) return '175';
    if (nameLower.includes('205') || nameLower.includes('২০৫')) return '205';
    if (nameLower.includes('225') || nameLower.includes('২২৫')) return '225';
    if (nameLower.includes('bearing') || nameLower.includes('বেয়ারিং') || 
        nameLower.includes('bbc') || nameLower.includes('ebh') || 
        nameLower.includes('nachi') || nameLower.includes('sqy') ||
        nameLower.includes('6001') || nameLower.includes('6002') ||
        nameLower.includes('6004') || nameLower.includes('6005') ||
        nameLower.includes('6007') || nameLower.includes('6199') ||
        nameLower.includes('6200') || nameLower.includes('6201') ||
        nameLower.includes('6202') || nameLower.includes('6203') ||
        nameLower.includes('6204') || nameLower.includes('6205') ||
        nameLower.includes('6301') || nameLower.includes('6302') ||
        nameLower.includes('6304') || nameLower.includes('6305') ||
        nameLower.includes('16007') || nameLower.includes('63/28')) return 'bearings';
    if (nameLower.includes('টায়ার') || nameLower.includes('tire') || 
        nameLower.includes('টিউব') || nameLower.includes('tube')) return 'tires';
    if (nameLower.includes('মবিল') || nameLower.includes('oil') || 
        nameLower.includes('গ্রিজ') || nameLower.includes('grease') ||
        nameLower.includes('eppco') || nameLower.includes('gulf') ||
        nameLower.includes('titan') || nameLower.includes('total')) return 'oils';
    if (nameLower.includes('সুইচ') || nameLower.includes('switch') || 
        nameLower.includes('চার্জার') || nameLower.includes('charger') || 
        nameLower.includes('সিডি') || nameLower.includes('cdi') ||
        nameLower.includes('ওয়ারিং') || nameLower.includes('wiring') ||
        nameLower.includes('লাইট') || nameLower.includes('light')) return 'electrical';
    
    return 'other';
}

// ========================================
// FILTER & SEARCH
// ========================================

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const category = document.getElementById('categoryFilter').value;
    
    filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.id.toString().includes(searchTerm);
        
        // Category filter
        const productCategory = getCategoryFromProduct(product.name);
        const matchesCategory = category === 'all' || productCategory === category;
        
        return matchesSearch && matchesCategory;
    });
    
    currentPage = 1;
    renderTable();
    updateStats();
}

// ========================================
// RENDER TABLE
// ========================================

function renderTable() {
    const tbody = document.getElementById('priceTableBody');
    const noResults = document.getElementById('noResults');
    const tableContainer = document.querySelector('.table-container');
    
    // Show/hide no results message
    if (filteredProducts.length === 0) {
        tableContainer.style.display = 'none';
        noResults.style.display = 'block';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    tableContainer.style.display = 'block';
    noResults.style.display = 'none';
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Render table rows
    tbody.innerHTML = pageProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${formatPrice(product.wholesale)}</td>
            <td>${formatPrice(product.selling)}</td>
        </tr>
    `).join('');
    
    renderPagination();
}

// ========================================
// FORMAT PRICE
// ========================================

function formatPrice(price) {
    if (!price || price === '') return '-';
    const num = parseFloat(price);
    if (isNaN(num)) return '-';
    return '৳' + num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ========================================
// PAGINATION
// ========================================

function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            ← Previous
        </button>
    `;
    
    // Page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // First page
    if (startPage > 1) {
        html += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="page-ellipsis">...</span>`;
        }
        html += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    html += `
        <button class="page-btn" onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            Next →
        </button>
    `;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderTable();
    
    // Scroll to top of table
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========================================
// UPDATE STATISTICS
// ========================================

function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('withPrices').textContent = products.filter(p => p.wholesale || p.selling).length;
    document.getElementById('displayedCount').textContent = filteredProducts.length;
}

// ========================================
// EXPORT TO CSV
// ========================================

function exportToCSV() {
    // Create CSV content
    let csv = 'Serial No.,Product Name,Wholesale Price (৳),Selling Price (৳)\n';
    
    filteredProducts.forEach(product => {
        const wholesale = product.wholesale || '';
        const selling = product.selling || '';
        // Escape quotes in product name
        const name = product.name.replace(/"/g, '""');
        csv += `${product.id},"${name}",${wholesale},${selling}\n`;
    });

    // Create blob and download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    link.download = `Haji-Wadud-Price-List-${date}.csv`;
    
    link.click();
    window.URL.revokeObjectURL(url);
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Price list exported successfully!');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderTable();
    updateStats();
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterProducts, 300);
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    // Handle URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category && categoryFilter) {
        categoryFilter.value = category;
        filterProducts();
    }
});

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            filterProducts();
        }
    }
});