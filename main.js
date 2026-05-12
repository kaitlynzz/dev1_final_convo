// Simple product carousel — rotates card order through the 3 slots.
(function () {
  const track = document.querySelector(".carousel__track");
  const left = document.querySelector(".carousel__arrow--left");
  const right = document.querySelector(".carousel__arrow--right");
  if (!track || !left || !right) return;

  function applyLayout() {
    const cards = Array.from(track.children);
    cards.forEach((c) => c.classList.remove("card--main", "card--side"));
    cards.forEach((c, i) => {
      c.classList.add(i === 1 ? "card--main" : "card--side");
    });
    updateLinks();
  }

  function updateLinks() {
    const cards = Array.from(track.children);
    cards.forEach((card) => {
      const img = card.querySelector('img');
      const link = card.querySelector('.card__link');
      if (img && link) {
        const src = img.getAttribute('src');
        const filename = src.split('/').pop();
        link.href = `product.html?image=${filename}`;
      }
    });
  }

  // Initial setup
  applyLayout();

  right.addEventListener("click", () => {
    track.appendChild(track.firstElementChild);
    applyLayout();
  });
  left.addEventListener("click", () => {
    track.insertBefore(track.lastElementChild, track.firstElementChild);
    applyLayout();
  });

  // Dots: activate clicked dot within its card.
  document.querySelectorAll(".card__dots").forEach((group) => {
    group.addEventListener("click", (e) => {
      const dot = e.target.closest(".dot");
      if (!dot) return;
      group.querySelectorAll(".dot").forEach((d) => d.classList.remove("dot--active"));
      dot.classList.add("dot--active");
    });
  });
})();

// ============================================================
// LIGHTBOX — clicking a tile in the UNIQUE grid opens a fullscreen view.
// Arrow keys, prev/next buttons, and Escape work as expected.
// ============================================================
(function () {
  const tiles = Array.from(document.querySelectorAll(".unique__grid .tile img"));
  const lightbox = document.getElementById("lightbox");
  if (!tiles.length || !lightbox) return;

  const img = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  let index = 0;

  function open(i) {
    index = (i + tiles.length) % tiles.length;
    img.src = tiles[index].src;
    img.alt = tiles[index].alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  tiles.forEach((t, i) => {
    t.style.cursor = "zoom-in";
    t.addEventListener("click", () => open(i));
  });
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => open(index - 1));
  nextBtn.addEventListener("click", () => open(index + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") open(index - 1);
    else if (e.key === "ArrowRight") open(index + 1);
  });
})();
