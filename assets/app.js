(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem("blocus-theme");
  if (saved === "light") root.dataset.theme = "light";

  const menu = document.getElementById("menu");
  const nav = document.getElementById("nav");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    }));
  }

  const theme = document.getElementById("theme");
  if (theme) {
    theme.addEventListener("click", () => {
      const light = root.dataset.theme === "light";
      root.dataset.theme = light ? "" : "light";
      localStorage.setItem("blocus-theme", light ? "dark" : "light");
    });
  }

  const header = document.querySelector(".site-header");
  const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, {threshold:0.08});
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
  }

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
      cards.forEach(card => {
        const text = card.textContent.toLocaleLowerCase("fr");
        const ok = (!q || text.includes(q))
          && (!s || card.dataset.school === s)
          && (!st || card.dataset.status === st)
          && (!d || card.dataset.date === d);
        card.hidden = !ok;
        if (ok) count++;
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