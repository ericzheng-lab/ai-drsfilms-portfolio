// Real product vocabulary, used everywhere on the landing.

const CHIP_CATEGORIES = [
  { label: 'SHOT SIZE', items: ['ECU (Extreme Close-Up)', 'CU (Close-Up)', 'MCU (Medium Close-Up)', 'MS (Medium Shot)', 'MLS (Medium Long Shot)', 'FS (Full Shot)', 'WS (Wide Shot)', 'EWS (Extreme Wide Shot)', 'OTS (Over-the-Shoulder)', 'POV', 'Insert Shot', 'Two-Shot', 'Cowboy Shot'] },
  { label: 'CAMERA ANGLE', items: ['Eye Level', 'Low Angle', 'High Angle', 'Dutch Angle', "Worm's Eye", "Bird's Eye", 'Overhead', 'POV', 'Canted', 'Reverse Angle'] },
  { label: 'LENS', items: ['14mm Ultra Wide', '24mm Wide', '35mm Standard', '50mm Normal', '85mm Portrait', '100mm Macro', '135mm Telephoto', '200mm Telephoto', 'Anamorphic', 'Tilt-Shift', 'Fisheye'] },
  { label: 'LIGHTING', items: ['Three-Point', 'Rembrandt', 'Split', 'Loop', 'Butterfly', 'Practical', 'Motivated', 'High Key', 'Low Key', 'Golden Hour', 'Blue Hour', 'Hard Key', 'Soft Box', 'Backlight'] },
  { label: 'ASPECT RATIO', items: ['2.39:1 (Anamorphic)', '1.85:1 (Flat Widescreen)', '16:9 (HD)', '4:3 (Academy)', '1.66:1 (European)', '2:1 (Univisium)', '21:9 (Ultra Widescreen)', '1:1 (Square)'] },
  { label: 'MOOD', items: ['Cinematic', 'Melancholic', 'Tense', 'Dreamlike', 'Nostalgic', 'Foreboding', 'Intimate', 'Epic', 'Serene', 'Frenetic'] },
  { label: 'STYLE', items: ['Denis Villeneuve', 'Ridley Scott', 'Christopher Nolan', 'Fritz Lang', 'Tarkovsky', 'Roger Deakins', 'IMAX', 'Neo-noir', 'Brutalist sci-fi', 'Anime Cel'] },
];

const PRODUCT_CATEGORIES = [
  {
    group: 'Pre-production',
    items: [
      { name: 'Mood Board', desc: 'Visual tone & atmosphere reference', presets: 2, glyph: '◐' },
      { name: 'Style Frame', desc: 'Key moment visual — look & feel', presets: 2, glyph: '◧' },
      { name: 'Color Script', desc: 'Color progression across scenes', presets: 1, glyph: '⌗' },
      { name: 'Storyboard', desc: 'Sequential shot-by-shot breakdown', presets: 1, glyph: '⊟' },
    ],
  },
  {
    group: 'Character',
    items: [
      { name: 'Character Design', desc: 'Full character concept sheet', presets: 1, glyph: '◉' },
      { name: 'Turnaround', desc: 'Multi-angle consistency sheet', presets: 1, glyph: '⟳', llm: true },
      { name: 'Expression Sheet', desc: 'Emotional range reference', presets: 1, glyph: '◔' },
    ],
  },
  {
    group: 'Environment',
    items: [
      { name: 'Scene Concept', desc: 'Environment concept art', presets: 1, glyph: '△', llm: true },
      { name: 'Panorama / Establishing', desc: 'Wide establishing shot', presets: 1, glyph: '▭', llm: true },
      { name: 'Lighting Study', desc: 'Lighting variation reference', presets: 1, glyph: '◇' },
    ],
  },
  {
    group: 'Storyboard & Sequence',
    items: [
      { name: 'Shot Sequence', desc: 'Multi-shot narrative sequence', presets: 1, glyph: '⫼' },
      { name: 'Comic / Manga Page', desc: 'Panel-based visual storytelling', presets: 0, glyph: '▦' },
    ],
  },
  {
    group: 'Production & VFX',
    items: [
      { name: 'Prop / Costume', desc: 'Detailed prop or costume reference', presets: 1, glyph: '⊕' },
      { name: 'VFX Reference', desc: 'Visual effects breakdown', presets: 1, glyph: '✺' },
      { name: 'Film Poster / Key Art', desc: 'Marketing key visual', presets: 1, glyph: '▢', llm: true },
    ],
  },
];

