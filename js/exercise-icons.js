/* =========================================================
   Aura Fitness — exercise pictograms
   Small original line-art illustrations (no photos, no
   external assets) so every exercise card and detail view
   has a consistent, on-brand visual. One pose per exercise,
   built from plain SVG primitives.
   ========================================================= */

const ExerciseIcons = (() => {

  const POSES = {
    squat: `
      <line x1="50" y1="34" x2="27" y2="34" />
      <line x1="50" y1="34" x2="73" y2="34" />
      <circle cx="24" cy="34" r="6" class="accent-fill" />
      <circle cx="76" cy="34" r="6" class="accent-fill" />
      <circle cx="50" cy="20" r="8" />
      <path d="M50 28 L50 54" />
      <path d="M50 54 L37 70 L31 90" />
      <path d="M50 54 L63 70 L69 90" />
    `,
    pushup: `
      <line x1="14" y1="82" x2="98" y2="82" class="ground" />
      <circle cx="17" cy="60" r="8" />
      <path d="M25 60 L82 44" />
      <path d="M40 58 L40 82" />
      <path d="M66 49 L66 82" />
      <path d="M82 44 L96 56" />
    `,
    deadlift: `
      <circle cx="50" cy="18" r="8" />
      <path d="M50 26 Q58 40 57 54" />
      <path d="M57 54 L52 80" />
      <path d="M57 54 L47 80 L47 96" />
      <path d="M52 80 L52 96" />
      <line x1="30" y1="82" x2="74" y2="82" />
      <circle cx="27" cy="82" r="7" class="accent-fill" />
      <circle cx="77" cy="82" r="7" class="accent-fill" />
    `,
    run: `
      <circle cx="42" cy="20" r="8" />
      <path d="M46 28 L57 52" />
      <path d="M57 52 L74 62 L90 55" />
      <path d="M57 52 L40 66 L27 90" />
      <path d="M50 33 L34 46" />
      <path d="M50 33 L66 22" />
      <path d="M10 70 L20 70" class="motion" />
      <path d="M6 80 L18 80" class="motion" />
    `,
    pullup: `
      <line x1="18" y1="15" x2="82" y2="15" />
      <path d="M50 30 L30 15" />
      <path d="M50 30 L70 15" />
      <circle cx="50" cy="30" r="8" />
      <path d="M50 38 L50 66" />
      <path d="M50 66 L44 92" />
      <path d="M50 66 L57 92" />
    `,
    plank: `
      <line x1="10" y1="80" x2="98" y2="80" class="ground" />
      <circle cx="20" cy="55" r="8" />
      <path d="M28 55 L84 42" />
      <path d="M40 60 L40 79" />
      <path d="M84 42 L98 50" />
    `,
    press: `
      <circle cx="50" cy="20" r="8" />
      <path d="M50 28 L50 58" />
      <path d="M50 33 L35 14" />
      <path d="M50 33 L65 14" />
      <circle cx="32" cy="11" r="6" class="accent-fill" />
      <circle cx="68" cy="11" r="6" class="accent-fill" />
      <path d="M50 58 L42 90" />
      <path d="M50 58 L58 90" />
    `,
    cycle: `
      <circle cx="24" cy="82" r="13" class="wheel" />
      <circle cx="86" cy="82" r="13" class="wheel" />
      <path d="M24 82 L52 60 L86 82" />
      <path d="M52 60 L46 40" />
      <circle cx="45" cy="33" r="7" />
      <path d="M52 60 L64 66 L58 80" class="accent-stroke" />
    `,
    jumprope: `
      <path d="M28 44 Q50 92 72 44" class="accent-stroke" />
      <circle cx="50" cy="18" r="8" />
      <path d="M50 26 L50 50" />
      <path d="M50 50 L42 62 L48 70" />
      <path d="M50 50 L58 62 L52 70" />
      <path d="M50 32 L34 42" />
      <path d="M50 32 L66 42" />
    `,
    row: `
      <line x1="66" y1="60" x2="82" y2="66" class="ground" />
      <circle cx="34" cy="30" r="8" />
      <path d="M38 36 L66 58" />
      <path d="M66 58 L80 64" />
      <path d="M45 46 L22 55 L20 70" />
      <circle cx="19" cy="73" r="6" class="accent-fill" />
      <path d="M66 58 L60 92" />
      <path d="M66 58 L76 88" />
    `,
    lunge: `
      <circle cx="50" cy="20" r="8" />
      <path d="M50 28 L50 55" />
      <path d="M50 55 L45 70 L45 92" />
      <path d="M50 55 L62 74 L78 84" />
      <path d="M50 35 L38 44" />
      <path d="M50 35 L60 44" />
    `,
    yoga: `
      <circle cx="50" cy="20" r="8" />
      <path d="M50 28 L50 60" />
      <path d="M50 60 L47 95" />
      <path d="M50 60 L66 74 L49 47" />
      <path d="M50 32 L41 14 L50 10 L59 14 L50 32" />
    `,
  };

  function svg(key, size) {
    const pose = POSES[key] || POSES.yoga;
    const s = size || 56;
    return `
      <svg class="xicon" width="${s}" height="${s}" viewBox="0 0 100 100" fill="none"
           stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"
           xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        ${pose}
      </svg>
    `;
  }

  return { svg, keys: Object.keys(POSES) };
})();
