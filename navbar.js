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
            const linkPath = normalizePath(new URL(link.href, window.location.origin).pathname);
            const active = currentPath === linkPath ||
              (link.label === "Home" && currentPath === "/");
            return `<a href="${link.href}"${active ? ' aria-current="page"' : ""}>${link.label}</a>`;
          }).join("")}
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderNavbar);
  } else {
    renderNavbar();
  }
})();
