(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsWrap = document.getElementById("dots");
  const currentPage = document.getElementById("currentPage");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const swipeTip = document.getElementById("swipeTip");
  const total = slides.length;
  let active = 0;
  let startY = 0;
  let startX = 0;
  let locked = false;

  function loadSlide(index) {
    const slide = slides[index];
    if (!slide) return;
    slide.querySelectorAll("img[data-src]").forEach((image) => {
      if (!image.getAttribute("src")) {
        image.setAttribute("src", image.dataset.src);
      }
    });
  }

  function preloadAround(index) {
    loadSlide(index);
    loadSlide(index + 1);
    loadSlide(index - 1);
  }

  function schedulePreload(index) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => preloadAround(index), { timeout: 1200 });
      return;
    }
    window.setTimeout(() => preloadAround(index), 240);
  }

  const dots = slides.map((_, index) => {
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.addEventListener("click", () => goTo(index));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function render() {
    loadSlide(active);
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === active);
      slide.classList.toggle("is-prev", index < active);
      slide.classList.toggle("is-next", index > active);
    });
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === active));
    currentPage.textContent = String(active + 1);
    swipeTip.classList.toggle("is-hidden", active === total - 1);
    schedulePreload(active);
  }

  function goTo(index) {
    if (locked || index === active || index < 0 || index >= total) return;
    locked = true;
    active = index;
    render();
    window.setTimeout(() => {
      locked = false;
    }, 720);
  }

  function next() {
    goTo(active + 1);
  }

  function prev() {
    goTo(active - 1);
  }

  window.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      startY = touch.clientY;
      startX = touch.clientX;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      const diffY = touch.clientY - startY;
      const diffX = touch.clientX - startX;
      if (Math.abs(diffY) < 42 || Math.abs(diffY) < Math.abs(diffX)) return;
      if (diffY < 0) next();
      if (diffY > 0) prev();
    },
    { passive: true }
  );

  window.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) < 18) return;
    event.deltaY > 0 ? next() : prev();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") next();
    if (event.key === "ArrowUp" || event.key === "PageUp") prev();
  });

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  render();
})();
