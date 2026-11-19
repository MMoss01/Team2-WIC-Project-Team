import { motion } from 'motion/react';
import { BookOpen, Cpu, Network, type LucideIcon } from 'lucide-react';
import { SectionHeading, SciFiPanel, Tag } from '../components/Hud';

const SOURCES = [
  'Braak H, Braak E. Neuropathological stageing of Alzheimer-related changes. Acta Neuropathologica. 1991;82:239–259.',
  "Braak H, et al. Staging of brain pathology related to sporadic Parkinson's disease. Neurobiology of Aging. 2003;24:197–211.",
  'Brettschneider J, et al. Stages of pTDP-43 pathology in amyotrophic lateral sclerosis. Annals of Neurology. 2013;74:20–38.',
  "Vonsattel JP, et al. Neuropathological classification of Huntington's disease. J Neuropathol Exp Neurol. 1985;44:559–577.",
];

const MODEL_SOURCES = [
  'Fischl B, et al. High-resolution intersubject averaging and a coordinate system for the cortical surface. Human Brain Mapping. 1999;8:272–284. (fsaverage template)',
  'Desikan RS, et al. An automated labeling system for subdividing the human cerebral cortex on MRI scans into gyral based regions of interest. NeuroImage. 2006;31:968–980. (cortical regions)',
  'Fischl B, et al. Whole brain segmentation: automated labeling of neuroanatomical structures in the human brain. Neuron. 2002;33:341–355. (subcortical structures)',
  'Winkler AM. Importing FreeSurfer cortical meshes into Blender. brainder.org, 2012. (mesh conversion approach)',
];

export function MethodsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl">
      <SectionHeading icon={BookOpen} sub="HOW THE ATLAS WORKS, AND WHERE IT SIMPLIFIES">
        Methods
      </SectionHeading>
      <div className="space-y-6">
        <SciFiPanel className="p-6">
          <Tag>What you're looking at</Tag>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            The 3D model is a real average brain: FreeSurfer's fsaverage template, the standard reference brain built by averaging
            many people's MRI scans. Its cortex is split into lobes using the Desikan-Killiany atlas, and deep structures come from
            FreeSurfer's subcortical segmentation, so they sit in their true positions. Two exceptions: the substantia nigra and
            olfactory bulb aren't in these atlases, so they're shown as small markers at approximate positions, and the brainstem
            is split into midbrain, pons and medulla by height.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            The 2D scan is a hand-drawn schematic of the left hemisphere, styled like an MRI. There, deep structures are drawn
            dashed and projected onto the surface so they stay clickable; they are not in their true positions.
          </p>
        </SciFiPanel>
        <SciFiPanel className="p-6">
          <Tag>How the overlay is built</Tag>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Each disease follows a published staging scheme, read from postmortem tissue studies. A region lights up at the stage where
            the scheme first describes pathology there. Its color shifts from red toward yellow the longer it has been involved, like a
            PET heat map. Colors show order of spread, not measured severity, and real patients vary.
          </p>
        </SciFiPanel>
        <SciFiPanel className="p-6">
          <Tag>Staging sources</Tag>
          <ul className="mt-3 space-y-2">
            {SOURCES.map((s) => (
              <li key={s} className="flex gap-2 font-mono text-xs leading-relaxed text-soft">
                <span className="text-cyber">&gt;</span>
                {s}
              </li>
            ))}
          </ul>
        </SciFiPanel>
        <SciFiPanel className="p-6">
          <Tag>3D model data</Tag>
          <ul className="mt-3 space-y-2">
            {MODEL_SOURCES.map((s) => (
              <li key={s} className="flex gap-2 font-mono text-xs leading-relaxed text-soft">
                <span className="text-cyber">&gt;</span>
                {s}
              </li>
            ))}
          </ul>
        </SciFiPanel>
        <p className="font-mono text-xs text-cyber/50">// Educational project. Not medical advice and not a diagnostic tool.</p>
      </div>
    </motion.div>
  );
}

function OfflineModule({ icon, title, sub, plan }: { icon: LucideIcon; title: string; sub: string; plan: string[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
      <SectionHeading icon={icon} sub={sub}>
        {title}
      </SectionHeading>
      <SciFiPanel className="p-6">
        <div className="mb-4 flex items-center gap-2 font-mono text-xs tracking-widest text-amber-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
          MODULE OFFLINE // IN DEVELOPMENT
        </div>
        <Tag>Planned build</Tag>
        <ul className="mt-3 space-y-2">
          {plan.map((p) => (
            <li key={p} className="flex gap-2 font-mono text-sm text-soft">
              <span className="text-cyber">&gt;</span>
              {p}
            </li>
          ))}
        </ul>
      </SciFiPanel>
    </motion.div>
  );
}

export function ClassifierPage() {
  return (
    <OfflineModule
      icon={Cpu}
      title="MRI classifier"
      sub="ALZHEIMER'S VS. CONTROL FROM STRUCTURAL MRI"
      plan={[
        'Preprocess T1 scans: skull-strip, register to a template, normalize',
        'Baseline on regional volumes, then a 3D CNN, split by subject',
        'Grad-CAM heatmaps overlaid on the atlas regions',
        'Tracked, versioned training and a FastAPI inference endpoint',
      ]}
    />
  );
}

export function ConnectomePage() {
  return (
    <OfflineModule
      icon={Network}
      title="Connectome"
      sub="CELL-TYPE PREDICTION ON A WIRING DIAGRAM"
      plan={[
        'Pull a FlyWire subgraph of a few thousand neurons',
        'Baseline on connectivity features, then a graph neural network',
        'Interactive network view with learned embeddings',
      ]}
    />
  );
}
