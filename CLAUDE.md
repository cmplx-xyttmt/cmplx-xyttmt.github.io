# CLAUDE.md — authoring & design guide for this blog

Guidance for working on this Hugo site, especially **writing blog posts** and
**using the design system**. Read this before adding posts or UI.

## What this site is

A personal blog built with **Hugo** using the `paper` theme (git submodule at
`themes/paper`). Content is Markdown under `content/`. Local dev and the résumé
workflow are documented in `README.md` (`hugo server -D` to preview drafts).

## How styling works (important)

- The visual design is a **2brain-inspired reskin** ("Verdant Glass"): warm cream
  background, forest-green serif reading type, soft green-tinted depth, with
  glass/gel treatments reserved for chrome and interactive widgets.
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

Colors: `--color-forest` `--color-pine` `--color-emerald` `--color-moss`
`--color-leaf` (greens); `--color-amber` `--color-peach` `--color-clay`
`--color-teal` (warm accents); `--color-cream` `--color-sage` `--color-ink`.
Semantic: `--text` `--heading` `--link` `--muted` `--faint`.
Surfaces: `--surface` `--surface-border` `--surface-shadow` `--glass-blur`.
Gradients: `--gel-green` `--gel-amber`. Code: `--code-bg` `--code-text`
`--inline-code-bg`. Shape: `--radius-glass` `--radius-button` `--radius-pill`.
Type: `--font-serif` (reading + headings), `--font-sans` (UI/chrome),
`--font-mono` (code, meta, tags).

### Component classes (use in shortcodes / layouts)

- `.gel-card` + `.gel-card__title` — frosted glass container for demos/notes.
- `.gel-btn` (green), `.gel-btn--amber`, add `.pill` for fully rounded — gradient buttons.
- `.glass` — bare frosted surface for chrome.
- `.callout`, `.callout--amber`, `.callout--clay` — labelled asides.
- `.tag` — mono uppercase chip.
- `.post-card` (list page).
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
| `gelcard` | Frosted container for grouped content | `{{</* gelcard title="Try it" */>}}…{{</* /gelcard */>}}` |
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
