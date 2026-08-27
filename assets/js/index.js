(function () {
  "use strict";

  function setupApproachReveal() {
    var items = document.querySelectorAll("[data-approach-reveal]");

    if (!items.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.18
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function setupApproachParallax() {
    var wood = document.querySelector("[data-approach-parallax]");

    if (
      !wood ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 900px)").matches
    ) {
      return;
    }

    var ticking = false;

    function update() {
      var rect = wood.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      var progress = (viewport - rect.top) / (viewport + rect.height);
      var clamped = Math.max(0, Math.min(1, progress));
      var offset = (clamped - 0.5) * 28;
      wood.style.setProperty("--approach-parallax", offset.toFixed(2) + "px");
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

  document.addEventListener("DOMContentLoaded", function () {
    setupApproachReveal();
    setupApproachParallax();
  });
})();
