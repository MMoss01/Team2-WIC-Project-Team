import { motion } from 'motion/react';
import { BookOpen, Cpu, Network, type LucideIcon } from 'lucide-react';
import { SectionHeading, SciFiPanel, Tag } from '../components/Hud';

const SOURCES = [
  'Braak H, Braak E. Neuropathological stageing of Alzheimer-related changes. Acta Neuropathologica. 1991;82:239–259.',
  "Braak H, et al. Staging of brain pathology related to sporadic Parkinson's disease. Neurobiology of Aging. 2003;24:197–211.",
  'Brettschneider J, et al. Stages of pTDP-43 pathology in amyotrophic lateral sclerosis. Annals of Neurology. 2013;74:20–38.',
  "Vonsattel JP, et al. Neuropathological classification of Huntington's disease. J Neuropathol Exp Neurol. 1985;44:559–577.",
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
            The scan is a hand-drawn schematic of the left hemisphere seen from the side, styled like an MRI. Deep structures such as
            the hippocampus and striatum sit inside the brain, so they're drawn with dashed outlines and projected onto the surface to
            keep them clickable. They are not in their true positions.
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
          <Tag>Sources</Tag>
          <ul className="mt-3 space-y-2">
            {SOURCES.map((s) => (
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
