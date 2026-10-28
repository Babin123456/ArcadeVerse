/**
 * ArcadeVerse - Global Navigation & Theme Engine
 * Handles responsive mobile navigation drawer, hamburger button state,
 * ARIA accessibility attributes, navbar scroll effects, Back to Top button,
 * and seamless Dark / Light Mode theme switching.
 */

(() => {
  // Theme Switching Engine
  const THEME_KEY = "arcadeverse_theme_mode";

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function applyThemeMode(mode) {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    localStorage.setItem(THEME_KEY, mode);

    document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
      btn.setAttribute("aria-label", mode === "light" ? "Switch to dark theme" : "Switch to light theme");
      btn.setAttribute("title", mode === "light" ? "Switch to dark theme" : "Switch to light theme");
      const iconWrap = btn.querySelector(".theme-icon-wrap");
      if (iconWrap) {
        iconWrap.innerHTML = mode === "light" ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
      }
    });

    if (window.lucide) {
      lucide.createIcons();
    }

    window.dispatchEvent(new CustomEvent("arcadeverse:theme-mode-changed", { detail: { mode } }));
  }

  function toggleThemeMode() {
    const current = getStoredTheme();
    const next = current === "light" ? "dark" : "light";
    applyThemeMode(next);
  }

  // Apply immediately to prevent flash
  const initialMode = getStoredTheme();
  document.documentElement.setAttribute("data-theme", initialMode);

  document.addEventListener("DOMContentLoaded", () => {
    applyThemeMode(initialMode);

    // Bind all theme toggle buttons
    document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleThemeMode();
      });
    });

    const navbar = document.getElementById("navbar");
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileDrawer = document.getElementById("mobile-nav-drawer");

    if (menuBtn && mobileDrawer) {
      function openMobileMenu() {
        menuBtn.classList.add("active");
        menuBtn.setAttribute("aria-expanded", "true");
        mobileDrawer.classList.add("open");
        mobileDrawer.setAttribute("aria-hidden", "false");
      }

      function closeMobileMenu() {
        menuBtn.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
        mobileDrawer.classList.remove("open");
        mobileDrawer.setAttribute("aria-hidden", "true");
      }

      function toggleMobileMenu() {
        const isOpen = mobileDrawer.classList.contains("open");
        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      }

      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMobileMenu();
      });

      // Close when clicking any nav link inside drawer
      const drawerLinks = mobileDrawer.querySelectorAll("a");
      drawerLinks.forEach((link) => {
        link.addEventListener("click", () => {
          closeMobileMenu();
        });
      });

      // Close on click outside navbar
      document.addEventListener("click", (e) => {
        if (mobileDrawer.classList.contains("open") && navbar && !navbar.contains(e.target)) {
          closeMobileMenu();
        }
      });

      // Close on Escape key press
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileDrawer.classList.contains("open")) {
          closeMobileMenu();
          menuBtn.focus();
        }
      });

      // Close if window is resized beyond mobile breakpoint
      window.addEventListener("resize", () => {
        if (window.innerWidth > 1100 && mobileDrawer.classList.contains("open")) {
          closeMobileMenu();
        }
      }, { passive: true });
    }

    // Smooth navbar squeeze on scroll
    if (navbar) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }, { passive: true });
    }

    // Back to Top Button Engine
    const backToTopBtn = document.getElementById("back-to-top-btn");
    if (backToTopBtn) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
        }
      }, { passive: true });

      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }

    // Ensure active navbar pill matches the current active page
    const currentPath = (window.location.pathname || "").toLowerCase();
    const isLeaderboard = currentPath.includes("leaderboard.html");

    document.querySelectorAll(".nav-item, .mobile-nav-item").forEach((link) => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      if (!href || href.startsWith("http")) return;

      if (isLeaderboard && href.includes("leaderboard.html")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else if (!isLeaderboard && href.includes("index.html")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  });
})();
