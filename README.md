# Haji Wadud CNG & Pick-up Parts — Website v3.0

A complete, professional multi-page static website for an automotive parts business. Built with deep navy + amber industrial aesthetics, custom cursor, product modals, and full responsiveness.

---

## 📦 File List

### HTML Pages (5)
| File | Description |
|------|-------------|
| `index.html` | Home — hero, stats strip, features, "how it works", categories, brand marquee, CTA |
| `products.html` | Product catalog with search, filter, sort, favorites, and detail modals |
| `price-list.html` | Full price table with sortable columns, CSV export, print support |
| `about.html` | About page — stats, history timeline, mission, values, why-us checklist |
| `contact.html` | Contact form with real-time validation, char counter, quick-action chips, map |

### CSS (1)
| File | Description |
|------|-------------|
| `styles.css` | Global design system v3 — all pages. Custom cursor, amber+navy palette, DM Serif Display + DM Sans fonts |

> **Note:** `price-list.css` from v2 is no longer needed. All styles are consolidated.

### JavaScript (3)
| File | Description |
|------|-------------|
| `script.js` | Core: custom cursor, theme, nav, animations, scroll progress, toast, favorites, WhatsApp float, back-to-top |
| `products.js` | Products: fetch CSV, search, filter, sort, paginate, favorites, product detail modal |
| `price-list.js` | Price list: fetch CSV, search, filter, sortable columns, paginate, CSV export, print |

### Assets (1)
| File | Description |
|------|-------------|
| `back.jpg` | Hero background image |

---

## ✨ What's New in v3.0

### 🎨 Design System Overhaul
- **Industrial aesthetic** — deep navy (`#1a3a6b`) primary + vivid amber (`#f59e0b`) accent
- **New fonts** — `DM Serif Display` (elegant serif headings) + `DM Sans` (clean body text)
- **Animated hero grid** — subtle amber dot-grid slowly drifts in the background
- **Amber accent indicators** — active nav link, card hover lines, section underlines, value cards all use amber
- **Scroll progress bar** — thin amber line grows across the bottom of the navbar as you scroll

### 🖱️ Custom Cursor (New in v3)
- Dual-element system: instant amber **dot** + lagging **ring** with lerp interpolation
- Hover state: ring expands + turns navy when hovering buttons/links/cards
- Click state: dot shrinks + brightens on mousedown
- Auto-disabled on touch devices — zero impact on mobile UX

### 🧭 Navbar Improvements
- **Staggered mobile menu items** — each link slides in with a cascade delay on open
- **Auto-close on resize** — menu closes if you resize to desktop width
- **Keyboard trap** — Tab key cycles through nav items when mobile menu is open
- **Amber top border** on mobile drawer (replaces invisible border)

### 🏠 index.html Additions
- **Stats strip** — bold navy band with key numbers directly below the hero
- **Brand scroller marquee** — auto-scrolling infinite ticker of brand names (pauses on hover)
- **"How It Works" section** — 4-step process cards with connecting arrows on desktop
- **Trust bar** — horizontal strip of 5 trust signals (ISO, delivery, warranty, WhatsApp, years)

### 🃏 products.html — Product Detail Modal (New)
- Click any product card to open a full-detail overlay modal
- Modal shows: icon, category badge, serial, full name, wholesale + retail price
- **WhatsApp inquiry button** pre-fills the product name, serial, and price in the message
- **Add to Favorites** toggle inside the modal syncs with the card heart button
- Closes on overlay click, ✕ button, or `Escape` key — scroll-locks body while open
- Spring animation on open, smooth fade on close

### 🃏 products.html — Card Improvements
- Amber accent bar slides in from left on hover
- Category badge on every card (e.g. "175 Series", "Bearings")
- Icon bounces + rotates 5° on hover
- **Inline WhatsApp button** slides up from bottom of card on hover
- Favorite heart uses SVG fill/outline (no emoji, works in all browsers)
- Fully rebuilt JS — no more monkey-patching of `render()`, favorites filter built directly into `applyFilters()`

### 📋 price-list.html Additions
- **Sortable columns** — click any header (Serial, Name, Wholesale, Retail) to sort asc/desc with visual ▲▼ arrows
- **Print button** — `window.print()` with full print stylesheet (hides nav, controls, footer)
- **Row fade-in** — staggered animation on every render (search, filter, page change)
- **Export loading state** — button shows "⏳ Exporting…" while Blob is created

### 📄 about.html Additions
- **History timeline** — vertical amber-line timeline from 2003 → 2024, with animated dot hover
- **Lead paragraph** — italic blockquote-style opening with amber left border
- **Highlight box** — amber-tinted quote block
- **Stats strip** at top of page (Years Active, Products, Brands, Genuine)
- **Why-choose-us checklist** — SVG amber check icons, replacing bold paragraphs