const MODELS = [
  {
    name: 'Midjourney',
    tag: 'v6.1',
    desc: 'Photorealistic, cinematic. Parameters for aspect ratio, stylization, style raw.',
    snippet: `/imagine prompt: monumental brutalist steampunk cityscape,
a man standing alone on a windswept hill, seen from behind,
towering concrete megastructures fused with brass pipes,
smokestacks, cables, gears, industrial haze, epic wide shot,
35mm anamorphic, teal-and-amber color grade, desaturated
concrete, copper highlights, volumetric smoke, film grain`,
    lang: 'mj',
  },
  {
    name: 'Flux 2 Max',
    tag: 'natural',
    desc: 'Detailed natural-language descriptions with explicit camera and lens specs.',
    snippet: `Cinematic film still, a current-day man in modern clothing standing alone on a windswept hill, looking out over a vast brutalist steampunk city. Colossal concrete megastructures fused with brass pipes, smokestacks, elevated rail lines, steam vents, turbine towers, and industrial spires. Shot on ARRI Alexa 65, 40mm anamorphic lens, f/2.8. [model: flux-realism, guidance_scale: 20, steps: 50]`,
    lang: 'prose',
  },
  {
    name: 'Nano Banana',
    tag: 'Gemini',
    desc: 'Conversational. Think describing a scene to a cinematographer over coffee.',
    snippet: `Create a cinematic sci-fi still: a modern man stands alone on a windy hill, seen from behind, looking across an enormous brutalist steampunk city. Make him feel small against concrete megastructures, brass pipes, smoke, steam, and blue-hour industrial lights. Keep it moody, monumental, teal-and-amber, like a serious high-budget film frame.`,
    lang: 'chat',
  },
  {
    name: 'GPT Image 2',
    tag: 'JSON',
    desc: 'Structured output for multi-panel layouts and controlled compositions.',
    snippet: `{
  "goal": "Create a cinematic still from a high-budget science-fiction film.",
  "subject": "A present-day man in contemporary clothing stands alone on a windswept hill.",
  "scene": "Twilight over a colossal brutalist steampunk metropolis.",
  "style": "cinematic, brutalist architecture, steampunk industrial design, teal-and-amber color grading, film grain",
  "layout": { "grid": "3x3", "continuity": "Same character across all panels" },
  "constraints": { "must_avoid": "watermark, text, logo, cheap CGI, distorted perspective" }
}`,
    lang: 'json',
  },
];

const ANATOMY_TOKENS = [
  { k: 'Subject',  v: 'present-day man, seen from behind' },
  { k: 'Wardrobe', v: 'modern clothing, grounded human silhouette' },
  { k: 'Setting',  v: 'brutalist steampunk metropolis, windswept hill' },
  { k: 'Shot',     v: 'epic wide establishing shot' },
  { k: 'Lens',     v: '35mm / 40mm anamorphic' },
  { k: 'Lighting', v: 'dusk, cold blue ambience, amber industrial glow' },
  { k: 'Mood',     v: 'awe-struck, foreboding, melancholic' },
  { k: 'Style',    v: 'Villeneuve scale, Ridley Scott industrial worldbuilding' },
  { k: 'Params',   v: 'flux-realism, guidance 20, steps 50' },
];

Object.assign(window, { CHIP_CATEGORIES, PRODUCT_CATEGORIES, MODELS, ANATOMY_TOKENS });
