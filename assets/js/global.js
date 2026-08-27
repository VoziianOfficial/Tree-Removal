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
    setText("[data-config='email']", config.email);
    setText("[data-config='disclaimer']", config.disclaimer);
    setAttr("[data-config-logo]", "src", config.logo);
    setAttr("[data-config-logo]", "alt", "");
    setAttr("[data-config-email-link]", "href", config.email ? "mailto:" + config.email : "");
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-menu]");

    if (!toggle || !nav) {
      return;
    }

    function closeMenu() {
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  function setupAccordions() {
    document.querySelectorAll("[data-accordion]").forEach(function (accordion) {
      accordion.querySelectorAll("[data-accordion-trigger]").forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          var item = trigger.closest("[data-accordion-item]");
          if (!item) {
            return;
          }

          var isOpen = item.classList.toggle("is-open");
          trigger.setAttribute("aria-expanded", String(isOpen));
        });
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
      var wrapper = el.querySelector(".swiper-wrapper");
      var slides = wrapper ? wrapper.children.length : 0;

      if (slides < 2) {
        return;
      }

      new window.Swiper(el, {
        loop: true,
        speed: 700,
        slidesPerView: 1,
        spaceBetween: 18,
        watchOverflow: true,
        pagination: {
          el: el.querySelector(".swiper-pagination"),
          clickable: true
        },
        breakpoints: {
          760: {
            slidesPerView: Number(el.dataset.slidesDesktop || 1),
            spaceBetween: 22
          }
        }
      });
    });
  }

  function setupParallax() {
    var items = document.querySelectorAll("[data-parallax]");

    if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    var ticking = false;

    function update() {
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var progress = (viewport - rect.top) / (viewport + rect.height);
        var clamped = Math.max(0, Math.min(1, progress));
        var offset = (clamped - 0.5) * Number(item.dataset.parallax || 34);
        item.style.transform = "translate3d(0," + offset.toFixed(2) + "px,0)";
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

  document.addEventListener("DOMContentLoaded", function () {
    applyConfig();
    setupMenu();
    setupAccordions();
    setupCookieConsent();
    setupSwipers();
    setupParallax();
    setupForms();

    if (window.AOS) {
      window.AOS.init({
        duration: 700,
        once: true,
        offset: 80
      });
    }
  });
})();
