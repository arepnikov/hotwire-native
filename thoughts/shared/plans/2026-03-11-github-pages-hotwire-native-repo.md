# GitHub Pages — `hotwire-native` Repo Structure Plan

## Overview

Move the workshop page from the local `github-pages` repo into a new GitHub repo
called `hotwire-native`. This enables a clean URL:

```
arepnikov.github.io/hotwire-native/workshop/
```

The repo root (`/hotwire-native/`) gets a minimal landing page in the same visual
style — useful if someone lands there, but it's not the primary URL we'll share.

## Current State

- Local directory: `/Users/visuality/prelections/workshops/github-pages/`
- Files: `index.html`, `style.css`, `script.js`, `images/`
- No GitHub remote set up yet (only a local git repo on `master` branch)

## Desired End State

- GitHub repo `arepnikov/hotwire-native` created and public
- GitHub Pages enabled on the `main` branch, root directory `/`
- `arepnikov.github.io/hotwire-native/` → minimal landing page
- `arepnikov.github.io/hotwire-native/workshop/` → full workshop page

## What We're NOT Doing

- No custom domain (use the default `github.io` URL)
- No build step / CI — pure static files, GitHub Pages serves directly
- The root page is intentionally minimal — not a duplicate of the workshop page
- Not setting up multiple branches or `gh-pages` branch — use `main` root

## File Structure (target)

```
hotwire-native/              ← repo root → arepnikov.github.io/hotwire-native/
├── index.html               ← minimal landing page (new)
├── style.css                ← shared (current style.css, unchanged)
├── images/                  ← shared images (moved from workshop)
│   ├── rcc-logo.svg
│   ├── alex.jpg
│   └── sebastian.jpg
└── workshop/
    ├── index.html           ← workshop page (current index.html, path-adjusted)
    └── script.js            ← workshop JS (current script.js, unchanged)
```

## Path Changes in workshop/index.html

All asset references need to go one level up:

| Current path            | New path                |
|-------------------------|-------------------------|
| `style.css`             | `../style.css`          |
| `images/rcc-logo.svg`   | `../images/rcc-logo.svg`|
| `images/alex.jpg`       | `../images/alex.jpg`    |
| `images/sebastian.jpg`  | `../images/sebastian.jpg`|
| `script.js`             | `script.js` (unchanged) |

## Root `index.html` Content

Minimal page, same dark theme:
- RCC badge (same as workshop)
- H1 "Hotwire Native" + tagline (same size/color as workshop)
- One-sentence description: "Resources for building mobile apps with Rails."
- Three repo cards (glass card grid, 3 columns): Rails, iOS, Android — each
  with repo name, brief description, and GitHub link
- One CTA button: "Go to the Workshop →" linking to `./workshop/`
- Footer: same credit line

---

## Phase 1: Restructure Local Files

**Goal:** Reorganize the local working directory to match the target file structure,
fix all relative paths, and create the new root `index.html`.

### Changes:

#### 1. Move workshop files into `workshop/` subdirectory
```bash
mkdir workshop
mv index.html workshop/index.html
mv script.js workshop/script.js
# images/ and style.css stay at root
```

#### 2. Update `workshop/index.html` — fix asset paths
Change every relative asset reference:
- `href="style.css"` → `href="../style.css"`
- `src="images/rcc-logo.svg"` → `src="../images/rcc-logo.svg"`
- `src="images/alex.jpg"` → `src="../images/alex.jpg"`
- `src="images/sebastian.jpg"` → `src="../images/sebastian.jpg"`
- `src="script.js"` → `src="script.js"` (no change — script is in same dir)

#### 3. Create root `index.html`
Minimal landing page using shared `style.css`. Sections:
- Blobs (ambient)
- Hero: RCC badge + "Hotwire Native" h1 + tagline + one-line description
- Repo grid: 3 glass cards (Rails / iOS / Android) each linking to GitHub
- CTA: "Go to the Workshop" button → `./workshop/`
- Footer: same credit line

### Success Criteria:

#### Automated Verification:
- [ ] `workshop/index.html` exists and references `../style.css`
- [ ] `workshop/script.js` exists
- [ ] `index.html` exists at root
- [ ] `images/` remains at root
- [ ] No broken relative paths (verify with: `grep 'src="images/' workshop/index.html` returns `../images/`)

#### Manual Verification:
- [ ] Open root `index.html` in browser — dark theme renders, 3 repo cards visible
- [ ] Click "Go to the Workshop" → workshop page loads correctly
- [ ] Workshop page: all images load, styles apply, code blocks highlight
- [ ] Workshop page: all `<details>` expand, copy buttons work

---

## Phase 2: Create GitHub Repo and Push

**Goal:** Get the files onto GitHub with Pages enabled.

### Steps (manual + command):

#### 1. Create the GitHub repo
```bash
gh repo create arepnikov/hotwire-native \
  --public \
  --description "Hotwire Native — Build Mobile Apps the Rails Way" \
  --source=. \
  --remote=origin \
  --push
```
This creates the repo, sets origin, and pushes `master` (or renames to `main`).

> Note: GitHub Pages works on `main`. If the local branch is `master`, rename it:
> ```bash
> git branch -m master main
> git push -u origin main
> ```

#### 2. Enable GitHub Pages via API
```bash
gh api repos/arepnikov/hotwire-native/pages \
  --method POST \
  -f source[branch]=main \
  -f source[path]=/
```

Or manually: repo Settings → Pages → Branch: `main`, folder: `/ (root)` → Save.

#### 3. Wait for deployment (~1–2 min), then verify
```bash
open https://arepnikov.github.io/hotwire-native/
open https://arepnikov.github.io/hotwire-native/workshop/
```

### Success Criteria:

#### Automated Verification:
- [ ] `gh repo view arepnikov/hotwire-native` returns the repo
- [ ] `curl -I https://arepnikov.github.io/hotwire-native/` returns HTTP 200
- [ ] `curl -I https://arepnikov.github.io/hotwire-native/workshop/` returns HTTP 200

#### Manual Verification:
- [ ] Root page renders correctly in browser at the live URL
- [ ] Workshop page renders correctly at the live URL
- [ ] All images, styles, and scripts load (no 404s in DevTools Network tab)
- [ ] Workshop `<details>` and copy buttons work on the live site

---

## References

- Current workshop page: `index.html` (workshop content)
- Current styles: `style.css`
- GitHub Pages docs: https://pages.github.com/
- `gh` CLI docs: https://cli.github.com/manual/gh_repo_create
