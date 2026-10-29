# CLAUDE.md — authoring & design guide for this blog

Guidance for working on this Hugo site, especially **writing blog posts** and
**using the design system**. Read this before adding posts or UI.

## What this site is

A personal blog built with **Hugo** using the `paper` theme (git submodule at
`themes/paper`, heavily overridden in `layouts/`). Content is Markdown under `content/`. Local dev and the résumé
workflow are documented in `README.md` (`hugo server -D` to preview drafts).

## How styling works (important)

- The visual design is **"Notebook"**: a warm white page, near-black ink, and
  one vermilion accent, set in IBM Plex (Sans for chrome and headings, Serif
  for reading, Mono for dates, labels and code). Flat: no gradients, glass,
  glows or background decoration. Dark mode is a warm near-black with a lighter
  vermilion so the accent stays readable as text. (It replaced the older
  "Verdant Glass" design in Oct 2026.)
- **Page shell:** `layouts/_default/baseof.html` is a three-column grid: a
  left rail pinned near the window edge, the main column (max 680px) centred
  on the page, and an empty right column that keeps it centred, so the rail
  never narrows the reading column. Home puts the sidebar in the rail
  (`partials/sidebar.html`: handle, name, bio, nav, links, light/dark switch).
  Every other page gets a full-width top bar (`partials/topbar.html`: handle,
  nav, theme switch) and, on posts, the table of contents in the rail
  (`partials/toc.html`). The top bar is sticky, and TOC links scroll smoothly
  (`scroll-behavior`, off under reduced motion); headings get
  `scroll-margin-top` from `--topbar-h` so they land below the bar. The theme's
  `body { height: 100% }` is overridden to `auto`, or sticky stops working.
  The menu itself is `partials/nav.html`. Below 1080px
  the TOC is dropped; below 820px everything stacks. The theme's header is not
  used.
- **Home** (`layouts/_default/list.html` + `partials/post-row.html`) lists every
  post grouped by year, with working topic filters (tags used by 2+ posts;
  `?topic=<tag>` in the URL). Posts that embed a shortcode listed in
  `params.interactiveShortcodes` (hugo.toml) get an "interactive" marker, so add
  new widget shortcodes to that list.
- **Code** is highlighted at build time by Chroma with CSS classes
  (`markup.highlight.noClasses = false`); the colours are the `.chroma` rules in
  `custom.css`. The theme's highlight.js is off (`disableHLJS`).
