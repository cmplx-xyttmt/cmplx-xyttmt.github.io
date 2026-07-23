# cmplx-xyttmt.github.io

Personal site / blog, built with [Hugo](https://gohugo.io/). Uses the `paper` theme,
included as a git submodule under `themes/paper`.

## Local development

Clone with the theme submodule (first time):

```sh
git clone --recurse-submodules <repo-url>
# or, if already cloned without submodules:
git submodule update --init --recursive
```

Run the dev server (live reload, includes draft/future posts):

```sh
hugo server -D
```

The site is served at http://localhost:1313/. Useful variants:

```sh
hugo server            # published content only (no drafts)
hugo server -D --navigateToChanged   # jump to the page you just edited
hugo new content posts/my-post.md    # scaffold a new post
hugo                   # build the static site into public/
```

Content lives in `content/` (posts under `content/posts/`); site config is `hugo.toml`.

## Updating the résumé

The résumé is a LaTeX document (`resume.tex`) compiled with
[tectonic](https://tectonic-typesetting.github.io/) (a self-contained LaTeX engine).

Install tectonic once:

```sh
brew install tectonic
```

Edit `resume.tex`, then compile and copy the PDF into the two locations the site serves:

```sh
tectonic resume.tex
cp resume.pdf static/docs/Isaac_Owomugisha_Resume.pdf
cp resume.pdf public/docs/Isaac_Owomugisha_Resume.pdf
rm resume.pdf   # optional: the root PDF is just a build artifact
```

Notes:
- First run downloads LaTeX packages on demand (one-time, cached afterward).
- `resume.tex` uses `\usepackage{hyperref}` with no explicit driver so it compiles
  under tectonic's XeTeX engine (an explicit `[pdftex]` driver fails there).
