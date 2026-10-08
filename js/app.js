(function () {
  "use strict";

  var K = window.KEMET;
  var root = document.documentElement;
  var lang = "ar";

  try {
    var saved = localStorage.getItem("kemet-lang");
    if (saved === "ar" || saved === "en") lang = saved;
  } catch (e) {}

  // The theme attribute is set by the inline script in <head> (saved choice, else light).
  var theme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";

  function t(key) {
    return (K.i18n[lang] && K.i18n[lang][key]) || key;
  }

  // Resolve a { ar, en } pair (or a plain string/number) to display text, or null.
  function pick(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "object") return value[lang] || value.ar || value.en || null;
    return String(value);
  }

  function waLink(text) {
    return "https://wa.me/" + K.whatsapp.number + "?text=" + encodeURIComponent(text);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function icon(id) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function button(className, href, label, iconId) {
    var a = el("a", className);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    if (iconId) a.appendChild(icon(iconId));
    a.appendChild(el("span", null, label));
    return a;
  }

  function notesRow(label, value) {
    var text = pick(value);
    if (!text) return null;
    var row = el("div", "note");
    row.appendChild(el("dt", null, label));
    row.appendChild(el("dd", null, text));
    return row;
  }

  // A perfume that has a name: full product card.
  function renderCard(p) {
    var name = pick(p.name);
    var card = el("article", "card");

    var media = el("div", "card-media");
    if (p.image) {
      var img = el("img");
      img.src = p.image;
      img.alt = name || "";
      img.loading = "lazy";
      img.decoding = "async";
      media.appendChild(img);
    } else {
      media.appendChild(icon("bottle-1"));
    }
    card.appendChild(media);

    var body = el("div", "card-body");
    body.appendChild(el("h3", null, name));

    var family = pick(p.family);
    if (family) body.appendChild(el("p", "family", family));

    var desc = pick(p.description);
    if (desc) body.appendChild(el("p", "muted", desc));

    if (p.notes) {
      var notes = el("dl", "notes");
      [
        notesRow(t("card.notes.top"), p.notes.top),
        notesRow(t("card.notes.heart"), p.notes.heart),
        notesRow(t("card.notes.base"), p.notes.base),
      ].forEach(function (row) {
        if (row) notes.appendChild(row);
      });
      if (notes.children.length) body.appendChild(notes);
    }

    var meta = el("div", "card-meta");
    if (p.size) meta.appendChild(el("span", null, p.size));
    var price =
      typeof p.price === "number"
        ? p.price.toLocaleString(lang === "ar" ? "ar-EG" : "en-US") + (lang === "ar" ? " ج.م" : " EGP")
        : t("card.askPrice");
    meta.appendChild(el("strong", null, price));
    body.appendChild(meta);

    body.appendChild(button("btn btn-gold", waLink(t("wa.product") + name), t("card.order"), "whatsapp"));

    card.appendChild(body);
    return card;
  }

  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // A slot without a name: a sealed shelf with its own bottle silhouette (six different ones).
  function renderSlot(index) {
    var slot = el("div", "slot reveal");
    slot.setAttribute("aria-hidden", "true");
    slot.style.setProperty("--i", String(index));
    var n = index + 1;
    slot.appendChild(el("span", "num", lang === "ar" ? n.toLocaleString("ar-EG") : ROMAN[index] || String(n)));
    slot.appendChild(icon("bottle-" + ((index % 6) + 1)));
    slot.appendChild(el("small", null, t("vault.label")));
    return slot;
  }

  // Items fade and rise one after the other when they scroll into view (only on the first render).
  var firstRender = true;
  var revealIO = null;
  function revealItems(host) {
    var items = host.querySelectorAll(".reveal");
    function show(n) { n.classList.add("in", "done"); }
    if (!firstRender || reduceMotion || !("IntersectionObserver" in window)) {
      firstRender = false;
      items.forEach(show);
      return;
    }
    firstRender = false;
    host.classList.add("reveal-on");
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target;
        revealIO.unobserve(n);
        n.classList.add("in");
        setTimeout(function () { n.classList.add("done"); }, 1800);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -30px 0px" });
    items.forEach(function (n) { revealIO.observe(n); });
  }

  function renderGrid() {
    var host = document.getElementById("perfumeGrid");
    host.textContent = "";

    var limit = K.collectionLimit > 0 ? K.collectionLimit : K.perfumes.length;
    var ready = [];
    var pending = [];
    K.perfumes.slice(0, limit).forEach(function (p, i) {
      if (pick(p && p.name)) ready.push(p);
      else pending.push(i);
    });

    if (ready.length) {
      var grid = el("div", "grid");
      ready.forEach(function (p, i) {
        var card = renderCard(p);
        card.classList.add("reveal");
        card.style.setProperty("--i", String(i));
        grid.appendChild(card);
      });
      host.appendChild(grid);
    }

    if (pending.length) {
      var vault = el("div", "vault");
      pending.forEach(function (i) {
        vault.appendChild(renderSlot(i));
      });
      host.appendChild(vault);
    }

    var cta = el("div", "vault-cta reveal");
    cta.style.setProperty("--i", String(pending.length ? 6 : 1));
    cta.appendChild(button("btn btn-gold btn-lg", waLink(t("wa.notify")), t("vault.cta"), "whatsapp"));
    host.appendChild(cta);

    revealItems(host);
  }

  function applyTheme() {
    root.setAttribute("data-theme", theme);
    var label = t(theme === "dark" ? "theme.toLight" : "theme.toDark");
    var btn = document.getElementById("themeBtn");
    btn.setAttribute("aria-label", label);
    btn.title = label;
  }

  function applyLang() {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("meta.title");
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (node) {
      node.setAttribute("alt", t(node.getAttribute("data-i18n-alt")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-wa]").forEach(function (a) {
      a.href = waLink(t("wa.generic"));
    });
    // the button shows the OTHER language, so it must be announced in that language
    document.getElementById("langBtn").lang = lang === "ar" ? "en" : "ar";
    document.getElementById("phoneText").textContent = K.whatsapp.display;
    applyTheme();
    renderGrid();
  }

  // Theme switch: a circle of the new theme grows out of the button (View Transitions);
  // browsers without it get a soft colour fade instead.
  document.getElementById("themeBtn").addEventListener("click", function (e) {
    var next = theme === "dark" ? "light" : "dark";
    function swap() {
      theme = next;
      try { localStorage.setItem("kemet-theme", theme); } catch (err) {}
      applyTheme();
    }
    if (reduceMotion) { swap(); return; }
    if (document.startViewTransition) {
      var r = e.currentTarget.getBoundingClientRect();
      var x = r.left + r.width / 2;
      var y = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.style.setProperty("--tx", x + "px");
      root.style.setProperty("--ty", y + "px");
      root.style.setProperty("--tr", radius + "px");
      document.startViewTransition(swap);
      return;
    }
    root.classList.add("theme-fade");
    swap();
    setTimeout(function () { root.classList.remove("theme-fade"); }, 700);
  });

  // Language switch
  document.getElementById("langBtn").addEventListener("click", function () {
    lang = lang === "ar" ? "en" : "ar";
    try { localStorage.setItem("kemet-lang", lang); } catch (e) {}
    applyLang();
  });

  // Header gets a solid background once the page scrolls (or the menu is open)
  var header = document.querySelector(".site-header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function syncHeader() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  // Mobile menu
  function setMenu(open) {
    nav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  }
  burger.addEventListener("click", function () {
    setMenu(!nav.classList.contains("open"));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      burger.focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("open") && !header.contains(e.target)) setMenu(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900 && nav.classList.contains("open")) setMenu(false);
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  applyLang();
})();
