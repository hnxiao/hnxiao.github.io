# 🎓 Open Academic Homepage

A modern, zero-build academic homepage that is fully data-driven: edit JSON and
BibTeX files, and the site renders itself. No Node.js, no build step, no HTML
editing required for daily content updates.


Demo: https://weiquanmin.github.io/
---

## ✨ Key Features

- **Zero-build static site** — plain HTML + CSS + JS + data files, ready for GitHub Pages.
- **Content in JSON** — Profile, About, News, Experience, Education, Honors,
  Services, Grants, and Teaching are all configured from data files.
- **BibTeX-powered publications** — paper cards, compact reference list,
  Selected/All tabs, year grouping, search, deep links, and clean BibTeX export.
- **Bilingual UI** — English and Simplified Chinese content with a language selector.
- **Four color themes + four style themes** — Burgundy, Blue, Green, Slate,
  Minimal, Academic Paper, Terminal, and Pixel.
- **Site-wide controls** — enable/disable sections, choose default theme and
  language, toggle “Last updated”, analytics, SEO metadata, and more.
- **Responsive and accessible** — mobile layout, scroll-spy navigation,
  reduced-motion support, keyboard-accessible dialogs.

---

## 🚀 Quick Start

### 1. Get the files

Use **“Use this template”** on GitHub or clone this repository. If the site
should live at `https://<username>.github.io`, name the repository
`<username>.github.io`.

### 2. Edit the content files

| What you want to change | File |
|---|---|
| Avatar, name, role, affiliation, location, research, interests, links | `content/profile.json` |
| About, News, Experience, Education, Honors, Services, Grants, Teaching | `content/site-content.json` |
| Simplified Chinese version of the same content | `content/site-content.zh.json` |
| Page title, URL, footer, language, analytics, enabled sections | `content/site-config.json` |
| Published papers | `content/publications.bib` |

Then replace `https://your-username.github.io` in `robots.txt`, `sitemap.xml`,
and `site.url` with your real domain.

### 3. Preview locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

> ⚠️ Do not open `index.html` directly via `file://`. The page loads JSON/BibTeX
> files with `fetch()`, which browsers block for local files.

### 4. Deploy to GitHub Pages

- **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/(root)`, **Save**; or
- Select **GitHub Actions** and let `.github/workflows/deploy.yml` deploy on push.

---

## 📁 Main Structure

```text
index.html                # Minimal shell
content/                  # All editable content
├── site-config.json      # Site info, sections, themes, language, analytics
├── profile.json          # Personal profile
├── site-content.json     # English page content
├── site-content.zh.json  # Chinese page content
└── publications.bib      # Publication records
assets/
├── css/style.css         # Core styles and theme variables
├── themes/*.css          # Style packages (Minimal, Paper, Terminal, Pixel)
└── js/site.js            # Rendering and site logic
images/                   # Avatar, paper figures, org logos, social image
docs/                     # Detailed customization documentation
```

---

## 🛠 Documentation

Detailed examples and field references moved out of the README to keep this
page short:

- [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) — profile fields, content
  schemas, section switches, SEO, bilingual content, analytics.
- [docs/PUBLICATIONS.md](docs/PUBLICATIONS.md) — publications.bib fields,
  card/compact views, sorting, search, deep links, BibTeX export.
- [docs/THEMES.md](docs/THEMES.md) — theme configuration, included themes,
  theme packages and fonts.

Copy-paste full JSON/BibTeX templates are also available under
[docs/examples/](docs/examples/).

---

## 🎨 Themes at a Glance

Set the default in `content/site-config.json`:

```json
"theme": {
  "default": "burgundy",
  "switchable": true,
  "options": [
    "burgundy", "academic-blue", "forest-green", "slate",
    "minimal", "academic-paper", "terminal", "pixel"
  ]
}
```

When `switchable` is `true`, visitors can cycle themes from the palette button
in the navigation.

---

## ❓ FAQ

- **How do I hide a section?** Set `"enabled": false` for that section in
  `content/site-config.json`.
- **What if a section has no data?** Leave `items` empty or omit the object —
  the section is skipped automatically.
- **How do I show papers in compact style?** Set
  `publicationsView.mode` to `"compact"` in `content/site-config.json`.
- **How do I show the Grants section?** Fill `grants.items` in the content file
  and keep `"id": "grants"` enabled in the config.

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## Acknowledgements

This project is developed based on
[fengxueguiren/Open-Academic-Homepage](https://github.com/fengxueguiren/Open-Academic-Homepage),
which extends the original zero-build academic homepage template
[Laip11/academic-homepage-template](https://github.com/Laip11/academic-homepage-template)
with data-driven content, an expanded theme system, bilingual support,
publication management, and additional site features. Both upstream projects
are released under the MIT License.
