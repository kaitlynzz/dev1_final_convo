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
