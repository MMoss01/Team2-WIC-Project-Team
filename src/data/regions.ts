// Brain regions drawn on a schematic left-lateral view (SVG viewBox 0 0 600 440,
// frontal pole on the left). Deep structures are projected onto the surface so
// they can be clicked; they are not anatomically placed.

export type RegionId =
  | 'frontal'
  | 'motor'
  | 'parietal'
  | 'occipital'
  | 'temporal'
  | 'entorhinal'
  | 'hippocampus'
  | 'amygdala'
  | 'striatum'
  | 'thalamus'
  | 'nigra'
  | 'pons'
  | 'medulla'
  | 'cerebellum'
  | 'olfactory';

export type Shape =
  | { kind: 'path'; d: string }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rotate?: number };

export interface Region {
  id: RegionId;
  code: string;
  name: string;
  group: 'Cortex' | 'Limbic' | 'Deep' | 'Brainstem' | 'Other';
  deep: boolean;
  shape: Shape;
  /** Where the label anchor sits, in SVG units. */
  anchor: [number, number];
  function: string;
}

export const REGIONS: Region[] = [
  {
    id: 'cerebellum',
    code: 'CBL',
    name: 'Cerebellum',
    group: 'Other',
    deep: false,
    shape: { kind: 'ellipse', cx: 432, cy: 326, rx: 64, ry: 34 },
    anchor: [432, 330],
    function: 'Coordinates movement, balance and timing, and supports motor learning.',
  },
  {
    id: 'pons',
    code: 'PONS',
    name: 'Pons',
    group: 'Brainstem',
    deep: false,
    shape: { kind: 'path', d: 'M318,294 L372,294 C380,316 378,336 369,352 L327,352 C317,336 312,316 318,294 Z' },
    anchor: [345, 322],
    function: 'Relays signals between the cortex and cerebellum and houses cranial nerve nuclei for facial movement and chewing.',
  },
  {
    id: 'medulla',
    code: 'MED',
    name: 'Medulla oblongata',
    group: 'Brainstem',
    deep: false,
    shape: { kind: 'path', d: 'M327,352 L369,352 L361,418 L336,418 Z' },
    anchor: [348, 386],
    function: 'Controls breathing, heart rate and swallowing; contains the vagal and hypoglossal nuclei.',
  },
  {
    id: 'frontal',
    code: 'FRO',
    name: 'Frontal lobe',
    group: 'Cortex',
    deep: false,
    shape: {
      kind: 'path',
      d: 'M96,252 C58,192 66,112 138,72 C184,47 230,43 262,46 L251,112 L241,190 C200,206 162,226 132,262 C114,263 103,259 96,252 Z',
    },
    anchor: [160, 150],
    function: 'Planning, decision-making, working memory, personality and social behavior.',
  },
  {
    id: 'motor',
    code: 'M1',
    name: 'Primary motor cortex',
    group: 'Cortex',
    deep: false,
    shape: { kind: 'path', d: 'M262,46 L293,48 L281,122 L271,201 L241,190 L251,112 Z' },
    anchor: [266, 110],
    function: 'Sends the commands for voluntary movement down to the brainstem and spinal cord.',
  },
  {
    id: 'parietal',
    code: 'PAR',
    name: 'Parietal lobe',
    group: 'Cortex',
    deep: false,
    shape: { kind: 'path', d: 'M293,48 C362,52 422,80 456,126 L396,191 L301,206 L271,201 L281,122 Z' },
    anchor: [362, 122],
    function: 'Integrates touch and body position, spatial attention and navigation.',
  },
  {
    id: 'occipital',
    code: 'OCC',
    name: 'Occipital lobe',
    group: 'Cortex',
    deep: false,
    shape: { kind: 'path', d: 'M456,126 C494,162 510,202 502,242 C494,270 472,287 442,292 L396,191 Z' },
    anchor: [464, 214],
    function: 'Visual processing, from edges and color in primary visual cortex to objects in higher areas.',
  },
  {
    id: 'temporal',
    code: 'TMP',
    name: 'Temporal lobe',
    group: 'Cortex',
    deep: false,
    shape: {
      kind: 'path',
      d: 'M132,262 C162,226 200,206 241,190 L271,201 L301,206 L396,191 L442,292 C402,306 342,312 290,304 C230,298 170,290 132,262 Z',
    },
    anchor: [372, 270],
    function: 'Hearing, language comprehension, object recognition and memory.',
  },
  {
    id: 'olfactory',
    code: 'OLF',
    name: 'Olfactory bulb',
    group: 'Other',
    deep: false,
    shape: { kind: 'ellipse', cx: 150, cy: 273, rx: 32, ry: 6, rotate: -8 },
    anchor: [150, 273],
    function: 'First relay for smell; sits under the frontal lobe.',
  },
  {
    id: 'striatum',
    code: 'STR',
    name: 'Striatum',
    group: 'Deep',
    deep: true,
    shape: { kind: 'ellipse', cx: 252, cy: 162, rx: 42, ry: 19 },
    anchor: [252, 162],
    function: 'Caudate and putamen. Selects and initiates movements and drives reward learning; part of the basal ganglia.',
  },
  {
    id: 'thalamus',
    code: 'THA',
    name: 'Thalamus',
    group: 'Deep',
    deep: true,
    shape: { kind: 'ellipse', cx: 322, cy: 176, rx: 30, ry: 17 },
    anchor: [322, 176],
    function: 'Relay hub routing sensory and motor signals to the cortex; regulates arousal.',
  },
  {
    id: 'hippocampus',
    code: 'HIP',
    name: 'Hippocampus',
    group: 'Limbic',
    deep: true,
    shape: { kind: 'ellipse', cx: 306, cy: 244, rx: 48, ry: 10, rotate: -6 },
    anchor: [306, 244],
    function: 'Forms new episodic memories and supports spatial navigation.',
  },
  {
    id: 'amygdala',
    code: 'AMY',
    name: 'Amygdala',
    group: 'Limbic',
    deep: true,
    shape: { kind: 'ellipse', cx: 238, cy: 250, rx: 12, ry: 11 },
    anchor: [238, 250],
    function: 'Processes emotion, especially fear and threat, and tags memories with emotional weight.',
  },
  {
    id: 'entorhinal',
    code: 'ERC',
    name: 'Entorhinal cortex',
    group: 'Limbic',
    deep: true,
    shape: { kind: 'ellipse', cx: 266, cy: 273, rx: 22, ry: 8 },
    anchor: [266, 273],
    function: 'Gateway between the hippocampus and the rest of the cortex; contains grid cells for spatial mapping.',
  },
  {
    id: 'nigra',
    code: 'SN',
    name: 'Substantia nigra',
    group: 'Brainstem',
    deep: true,
    shape: { kind: 'ellipse', cx: 336, cy: 272, rx: 16, ry: 6 },
    anchor: [336, 272],
    function: 'Midbrain nucleus whose dopamine neurons feed the striatum to enable smooth movement.',
  },
];

export const REGION_BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r])) as Record<RegionId, Region>;

/** Decorative sulci, drawn over the cortex to make it read as a brain. */
export const SULCI: string[] = [
  'M262,46 C258,90 254,130 248,182',
  'M293,48 C290,100 286,150 282,200',
  'M150,240 C210,220 300,204 394,192',
  'M110,170 C140,150 175,140 210,148',
  'M120,118 C155,98 195,92 232,98',
  'M318,90 C350,96 384,112 412,140',
  'M330,160 C360,150 390,152 420,168',
  'M180,268 C240,260 310,262 380,262',
  'M440,160 C462,190 470,220 466,250',
  'M396,316 C418,306 446,306 474,316',
  'M398,334 C420,342 448,344 476,334',
];

/** Outer silhouette, used for the scan glow. */
export const OUTLINE =
  'M96,252 C58,192 66,112 138,72 C184,47 230,43 262,46 L293,48 C362,52 422,80 456,126 C494,162 510,202 502,242 C494,270 472,287 442,292 C402,306 342,312 290,304 C230,298 170,290 132,262 C114,263 103,259 96,252 Z';
