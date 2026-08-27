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

  function setupWoodFeatureCounters() {
    var section = document.querySelector(".wood-feature");
    var counters = document.querySelectorAll(".wood-feature [data-count-to]");

    if (!section || !counters.length) {
      return;
    }

    function setCounterValue(counter, value) {
      counter.textContent = value + (counter.dataset.countSuffix || "");
    }

    function finishCounters() {
      counters.forEach(function (counter) {
        setCounterValue(counter, counter.dataset.countTo || "0");
      });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      finishCounters();
      return;
    }

    function animateCounters() {
      counters.forEach(function (counter) {
        var target = parseInt(counter.dataset.countTo || "0", 10);
        var duration = 1250;
        var startTime = null;

        function tick(timestamp) {
          if (startTime === null) {
            startTime = timestamp;
          }

          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(target * eased);
          setCounterValue(counter, current);

          if (progress < 1) {
            window.requestAnimationFrame(tick);
          } else {
            setCounterValue(counter, target);
          }
        }

        window.requestAnimationFrame(tick);
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(section);
        }
      });
    }, {
      threshold: 0.28
    });

    observer.observe(section);
  }

  function setupLogBuildAnimation() {
    var section = document.querySelector("[data-log-build]");

    if (!section) {
      return;
    }

    function revealIfInView() {
      var rect = section.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight;

      if (rect.top < viewport * 0.82 && rect.bottom > viewport * 0.12) {
        section.classList.add("is-visible");
        window.removeEventListener("scroll", requestReveal);
        window.removeEventListener("resize", requestReveal);
      }
    }

    var ticking = false;

    function requestReveal() {
      if (ticking || section.classList.contains("is-visible")) {
        return;
      }

      window.requestAnimationFrame(function () {
        revealIfInView();
        ticking = false;
      });
      ticking = true;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          section.classList.add("is-visible");
          observer.unobserve(section);
        }
      });
    }, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12
    });

    observer.observe(section);
    window.addEventListener("scroll", requestReveal, { passive: true });
    window.addEventListener("resize", requestReveal);
    requestReveal();
  }

  function setupCutdownStages() {
    var scene = document.querySelector("[data-cutdown-scene]");
    var buttons = document.querySelectorAll("[data-cutdown-button]");

    if (!scene || !buttons.length) {
      return;
    }

    var layers = {
      top: scene.querySelector(".cutdown-tree-top"),
      mid: scene.querySelector(".cutdown-tree-mid"),
      low: scene.querySelector(".cutdown-tree-low"),
      stump: scene.querySelector(".cutdown-stump"),
      logsA: scene.querySelector(".cutdown-logs-a"),
      logsB: scene.querySelector(".cutdown-logs-b"),
      chips: scene.querySelector(".cutdown-chips")
    };

    var stages = {
      "1": {
        top: ["1", "none"],
        mid: ["1", "none"],
        low: ["1", "none"],
        stump: ["0", "translate3d(0, 14px, 0) scale(0.88)"],
        logsA: ["0", "translate3d(26px, 24px, 0) rotate(-2deg) scale(0.86)"],
        logsB: ["0", "translate3d(-10px, 26px, 0) rotate(3deg) scale(0.72)"],
        chips: ["0", "translate3d(10px, 18px, 0) scale(0.76)"]
      },
      "2": {
        top: ["1", "translate3d(18px, 10px, 0) rotate(7deg)"],
        mid: ["1", "none"],
        low: ["1", "none"],
        stump: ["0", "translate3d(0, 14px, 0) scale(0.88)"],
        logsA: ["0", "translate3d(26px, 24px, 0) rotate(-2deg) scale(0.86)"],
        logsB: ["0", "translate3d(-10px, 26px, 0) rotate(3deg) scale(0.72)"],
        chips: ["0.56", "translate3d(-16px, 4px, 0) scale(0.66)"]
      },
      "3": {
        top: ["0.82", "translate3d(42%, 44%, 0) rotate(26deg) scale(0.84)"],
        mid: ["0.9", "translate3d(34%, 28%, 0) rotate(-18deg) scale(0.9)"],
        low: ["1", "none"],
        stump: ["0", "translate3d(0, 14px, 0) scale(0.88)"],
        logsA: ["0.74", "translate3d(0, 0, 0) rotate(-2deg) scale(0.82)"],
        logsB: ["0", "translate3d(-10px, 26px, 0) rotate(3deg) scale(0.72)"],
        chips: ["0.78", "translate3d(0, 0, 0) scale(0.82)"]
      },
      "4": {
        top: ["0", "translate3d(56%, 58%, 0) rotate(32deg) scale(0.62)"],
        mid: ["0", "translate3d(48%, 42%, 0) rotate(-21deg) scale(0.64)"],
        low: ["0", "translate3d(8px, 18px, 0) scale(0.64)"],
        stump: ["1", "translate3d(0, 0, 0) scale(1)"],
        logsA: ["1", "translate3d(0, 0, 0) rotate(-2deg) scale(1)"],
        logsB: ["1", "translate3d(0, 0, 0) rotate(3deg) scale(0.88)"],
        chips: ["1", "translate3d(0, 0, 0) scale(1)"]
      }
    };

    function setStage(stage) {
      var state = stages[stage] || stages["1"];

      scene.classList.remove("is-stage-1", "is-stage-2", "is-stage-3", "is-stage-4");
      scene.classList.add("is-stage-" + stage);

      Object.keys(layers).forEach(function (key) {
        if (!layers[key] || !state[key]) {
          return;
        }

        layers[key].style.opacity = state[key][0];
        layers[key].style.transform = state[key][1];
      });

      buttons.forEach(function (button) {
        button.classList.toggle("is-active", button.dataset.stage === stage);
      });
    }

    buttons.forEach(function (button) {
      ["mouseenter", "focus", "click"].forEach(function (eventName) {
        button.addEventListener(eventName, function () {
          setStage(button.dataset.stage || "1");
        });
      });
    });

    setStage("1");
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupApproachReveal();
    setupApproachParallax();
    setupWoodFeatureCounters();
    setupLogBuildAnimation();
    setupCutdownStages();
  });
})();
