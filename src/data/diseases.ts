import type { RegionId } from './regions';

export type DiseaseId = 'ad' | 'pd' | 'als' | 'hd';

export interface Stage {
  /** Label from the staging scheme the disease is usually described with. */
  label: string;
  summary: string;
  regions: RegionId[];
}

export interface Disease {
  id: DiseaseId;
  code: string;
  name: string;
  protein: string;
  stagingSystem: string;
  description: string;
  symptoms: string[];
  stages: Stage[];
  caveat: string;
}

// Each sequence is a simplified reading of the cited staging scheme. See the
// Methods page for sources and limitations.
export const DISEASES: Disease[] = [
  {
    id: 'ad',
    code: 'AD',
    name: "Alzheimer's disease",
    protein: 'Tau tangles and amyloid-β plaques',
    stagingSystem: 'Braak neurofibrillary stages (1991)',
    description:
      'The most common cause of dementia. Tau tangles appear first in the entorhinal cortex, then spread through limbic memory circuits before reaching the wider cortex.',
    symptoms: ['Short-term memory loss', 'Getting lost in familiar places', 'Language and planning difficulty', 'Personality change in later stages'],
    stages: [
      { label: 'Braak I–II', summary: 'Transentorhinal and entorhinal cortex', regions: ['entorhinal'] },
      { label: 'Braak III–IV', summary: 'Limbic regions: hippocampus, amygdala, temporal cortex', regions: ['hippocampus', 'amygdala', 'temporal'] },
      { label: 'Braak V–VI', summary: 'Association cortex, then primary areas last', regions: ['frontal', 'parietal', 'occipital', 'motor'] },
    ],
    caveat: 'Amyloid follows a different pattern (Thal phases). This view shows tau, which tracks symptoms more closely.',
  },
  {
    id: 'pd',
    code: 'PD',
    name: "Parkinson's disease",
    protein: 'α-synuclein (Lewy bodies)',
    stagingSystem: 'Braak α-synuclein stages (2003)',
    description:
      'Best known for tremor and slowed movement, which appear once dopamine neurons in the substantia nigra are lost. Lewy pathology is thought to start lower, in the medulla and olfactory bulb.',
    symptoms: ['Loss of smell and sleep changes (often years earlier)', 'Resting tremor', 'Slowed movement and rigidity', 'Cognitive change in later stages'],
    stages: [
      { label: 'Braak 1–2', summary: 'Medulla, pons and olfactory bulb', regions: ['medulla', 'olfactory', 'pons'] },
      { label: 'Braak 3–4', summary: 'Substantia nigra and limbic regions; motor symptoms emerge', regions: ['nigra', 'amygdala', 'entorhinal', 'hippocampus'] },
      { label: 'Braak 5–6', summary: 'Neocortex', regions: ['temporal', 'frontal', 'parietal', 'motor'] },
    ],
    caveat:
      'Not every patient follows this bottom-up route. The striatum is hit functionally (it loses dopamine input) but is not a main site of Lewy pathology.',
  },
  {
    id: 'als',
    code: 'ALS',
    name: 'Amyotrophic lateral sclerosis',
    protein: 'TDP-43',
    stagingSystem: 'Brettschneider pTDP-43 stages (2013)',
    description:
      'Degenerates the neurons that control voluntary muscles, in both the motor cortex and the brainstem and spinal cord. In some patients it spreads into frontal and temporal regions.',
    symptoms: ['Muscle weakness and twitching', 'Trouble speaking or swallowing', 'Breathing difficulty', 'Behavior or language change in some patients'],
    stages: [
      { label: 'Stage 1', summary: 'Motor cortex and brainstem motor nuclei', regions: ['motor', 'medulla', 'pons'] },
      { label: 'Stage 2', summary: 'Prefrontal cortex', regions: ['frontal'] },
      { label: 'Stage 3', summary: 'Postcentral cortex and striatum', regions: ['parietal', 'striatum'] },
      { label: 'Stage 4', summary: 'Anteromedial temporal lobe, including the hippocampus', regions: ['temporal', 'hippocampus'] },
    ],
    caveat: 'Spinal cord involvement is central to ALS but sits outside this brain view.',
  },
  {
    id: 'hd',
    code: 'HD',
    name: "Huntington's disease",
    protein: 'Mutant huntingtin',
    stagingSystem: 'Vonsattel striatal grades (1985) plus imaging',
    description:
      'An inherited disorder that destroys the striatum first, which disrupts movement control and mood. Cortical thinning follows as the disease advances.',
    symptoms: ['Involuntary jerking movements (chorea)', 'Irritability and depression', 'Trouble with planning and focus', 'Difficulty walking and swallowing later'],
    stages: [
      { label: 'Grades 1–2', summary: 'Striatum, starting in the caudate', regions: ['striatum'] },
      { label: 'Grade 3', summary: 'Severe striatal loss; frontal and motor cortex thin', regions: ['frontal', 'motor', 'thalamus'] },
      { label: 'Grade 4', summary: 'Widespread cortical thinning', regions: ['parietal', 'occipital'] },
    ],
    caveat:
      'Vonsattel grades describe the striatum only. The cortical spread here comes from MRI studies and varies between patients.',
  },
];

export const DISEASE_BY_ID = Object.fromEntries(DISEASES.map((d) => [d.id, d])) as Record<DiseaseId, Disease>;

/** 0-based stage index at which a region first becomes involved, or -1. */
export function onsetStage(disease: Disease, region: RegionId): number {
  return disease.stages.findIndex((s) => s.regions.includes(region));
}

/**
 * How long a region has been involved at the current stage, normalized to 0..1.
 * 0 means not involved yet; 1 means involved since stage 1.
 */
export function burden(disease: Disease, region: RegionId, currentStage: number): number {
  const onset = onsetStage(disease, region);
  if (onset < 0 || onset > currentStage) return 0;
  return (currentStage - onset + 1) / (currentStage + 1);
}

/** PET-style "hot" colormap: dark red -> orange -> yellow -> near-white. */
export function heatColor(t: number): string {
  const stops: [number, [number, number, number]][] = [
    [0, [150, 20, 30]],
    [0.4, [230, 60, 40]],
    [0.7, [255, 150, 50]],
    [1, [255, 240, 150]],
  ];
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i];
    const [p0, c0] = stops[i - 1];
    if (t <= p1) {
      const k = (t - p0) / (p1 - p0);
      const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
      return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }
  }
  return 'rgb(255, 240, 150)';
}