### 📬 contact.html Improvements
- **Real-time field validation** — green border on valid, red on invalid, error messages appear inline
- **Character counter** — live `0 / 1000` counter on the message field; turns amber at 800, red at 950
- **Quick-action chips** — pre-filled WhatsApp links for "Get a Quote", "Check Availability", "View Prices"
- **Submit loading state** — button shows "Opening WhatsApp…" on submit
- **Hours table** — clean two-column table replacing the paragraph
- All Cloudflare-obfuscated email links replaced with plain `mailto:info@hajiwadudparts.com`

---

## 🚀 Setup

### 1. Google Sheets Data Source
Both `products.js` and `price-list.js` use the same published CSV URL at the top of each file:

```javascript
const SHEET_CSV_URL = 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE';
```

To publish your Google Sheet as CSV:
1. Open your sheet → File → Share → Publish to web
2. Select the correct sheet tab
3. Choose format: **Comma-separated values (.csv)**
4. Click Publish and copy the URL

Expected column order (Row 1 = headers, auto-skipped):
```
A: Serial Number  |  B: Product Name  |  C: Wholesale Price  |  D: Retail/Selling Price
```

### 2. WhatsApp Number
Replace `88015483159` with your real WhatsApp number (country code, no `+`):

| File | Occurrences |
|------|-------------|
| `script.js` | 2 |
| `products.js` | 2 |
| `index.html` | 3 |
| `about.html` | 1 |
| `contact.html` | 5 |

### 3. Phone & Email
Replace placeholder values in all 5 HTML files and the JS files:
- `+880 1XXX-XXXXXX` → your real phone number
- `info@hajiwadudparts.com` → your real email address

### 4. Hero Image
Replace `back.jpg` with your own background image. Recommended size: 1920×1080px minimum, landscape orientation.

---

## 📁 Folder Structure

```
haji-wadud-parts/
│
├── index.html
├── products.html
├── price-list.html
├── about.html
├── contact.html
│
├── styles.css          ← Global design system (all pages)
├── script.js           ← Core JS (load FIRST on every page)
├── products.js         ← Products page JS
├── price-list.js       ← Price list page JS
│
└── back.jpg            ← Hero background image
```

> `price-list.css` from v2 is **no longer needed** and can be deleted.

---

## 🌐 Deployment (Static — No Build Step)

| Platform | Instructions |
|----------|-------------|
| **GitHub Pages** | Push to a `gh-pages` branch or enable Pages in repo settings |
| **Netlify** | Drag-and-drop the folder at [netlify.com/drop](https://netlify.com/drop) |
| **Vercel** | `vercel deploy` from the project folder |
| **cPanel / Web Hosting** | Upload all files via FTP to `public_html/` |

---

## 🧪 Testing Checklist

### Desktop (Chrome, Firefox, Safari, Edge)
- [ ] Custom cursor visible — dot + ring, hover/click states work
- [ ] Light/dark mode toggle persists on refresh
- [ ] Navbar scroll progress bar grows as you scroll
- [ ] Hero grid animation visible (subtle drift)
- [ ] Brand marquee auto-scrolls, pauses on hover
- [ ] Product cards open detail modal on click
- [ ] WhatsApp button in modal pre-fills product details
- [ ] Price list columns sortable (click header for ▲▼)
- [ ] CSV export downloads with UTF-8 BOM
- [ ] Print button opens print dialog with clean layout
- [ ] Contact form validates in real-time (green/red borders)
- [ ] Character counter updates on message field
- [ ] Timeline on About page shows correctly

### Mobile (iOS Safari, Android Chrome)
- [ ] Custom cursor NOT shown on touch devices
- [ ] Hamburger menu opens/closes with amber top border
- [ ] Nav items stagger in with delay
- [ ] Menu closes on outside tap or resize
- [ ] Hero stats display as 3-column row
- [ ] Brand marquee scrolls on mobile
- [ ] Product grid collapses to 2 columns
- [ ] Product modal opens and scroll-locks body
- [ ] Price table has horizontal scroll
- [ ] Form fields are touch-friendly (min 48px targets)
- [ ] WhatsApp float button doesn't overlap content

### Accessibility
- [ ] All images have `alt` text or `aria-hidden="true"`
- [ ] All interactive elements keyboard-navigable
- [ ] Focus outlines visible (amber color)
- [ ] Dark mode has sufficient contrast ratio (≥4.5:1)
- [ ] `prefers-reduced-motion` disables animations
- [ ] Modal has `aria-modal="true"` and `aria-labelledby`
- [ ] Form errors use `role="alert"` for screen readers
- [ ] Sortable table headers announce sort state

---

## 🔄 Version History

| Version | Summary |
|---------|---------|
| v1.0 | Initial static site |
| v2.0 | Dark mode, WhatsApp float, favorites, glassmorphism navbar, bug fixes |
| **v3.0** | Custom cursor, amber+navy redesign, DM Serif fonts, product modals, column sorting, print support, timeline, real-time form validation, brand marquee |

---

*Built with care for Haji Wadud CNG & Pick-up Parts, Comilla, Bangladesh.*
