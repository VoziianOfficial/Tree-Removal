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
})();
