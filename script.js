(function () {
  const loader = document.getElementById("loader");

  const KEY = "ma_loader_seen";

  // NB: ikke kall denne "nav" (du bruker nav senere til menyen)
  const navEntry = performance.getEntriesByType("navigation")[0];
  const isReload = navEntry && navEntry.type === "reload";

  if (loader) {
    // ved refresh: vis loader igjen
    if (isReload) {
      sessionStorage.removeItem(KEY);
    }

    const alreadySeen = sessionStorage.getItem(KEY) === "1";

    if (alreadySeen) {
      loader.remove();
    } else {
      sessionStorage.setItem(KEY, "1");

      const MIN_MS = 900;
      const startedAt = performance.now();

      function hideLoader() {
        const elapsed = performance.now() - startedAt;
        const wait = Math.max(0, MIN_MS - elapsed);

        window.setTimeout(() => {
          loader.classList.add("is-leaving");
          window.setTimeout(() => loader.remove(), 1600);
        }, wait);
      }

      if (document.readyState === "complete") hideLoader();
      else window.addEventListener("load", hideLoader, { once: true });
    }
  }
  function hideLoader() {
    if (!loader) return;

    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, MIN_MS - elapsed);

    window.setTimeout(() => {
      loader.classList.add("is-leaving");
      // CSS transition er 0.35s, så 450ms er nok før remove
      window.setTimeout(() => loader.remove(), 1450);
    }, wait);
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }

  // (resten av koden din under her uendret)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobilmeny
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Lukk meny" : "Åpne meny");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("open");
      setMenu(!isOpen);
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const clickedInside = nav.contains(target) || toggle.contains(target);
      if (!clickedInside) setMenu(false);
    });
  }

  // Aktiv lenke basert på filnavn
  const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const page = path.replace(".html", "");

  document.querySelectorAll(".nav a[data-page]").forEach((a) => {
    if (a.getAttribute("data-page") === page) a.classList.add("active");
  });

  // Kontakt: mailto (samme som før)
  const form = document.getElementById("contactForm");
  const hint = document.getElementById("formHint");
  const copyBtn = document.getElementById("copyEmailBtn");
  const emailTo = "post@mattssonaviation.no";

  function setHint(text) {
    if (hint) hint.textContent = text;
  }

  function buildMailto(name, email, message) {
    const subject = `Henvendelse – Mattsson Aviation (${name})`;
    const body =
      `Hei!\n\n` +
      `Navn: ${name}\n` +
      `E-post: ${email}\n\n` +
      `Melding:\n${message}\n\n` +
      `Hilsen\n${name}`;

    const params = new URLSearchParams({ subject, body });
    return `mailto:${emailTo}?${params.toString()}`;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !email || !message) {
        setHint("Fyll inn navn, e-post og melding, så åpner vi e-postutkastet.");
        return;
      }

      setHint("Åpner e-postutkast i e-postprogrammet ditt…");
      window.location.href = buildMailto(name, email, message);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailTo);
        setHint("E-postadresse kopiert.");
      } catch {
        setHint("Klarte ikke å kopiere automatisk. Marker og kopier e-postadressen manuelt.");
      }
    });
  }
})();
