# Hotwire Native Workshop — Static GitHub Pages Implementation Plan

## Overview

Convert the Next.js workshop page at websiteinit.com/hotwire-native-workshop into a
self-contained static HTML page for GitHub Pages. Goal: pixel-close visual fidelity,
minimal JavaScript, semantic HTML, images hosted locally.

## Current State Analysis

- Source: Next.js app at websiteinit.com/hotwire-native-workshop
- Target: static `index.html` + `style.css` at repo root, deployable to GitHub Pages
- Images downloaded to `images/` directory (alex.jpg, sebastian.jpg, rcc-logo.png)
- Empty project directory — greenfield

## Desired End State

A single `index.html` + `style.css` (+ minimal `script.js`) that:
- Renders identically to the original across desktop and mobile
- Passes GitHub Pages hosting with no build step required
- Uses Prism.js (CDN) for syntax highlighting
- All assets (images) are local — no external image dependencies

## What We're NOT Doing

- No Node.js / npm / build tooling
- No React, Vue, or any framework
- No server-side rendering
- No Next.js image optimization (use local images directly)
- Not redesigning the "What We'll Build" section content (keep as-is for now)

## File Structure

```
github-pages/
├── index.html
├── style.css
├── script.js
└── images/
    ├── alex.jpg
    ├── sebastian.jpg
    └── rcc-logo.png
```

## Implementation Phases

### Phase 1: Base HTML Structure

**File**: `index.html`

Skeleton with:
- `<head>`: charset, viewport, title, Prism.js CDN links, link to style.css
- Body sections in order: header, info-cards, sticky-nav, slides, hosts, about, setup, modules, resources, footer
- All `<details>` elements for collapsible sections (no JS needed)
- Proper `id=""` anchors matching nav links

Prism.js CDN (dark theme — "Tomorrow Night"):
```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-ruby.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-swift.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-kotlin.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-css.min.js"></script>
```

### Phase 2: CSS — Color System & Base Styles

**File**: `style.css`

CSS custom properties:
```css
:root {
  --bg:           #0F0E0A;
  --text:         #F7F5EF;
  --accent:       #DA7756;   /* terra/coral */
  --muted:        #9B9484;
  --muted-dark:   #6B6455;
  --glass-bg:     rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.08);
  --code-bg:      #1d1f21;
  --font:         -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', 'Consolas', monospace;
}
```

Visual effects:
- Grid background: `repeating-linear-gradient` at 60px spacing, ~3% opacity
- Glassmorphism cards: `background: var(--glass-bg)`, `border: 1px solid var(--glass-border)`, `border-radius: 12px`
- Gradient blobs: `position: fixed` pseudo-elements with blur for ambient glow
- Sticky nav: `position: sticky; top: 0` with backdrop blur

### Phase 3: Section-by-Section HTML

**Header/Hero:**
- Conference logo (img) + breadcrumb text
- H1 "Hotwire Native" + styled subtitle "Build Mobile Apps the Rails Way" in `--accent`
- Subheading paragraph

**Info Cards Grid:**
- 4-column CSS grid (2x2 on mobile), each card glass-styled
- Calendar/Maps/Luma links with ↗ icon

**Sticky Navigation:**
- `<nav>` with `position: sticky; top: 0; z-index: 100`
- `backdrop-filter: blur(12px)`
- `<a href="#section-id">` links with hover accent color

**Slides Section** (`id="presentation"`):
- Single card with external link to Google Drive slides

**Hosts Section** (`id="hosts"`):
- 2-column flex layout per host: circular `<img>` + bio text + LinkedIn/GitHub links

**About Section** (`id="about"`):
- Prose paragraphs
- "Who is this for?" callout box with `--accent` left border

**Pre-Workshop Setup** (`id="setup"`):
- 4x `<details><summary>` elements (browser-native collapsible, no JS)
- Sub-tabs for macOS/Linux using nested `<details>` or radio buttons
- Code blocks: `<pre><code class="language-bash">` for Prism.js
- Checklist at bottom

**What We'll Build** (`id="modules"`):
- 7x `<details>` cards, numbered
- Each with duration badge, description, bullet points
- Code blocks per language with `language-swift`, `language-kotlin`, `language-json`, `language-ruby`, `language-javascript`, `language-erb` (use `language-html` for ERB), `language-css`

**Resources** (`id="resources"`):
- 2-column CSS grid of link cards
- Each: title with ↗, description, external `href`

**Footer:**
- Conference name, date/location
- CTA button link to Luma
- Copyright line

### Phase 4: JavaScript (script.js)

Only two small features:
1. **Copy-to-clipboard** on code blocks — add a "Copy" button overlay to each `<pre>`, vanilla JS `navigator.clipboard.writeText()`
2. **Sticky nav active state** — `IntersectionObserver` to highlight current section in nav

Estimated: ~50 lines total.

### Phase 5: Mobile Responsiveness

CSS media queries only:
- Info cards: 4-col → 2-col → 1-col
- Resources: 2-col → 1-col
- Hosts: side-by-side → stacked
- Nav: horizontal scroll on small screens
- Sticky nav hidden on very small screens or collapsed

## Color Reference (from original)

| Element | Color |
|---------|-------|
| Page background | `#0F0E0A` |
| Primary text | `#F7F5EF` |
| Accent (terra) | `#DA7756` |
| Muted text | `#9B9484` |
| Very muted | `#6B6455` |
| Code background | `#1d1f21` |
| Glass card bg | `rgba(255,255,255,0.05)` |
| Glass card border | `rgba(255,255,255,0.08)` |

## Success Criteria

### Automated Verification:
- [ ] `index.html` opens in browser with no console errors
- [ ] All images load (no broken img src)
- [ ] All anchor links (`#presentation`, `#hosts`, `#about`, `#setup`, `#modules`, `#resources`) scroll correctly
- [ ] Prism.js highlights all code blocks (Swift, Kotlin, JSON, Ruby, JS, CSS)
- [ ] Page passes HTML validation (validator.w3.org)

### Manual Verification:
- [ ] Dark background, terra accent, glassmorphism cards match original visually
- [ ] Grid background pattern visible
- [ ] All 4 info cards display correctly
- [ ] All 7 module `<details>` expand/collapse
- [ ] All 4 setup `<details>` expand/collapse with nested tabs
- [ ] Copy buttons work on code blocks
- [ ] Responsive layout looks correct on 375px (iPhone SE) and 1280px (desktop)
- [ ] Sticky nav stays visible on scroll, links highlight current section

## References

- Original page: https://websiteinit.com/hotwire-native-workshop
- Prism.js CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/
- GitHub Pages docs: https://pages.github.com/
