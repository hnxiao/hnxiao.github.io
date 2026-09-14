# Publications

Publications are stored in `content/publications.bib` and rendered without
writing HTML.

A copy-paste BibTeX template is available at
[`examples/publications.example.bib`](examples/publications.example.bib).

---

## 1. Entry format

```bibtex
@inproceedings{my-paper-2026,
  author    = {Han Xiao and Co-Author One and Senior Author},
  title     = {Paper Title},
  booktitle = {Proceedings of the AAAI Conference on Artificial Intelligence (AAAI)},
  year      = {2026},
  url       = {https://example.com/paper},

  % ---- Page-only custom fields (never exported) ----
  selected  = {true},
  shortvenue = {AAAI 2026},
  badges    = {Oral},
  ccf       = {CCF-A},
  image     = {images/paper.png},
  code      = {https://github.com/...},
  project   = {https://...},
  video     = {https://...},
  slides    = {https://...},
  poster    = {https://...},
  dataset   = {https://...},
  equal     = {1, 2},
  corresponding = {4},
  summary   = {Short summary shown under Details.},
  abstract  = {Official abstract, page only.}
}
```

## 2. Journal metrics

For `@article` entries only:

```bibtex
sci       = {1},     % CAS / 中科院 zone: 1~4
jcr       = {Q1},    % JCR quartile
impact    = {12.8},  % Impact factor
impactyear = {2025}  % IF year
```

## 3. Display behavior

- **Selected** keeps the order used in the `.bib` file.
- **All** sorts by year descending and inserts a year divider between groups.
- Card mode shows full journal/conference names; common prefixes such as
  `Proceedings of the` and `Advances in` are removed only for display.
- `shortvenue` appears in full in the top-right corner of the teaser image.
- Each card has a `#paper-...` deep link.
- Search matches title, authors, venue, metrics, and summary/abstract.
- Compact mode (`publicationsView.mode = "compact"`) renders a numbered
  reference list with full authors, title, venue, volume/pages, DOI, and tags.

## 4. BibTeX export

Every entry offers a BibTeX export button. Export keeps only standard fields:

```text
author, title, journal, booktitle, year, volume, number, pages, month,
editor, publisher, address, series, school, institution, howpublished,
doi, url, note
```

Page-only fields (`image`, `code`, `summary`, `abstract`, `sci`, `jcr`, etc.)
are never exported.

> If you re-export a library from Zotero / Google Scholar / DBLP, page-only
> custom fields can be dropped. Back them up or re-add them after syncing.

## 5. Configuration

```json
"publicationsView": {
  "mode": "cards"
}
```

Use `"compact"` for the reference-list layout.

`publicationsView.mode` switches between card and compact list views.
