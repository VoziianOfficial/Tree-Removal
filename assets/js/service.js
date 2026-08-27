(function () {
  "use strict";

  var galleries = document.querySelectorAll("[data-process-gallery]");

  galleries.forEach(function (gallery) {
    var previewImage = gallery.querySelector(".process-media img");
    var summary = gallery.querySelector(".process-summary");
    var items = gallery.querySelectorAll(".service-process article");

    if (!previewImage || !summary || !items.length) {
      return;
    }

    function activate(item) {
      if (!item || item.classList.contains("is-active")) {
        return;
      }

      items.forEach(function (entry) {
        entry.classList.toggle("is-active", entry === item);
      });

      var image = item.getAttribute("data-process-image");
      var alt = item.getAttribute("data-process-alt") || "";
      var text = item.getAttribute("data-process-text");

      if (text) {
        summary.textContent = text;
      }

      if (image && previewImage.getAttribute("src") !== image) {
        previewImage.classList.add("is-changing");
        window.setTimeout(function () {
          previewImage.setAttribute("src", image);
          previewImage.setAttribute("alt", alt);
          previewImage.classList.remove("is-changing");
        }, 120);
      } else {
        previewImage.setAttribute("alt", alt);
      }
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        activate(item);
      });

      item.addEventListener("focus", function () {
        activate(item);
      });

      item.addEventListener("touchstart", function () {
        activate(item);
      }, { passive: true });
    });
  });

  var woodActions = document.querySelectorAll("[data-wood-action]");

  woodActions.forEach(function (section) {
    var buttons = section.querySelectorAll("[data-wood-trigger]");

    if (!buttons.length) {
      return;
    }

    function setState(state, activeButton) {
      section.setAttribute("data-wood-state", state);

      buttons.forEach(function (button) {
        button.classList.toggle("is-active", button === activeButton);
      });
    }

    buttons.forEach(function (button) {
      var state = button.getAttribute("data-wood-trigger");

      button.addEventListener("mouseenter", function () {
        setState(state, button);
      });

      button.addEventListener("focus", function () {
        setState(state, button);
      });

      button.addEventListener("click", function () {
        setState(state, button);
      });
    });

    section.addEventListener("mouseleave", function () {
      setState("idle", null);
    });
  });

  var xraySections = document.querySelectorAll("[data-xray-section]");

  xraySections.forEach(function (section) {
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
})();
