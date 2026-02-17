/* ============================================================
   HAJI WADUD PARTS — MAIN SCRIPT
   Handles: Dark Mode, Hamburger, Scroll FX, Animations
   ============================================================ */

'use strict';

// ============================================================
// 1. THEME (Dark / Light Mode)
// ============================================================

(function initTheme() {
    const saved = localStorage.getItem('hw-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', () => {

    const html        = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current  = html.getAttribute('data-theme');
            const next     = current === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', next);
            localStorage.setItem('hw-theme', next);
        });
    }


    // ============================================================
    // 2. HAMBURGER MENU
    // ============================================================

    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');

    function closeMenu() {
        if (!navMenu || !hamburger) return;
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function openMenu() {
        if (!navMenu || !hamburger) return;
        navMenu.classList.add('active');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('active');
            isOpen ? closeMenu() : openMenu();
        });

        // Close on nav link click
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !hamburger.contains(e.target)) {
                closeMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }


    // ============================================================
    // 3. NAVBAR — add shadow on scroll
    // ============================================================

    const navbar = document.getElementById('navbar');

    if (navbar) {
        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run once on load
    }


    // ============================================================
    // 4. SMOOTH SCROLL for anchor links
    // ============================================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const navH = navbar ? navbar.offsetHeight : 68;
            window.scrollTo({
                top: target.offsetTop - navH - 8,
                behavior: 'smooth'
            });
        });
    });


    // ============================================================
    // 5. SCROLL-TRIGGERED ANIMATIONS
    // ============================================================

    const animatedEls = document.querySelectorAll(
        '.feature-card, .category-card, .brand-pill, .stat-box, .value-card, .product-card, .contact-info-item'
    );

    if ('IntersectionObserver' in window && animatedEls.length) {
        animatedEls.forEach((el, i) => {
            el.classList.add('animate-on-scroll');
            // Stagger delay per item (max 5 per row)
            el.style.transitionDelay = `${(i % 5) * 0.07}s`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        animatedEls.forEach(el => observer.observe(el));
    }


    // ============================================================
    // 6. CONTACT FORM SUBMISSION (contact.html)
    // ============================================================

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name    = document.getElementById('contactName')?.value.trim();
            const email   = document.getElementById('contactEmail')?.value.trim();
            const message = document.getElementById('contactMessage')?.value.trim();

            if (!name || !email || !message) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate send success
            contactForm.reset();
            showToast('✓ Message sent! We will respond within 24 hours.');
        });
    }


    // ============================================================
    // 7. URL PARAM — pre-select category filter
    // ============================================================

    const urlParams      = new URLSearchParams(window.location.search);
    const categoryParam  = urlParams.get('category');
    const categoryFilter = document.getElementById('categoryFilter');

    if (categoryParam && categoryFilter) {
        categoryFilter.value = categoryParam;
        // Dispatch change so any page's JS can react
        categoryFilter.dispatchEvent(new Event('change'));
    }

});


// ============================================================
// UTILITY: Show toast notification
// ============================================================

function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') {
        toast.style.borderColor = '#ef4444';
        toast.style.color = '#ef4444';
    }
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 3500);
}

// Expose globally so inline onclick handlers can use it
window.showToast = showToast;


// ============================================================
// UTILITY: Validate email format
// ============================================================

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ============================================================
// UTILITY: Format price with ৳ symbol
// ============================================================

function formatPrice(price) {
    if (!price && price !== 0) return '—';
    const num = parseFloat(price);
    if (isNaN(num)) return '—';
    return '৳' + num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

window.formatPrice = formatPrice;


// ============================================================
// UTILITY: Debounce
// ============================================================

function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

window.debounce = debounce;
