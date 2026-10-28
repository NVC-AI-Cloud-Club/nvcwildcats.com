
(() => {
  const links = [
    { label: "Home", href: "/" },
    { label: "Sports", href: "/sports-page/NewSportsPage.html" },
    { label: "Animations", href: "/Animations/animations.html" },
    {
      label: "Featured Members",
      href: "/Featured-Members/featured%20members/frontend/RevisedFeaturedMembers.html"
    },
    { label: "Feedback", href: "/feedback-page/feedbackindex2.html" }
  ];

  function renderNavbar() {
    const mount = document.getElementById("site-navbar");
    if (!mount) return;

    const currentPath = normalizePath(window.location.pathname);

    mount.innerHTML = `
      <header class="nvc-header">
        <a class="nvc-brand" href="/" aria-label="AI and Cloud Computing Club home">
          <span class="nvc-brand-mark" aria-hidden="true">NVC</span>
          <span class="nvc-brand-copy">
            <strong>AI and Cloud Computing Club</strong>
            <small>Built and Maintained by NVC Students</small>
          </span>
        </a>

        <button class="nvc-menu-toggle" type="button"
          aria-label="Open navigation" aria-expanded="false"
          aria-controls="nvc-main-nav">
          <span></span><span></span><span></span>
        </button>

        <nav class="nvc-nav" id="nvc-main-nav" aria-label="Main navigation">
          ${links.map(link => {
            const linkPath = normalizePath(
              new URL(link.href, window.location.origin).pathname
            );
            const active = currentPath === linkPath ||
              (link.label === "Home" && currentPath === "/");
            return `<a href="${link.href}"${active ? ' aria-current="page"' : ""}>${link.label}</a>`;
          }).join("")}

          <!-- LANGUAGE TRANSLATOR -->
          <div class="gtranslate_wrapper"></div>
        </nav>
      </header>
    `;

    const toggle = mount.querySelector(".nvc-menu-toggle");
    const nav = mount.querySelector(".nvc-nav");

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      nav.classList.toggle("nvc-nav-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
        nav.classList.remove("nvc-nav-open");
      });
    });
  }

  function normalizePath(path) {
    const decoded = decodeURIComponent(path);
    if (decoded.length > 1) return decoded.replace(/\/+$/, "");
    return decoded || "/";
  }

  // GTRANSLATE SETTINGS
  window.gtranslateSettings = {
    default_language: "en",
    languages: ["en", "es", "fr", "de", "it", "zh-CN"],
    wrapper_selector: ".gtranslate_wrapper",
    flag_size: 24,
    switcher_text_color: "#f7f7f7",
    switcher_arrow_color: "#f2f2f2",
    switcher_border_color: "#161616",
    switcher_background_color: "#303030",
    switcher_background_shadow_color: "#474747",
    switcher_background_hover_color: "#3a3a3a",
    dropdown_text_color: "#eaeaea",
    dropdown_hover_color: "#748393",
    dropdown_background_color: "#474747"
  };

  // LOAD GTRANSLATE SCRIPT ONCE
  function loadTranslator() {
    if (document.querySelector("script[data-gtranslate]")) return;

    const script = document.createElement("script");
    script.src = "https://cdn.gtranslate.net/widgets/latest/dropdown.js";
    script.defer = true;
    script.dataset.gtranslate = "true";
    document.body.appendChild(script);
  }

  // START NAVBAR AND TRANSLATOR
  function init() {
    renderNavbar();
    loadTranslator();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
