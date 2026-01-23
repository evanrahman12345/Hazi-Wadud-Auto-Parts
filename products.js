// Load products from localStorage or use default data
let allProducts = [];
const ITEMS_PER_PAGE = 24;
let currentPage = 1;
let filteredProducts = [];

// Product icons based on category
const productIcons = {
    '175': '⚙️',
    '205': '🔧',
    '225': '🛠️',
    'bearing': '⚡',
    'tire': '🛞',
    'tube': '⭕',
    'oil': '🛢️',
    'default': '🔩'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
    displayProducts();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleFilter);
    document.getElementById('categoryFilter').addEventListener('change', handleFilter);
    document.getElementById('sortFilter').addEventListener('change', handleSort);
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Load products from localStorage
function loadProducts() {
    const stored = localStorage.getItem('hajiwadud_products');
    if (stored) {
        allProducts = JSON.parse(stored);
    } else {
        // Default products if none stored
        allProducts = generateDefaultProducts();
    }
    filteredProducts = [...allProducts];
}

// Generate default products (sample data)
function generateDefaultProducts() {
    return [
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
        {id: 15, name: "১৭৫ ১নং পিনিয়ম", wholesale: "280", selling: "340"}
        // Add more products as needed
    ];
}

// Get product icon based on name
function getProductIcon(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('175') || nameLower.includes('১৭৫')) return productIcons['175'];
    if (nameLower.includes('205') || nameLower.includes('২০৫')) return productIcons['205'];
    if (nameLower.includes('225') || nameLower.includes('২২৫')) return productIcons['225'];
    if (nameLower.includes('bearing') || nameLower.includes('বেয়ারিং')) return productIcons['bearing'];
    if (nameLower.includes('টায়ার') || nameLower.includes('tire')) return productIcons['tire'];
    if (nameLower.includes('টিউব') || nameLower.includes('tube')) return productIcons['tube'];
    if (nameLower.includes('মবিল') || nameLower.includes('oil')) return productIcons['oil'];
    
    return productIcons['default'];
}

// Categorize product
function categorizeProduct(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('175') || nameLower.includes('১৭৫')) return '175';
    if (nameLower.includes('205') || nameLower.includes('২০৫')) return '205';
    if (nameLower.includes('225') || nameLower.includes('২২৫')) return '225';
    if (nameLower.includes('bearing') || nameLower.includes('বেয়ারিং') || 
        nameLower.includes('bbc') || nameLower.includes('ebh') || 
        nameLower.includes('nachi') || nameLower.includes('sqy')) return 'bearings';
    if (nameLower.includes('টায়ার') || nameLower.includes('tire')) return 'tires';
    if (nameLower.includes('মবিল') || nameLower.includes('oil') || 
        nameLower.includes('গ্রিজ')) return 'oils';
    if (nameLower.includes('সুইচ') || nameLower.includes('switch') || 
        nameLower.includes('চার্জার') || nameLower.includes('সিডি')) return 'electrical';
    
    return 'other';
}

// Handle filtering
function handleFilter() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.id.toString().includes(searchTerm);
        
        const productCategory = categorizeProduct(product.name);
        const matchesCategory = category === 'all' || productCategory === category;
        
        return matchesSearch && matchesCategory;
    });
    
    currentPage = 1;
    handleSort();
}

// Handle sorting
function handleSort() {
    const sortBy = document.getElementById('sortFilter').value;
    
    switch(sortBy) {
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => {
                const priceA = parseFloat(a.selling) || 0;
                const priceB = parseFloat(b.selling) || 0;
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => {
                const priceA = parseFloat(a.selling) || 0;
                const priceB = parseFloat(b.selling) || 0;
                return priceB - priceA;
            });
            break;
        default: // serial
            filteredProducts.sort((a, b) => a.id - b.id);
    }
    
    displayProducts();
}

// Display products
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    const resultCount = document.getElementById('resultCount');
    
    resultCount.textContent = filteredProducts.length;
    
    if (filteredProducts.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    grid.innerHTML = pageProducts.map(product => `
        <div class="product-card">
            <div class="product-icon">${getProductIcon(product.name)}</div>
            <div class="product-serial">Serial #${product.id}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-prices">
                <div class="price-item">
                    <div class="price-label">Wholesale</div>
                    <div class="price-value">
                        ${product.wholesale ? '৳' + parseFloat(product.wholesale).toFixed(2) : 'N/A'}
                    </div>
                </div>
                <div class="price-item">
                    <div class="price-label">Retail</div>
                    <div class="price-value">
                        ${product.selling ? '৳' + parseFloat(product.selling).toFixed(2) : 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    renderPagination();
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="changePage(${currentPage - 1})">← Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" 
                            onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="page-btn" style="border: none; cursor: default;">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="changePage(${currentPage + 1})">Next →</button>`;
    }
    
    pagination.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}