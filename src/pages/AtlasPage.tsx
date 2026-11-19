import { useState } from 'react';
import { motion } from 'motion/react';
import { ScanLine } from 'lucide-react';
import { ScanViewport } from '../components/ScanViewport';
import { DiseaseSelector, HeatLegend, StageScrubber } from '../components/Controls';
import { DiseaseBrief, RegionPanel } from '../components/Panels';
import { SectionHeading, SciFiPanel } from '../components/Hud';
import { DISEASE_BY_ID, type DiseaseId } from '../data/diseases';
import type { RegionId } from '../data/regions';

export function AtlasPage() {
  const [diseaseId, setDiseaseId] = useState<DiseaseId | null>('ad');
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<RegionId>('entorhinal');

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
          <DiseaseSelector value={diseaseId} onChange={changeDisease} />
          <ScanViewport disease={disease} stage={stage} selected={selected} onSelect={setSelected} />
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
