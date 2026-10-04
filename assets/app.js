(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme
  const saved = localStorage.getItem("blocus-theme");
  if (saved === "light") root.dataset.theme = "light";

  // Page enter transition
  if (!reduceMotion) {
    body.classList.add("page-entering");
    requestAnimationFrame(() => requestAnimationFrame(() => body.classList.remove("page-entering")));
  }

  // Mobile navigation — accessible, touch-friendly and lightweight
  const menu = document.getElementById("menu");
  const nav = document.getElementById("nav");
  let menuBackdrop = document.getElementById("menu-backdrop");
  if (menu && nav) {
    if (!menuBackdrop) {
      menuBackdrop = document.createElement("button");
      menuBackdrop.type = "button";
      menuBackdrop.id = "menu-backdrop";
      menuBackdrop.className = "menu-backdrop";
      menuBackdrop.setAttribute("aria-label", "Fermer le menu");
      menuBackdrop.setAttribute("tabindex", "-1");
      menu.insertAdjacentElement("afterend", menuBackdrop);
    }

    const closeMenu = () => {
      nav.classList.remove("open");
      menu.classList.remove("is-open");
      menu.textContent = "☰";
      menu.setAttribute("aria-expanded", "false");
      body.classList.remove("menu-open");
    };

    const openMenu = () => {
      nav.classList.add("open");
      menu.classList.add("is-open");
      menu.textContent = "×";
      menu.setAttribute("aria-expanded", "true");
      body.classList.add("menu-open");
    };

    menu.addEventListener("click", () => {
      nav.classList.contains("open") ? closeMenu() : openMenu();
    });
    menuBackdrop.addEventListener("click", closeMenu);
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 800) closeMenu();
    }, {passive:true});
  }

  // Theme toggle with micro-interaction
  const theme = document.getElementById("theme");
  if (theme) {
    theme.addEventListener("click", () => {
      const light = root.dataset.theme === "light";
      root.dataset.theme = light ? "" : "light";
      localStorage.setItem("blocus-theme", light ? "dark" : "light");
      theme.classList.remove("is-switching");
      void theme.offsetWidth;
      theme.classList.add("is-switching");
      setTimeout(() => theme.classList.remove("is-switching"), 700);
    });
  }

  // Header + scroll progress
  const header = document.querySelector(".site-header");
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  const onScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? ((window.scrollY / max) * 100).toFixed(2) + "%" : "0%";
  };
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  // Reveal on scroll
  if (!reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.08, rootMargin:"0px 0px -5% 0px"});
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
  }

  // Ripple interaction
  if (!reduceMotion) {
    document.querySelectorAll(".btn,.icon-btn,.menu-btn").forEach(el => {
      el.addEventListener("pointerdown", e => {
        const r = el.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = (e.clientX - r.left) + "px";
        ripple.style.top = (e.clientY - r.top) + "px";
        el.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      });
    });
  }

  // Smooth same-site page transitions (with View Transitions when supported)
  document.querySelectorAll('a[href$=".html"], a[href^="./"], a[href^="../"]').forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank" || link.hasAttribute("download")) return;
    link.dataset.transition = "true";
    link.addEventListener("click", e => {
      if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      e.preventDefault();

      const navigate = () => {
        body.classList.add("page-leaving");
        setTimeout(() => { location.href = url.href; }, 260);
      };

      navigate();
    });
  });

  // Netflix-style news rail in the navigation
  const newsRail = document.getElementById("nav-news");
  if (newsRail) {
    const track = document.getElementById("nav-news-track");
    const prev = document.getElementById("nav-news-prev");
    const next = document.getElementById("nav-news-next");
    const scriptSrc = document.currentScript?.src || new URL("assets/app.js", location.href).href;
    const newsUrl = new URL("../data/news.json", scriptSrc);
    const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
    const formatNewsDate = value => {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short"}).format(d);
    };
    const renderNews = items => {
      if (!track) return;
      track.innerHTML = items.slice(0,6).map(item => {
        const url = item.sourceUrl || "actualites.html";
        const external = Boolean(item.sourceUrl);
        return `<a class="nav-news-card" href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>` +
          `<span class="nav-news-card-top"><small>${escapeHtml(item.category || "Poissy")}</small><time datetime="${escapeHtml(item.date)}">${escapeHtml(formatNewsDate(item.date))}</time></span>` +
          `<strong>${escapeHtml(item.title)}</strong><span class="nav-news-card-source">${escapeHtml(item.source || "Blocus Lycées Poissy")}</span></a>`;
      }).join("");
    };
    const loadNews = async () => {
      try {
        const response = await fetch(newsUrl.href, {cache:"no-store"});
        if (!response.ok) throw new Error("news");
        const items = await response.json();
        items.sort((a,b) => new Date(b.date) - new Date(a.date));
        renderNews(items);
      } catch {
        if (track) {
          const fallbackUrl = new URL("../actualites.html", scriptSrc).href;
          track.innerHTML = '<a class="nav-news-card" href="' + fallbackUrl + '"><span class="nav-news-card-top"><small>Poissy</small><time>À la une</time></span><strong>Voir les dernières actualités du site</strong><span class="nav-news-card-source">Actualités</span></a>';
        }
      }
    };
    const move = direction => {
      if (!track) return;
      const amount = Math.max(track.clientWidth * .72, 240);
      const atStart = track.scrollLeft <= 8;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (direction > 0 && atEnd && track.scrollWidth > track.clientWidth) {
        track.scrollTo({left:0,behavior:reduceMotion ? "auto" : "smooth"});
        return;
      }
      if (direction < 0 && atStart && track.scrollWidth > track.clientWidth) {
        track.scrollTo({left:track.scrollWidth,behavior:reduceMotion ? "auto" : "smooth"});
        return;
      }
      track.scrollBy({left:direction * amount,behavior:reduceMotion ? "auto" : "smooth"});
    };
    prev?.addEventListener("click",() => move(-1));
    next?.addEventListener("click",() => move(1));
    let timer;
    const startAuto = () => {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(() => move(1), 4200);
    };
    newsRail.addEventListener("mouseenter",() => clearInterval(timer));
    newsRail.addEventListener("mouseleave",startAuto);
    newsRail.addEventListener("focusin",() => clearInterval(timer));
    newsRail.addEventListener("focusout",event => { if (!newsRail.contains(event.relatedTarget)) startAuto(); });
    newsRail.addEventListener("touchstart",() => clearInterval(timer),{passive:true});
    newsRail.addEventListener("touchend",startAuto,{passive:true});
    loadNews().then(startAuto);
  }

  // Event filtering
  const results = document.getElementById("event-results");
  if (results) {
    const cards = [...results.querySelectorAll("[data-event-card]")];
    const query = document.getElementById("q");
    const school = document.getElementById("school");
    const status = document.getElementById("status");
    const date = document.getElementById("date");

    const filter = () => {
      const q = (query?.value || "").toLocaleLowerCase("fr");
      const s = school?.value || "";
      const st = status?.value || "";
      const d = date?.value || "";
      let count = 0;
      cards.forEach((card, index) => {
        const text = card.textContent.toLocaleLowerCase("fr");
        const ok = (!q || text.includes(q))
          && (!s || card.dataset.school === s)
          && (!st || card.dataset.status === st)
          && (!d || card.dataset.date === d);
        card.hidden = !ok;
        if (ok) {
          count++;
          if (!reduceMotion) {
            card.style.animation = "none";
            void card.offsetWidth;
            card.style.animation = `filterIn .45s ${Math.min(index*45,220)}ms var(--ease-spring) both`;
          }
        }
      });
      const empty = document.getElementById("no-results");
      if (empty) empty.hidden = count !== 0;
    };

    [query, school, status, date].filter(Boolean).forEach(el => {
      el.addEventListener("input", filter);
      el.addEventListener("change", filter);
    });
    filter();
  }
})();