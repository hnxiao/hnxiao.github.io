# Customization Guide

All visible content is plain JSON. Most edits can be made without touching
HTML, CSS, or JavaScript.

Copy-paste ready templates live in
[`examples/`](examples/): `profile.example.json`,
`site-content.example.json`, `site-content.zh.example.json`, and
`site-config.example.json`.

---

## 1. Profile — `content/profile.json`

```json
{
  "avatar": "images/avatar.jpg",
  "avatarAlt": "Profile photo",
  "name": "Xiao, Han (肖汉)",
  "role": "Associate Professor",

  "affiliation": {
    "name": "Ocean University of China",
    "department": "School of Mathematical Sciences",
    "url": "https://www.ouc.edu.cn/"
  },
  "location": "Qingdao, China",

  "research": ["Combinatorial Optimization", "Algorithmic Game Theory"],
  "interests": ["Hiking", "Reading"],

  "other": [
    { "label": "Office", "value": "Room 523" }
  ],

  "quickLinks": [
    { "type": "email", "href": "mailto:you@example.com", "label": "Email" },
    { "type": "scholar", "href": "https://scholar.google.com/...", "label": "Scholar" }
  ],

  "show": {
    "affiliation": true,
    "location": true,
    "research": true,
    "interests": true,
    "other": true
  }
}
```

### Rules

- `other` is for **non-link** lines such as office/phone. Any clickable personal
  link (email, ORCID, homepage, social account) belongs in `quickLinks`.
- Add `"show": false` to any field name in `show` to hide it.
- `quickLinks` known icon types: `scholar`, `email`, `github`, `cv`, `twitter`,
  `publications`. Unknown/custom types render with text only.
- Add `"show": false` to one quick link to hide it; set
  `"showQuickLinks": false` at the root to hide the whole block.

### Localized profile fields

`profile.localized` may override role/research labels, affiliation, location,
and `other` per language:

```json
"localized": {
  "zh": {
    "role": "副教授",
    "affiliation": { "name": "中国海洋大学", "url": "https://www.ouc.edu.cn/" },
    "location": "山东青岛",
    "researchLabel": "研究方向",
    "interestsLabel": "兴趣爱好"
  }
}
```

Full profile template: [`examples/profile.example.json`](examples/profile.example.json).

---

## 2. Page content — `content/site-content.json`

Text fields support **bold**, *italics*, and [links](https://example.com).

### News / Honors / Teaching

```json
{
  "title": "🔥 News",
  "items": [
    { "date": "2026.04", "text": "A paper was accepted at **TMM**." }
  ]
}
```

### About

```json
{
  "title": "🌟 About Me",
  "paragraphs": [
    "Introduction paragraph...",
    "Second paragraph..."
  ],
  "points": [
    { "label": "Autonomous Driving", "description": "Description..." }
  ],
  "note": "📬 Contact invitation..."
}
```

### Experience / Education

```json
{
  "title": "💻 Experience",
  "items": [
    {
      "title": "Research Scientist Intern",
      "date": "Jun. 2025 - Sep. 2025",
      "organization": "Google DeepMind",
      "logo": "images/org-placeholder.svg",
      "logoAlt": "Company logo",
      "description": "Worked on ..."
    }
  ]
}
```

### Working papers

```json
{
  "title": "Working Papers",
  "items": [
    {
      "title": "Paper title",
      "authors": [
        { "name": "Han Xiao", "equal": true },
        { "name": "Co-author", "equal": true },
        { "name": "Advisor" }
      ],
      "status": "Under review at XXXX · Preprint on arXiv"
    }
  ]
}
```

### Academic services

Conferences use a Bento grid. Journal reviewing uses chips; workshops use rows.

```json
{
  "title": "🤝 Academic Services",
  "conferenceHeading": "Conference Reviewer",
  "conferences": [
    { "name": "AAAI", "years": ["2027", "2026"], "fullName": "AAAI Conference on Artificial Intelligence" }
  ],
  "other": [
    {
      "type": "journal",
      "title": "Journal Reviewer",
      "items": [
        { "name": "Pattern Recognition", "abbr": "PR", "url": "..." }
      ]
    },
    {
      "type": "workshop",
      "title": "Workshop Organization",
      "items": [
        { "name": "Workshop name", "role": "Co-organizer", "venue": "CVPR", "year": "2025" }
      ]
    }
  ]
}
```

### Grants / funded projects

```json
{
  "title": "🏆 Grants & Funded Projects",
  "items": [
    {
      "type": "grant",
      "title": "Project title",
      "role": "Co-Principal Investigator",
      "funder": "National Natural Science Foundation of China",
      "grantNumber": "62100000",
      "period": "2024 - 2027",
      "amount": "¥500,000",
      "status": "在研",
      "url": ""
    }
  ]
}
```

`type` accepts `grant` or `project`; `status` accepts Active/在研/Completed, etc.

Complete page-content template (English):
[`examples/site-content.example.json`](examples/site-content.example.json). 
The Chinese mirror is
[`examples/site-content.zh.example.json`](examples/site-content.zh.example.json).

---

## 3. Site configuration — `content/site-config.json`

### Sections and navigation

The `sections` array controls order, visibility, and navigation:

```json
{
  "id": "experience",
  "label": "Experience",
  "enabled": true,
  "inNav": true
}
```

Set `"enabled": false` to remove a section and its nav link. Empty sections are
skipped automatically.

Full configuration template:
[`examples/site-config.example.json`](examples/site-config.example.json).

### Site fields

- `site.title`, `site.description`, `site.author` — browser/search metadata.
- `site.navBrand` — text in the floating navigation.
- `site.footerName` — footer name.
- `site.ownerName` — the author name that is bolded in publication lists.
- `site.url` — canonical URL and social-share URLs.
- `site.ogImage` — share image path (1200×630 recommended).
- `site.showLastUpdated` — show/hide the footer “Last updated” line.
- `site.lastUpdated` — optional fixed date; when empty the page reads the
  content file’s `Last-Modified` header.

### Language

```json
"language": {
  "default": "en",
  "available": ["en", "zh"],
  "switchable": true
}
```

English content lives in `content/site-content.json`; Chinese content lives in
`content/site-content.zh.json` and must mirror the same structure.

### Analytics

```json
"analytics": {
  "enabled": false,
  "provider": "google",
  "site": "G-XXXXXXXXXX"
}
```

Providers:

- `google` — Google Analytics 4. Put your GA4 Measurement ID
  (e.g. `G-XXXXXXXXXX`) in `site`, then set `enabled` to `true`.
- `goatcounter` — put your GoatCounter code in `site` (default provider).
- `plausible` — put your site domain in `site`.

---

## 4. SEO

- `site.url` feeds canonical/OG metadata and JSON-LD.
- `robots.txt` and `sitemap.xml` should use your real domain.
- The page injects `Person` and `ScholarlyArticle` JSON-LD automatically.
- `404.html` is served by GitHub Pages automatically.
- Replace `images/og-image.png` with your own social preview image.
