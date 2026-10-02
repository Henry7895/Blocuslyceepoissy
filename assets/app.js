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

  // Mobile navigation
  const menu = document.getElementById("menu");
  const nav = document.getElementById("nav");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.classList.toggle("is-open", open);
      menu.textContent = open ? "×" : "☰";
      menu.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.classList.remove("is-open");
      menu.textContent = "☰";
      menu.setAttribute("aria-expanded", "false");
    }));
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