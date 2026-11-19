import { lazy, Suspense, useState } from 'react';
import { motion } from 'motion/react';
import { ScanLine } from 'lucide-react';
import { ScanViewport } from '../components/ScanViewport';
import { Tag } from '../components/Hud';
import { DiseaseSelector, HeatLegend, StageScrubber } from '../components/Controls';
import { DiseaseBrief, RegionPanel } from '../components/Panels';
import { SectionHeading, SciFiPanel } from '../components/Hud';
import { DISEASE_BY_ID, type DiseaseId } from '../data/diseases';
import type { RegionId } from '../data/regions';

// three.js is large, so the 3D view loads only when it's first shown.
const Brain3D = lazy(() => import('../components/Brain3D'));

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function LoadingVolume() {
  return (
    <div className="flex aspect-[600/440] w-full items-center justify-center border border-cyber/40 bg-[#00070b] font-mono text-xs tracking-widest text-cyber/70">
      <span className="animate-pulse">&gt; RECONSTRUCTING VOLUME...</span>
    </div>
  );
}

export function AtlasPage() {
  const [diseaseId, setDiseaseId] = useState<DiseaseId | null>('ad');
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<RegionId>('entorhinal');
  const [webgl] = useState(hasWebGL);
  const [view, setView] = useState<'2d' | '3d'>(() => (hasWebGL() ? '3d' : '2d'));

  const viewBtn = (v: '2d' | '3d') =>
    `border px-3 py-1.5 font-mono text-xs tracking-widest transition-all duration-200 ${
      view === v
        ? 'border-cyber bg-cyber/15 text-cyber shadow-[0_0_12px_rgba(0,243,255,0.4)]'
        : 'border-cyber/30 text-cyber/60 hover:border-cyber/70 hover:bg-cyber/10 hover:text-cyber'
    }`;

  const disease = diseaseId ? DISEASE_BY_ID[diseaseId] : null;

  const changeDisease = (id: DiseaseId | null) => {
    setDiseaseId(id);
    setStage(0);
    setPlaying(false);
    if (id) setSelected(DISEASE_BY_ID[id].stages[0].regions[0]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <SectionHeading icon={ScanLine} sub="INTERACTIVE ATLAS OF NEURODEGENERATIVE SPREAD">
        Scan viewer
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="mr-1">View</Tag>
            <button className={viewBtn('2d')} onClick={() => setView('2d')} aria-pressed={view === '2d'}>
              [2D_SCAN]
            </button>
            <button
              className={viewBtn('3d')}
              onClick={() => webgl && setView('3d')}
              aria-pressed={view === '3d'}
              title={webgl ? '3D model' : '3D needs WebGL, which this browser has turned off'}
            >
              [3D_MODEL]
            </button>
          </div>
          <DiseaseSelector value={diseaseId} onChange={changeDisease} />
          {view === '3d' ? (
            <Suspense fallback={<LoadingVolume />}>
              <Brain3D disease={disease} stage={stage} selected={selected} onSelect={setSelected} />
            </Suspense>
          ) : (
            <ScanViewport disease={disease} stage={stage} selected={selected} onSelect={setSelected} />
          )}
          <SciFiPanel className="p-5" hover={false}>
            {disease ? (
              <div className="flex flex-col gap-4">
                <StageScrubber disease={disease} stage={stage} onStage={setStage} playing={playing} onPlaying={setPlaying} />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cyber/15 pt-3">
                  <HeatLegend />
                  <span className="font-mono text-[10px] tracking-wider text-cyber/40">DASHED = DEEP STRUCTURE</span>
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-cyber/60">// Select a pathology layer to enable stage playback.</p>
            )}
          </SciFiPanel>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <RegionPanel regionId={selected} activeDisease={diseaseId} stage={stage} />
          <DiseaseBrief disease={disease} stage={stage} onSelectRegion={setSelected} />
        </div>
      </div>
    </motion.div>
  );
}
