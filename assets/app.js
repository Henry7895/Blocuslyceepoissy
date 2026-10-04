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

  // Médias : affichage, filtres et ajout local sur l'appareil.
  const mediaFeed=document.getElementById("media-feed");
  if(mediaFeed){
    const sf=document.getElementById("media-school"),df=document.getElementById("media-date"),form=document.getElementById("media-add-form"),empty=document.getElementById("media-empty"),tabs=[...document.querySelectorAll(".media-tab")];
    let activeType="all",items=[],photos=[],galleryIndex=0;
    const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const getLocal=()=>{try{return JSON.parse(localStorage.getItem("blocus-media")||"[]")}catch{return[]}};
    const saveLocal=v=>localStorage.setItem("blocus-media",JSON.stringify(v));
    const youtubeId=url=>{try{const u=new URL(url);if(u.hostname.includes("youtu.be"))return u.pathname.slice(1).split("/")[0];if(u.hostname.includes("youtube.com"))return u.searchParams.get("v")||(u.pathname.match(/\/embed\/([^/]+)/)||[])[1]}catch{}return null};
    const render=()=>{const f=items.filter(x=>(activeType==="all"||x.type===activeType)&&(!sf?.value||x.school===sf.value)&&(!df?.value||x.date===df.value));photos=f.filter(x=>x.type==="photo"&&x.image);mediaFeed.innerHTML=f.map(x=>{let media="";if(x.type==="photo")media='<button class="media-photo" data-gallery-index="'+photos.indexOf(x)+'"><img loading="lazy" src="'+esc(x.image)+'" alt="'+esc(x.alt||x.title)+'"></button>';else{const id=youtubeId(x.url||"");media=id?'<div class="media-video-wrap"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'" title="'+esc(x.title)+'" allow="accelerometer;autoplay;encrypted-media;gyroscope;picture-in-picture;web-share" allowfullscreen></iframe></div>':'<div class="tiktok-placeholder"><a class="btn primary" href="'+esc(x.url)+'" target="_blank" rel="noopener">Ouvrir la vidéo ↗</a></div>'}return '<article class="card media-card"><div class="media-card-head"><span class="badge '+(x.type==="video"?"violet":"good")+'">'+(x.type==="video"?"VIDÉO":"PHOTO")+'</span><span class="media-date">'+esc(x.date)+'</span></div>'+media+'<div class="media-card-body"><h3>'+esc(x.title)+'</h3><p class="muted">'+esc(x.description||"")+'</p><div class="media-meta">'+esc(x.school==="corbusier"?"Le Corbusier":"Charles-de-Gaulle")+'</div></div></article>'}).join("");if(empty)empty.hidden=f.length>0;document.querySelectorAll(".media-photo").forEach(b=>b.addEventListener("click",()=>openGallery(Number(b.dataset.galleryIndex))))};
    const lightbox=document.getElementById("media-lightbox"),lightImg=document.getElementById("lightbox-image");
    function openGallery(i){if(!photos.length)return;galleryIndex=(i+photos.length)%photos.length;lightImg.src=photos[galleryIndex].image;lightImg.alt=photos[galleryIndex].alt||photos[galleryIndex].title||"";lightbox.hidden=false;document.body.classList.add("lightbox-open")}
    function closeGallery(){if(lightbox){lightbox.hidden=true;document.body.classList.remove("lightbox-open")}}
    document.getElementById("lightbox-close")?.addEventListener("click",closeGallery);document.getElementById("lightbox-prev")?.addEventListener("click",()=>openGallery(galleryIndex-1));document.getElementById("lightbox-next")?.addEventListener("click",()=>openGallery(galleryIndex+1));
    tabs.forEach(t=>t.addEventListener("click",()=>{tabs.forEach(x=>x.classList.remove("active"));t.classList.add("active");activeType=t.dataset.mediaType||"all";render()}));[sf,df].filter(Boolean).forEach(x=>x.addEventListener("change",render));
    function fillDates(){[...new Set(items.map(x=>x.date).filter(Boolean))].sort().reverse().forEach(d=>{if([...df.options].some(o=>o.value===d))return;const o=document.createElement("option");o.value=d;o.textContent=d;df.appendChild(o)})}
    fetch("data/media.json?v=5").then(r=>r.ok?r.json():Promise.reject()).then(d=>{items=(Array.isArray(d.items)?d.items:[]).concat(getLocal());fillDates();render()}).catch(()=>{items=getLocal();fillDates();render()});
    form?.addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(form),item={type:String(fd.get("type")||"video"),url:String(fd.get("url")||"").trim(),title:String(fd.get("title")||"").trim(),school:String(fd.get("school")||"corbusier"),date:String(fd.get("date")||new Date().toISOString().slice(0,10)),description:String(fd.get("description")||"").trim()};if(!item.url||!item.title)return;const a=getLocal();a.unshift(item);saveLocal(a);items.unshift(item);fillDates();render();form.reset();const ok=document.getElementById("media-added");if(ok)ok.hidden=false});
    document.addEventListener("keydown",e=>{if(!lightbox||lightbox.hidden)return;if(e.key==="Escape")closeGallery();if(e.key==="ArrowLeft")openGallery(galleryIndex-1);if(e.key==="ArrowRight")openGallery(galleryIndex+1)});
  }
})();