/* ============================================================
   HAJI WADUD PARTS — MAIN SCRIPT v3.0
   🆕 BATCH 1 UPGRADES:
   ✅ Custom cursor (glow ring + dot, hover/click states)
   ✅ Smooth cursor lag on ring for premium feel
   ✅ Hero text reveal animation on load
   ✅ Particle/shimmer effect on CTA hover
   ✅ Improved count-up with better easing
   ✅ Auto-close mobile menu on resize to desktop
   ✅ Keyboard trap in mobile nav (Tab cycles through items)
   ✅ Better scroll progress indicator in navbar
   ✅ All v2.0 bugs preserved as fixed
   ============================================================ */

'use strict';

/* ============================================================
   1. THEME — init before DOM ready to prevent flash
   ============================================================ */
(function initTheme() {
    const saved = localStorage.getItem('hw-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
})();


/* ============================================================
   2. CUSTOM CURSOR  🆕 NEW
   ============================================================ */
(function initCursor() {
    // Only on devices that have a fine pointer (mouse/trackpad)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot  = document.createElement('div');
    dot.id     = 'cursor-dot';
    const ring = document.createElement('div');
    ring.id    = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;
    let raf;

    // Move dot instantly, ring follows with lag
    function lerp(a, b, t) { return a + (b - a) * t; }

    function animateRing() {
        ringX = lerp(ringX, mouseX, 0.14);
        ringY = lerp(ringY, mouseY, 0.14);
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        raf = requestAnimationFrame(animateRing);
    }
    raf = requestAnimationFrame(animateRing);

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    // Hover state on interactive elements
    const interactiveSelectors =
        'a, button, [role="button"], input, select, textarea, .category-card, .product-card, .brand-pill, .fav-btn, .page-btn';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            document.body.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            document.body.classList.remove('cursor-hover');
        }
    });

    // Click state
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

    // Hide when mouse leaves window
    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity  = '';
        ring.style.opacity = '';
    });
})();


/* ============================================================
   3. BACK TO TOP BUTTON
   ============================================================ */
