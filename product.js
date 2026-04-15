// Gallery thumb switching
document.querySelectorAll(".pthumb").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pthumb").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.getElementById("mainImage").src = btn.dataset.src;
  });
});

// Color swatches
document.querySelectorAll(".swatch").forEach((s) => {
  s.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach((x) => x.classList.remove("is-active"));
    s.classList.add("is-active");
    document.getElementById("colorLabel").textContent = s.dataset.color;
  });
});

// Config / fabric toggles (exclusive within their group)
document.querySelectorAll(".configs").forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".config-btn");
    if (!btn) return;
    group.querySelectorAll(".config-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    if (group.classList.contains("configs--modules")) {
      const val = btn.dataset.modules;
      const custom = document.getElementById("moduleCustom");
      if (val === "custom") {
        custom.hidden = false;
        renderModules(Number(document.getElementById("moduleCount").value) || 5);
      } else {
        custom.hidden = true;
        renderModules(Number(val) || 1);
      }
    }
  });
});

const customInput = document.getElementById("moduleCount");
if (customInput) {
  customInput.addEventListener("input", () => {
    const n = Math.max(1, Math.min(20, Number(customInput.value) || 1));
    renderModules(n);
  });
}

function renderModules(count) {
  const preview = document.getElementById("modulePreview");
  if (!preview) return;
  preview.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const unit = document.createElement("span");
    unit.className = "module-unit";
    preview.appendChild(unit);
  }
}

// ============================================================
// 3D MATERIAL SWITCHING
// Drives the <model-viewer> from the existing COLOR swatches and
// FABRIC buttons on the product page. Overrides all GLB materials
// with PBR factors chosen to approximate each fabric & color combo.
// ============================================================
const convoViewer = document.getElementById("convoViewer");

// Colors advertised in the product info panel.
const COLOR_HEX = {
  "Deep Ocean": "#2f5d7a",
  Sand: "#b8a98b",
  Olive: "#5a5a4a",
  Onyx: "#2a2724",
  Ivory: "#e8e2d5",
};

// Fabric PBR presets — metalness stays ~0 (all fabrics / leather),
// roughness carries the visual character.
const FABRIC_PBR = {
  BOUCLÉ: { metal: 0.0, rough: 0.98 }, // nubby, zero specular
  VELVET: { metal: 0.0, rough: 0.55 }, // soft directional sheen
  LINEN: { metal: 0.0, rough: 0.9 }, // natural, matte weave
  LEATHER: { metal: 0.06, rough: 0.45 }, // subtle sheen
};

// Track current selection (matches the initial `is-active` HTML state).
let currentColorName = "Deep Ocean";
let currentFabric = "BOUCLÉ";

// sRGB hex → linear RGBA for glTF baseColorFactor (which is linear space).
function hexToLinearRGBA(hex) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const toLin = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return [toLin(r), toLin(g), toLin(b), 1];
}

// Apply the current color + fabric to every material in the GLB.
// model-viewer's Scene Graph API iterates every material; overriding
// here propagates to all meshes that reference them.
function applyConvoMaterials() {
  if (!convoViewer || !convoViewer.model) return;
  const hex = COLOR_HEX[currentColorName];
  if (!hex) return;
  const rgba = hexToLinearRGBA(hex);
  const { metal, rough } = FABRIC_PBR[currentFabric] || FABRIC_PBR.BOUCLÉ;

  convoViewer.model.materials.forEach((mat) => {
    const pbr = mat.pbrMetallicRoughness;
    pbr.setBaseColorFactor(rgba);
    pbr.setMetallicFactor(metal);
    pbr.setRoughnessFactor(rough);
    // Kill any baked texture that would tint over our color choice.
    if (typeof pbr.baseColorTexture?.setTexture === "function") {
      pbr.baseColorTexture.setTexture(null);
    }
  });
}

// Keep the PDP swatches/chips and the viewer overlay visually in sync
// whenever either is clicked.
function syncColorUI(name) {
  document.querySelectorAll(".swatch").forEach((s) =>
    s.classList.toggle("is-active", s.dataset.color === name)
  );
  document.querySelectorAll(".swatch-3d").forEach((s) =>
    s.classList.toggle("is-active", s.dataset.color === name)
  );
  const label = document.getElementById("colorLabel");
  if (label) label.textContent = name;
}

function syncFabricUI(fabric) {
  document
    .querySelectorAll(".configs:not(.configs--modules) .config-btn")
    .forEach((b) =>
      b.classList.toggle("is-active", b.textContent.trim().toUpperCase() === fabric)
    );
  document.querySelectorAll(".chip-3d[data-fabric]").forEach((b) =>
    b.classList.toggle("is-active", b.dataset.fabric === fabric)
  );
}

function setColor(name) {
  if (!COLOR_HEX[name]) return;
  currentColorName = name;
  syncColorUI(name);
  applyConvoMaterials();
}

function setFabric(fabric) {
  if (!FABRIC_PBR[fabric]) return;
  currentFabric = fabric;
  syncFabricUI(fabric);
  applyConvoMaterials();
}

if (convoViewer) {
  // Re-apply every time the model (re)loads.
  convoViewer.addEventListener("load", applyConvoMaterials);

  // PDP color swatches.
  document.querySelectorAll(".swatch").forEach((s) => {
    s.addEventListener("click", () => s.dataset.color && setColor(s.dataset.color));
  });

  // PDP fabric buttons.
  document
    .querySelectorAll(".configs:not(.configs--modules) .config-btn")
    .forEach((b) => {
      b.addEventListener("click", () =>
        setFabric(b.textContent.trim().toUpperCase())
      );
    });

  // In-viewer color swatches.
  document.querySelectorAll(".swatch-3d").forEach((s) => {
    s.addEventListener("click", () => s.dataset.color && setColor(s.dataset.color));
  });

  // In-viewer fabric chips.
  document.querySelectorAll(".chip-3d[data-fabric]").forEach((b) => {
    b.addEventListener("click", () => setFabric(b.dataset.fabric));
  });

  // Reset camera to its neutral framing.
  const resetBtn = document.getElementById("viewerReset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      convoViewer.cameraOrbit = "0deg 75deg auto";
      convoViewer.cameraTarget = "auto auto auto";
      convoViewer.fieldOfView = "auto";
      convoViewer.jumpCameraToGoal();
    });
  }
}

// Favorite toggle
const fav = document.getElementById("favBtn");
if (fav) {
  fav.addEventListener("click", (e) => {
    e.preventDefault();
    fav.classList.toggle("is-faved");
    fav.textContent = fav.classList.contains("is-faved") ? "♥" : "♡";
  });
}
