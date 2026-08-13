/* Infonomix Market Intelligence — interactive site engine */
(() => {
  "use strict";

  const insights = [
    {
      id: "global-sentiment",
      tag: "MARKETS / EXPLAINER",
      title: "Why global market sentiments matter for Indian sectors",
      text: "Global risk appetite, commodities, rates and overseas flows can affect Indian equities, currencies and business confidence.",
      category: "Markets",
      tags: ["global markets", "sentiment", "india", "sectors"]
    },
    {
      id: "business-growth",
      tag: "BUSINESS / ANALYSIS",
      title: "Understanding the signal behind business growth",
      text: "Revenue growth, margins, demand and capacity expansion can reveal whether a company's growth is broad-based or temporary.",
      category: "Business",
      tags: ["business growth", "companies", "strategy", "demand"]
    },
    {
      id: "consumer-demand",
      tag: "CONSUMER / TRENDS",
      title: "What changing consumer demand means for Indian business",
      text: "Changing preferences, pricing power, product mix and digital adoption can reshape how companies compete.",
      category: "Consumer",
      tags: ["consumer trends", "demand", "digital", "pricing"]
    },
    {
      id: "industrial-shift",
      tag: "BUSINESS / INDUSTRY",
      title: "Industrial shifts reshaping competitive strategy",
      text: "Technology, supply-chain redesign, manufacturing capacity and policy changes are influencing Indian industries.",
      category: "Industry",
      tags: ["industrial shift", "manufacturing", "supply chain", "technology"]
    },
    {
      id: "company-strategy",
      tag: "BUSINESS / STRATEGY",
      title: "How company strategy becomes a market signal",
      text: "Expansion plans, capital allocation, partnerships and product launches can provide clues about future business direction.",
      category: "Strategy",
      tags: ["company strategy", "strategy", "investment", "growth"]
    },
    {
      id: "risk-signal",
      tag: "RISK / SIGNAL",
      title: "Reading the signals behind market risk",
      text: "Rates, volatility, currency moves and sector breadth help separate normal market noise from meaningful risk signals.",
      category: "Risk",
      tags: ["risk", "volatility", "currency", "markets"]
    }
  ];

  const searchTerms = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

  const escapeHTML = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  function scoreItem(item, query) {
    const q = searchTerms(query);
    if (!q.length) return 1;

    const haystack = [
      item.id, item.tag, item.title, item.text, item.category,
      ...(item.tags || [])
    ].join(" ").toLowerCase();

    return q.reduce((score, term) => {
      if (haystack.includes(term)) score += item.title.toLowerCase().includes(term) ? 3 : 1;
      return score;
    }, 0);
  }

  function showMessage(message) {
    let box = document.getElementById("search-results");
    if (!box) {
      box = document.createElement("div");
      box.id = "search-results";
      box.setAttribute("role", "status");
      box.style.cssText =
        "position:fixed;z-index:9999;top:88px;left:50%;transform:translateX(-50%);" +
        "width:min(760px,calc(100% - 28px));max-height:70vh;overflow:auto;" +
        "padding:18px;border:1px solid rgba(255,255,255,.15);border-radius:16px;" +
        "background:rgba(5,20,18,.97);color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.45)";
      document.body.appendChild(box);
    }
    box.innerHTML = message;
    box.style.display = "block";
  }

  function renderSearch(query) {
    const results = insights
      .map(item => ({ item, score: scoreItem(item, query) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);

    if (!results.length) {
      showMessage(`<strong>No matching insight found.</strong><br><span style="opacity:.7">Try business, consumer, strategy, industrial, markets or risk.</span>`);
      return;
    }

    showMessage(
      `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px">
        <strong>Search results</strong>
        <button id="close-search" type="button" style="border:0;background:none;color:#fff;font-size:20px;cursor:pointer">×</button>
      </div>` +
      results.map(item => `
        <article style="padding:14px 0;border-top:1px solid rgba(255,255,255,.1)">
          <small style="opacity:.6">${escapeHTML(item.tag)}</small>
          <h3 style="margin:5px 0">${escapeHTML(item.title)}</h3>
          <p style="margin:0 0 8px;opacity:.75">${escapeHTML(item.text)}</p>
          <button type="button" class="search-open-insight" data-insight-id="${escapeHTML(item.id)}"
            style="border:1px solid rgba(255,255,255,.2);background:transparent;color:#71e8ae;padding:7px 11px;border-radius:8px;cursor:pointer">
            Read analysis →
          </button>
        </article>`).join("")
    );

    document.getElementById("close-search")?.addEventListener("click", () => {
      document.getElementById("search-results")?.remove();
    });

    document.querySelectorAll(".search-open-insight").forEach(btn => {
      btn.addEventListener("click", () => openInsight(btn.dataset.insightId));
    });
  }

  function openInsight(id) {
    const item = insights.find(x => x.id === id);
    if (!item) return;

    const slug = encodeURIComponent(id);
    history.pushState({ insight: id }, "", `#insight-${slug}`);

    showMessage(`
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
        <small style="opacity:.6">${escapeHTML(item.tag)}</small>
        <button id="close-search" type="button" style="border:0;background:none;color:#fff;font-size:20px;cursor:pointer">×</button>
      </div>
      <h2 style="margin:8px 0">${escapeHTML(item.title)}</h2>
      <p style="line-height:1.7;opacity:.8">${escapeHTML(item.text)}</p>
      <p style="opacity:.6">Topics: ${(item.tags || []).map(escapeHTML).join(" · ")}</p>
    `);

    document.getElementById("close-search")?.addEventListener("click", () => {
      document.getElementById("search-results")?.remove();
    });
  }

  function setupSearch() {
    const buttons = [...document.querySelectorAll(
      ".search, .search-btn, [aria-label='Search'], button[data-search-open], .search-button"
    )];

    const inputs = [...document.querySelectorAll(
      "input[type='search'], input[name='search'], input[placeholder*='Search' i]"
    )];

    inputs.forEach(input => {
      input.addEventListener("input", () => {
        if (input.value.trim().length >= 2) renderSearch(input.value);
      });
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          renderSearch(input.value);
        }
      });
    });

    buttons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        const input = document.querySelector("input[type='search'], input[name='search'], input[placeholder*='Search' i]");
        if (input) {
          input.focus();
          return;
        }
        const query = window.prompt("Search Infonomix", "");
        if (query?.trim()) renderSearch(query);
      });
    });
  }

  function setupCards() {
    document.querySelectorAll("[data-business-id], [data-insight-id]").forEach(card => {
      card.addEventListener("click", event => {
        if (event.target.closest("a, button")) return;
        const id = card.dataset.insightId || card.dataset.businessId;
        if (id) openInsight(id);
      });

      card.addEventListener("keydown", event => {
        if ((event.key === "Enter" || event.key === " ") &&
            !event.target.closest("a, button")) {
          event.preventDefault();
          const id = card.dataset.insightId || card.dataset.businessId;
          if (id) openInsight(id);
        }
      });
    });
  }

  function setupInsightPage() {
    const grids = document.querySelectorAll(
      "[data-insights-grid], .insights-grid, .analysis-grid, #insights-grid"
    );

    grids.forEach(grid => {
      if (grid.children.length) return;

      grid.innerHTML = insights.map(item => `
        <article class="analysis-card" data-insight-id="${escapeHTML(item.id)}" tabindex="0">
          <div class="card-top"><span>${escapeHTML(item.tag)}</span></div>
          <h2>${escapeHTML(item.title)}</h2>
          <p>${escapeHTML(item.text)}</p>
          <div class="meta-line"><span>${escapeHTML(item.category)}</span></div>
          <div class="tag-row">${(item.tags || []).map(t => `<span>${escapeHTML(t)}</span>`).join(" ")}</div>
          <a class="read-link" href="#insight-${encodeURIComponent(item.id)}">Read analysis →</a>
        </article>
      `).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupInsightPage();
    setupSearch();
    setupCards();
  });
})();