(function injectBackToTop() {
    const btn = document.createElement('button');
    btn.id    = 'backToTop';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <polyline points="18 15 12 9 6 15"/>
    </svg>`;

    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '96px',
        right: '22px',
        zIndex: '8999',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'var(--bg-card)',
        border: '2px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: '0',
        pointerEvents: 'none',
        transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
        color: 'var(--txt-heading)',
        transform: 'translateY(12px)',
    });
    btn.querySelector('svg').style.cssText = 'width:17px;height:17px;';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    btn.addEventListener('mouseenter', () => {
        btn.style.borderColor = 'var(--clr-accent)';
        btn.style.color       = 'var(--clr-accent)';
        btn.style.background  = 'var(--clr-accent-tint)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = 'var(--border)';
        btn.style.color       = 'var(--txt-heading)';
        btn.style.background  = 'var(--bg-card)';
    });

    window.addEventListener('scroll', () => {
        const visible = window.scrollY > 400;
        btn.style.opacity       = visible ? '1' : '0';
        btn.style.pointerEvents = visible ? 'auto' : 'none';
        btn.style.transform     = visible ? 'translateY(0)' : 'translateY(12px)';
    }, { passive: true });
})();


/* ============================================================
   MAIN DOM-READY BLOCK
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ── 4. THEME TOGGLE ── */
    const html        = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', next);
            localStorage.setItem('hw-theme', next);
        });
    }


    /* ── 5. HAMBURGER MENU ── */
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');

    function closeMenu() {
        if (!navMenu || !hamburger) return;
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    }

    function openMenu() {
        if (!navMenu || !hamburger) return;
        // Force browser to re-read layout so CSS transition fires cleanly
        navMenu.getBoundingClientRect();
        navMenu.classList.add('active');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.contains('active') ? closeMenu() : openMenu();
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', (e) => {
            if (
                navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !hamburger.contains(e.target)
            ) closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        // 🆕 Auto-close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 900) closeMenu();
        }, { passive: true });

        // 🆕 Keyboard trap — Tab cycles through nav links when menu open
        navMenu.addEventListener('keydown', (e) => {
            if (!navMenu.classList.contains('active') || e.key !== 'Tab') return;
            const links = [...navMenu.querySelectorAll('a')];
            const first = links[0];
            const last  = links[links.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                hamburger.focus();
            }
        });
    }


    /* ── 6. NAVBAR SCROLL SHADOW + PROGRESS LINE ── */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        // 🆕 Inject scroll progress line
        const progressLine = document.createElement('div');
        progressLine.style.cssText = `
            position: absolute; bottom: -1px; left: 0; height: 2px;
            background: var(--clr-accent); width: 0%;
            transition: width 0.1s linear; z-index: 1;
        `;
        navbar.style.position = 'sticky';
        navbar.appendChild(progressLine);

        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
            // Progress
            const docH   = document.documentElement.scrollHeight - window.innerHeight;
            const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
            progressLine.style.width = pct + '%';
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }


    /* ── 7. SMOOTH SCROLL for anchor links ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const navH = navbar ? navbar.offsetHeight : 68;
            window.scrollTo({ top: target.offsetTop - navH - 8, behavior: 'smooth' });
        });
    });


    /* ── 8. HERO TEXT REVEAL ANIMATION  🆕 NEW ── */
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        const badge    = heroText.querySelector('.badge');
        const heading  = heroText.querySelector('h1');
        const desc     = heroText.querySelector('.hero-desc');
        const actions  = heroText.querySelector('.hero-actions');
        const stats    = document.querySelector('.hero-stats');

        const items = [badge, heading, desc, actions, stats].filter(Boolean);
        items.forEach((el, i) => {
            el.style.opacity   = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity 0.6s ease, transform 0.6s ease`;
            el.style.transitionDelay = `${0.1 + i * 0.12}s`;
        });

        // Trigger after tiny delay (paint)
        requestAnimationFrame(() => {
            items.forEach(el => {
                el.style.opacity   = '1';
                el.style.transform = 'translateY(0)';
            });
        });
    }


    /* ── 9. SCROLL-TRIGGERED ANIMATIONS ── */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animatedEls = document.querySelectorAll(
        '.feature-card, .category-card, .brand-pill, .stat-box, .value-card, .product-card, .contact-info-item'
    );

    if (!prefersReduced && 'IntersectionObserver' in window && animatedEls.length) {
        animatedEls.forEach((el, i) => {
            el.classList.add('animate-on-scroll');
            el.style.transitionDelay = `${(i % 6) * 0.065}s`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

        animatedEls.forEach(el => observer.observe(el));
    } else {
        animatedEls.forEach(el => el.classList.add('visible'));
    }


    /* ── 10. COUNT-UP ANIMATION ── */
    if (!prefersReduced) {
        const countEls = document.querySelectorAll('.stat-number');
        if ('IntersectionObserver' in window && countEls.length) {
            const countObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        countObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            countEls.forEach(el => countObserver.observe(el));
        }
    }

    function animateCount(el) {
        const text  = el.textContent.trim();
        const match = text.match(/^(\d+)(\D*)$/);
        if (!match) return;
        const end      = parseInt(match[1], 10);
        const suffix   = match[2] || '';
        const duration = 1800;
        const start    = performance.now();

        function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * end) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }


    /* ── 11. CONTACT FORM ── */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name    = document.getElementById('contactName')?.value.trim();
            const email   = document.getElementById('contactEmail')?.value.trim();
            const phone   = document.getElementById('contactPhone')?.value.trim();
            const message = document.getElementById('contactMessage')?.value.trim();

            if (!name || !email || !message) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            const waMsg = `Hello Haji Wadud Parts!\n\nName: ${name}\nEmail: ${email}${phone ? '\nPhone: ' + phone : ''}\n\nMessage: ${message}`;
            const waUrl = `https://wa.me/8801815483159?text=${encodeURIComponent(waMsg)}`;
            window.open(waUrl, '_blank', 'noopener,noreferrer');
            contactForm.reset();
            showToast('✓ Redirecting to WhatsApp…');
        });
    }


    /* ── 12. URL PARAM — pre-select category filter ── */
    const urlParams      = new URLSearchParams(window.location.search);
    const categoryParam  = urlParams.get('category');
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryParam && categoryFilter) {
        categoryFilter.value = categoryParam;
        categoryFilter.dispatchEvent(new Event('change'));
    }


    /* ── 13. WHATSAPP FLOAT BUTTON ── */
    if (!document.querySelector('.whatsapp-float')) {
        const wa = document.createElement('a');
        wa.href      = 'https://wa.me/8801815483159?text=Hello%20Haji%20Wadud%20Parts!';
        wa.className = 'whatsapp-float';
        wa.target    = '_blank';
        wa.rel       = 'noopener noreferrer';
        wa.setAttribute('aria-label', 'Chat on WhatsApp');
        wa.title = 'Chat on WhatsApp';
        wa.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>`;
        document.body.appendChild(wa);
    }

    /* ── 14. BRAND PILLS SHUFFLE ANIMATION  🆕 NEW ── */
    const brandPills = document.querySelectorAll('.brand-pill');
    if (brandPills.length && !prefersReduced) {
        brandPills.forEach((pill, i) => {
            pill.style.animationDelay = `${i * 0.08}s`;
        });
    }

});


/* ============================================================
   UTILITIES
   ============================================================ */

/* showToast */
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast${type === 'error' ? ' error' : ''}`;

    const icon = type === 'error'
        ? `<svg style="width:18px;height:18px;flex-shrink:0;color:var(--clr-error)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
        : `<svg style="width:18px;height:18px;flex-shrink:0;color:var(--clr-success)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;

    toast.innerHTML = icon + `<span>${message}</span>`;
    if (type === 'error') toast.style.borderLeftColor = 'var(--clr-error)';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 3500);
}
window.showToast = showToast;

/* Email validation */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* formatPrice */
function formatPrice(price) {
    if (!price && price !== 0) return '—';
    const num = parseFloat(price);
    if (isNaN(num)) return '—';
    return '৳' + num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
window.formatPrice = formatPrice;

/* debounce — must be on window BEFORE products.js / price-list.js */
function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
window.debounce = debounce;

/* Favorites (localStorage) */
const FAVS_KEY = 'hw_favorites';

function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'); }
    catch { return []; }
}

function toggleFavorite(serial) {
    const favs = getFavorites();
    const idx  = favs.indexOf(serial);
    if (idx === -1) {
        favs.push(serial);
        showToast('❤️ Added to favorites');
    } else {
        favs.splice(idx, 1);
        showToast('Removed from favorites');
    }
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
    return favs;
}

function isFavorite(serial) { return getFavorites().includes(serial); }

window.getFavorites   = getFavorites;
window.toggleFavorite = toggleFavorite;
window.isFavorite     = isFavorite;
