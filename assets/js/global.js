(function () {
  "use strict";

  var config = window.SiteConfig || {};

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value || "";
    });
  }

  function setAttr(selector, attr, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (value) {
        el.setAttribute(attr, value);
      }
    });
  }

  function createIcon(name, className) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    if (className) {
      svg.setAttribute("class", className);
    }
    use.setAttribute("href", "assets/icons/sprite.svg#icon-" + name);
    svg.appendChild(use);
    return svg;
  }

  function ensureAccordionTrigger(trigger) {
    if (!trigger.querySelector(".accordion-icon")) {
      var text = document.createElement("span");
      while (trigger.firstChild) {
        text.appendChild(trigger.firstChild);
      }
      var icon = document.createElement("span");
      icon.className = "accordion-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.appendChild(createIcon("plus", "icon-plus"));
      icon.appendChild(createIcon("minus", "icon-minus"));
      trigger.appendChild(text);
      trigger.appendChild(icon);
    }
  }

  function setupUiIcons() {
    document.querySelectorAll(".arrow-link").forEach(function (link) {
      if (!link.querySelector("svg")) {
        link.appendChild(createIcon("arrow-right", "link-icon"));
      }
    });

    document.querySelectorAll(".sidebar-links a").forEach(function (link) {
      if (!link.querySelector("svg")) {
        link.appendChild(createIcon("chevron-right", "sidebar-link-icon"));
      }
    });

    document.querySelectorAll(".submenu-toggle").forEach(function (button) {
      if (!button.querySelector("svg")) {
        button.appendChild(createIcon("chevron-down", "submenu-toggle-icon"));
      }
    });

    document.querySelectorAll(".menu-toggle").forEach(function (button) {
      if (!button.querySelector(".menu-toggle-icon")) {
        button.appendChild(createIcon("layers", "menu-toggle-icon menu-toggle-icon--open"));
        button.appendChild(createIcon("x", "menu-toggle-icon menu-toggle-icon--close"));
      }
    });

    document.querySelectorAll("[data-accordion-trigger]").forEach(ensureAccordionTrigger);
  }

  function applyConfig() {
    if (config.browserTitle) {
      document.title = document.body.dataset.pageTitle || config.browserTitle;
    }

    var favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    if (config.favicon) {
      favicon.href = config.favicon;
    }

    setText("[data-config='companyName']", config.companyName);
    setText("[data-config='companyShortName']", config.companyShortName || config.companyName);
    setText("[data-config='email']", config.email);
    setText("[data-config='disclaimer']", config.disclaimer);
    setAttr("[data-config-logo]", "src", config.logo);
    setAttr("[data-config-logo]", "alt", "");
    setAttr("[data-config-email-link]", "href", config.email ? "mailto:" + config.email : "");
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-menu]");
    var submenuToggles = document.querySelectorAll(".submenu-toggle");
    var mobileMenu = window.matchMedia("(max-width: 900px)");
    var scrollPosition = 0;
    var navParent = nav ? nav.parentNode : null;
    var navNextSibling = nav ? nav.nextSibling : null;

    if (!toggle || !nav) {
      return;
    }

    var closeButton = nav.querySelector("[data-mobile-menu-close]");
    if (!closeButton) {
      closeButton = document.createElement("button");
      closeButton.className = "mobile-menu-close";
      closeButton.type = "button";
      closeButton.setAttribute("data-mobile-menu-close", "");
      closeButton.setAttribute("aria-label", "Close menu");
      closeButton.appendChild(createIcon("x", "mobile-menu-close-icon"));
      nav.insertBefore(closeButton, nav.firstChild);
    }

    function restoreNavPosition() {
      if (navParent && nav.parentNode !== navParent) {
        navParent.insertBefore(nav, navNextSibling);
      }
    }

    function liftNavOverlay() {
      if (mobileMenu.matches && nav.parentNode !== document.body) {
        document.body.appendChild(nav);
      }
    }

    function unlockScroll(restorePosition) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (restorePosition) {
        window.scrollTo(0, scrollPosition);
        window.requestAnimationFrame(function () {
          window.scrollTo(0, scrollPosition);
        });
      }
    }

    function lockScroll() {
      scrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

    function closeMenu(restorePosition) {
      var wasOpen = nav.classList.contains("is-open") || document.body.classList.contains("menu-open");
      var shouldRestorePosition = restorePosition !== false;
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      submenuToggles.forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
        var item = button.closest(".nav-item");
        if (item) {
          item.classList.remove("is-submenu-open");
        }
      });
      restoreNavPosition();
      if (wasOpen) {
        unlockScroll(shouldRestorePosition);
      }
    }

    function openMenu() {
      liftNavOverlay();
      nav.classList.add("is-open");
      document.body.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      lockScroll();
    }

    function preventPageScroll(event) {
      if (document.body.classList.contains("menu-open")) {
        event.preventDefault();
      }
    }

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeButton.addEventListener("click", closeMenu);

    submenuToggles.forEach(function (button) {
      button.setAttribute("aria-expanded", "false");

      button.addEventListener("click", function (event) {
        if (!mobileMenu.matches) {
          return;
        }

        event.preventDefault();
        var item = button.closest(".nav-item");
        var isOpen = item && item.classList.toggle("is-submenu-open");
        button.setAttribute("aria-expanded", String(Boolean(isOpen)));
      });
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("wheel", preventPageScroll, { passive: false });
    document.addEventListener("touchmove", preventPageScroll, { passive: false });

    mobileMenu.addEventListener("change", function (event) {
      if (!event.matches) {
        closeMenu();
      }
    });
  }

  function setupAccordions() {
    document.querySelectorAll("[data-accordion]").forEach(function (accordion) {
      accordion.querySelectorAll("[data-accordion-trigger]").forEach(function (trigger) {
        var item = trigger.closest("[data-accordion-item]");
        if (item) {
          var panel = item.querySelector(".accordion-panel");
          if (panel) {
            panel.style.setProperty("--accordion-height", item.classList.contains("is-open") ? panel.scrollHeight + "px" : "0px");
          }
        }

        trigger.addEventListener("click", function () {
          var item = trigger.closest("[data-accordion-item]");
          if (!item) {
            return;
          }

          var panel = item.querySelector(".accordion-panel");
          var isOpen = item.classList.toggle("is-open");
          trigger.setAttribute("aria-expanded", String(isOpen));

          if (panel) {
            panel.style.setProperty("--accordion-height", isOpen ? panel.scrollHeight + "px" : "0px");
          }
        });
      });
    });

    window.addEventListener("resize", function () {
      document.querySelectorAll("[data-accordion-item].is-open .accordion-panel").forEach(function (panel) {
        panel.style.setProperty("--accordion-height", panel.scrollHeight + "px");
      });
    });
  }

  function setupCookieConsent() {
    var consent = document.querySelector("[data-cookie-consent]");
    var accept = document.querySelector("[data-cookie-accept]");

    if (!consent || !accept) {
      return;
    }

    try {
      if (localStorage.getItem("timberrootCookieConsent") !== "accepted") {
        consent.classList.add("is-visible");
      }

      accept.addEventListener("click", function () {
        localStorage.setItem("timberrootCookieConsent", "accepted");
        consent.classList.remove("is-visible");
      });
    } catch (error) {
      consent.classList.remove("is-visible");
    }
  }

  function setupSwipers() {
    if (!window.Swiper) {
      return;
    }

    document.querySelectorAll(".js-swiper").forEach(function (el) {
      if (el.swiper) {
        return;
      }

      var wrapper = el.querySelector(".swiper-wrapper");
      var slides = wrapper ? wrapper.children.length : 0;
      var desktopSlides = Number(el.dataset.slidesDesktop || 1);
      var minLoopSlides = Math.max(6, desktopSlides * 3);
      var pagination = el.querySelector(".swiper-pagination");
      var autoplayDelay = Number(el.dataset.autoplay || 0);

      if (slides < 2) {
        return;
      }

      while (slides < minLoopSlides) {
        Array.prototype.slice.call(wrapper.children, 0, Math.min(slides, minLoopSlides - slides)).forEach(function (slide) {
          var clone = slide.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          clone.dataset.loopClone = "true";
          wrapper.appendChild(clone);
        });
        slides = wrapper.children.length;
      }

      new window.Swiper(el, {
        loop: true,
        grabCursor: true,
        speed: 700,
        slidesPerView: 1,
        spaceBetween: 18,
        watchOverflow: true,
        touchEventsTarget: "container",
        loopAdditionalSlides: Math.max(1, desktopSlides),
        autoplay: autoplayDelay ? {
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        } : false,
        pagination: pagination ? {
          el: pagination,
          clickable: true
        } : false,
        breakpoints: {
          760: {
            slidesPerView: desktopSlides,
            spaceBetween: 22
          }
        }
      });
    });
  }

  function setupParallax() {
    var allItems = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    var bgItems = document.querySelectorAll(".dark-mask-section");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var smallViewport = window.matchMedia("(max-width: 900px)");
    var items = allItems.filter(function (item) {
      return !smallViewport.matches || item.classList.contains("hero-bg");
    });
    var activeBgItems = smallViewport.matches ? [] : Array.prototype.slice.call(bgItems);

    if ((!items.length && !activeBgItems.length) || reducedMotion.matches) {
      allItems.forEach(function (item) {
        item.style.transform = "";
      });
      bgItems.forEach(function (item) {
        item.style.setProperty("--mask-parallax", "0px");
        item.style.setProperty("--mask-bg-parallax", "0px");
        item.style.setProperty("--mask-inner-parallax", "0px");
      });
      return;
    }

    allItems.forEach(function (item) {
      if (items.indexOf(item) === -1) {
        item.style.transform = "";
      }
    });

    var ticking = false;

    function update() {
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var progress = (viewport - rect.top) / (viewport + rect.height);
        var clamped = Math.max(0, Math.min(1, progress));
        var offset = (clamped - 0.5) * Number(item.dataset.parallax || 34);
        var scale = Number(item.dataset.parallaxScale || 1);
        item.style.transform = "translate3d(0," + offset.toFixed(2) + "px,0) scale(" + scale + ")";
      });
      activeBgItems.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var progress = (viewport - rect.top) / (viewport + rect.height);
        var clamped = Math.max(0, Math.min(1, progress));
        var offset = (clamped - 0.5) * 26;
        item.style.setProperty("--mask-parallax", offset.toFixed(2) + "px");
        item.style.setProperty("--mask-bg-parallax", (offset * -0.45).toFixed(2) + "px");
        item.style.setProperty("--mask-inner-parallax", (offset * -2.2).toFixed(2) + "px");
      });
      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function setupAosVisibilityGuard() {
    var items = document.querySelectorAll("[data-aos]");

    if (!items.length) {
      return;
    }

    if (document.documentElement.dataset.aosGuardReady === "true") {
      items.forEach(function (item) {
        if (item.getBoundingClientRect().top < (window.innerHeight || document.documentElement.clientHeight) + 120) {
          item.classList.add("aos-init", "aos-animate");
        }
      });
      return;
    }

    document.documentElement.dataset.aosGuardReady = "true";

    function revealPassedItems() {
      var limit = (window.innerHeight || document.documentElement.clientHeight) + 120;

      items.forEach(function (item) {
        if (item.getBoundingClientRect().top < limit) {
          item.classList.add("aos-init", "aos-animate");
        }
      });
    }

    var ticking = false;

    function requestReveal() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          revealPassedItems();
          ticking = false;
        });
        ticking = true;
      }
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("aos-init", "aos-animate");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("aos-init", "aos-animate");
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -6% 0px",
      threshold: 0.01
    });

    items.forEach(function (item) {
      observer.observe(item);
    });

    revealPassedItems();
    window.addEventListener("scroll", requestReveal, { passive: true });
    window.addEventListener("resize", requestReveal);
  }

  function setupForms() {
    document.querySelectorAll("[data-contact-form]").forEach(function (form) {
      var message = form.querySelector("[data-form-message]");

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (message) {
          message.textContent = "";
        }

        fetch(form.action, {
          method: "POST",
          body: new FormData(form)
        }).then(function (response) {
          if (!response.ok) {
            throw new Error("Form failed");
          }
          return response.text();
        }).then(function (text) {
          if (message) {
            message.textContent = text.trim() || "Successfully sent";
          }
          form.reset();
        }).catch(function () {
          if (message) {
            message.textContent = "Please check the fields and try again.";
          }
        });
      });
    });
  }

  function setupXraySections() {
    document.querySelectorAll("[data-xray-section]").forEach(function (section) {
      var object = section.querySelector("[data-xray-object]");

      if (!object) {
        return;
      }

      function moveLens(clientX, clientY) {
        var rect = object.getBoundingClientRect();
        var x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        var y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

        section.style.setProperty("--xray-x", (x * 100).toFixed(2) + "%");
        section.style.setProperty("--xray-y", (y * 100).toFixed(2) + "%");
      }

      object.addEventListener("pointermove", function (event) {
        moveLens(event.clientX, event.clientY);
      });

      object.addEventListener("pointerdown", function (event) {
        moveLens(event.clientX, event.clientY);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyConfig();
    setupUiIcons();
    setupMenu();
    setupAccordions();
    setupCookieConsent();
    setupSwipers();
    setupParallax();
    setupForms();
    setupXraySections();

    if (window.AOS) {
      window.AOS.init({
        duration: 700,
        once: true,
        offset: 60,
        disableMutationObserver: true
      });
      setupAosVisibilityGuard();

      window.addEventListener("load", function () {
        window.AOS.refreshHard();
        setupAosVisibilityGuard();
        window.setTimeout(function () {
          document.querySelectorAll("[data-aos]").forEach(function (item) {
            item.classList.add("aos-init", "aos-animate");
          });
        }, 900);
      });
    }
  });
})();
