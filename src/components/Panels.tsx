import { AnimatePresence, motion } from 'motion/react';
import { Activity, Crosshair } from 'lucide-react';
import { REGION_BY_ID, type RegionId } from '../data/regions';
import { DISEASES, onsetStage, type Disease, type DiseaseId } from '../data/diseases';
import { SciFiPanel, Tag } from './Hud';

export function RegionPanel({
  regionId,
  activeDisease,
  stage,
}: {
  regionId: RegionId;
  activeDisease: DiseaseId | null;
  stage: number;
}) {
  const r = REGION_BY_ID[regionId];
  return (
    <SciFiPanel className="p-6" hover={false}>
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-cyber/20 pb-4">
        <div className="min-w-0">
          <Tag>Region of interest</Tag>
          <AnimatePresence mode="wait">
            <motion.h2
              key={r.id}
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-1 text-xl font-bold tracking-wide text-white"
            >
              {r.name}
            </motion.h2>
          </AnimatePresence>
          <p className="mt-1 flex items-center gap-2 font-mono text-xs text-cyber">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyber" />
            ROI_ID: {r.code} // {r.group.toUpperCase()}
          </p>
        </div>
        <Crosshair className="h-5 w-5 shrink-0 text-cyber/60" />
      </div>

      <p className="mb-5 font-mono text-sm leading-relaxed text-soft">
        <span className="text-cyber">&gt; </span>
        {r.function}
      </p>
      {r.deep && <p className="-mt-3 mb-5 font-mono text-[11px] text-cyber/40">// deep structure, projected onto the surface view</p>}

      <Tag>Pathology readout</Tag>
      <ul className="mt-2 space-y-2">
        {DISEASES.map((d) => {
          const onset = onsetStage(d, r.id);
          const active = d.id === activeDisease;
          const involvedNow = active && onset >= 0 && onset <= stage;
          return (
            <li
              key={d.id}
              className={`flex items-center justify-between gap-3 border px-3 py-2 font-mono text-xs transition-colors ${
                active ? 'border-heat/50 bg-heat/10' : 'border-cyber/15'
              }`}
            >
              <span className={active ? 'text-white' : 'text-cyber/70'}>{d.code}</span>
              <span className="flex items-center gap-3">
                <span className="flex gap-1" aria-hidden="true">
                  {d.stages.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-3 ${onset >= 0 && i >= onset ? (active && i <= stage ? 'bg-heat' : 'bg-heat/35') : 'bg-cyber/10'}`}
                    />
                  ))}
                </span>
                <span className={`w-28 text-right ${onset < 0 ? 'text-slate-500' : involvedNow ? 'text-heat' : 'text-soft'}`}>
                  {onset < 0 ? 'Not a main site' : `From ${d.stages[onset].label}`}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </SciFiPanel>
  );
}

export function DiseaseBrief({
  disease,
  stage,
  onSelectRegion,
}: {
  disease: Disease | null;
  stage: number;
  onSelectRegion: (id: RegionId) => void;
}) {
  if (!disease) {
    return (
      <SciFiPanel className="p-6" hover={false}>
        <Tag>Overlay</Tag>
        <h2 className="mt-1 mb-3 text-xl font-bold text-white">Baseline anatomy</h2>
        <p className="font-mono text-sm leading-relaxed text-soft">
          <span className="text-cyber">&gt; </span>
          Pick a pathology layer to watch how a disease moves through the brain, stage by stage. Click any region on the scan to read
          what it does.
        </p>
      </SciFiPanel>
    );
  }
  return (
    <SciFiPanel className="p-6" hover={false}>
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-cyber/20 pb-4">
        <div>
          <Tag>Overlay // {disease.code}</Tag>
          <h2 className="mt-1 text-xl font-bold tracking-wide text-white">{disease.name}</h2>
          <p className="mt-1 font-mono text-xs text-heat">{disease.protein}</p>
        </div>
        <Activity className="h-5 w-5 shrink-0 text-heat/80" />
      </div>
      <p className="mb-5 text-sm leading-relaxed text-slate-300">{disease.description}</p>

      <Tag>Spread sequence // {disease.stagingSystem}</Tag>
      <ol className="mt-2 mb-5 space-y-2">
        {disease.stages.map((s, i) => (
          <li key={s.label} className={`border-l-2 py-1 pl-3 transition-colors ${i <= stage ? 'border-heat' : 'border-cyber/20'}`}>
            <div className={`font-mono text-xs ${i <= stage ? 'text-heat' : 'text-cyber/50'}`}>{s.label}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {s.regions.map((id) => (
                <button
                  key={id}
                  onClick={() => onSelectRegion(id)}
                  className="border border-cyber/25 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-soft transition-colors hover:border-cyber hover:text-cyber"
                >
                  {REGION_BY_ID[id].code}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <Tag>Common symptoms</Tag>
      <ul className="mt-2 mb-4 space-y-1">
        {disease.symptoms.map((s) => (
          <li key={s} className="flex gap-2 font-mono text-xs text-soft">
            <span className="text-cyber">&gt;</span>
            {s}
          </li>
        ))}
      </ul>
      <p className="border-t border-cyber/15 pt-3 font-mono text-[11px] leading-relaxed text-cyber/50">// NOTE: {disease.caveat}</p>
    </SciFiPanel>
  );
}