- **All custom styling lives in `assets/custom.css`** (a site-level file that
  overrides the theme's copy). The theme ships precompiled Tailwind in
  `themes/paper/assets/main.css`; Hugo only **concatenates** `main.css` +
  `custom.css` — it does **not** run Tailwind at build time.
- **Consequence:** do NOT rely on adding new Tailwind utility classes in layouts
  — they won't exist in the precompiled `main.css`. Write plain CSS in
  `assets/custom.css` instead, using the design tokens below.
- **Always use the CSS variables, never hardcoded hex.** They flip automatically
  between light and dark mode (dark mode = `.dark` class on `<html>`).

### Design tokens (defined in `assets/custom.css`)

Surfaces: `--page` (not `--bg`, which the theme sets inline on `<html>`)
`--panel` `--code-bg` `--inline-code-bg` `--note-bg`.
Ink: `--ink` (headings, titles) `--text` (reading) `--text-2` (descriptions)
`--muted` (meta, labels; passes 4.5:1) `--faint` (decoration only).
Lines: `--rule` (hairlines) `--line` (control borders).
Accent: `--accent` `--accent-hover` `--on-accent` (text on accent fills)
`--accent-soft` (tinted fill).
Extra hues for widgets that must show several states: `--blue` `--blue-soft`
`--green` `--green-soft`. Pair accent with blue; make states differ in
lightness or pattern too, not hue alone.
Shape: `--radius` (8px, controls) `--radius-card` (10px, panels) `--radius-pill`.
Type: `--font-sans` (UI, headings) `--font-serif` (reading) `--font-mono`
(code, dates, labels, tags).
The old Verdant Glass names (`--color-emerald`, `--surface`, `--gel-green`, …)
still exist as aliases of these; don't use them in new code.

### Component classes (use in shortcodes / layouts)

- `.nb-panel` (alias `.gel-card`) — flat bordered panel; `.gel-card__title` is a
  mono uppercase accent label.
- `.nb-btn` (solid accent; alias `.gel-btn`), `.nb-btn--ghost` (outlined; alias
  `.gel-btn--amber`), add `.pill` for fully rounded.
- `.callout` + `.callout__label`, `.callout--amber`, `.callout--clay` — notes.
- `.nb-sq` / `.nb-sq--s` — the small accent square used as a marker.
- `.tag` — plain mono tag text.
- Interactive widgets: a `--panel` box with a 1px `--rule` border, a mono
  uppercase accent caption ("INTERACTIVE · …") with a small square, accent for
  the active item, `--ink` outline for "in focus", neutral `--code-bg` cells.
- Wrap interactive widget chrome in `.not-prose` so the theme's prose typography
  doesn't restyle it.

## Writing a post

Create `content/posts/<n>_<slug>.md` (or a page bundle
`content/posts/<n>_<slug>/index.md` with an `images/` subfolder for posts with
images — see `content/posts/3_acugemma/`). Front matter (TOML):

```toml
+++
title = 'Post title'
date = 2026-07-23T09:00:00+03:00
draft = true            # flip to false (or remove) to publish
description = 'One-line summary shown on the list page and in meta tags.'
tags = ['algorithms', 'go']
math = true             # only if the post uses LaTeX math
+++
```

- **Code blocks:** fenced with a language (```` ```python ````). Styled
  automatically (deep-forest surface, rounded).
- **Math:** set `math = true`, then use `$…$` inline and `$$…$$` display.
- **Featured posts:** set `weight = 1` (or any `> 0`) in front matter to show a
  "Featured" tag on the list page.

## Interactive & styled elements in posts — use SHORTCODES

**Raw HTML written directly in Markdown is stripped** by Hugo's Goldmark parser
(`unsafe` is off, and we keep it off). So to inject HTML/JS/components, use a
shortcode — shortcodes bypass that restriction.

Available shortcodes (`layouts/shortcodes/`):

| Shortcode | Purpose | Example |
|-----------|---------|---------|
| `solution` | Collapsible reveal card (interactive) | `{{</* solution title="Approach" button="Reveal" */>}}…{{</* /solution */>}}` |
| `callout` | Labelled aside (`type="amber"`/`"clay"`) | `{{</* callout type="amber" title="Note" */>}}…{{</* /callout */>}}` |
| `gelcard` | Bordered panel for grouped content | `{{</* gelcard title="Try it" */>}}…{{</* /gelcard */>}}` |
| `atcoder-device` | Self-contained interactive demo (example) | `{{</* atcoder-device */>}}` |

### Writing a NEW interactive shortcode

Model it on `layouts/shortcodes/solution.html` and `atcoder-device.html`:

1. Keep it **self-contained**: HTML + a scoped `<style>` (or reuse component
   classes) + an IIFE `<script>` in one file.
2. Generate a **unique id** per instance: `{{ $id := printf "widget-%d" now.UnixNano }}`
   and scope all `querySelector` calls to that element — a post may embed the
   widget more than once.
3. Wrap the widget in `.not-prose` and style with the **CSS variables / component
   classes** so it matches the theme and both color modes.
4. In a `<script>` context, Hugo's template engine **auto-quotes and JS-escapes**
   interpolated values — write `var x = {{ $param }};` (which yields
   `var x = "value";`). Do **not** `jsonify` first, or you'll double-encode it.
5. Motion is globally disabled under `prefers-reduced-motion` — keep animations
   gentle and don't fight that.

## Dark mode

Toggled by a `.dark` class on `<html>` (theme handles the switch + localStorage).
Because components use CSS variables, they adapt automatically. If you must add a
dark-specific rule, target `.dark .your-selector { … }`.

## Verifying changes

```sh
hugo server -D              # preview (includes drafts), http://localhost:1313/
hugo --gc --minify          # production build into public/
```

There is a live reference/preview post at `content/posts/5_design_demo.md`
(a draft) exercising every component — keep it as a reference or delete it
before it would ever publish (it's `draft = true`, so it won't).
