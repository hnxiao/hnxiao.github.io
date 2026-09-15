    // Set Current Year in Footer
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Scroll Reveal for Staggered Animation
    function initScrollReveal() {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const revealSelector = [
        "#main-content .section-title",
        "#main-content .subsection-title",
        "#main-content .lead",
        "#main-content .collab-callout",
        "#main-content .publications-toolbar",
        "#main-content .paper-card",
        "#main-content .exp-card",
        "#main-content .mini-card",
        "#main-content .service-tile",
        "#main-content .modern-list li",
      ].join(", ");

      const markVisible = (element) => {
        element.classList.add("reveal", "is-visible");
      };

      const prepareElement = (element, staggerIndex) => {
        if (element.classList.contains("reveal")) return;
        element.classList.add("reveal");
        if (staggerIndex !== undefined) {
          element.style.setProperty("--reveal-delay", `${Math.min(staggerIndex, 5) * 50}ms`);
        }
      };

      const elements = Array.from(document.querySelectorAll(revealSelector));
      if (elements.length === 0) return;

      if (reducedMotion) {
        elements.forEach(markVisible);
        return;
      }

      const staggerParents = [
        document.getElementById("published-papers"),
        ...document.querySelectorAll("#main-content .modern-list"),
      ].filter(Boolean);

      staggerParents.forEach((parent) => {
        const children = parent.matches(".modern-list")
          ? Array.from(parent.querySelectorAll(":scope > li"))
          : Array.from(parent.querySelectorAll(":scope > .paper-card"));
        children.forEach((child, index) => prepareElement(child, index));
      });

      elements.forEach((element) => prepareElement(element));

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -20px 0px",
        }
      );

      elements.forEach((element) => {
        if (!element.classList.contains("is-visible")) {
          observer.observe(element);
        }
      });

      window.refreshScrollReveal = () => {
        document
          .querySelectorAll("#published-papers .paper-card.reveal:not(.is-visible)")
          .forEach((card) => observer.observe(card));
      };
    }

    // Active Navigation Highlighting on Scroll (Deterministic Bidirectional Scroll-Spy)
    function initNavObserver() {
      const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-links a[href^='#']"));
      const sectionMap = new Map();
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (!sectionMap.has(href)) sectionMap.set(href, []);
        sectionMap.get(href).push(link);
      });

      const sectionElements = [...sectionMap.keys()]
        .map((href) => document.querySelector(href))
        .filter(Boolean);

      if (sectionElements.length === 0) return;

      // Ensure sections are sorted strictly in vertical DOM order
      sectionElements.sort((a, b) => {
        return (a.getBoundingClientRect().top + window.pageYOffset) - (b.getBoundingClientRect().top + window.pageYOffset);
      });

      let isClickScrolling = false;
      let scrollEndTimer = null;
      let currentActiveId = null;

      const setActiveSection = (id) => {
        if (!id || id === currentActiveId) return;
        currentActiveId = id;
        navLinks.forEach((link) => link.classList.remove("active"));
        const activeLinks = sectionMap.get(`#${id}`) || [];
        activeLinks.forEach((link) => {
          link.classList.add("active");
          link.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
        });
      };

      // Handle smooth scroll clicks accurately
      navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href");
          if (!href || !href.startsWith("#")) return;
          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();
          isClickScrolling = true;
          setActiveSection(href.slice(1));
          history.pushState(null, "", href);

          const nav = document.querySelector(".site-nav");
          const navBottom = nav ? nav.getBoundingClientRect().bottom : 58;
          const targetRect = target.getBoundingClientRect();
          const targetY = window.pageYOffset + targetRect.top - (navBottom + 16);

          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: "smooth"
          });
        });
      });

      // Handle brand click (Back to top)
      const brand = document.querySelector(".site-nav .nav-brand");
      if (brand) {
        brand.addEventListener("click", (e) => {
          e.preventDefault();
          history.pushState(null, "", " ");
          window.scrollTo({ top: 0, behavior: "smooth" });
          navLinks.forEach((link) => link.classList.remove("active"));
          currentActiveId = null;
        });
      }

      const endClickScroll = () => {
        if (!isClickScrolling) return;
        isClickScrolling = false;
        updateActiveSection();
      };

      if ("onscrollend" in window) {
        window.addEventListener("scrollend", endClickScroll, { passive: true });
      }
      window.addEventListener("wheel", () => { isClickScrolling = false; }, { passive: true });
      window.addEventListener("touchmove", () => { isClickScrolling = false; }, { passive: true });

      // Continuous, deterministic scroll-spy for bidirectional scrolling (up and down)
      const updateActiveSection = () => {
        if (isClickScrolling) return;

        const nav = document.querySelector(".site-nav");
        const navBottom = nav ? nav.getBoundingClientRect().bottom : 58;
        const vh = window.innerHeight;
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
        const remainingScroll = Math.max(0, maxScroll - window.pageYOffset);

        // Near the absolute bottom of the document
        if (remainingScroll < 90) {
          const lastEl = sectionElements[sectionElements.length - 1];
          if (lastEl) setActiveSection(lastEl.id);
          return;
        }

        // Dynamic probe line: normally 50px below the nav island.
        // As the user nears the document bottom where content can't scroll any higher,
        // dynamically lower probeY so bottom sections naturally activate.
        const baseProbe = navBottom + 50;
        let probeY = baseProbe;
        const bottomZone = Math.max(340, vh * 0.4);
        if (remainingScroll < bottomZone) {
          const t = 1 - (remainingScroll / bottomZone);
          probeY = baseProbe + t * (vh * 0.75 - baseProbe);
        }

        let activeId = null;
        for (let i = 0; i < sectionElements.length; i++) {
          const rect = sectionElements[i].getBoundingClientRect();
          if (rect.top <= probeY) {
            activeId = sectionElements[i].id;
          } else {
            break;
          }
        }

        if (activeId) {
          setActiveSection(activeId);
        } else {
          setActiveSection(sectionElements[0].id);
        }
      };

      let ticking = false;
      window.addEventListener("scroll", () => {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(endClickScroll, 160);

        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateActiveSection();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Run on page load and window resize
      updateActiveSection();
      window.addEventListener("resize", updateActiveSection);
    }

    // Publications Filter: Selected vs All
    function getPaperFilterFromHash() {
      return window.location.hash === "#publications-all" ||
        window.location.hash.startsWith("#paper-") ? "all" : "selected";
    }

    function updatePaperHash(filter) {
      const newHash = filter === "all" ? "#publications-all" : "#publications";
      if (window.location.hash !== newHash) {
        history.replaceState(null, "", newHash);
      }
    }

    // ------------------------------------------------------------------
    // Publications: BibTeX-driven cards & export (no external parser)
    // ------------------------------------------------------------------
    let SITE_OWNER = ""; // Set from content/site-config.json (site.ownerName)
    const BIB_SOURCE_PATH = "content/publications.bib";
    const BIB_FALLBACK_IMAGE = "images/paper-placeholder.svg";
    const BIB_SKIP_TYPES = new Set(["comment", "preamble", "string"]);
    const BIB_EXPORT_FIELDS = new Set([
      "author", "title", "journal", "booktitle", "year",
      "volume", "number", "pages", "month", "editor",
      "publisher", "address", "series", "school", "institution",
      "howpublished", "doi", "url", "note"
    ]);
    const PAPER_EXTRA_LINKS = [
      ["code", "link-code", "paper-btn-secondary"],
      ["dataset", "link-dataset", ""],
      ["project", "link-project", ""],
      ["slides", "link-slides", ""],
      ["video", "link-video", ""],
      ["poster", "link-poster", ""]
    ];

    const HTML_ESCAPE_MAP = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    const LANGUAGE_STORAGE_KEY = "academic-homepage-lang";
    let currentLanguage = "en";

    const UI_STRINGS = {
      en: {
        "publications-title": "📝 Publications",
        "pub-note": "(<sup>*</sup> denotes equal contribution, <sup>#</sup> denotes corresponding author.)",
        selected: "Selected",
        all: "All",
        "search-papers": "Search papers by title, author or venue…",
        "no-results": "No matching papers.",
        "et-al": "et al.",
        details: "Details",
        summary: "Summary",
        abstract: "Abstract",
        "link-paper": "Paper",
        "link-code": "Code",
        "link-dataset": "Dataset",
        "link-project": "Project",
        "link-slides": "Slides",
        "link-video": "Video",
        "link-poster": "Poster",
        bibtex: "BibTeX",
        copy: "Copy",
        copied: "Copied!",
        "download-bib": "Download .bib",
        "built-with": "Built with",
        "last-updated": "Last updated",
        affiliation: "Affiliation",
        location: "Location",
        "type-grant": "Grant",
        "type-project": "Project",
        "back-home": "Back to Homepage"
      },
      zh: {
        "publications-title": "📝 论文",
        "pub-note": "(<sup>*</sup> 表示共同一作，<sup>#</sup> 表示通讯作者)",
        selected: "精选",
        all: "全部",
        "search-papers": "按标题、作者或会议搜索论文…",
        "no-results": "没有找到匹配的论文。",
        "et-al": "等",
        details: "摘要详情",
        summary: "小结",
        abstract: "官方摘要",
        "link-paper": "论文",
        "link-code": "代码",
        "link-dataset": "数据集",
        "link-project": "项目",
        "link-slides": "幻灯片",
        "link-video": "视频",
        "link-poster": "海报",
        bibtex: "BibTeX",
        copy: "复制",
        copied: "已复制！",
        "download-bib": "下载 .bib",
        "built-with": "基于",
        "last-updated": "最后更新",
        affiliation: "所属机构",
        location: "所在地",
        "type-grant": "基金",
        "type-project": "项目",
        "back-home": "返回主页"
      }
    };

    const NAV_LABEL_TRANSLATIONS = {
      about: { en: "About", zh: "简介" },
      news: { en: "News", zh: "新闻" },
      publications: { en: "Publications", zh: "论文" },
      grants: { en: "Grants", zh: "项目" },
      "working-papers": { en: "Working Papers", zh: "工作论文" },
      experience: { en: "Experience", zh: "经历" },
      honors: { en: "Honors", zh: "荣誉" },
      services: { en: "Services", zh: "服务" },
      teaching: { en: "Teaching", zh: "教学" }
    };

    function t(key) {
      const table = UI_STRINGS[currentLanguage] || UI_STRINGS.en;
      return table[key] !== undefined ? table[key] : UI_STRINGS.en[key] || key;
    }

    function navLabelFor(section) {
      const translations = NAV_LABEL_TRANSLATIONS[section.id];
      if (currentLanguage !== "en" && translations) return translations.zh;
      return section.label || translations.en;
    }

    const LATEX_ACCENT_LOOKUP = (() => {
      const sets = {
        "'": { a: "á", e: "é", i: "í", o: "ó", u: "ú", y: "ý", A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú", Y: "Ý" },
        "`": { a: "à", e: "è", i: "ì", o: "ò", u: "ù", A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù" },
        '"': { a: "ä", e: "ë", i: "ï", o: "ö", u: "ü", y: "ÿ", A: "Ä", E: "Ë", I: "Ï", O: "Ö", U: "Ü" },
        "^": { a: "â", e: "ê", i: "î", o: "ô", u: "û", A: "Â", E: "Ê", I: "Î", O: "Ô", U: "Û" },
        "~": { a: "ã", n: "ñ", o: "õ", A: "Ã", N: "Ñ", O: "Õ" }
      };
      const lookup = {};
      Object.keys(sets).forEach((mark) => {
        Object.keys(sets[mark]).forEach((letter) => {
          lookup[mark + letter] = sets[mark][letter];
        });
      });
      return lookup;
    })();

    let paperBibEntries = new Map();
    let paperEventsBound = false;
    let bibModalOverlay = null;
    let bibModalCodeEl = null;
    let bibModalCloseBtn = null;
    let bibModalLastTrigger = null;
    let bibModalCurrentKey = null;
    let paperSearchBound = false;
    let publicationsViewMode = "cards";
    let paperOriginalKeys = [];

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
    }

    function splitTopLevel(text, delimiter) {
      const parts = [];
      let start = 0;
      let depth = 0;
      let inQuote = false;
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (ch === "\\") { i += 1; continue; }
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (inQuote) continue;
        if (ch === "{") depth += 1;
        else if (ch === "}") depth -= 1;
        else if (ch === delimiter && depth === 0) {
          parts.push(text.slice(start, i));
          start = i + 1;
        }
      }
      parts.push(text.slice(start));
      return parts;
    }

    function findTopLevelChar(text, target) {
      let depth = 0;
      let inQuote = false;
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (ch === "\\") { i += 1; continue; }
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (inQuote) continue;
        if (ch === "{") depth += 1;
        else if (ch === "}") depth -= 1;
        else if (ch === target && depth === 0) return i;
      }
      return -1;
    }

    function parseBibValueToken(raw) {
      let value = String(raw).trim();
      if (!value) return "";
      if (value[0] === '"' && value[value.length - 1] === '"') {
        return value.slice(1, -1);
      }
      if (value[0] === "{" && value[value.length - 1] === "}") {
        return value.slice(1, -1);
      }
      return value;
    }

    function parseBibEntry(type, body) {
      const parts = splitTopLevel(body, ",");
      if (!parts.length) return null;
      const key = parts[0].trim();
      if (!key) return null;
      const fields = [];
      for (let i = 1; i < parts.length; i += 1) {
        const segment = parts[i];
        if (!segment.trim()) continue;
        const eqIndex = findTopLevelChar(segment, "=");
        if (eqIndex === -1) continue;
        const name = segment.slice(0, eqIndex).trim().toLowerCase();
        const rawValue = segment.slice(eqIndex + 1).trim();
        if (!name || !rawValue) continue;
        fields.push({ name, raw: rawValue });
      }
      return { type, key, fields };
    }

    function parseBibFile(source) {
      const entries = [];
      let pos = 0;
      while (pos < source.length) {
        const at = source.indexOf("@", pos);
        if (at === -1) break;
        pos = at + 1;
        let type = "";
        while (pos < source.length && /[A-Za-z0-9]/.test(source[pos])) {
          type += source[pos];
          pos += 1;
        }
        if (!type) continue;
        type = type.toLowerCase();
        while (pos < source.length && /\s/.test(source[pos])) pos += 1;
        const open = source[pos];
        if (open !== "{" && open !== "(") continue;
        const close = open === "{" ? "}" : ")";
        pos += 1;
        let depth = 0;
        let inQuote = false;
        const bodyStart = pos;
        let bodyEnd = -1;
        while (pos < source.length) {
          const ch = source[pos];
          if (ch === "\\") { pos += 2; continue; }
          if (ch === '"') { inQuote = !inQuote; pos += 1; continue; }
          if (!inQuote) {
            if (ch === "{") {
              depth += 1;
            } else if (ch === "}") {
              if (depth === 0) {
                if (close === "}") { bodyEnd = pos; break; }
              } else {
                depth -= 1;
              }
            } else if (ch === close) {
              if (depth === 0) { bodyEnd = pos; break; }
            }
          }
          pos += 1;
        }
        if (bodyEnd === -1) break;
        const body = source.slice(bodyStart, bodyEnd);
        pos = bodyEnd + 1;
        if (BIB_SKIP_TYPES.has(type)) continue;
        const entry = parseBibEntry(type, body);
        if (entry) entries.push(entry);
      }
      return entries;
    }

    function cleanLatexForDisplay(value) {
      let s = String(value).replace(/\r\n/g, "\n").replace(/[\t ]+/g, " ").trim();
      s = s.replace(/\\([&%$#_])/g, "$1");
      s = s.replace(/\{\\([`'"^~])\s*([A-Za-z])\}/g, (m, mark, letter) => {
        return LATEX_ACCENT_LOOKUP[mark + letter] || letter;
      });
      s = s.replace(/\{\\c\{([A-Za-z])\}\}/g, (m, ch) => (ch === "c" ? "ç" : ch === "C" ? "Ç" : ch));
      s = s.replace(/\{\\v\{([A-Za-z])\}\}/g, (m, ch) => {
        const map = { s: "š", S: "Š", c: "č", C: "Č", z: "ž", Z: "Ž" };
        return map[ch] || ch;
      });
      s = s.replace(/\{\\u\{([A-Za-z])\}\}/g, (m, ch) => {
        const map = { u: "ŭ", U: "Ŭ", g: "ğ", G: "Ğ" };
        return map[ch] || ch;
      });
      s = s.replace(/\{\\r\{([A-Za-z])\}\}/g, (m, ch) => (ch === "a" ? "å" : ch === "A" ? "Å" : ch));
      s = s.replace(/\{\\o\}/gi, "ø");
      s = s.replace(/\{\\O\}/g, "Ø");
      s = s.replace(/\{\\ae\}/gi, "æ");
      s = s.replace(/\{\\AE\}/g, "Æ");
      s = s.replace(/\{\\oe\}/gi, "œ");
      s = s.replace(/\{\\OE\}/g, "Œ");
      s = s.replace(/\\[A-Za-z]+\*?(?:\[[^\]]*\])?\{([^{}]*)\}/g, "$1");
      s = s.replace(/\{\\(?:bf|it|em|rm|sc|small|large|normalsize|footnotesize)\s+([^{}]+)\}/gi, "$1");
      for (let i = 0; i < 3; i += 1) {
        s = s.replace(/\{([^{}]*)\}/g, "$1");
      }
      return s.replace(/\s+/g, " ").trim();
    }

    function getBibField(entry, name) {
      const target = String(name).toLowerCase();
      const field = entry.fields.find((item) => item.name === target);
      return field ? cleanLatexForDisplay(parseBibValueToken(field.raw)) : "";
    }

    function parseAuthorName(rawName) {
      let name = cleanLatexForDisplay(rawName).trim();
      if (name.includes(",")) {
        const parts = name.split(",").map((part) => part.trim()).filter(Boolean);
        if (parts.length >= 2) {
          name = parts.slice(1).join(" ") + " " + parts[0];
        }
      }
      return name.replace(/\s+/g, " ");
    }

    function nameKey(name) {
      return String(name).toLowerCase().replace(/[^a-z0-9\u00c0-\u024f]/g, "");
    }

    function buildOwnerNameKeys() {
      const display = parseAuthorName(SITE_OWNER);
      const words = display.split(" ");
      const keys = [nameKey(display)];
      if (words.length > 1) keys.push(nameKey(words.slice().reverse().join(" ")));
      return new Set(keys);
    }

    let OWNER_NAME_KEYS = new Set();

    function updateOwnerName(name) {
      SITE_OWNER = String(name || "").trim();
      OWNER_NAME_KEYS = SITE_OWNER ? buildOwnerNameKeys() : new Set();
    }

    function isOwnerName(displayName) {
      if (OWNER_NAME_KEYS.has(nameKey(displayName))) return true;
      const words = String(displayName).split(" ");
      if (words.length > 1) return OWNER_NAME_KEYS.has(nameKey(words.slice().reverse().join(" ")));
      return false;
    }

    function getAuthorNames(entry) {
      const field = entry.fields.find((item) => item.name === "author");
      if (!field) return [];
      return parseBibValueToken(field.raw)
        .split(/\s+and\s+/i)
        .map((name) => parseAuthorName(name))
        .filter(Boolean);
    }

    function parseIndexSet(entry, fieldName) {
      const raw = getBibField(entry, fieldName);
      return new Set((raw.match(/\d+/g) || []).map(Number));
    }

    function getOwnerRank(entry, authorNames) {
      const explicit = getBibField(entry, "ownerrank");
      if (/^\d+$/.test(explicit)) return parseInt(explicit, 10);
      for (let i = 0; i < authorNames.length; i += 1) {
        if (isOwnerName(authorNames[i])) return i + 1;
      }
      return 0;
    }

    function renderAuthors(entry, authorNames) {
      const equalSet = parseIndexSet(entry, "equal");
      const correspondingSet = parseIndexSet(entry, "corresponding");
      return authorNames.map((displayName, index) => {
        const escaped = escapeHtml(displayName);
        let html = isOwnerName(displayName) ? `<strong>${escaped}</strong>` : escaped;
        if (equalSet.has(index + 1)) html += "<sup>*</sup>";
        if (correspondingSet.has(index + 1)) html += "<sup>#</sup>";
        return html;
      }).join(", ");
    }

    function venueLabel(entry) {
      const short = getBibField(entry, "shortvenue");
      if (short) return short;
      const base = getBibField(entry, "journal") || getBibField(entry, "booktitle");
      const year = getBibField(entry, "year");
      return [base, year].filter(Boolean).join(" ");
    }

    function cleanVenueFullName(value) {
      let name = String(value || "").trim();
      name = name.replace(/^Proceedings of the\s+/i, "");
      name = name.replace(/^Advances in\s+/i, "");
      return name.trim();
    }

    function withPrefix(prefix, value, suffix) {
      const text = String(value).trim();
      const lower = text.toLowerCase();
      const prefixLower = prefix.toLowerCase();
      return lower.startsWith(prefixLower) ? text : prefix + text + (suffix || "");
    }

    function buildPaperMeta(entry) {
      const parts = [];
      const ccf = getBibField(entry, "ccf");
      if (ccf) parts.push(`<span class="ccf-badge">${escapeHtml(withPrefix("CCF-", ccf, ""))}</span>`);

      const badges = getBibField(entry, "badges").split(",").map((s) => s.trim()).filter(Boolean);
      badges.forEach((badge) => {
        parts.push(`<span class="tag-badge">${escapeHtml(badge)}</span>`);
      });

      const sci = getBibField(entry, "sci");
      if (sci) parts.push(`<span class="metric-badge">${escapeHtml(withPrefix("SCI ", sci, "区"))}</span>`);
      const jcr = getBibField(entry, "jcr");
      if (jcr) parts.push(`<span class="metric-badge">${escapeHtml(withPrefix("JCR ", jcr, ""))}</span>`);
      const impact = getBibField(entry, "impact");
      if (impact) {
        const impactYear = getBibField(entry, "impactyear");
        const label = impactYear ? `IF ${impact} (${impactYear})` : `IF ${impact}`;
        parts.push(`<span class="metric-badge">${escapeHtml(label)}</span>`);
      }
      return `<div class="paper-meta">${parts.join("")}</div>`;
    }

    function paperHref(entry) {
      const paper = getBibField(entry, "paper");
      if (paper) return paper;
      const url = getBibField(entry, "url");
      if (url) return url;
      const doi = getBibField(entry, "doi");
      if (doi) return "https://doi.org/" + doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
      return "";
    }

    function buildPaperLinks(entry, safeKey) {
      const links = [];
      const href = paperHref(entry);
      if (href) {
        links.push(`<a href="${escapeHtml(href)}" class="paper-btn paper-btn-primary" target="_blank" rel="noopener noreferrer">${escapeHtml(t("link-paper"))}</a>`);
      }
      PAPER_EXTRA_LINKS.forEach((spec) => {
        const url = getBibField(entry, spec[0]);
        if (!url) return;
        const className = spec[2] ? `paper-btn ${spec[2]}` : "paper-btn";
        links.push(`<a href="${escapeHtml(url)}" class="${className}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(spec[1]))}</a>`);
      });
      return links;
    }

    function buildPaperDetail(entry, safeKey) {
      const summary = getBibField(entry, "summary");
      const abstract = getBibField(entry, "abstract");
      if (!summary && !abstract) return { toggle: "", block: "" };
      const sections = [];
      if (summary) {
        sections.push(
          `<div class="paper-detail-section"><span class="paper-detail-label">${escapeHtml(t("summary"))}</span>` +
          `<p class="paper-detail-text">${escapeHtml(summary)}</p></div>`
        );
      }
      if (abstract) {
        sections.push(
          `<div class="paper-detail-section"><span class="paper-detail-label">${escapeHtml(t("abstract"))}</span>` +
          `<p class="paper-detail-text">${escapeHtml(abstract)}</p></div>`
        );
      }
      return {
        toggle:
          `<button type="button" class="paper-btn paper-detail-toggle" aria-expanded="false" ` +
          `aria-controls="paper-detail-${safeKey}">${escapeHtml(t("details"))}</button>`,
        block:
          `<div class="paper-detail" id="paper-detail-${safeKey}" hidden>${sections.join("")}</div>`
      };
    }

    function buildPaperCardHtml(entry, index) {
      const rawKey = String(entry.key || `paper-${index}`).trim();
      const safeKey = rawKey.replace(/[^A-Za-z0-9_-]/g, "-") || `paper-${index}`;
      const title = getBibField(entry, "title") || "Untitled";
      const venueText = venueLabel(entry);
      const venueFullText = cleanVenueFullName(
        getBibField(entry, "journal") || getBibField(entry, "booktitle") || venueText
      );
      const authorNames = getAuthorNames(entry);
      const ownerRank = getOwnerRank(entry, authorNames) || 99;
      const year = getBibField(entry, "year") || "0";
      const selected = /^(true|yes|1)$/i.test(getBibField(entry, "selected"));
      const image = getBibField(entry, "image") || BIB_FALLBACK_IMAGE;
      const links = buildPaperLinks(entry, safeKey);
      const detail = buildPaperDetail(entry, safeKey);
      const searchParts = [
        title,
        venueText,
        venueFullText,
        year,
        authorNames.join(" "),
        getBibField(entry, "ccf"),
        getBibField(entry, "summary"),
        getBibField(entry, "abstract")
      ].join(" ").toLowerCase();

      if (detail.toggle) links.push(detail.toggle);
      links.push(
        `<button type="button" class="paper-btn paper-btn-secondary bib-export-btn" ` +
        `data-bib-key="${escapeHtml(rawKey)}" aria-haspopup="dialog">${escapeHtml(t("bibtex"))}</button>`
      );

      return [
        `<div class="paper-card" id="paper-${safeKey}" data-selected="${selected ? "true" : "false"}" ` +
        `data-author-rank="${ownerRank}" data-year="${year}" data-search="${escapeHtml(searchParts)}">`,
        `  <div class="paper-image-container">`,
        `    <img src="${escapeHtml(image)}" alt="${escapeHtml(title + " teaser figure")}" loading="lazy">`,
        venueText ? `    <span class="paper-venue-corner">${escapeHtml(venueText)}</span>` : "",
        `  </div>`,
        `  <div class="paper-content">`,
        `    <div class="paper-title-row"><div class="paper-title">${escapeHtml(title)}</div>` +
        `<a class="paper-anchor" href="#paper-${escapeHtml(safeKey)}" aria-label="Link to this paper">#</a></div>`,
        `    <div class="paper-authors">${renderAuthors(entry, authorNames) || escapeHtml("—")}</div>`,
        venueFullText
          ? `    <div class="paper-venue-full">${escapeHtml(venueFullText)}${year && year !== "0" ? ", " + escapeHtml(year) : ""}</div>`
          : "",
        `    ${buildPaperMeta(entry)}`,
        `    <div class="paper-links">${links.join("")}</div>`,
        `    ${detail.block}`,
        `  </div>`,
        `</div>`
      ].join("\n");
    }

    function buildVolumeSuffix(entry) {
      const volume = getBibField(entry, "volume");
      const number = getBibField(entry, "number");
      const pages = getBibField(entry, "pages");
      if (!volume && !pages) return "";
      if (!volume) return pages;
      let suffix = volume;
      if (number) suffix += `(${number})`;
      if (pages) suffix += `: ${pages}`;
      return suffix;
    }

    function buildReferenceTags(entry) {
      const tags = [];
      const jcr = getBibField(entry, "jcr");
      if (jcr) tags.push(`JCR ${jcr}`);
      const sci = getBibField(entry, "sci");
      if (sci) tags.push(/^[1-4]$/.test(sci.trim()) ? `SCI ${sci}区` : `SCI ${sci}`);
      const ccf = getBibField(entry, "ccf");
      if (ccf) tags.push(/^CCF/i.test(ccf) ? ccf : `CCF-${ccf}`);
      const badges = getBibField(entry, "badges").split(",").map((s) => s.trim()).filter(Boolean);
      badges.forEach((badge) => tags.push(badge));
      return tags;
    }

    function buildReferenceEntryHtml(entry, index) {
      const rawKey = String(entry.key || `paper-${index}`).trim();
      const safeKey = rawKey.replace(/[^A-Za-z0-9_-]/g, "-") || `paper-${index}`;
      const title = getBibField(entry, "title") || "Untitled";
      const authorNames = getAuthorNames(entry);
      const ownerRank = getOwnerRank(entry, authorNames) || 99;
      const year = getBibField(entry, "year") || "0";
      const selected = /^(true|yes|1)$/i.test(getBibField(entry, "selected"));
      const searchParts = [
        title,
        year,
        authorNames.join(" "),
        getBibField(entry, "ccf"),
        getBibField(entry, "jcr"),
        getBibField(entry, "sci"),
        getBibField(entry, "summary"),
        getBibField(entry, "abstract")
      ].join(" ").toLowerCase();

      const parts = [renderAuthors(entry, authorNames) || escapeHtml("—")];
      const paperUrl = paperHref(entry);
      const titleHtml = paperUrl
        ? `<a class="paper-ref-title" href="${escapeHtml(paperUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>`
        : `<span class="paper-ref-title">${escapeHtml(title)}</span>`;
      parts.push(titleHtml);
      const venueFull = cleanVenueFullName(
        getBibField(entry, "journal") || getBibField(entry, "booktitle")
      );
      if (venueFull) parts.push(`<span class="paper-ref-venue">${escapeHtml(venueFull)}</span>`);
      if (year && year !== "0") parts.push(`<span class="paper-ref-year">${escapeHtml(year)}</span>`);
      const volumeSuffix = buildVolumeSuffix(entry);
      if (volumeSuffix) parts.push(`<span class="paper-ref-volume">${escapeHtml(volumeSuffix)}</span>`);
      const doi = getBibField(entry, "doi");
      if (doi) {
        parts.push(
          `<span class="paper-ref-doi">doi: <a href="https://doi.org/${escapeHtml(doi)}" target="_blank" rel="noopener noreferrer">${escapeHtml(doi)}</a></span>`
        );
      }

      const tags = buildReferenceTags(entry).map((tag) => escapeHtml(tag));
      const tagsHtml = tags.length ? `<span class="paper-ref-tags">[${tags.join(" | ")}]</span>` : "";
      const bibHtml =
        `<button type="button" class="paper-ref-bib bib-export-btn" ` +
        `data-bib-key="${escapeHtml(entry.key)}" aria-haspopup="dialog">${escapeHtml(t("bibtex"))}</button>`;
      const trailing = [tagsHtml, bibHtml].filter(Boolean).join(" · ");

      return [
        `<div class="paper-card paper-ref" id="paper-${safeKey}" data-selected="${selected ? "true" : "false"}" ` +
        `data-author-rank="${ownerRank}" data-year="${year}" data-search="${escapeHtml(searchParts)}">`,
        `  <div class="paper-ref-text">${parts.join(", ")}${trailing ? " " + trailing : ""}</div>`,
        "</div>"
      ].join("\n");
    }

    function renderPaperCards(container, entries) {
      const cards = [];
      const byKey = new Map();
      const compact = publicationsViewMode === "compact";
      container.classList.toggle("is-compact", compact);
      entries.forEach((entry, index) => {
        if (!entry || !entry.key || BIB_SKIP_TYPES.has(entry.type)) return;
        if (byKey.has(entry.key)) console.warn(`[publications] Duplicate BibTeX key: ${entry.key}`);
        byKey.set(entry.key, entry);
        cards.push(compact ? buildReferenceEntryHtml(entry, index) : buildPaperCardHtml(entry, index));
      });
      paperBibEntries = byKey;
      paperOriginalKeys = Array.from(byKey.keys());
      container.innerHTML = cards.join("\n") +
        `<p class="paper-no-results" id="paper-no-results" hidden>${escapeHtml(t("no-results"))}</p>`;
      if (!paperEventsBound) {
        bindPaperCardEvents(container);
        paperEventsBound = true;
      }
      bindPaperSearch(container);
    }

    function applyPaperSearch() {
      const container = document.getElementById("published-papers");
      const input = document.getElementById("paper-search");
      if (!container || !input) return;
      const query = input.value.trim().toLowerCase();
      const selectedOnly = container.classList.contains("is-selected-only");
      const cards = Array.from(container.querySelectorAll(".paper-card"));
      let visibleCount = 0;
      cards.forEach((card) => {
        const selectedOk = !selectedOnly || card.getAttribute("data-selected") === "true";
        const searchText = (card.getAttribute("data-search") || "").toLowerCase();
        const matches = !query || searchText.includes(query);
        const visible = selectedOk && matches;
        card.classList.toggle("is-filtered-out", !visible);
        if (visible) visibleCount += 1;
      });
      const groupItems = Array.from(container.querySelectorAll(".paper-year-divider, .paper-card"));
      let currentDivider = null;
      let hasVisibleInGroup = false;
      groupItems.forEach((item) => {
        if (item.classList.contains("paper-year-divider")) {
          if (currentDivider) currentDivider.hidden = !hasVisibleInGroup;
          currentDivider = item;
          hasVisibleInGroup = false;
        } else if (!item.classList.contains("is-filtered-out")) {
          hasVisibleInGroup = true;
        }
      });
      if (currentDivider) currentDivider.hidden = !hasVisibleInGroup;
      const noResults = document.getElementById("paper-no-results");
      if (noResults) noResults.hidden = visibleCount > 0;
    }

    function bindPaperSearch(container) {
      const input = document.getElementById("paper-search");
      if (!input || paperSearchBound) return;
      paperSearchBound = true;
      input.addEventListener("input", applyPaperSearch);
    }

    function buildCleanBib(entry) {
      const keptFields = entry.fields.filter((field) => BIB_EXPORT_FIELDS.has(field.name));
      if (!keptFields.length) return `@${entry.type}{${entry.key},\n}\n`;
      const lines = keptFields.map((field) => `  ${field.name} = ${field.raw}`);
      return `@${entry.type}{${entry.key},\n${lines.join(",\n")}\n}\n`;
    }

    function closeBibModal() {
      if (!bibModalOverlay || bibModalOverlay.hidden) return;
      bibModalOverlay.hidden = true;
      if (bibModalLastTrigger && typeof bibModalLastTrigger.focus === "function") {
        bibModalLastTrigger.focus();
      }
      bibModalLastTrigger = null;
    }

    function ensureBibModal() {
      if (bibModalOverlay) return;
      bibModalOverlay = document.createElement("div");
      bibModalOverlay.className = "bib-modal-overlay";
      bibModalOverlay.hidden = true;
      bibModalOverlay.setAttribute("role", "dialog");
      bibModalOverlay.setAttribute("aria-modal", "true");
      bibModalOverlay.setAttribute("aria-label", "Export BibTeX");
      bibModalOverlay.innerHTML = [
        `<div class="bib-modal-box">`,
        `  <div class="bib-modal-head">`,
        `    <h3 class="bib-modal-title">BibTeX</h3>`,
        `    <button type="button" class="bib-modal-close" aria-label="Close">&times;</button>`,
        `  </div>`,
        `  <div class="bib-modal-body">`,
        `    <pre class="bib-pre"></pre>`,
        `    <div class="bib-modal-actions">`,
        `      <button type="button" class="paper-btn bib-modal-copy">${escapeHtml(t("copy"))}</button>`,
        `      <button type="button" class="paper-btn paper-btn-primary bib-modal-download">${escapeHtml(t("download-bib"))}</button>`,
        `    </div>`,
        `  </div>`,
        `</div>`
      ].join("\n");
      document.body.appendChild(bibModalOverlay);
      bibModalCodeEl = bibModalOverlay.querySelector(".bib-pre");
      bibModalCloseBtn = bibModalOverlay.querySelector(".bib-modal-close");
      bibModalCloseBtn.addEventListener("click", closeBibModal);
      bibModalOverlay.addEventListener("click", (event) => {
        if (event.target === bibModalOverlay) closeBibModal();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeBibModal();
      });
      bibModalOverlay.querySelector(".bib-modal-copy").addEventListener("click", (event) => {
        if (!bibModalCodeEl) return;
        copyTextToClipboard(bibModalCodeEl.textContent);
        const button = event.currentTarget;
        const original = button.textContent;
        button.textContent = t("copied");
        setTimeout(() => { button.textContent = original; }, 1600);
      });
      bibModalOverlay.querySelector(".bib-modal-download").addEventListener("click", () => {
        if (!bibModalCodeEl) return;
        downloadTextFile(bibModalCodeEl.textContent, bibModalCurrentKey);
      });
    }

    function openBibExport(key) {
      const entry = paperBibEntries.get(String(key));
      if (!entry) return;
      ensureBibModal();
      bibModalCodeEl.textContent = buildCleanBib(entry);
      bibModalCurrentKey = String(key);
      bibModalLastTrigger = document.activeElement;
      bibModalOverlay.hidden = false;
      if (bibModalCloseBtn) bibModalCloseBtn.focus();
    }

    function copyTextToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
        return;
      }
      fallbackCopyText(text);
    }

    function fallbackCopyText(text) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand("copy"); } catch (error) { /* ignore */ }
      textarea.remove();
    }

    function downloadTextFile(text, key) {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = String(key || "publication").replace(/[^A-Za-z0-9_.-]/g, "_");
      link.href = url;
      link.download = safeName + ".bib";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function bindPaperCardEvents(container) {
      container.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const toggle = target.closest(".paper-detail-toggle");
        if (toggle) {
          const detail = document.getElementById(toggle.getAttribute("aria-controls"));
          if (!detail) return;
          const willOpen = detail.hidden;
          detail.hidden = !willOpen;
          toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
          return;
        }
        const bibButton = target.closest(".bib-export-btn");
        if (bibButton && bibButton.dataset.bibKey) {
          openBibExport(bibButton.dataset.bibKey);
        }
      });
    }

    async function loadPublications() {
      const container = document.getElementById("published-papers");
      if (!container) return;
      try {
        const response = await fetch(BIB_SOURCE_PATH, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Failed to load ${BIB_SOURCE_PATH}`);
        const entries = parseBibFile(await response.text());
        if (entries.length === 0) throw new Error("No BibTeX entries found in the file.");
        renderPaperCards(container, entries);
      } catch (error) {
        container.innerHTML =
          `<p class="publications-error">Could not render publications. ` +
          `Make sure <strong>content/publications.bib</strong> exists and is valid BibTeX. ` +
          `(${escapeHtml(error.message)})</p>`;
      }
    }

    function paperKeyFromCard(card) {
      return String(card.id || "").replace(/^paper-/, "");
    }

    function restoreOriginalPaperOrder(container) {
      container.querySelectorAll(".paper-year-divider").forEach((div) => div.remove());
      const noResults = document.getElementById("paper-no-results");
      if (noResults) noResults.remove();
      const cards = Array.from(container.querySelectorAll(".paper-card"));
      const byKey = new Map(cards.map((card) => [paperKeyFromCard(card), card]));
      paperOriginalKeys.forEach((key) => {
        const card = byKey.get(key);
        if (card) container.appendChild(card);
      });
      if (noResults) container.appendChild(noResults);
    }

    function groupAllPapersByYear(container) {
      restoreOriginalPaperOrder(container);
      const noResults = document.getElementById("paper-no-results");
      if (noResults) noResults.remove();
      const cards = Array.from(container.querySelectorAll(".paper-card"));
      cards.sort((a, b) => (Number(b.dataset.year) || 0) - (Number(a.dataset.year) || 0));
      let lastYear = null;
      cards.forEach((card) => {
        const year = card.dataset.year || "0";
        if (year !== lastYear) {
          const divider = document.createElement("div");
          divider.className = "paper-year-divider";
          divider.dataset.yearGroup = year;
          divider.textContent = year === "0" ? "—" : year;
          container.appendChild(divider);
          lastYear = year;
        }
        container.appendChild(card);
      });
      if (noResults) container.appendChild(noResults);
    }

    function initPaperToggle() {
      const container = document.getElementById("published-papers");
      const buttons = Array.from(document.querySelectorAll(".paper-toggle-btn"));
      if (!container || buttons.length === 0) return;

      const setFilter = (filter, updateHash = true) => {
        const isSelectedOnly = filter === "selected";
        container.classList.toggle("is-selected-only", isSelectedOnly);
        if (filter === "all") {
          groupAllPapersByYear(container);
        } else {
          restoreOriginalPaperOrder(container);
        }
        applyPaperSearch();
        buttons.forEach((button) => {
          const active = button.dataset.filter === filter;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", active ? "true" : "false");
        });
        if (updateHash) updatePaperHash(filter);
        if (typeof window.refreshScrollReveal === "function") {
          requestAnimationFrame(() => window.refreshScrollReveal());
        }
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => setFilter(button.dataset.filter));
      });

      setFilter(getPaperFilterFromHash(), false);

      window.addEventListener("hashchange", () => {
        setFilter(getPaperFilterFromHash(), false);
      });
    }

    // ------------------------------------------------------------------
    // Site-wide rendering from JSON data (config + profile + content)
    // ------------------------------------------------------------------
    const CONTENT_CONFIG_PATH = "content/site-config.json";
    const CONTENT_PROFILE_PATH = "content/profile.json";
    const CONTENT_DATA_PATH = "content/site-content.json";

    const DEFAULT_SECTION_CONFIG = [
      { id: "profile", enabled: true, inNav: false },
      { id: "about", label: "About", enabled: true, inNav: true },
      { id: "news", label: "News", enabled: true, inNav: true },
      { id: "publications", label: "Publications", enabled: true, inNav: true },
      { id: "grants", label: "Grants", enabled: true, inNav: true },
      { id: "working-papers", label: "Working Papers", enabled: true, inNav: true },
      { id: "experience", label: "Experience", enabled: true, inNav: true },
      { id: "honors", label: "Honors", enabled: true, inNav: true },
      { id: "services", label: "Services", enabled: true, inNav: true },
      { id: "teaching", label: "Teaching", enabled: true, inNav: true }
    ];

    const DOM_ID_BY_SECTION = {
      about: "about-me",
      news: "news",
      publications: "publications",
      grants: "grants",
      "working-papers": "working-papers",
      experience: "experience",
      education: "education",
      honors: "honors",
      services: "services",
      teaching: "teaching"
    };

    function publicationsSectionHtml() {
      return [
        `<h1 id="publications" class="section-title">${escapeHtml(t("publications-title"))}</h1>`,
        '  <div class="publications-search-row">',
        `    <input id="paper-search" class="paper-search" type="search" ` +
        `placeholder="${escapeHtml(t("search-papers"))}" aria-label="${escapeHtml(t("search-papers"))}">`,
        '  </div>',
        '<div class="publications-toolbar">',
        `  <p class="muted-note">${t("pub-note")}</p>`,
        '  <div class="paper-toggle" role="tablist" aria-label="Publication filter">',
        `    <button type="button" class="paper-toggle-btn is-active" data-filter="selected" role="tab" aria-selected="true">${escapeHtml(t("selected"))}</button>`,
        `    <button type="button" class="paper-toggle-btn" data-filter="all" role="tab" aria-selected="false">${escapeHtml(t("all"))}</button>`,
        '  </div>',
        '</div>',
        '<div id="published-papers" class="publications-container"></div>'
      ].join("\n");
    }

    const QUICK_LINK_SVG = {
      scholar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
      email: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
      github: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
      cv: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
      twitter: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      publications: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>'
    };

    function getSectionContent(content, sectionId) {
      if (!content) return null;
      if (sectionId === "working-papers") return content.workingPapers || null;
      return content[sectionId] || null;
    }

    function sectionDomId(sectionId) {
      return DOM_ID_BY_SECTION[sectionId] || sectionId;
    }

    function renderSectionHeading(sectionId, title, subtitle) {
      const tag = subtitle ? "h2" : "h1";
      const className = subtitle ? "section-title subsection-title" : "section-title";
      return `<${tag} id="${escapeHtml(sectionDomId(sectionId))}" class="${className}">${escapeHtml(title || "")}</${tag}>`;
    }

    function formatInlineCore(text) {
      let s = escapeHtml(String(text == null ? "" : text));
      s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
      s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
      s = s.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s),.!?:;]|$)/g, "$1<em>$2</em>");
      return s;
    }

    function formatInlineMarkdown(text) {
      const links = [];
      let s = String(text == null ? "" : text);
      s = s.replace(/\[((?:[^\[\]]|\[[^\]]*\])+)\]\(((?:https?:|mailto:)[^)\s]+)\)/g, (match, label, url) => {
        links.push({ label, url });
        return "\u0001" + (links.length - 1) + "\u0001";
      });
      s = formatInlineCore(s);
      s = s.replace(/\u0001(\d+)\u0001/g, (match, index) => {
        const link = links[Number(index)];
        if (!link) return match;
        const rel = /^https?:/i.test(link.url) ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escapeHtml(link.url)}"${rel}>${formatInlineCore(link.label)}</a>`;
      });
      return s;
    }

    function renderModernListItems(items) {
      return items.map((item) => {
        const date = item.date || "";
        const dateClass = /^\d{4}\.\d{2}$/.test(date)
          ? "modern-list-date is-date-compact"
          : "modern-list-date";
        return `<li><span class="${dateClass}">${escapeHtml(date)}</span>` +
          `<span class="modern-list-content">${formatInlineMarkdown(item.text || "")}</span></li>`;
      }).join("");
    }

    function renderListSectionHtml(sectionId, data) {
      if (!data || !Array.isArray(data.items) || !data.items.length) return "";
      const html = [
        renderSectionHeading(sectionId, data.title || sectionId, false),
        `<ul class="modern-list">${renderModernListItems(data.items)}</ul>`
      ].join("\n");
      return html;
    }

    function renderAboutSectionHtml(sectionId, data) {
      if (!data) return "";
      const paragraphs = Array.isArray(data.paragraphs) ? data.paragraphs : [];
      const points = Array.isArray(data.points) ? data.points : [];
      if (!paragraphs.length && !points.length && !data.note) return "";
      const parts = [renderSectionHeading(sectionId, data.title || "About Me", false)];
      paragraphs.forEach((paragraph) => {
        if (!paragraph) return;
        parts.push(`<p class="lead">${formatInlineMarkdown(paragraph)}</p>`);
      });
      if (points.length) {
        const pointHtml = points.map((point) => {
          const label = point.label ? `<strong>${escapeHtml(point.label)}:</strong> ` : "";
          return `<li>${label}${formatInlineMarkdown(point.description || "")}</li>`;
        }).join("");
        parts.push(`<ul class="modern-list" style="margin-top: 8px; margin-bottom: 14px;">${pointHtml}</ul>`);
      }
      if (data.note) parts.push(`<div class="collab-callout">${formatInlineMarkdown(data.note)}</div>`);
      return parts.join("\n");
    }

    function renderGenericAuthors(authors) {
      if (!Array.isArray(authors)) return "";
      return authors.map((author) => {
        const item = typeof author === "string" ? { name: author } : author;
        const displayName = parseAuthorName(item.name || "");
        let html = isOwnerName(displayName) ? `<strong>${escapeHtml(displayName)}</strong>` : escapeHtml(displayName);
        if (item.equal) html += "<sup>*</sup>";
        if (item.corresponding) html += "<sup>#</sup>";
        return html;
      }).join(", ");
    }

    function renderMiniCardsSectionHtml(sectionId, data) {
      if (!data || !Array.isArray(data.items) || !data.items.length) return "";
      const cards = data.items.map((item) => {
        return [
          '<div class="mini-card">',
          `  <div class="mini-card-title">${escapeHtml(item.title || "")}</div>`,
          `  <div class="mini-card-authors">${renderGenericAuthors(item.authors) || escapeHtml("—")}</div>`,
          `  <div class="mini-card-status">${formatInlineMarkdown(item.status || "")}</div>`,
          "</div>"
        ].join("\n");
      }).join("\n");
      return [
        renderSectionHeading(sectionId, data.title || "Working Papers", true),
        cards
      ].join("\n");
    }

    function renderTimelineItemsHtml(items) {
      return items.map((item) => {
        const orgHtml = item.logo
          ? `<div class="exp-org"><img class="company-logo" src="${escapeHtml(item.logo)}" alt="${escapeHtml(item.logoAlt || item.organization || "Logo")}" loading="lazy"><span>${escapeHtml(item.organization || "")}</span></div>`
          : `<div class="exp-org">${escapeHtml(item.organization || "")}</div>`;
        return [
          '<div class="exp-card">',
          '  <div class="exp-header">',
          `    <div class="exp-title">${escapeHtml(item.title || "")}</div>`,
          `    <div class="exp-date">${escapeHtml(item.date || "")}</div>`,
          "  </div>",
          orgHtml,
          `  <div class="exp-desc">${formatInlineMarkdown(item.description || "")}</div>`,
          "</div>"
        ].join("\n");
      }).join("\n");
    }

    function renderTimelineSectionHtml(sectionId, data) {
      if (!data || !Array.isArray(data.items) || !data.items.length) return "";
      return [
        renderSectionHeading(sectionId, data.title || sectionId, false),
        renderTimelineItemsHtml(data.items)
      ].join("\n");
    }

    function renderServiceSubHeading(title) {
      return `<h2 class="section-title subsection-title" style="margin-top:18px;margin-bottom:12px;font-size:1.05rem;color:#1e293b;">` +
        `${escapeHtml(title || "Academic Service")}</h2>`;
    }

    function renderJournalServiceItems(journalItems) {
      const chips = journalItems.map((journal) => {
        const label = escapeHtml(journal.name || "");
        const abbr = journal.abbr ? ` <span class="journal-chip-abbr">(${escapeHtml(journal.abbr)})</span>` : "";
        const inner = `${label}${abbr}`;
        if (journal.url) {
          return `<a class="journal-chip" href="${escapeHtml(journal.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
        }
        return `<span class="journal-chip">${inner}</span>`;
      }).join("");
      return `<div class="journal-grid">${chips}</div>`;
    }

    function renderWorkshopServiceItems(workshopItems) {
      const rows = workshopItems.map((workshop) => {
        const title = `<span class="workshop-name">${escapeHtml(workshop.name || "")}</span>`;
        const extra = [];
        if (workshop.role) extra.push(escapeHtml(workshop.role));
        if (workshop.venue) extra.push(escapeHtml(workshop.venue));
        if (workshop.year) extra.push(escapeHtml(workshop.year));
        const meta = extra.length
          ? ` <span class="workshop-meta">${extra.join(" · ")}</span>`
          : "";
        return `<div class="workshop-item">${title}${meta}</div>`;
      }).join("");
      return `<div class="workshop-list">${rows}</div>`;
    }

    function renderOtherServiceGroups(other) {
      const blocks = [];
      const legacyItems = [];
      other.forEach((group) => {
        if (!group) return;
        const items = Array.isArray(group.items) ? group.items : [];
        if (group.type === "journal" && items.length) {
          blocks.push(renderServiceSubHeading(group.title || "Journal Reviewer"));
          blocks.push(renderJournalServiceItems(items));
        } else if (group.type === "workshop" && items.length) {
          blocks.push(renderServiceSubHeading(group.title || "Workshop Organization"));
          blocks.push(renderWorkshopServiceItems(items));
        } else if (group.date || group.text) {
          legacyItems.push(group);
        }
      });
      if (legacyItems.length) {
        blocks.push(renderServiceSubHeading("Other Academic Services"));
        blocks.push(`<ul class="modern-list">${renderModernListItems(legacyItems)}</ul>`);
      }
      return blocks.join("\n");
    }

    function renderServicesSectionHtml(sectionId, data) {
      if (!data) return "";
      const conferences = Array.isArray(data.conferences) ? data.conferences : [];
      const other = Array.isArray(data.other) ? data.other : [];
      if (!conferences.length && !other.length) return "";
      const parts = [renderSectionHeading(sectionId, data.title || "Academic Services", false)];
      if (conferences.length) {
        parts.push(
          `<h2 class="section-title subsection-title" style="margin-top:18px;margin-bottom:12px;font-size:1.05rem;color:#1e293b;">` +
          `${escapeHtml(data.conferenceHeading || "Conference Reviewer")}</h2>`
        );
        const tiles = conferences.map((conf) => {
          const years = Array.isArray(conf.years) ? conf.years : [];
          const yearPills = years.map((year) => `<span class="tile-year-pill">${escapeHtml(year)}</span>`).join("");
          return [
            '<div class="service-tile">',
            '  <div class="tile-header">',
            `    <span class="tile-conf-name">${escapeHtml(conf.name || "")}</span>`,
            `    <div class="tile-years">${yearPills}</div>`,
            "  </div>",
            `  <div class="tile-full-name">${escapeHtml(conf.fullName || "")}</div>`,
            "</div>"
          ].join("\n");
        }).join("\n");
        parts.push(`<div class="service-grid">${tiles}</div>`);
      }
      if (other.length) {
        parts.push(renderOtherServiceGroups(other));
      }
      return parts.join("\n");
    }

    function renderGrantsSectionHtml(sectionId, data) {
      if (!data || !Array.isArray(data.items) || !data.items.length) return "";
      const rows = data.items.map((grant) => {
        const title = grant.url
          ? `<a class="grants-title" href="${escapeHtml(grant.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(grant.title || "")}</a>`
          : `<span class="grants-title">${escapeHtml(grant.title || "")}</span>`;
        const typeLabel = grant.type ? (grant.type === "project" ? t("type-project") : t("type-grant")) : "";
        const statusKey = String(grant.status || "").toLowerCase();
        const isActive = ["active", "在研", "进行中", "执行中"].some((word) => statusKey.includes(word));
        const statusClass = isActive ? "is-active" : "is-completed";
        const head = [
          typeLabel ? `<span class="grants-type">${escapeHtml(typeLabel)}</span>` : "",
          grant.status ? `<span class="grants-status ${statusClass}">${escapeHtml(grant.status)}</span>` : ""
        ].filter(Boolean).join("");
        const meta = [];
        if (grant.role) meta.push(escapeHtml(grant.role));
        if (grant.funder) meta.push(escapeHtml(grant.funder));
        if (grant.grantNumber) meta.push(escapeHtml(grant.grantNumber));
        if (grant.period) meta.push(escapeHtml(grant.period));
        if (grant.amount) meta.push(escapeHtml(grant.amount));
        return [
          '<div class="grants-item">',
          head ? `  <div class="grants-head">${head}</div>` : "",
          `  <div>${title}</div>`,
          meta.length ? `  <div class="grants-meta">${meta.join(" · ")}</div>` : "",
          "</div>"
        ].join("\n");
      }).join("\n");
      return [
        renderSectionHeading(sectionId, data.title || "Grants & Projects", false),
        `<div class="grants-list">${rows}</div>`
      ].join("\n");
    }

    function renderMainSectionsHtml(sectionConfigs, content) {
      const parts = [];
      sectionConfigs.forEach((section) => {
        if (!section || section.enabled === false) return;
        const id = section.id;
        if (id === "profile") return;
        if (id === "publications") {
          parts.push(publicationsSectionHtml());
          return;
        }
        const data = getSectionContent(content, id);
        let html = "";
        if (id === "about") html = renderAboutSectionHtml(id, data);
        else if (id === "working-papers") html = renderMiniCardsSectionHtml(id, data);
        else if (id === "experience" || id === "education") html = renderTimelineSectionHtml(id, data);
        else if (id === "services") html = renderServicesSectionHtml(id, data);
        else if (id === "grants") html = renderGrantsSectionHtml(id, data);
        else if (id === "news" || id === "honors" || id === "teaching") html = renderListSectionHtml(id, data);
        if (html) parts.push(html);
      });
      return parts.join("\n");
    }

    function buildProfileHtml(profile, sectionConfigs) {
      if (!profile) return "";
      const localized = (profile.localized && profile.localized[currentLanguage]) || {};
      const role = localized.role || profile.role || "";
      const researchLabel = localized.researchLabel || profile.researchLabel || "Research";
      const interestsLabel = localized.interestsLabel || profile.interestsLabel || "Interests";
      const show = profile.show && typeof profile.show === "object" ? profile.show : {};
      const showField = (key) => show[key] !== false;
      const affiliation = localized.affiliation || profile.affiliation || null;
      const locationValue = localized.location !== undefined ? localized.location : profile.location || "";
      const otherItems = localized.other !== undefined ? localized.other : profile.other;
      const enabledAnchorIds = new Set(
        sectionConfigs
          .filter((section) => section.enabled !== false)
          .map((section) => sectionDomId(section.id))
      );
      const metaRows = [];
      if (showField("affiliation") && affiliation && (affiliation.name || affiliation.department)) {
        const affiliationParts = [escapeHtml(affiliation.name || "")];
        if (affiliation.department) affiliationParts.push(escapeHtml(affiliation.department));
        const affiliationText = affiliationParts.filter(Boolean).join(", ");
        const value = affiliation.url
          ? `<a href="${escapeHtml(affiliation.url)}" target="_blank" rel="noopener noreferrer">${affiliationText}</a>`
          : affiliationText;
        metaRows.push(`<div class="profile-meta-row"><span class="profile-meta-label">${escapeHtml(t("affiliation"))}</span><span class="profile-meta-value">${value}</span></div>`);
      }
      if (showField("location") && locationValue) {
        metaRows.push(`<div class="profile-meta-row"><span class="profile-meta-label">${escapeHtml(t("location"))}</span><span class="profile-meta-value">${escapeHtml(locationValue)}</span></div>`);
      }
      if (showField("research") && Array.isArray(profile.research) && profile.research.length) {
        metaRows.push(`<div class="profile-meta-row"><span class="profile-meta-label">${escapeHtml(researchLabel)}</span><span class="profile-meta-value">${escapeHtml(profile.research.join(" · "))}</span></div>`);
      }
      if (showField("interests") && Array.isArray(profile.interests) && profile.interests.length) {
        metaRows.push(`<div class="profile-meta-row"><span class="profile-meta-label">${escapeHtml(interestsLabel)}</span><span class="profile-meta-value">${escapeHtml(profile.interests.join(" · "))}</span></div>`);
      }
      if (showField("other") && Array.isArray(otherItems) && otherItems.length) {
        otherItems.forEach((item) => {
          if (!item || !item.label) return;
          const value = item.href
            ? `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.value || item.href)}</a>`
            : escapeHtml(item.value || "");
          metaRows.push(`<div class="profile-meta-row"><span class="profile-meta-label">${escapeHtml(item.label)}</span><span class="profile-meta-value">${value}</span></div>`);
        });
      }
      const profileMeta = metaRows.length ? `<div class="profile-meta">${metaRows.join("")}</div>` : "";
      const quickLinksVisible = profile.showQuickLinks !== false;
      const links = quickLinksVisible && Array.isArray(profile.quickLinks)
        ? profile.quickLinks.filter((link) => link && link.show !== false).map((link) => {
          if (!link || !link.href) return "";
          if (link.href.startsWith("#") && !enabledAnchorIds.has(link.href.slice(1))) return "";
          const isExternal = /^https?:/i.test(link.href);
          const rel = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
          const svg = QUICK_LINK_SVG[link.type] || "";
          return `<a class="quick-link" href="${escapeHtml(link.href)}"${rel}>${svg}${escapeHtml(link.label || "")}</a>`;
        }).join("") : "";
      const quickLinksBlock = links
        ? `<div class="profile-links-block"><div class="quick-links">${links}</div></div>`
        : "";
      const avatar = profile.avatar
        ? `<img class="profile-avatar" src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.avatarAlt || "Avatar")}">`
        : "";
      return [
        avatar,
        "<div>",
        `  <h1 class="profile-name">${escapeHtml(profile.name || "")}</h1>`,
        `  <p class="profile-role">${formatInlineMarkdown(role)}</p>`,
        profileMeta,
        quickLinksBlock,
        "</div>"
      ].join("\n");
    }

    function applySiteMeta(site) {
      if (!site) return;
      if (site.title) document.title = site.title;
      const baseUrl = String(site.url || "").replace(/\/+$/, "");
      const absolutePath = (path) => {
        if (!path) return "";
        if (/^(https?:|data:)/.test(path)) return path;
        return baseUrl ? `${baseUrl}/${String(path).replace(/^\/+/, "")}` : path;
      };
      const description = document.querySelector('meta[name="description"]');
      if (description && site.description) description.setAttribute("content", site.description);
      const author = document.querySelector('meta[name="author"]');
      if (author && site.author) author.setAttribute("content", site.author);
      const ensureMeta = (property, value, attrName) => {
        let meta = document.querySelector(`meta[${attrName}="${property}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute(attrName, property);
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", value);
      };
      if (site.title) ensureMeta("og:title", site.title, "property");
      if (site.description) ensureMeta("og:description", site.description, "property");
      if (site.ogImage) ensureMeta("og:image", absolutePath(site.ogImage), "property");
      if (site.url) ensureMeta("og:url", baseUrl, "property");
      if (site.title) ensureMeta("twitter:title", site.title, "name");
      if (site.description) ensureMeta("twitter:description", site.description, "name");
      if (site.ogImage) ensureMeta("twitter:image", absolutePath(site.ogImage), "name");
      ensureMeta("twitter:card", "summary_large_image", "name");
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", baseUrl || window.location.href);
      const brand = document.querySelector(".site-nav .nav-brand span");
      if (brand && site.navBrand) brand.textContent = site.navBrand;
      const footerParagraph = document.querySelector(".site-footer p");
      if (footerParagraph) {
        const updatedSuffix = site.showLastUpdated === false || !site.lastUpdated
          ? ""
          : ` · ${escapeHtml(t("last-updated"))}: ${escapeHtml(formatUpdateDate(site.lastUpdated))}`;
        const credit = site.showTemplateCredit === false
          ? ""
          : ` · ${escapeHtml(t("built-with"))} <a href="https://github.com/fengxueguiren/open-academic-homepage" target="_blank" rel="noopener noreferrer">Open Academic Homepage</a>`;
        footerParagraph.innerHTML = `© <span id="current-year">${new Date().getFullYear()}</span> ` +
          `${escapeHtml(site.footerName || site.author || "")}${updatedSuffix}${credit}`;
      }
    }

    function formatUpdateDate(value) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
      return String(value);
    }

    async function detectLastModified(path) {
      try {
        const response = await fetch(path, { method: "HEAD", cache: "no-cache" });
        const header = response.headers && response.headers.get("last-modified");
        if (header) return formatUpdateDate(header);
      } catch (error) {
        /* fall back to config value or hide */
      }
      return "";
    }

    function baseSiteUrl(site) {
      return String((site && site.url) || "").replace(/\/+$/, "");
    }

    function absoluteAssetUrl(site, path) {
      const base = baseSiteUrl(site);
      if (!path) return "";
      if (/^(https?:|data:)/.test(path)) return path;
      return base ? `${base}/${String(path).replace(/^\/+/, "")}` : path;
    }

    function injectPersonJsonLd(site, profile) {
      const id = "jsonld-person";
      document.getElementById(id)?.remove();
      if (!profile) return;
      const localized = (profile.localized && profile.localized[currentLanguage]) || {};
      const sameAs = (Array.isArray(profile.quickLinks) ? profile.quickLinks : [])
        .map((link) => link && link.href)
        .filter((href) => /^https?:\/\//i.test(href));
      const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: profile.name || "",
        url: baseSiteUrl(site) || undefined,
        jobTitle: localized.role || profile.role || undefined,
        image: absoluteAssetUrl(site, profile.avatar) || undefined,
        description: site && site.description,
        sameAs: sameAs.length ? sameAs : undefined
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    function injectPublicationsJsonLd() {
      const id = "jsonld-publications";
      document.getElementById(id)?.remove();
      if (!paperBibEntries.size) return;
      const items = [];
      let position = 1;
      paperBibEntries.forEach((entry, key) => {
        const title = getBibField(entry, "title");
        if (!title) return;
        const item = {
          "@type": "ScholarlyArticle",
          position,
          name: title,
          url: paperHref(entry) || undefined,
          datePublished: getBibField(entry, "year") || undefined,
          publication: getBibField(entry, "booktitle") || getBibField(entry, "journal") || undefined
        };
        const rawAuthors = getBibField(entry, "author");
        if (rawAuthors) {
          item.author = rawAuthors.split(/\s+and\s+/i)
            .map((author) => ({ "@type": "Person", name: parseAuthorName(author) }))
            .filter((author) => author.name);
        }
        items.push(item);
        position += 1;
      });
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: t("publications-title"),
        itemListElement: items
      });
      document.head.appendChild(script);
    }

    function applyAnalytics(config) {
      const analytics = config && config.analytics;
      if (!analytics || analytics.enabled !== true || !analytics.site) return;

      if (analytics.provider === "google" || analytics.provider === "gtag" || analytics.provider === "ga4") {
        // Google Analytics 4 via gtag.js (official snippet order: loader first, then inline config)
        const measurementId = analytics.site;
        const loader = document.createElement("script");
        loader.async = true;
        loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        document.head.appendChild(loader);

        const inline = document.createElement("script");
        inline.textContent = [
          "window.dataLayer = window.dataLayer || [];",
          "function gtag(){dataLayer.push(arguments);}",
          "gtag('js', new Date());",
          `gtag('config', ${JSON.stringify(measurementId)});`
        ].join("\n");
        document.head.appendChild(inline);
      } else {
        const script = document.createElement("script");
        script.async = true;
        if (analytics.provider === "plausible") {
          script.src = "https://plausible.io/js/script.js";
          script.dataset.domain = analytics.site;
        } else {
          // Default: GoatCounter (privacy-friendly)
          script.src = "https://gc.zgo.at/count.js";
          script.dataset.goatcounter = `https://${analytics.site}.goatcounter.com/count`;
        }
        document.head.appendChild(script);
      }
    }

    function resolveLanguage(config) {
      const language = (config && config.language) || {};
      const available = Array.isArray(language.available) && language.available.length
        ? language.available
        : ["en"];
      let selected = available.includes(language.default) ? language.default : available[0];
      try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && available.includes(saved)) selected = saved;
      } catch (error) {
        /* keep configured default */
      }
      return { selected, available, switchable: language.switchable !== false };
    }

    function contentPathFor(language) {
      return language === "en" ? CONTENT_DATA_PATH : `content/site-content.${language}.json`;
    }

    function setupLanguageSwitcher(languageState) {
      if (!languageState || !languageState.switchable || languageState.available.length < 2) return;
      const navInner = document.querySelector(".site-nav .nav-inner");
      if (!navInner || navInner.querySelector(".lang-select")) return;
      const select = document.createElement("select");
      select.className = "lang-select";
      select.setAttribute("aria-label", "Language / 语言");
      languageState.available.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang;
        option.textContent = lang === "zh" ? "中文" : "EN";
        select.appendChild(option);
      });
      select.value = languageState.selected;
      select.addEventListener("change", () => {
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, select.value);
        } catch (error) {
          /* ignore storage errors */
        }
        window.location.reload();
      });
      navInner.appendChild(select);
    }

    function buildNavigationHtml(sectionConfigs) {
      return sectionConfigs
        .filter((section) => section && section.enabled !== false && section.inNav && document.getElementById(sectionDomId(section.id)))
        .map((section) => `<a href="#${escapeHtml(sectionDomId(section.id))}">${escapeHtml(navLabelFor(section))}</a>`)
        .join("");
    }

    function normalizeSectionConfig(config) {
      const list = config && Array.isArray(config.sections) && config.sections.length
        ? config.sections
        : DEFAULT_SECTION_CONFIG;
      return list
        .filter((section) => section && section.id)
        .map((section) => ({ ...section, enabled: section.enabled !== false }));
    }

    async function loadJsonData(path) {
      try {
        const response = await fetch(path, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        return await response.json();
      } catch (error) {
        console.error(`[site] Could not load ${path}`, error);
        return null;
      }
    }

    function renderProfileInto(profile, profileEnabled, sectionConfigs) {
      const header = document.getElementById("profile-header");
      if (!header) return;
      header.innerHTML = profileEnabled && profile ? buildProfileHtml(profile, sectionConfigs) : "";
    }

    const THEME_STORAGE_KEY = "academic-homepage-theme";
    const ALL_THEMES = [
      "burgundy",
      "academic-blue",
      "forest-green",
      "slate",
      "minimal",
      "academic-paper",
      "terminal",
      "pixel"
    ];
    const THEME_DISPLAY_NAMES = {
      burgundy: "Burgundy Crimson",
      "academic-blue": "Academic Blue",
      "forest-green": "Forest Green",
      slate: "Slate Tech Black",
      minimal: "Minimal",
      "academic-paper": "Academic Paper",
      terminal: "Terminal",
      pixel: "Pixel"
    };

    function getThemeOptions(config) {
      const raw = config && config.theme && Array.isArray(config.theme.options) ? config.theme.options : ALL_THEMES;
      return raw.filter((theme) => ALL_THEMES.includes(theme));
    }

    function themeDisplayName(theme) {
      return THEME_DISPLAY_NAMES[theme] || theme;
    }

    function applySiteTheme(config) {
      const themeConfig = (config && config.theme) || {};
      const options = getThemeOptions(config).length ? getThemeOptions(config) : ALL_THEMES;
      const switchable = themeConfig.switchable !== false;
      const stylesheets = themeConfig.stylesheets && typeof themeConfig.stylesheets === "object"
        ? themeConfig.stylesheets
        : {};
      const fonts = themeConfig.fonts && typeof themeConfig.fonts === "object"
        ? themeConfig.fonts
        : {};
      let current = options.includes(themeConfig.default) ? themeConfig.default : options[0];
      if (switchable) {
        try {
          const saved = localStorage.getItem(THEME_STORAGE_KEY);
          if (saved && options.includes(saved)) current = saved;
        } catch (error) {
          /* localStorage unavailable; keep the configured default */
        }
      }
      if (document.body) document.body.dataset.theme = current;
      const state = { options, current, switchable, stylesheets, fonts };
      activateThemeStylesheet(state);
      activateThemeFont(state);
      return state;
    }

    function activateThemeStylesheet(themeState) {
      if (!themeState || !themeState.stylesheets || !document.head) return;
      const target = themeState.stylesheets[themeState.current] || "";
      const links = Array.from(document.querySelectorAll('link[data-theme-stylesheet]'));
      links.forEach((link) => {
        if (link.getAttribute("data-theme-stylesheet") !== target) link.remove();
      });
      if (!target) return;
      const exists = links.some((link) => link.getAttribute("data-theme-stylesheet") === target);
      if (exists) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = target;
      link.setAttribute("data-theme-stylesheet", target);
      document.head.appendChild(link);
    }

    function activateThemeFont(themeState) {
      if (!themeState || !themeState.fonts || !document.head) return;
      const target = themeState.fonts[themeState.current] || "";
      const links = Array.from(document.querySelectorAll('link[data-theme-font]'));
      links.forEach((link) => {
        if (link.getAttribute("data-theme-font") !== target) link.remove();
      });
      if (!target) return;
      const exists = links.some((link) => link.getAttribute("data-theme-font") === target);
      if (exists) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = target;
      link.setAttribute("data-theme-font", target);
      document.head.appendChild(link);
    }

    function setupThemeSwitcher(themeState) {
      if (!themeState || !themeState.switchable) return;
      const navInner = document.querySelector(".site-nav .nav-inner");
      if (!navInner || !document.body) return;
      if (navInner.querySelector(".theme-toggle")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "theme-toggle";
      button.setAttribute("aria-label", "Switch color theme");
      button.title = `Theme: ${themeDisplayName(themeState.current)}`;
      button.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 ' +
        '1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 ' +
        '5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z"/><circle cx="7.5" cy="11.5" r="0.6" fill="currentColor" ' +
        'stroke="none"/><circle cx="10.5" cy="7.5" r="0.6" fill="currentColor" stroke="none"/>' +
        '<circle cx="15" cy="7.6" r="0.6" fill="currentColor" stroke="none"/></svg>';

      button.addEventListener("click", () => {
        const currentIndex = themeState.options.indexOf(document.body.dataset.theme);
        const next = themeState.options[(currentIndex + 1) % themeState.options.length];
        document.body.dataset.theme = next;
        themeState.current = next;
        activateThemeStylesheet(themeState);
        activateThemeFont(themeState);
        button.title = `Theme: ${themeDisplayName(next)}`;
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch (error) {
          /* ignore storage errors */
        }
      });
      navInner.appendChild(button);
    }

    async function initializeSite() {
      const config = await loadJsonData(CONTENT_CONFIG_PATH);
      const site = config && config.site ? config.site : {};
      updateOwnerName(site.ownerName || site.author || "");
      const languageState = resolveLanguage(config);
      currentLanguage = languageState.selected;
      document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
      const resolvedContentPath = contentPathFor(languageState.selected);
      const [profileData, contentData] = await Promise.all([
        loadJsonData(CONTENT_PROFILE_PATH),
        loadJsonData(resolvedContentPath)
      ]);
      if (!site.lastUpdated && site.showLastUpdated !== false) {
        site.lastUpdated = await detectLastModified(resolvedContentPath);
      }
      const sectionConfigs = normalizeSectionConfig(config);
      const themeState = applySiteTheme(config);
      publicationsViewMode = config && config.publicationsView && config.publicationsView.mode === "compact"
        ? "compact"
        : "cards";

      applySiteMeta(site);
      injectPersonJsonLd(site, profileData);
      applyAnalytics(config);
      const profileEnabled = sectionConfigs.some((section) => section.id === "profile" && section.enabled !== false);
      renderProfileInto(profileData, profileEnabled, sectionConfigs);

      const main = document.getElementById("main-content");
      if (main) main.innerHTML = renderMainSectionsHtml(sectionConfigs, contentData);
      const navLinks = document.querySelector(".site-nav .nav-links");
      if (navLinks) navLinks.innerHTML = buildNavigationHtml(sectionConfigs);
      setupThemeSwitcher(themeState);
      setupLanguageSwitcher(languageState);

      const publicationsEnabled = sectionConfigs.some(
        (section) => section.id === "publications" && section.enabled !== false
      );
      if (publicationsEnabled) {
        await loadPublications();
        initPaperToggle();
      }
      injectPublicationsJsonLd();
      if (window.location.hash) {
        const targetId = decodeURIComponent(window.location.hash.slice(1));
        const target = document.getElementById(targetId);
        if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }
      initScrollReveal();
      initNavObserver();
    }

    initializeSite().catch((error) => {
      console.error("[site] Initialization failed", error);
      const main = document.getElementById("main-content");
      if (main) {
        main.innerHTML =
          '<p class="publications-error">The homepage could not be initialized. ' +
          "Make sure content/site-config.json, content/profile.json, and content/site-content.json " +
          `are present and valid. (${escapeHtml(error.message)})</p>`;
      }
    });
