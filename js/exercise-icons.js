/* =========================================================
   Aura Fitness — exercise pictograms
   Small self-contained line-art figures (no external images,
   no network requests) illustrating each movement family.
   ========================================================= */

const ExerciseIcons = (() => {
  const S = 'stroke="#14171a" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const HEAD = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="7" ${S}/>`;

  const drawings = {
    squat: `
      ${HEAD(50, 24)}
      <path d="M50,31 L50,52" ${S}/>
      <path d="M50,38 L36,44 M50,38 L64,44" ${S}/>
      <path d="M50,52 L38,66 L38,82 M50,52 L62,66 L62,82" ${S}/>`,
    run: `
      ${HEAD(48, 20)}
      <path d="M48,27 L44,48" ${S}/>
      <path d="M46,33 L60,26 M46,36 L34,42" ${S}/>
      <path d="M44,48 L58,58 L70,50 M44,48 L32,60 L26,76" ${S}/>`,
    jump: `
      ${HEAD(50, 17)}
      <path d="M50,24 L50,48" ${S}/>
      <path d="M50,28 L32,12 M50,28 L68,12" ${S}/>
      <path d="M50,48 L34,80 M50,48 L66,80" ${S}/>`,
    lift: `
      ${HEAD(50, 22)}
      <path d="M50,29 L50,55" ${S}/>
      <path d="M50,33 L30,17 M50,33 L70,17" ${S}/>
      <path d="M22,17 L78,17" ${S}/>
      <path d="M50,55 L40,80 M50,55 L60,80" ${S}/>`,
    press: `
      ${HEAD(50, 20)}
      <path d="M50,27 L50,55" ${S}/>
      <path d="M50,36 L76,36 M50,36 L24,36" ${S}/>
      <circle cx="78" cy="36" r="5" ${S}/><circle cx="22" cy="36" r="5" ${S}/>
      <path d="M50,55 L42,80 M50,55 L58,80" ${S}/>`,
    pushup: `
      ${HEAD(20, 48)}
      <path d="M27,50 L82,42" ${S}/>
      <path d="M36,50 L36,74" ${S}/>
      <path d="M78,43 L88,58" ${S}/>`,
    circuit: `
      <path d="M50,20 a30,30 0 1,1 -21,9" ${S} marker-end="url(#arrow)"/>
      <path d="M22,22 L29,29 L18,32 Z" fill="#14171a"/>
      <circle cx="50" cy="20" r="5" fill="#c8ff3d" stroke="#14171a" stroke-width="3"/>
      <circle cx="78" cy="42" r="5" fill="#c8ff3d" stroke="#14171a" stroke-width="3"/>
      <circle cx="55" cy="76" r="5" fill="#c8ff3d" stroke="#14171a" stroke-width="3"/>`,
    stretch: `
      ${HEAD(30, 44)}
      <path d="M37,48 Q52,58 62,64" ${S}/>
      <path d="M62,64 L86,62" ${S}/>
      <path d="M40,54 L74,60" ${S}/>
      <path d="M30,51 L28,70 L44,74" ${S}/>`,
    core: `
      ${HEAD(24, 28)}
      <path d="M30,30 L56,34" ${S}/>
      <path d="M56,34 L76,20" ${S}/>
      <path d="M30,30 L14,14" ${S}/>
      <path d="M14,58 Q50,50 86,58" ${S} stroke-dasharray="2 7"/>`,
    punch: `
      ${HEAD(50, 20)}
      <path d="M50,27 L50,54" ${S}/>
      <path d="M50,34 L78,29 M50,34 L40,24" ${S}/>
      <circle cx="80" cy="28" r="5" fill="#14171a"/>
      <path d="M50,54 L34,80 M50,54 L64,74" ${S}/>`,
    cycle: `
      <circle cx="24" cy="76" r="12" ${S}/>
      <circle cx="76" cy="76" r="12" ${S}/>
      <path d="M24,76 L48,50 L76,76 M48,50 L40,32" ${S}/>
      ${HEAD(38, 26)}
      <path d="M40,32 L58,38" ${S}/>`,
    swim: `
      ${HEAD(18, 34)}
      <path d="M25,37 L70,42" ${S}/>
      <path d="M25,37 L10,25 M46,39 L58,54" ${S}/>
      <path d="M70,42 L88,34 M70,42 L88,50" ${S}/>
      <path d="M10,70 Q22,64 34,70 T58,70 T82,70" ${S}/>`,
    row: `
      ${HEAD(28, 28)}
      <path d="M33,31 L54,48" ${S}/>
      <path d="M33,31 L12,38" ${S}/>
      <path d="M54,48 L70,62 L86,62" ${S}/>
      <path d="M18,70 L88,70" ${S}/>`,
  };

  function svg(key, size = 96) {
    const body = drawings[key] || drawings.core;
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="exercise illustration">
      <circle cx="50" cy="50" r="49" fill="var(--steel-tint)"/>
      ${body}
    </svg>`;
  }

  return { svg };
})();
